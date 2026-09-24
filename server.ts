import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialize Gemini client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Proxy endpoint para consulta de CNPJ com fallback em múltiplas fontes oficiais
app.get("/api/cnpj/:cnpj", async (req, res) => {
  const digits = (req.params.cnpj || "").replace(/\D/g, "");
  if (digits.length !== 14) {
    return res.status(400).json({ error: "CNPJ deve conter exatamente 14 dígitos numéricos." });
  }

  // 1. Tentar BrasilAPI
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      signal: controller.signal,
      headers: { "User-Agent": "VistorIASST/1.0" },
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      return res.json({ success: true, source: "brasilapi", data });
    }
  } catch (_e) {
    // Falhou BrasilAPI, tenta MinhaReceita
  }

  // 2. Tentar MinhaReceita (dados públicos da Receita Federal)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(`https://minhareceita.org/${digits}`, {
      signal: controller.signal,
      headers: { "User-Agent": "VistorIASST/1.0" },
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      return res.json({ success: true, source: "minhareceita", data });
    }
  } catch (_e) {
    // Falhou MinhaReceita, tenta ReceitaWS
  }

  // 3. Tentar ReceitaWS
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(`https://receitaws.com.br/v1/cnpj/${digits}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (data.status !== "ERROR") {
        return res.json({ success: true, source: "receitaws", data });
      }
    }
  } catch (_e) {
    //
  }

  return res.status(404).json({
    error: "Não foi possível localizar os dados deste CNPJ na base pública da Receita Federal.",
  });
});

// AI Enquadramento endpoint (Groq como principal, Gemini como secundária/fallback, Heurística como segurança)
async function callGroqAI(texto: string, nrsLista: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("GROQ_API_KEY não configurada no ambiente.");
  }

  const prompt = `Você é um Engenheiro de Segurança do Trabalho e Perito Judicial especialista nas Normas Regulamentadoras (NRs) do Ministério do Trabalho e Emprego do Brasil e na NR 28 (Fiscalização e Penalidades).
Analise o relato/observação de campo a seguir e realize o enquadramento técnico preciso da infração.

Normas regulamentadoras prioritárias disponíveis no sistema: ${nrsLista}.

Relato da situação em campo:
"${texto.trim()}"

Retorne OBRIGATORIAMENTE E EXCLUSIVAMENTE um objeto JSON válido no seguinte formato exato:
{
  "status": "Não Conformidade",
  "nr_sugerida": "NR 35",
  "item_provavel": "35.2.1",
  "descricao_cenario": "Descrição técnica pericial do cenário de risco constatado em campo",
  "acao_corretiva": "Ação corretiva técnica imediata recomendada fundamentada na norma",
  "prioridade": "Alta",
  "justificativa_tecnica": "Fundamentação pericial e enquadramento na NR 28"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é um perito judicial em Segurança e Saúde do Trabalho (SST) especialista em Normas Regulamentadoras do Brasil e NR 28. Responda estritamente em JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.15,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq HTTP error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta da Groq sem conteúdo no choices.");
    }

    const parsed = JSON.parse(content.trim());
    if (!parsed.nr_sugerida || !parsed.item_provavel) {
      throw new Error("Resposta da Groq sem campos essenciais.");
    }

    return parsed;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiAI(texto: string, nrsLista: string): Promise<any> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error("GEMINI_API_KEY não configurada no ambiente.");
  }

  const prompt = `Você é um Engenheiro de Segurança do Trabalho e Perito Judicial especialista nas Normas Regulamentadoras (NRs) do Ministério do Trabalho e Emprego do Brasil e na NR 28 (Fiscalização e Penalidades).
Analise o relato/observação de campo a seguir e realize o enquadramento técnico preciso da infração.

Normas regulamentadoras prioritárias disponíveis no sistema: ${nrsLista}.

Relato da situação em campo:
"${texto.trim()}"

Retorne o enquadramento técnico mais aderente, especificando a NR, o item da norma mais provável (ex: 35.2.1, 10.2.8.1, 6.3.1, 1.5.3.1, 18.5.1, 12.5.1), a descrição técnica formal do cenário observado, a recomendação corretiva imediata fundamentada e o grau de prioridade técnica.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
            description: "Não Conformidade ou Conformidade",
          },
          nr_sugerida: {
            type: Type.STRING,
            description: "Sigla da NR sugerida, ex: 'NR 35', 'NR 10', 'NR 06', 'NR 12', 'NR 01', 'NR 18'",
          },
          item_provavel: {
            type: Type.STRING,
            description: "Item numérico da norma, ex: '35.2.1', '6.3.1', '10.2.8.1'",
          },
          descricao_cenario: {
            type: Type.STRING,
            description: "Descrição técnica pericial do cenário de risco constatado em campo",
          },
          acao_corretiva: {
            type: Type.STRING,
            description: "Ação corretiva técnica imediata recomendada",
          },
          prioridade: {
            type: Type.STRING,
            description: "Alta, Média ou Baixa",
          },
          justificativa_tecnica: {
            type: Type.STRING,
            description: "Justificativa legal e risco à integridade física do trabalhador",
          },
        },
        required: ["status", "nr_sugerida", "item_provavel", "descricao_cenario", "acao_corretiva", "prioridade"],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Resposta vazia da API Gemini.");
  }
  return JSON.parse(responseText.trim());
}

// AI Enquadramento endpoint (NR 28 & Normas Regulamentadoras)
app.post("/api/ai/enquadrar", async (req, res) => {
  const { texto, nrsDisponiveis } = req.body;

  if (!texto || typeof texto !== "string" || !texto.trim()) {
    res.status(400).json({ error: "Texto do relato ou situação não fornecido." });
    return;
  }

  const nrsLista = Array.isArray(nrsDisponiveis) && nrsDisponiveis.length > 0 
    ? nrsDisponiveis.join(", ") 
    : "NR 01, NR 05, NR 06, NR 10, NR 12, NR 18, NR 20, NR 23, NR 33, NR 35";

  // 1ª OPÇÃO: IA Groq (Llama 3.3 70B) como Principal
  try {
    const groqResult = await callGroqAI(texto, nrsLista);
    res.json({ success: true, fonte: "groq (Llama 3.3 70B)", data: groqResult });
    return;
  } catch (errGroq: any) {
    console.warn("Groq AI principal falhou ou indisponível:", errGroq?.message || errGroq);
    console.info("Acionando Gemini AI como motor secundário de enquadramento...");
  }

  // 2ª OPÇÃO: IA Gemini (gemini-3.8-flash) como Secundária / Fallback
  try {
    const geminiResult = await callGeminiAI(texto, nrsLista);
    res.json({ success: true, fonte: "gemini (secundária)", data: geminiResult });
    return;
  } catch (errGemini: any) {
    console.warn("Gemini AI secundária falhou ou sem chave:", errGemini?.message || errGemini);
    console.info("Acionando regras periciais heurísticas de segurança...");
  }

  // Heuristic rule-based fallback when offline or API key absent
  const lower = texto.toLowerCase();
  let sugerida = "NR 35";
  let item = "35.2.1";
  let desc = `Constatada irregularidade em campo: ${texto}`;
  let acao = "Interromper a atividade e adequar os dispositivos de proteção imediatamente.";
  let prio = "Alta";

  if (lower.includes("altura") || lower.includes("andaime") || lower.includes("cinto") || lower.includes("queda") || lower.includes("escada")) {
    sugerida = "NR 35";
    item = "35.2.1";
    desc = "Trabalhadores executando atividades em nível elevado sem sistema de proteção individual contra quedas (SPIQ) ou análise de risco prévia.";
    acao = "Implementar ancoragem estrutural com talabarte duplo com absorvedor de energia e emissão prévia de Permissão de Trabalho (PT).";
    prio = "Alta";
  } else if (lower.includes("eletric") || lower.includes("quadro") || lower.includes("fio") || lower.includes("choque") || lower.includes("disjuntor")) {
    sugerida = "NR 10";
    item = "10.2.8.1";
    desc = "Instalação ou quadro elétrico com partes vivas desprotegidas ou ausência de desenergização e aterramento de segurança.";
    acao = "Bloquear fontes de energia (LOTO), instalar proteções isolantes e certificar capacitação conforme NR 10.";
    prio = "Alta";
  } else if (lower.includes("epi") || lower.includes("óculos") || lower.includes("bota") || lower.includes("luva") || lower.includes("capacete") || lower.includes("protetor")) {
    sugerida = "NR 06";
    item = "6.3.1";
    desc = "Trabalhadores exercendo funções com exposição a agentes agressivos sem utilização do EPI obrigatório com Certificado de Aprovação (CA) válido.";
    acao = "Fornecer imediatamente o EPI adequado com registro em ficha individual de entrega e treinamento de uso.";
    prio = "Média";
  } else if (lower.includes("máquina") || lower.includes("maquina") || lower.includes("polia") || lower.includes("engrenagem") || lower.includes("prensa") || lower.includes("emergência")) {
    sugerida = "NR 12";
    item = "12.5.1";
    desc = "Zonas de perigo de máquinas operando sem proteções fixas ou móveis intertravadas e botão de parada de emergência.";
    acao = "Interditar temporariamente o equipamento até a instalação de carenagem física e adequação à NR 12.";
    prio = "Alta";
  } else if (lower.includes("pgr") || lower.includes("gro") || lower.includes("risco") || lower.includes("inventário")) {
    sugerida = "NR 01";
    item = "1.5.3.1";
    desc = "Inexistência ou desatualização do Programa de Gerenciamento de Riscos (PGR) para o setor auditado.";
    acao = "Atualizar o Inventário de Riscos Ocupacionais e o Plano de Ação em conformidade com o GRO/PGR da NR 01.";
    prio = "Alta";
  } else if (lower.includes("obra") || lower.includes("canteiro") || lower.includes("guarda-corpo") || lower.includes("periferia")) {
    sugerida = "NR 18";
    item = "18.9.1";
    desc = "Aberturas no piso ou periferia de laje em canteiro de obras desprovidas de sistema de guarda-corpo e rodapé.";
    acao = "Instalar guarda-corpo rígido com travessão superior a 1,20m, intermediário a 0,70m e rodapé de 0,15m.";
    prio = "Alta";
  } else if (lower.includes("espaço confinado") || lower.includes("gás") || lower.includes("oxigênio") || lower.includes("tanque") || lower.includes("galeria")) {
    sugerida = "NR 33";
    item = "33.3.1";
    desc = "Entrada em espaço confinado sem monitoramento contínuo de gases atmosféricos e vigia designado.";
    acao = "Emissão obrigatória de PET (Permissão de Entrada e Trabalho) e calibração de detector multigás.";
    prio = "Alta";
  } else if (lower.includes("extintor") || lower.includes("fogo") || lower.includes("incêndio") || lower.includes("hidrante") || lower.includes("rota de fuga")) {
    sugerida = "NR 23";
    item = "23.1.1";
    desc = "Equipamentos de combate a incêndio obstruídos, despressurizados ou rotas de emergência bloqueadas.";
    acao = "Desobstruir imediatamente as passagens e enviar os cilindros para inspeção de carga com demarcação no piso.";
    prio = "Média";
  }

  res.json({
    success: true,
    fonte: "regras_tecnicas",
    data: {
      status: "Não Conformidade",
      nr_sugerida: sugerida,
      item_provavel: item,
      descricao_cenario: desc,
      acao_corretiva: acao,
      prioridade: prio,
      justificativa_tecnica: "Enquadramento preventivo fundamentado nas Normas Regulamentadoras e na NR 28 para eliminação de passivos fiscais e trabalhistas.",
    },
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VistorIA SST server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

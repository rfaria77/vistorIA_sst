export interface ForensicStampOptions {
  lat?: number | null;
  lng?: number | null;
  auditorNome?: string;
  empresaNome?: string;
  maxDim?: number; // padrão 1280px
  qualidade?: number; // padrão 0.80 (80%)
}

export interface ResultadoOtimizacaoFoto {
  dataUrl: string;
  largura: number;
  altura: number;
  tamanhoOriginalKb?: number;
  tamanhoFinalKb: number;
  reducaoPercentual?: number;
}

export async function aplicarCarimboForense(
  fileOrDataUrl: File | string,
  options: ForensicStampOptions = {}
): Promise<string> {
  const res = await processarEOtimizarFoto(fileOrDataUrl, options);
  return res.dataUrl;
}

export async function processarEOtimizarFoto(
  fileOrDataUrl: File | string,
  options: ForensicStampOptions = {}
): Promise<ResultadoOtimizacaoFoto> {
  return new Promise((resolve, reject) => {
    let tamanhoOriginalBytes = 0;
    if (fileOrDataUrl instanceof File) {
      tamanhoOriginalBytes = fileOrDataUrl.size;
    }

    const img = new Image();

    img.onload = () => {
      // Redimensionamento inteligente no navegador para até 1280px (preservando aspecto e nitidez pericial)
      const MAX_DIM = options.maxDim || 1280;
      const QUALIDADE = options.qualidade ?? 0.80; // JPEG 80%
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Não foi possível inicializar o canvas 2D"));
        return;
      }

      // Desenha imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Faixa de Carimbo Forense proporcional
      const barHeight = Math.max(36, Math.round(height * 0.065));
      const posY = height - barHeight;

      // Fundo escuro fosco de alta legibilidade
      ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
      ctx.fillRect(0, posY, width, barHeight);

      // Linha superior de destaque ciano pericial
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, posY, width, 2);

      // Montagem da chancela forense com data, hora e coordenadas
      const now = new Date();
      const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

      let gpsTexto = "GPS: Vistoria Pericial in loco";
      if (options.lat && options.lng) {
        gpsTexto = `GPS: ${options.lat.toFixed(5)}, ${options.lng.toFixed(5)}`;
      }

      const textoCompleto = `REGISTRO FORENSE SST | ${dataHoraStr} | ${gpsTexto}`;

      // Tipografia nítida
      const fontSize = Math.max(12, Math.round(barHeight * 0.38));
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";

      const textY = posY + barHeight / 2;
      ctx.fillText(textoCompleto, 16, textY);

      // Exportação em JPEG com 80% de qualidade (reduz até 90% do peso sem perda de nitidez visual)
      const stampedDataUrl = canvas.toDataURL("image/jpeg", QUALIDADE);

      // Cálculo de métricas de compressão
      const base64Length = stampedDataUrl.length - (stampedDataUrl.indexOf(",") + 1);
      const tamanhoFinalBytes = Math.round(base64Length * 0.75);
      const tamanhoFinalKb = Math.round(tamanhoFinalBytes / 1024);
      const tamanhoOriginalKb = tamanhoOriginalBytes > 0 ? Math.round(tamanhoOriginalBytes / 1024) : undefined;
      let reducaoPercentual: number | undefined = undefined;

      if (tamanhoOriginalKb && tamanhoOriginalKb > tamanhoFinalKb) {
        reducaoPercentual = Math.round(((tamanhoOriginalKb - tamanhoFinalKb) / tamanhoOriginalKb) * 100);
      }

      resolve({
        dataUrl: stampedDataUrl,
        largura: width,
        altura: height,
        tamanhoOriginalKb,
        tamanhoFinalKb,
        reducaoPercentual,
      });
    };

    img.onerror = () => {
      reject(new Error("Falha ao carregar a imagem para aplicação do carimbo e compressão"));
    };

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}


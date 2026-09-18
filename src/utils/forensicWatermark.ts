export interface ForensicStampOptions {
  lat?: number | null;
  lng?: number | null;
  auditorNome?: string;
  empresaNome?: string;
}

export async function aplicarCarimboForense(
  fileOrDataUrl: File | string,
  options: ForensicStampOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Calculate responsive dimensions (max width/height 1280px for high quality & low memory)
      const MAX_DIM = 1280;
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

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Height of forensic bar proportional to image
      const barHeight = Math.max(38, Math.round(height * 0.065));
      const posY = height - barHeight;

      // Dark forensic banner background
      ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
      ctx.fillRect(0, posY, width, barHeight);

      // Top cyan/gold accent line for forensic credibility
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, posY, width, 2);

      // Forensic text assembly
      const now = new Date();
      const dataHoraStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

      let gpsTexto = "GPS: Vistoria Pericial in loco";
      if (options.lat && options.lng) {
        gpsTexto = `GPS: ${options.lat.toFixed(5)}, ${options.lng.toFixed(5)}`;
      }

      const textoCompleto = `REGISTRO FORENSE SST | ${dataHoraStr} | ${gpsTexto}`;

      // Font styling
      const fontSize = Math.max(13, Math.round(barHeight * 0.38));
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";

      const textY = posY + barHeight / 2;
      ctx.fillText(textoCompleto, 16, textY);

      // Export as compressed high quality JPEG (around 120-250KB)
      const stampedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
      resolve(stampedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Falha ao carregar a imagem para aplicação do carimbo"));
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

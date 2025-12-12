/* ==========================================================
      FILTROS PRO PARA ARIEL SCAN — VERCEL SAFE
      Sin OpenCV — Canvas + JS puro
========================================================== */

window.filtros = {}; // namespace global

/* ==========================================================
   AUXILIARES
========================================================== */

// Convierte Blob → Imagen HTML
async function blobToImage(blob) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(blob);
  });
}

// Crea un canvas del tamaño deseado
function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

// Convierte canvas a Blob JPG alta calidad
function canvasToBlob(canvas) {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );
}

/* ==========================================================
   1) FILTRO ESCANEO PRO (Contraste + B&N suave + brillo)
========================================================== */
filtros.filtroEscaneo = async function (blob) {
  const img = await blobToImage(blob);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.drawImage(img, 0, 0);

  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Gris suave
    let gray = (r + g + b) / 3;

    // Contraste
    gray = ((gray - 128) * 1.35) + 128;

    // Brillo leve
    gray += 8;

    // Limitar valores
    gray = Math.min(255, Math.max(0, gray));

    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);

  return await canvasToBlob(canvas);
};

/* ==========================================================
   2) BLANCO Y NEGRO (Umbral)
========================================================== */
filtros.filtroBlancoNegro = async function (blob) {
  const img = await blobToImage(blob);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.drawImage(img, 0, 0);

  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const bin = v > 128 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = bin;
  }

  ctx.putImageData(imgData, 0, 0);

  return await canvasToBlob(canvas);
};

/* ==========================================================
   3) NITIDEZ (Sharpen)
========================================================== */
filtros.filtroNitidez = async function (blob) {
  const img = await blobToImage(blob);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.drawImage(img, 0, 0);

  let { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let output = new Uint8ClampedArray(data);

  const kernel = [
    0, -1, 0,
   -1,  5, -1,
    0, -1, 0
  ];

  const half = 1;
  const kSize = 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = x + kx;
          const py = y + ky;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const i = (py * width + px) * 4;
            const k = kernel[(ky + half) * kSize + (kx + half)];

            r += data[i] * k;
            g += data[i + 1] * k;
            b += data[i + 2] * k;
          }
        }
      }

      output[idx]     = Math.min(255, Math.max(0, r));
      output[idx + 1] = Math.min(255, Math.max(0, g));
      output[idx + 2] = Math.min(255, Math.max(0, b));
    }
  }

  ctx.putImageData(new ImageData(output, width, height), 0, 0);

  return await canvasToBlob(canvas);
};

/* ==========================================================
   4) AUTO-SCAN (tipo CamScanner)
========================================================== */
filtros.filtroAutoScan = async function (blob) {
  const etapa1 = await filtros.filtroEscaneo(blob);
  const etapa2 = await filtros.filtroNitidez(etapa1);
  return etapa2;
};

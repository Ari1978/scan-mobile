// ----------------------
// FIX: createImageBitmap fallback (Android / iPhone)
// ----------------------
if (typeof createImageBitmap !== "function") {
  window.createImageBitmap = async function (blob) {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(blob);
    });
  };
}

// Esperar a que OpenCV cargue
function cvReady() {
  return new Promise(resolve => {
    if (cv && cv.Mat) resolve();
    else cv['onRuntimeInitialized'] = resolve;
  });
}

// Blob → Mat
async function blobToMat(blob) {
  await cvReady();
  const img = await createImageBitmap(blob);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return cv.imread(canvas);
}

// Mat → Blob PNG
async function matToBlob(mat) {
  let canvas = document.createElement("canvas");
  cv.imshow(canvas, mat);

  return new Promise(resolve => {
    canvas.toBlob(resolve, "image/png", 1.0);
  });
}

// ----------------------
// FILTRO: BLANCO Y NEGRO PRO
// ----------------------
async function filtroBN(blob) {
  let mat = await blobToMat(blob);

  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  cv.adaptiveThreshold(
    mat, mat, 255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    51, 10
  );

  let result = await matToBlob(mat);
  mat.delete();
  return result;
}

// ----------------------
// FILTRO: ALTO CONTRASTE
// ----------------------
async function filtroAltoContraste(blob) {
  let mat = await blobToMat(blob);

  let min = { minVal: 0 };
  let max = { maxVal: 255 };
  cv.minMaxLoc(mat, min, max);

  let alpha = 255 / (max.maxVal - min.minVal);
  let beta = -min.minVal * alpha;

  mat.convertTo(mat, -1, alpha, beta);

  let result = await matToBlob(mat);
  mat.delete();
  return result;
}

// ----------------------
// FILTRO: ESCANEO MEJORADO PRO
// ----------------------
async function filtroEscaneo(blob) {
  let mat = await blobToMat(blob);

  // Suavizado
  let smooth = new cv.Mat();
  cv.GaussianBlur(mat, smooth, new cv.Size(3, 3), 0);

  // Sharpen
  let kernel = cv.matFromArray(3, 3, cv.CV_32F, [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ]);
  cv.filter2D(smooth, mat, -1, kernel);

  // Umbral inteligente
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  cv.adaptiveThreshold(
    mat, mat, 255,
    cv.ADAPTIVE_THRESH_MEAN_C,
    cv.THRESH_BINARY,
    51, 5
  );

  smooth.delete();
  kernel.delete();

  let result = await matToBlob(mat);
  mat.delete();
  return result;
}

// Export
window.filtros = {
  filtroEscaneo,
  filtroBN,
  filtroAltoContraste
};

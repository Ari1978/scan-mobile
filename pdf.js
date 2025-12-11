async function generarPDF(nombre) {
  const { jsPDF } = window.jspdf;

  // A4 en puntos (72 DPI) pero configuramos calidad real mucho mayor
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true
  });

  for (let i = 0; i < imagenes.length; i++) {
    const img = imagenes[i];

    if (i > 0) pdf.addPage();

    // --- Convertir a base64 en máxima calidad ---
    const base64 = await fileToHighQualityBase64(img.file);

    // --- Cargar imagen en un objeto temporal ---
    const imgData = await loadImage(base64);

    // Dimensiones reales de la imagen
    const iw = imgData.width;
    const ih = imgData.height;

    // Área útil del PDF (márgenes incluidos)
    const pdfWidth = 555; // margen de 20px a cada lado
    const pdfHeight = 800;

    // Relación de aspecto correcta
    const imgRatio = iw / ih;
    const pdfRatio = pdfWidth / pdfHeight;

    let finalWidth, finalHeight;

    if (imgRatio > pdfRatio) {
      // La imagen es más ancha → limitar ancho
      finalWidth = pdfWidth;
      finalHeight = pdfWidth / imgRatio;
    } else {
      // La imagen es más alta → limitar alto
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * imgRatio;
    }

    const x = (595 - finalWidth) / 2;   // centrar horizontal
    const y = (842 - finalHeight) / 2;  // centrar vertical

    // --- Añadir imagen al PDF en calidad alta ---
    pdf.addImage({
      imageData: base64,
      format: "JPEG",
      x,
      y,
      width: finalWidth,
      height: finalHeight,
      compression: "MEDIUM",
      quality: 1.0
    });
  }

  return pdf.output("blob");
}

/* --------------------------------------------------------
   Lector de imágenes a máxima calidad
-------------------------------------------------------- */
async function fileToHighQualityBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // convertimos PNG del cropper a JPEG de alta calidad
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // JPEG máximo para impresión nítida
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* --------------------------------------------------------
   Cargar imagen base64 para obtener dimensiones reales
-------------------------------------------------------- */
function loadImage(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = base64;
  });
}

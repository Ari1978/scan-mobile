
async function generarPDF(nombre) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  for (let i = 0; i < imagenes.length; i++) {
    const img = imagenes[i];

    if (i > 0) pdf.addPage();

    const base64 = await fileToBase64(img.file);

    pdf.addImage(base64, "JPEG", 20, 20, 555, 800);
  }

  return pdf.output("blob");
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

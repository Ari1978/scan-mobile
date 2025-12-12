async function generarPDF(nombre) {
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: "a4"
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 15;

  for (let i = 0; i < imagenes.length; i++) {
    const blob = imagenes[i].file;
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.src = url;
    await new Promise(res => img.onload = res);

    const h = pageW * (img.height / img.width);

    pdf.addImage(img, "JPEG", margin, margin, pageW - margin * 2, h);

    if (i < imagenes.length - 1) pdf.addPage();
  }

  return pdf.output("blob");
}

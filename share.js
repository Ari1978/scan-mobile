const btnEnviar = document.getElementById("btnEnviar");
const nombrePdf = document.getElementById("nombrePdf");

btnEnviar.onclick = async () => {
  const nombre = nombrePdf.value.trim() || "ArielScan";
  const pdfBlob = await generarPDF(nombre);

  const file = new File([pdfBlob], `${nombre}.pdf`, {
    type: "application/pdf",
  });

  if (navigator.share) {
    await navigator.share({
      title: "Documento escaneado",
      text: "Adjunto el documento generado.",
      files: [file],
    });
  } else {
    alert("Tu dispositivo no soporta compartir archivos.");
  }
};

let imagenes = [];

const capturaSection = document.getElementById("capturaSection");
const detallesSection = document.getElementById("detallesSection");

const btnAgregar = document.getElementById("btnAgregar");
const inputFoto = document.getElementById("inputFoto");
const previewList = document.getElementById("previewList");

/* -----------------------------
   ABRIR CÁMARA
------------------------------ */
btnAgregar.onclick = () => {
  inputFoto.value = ""; // Permitir tomar misma foto dos veces
  inputFoto.click();
};

/* -----------------------------
   CUANDO SE TOMA UNA FOTO
------------------------------ */
inputFoto.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const originalURL = URL.createObjectURL(file);

    // -------------------------------------------
    // ABRIR RECORTE TIPO CAMSCANNER
    // -------------------------------------------
    const cropper = new DocumentCropper({
      image: originalURL,
      autoDetect: true,
      maxCanvasSize: 2200,
      onFinish: async (croppedBlob) => {
        try {
          // -------------------------------------------
          // APLICAR FILTRO DE ESCANEO PRO
          // -------------------------------------------
          const imagenProcesada = await filtros.filtroEscaneo(croppedBlob);

          const finalURL = URL.createObjectURL(imagenProcesada);

          imagenes.push({
            file: imagenProcesada,
            url: finalURL
          });

          renderPreview();
          mostrarDetallesSiCorresponde();

        } catch (err) {
          console.error("Error procesando imagen:", err);
          alert("Hubo un error procesando la imagen.");
        }

        cropper.destroy();
      }
    });

    cropper.open();

  } catch (err) {
    console.error("Error abriendo cropper:", err);
    alert("No se pudo abrir el recorte.");
  }
};

/* -----------------------------
   MOSTRAR VISTAS PREVIAS
------------------------------ */
function renderPreview() {
  previewList.innerHTML = "";

  imagenes.forEach((img, i) => {
    const li = document.createElement("li");
    li.className = "preview-item";

    li.innerHTML = `
      <img src="${img.url}">
      <span>Página ${i + 1}</span>
    `;

    previewList.appendChild(li);
  });
}

/* -----------------------------
   MOSTRAR DETALLES
------------------------------ */
function mostrarDetallesSiCorresponde() {
  if (imagenes.length > 0) {
    detallesSection.classList.remove("hidden");
  }
}

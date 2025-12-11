let imagenes = [];

const capturaSection = document.getElementById("capturaSection");
const detallesSection = document.getElementById("detallesSection");

const btnAgregar = document.getElementById("btnAgregar");
const inputFoto = document.getElementById("inputFoto");
const previewList = document.getElementById("previewList");

// ABRIR CÁMARA
btnAgregar.onclick = () => {
  inputFoto.click();
};

// FOTO TOMADA → Recorte PRO + Filtro PRO automático
inputFoto.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const originalURL = URL.createObjectURL(file);

  // --- 1) Abrir UI de recorte estilo CamScanner ---
  const cropper = new DocumentCropper({
    image: originalURL,
    autoDetect: true,
    maxCanvasSize: 2048,
    onFinish: async (croppedBlob) => {

      console.log("📐 Recorte aplicado. Aplicando filtro PRO...");

      // --- 2) APLICAR FILTRO PRO AUTOMÁTICO ---
      // Usa filtro Escaneo Mejorado (OpenCV)
      const finalBlob = await filtros.filtroEscaneo(croppedBlob);

      const finalURL = URL.createObjectURL(finalBlob);

      // --- 3) Guardar imagen procesada ---
      imagenes.push({ file: finalBlob, url: finalURL });

      renderPreview();
      mostrarDetallesSiCorresponde();

      cropper.destroy();
    },
  });

  cropper.open();
};

// MOSTRAR MINIATURAS
function renderPreview() {
  previewList.innerHTML = "";

  imagenes.forEach((img, i) => {
    const li = document.createElement("li");
    li.className = "preview-item";
    li.draggable = true;
    li.dataset.index = i;

    li.innerHTML = `
      <span class="drag-handle">☰</span>
      <img src="${img.url}">
      <span>Página ${i + 1}</span>
    `;

    previewList.appendChild(li);

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", dragDrop);
  });
}

let dragStartIndex;

function dragStart() { dragStartIndex = +this.dataset.index; }
function dragOver(e) { e.preventDefault(); }

function dragDrop() {
  const dragEndIndex = +this.dataset.index;
  [imagenes[dragStartIndex], imagenes[dragEndIndex]] =
    [imagenes[dragEndIndex], imagenes[dragStartIndex]];
  renderPreview();
}

// MOSTRAR SECCIÓN DETALLES SOLO CUANDO HAYA IMÁGENES
function mostrarDetallesSiCorresponde() {
  if (imagenes.length > 0) {
    detallesSection.classList.remove("hidden");
  }
}

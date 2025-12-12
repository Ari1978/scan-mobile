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
  inputFoto.value = "";
  inputFoto.click();
};

/* -----------------------------
   CUANDO SE TOMA UNA FOTO
------------------------------ */
inputFoto.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imgURL = URL.createObjectURL(file);

  const img = new Image();
  img.src = imgURL;

  await new Promise(res => img.onload = res);

  // SmartCrop analiza la imagen y devuelve la región óptima
  const cropResult = await smartcrop.crop(img, { width: img.width, height: img.height });

  const crop = cropResult.topCrop;

  // Recortamos usando canvas
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    img,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height
  );

  // Convertimos a Blob
  const croppedBlob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.95));

  // Filtro Scan Pro
  const imagenProcesada = await filtros.filtroEscaneo(croppedBlob);
  const finalURL = URL.createObjectURL(imagenProcesada);

  imagenes.push({
    file: imagenProcesada,
    url: finalURL
  });

  renderPreview();
  mostrarDetallesSiCorresponde();
};

/* -----------------------------
   MINIATURAS
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

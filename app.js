
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

// TOMA DE FOTO / IMPORTAR IMAGEN
inputFoto.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  imagenes.push({ file, url });

  renderPreview();
  mostrarDetallesSiCorresponde();
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

function dragStart() {
  dragStartIndex = +this.dataset.index;
}

function dragOver(e) {
  e.preventDefault();
}

function dragDrop() {
  const dragEndIndex = +this.dataset.index;

  [imagenes[dragStartIndex], imagenes[dragEndIndex]] =
    [imagenes[dragEndIndex], imagenes[dragStartIndex]];

  renderPreview();
}

// MOSTRAR DETALLES SOLO CUANDO HAYA UNA IMAGEN
function mostrarDetallesSiCorresponde() {
  if (imagenes.length > 0) {
    detallesSection.classList.remove("hidden");
  }
}

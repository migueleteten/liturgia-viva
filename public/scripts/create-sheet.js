// crearHoja.js

document.addEventListener('DOMContentLoaded', () => {
  const draggableContents = document.querySelectorAll('.draggable-content');
  const columns = document.querySelectorAll('.column');

  draggableContents.forEach(item => {
      item.addEventListener('dragstart', dragStart);
  });

  columns.forEach(column => {
      column.addEventListener('dragover', dragOver);
      column.addEventListener('drop', drop);
      column.addEventListener('click', removeContent);  // Permite eliminar contenido al hacer clic
  });

  function dragStart(e) {
      e.dataTransfer.setData('text/plain', e.target.dataset.contentId);
  }

  function dragOver(e) {
      e.preventDefault();
  }

  function drop(e) {
      e.preventDefault();
      const contentId = e.dataTransfer.getData('text/plain');
      const draggedItem = document.querySelector(`[data-content-id="${contentId}"]`);

      // Reemplazar contenido existente con el nuevo
      const exampleText = draggedItem.getAttribute('data-example');
      e.target.innerHTML = `<p>${exampleText}</p>`;
  }

  function removeContent(e) {
      e.target.innerHTML = '';  // Vacía el contenido del contenedor al hacer clic
  }
});

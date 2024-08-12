$(document).ready(function() {
  const lineTypes = ['t', 'n', 'l', 'e', 'x', 'c'];
  const songParts = ['f1', 'f2', 'f3', 'f4', 'p1', 'p2', 'p', 'e'];

  let undoStack = [];
  let redoStack = [];

  function createSelectOptions(options, selectedValue) {
      return options.map(option => `<option value="${option}" ${option === selectedValue ? 'selected' : ''}>${option}</option>`).join('');
  }

  function updateRowStyles(row) {
      const lineType = row.find('.line-type-select').val();
      const songPart = row.find('.song-part-select').val();
      const contentCell = row.find('.line-content');

      contentCell.removeClass().addClass('line-content');
      if (lineType === 'n') {
          contentCell.addClass('line-type-n');
      } else if (lineType === 'e') {
          contentCell.addClass('line-type-e');
      }

      if (['p', 'p1', 'p2'].includes(songPart)) {
          contentCell.addClass('line-part-p');
      } else if (songPart === 'e') {
          contentCell.addClass('line-part-e');
      }

      if (lineType === 'n' && songPart === 'e') {
          contentCell.removeClass('line-part-e');
      }

      if (lineType === 't') {
          contentCell.addClass('line-type-t');
      }
  }

  // Función para añadir etiqueta como chip dentro del contenedor
  function addChip(text) {
      const chip = $(`<a href="#" class="badge">${text}</a>`);
      chip.on('click', function() {
          chip.remove();
      });
      $('#etiquetasContainer').prepend(chip);
  }

  // Cargar el header
  $(function(){
    $("#header-placeholder").load("/path/to/templates/header.html");
  });
  
  $('#etiquetas').on('input', function() {
      const query = $(this).val().trim();
      const $this = $(this);

      if (query.length >= 1) {
          $.ajax({
              url: '/api/songs/etiquetas/search', // Esta ruta debería devolver sugerencias de etiquetas según el query
              type: 'GET',
              data: { term: query },
              success: function(response) {
                  const dropdown = $('<div class="dropdown-menu" style="display:block; position:absolute; cursor: pointer;"></div>');

                  if (response.length) {
                      response.forEach(etiqueta => {
                          const item = $('<a class="dropdown-item"></a>')
                              .text(etiqueta.etiqueta)
                              .on('click', function() {
                                  addChip(etiqueta.etiqueta); // Añadir la etiqueta como chip
                                  $this.val(''); // Limpiar el input
                                  dropdown.remove(); // Eliminar el dropdown
                              });
                          dropdown.append(item);
                      });
                  } else {
                      dropdown.append('<a class="dropdown-item disabled">No hay sugerencias</a>');
                  }

                  // Eliminar cualquier dropdown existente antes de agregar uno nuevo
                  $this.next('.dropdown-menu').remove();
                  $this.after(dropdown);
              }
          });
      } else {
          // Si el query tiene menos de 3 caracteres, eliminar el dropdown
          $this.next('.dropdown-menu').remove();
      }
  });

  // Cerrar el dropdown si se hace clic fuera
  $(document).on('click', function(e) {
      if (!$(e.target).closest('.dropdown-menu, #etiquetas').length) {
          $('.dropdown-menu').remove();
      }
  });


  // Manejar etiquetas
  $('#etiquetas').on('keypress', function(e) {
      if (e.which === 13) {
          e.preventDefault();
          const etiqueta = $(this).val().trim();
          if (etiqueta) {
              addChip(etiqueta);
              $(this).val('');
          }
      }
  });

  $(document).ready(function() {
      $('#songText').on('input', function() {
          this.style.height = 'auto';
          this.style.height = (this.scrollHeight) + 'px';
          // Habilita o deshabilita el botón según si hay contenido
          if ($(this).val().trim().length > 0) {
              $('#convertSongBtn').removeAttr('disabled');
          } else {
              $('#convertSongBtn').attr('disabled', 'disabled');
          }
      });

      // Si hay contenido inicial, ajusta el tamaño al cargar la página
      $('#songText').each(function() {
          this.style.height = 'auto';
          this.style.height = (this.scrollHeight) + 'px';
          if ($(this).val().trim().length > 0) {
              $('#convertSongBtn').removeAttr('disabled');
          } else {
              $('#convertSongBtn').attr('disabled', 'disabled');
          }
      });
  });

  // Mensajes de ayuda
  $(document).ready(function(){
      $('[data-toggle="tooltip"]').tooltip();
  });


  // Asegurarse de que el input se mantenga funcional y ajustable
  $('#etiquetasContainer').on('click', function() {
      $('#etiquetas').focus();
  });

  // Sugerencias para autores
  $('#autorLetra, #autorMusica').on('input', function() {
      const query = $(this).val().trim();
      const $this = $(this);

      if (query.length >= 3) {
          $.ajax({
              url: '/api/songs/autores/search', // Esta ruta debería devolver sugerencias de autores según el query
              type: 'GET',
              data: { term: query }, // Cambié 'q' por 'term' para que coincida con el controlador
              success: function(response) {
                  const dropdown = $('<div class="dropdown-menu" style="display:block; position:absolute; cursor: pointer;"></div>');
                  
                  if (response.length) {
                      response.forEach(author => {
                          const item = $('<a class="dropdown-item"></a>')
                              .text(author.nombre)
                              .on('click', function() {
                                  $this.val(author.nombre);
                                  dropdown.remove();
                              });
                          dropdown.append(item);
                      });
                  } else {
                      dropdown.append('<a class="dropdown-item disabled">No hay sugerencias</a>');
                  }

                  // Eliminar cualquier dropdown existente antes de agregar uno nuevo
                  $this.next('.dropdown-menu').remove();
                  $this.after(dropdown);
              }
          });
      } else {
          // Si el query tiene menos de 3 caracteres, eliminar el dropdown
          $this.next('.dropdown-menu').remove();
      }
  });

  // Cerrar el dropdown si se hace clic fuera
  $(document).on('click', function(e) {
      if (!$(e.target).closest('.dropdown-menu, #autorLetra, #autorMusica').length) {
          $('.dropdown-menu').remove();
      }
  });

  function addRowAfter(index) {
      const currentData = captureTableData();
      const newRow = {
          tipo_linea: 'x',
          parte_cancion: 'f1',
          contenido: ''
      };
      const estructura = $('#songTable tbody').data('estructura') || [];
      currentData.splice(index + 1, 0, newRow);
      undoStack.push({ action: 'add', index: index + 1 });
      redoStack = [];
      renderTable(currentData);
  }

  function deleteRow(index) {
      const estructura = $('#songTable tbody').data('estructura') || [];
      const currentData = captureTableData();
      const deletedRow = currentData.splice(index, 1)[0];
      undoStack.push({ action: 'delete', index, row: deletedRow });
      redoStack = [];
      renderTable(currentData);
  }

  function captureTableData() {
      const estructura = [];
      $('#songTable tbody tr').each(function() {
          const row = $(this);
          const tipo_linea = row.find('.line-type-select').val();
          const parte_cancion = row.find('.song-part-select').val();
          const contenido = row.find('.line-content').text();
          estructura.push({ tipo_linea, parte_cancion, contenido });
      });
      return estructura;
  }

  function undo() {
      if (undoStack.length === 0) return;
      const lastAction = undoStack.pop();
      const estructura = $('#songTable tbody').data('estructura') || [];

      if (lastAction.action === 'add') {
          redoStack.push({ action: 'add', index: lastAction.index });
          estructura.splice(lastAction.index, 1);
      } else if (lastAction.action === 'delete') {
          redoStack.push({ action: 'delete', index: lastAction.index, row: lastAction.row });
          estructura.splice(lastAction.index, 0, lastAction.row);
      }

      renderTable(estructura);
  }

  function redo() {
      if (redoStack.length === 0) return;
      const lastAction = redoStack.pop();
      const estructura = $('#songTable tbody').data('estructura') || [];

      if (lastAction.action === 'add') {
          undoStack.push({ action: 'add', index: lastAction.index });
          estructura.splice(lastAction.index, 0, { tipo_linea: 'x', parte_cancion: 'f1', contenido: '' });
      } else if (lastAction.action === 'delete') {
          undoStack.push({ action: 'delete', index: lastAction.index, row: lastAction.row });
          estructura.splice(lastAction.index, 1);
      }

      renderTable(estructura);
  }

  function renderTable(estructura) {
      $('#songTable tbody').empty().data('estructura', estructura);
      estructura.forEach((linea, index) => {
          const row = $('<tr>');
          const tipoLineaCell = $('<td>').html(`<select class="form-control form-control-sm line-type-select">${createSelectOptions(lineTypes, linea.tipo_linea)}</select>`).appendTo(row);
          const parteCancionCell = $('<td>').html(`<select class="form-control form-control-sm song-part-select">${createSelectOptions(songParts, linea.parte_cancion)}</select>`).appendTo(row);
          const contenidoCell = $('<td>').attr('contenteditable', 'true').addClass('line-content').text(linea.contenido).css('white-space', 'pre').appendTo(row);

          const actionButtons = $('<td>').addClass('action-buttons').appendTo(row);
          $('<button>').addClass('btn btn-sm').html('<i class="fas fa-trash"></i>').on('click', () => deleteRow(index)).appendTo(actionButtons);
          $('<button>').addClass('btn btn-sm').html('<i class="fas fa-plus"></i>').on('click', () => addRowAfter(index)).appendTo(actionButtons);

          updateRowStyles(row);

          $('#songTable tbody').append(row);
      });

      $('#songTable').on('change', 'select', function() {
          const row = $(this).closest('tr');
          updateRowStyles(row);
      });

      $('#undoBtn').prop('disabled', undoStack.length === 0);
      $('#redoBtn').prop('disabled', redoStack.length === 0);

      // Ocultar la indicación provisional
      $('#indicacion-provisional').css('display', 'none');
  }

  $('#convertSongBtn').on('click', function() {
      const songText = $('#songText').val();
      if (songText.trim() === '') {
          alert('Por favor, ingresa el texto de la canción.');
          return;
      }
      
      // Mostrar el spinner de carga
      $('#loadingSpinner').removeClass('d-none');
      
      $.ajax({
          url: '/api/songs/convert',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ texto: songText }),
          success: function(response) {
              const estructura = response.estructura;

              $('#songTitle').text((estructura.find(line => line.tipo_linea === 't')?.contenido || 'Sin Título'));
              undoStack = [];
              redoStack = [];
              renderTable(estructura);
              // Ocultar el spinner de carga
              $('#loadingSpinner').addClass('d-none');
          },
          error: function() {
              alert('Error al convertir la canción. Por favor, intenta de nuevo.');
              // Ocultar el spinner de carga
              $('#loadingSpinner').addClass('d-none');
          }
      });
  });

  $('#undoBtn').on('click', undo);
  $('#redoBtn').on('click', redo);

});
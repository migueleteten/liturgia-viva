$(document).ready(function () {
  // Configuración inicial
  const prevChapterButton = $('#prev-chapter');
  const nextChapterButton = $('#next-chapter');
  const chapterNavigationDiv = $('.chapter-navigation');
  const token = localStorage.getItem('authToken');
  let selectedVerses = [];

  // Resaltar versículos y restaurar seleccionados solo si el usuario está autenticado
  if (token) {
      highlightVersesWithComments(token);
      restoreSelectedVerses(token);
  }

  // Navegación entre capítulos
  setupChapterNavigation();

  // Manejar el clic en el botón de guardar comentarios
  $('#save-comment-button').on('click', function (event) {
      handleSaveCommentButtonClick(event);
  });

  // Añadir evento al hacer clic en un versículo resaltado
  $(document).on('click', '.versiculo.highlighted', function () {
      handleHighlightedVerseClick($(this), token);
  });

  // Mostrar/Ocultar versículos
  $(document).on('change', '#toggleVersiculos', function () {
      handleToggleVersiculosChange($(this));
  });

  // Saltos de línea para caracteres de diálogo
  formatDialogueLines();

  // Evento al hacer clic en un versículo
  $(document).on('click', '.versiculo', function () {
      handleVerseClick($(this));
  });

  // Evento al hacer clic en Cancelar
  $(document).on('click', '#cancel-comment-button', function () {
      handleCancelCommentButtonClick();
  });

  // Evento al hacer clic en una tarjeta de versículo en el panel de comentarios
  $(document).on('click', '.verse-card', function () {
      handleVerseCardClick($(this));
  });

  // Mostrar la caja de texto para añadir comentarios
  $('#add-comment-button').on('click', function () {
      $('#comment-box').slideDown();
      $('#comment-text').focus();
  });

  // Mostrar mensaje de comentarios después de un tiempo
  showMessageAfterTimeout();

  // Ocultar navegación de capítulos si es necesario
  if (shouldHideChapterNavigation()) {
      chapterNavigationDiv.hide();
  }

  // Funciones de manejo
  function handleSaveCommentButtonClick(event) {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
          saveComments(currentToken);
      } else {
          event.preventDefault();
          localStorage.setItem('redirectUrl', window.location.href);
          loadAuthView('login');
      }
  }

  function handleHighlightedVerseClick(verseElement, token) {
      const verseId = verseElement.attr('id');
      const versiculo = verseId.split('_')[1];
      loadUserCommentsForVerse(versiculo, token);
  }

  function handleToggleVersiculosChange(toggleElement) {
      if (toggleElement.is(':checked')) {
          $('.num-versiculo').hide();
      } else {
          $('.num-versiculo').show();
      }
  }

  function handleVerseClick(verseElement) {
      const verseId = verseElement.attr('id');
      const verseText = verseElement.text();
      const verseNumber = $(`#num_${verseId}`).text();

      if (!selectedVerses.includes(verseId)) {
          selectedVerses.push(verseId);
          addVerseToPanel(verseId, verseNumber, verseText);
      }

      toggleAddCommentButton();
      showCommentPanel();
  }

  function handleCancelCommentButtonClick() {
      hideCommentPanel();
      $('#selected-verses').empty();
      selectedVerses = [];
      $('#comment-box').slideUp();
      $('#comment-text').val('');
      $('#comment-status').text('Comentario guardado correctamente').hide();
      $('#comment-links').hide();
  }

  function handleVerseCardClick(cardElement) {
      const verseId = cardElement.attr('data-verse-id');
      selectedVerses = selectedVerses.filter(id => id !== verseId);
      cardElement.remove();
      toggleAddCommentButton();

      if (selectedVerses.length === 0) {
          hideCommentPanel();
      }
  }

  // Funciones adicionales y utilitarias
  function setupChapterNavigation() {
      const chapterButtons = $('.chapter-navigation button');
      const currentUrl = window.location.pathname;

      chapterButtons.each(function () {
          const buttonHref = $(this).attr('onclick').match(/location\.href='([^']+)'/)[1];
          if (currentUrl.includes(buttonHref)) {
              $(this).addClass('current-chapter');
          }
      });

      const currentButton = $('.current-chapter');
      if (currentButton.length) {
          const container = $('.chapter-navigation');
          const buttonOffset = currentButton.offset().left;
          const containerOffset = container.offset().left;
          const containerScrollLeft = container.scrollLeft();
          const offset = buttonOffset - containerOffset;
          const scrollLeft = offset + containerScrollLeft - (container.width() / 2) + (currentButton.width() / 2);
          container.scrollLeft(scrollLeft);
      }
  }

  function formatDialogueLines() {
      document.querySelectorAll('span.versiculo').forEach(span => {
          if (span.textContent.includes('—')) {
              span.innerHTML = span.innerHTML.replace(/—/g, '<br>—');
          }
      });
  }

  function showMessageAfterTimeout() {
      const mensajeComentarios = $('#mensaje-comentarios');
      const mensajeKey = 'mensajeComentariosVisto';

      if (!localStorage.getItem(mensajeKey)) {
          setTimeout(function () {
              mensajeComentarios.fadeIn(500);
          }, 30000);
      }

      mensajeComentarios.on('click', function () {
          $(this).fadeOut(500);
          localStorage.setItem(mensajeKey, 'true');
      });
  }

  function shouldHideChapterNavigation() {
      const prevText = prevChapterButton.text().trim();
      const nextText = nextChapterButton.text().trim();
      return prevText.length > 1 || nextText.length > 1;
  }

  // Panel de comentarios
  function showCommentPanel() {
      $('#content-comments-container').addClass('comment-panel-active');
  }

  function hideCommentPanel() {
      $('#content-comments-container').removeClass('comment-panel-active');
  }

  function addVerseToPanel(verseId, verseNumber, verseText) {
      const verseCard = `<div class="verse-card" data-verse-id="${verseId}">
                          <strong>${verseNumber}</strong>. ${verseText.length > 100 ? verseText.substring(0, 100) + '...' : verseText}
                        </div>`;
      $('#selected-verses').append(verseCard);
  }

  function toggleAddCommentButton() {
      $('#add-comment-button').prop('disabled', selectedVerses.length === 0);
  }

  function saveComments(token) {
      const comment = $('#comment-text').val().trim();
      if (comment === '') {
          alert('El comentario no puede estar vacío.');
          return;
      }

      const libro = $('#libro-id').text();
      const capitulo = $('#capitulo').text();

      localStorage.setItem('selectedVerses', JSON.stringify(selectedVerses));

      selectedVerses.forEach(verseId => {
          const versiculo = verseId.split('_')[1];
          saveComment(libro, capitulo, versiculo, comment, token);
      });

      $('#comment-text').val('');
      setTimeout(function () {
          location.reload();
      }, 500);
  }

  function saveComment(libro, capitulo, versiculo, comentario, token) {
      $.ajax({
          url: '/api/biblia/comentarios',
          type: 'POST',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${token}` },
          data: JSON.stringify({ libro, capitulo, versiculo, comentario }),
          success: function (response) {
              console.log('Comentario guardado:', response);
          },
          error: function (error) {
              console.log('Error al guardar el comentario:', error);
          }
      });
  }

  function highlightVersesWithComments(token) {
      const libro = $('#libro-id').text();
      const capitulo = $('#capitulo').text();

      $.ajax({
          url: '/api/biblia/comentarios/user',
          type: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          data: { libro, capitulo },
          success: function (response) {
              response.forEach(comment => {
                  const versiculoId = `#versiculo_${comment.versiculo}`;
                  $(versiculoId).addClass('highlighted');
              });
          },
          error: function (error) {
              console.log('Error al obtener comentarios:', error);
          }
      });
  }

  function loadUserCommentsForVerse(versiculo, token) {
      const libro = $('#libro-id').text();
      const capitulo = $('#capitulo').text();

      $.ajax({
          url: `/api/biblia/comentarios/user/${versiculo}`,
          type: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          data: { libro, capitulo },
          success: function (response) {
              response.forEach(comment => {
                  appendCommentToVerse(versiculo, comment.comentario, comment.fecha);
              });
          },
          error: function (error) {
              console.log('Error al obtener comentarios:', error);
          }
      });
  }

  function restoreSelectedVerses(token) {
      const storedVerses = localStorage.getItem('selectedVerses');
      if (storedVerses) {
          selectedVerses = JSON.parse(storedVerses);
          selectedVerses.forEach(verseId => {
              const verseText = $(`#${verseId}`).text();
              const verseNumber = $(`#num_${verseId}`).text();
              addVerseToPanel(verseId, verseNumber, verseText);
              loadUserCommentsForVerse(verseId.split('_')[1], token);
          });
          $('#comment-box').show();
          setTimeout(function () {
              $('#comment-text').focus();
              $('#comment-status').text('Comentario guardado correctamente').fadeIn();
              $('#comment-links').fadeIn();
          }, 100);
          $('#add-comment-button').prop('disabled', false);
          localStorage.removeItem('selectedVerses');
          localStorage.removeItem('storedComment');
      }
  }

  function appendCommentToVerse(versiculo, comentario, fecha) {
      const formattedDate = formatDate(fecha);
      const commentCard = `
          <div class="comment-card" style="margin-left: 20px;">
              <strong>${formattedDate}:</strong> ${comentario}
          </div>`;
      $(`#selected-verses .verse-card[data-verse-id="versiculo_${versiculo}"]`).append(commentCard);
  }

  function formatDate(dateString) {
      const dateObject = new Date(dateString);
      if (isNaN(dateObject.getTime())) throw new Error("Fecha inválida");
      const day = String(dateObject.getDate()).padStart(2, '0');
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const year = String(dateObject.getFullYear()).slice(2);
      return `${day}-${month}-${year}`;
  }
});
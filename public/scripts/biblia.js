$(document).ready(function () {
    /*const libro = window.location.pathname.split('/')[2];
    console.log(libro)
    const capitulo = window.location.pathname.split('/')[3];
    console.log(capitulo)

    console.log(`Loading chapter: libro = ${libro}, capitulo = ${capitulo}`);

    // Obtener y mostrar el capítulo
    $.ajax({
        url: `/api/biblia/${libro}/${capitulo}`,
        type: 'GET',
        success: function(response) {
            $('#chapter-title').text(`Libro ${libro}, Capítulo ${capitulo}`);
            $('#chapter-content').html(response.capituloHtml);
            initializeChapterHeader();
        },
        error: function() {
            $('#chapter-content').text('Error al cargar el capítulo.');
        }
    });
  
    function initializeChapterHeader() {
          var header = $('#chapter-header');
          var scrollThreshold = 50; // Umbral de 50px
  
          if (header.length > 0) {
              console.log("Elemento #chapter-header encontrado.");
          } else {
              console.log("Elemento #chapter-header no encontrado.");
          }
      }*/

    $(document).ready(function () {
        const prevChapterButton = $('#prev-chapter');
        const nextChapterButton = $('#next-chapter');
        const chapterNavigationDiv = $('.chapter-navigation');

        // Función para comprobar si el texto del botón es más largo que "<" o ">"
        function shouldHideChapterNavigation() {
            const prevText = prevChapterButton.text().trim();
            const nextText = nextChapterButton.text().trim();
            
            // Comprueba si alguno de los botones tiene un texto más largo que "<" o ">"
            return prevText.length > 1 || nextText.length > 1;
        }

        // Oculta el div.chapter-navigation si el texto del botón es más largo que "<" o ">"
        if (shouldHideChapterNavigation()) {
            chapterNavigationDiv.hide();
        }
    });
        
    $(document).ready(function () {
        const chapterButtons = $('.chapter-navigation button');
        const currentUrl = window.location.pathname;
    
        // Cambiar color del botón del capítulo actual
        chapterButtons.each(function () {
            const buttonHref = $(this).attr('onclick').match(/location\.href='([^']+)'/)[1];
            if (currentUrl.includes(buttonHref)) {
                $(this).addClass('current-chapter'); // Añadir clase especial al botón actual
            }
        });
    
        // Centrar el scroll en el botón del capítulo actual
        const currentButton = $('.current-chapter');
        if (currentButton.length) {
            const container = $('.chapter-navigation');
            
            // Calcular la posición del botón para centrarlo en el contenedor
            const buttonOffset = currentButton.offset().left; // Posición del botón en relación al documento
            const containerOffset = container.offset().left; // Posición del contenedor en relación al documento
            const containerScrollLeft = container.scrollLeft(); // Desplazamiento actual del scroll
            const offset = buttonOffset - containerOffset; // Diferencia de posición entre el botón y el contenedor
            const scrollLeft = offset + containerScrollLeft - (container.width() / 2) + (currentButton.width() / 2);

            // Desplazar el contenedor
            container.scrollLeft(scrollLeft);
        }
    });

    $(document).ready(function () {
        const mensajeComentarios = $('#mensaje-comentarios');
        const mensajeKey = 'mensajeComentariosVisto';
    
        // Comprobar si el mensaje ya ha sido visto
        if (!localStorage.getItem(mensajeKey)) {
            // Mostrar el mensaje después de 60 segundos
            setTimeout(function () {
                mensajeComentarios.fadeIn(500);
            }, 30000); // 30000 ms = 30 segundos
        }
    
        // Ocultar el mensaje y marcarlo como visto
        mensajeComentarios.on('click', function () {
            $(this).fadeOut(500);
            localStorage.setItem(mensajeKey, 'true'); // Marcar como visto en localStorage
        });
    });
    
    // Mostrar/Ocultar versículos
    $(document).on('change', '#toggleVersiculos', function () {
        if ($(this).is(':checked')) {
            $('.num-versiculo').hide();
        } else {
            $('.num-versiculo').show();
        }
    });

    // Saltos de línea para caracteres de diálogo
    document.querySelectorAll('span.versiculo').forEach(span => {
        if (span.textContent.includes('—')) {
            span.innerHTML = span.innerHTML.replace(/—/g, '<br>—'); /* Reemplaza "—" por un salto de línea */
        }
    });

    /* Navegación entre capítulos
    $('#prev-chapter').on('click', function() {
        if (capitulo > 1) {
            window.location.href = `/biblia/${libro}/${parseInt(capitulo) - 1}`;
        }
    });
  
    $('#next-chapter').on('click', function() {
        window.location.href = `/biblia/${libro}/${parseInt(capitulo) + 1}`;
    });*/

    let selectedVerses = [];

    // Evento al hacer clic en un versículo
    $(document).on('click', '.versiculo', function () {
        showCommentPanel();
        const verseId = $(this).attr('id'); // ID del versículo (e.g., versiculo_1)
        const verseText = $(this).text(); // Texto del versículo
        const verseNumber = $(`#num_${verseId}`).text(); // Número de versículo a partir del ID correspondiente (e.g., num_versiculo_1)

        // Verificar si el versículo ya está seleccionado
        if (!selectedVerses.includes(verseId)) {
            selectedVerses.push(verseId);
            addVerseToPanel(verseNumber, verseText);
        }

        if (!$('#content-comments-container').hasClass('comment-panel-active')) {
            showCommentPanel();
        }

        toggleAddCommentButton();
    });

    // Evento al hacer clic en Cancelar
    $(document).on('click', '#cancel-comment-button', function () {
        hideCommentPanel();
        $('#selected-verses').empty();
        selectedVerses = [];
        $('#comment-box').slideUp();
        $('#comment-text').val('');
    });

    // Mostrar el panel de comentarios
    function showCommentPanel() {
        $('#content-comments-container').addClass('comment-panel-active');
    }

    // Ocultar el panel de comentarios
    function hideCommentPanel() {
        $('#content-comments-container').removeClass('comment-panel-active');
    }

    // Añadir versículo al panel
    function addVerseToPanel(verseNumber, verseText) {
        const verseCard = `<div class="verse-card" data-verse="${verseNumber}">
                            <strong>${verseNumber}</strong>. ${verseText.length > 100 ? verseText.substring(0, 100) + '...' : verseText}
                          </div>`;
        $('#selected-verses').append(verseCard);
        // Mostrar el panel de comentarios si no está visible
        if (!$('#content-comments-container').hasClass('comment-panel-active')) {
            showCommentPanel();
        }
    }

    // Habilitar/Deshabilitar botón de añadir comentario
    function toggleAddCommentButton() {
        if (selectedVerses.length > 0) {
            $('#add-comment-button').prop('disabled', false);
        } else {
            $('#add-comment-button').prop('disabled', true);
        }
    }

    // Mostrar la caja de texto para añadir comentarios
    $('#add-comment-button').on('click', function () {
        $('#comment-box').slideDown();
        $('#comment-text').focus();
    });

    // Guardar comentario en la base de datos
    $('#save-comment-button').on('click', function () {
        const comment = $('#comment-text').val().trim();
        if (comment === '') {
            alert('El comentario no puede estar vacío.');
            return;
        }

        const libro = $('#chapter-title').data('libro'); // Asegúrate de tener este dato disponible
        const capitulo = $('#chapter-title').data('capitulo'); // Asegúrate de tener este dato disponible

        selectedVerses.forEach(verseId => {
            const versiculo = verseId.split('_')[1];
            saveComment(libro, capitulo, versiculo, comment);
        });

        $('#comment-status').text('Comentario guardado correctamente').fadeIn();
        $('#comment-links').fadeIn();
    });

    // Función para guardar comentario en la base de datos
    function saveComment(libro, capitulo, versiculo, comentario) {
        $.ajax({
            url: '/api/biblia/comentarios',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                libro: libro,
                capitulo: capitulo,
                versiculo: versiculo,
                comentario: comentario
            }),
            success: function (response) {
                console.log('Comentario guardado:', response);
            },
            error: function (error) {
                console.log('Error al guardar el comentario:', error);
            }
        });
    }
});

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
        const token = localStorage.getItem('authToken');
    
        // Resaltar versículos y restaurar seleccionados solo si el usuario está autenticado
        if (token) {
            highlightVersesWithComments(token);
            restoreSelectedVerses(token);
        }
    
        // Manejar el clic en el botón de guardar comentarios
        $('#save-comment-button').on('click', function (event) {
            const currentToken = localStorage.getItem('authToken');

            if (currentToken) {
                // Si el usuario está autenticado, guardar comentarios
                saveComments(currentToken);
            } else {
                // Si no está autenticado, prevenir la acción y cargar el modal de login
                event.preventDefault();
                localStorage.setItem('redirectUrl', window.location.href);
                loadAuthView('login');
            }
        });

        // Añadir evento al hacer clic en un versículo resaltado
        $(document).on('click', '.versiculo.highlighted', function () {
            const verseId = $(this).attr('id');
            const versiculo = verseId.split('_')[1];
            loadUserCommentsForVerse(versiculo, token);
        });

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
            addVerseToPanel(verseId, verseNumber, verseText);
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
        $('#comment-status').text('Comentario guardado correctamente').hide();
        $('#comment-links').hide();
    });

    // Evento al hacer clic en una tarjeta de versículo en el panel de comentarios
    $(document).on('click', '.verse-card', function () {
        const verseId = $(this).attr('data-verse-id'); // Obtener el ID del versículo desde un atributo data

        // Eliminar el versículo de la lista de seleccionados
        selectedVerses = selectedVerses.filter(id => id !== verseId);

        // Eliminar la tarjeta del panel de comentarios
        $(this).remove();

        // Actualizar el estado del botón de añadir comentario
        toggleAddCommentButton();

        // Opcional: Ocultar el panel de comentarios si no hay versículos seleccionados
        if (selectedVerses.length === 0) {
            hideCommentPanel();
        }
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
    function addVerseToPanel(verseId, verseNumber, verseText) {
        const verseCard = `<div class="verse-card" data-verse-id="${verseId}">
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
    function saveComments(token) {
        const comment = $('#comment-text').val().trim();
        if (comment === '') {
            alert('El comentario no puede estar vacío.');
            return;
        }

        const libro = $('#libro-id').text(); // Asegúrate de tener este dato disponible
        const capitulo = $('#capitulo').text(); // Asegúrate de tener este dato disponible

        // Guardar versículos seleccionados en localStorage
        localStorage.setItem('selectedVerses', JSON.stringify(selectedVerses));

        console.log('Libro ID: ' + libro);
        console.log('Capítulo: ' + capitulo);

        if (!token) {
            alert('Debes iniciar sesión para añadir un comentario.');
            return;
        }

        selectedVerses.forEach(verseId => {
            const versiculo = verseId.split('_')[1];
            saveComment(libro, capitulo, versiculo, comment, token);
        });

        // Limpiar la caja de texto
        $('#comment-text').val('');

        // Recargar la página después de un breve retraso para permitir que las solicitudes AJAX se completen
        setTimeout(function () {
            location.reload();
        }, 500); // 500 ms de retraso para asegurar que las solicitudes se completen
    };

    // Función para guardar comentario en la base de datos
    function saveComment(libro, capitulo, versiculo, comentario, token) {
        $.ajax({
            url: '/api/biblia/comentarios',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                Authorization: `Bearer ${token}` // Enviar el token en el encabezado
            },
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

    function appendCommentToVerse(versiculo, comentario, fecha) {
        const formattedDate = formatDate(fecha);
        const commentCard = `
            <div class="comment-card" style="margin-left: 20px;">
                <strong>${formattedDate}:</strong> ${comentario}
            </div>`;
        $(`#selected-verses .verse-card[data-verse-id="versiculo_${versiculo}"]`).append(commentCard);
    }

    function formatDate(dateString) {
        // Convertir la cadena en un objeto Date
        const dateObject = new Date(dateString);
    
        // Verificar si el objeto Date es válido
        if (isNaN(dateObject.getTime())) {
            throw new Error("Fecha inválida");
        }
    
        // Obtener el día, mes y año
        const day = String(dateObject.getDate()).padStart(2, '0');
        const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const year = String(dateObject.getFullYear()).slice(2); // Tomar los últimos dos dígitos del año
    
        // Formatear la fecha como "DD-MM-AA"
        return `${day}-${month}-${year}`;
    }
    
    function highlightVersesWithComments(token) {
        const libro = $('#libro-id').text();
        const capitulo = $('#capitulo').text();

        $.ajax({
            url: '/api/biblia/comentarios/user',
            type: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
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
            headers: {
                Authorization: `Bearer ${token}`
            },
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
    
            // Mostrar la caja de texto #comment-box
            $('#comment-box').show();
    
            // Aplicar el foco con un pequeño retardo para asegurar que esté visible
            setTimeout(function() {
                $('#comment-text').focus();
                $('#comment-status').text('Comentario guardado correctamente').fadeIn();
                $('#comment-links').fadeIn();
            }, 100); // 100 ms de retardo
    
            // Activar el botón de añadir comentario
            $('#add-comment-button').prop('disabled', false);
    
            // Limpiar localStorage para la próxima vez
            localStorage.removeItem('selectedVerses');
            localStorage.removeItem('storedComment');
        }
    }
});

$(document).ready(function() {
  const libro = window.location.pathname.split('/')[2];
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
            
            $(window).on('scroll', function() {
                var scrollPosition = $(window).scrollTop();
                
                if (scrollPosition > scrollThreshold) {
                    header.addClass('scrolled');
                } else {
                    header.removeClass('scrolled');
                }
            });
        } else {
            console.log("Elemento #chapter-header no encontrado.");
        }
    }

  // Mostrar/Ocultar versículos
  $(document).on('change', '#toggleVersiculos', function() {
      if ($(this).is(':checked')) {
          $('.num-versiculo').hide();
      } else {
          $('.num-versiculo').show();
      }
  });

  // Navegación entre capítulos
  $('#prev-chapter').on('click', function() {
      if (capitulo > 1) {
          window.location.href = `/biblia/${libro}/${parseInt(capitulo) - 1}`;
      }
  });

  $('#next-chapter').on('click', function() {
      window.location.href = `/biblia/${libro}/${parseInt(capitulo) + 1}`;
  });  
});

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
      },
      error: function() {
          $('#chapter-content').text('Error al cargar el capítulo.');
      }
  });

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

  // Detectar el scroll en el nombre del libro + capítulo + switch
  $(document).ready(function() {
        var header = $('#chapter-header');

        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 0) {
                header.addClass('scrolled');
                console.log("Clase 'scrolled' añadida");
            } else {
                header.removeClass('scrolled');
                console.log("Clase 'scrolled' eliminada");
            }
        });
    });
});

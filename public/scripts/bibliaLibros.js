$(document).ready(function() {
  // Filtrar libros al escribir en el buscador
  $('#book-search').on('input', function() {
      const searchQuery = $(this).val().toLowerCase();
      $('.book-card').each(function() {
          const bookName = $(this).find('.longname').text().toLowerCase();
          const shortName = $(this).find('.shortname').text().toLowerCase();
          if (bookName.includes(searchQuery) || shortName.includes(searchQuery)) {
              $(this).show();
          } else {
              $(this).hide();
          }
      });
  });

  // Redirigir al hacer clic en un libro
  $('.book-card').on('click', function() {
      const url = $(this).data('url');
      window.location.href = url;
  });

  // Efecto hover en las tarjetas
  $('.book-card').hover(
      function() {
          $(this).addClass('hovered');
      },
      function() {
          $(this).removeClass('hovered');
      }
  );
});

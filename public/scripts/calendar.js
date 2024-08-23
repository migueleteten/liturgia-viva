$(document).ready(function() {
  const calendar = $('#calendar');
  const previewContent = $('#preview-content');
  const currentDate = new Date();

  function generateCalendar(month, year) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();

      calendar.empty();

      // Generar días vacíos
      for (let i = 0; i < firstDay; i++) {
          calendar.append('<div class="day empty"></div>');
      }

      // Generar días del mes
      for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const formattedDate = date.toISOString().split('T')[0];
          const dayElement = $(`<div class="day" data-date="${formattedDate}">${day}</div>`);
          calendar.append(dayElement);
      }
  }

  calendar.on('click', '.day', function() {
      const selectedDate = $(this).data('date');
      $('.day').removeClass('selected');
      $(this).addClass('selected');

      // Solicitar la vista previa para la fecha seleccionada
      $.ajax({
          url: `/api/liturgias/${selectedDate}`,
          method: 'GET',
          success: function(data) {
              previewContent.html(data);
          },
          error: function() {
              previewContent.html('<p>No se encontraron lecturas para esta fecha.</p>');
          }
      });
  });

  generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
});

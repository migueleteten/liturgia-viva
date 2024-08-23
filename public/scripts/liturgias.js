$(document).ready(function() {
  // Obtener etiquetas de la liturgia desde un atributo de la página
  const liturgiaEtiquetas = $('#liturgia-etiquetas').data('etiquetas').replace(/[{}]/g, '').split(', ');
  console.log(liturgiaEtiquetas);

  // Secciones de la misa
  const secciones = ["entrada", "gloria", "antifona", "aleluya", "ofertorio", "santo", "paz", "comunion", "comunion-2", "comunion-3", "salida"];
  const etiquetas = liturgiaEtiquetas.map(etiqueta => encodeURIComponent(etiqueta)).join('%2C');

  // Tiempo de espera entre cada solicitud en milisegundos
  const delay = 50;

  secciones.forEach((seccion, index) => {
    setTimeout(() => {
    const url = `/api/songsLiturgy/canciones?seccion=${seccion}&etiquetas=${etiquetas}`;
    console.log('Request url: ', url);

    $.ajax({
          url: url,
          method: 'GET',
          success: function(data) {
            console.log(`Canciones para ${seccion}:`, data);  // Verifica la respuesta
            const $ul = $(`#songs-${seccion}`);
            if (data && data.length) {
                data.forEach(cancion => {
                    $ul.append(`<li>${cancion.titulo}</li>`);
                });
            } else {
              console.log(`No se encontraron canciones para ${seccion}.`);
            }
          },
          error: function(error) {
              console.error(`Error al cargar canciones para ${seccion}:`, error);
          }
      });
    }, index * delay);
  });

  // Manejar clic en las pestañas
  $('.nav-link').on('click', function (e) {
    e.preventDefault();
    
    // Quitar clase 'active' de todas las pestañas y agregarla a la pestaña seleccionada
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    
    // Ocultar todos los contenedores de sección
    $('#liturgy-container, #songs-container, #textos-apoyo-container').hide();
    
    // Mostrar el contenedor correspondiente a la pestaña seleccionada
    const section = $(this).text().trim().toLowerCase();
    if (section === 'lecturas') {
        $('#liturgy-container').show();
    } else if (section === 'canciones') {
        $('#songs-container').show();
    } else if (section === 'textos de apoyo') {
        $('#textos-apoyo-container').show();
    }
  });

  // Mostrar la sección por defecto (Canciones)
  $('#liturgy-container').show();
  $('#songs-container').hide();
});
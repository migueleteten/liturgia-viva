$(document).ready(function () {
    const calendar = $('#calendar');
    const previewContent = $('#preview-content');
    let currentDate = new Date();
    const todayButton = $('#today-button');
    const prevMonthButton = $('#prev-month-button');
    const nextMonthButton = $('#next-month-button');
    const currentMonth = $('#current-month');
    const dateForm = $('#date-form');
    const submitButton = $('#submit-button');
    const cancelButton = $('#cancel-button');

    function updateCalendarHeader() {
        currentMonth.text(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
    }

    function generateCalendar(month, year) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month, daysInMonth).getDay();
        const today = new Date(); // Fecha actual
        const todayFormatted = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

        calendar.empty();
        
        // Generar los días de la semana como encabezado
        for (let i = 0; i < weekDays.length; i++) {
            calendar.append(`<div class="day-header">${weekDays[i]}</div>`);
        }
        
        // Generar días vacíos al principio
        const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1); // Ajustar domingo (0) para ser el último día
        for (let i = 0; i < adjustedFirstDay; i++) {
            calendar.append('<div class="day empty"></div>');
        }

        // Generar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateToFormat = new Date(year, month, day + 1);
            const formattedDate = dateToFormat.toISOString().split('T')[0];
            const dayElement = $(`<div class="day" data-date="${formattedDate}">${day}</div>`);

            // Agregar clase 'past-day' si el día es anterior a hoy
            if (date < today && formattedDate !== todayFormatted) {
                dayElement.addClass('past-day');
            }

            // Agregar clase 'weekend' si el día es 6 ó 0
            if (date.getDay() === 0 || date.getDay() === 6) {
                dayElement.addClass('weekend');
            }

            // Agregar clase 'current-date' si el día es hoy
            if (formattedDate === todayFormatted) {
                dayElement.addClass('current-date');
            }

            calendar.append(dayElement);
        }

        // Generar días vacíos al final
        const emptyDaysAtEnd = (7 - lastDay) % 7; // Calcula los días vacíos necesarios
        for (let i = 0; i < emptyDaysAtEnd; i++) {
            calendar.append('<div class="day empty"></div>');
        }
    }

    function changeClassForDays() {
        $('.day').data('')
    }

    calendar.on('click', '.day', function () {
        const liturgyContainer = $('#preview-content');
        
        const selectedDate = $(this).data('date');
        $('.day').removeClass('selected');
        $(this).addClass('selected');

        // Solicitar la vista previa para la fecha seleccionada
        $.ajax({
            url: `/liturgias/${selectedDate}.html`,
            method: 'GET',
            success: function (data) {
                // Crear un contenedor temporal para manipular el html
                const tempContainer = $('<div></div>').html(data);

                // Extraer el contenido entre .reading-container y #songs-container
                const dateInfo = tempContainer.find('#fecha-fechaLiturgica').html();

                // Extraer el contenido entre .reading-container y #songs-container
                const readingContent = tempContainer.find('#liturgy-container').html();

                const content = `<h2 id="fecha-fechaLiturgica" class"container">${dateInfo || ''}</h2>${readingContent || ''}`

                // Reemplazar el contenido del contenedor de liturgia
                liturgyContainer.html(content);
            },
            error: function () {
                previewContent.html('<p>No se encontraron lecturas para esta fecha.</p>');
            }
        });
    });

    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());

    todayButton.on('click', () => {
        currentDate = new Date();
        updateCalendarHeader();
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
        const formattedDate = currentDate.toISOString().split('T')[0];
        const liturgyContainer = $('#preview-content');
        $.ajax({
            url: `/liturgias/${formattedDate}.html`,
            method: 'GET',
            success: function (data) {
                // Crear un contenedor temporal para manipular el html
                const tempContainer = $('<div></div>').html(data);

                // Extraer el contenido entre .reading-container y #songs-container
                const dateInfo = tempContainer.find('#fecha-fechaLiturgica').html();

                // Extraer el contenido entre .reading-container y #songs-container
                const readingContent = tempContainer.find('#liturgy-container').html();

                const content = `<h2 id="fecha-fechaLiturgica" class"container">${dateInfo || ''}</h2>${readingContent || ''}`

                // Reemplazar el contenido del contenedor de liturgia
                liturgyContainer.html(content);
            },
            error: function () {
                previewContent.html('<p>No se encontraron lecturas para esta fecha.</p>');
            }
        });
    });

    prevMonthButton.on('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendarHeader();
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
        dateForm.slideUp();
    });

    nextMonthButton.on('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendarHeader();
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
        dateForm.slideUp();
    });

    currentMonth.on('click', () => {
        dateForm.slideDown();
    });

    submitButton.on('click', (e) => {
        e.preventDefault();
        const day = $('#day').val();
        const month = $('#month').val() - 1;  // Convertir a índice de mes
        const year = $('#year').val();
        const liturgyContainer = $('#preview-content');

        currentDate = new Date(Date.UTC(year, month, day));
        updateCalendarHeader();
        generateCalendar(month, year);
        const formattedDate = currentDate.toISOString().split('T')[0];
        console.log(formattedDate);
        $(`.day[data-date="${formattedDate}"]`).addClass('selected');
        dateForm.css('display', 'none');
        // Solicitar la vista previa para la fecha seleccionada
        $.ajax({
            url: `/liturgias/${formattedDate}.html`,
            method: 'GET',
            success: function (data) {
                // Crear un contenedor temporal para manipular el html
                const tempContainer = $('<div></div>').html(data);

                // Extraer el contenido entre .reading-container y #songs-container
                const dateInfo = tempContainer.find('#fecha-fechaLiturgica').html();

                // Extraer el contenido entre .reading-container y #songs-container
                const readingContent = tempContainer.find('#liturgy-container').html();

                const content = `<h2 id="fecha-fechaLiturgica" class"container">${dateInfo || ''}</h2>${readingContent || ''}`

                // Reemplazar el contenido del contenedor de liturgia
                liturgyContainer.html(content);
            },
            error: function () {
                previewContent.html('<p>No se encontraron lecturas para esta fecha.</p>');
            }
        });
    });

    cancelButton.on('click', () => {
        dateForm.slideUp();
    });

    // Inicializar el calendario y el header
    updateCalendarHeader();
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    
});

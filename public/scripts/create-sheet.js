document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const orientationSelect = document.getElementById('orientation');
    const layoutSelect = document.getElementById('layout');

    // Asegurarse de que los elementos existen y que la función se llama
    console.log('orientationSelect:', orientationSelect);
    console.log('layoutSelect:', layoutSelect);

    function updateCanvas() {
        const orientation = orientationSelect.value;
        const layout = layoutSelect.value;

        // Limpiar canvas container
        canvasContainer.innerHTML = '';

        // Crear canvases según la disposición
        if (layout === '1-cara') {
            createSingleCanvas(orientation);
        } else if (layout === '2-caras') {
            if (orientation === 'vertical') {
                createSingleCanvas(orientation);  // Cara 1
                createSingleCanvas(orientation);  // Cara 2
                canvasContainer.style.display = 'flex';
            } else {
                createSingleCanvas(orientation);  // Cara 1
                createSingleCanvas(orientation);  // Cara 2
                canvasContainer.style.display = 'block';
            }
            
        } else if (layout === '4-caras') {
            if (orientation === 'vertical') {
                createDoubleCanvas(orientation);  // Cara 1 (dividida en dos)
                createDoubleCanvas(orientation);  // Cara 2 (dividida en dos)
                canvasContainer.style.display = 'flex';
            } else {
                createDoubleCanvas(orientation);  // Cara 1 (dividida en dos)
                createDoubleCanvas(orientation);  // Cara 2 (dividida en dos)
                canvasContainer.style.display = 'block';
            }
        }

        // Ajustar tamaño de fuente proporcional al tamaño del canvas
        adjustFontSize();
    }

    function createSingleCanvas(orientation) {
        const canvas = document.createElement('div');
        canvas.classList.add('canvas');
        canvas.classList.add(orientation);
        canvasContainer.appendChild(canvas);
    }

    function createDoubleCanvas(orientation) {
        const canvas = document.createElement('div');
        canvas.classList.add('canvas');
        canvas.classList.add(orientation);
        canvas.classList.add('double');

        const leftSection = document.createElement('div');
        leftSection.classList.add('section', 'left-section');
        const rightSection = document.createElement('div');
        rightSection.classList.add('section', 'right-section');

        canvas.appendChild(leftSection);
        canvas.appendChild(rightSection);
        canvasContainer.appendChild(canvas);
    }

    function adjustFontSize() {
        const canvases = document.querySelectorAll('.canvas');
        canvases.forEach(canvas => {
            const canvasWidth = canvas.clientWidth;
            canvas.style.fontSize = `${canvasWidth * 0.01}px`; // Ajusta este valor para cambiar la proporción
        });
    }

    orientationSelect.addEventListener('change', updateCanvas);
    layoutSelect.addEventListener('change', updateCanvas);

    // Inicializar con la configuración por defecto
    updateCanvas();

    // Actualizar tamaño de fuente al cambiar el tamaño de la ventana
    window.addEventListener('resize', adjustFontSize);




    
    // Funciones para arrastrar cosas
    const draggableContents = document.querySelectorAll('.draggable-content');
    const canvas = document.querySelectorAll('.canvas');

    draggableContents.forEach(item => {
        item.addEventListener('dragstart', dragStart);
    });

    canvas.forEach(canvasElement => {
        const sections = canvasElement.querySelectorAll('.half-page, .column');
        sections.forEach(section => {
            section.addEventListener('dragover', dragOver);
            section.addEventListener('drop', drop);
            section.addEventListener('click', removeContent);  // Permite eliminar contenido al hacer clic
        });
    });

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.contentId);
    }

    function dragOver(e) {
        e.preventDefault();
        e.target.classList.add('highlight');
    }

    function drop(e) {
        e.preventDefault();
        e.target.classList.remove('highlight');
        const contentId = e.dataTransfer.getData('text/plain');

        // Crear el contenedor correspondiente según el tipo de contenido
        let contentElement;
        switch (contentId) {
            case 'rectangular-text':
                contentElement = document.createElement('div');
                contentElement.classList.add('content-box', 'rectangular-text');
                contentElement.textContent = 'Texto Rectangular Ejemplo';
                break;
            case 'l-text-right-down':
            case 'l-text-right-up':
            case 'l-text-left-down':
            case 'l-text-left-up':
                contentElement = document.createElement('div');
                contentElement.classList.add('content-box', 'l-text', contentId);
                contentElement.textContent = `Texto L Ejemplo (${contentId.replace('-', ' ')})`;
                break;
            case 'image':
                contentElement = document.createElement('div');
                contentElement.classList.add('content-box', 'image-container');
                contentElement.textContent = 'Imagen Ejemplo';
                break;
            default:
                return;
        }

        // Reemplazar el contenido del div de destino
        e.target.innerHTML = '';
        e.target.appendChild(contentElement);
    }

    function removeContent(e) {
        e.target.innerHTML = '';  // Vacía el contenido del contenedor al hacer clic
    }
});

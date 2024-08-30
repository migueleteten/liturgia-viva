document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const orientationSelect = document.getElementById('orientation');
    const layoutSelect = document.getElementById('layout');

    // Funciones para arrastrar cosas
    const draggableContents = document.querySelectorAll('.draggable-content, .draggable-liturgy-content');
    console.log('Draggable Contents:', draggableContents);
    const canvas = document.querySelectorAll('.canvas');

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

        const sections = document.querySelectorAll('.whole-section, .left-section, .right-section');
        console.log('Sections:', sections);
        assignListeners(sections);
    }

    function createSingleCanvas(orientation) {
        const canvas = document.createElement('div');
        canvas.classList.add('canvas');
        canvas.classList.add(orientation);

        const wholeSection = document.createElement('div');
        wholeSection.classList.add('section', 'whole-section');

        canvas.appendChild(wholeSection);
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

    draggableContents.forEach(item => {
        console.log('Asignando dragStart a:', item);
        item.addEventListener('dragstart', dragStart);
    });

    function assignListeners(sections) {
        sections.forEach(section => {
            console.log('Asignando dragOver y drop a:', section);
            section.addEventListener('dragover', dragOver);
            section.addEventListener('drop', drop);
            section.addEventListener('dragleave', dragLeave);
        });
    }

    function dragStart(e) {
        document.querySelectorAll('.content-box').forEach(box => box.classList.remove('selected'));
        document.querySelectorAll('.expand-icon').forEach(icon => icon.remove());
        console.log('Drag started:', e.target.dataset.contentId);
        e.dataTransfer.setData('text/plain', e.target.dataset.contentId);
    }

    function dragOver(e) {
        e.preventDefault();
        console.log('Drag over:', e.target);
        e.target.classList.add('highlight');
        document.querySelectorAll('.content-box').forEach(box => box.classList.remove('selected'));
        document.querySelectorAll('.expand-icon').forEach(icon => icon.remove());
    }

    function dragLeave(e) {
        console.log('Drag leave:', e.target);
        e.target.classList.remove('highlight');  // Quitar el resaltado cuando el elemento sale del target
        document.querySelectorAll('.expand-icon').forEach(icon => icon.remove());
    }

    function drop(e) {
        document.querySelectorAll('.content-box').forEach(box => box.classList.remove('selected'));
        document.querySelectorAll('.expand-icon').forEach(icon => icon.remove());
        e.preventDefault();
        console.log('Dropped on:', e.target);
        e.target.classList.remove('highlight');
        const contentId = e.dataTransfer.getData('text/plain');
        console.log('Content ID:', contentId);

        // Verificar si el contentId corresponde a un draggable-liturgy-content
        const draggedItem = document.querySelector(`[data-content-id="${contentId}"]`);
        const exampleText = draggedItem ? draggedItem.getAttribute('data-example') : null;

        // Crear el contenedor correspondiente según el tipo de contenido
        let contentElement;

        if (exampleText) {
            // El contentId corresponde a un draggable-liturgy-content
            contentElement = document.createElement('div');
            contentElement.classList.add('text'); // o 'l-text', etc., según sea necesario
            contentElement.innerHTML = `<p>${exampleText}</p>`;
            // Reemplazar el contenido del div de destino
            e.target.appendChild(contentElement);
        } else {
            // Evitar que se inserten elementos dentro de un content-box
            if (e.target.classList.contains('content-box')) {
                return;
            }

            switch (contentId) {
                case 'rectangular-text':
                    contentElement = document.createElement('div');
                    contentElement.classList.add('content-box', 'rectangular-text');
                    break;
                case 'l-text-right-down':
                case 'l-text-right-up':
                case 'l-text-left-down':
                case 'l-text-left-up':
                    contentElement = document.createElement('div');
                    contentElement.classList.add('content-box', 'l-text', contentId);
                    break;
                case 'image':
                    contentElement = document.createElement('div');
                    contentElement.classList.add('content-box', 'image-container', contentId);
                    break;
                default:
                    // Añadir contenido a un content-box existente
                    if (e.target.classList.contains('content-box')) {
                        const draggedItem = document.querySelector(`[data-content-id="${contentId}"]`);
                        const exampleText = draggedItem.getAttribute('data-example');
                        e.target.innerHTML = `<p>${exampleText}</p>`;
                    }
                    return;
            }
            // Reemplazar el contenido del div de destino
            e.target.appendChild(contentElement);
        }

        // Añadir evento de selección al nuevo content-box
        contentElement.addEventListener('click', selectContentBox);

        // Habilitar arrastre en el nuevo content-box
        enableDragging(contentElement);
    }

    function selectContentBox(e) {
        // Remover la clase 'selected' de cualquier otro content-box
        document.querySelectorAll('.content-box').forEach(box => box.classList.remove('selected'));
    
        // Verificar si el elemento clicado es un content-box o un hijo de content-box
        let contentBox = e.target.closest('.content-box');
        
        if (!contentBox) {
            console.error('El elemento clicado no es un content-box');
            return; // Salir si no se ha clicado un content-box
        }
    
        // Agregar la clase 'selected' al content-box clicado
        contentBox.classList.add('selected');
    
        // Asegurarse de que el contentBox tenga un id
        if (!contentBox.id) {
            contentBox.id = 'content-box-' + Date.now(); // Generar un id único basado en la fecha
        }
    
        // Mostrar los iconos de expansión
        showExpandIcons(contentBox);
    }
    
    function showExpandIcons(contentBox) {
        requestAnimationFrame(() => {
            // Remover cualquier icono previo
            document.querySelectorAll('.expand-icon').forEach(icon => icon.remove());
        
            // Definir el tamaño y posición de los iconos
            const iconSize = '20px';
        
            // Crear iconos de expansión
            const sides = ['top', 'right', 'bottom', 'left'];
            sides.forEach(pos => {
                const icon = document.createElement('i');
                icon.classList.add('expand-icon', `bi`, `bi-arrows-expand${pos === 'left' || pos === 'right' ? '-vertical' : ''}`, pos);
                icon.style.position = 'absolute';

                // Insertar el icono en el content-box
                contentBox.appendChild(icon);
                // Agregar los listeners de redimensionamiento
                addResizeListeners(icon, contentBox);      
            });
        });
    }

    document.addEventListener('click', function (e) {
        // Verifica si el clic fue fuera de un content-box
        if (!e.target.closest('.content-box')) {
            // Elimina la clase 'selected' de todos los content-box
            document.querySelectorAll('.content-box').forEach(box => {
                box.classList.remove('selected');
                // Elimina todos los iconos de expansión
                const icons = box.querySelectorAll('.expand-icon');
                icons.forEach(icon => icon.remove());
            });

        }
    });

    let isResizing = false; // Variable para controlar si se está redimensionando

    function enableDragging(contentBox) {
        let offsetX, offsetY;
    
        contentBox.addEventListener('mousedown', (e) => {
            if (!contentBox.classList.contains('selected') || isResizing) return;
    
            // Obtener la posición inicial del contentBox en relación con la pantalla
            const rect = contentBox.getBoundingClientRect();
    
            // Calcular el desplazamiento inicial del mouse en relación con el contentBox
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
    
            // Añadir eventos para mover el content-box
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    
        function onMouseMove(e) {
            if (isResizing) return; // Evitar mover el content-box si se está redimensionando

            const rect = contentBox.getBoundingClientRect();
            // Calcular nuevas coordenadas del content-box en relación con la pantalla
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
    
            // Obtener el contenedor padre más cercano con posición relativa o absoluta
            const container = contentBox.offsetParent;
            const containerRect = container.getBoundingClientRect();
    
            // Calcular los límites del contenedor
            const minLeft = containerRect.left;
            const minTop = containerRect.top;
            const maxLeft = containerRect.width - rect.width;
            const maxTop = containerRect.height - rect.height;
    
            // Ajustar la posición del content-box para que no salga del contenedor
            const adjustedLeft = Math.min(Math.max(newLeft, containerRect.left), containerRect.left + maxLeft);
            const adjustedTop = Math.min(Math.max(newTop, containerRect.top), containerRect.top + maxTop);

            // Aplicar la nueva posición
            contentBox.style.position = 'absolute';
            contentBox.style.left = `${adjustedLeft - containerRect.left}px`;
            contentBox.style.top = `${adjustedTop - containerRect.top}px`;
        }
    
        function onMouseUp() {
            // Quitar los eventos cuando se suelte el mouse
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
    
    function calculateSnapAndShowGuides(position, size, containerRect) {
        const snapDistance = containerRect.width * 0.01; // 1% del ancho del contenedor como distancia de snap
        let snappedPosition = { ...position };
        
        // Verificar si se debe hacer snap al borde izquierdo
        if (Math.abs(position.left) < snapDistance) {
            snappedPosition.left = 0;
            showGuide('vertical', 0);
        } else if (Math.abs(position.left + size.width - containerRect.width) < snapDistance) {
            // Snap al borde derecho
            snappedPosition.left = containerRect.width - size.width;
            showGuide('vertical', containerRect.width);
        }
    
        // Verificar si se debe hacer snap al borde superior
        if (Math.abs(position.top) < snapDistance) {
            snappedPosition.top = 0;
            showGuide('horizontal', 0);
        } else if (Math.abs(position.top + size.height - containerRect.height) < snapDistance) {
            // Snap al borde inferior
            snappedPosition.top = containerRect.height - size.height;
            showGuide('horizontal', containerRect.height);
        }
    
        // Ocultar las guías si no hay "snap"
        if (snappedPosition.left === position.left) {
            hideGuide('vertical');
        }
        if (snappedPosition.top === position.top) {
            hideGuide('horizontal');
        }
    
        return snappedPosition;
    }
    
    function showGuide(direction, position) {
        let guide = document.querySelector(`.snap-guide.${direction}`);
        if (!guide) {
            guide = document.createElement('div');
            guide.classList.add('snap-guide', direction);
            document.querySelector('.canvas').appendChild(guide);
        }
        if (direction === 'vertical') {
            guide.style.left = `${position}px`;
            guide.style.height = '100%';
        } else {
            guide.style.top = `${position}px`;
            guide.style.width = '100%';
        }
        guide.style.display = 'block';
    }
    
    function hideGuide(direction) {
        const guide = document.querySelector(`.snap-guide.${direction}`);
        if (guide) {
            guide.style.display = 'none';
        }
    }

    // Asegúrate de que cada content-box pueda ser arrastrado
    document.querySelectorAll('.content-box').forEach(enableDragging);
  
    function addResizeListeners(icon, contentBox) {
        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true; // Indicar que se está redimensionando
            
            const initialRect = contentBox.getBoundingClientRect();
            const startX = e.clientX;
            const startY = e.clientY;
    
            document.addEventListener('mousemove', resizeContentBox);
            document.addEventListener('mouseup', stopResizing);
    
            function resizeContentBox(e, direction) {
                const container = contentBox.offsetParent;
                const containerRect = container.getBoundingClientRect();
                
                if (icon.classList.contains('top')) {
                    const newHeight = initialRect.height + (startY - e.clientY);
                    const newTop = initialRect.top - (startY - e.clientY);
                    if (newTop >= containerRect.top && newHeight >= 20) {
                        contentBox.style.height = `${newHeight}px`;
                        contentBox.style.top = `${newTop - containerRect.top}px`;
                    }
                } else if (icon.classList.contains('bottom')) {
                    const newHeight = initialRect.height + (e.clientY - startY);
                    if (newHeight >= 20 && newHeight + initialRect.top <= containerRect.bottom) {
                        contentBox.style.height = `${newHeight}px`;
                        contentBox.style.top = `${initialRect.top - containerRect.top}px`; // Mantener la posición superior
                    }
                } else if (icon.classList.contains('left')) {
                    const newWidth = initialRect.width + (startX - e.clientX);
                    const newLeft = initialRect.left - (startX - e.clientX);
                    if (newLeft >= containerRect.left && newWidth >= 20) {
                        contentBox.style.width = `${newWidth}px`;
                        contentBox.style.left = `${newLeft - containerRect.left}px`;
                    }
                } else if (icon.classList.contains('right')) {
                    const newWidth = initialRect.width + (e.clientX - startX);
                    if (newWidth >= 20 && newWidth + initialRect.left <= containerRect.right) {
                        contentBox.style.width = `${newWidth}px`;
                        contentBox.style.left = `${initialRect.left - containerRect.left}px`; // Mantener la posición izquierda
                    }
                }

                // Calcular nuevas posiciones y tamaño del content-box
                const newPos = calculateSnapAndShowGuides({ left: newLeft, top: newTop }, { width: newWidth, height: newHeight });

                // Aplicar las nuevas posiciones y tamaño ajustados por el "snap"
                contentBox.style.left = `${newPos.left - containerRect.left}px`;
                contentBox.style.top = `${newPos.top - containerRect.top}px`;
                contentBox.style.width = `${newWidth}px`;
                contentBox.style.height = `${newHeight}px`;
            }
    
            function stopResizing() {
                isResizing = false; // Terminar el redimensionamiento
                document.removeEventListener('mousemove', resizeContentBox);
                document.removeEventListener('mouseup', stopResizing);
            }
        });
    }

    function resizeContentBox(e) {
        const container = contentBox.offsetParent;
        const containerRect = container.getBoundingClientRect();
        
        if (icon.classList.contains('top')) {
            const newHeight = initialRect.height + (startY - e.clientY);
            const newTop = initialRect.top - (startY - e.clientY);
            if (newTop >= containerRect.top && newHeight >= 20) {  // Min height of 20px
                contentBox.style.height = `${newHeight}px`;
                contentBox.style.top = `${newTop}px`;
            }
        } else if (icon.classList.contains('bottom')) {
            const newHeight = initialRect.height + (e.clientY - startY);
            if (newHeight >= 20 && newHeight + initialRect.top <= containerRect.bottom) {
                contentBox.style.height = `${newHeight}px`;
            }
        } else if (icon.classList.contains('left')) {
            const newWidth = initialRect.width + (startX - e.clientX);
            const newLeft = initialRect.left - (startX - e.clientX);
            if (newLeft >= containerRect.left && newWidth >= 20) {  // Min width of 20px
                contentBox.style.width = `${newWidth}px`;
                contentBox.style.left = `${newLeft}px`;
            }
        } else if (icon.classList.contains('right')) {
            const newWidth = initialRect.width + (e.clientX - startX);
            if (newWidth >= 20 && newWidth + initialRect.left <= containerRect.right) {
                contentBox.style.width = `${newWidth}px`;
            }
        }
    }
    

    function removeContent(e) {
        e.target.innerHTML = '';  // Vacía el contenido del contenedor al hacer clic
    }
    
});

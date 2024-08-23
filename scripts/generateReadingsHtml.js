const fs = require('fs');
const path = require('path');
const db = require('../src/config/dbConfig');

async function generateLiturgiasHtml() {
    try {
        const liturgias = await db.query('SELECT * FROM liturgias_nuevo ORDER BY fecha ASC');
        let generatedCount = 0; // Contador para archivos generados

        for (const liturgia of liturgias.rows) {
            // Construcción del head
            const title = `${liturgia.nombre_fecha} - Liturgia del día`;
            const description = `Lecturas para la liturgia del ${liturgia.fecha_liturgica}`;
            const keywords = `Liturgia, Lecturas, ${liturgia.nombre_fecha}, ${liturgia.fecha_liturgica}`;
            const formattedDate = formatDateForFilename(new Date(liturgia.fecha));
            const fileName = `${formattedDate}.html`;
            const headerTemplate = fs.readFileSync(path.join(__dirname, '../src/views/templates/header.html'), 'utf8');

            const head = `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${title}</title>
                        <meta name="description" content="${description}">
                        <meta name="keywords" content="${keywords}">
                        <meta name="author" content="Liturgia Viva">

                        <!-- Open Graph / Facebook -->
                        <meta property="og:type" content="article">
                        <meta property="og:title" content="${title}">
                        <meta property="og:description" content="${description}">
                        <meta property="og:image" content="https://www.liturgiaviva.org/images/liturgia-${liturgia.fecha}.jpg">
                        <meta property="og:url" content="https://www.liturgiaviva.org/liturgias/${fileName}">

                        <!-- Twitter -->
                        <meta name="twitter:card" content="summary_large_image">
                        <meta name="twitter:title" content="${title}">
                        <meta name="twitter:description" content="${description}">
                        <meta name="twitter:image" content="https://www.liturgiaviva.org/images/liturgia-${liturgia.fecha}.jpg">

                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
                        <link rel="stylesheet" href="/styles/liturgia.css">
                        <link rel="stylesheet" href="/styles/common.css">
                        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                        <link href="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap-switch-button@1.1.0/css/bootstrap-switch-button.min.css" rel="stylesheet">
                    </head>
                `;

            const header = '<!-- Header Común --><div id="header-placeholder">' + headerTemplate + '</div>';
            const htmlContent = await generateHtmlForLiturgia(liturgia, head, header);
            const filePath = path.join(__dirname, '../src/views/pages/liturgias', fileName);

            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, htmlContent, 'utf8');
            generatedCount++;

            if (generatedCount >= 90) { // Detener después de 20 archivos
                break;
            }
        }

        console.log(`Generados ${generatedCount} archivos HTML de ejemplo correctamente.`);
    } catch (err) {
        console.error('Error al generar los archivos HTML:', err);
    }
}

function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateFriendlyUrl(name) {
    // Mapa de reemplazo para caracteres acentuados
    const map = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u',
        'ü': 'u',
        'ñ': 'n',
        'ç': 'c',
        'Á': 'a',
        'É': 'e',
        'Í': 'i',
        'Ó': 'o',
        'Ú': 'u',
        'Ü': 'u',
        'Ñ': 'n',
        'Ç': 'c'
    };

    // Reemplazar caracteres acentuados
    const sanitizedString = name.split('').map(char => map[char] || char).join('');

    // Convertir a minúsculas, reemplazar caracteres no alfanuméricos por guiones y eliminar guiones sobrantes
    return sanitizedString
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Reemplaza caracteres no alfanuméricos por guiones
        .replace(/^-+|-+$/g, '');     // Elimina guiones al principio o al final
}

async function generateHtmlForLiturgia(liturgia, head, header) {
    const lecturas = await db.query('SELECT * FROM lecturas_nuevo WHERE liturgia_id = $1 ORDER BY grupo, id', [liturgia.id]);

    let html = head;

    html += '<body>';

    html += header;

    html += `<h1 id="fecha-fechaLiturgica" class="container">Lecturas del <span id="nombre-fecha">${liturgia.nombre_fecha}</span><br><span id="nombre-fecha-liturgica">${liturgia.fecha_liturgica}</span></h1>`;

    html += '<div id="liturgia-etiquetas" style="display: none;" data-etiquetas="' + liturgia.etiquetas.trim() + '"></div>';

    // Tab para alternar entre Lecturas, Canciones y Textos de apoyo
    html += `<ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Lecturas</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Canciones</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Textos de apoyo</a>
                </li>
            </ul>
    `;
    
    // Iniciar el contenedor de la liturgia
    html += '<div id="liturgy-container" class="container">';

    if (liturgia.fecha_liturgica === 'Natividad del Señor') {
        html += generateHtmlForNatividadDelSenor(lecturas.rows);
    } else {
        html += generateHtmlForRegularLiturgia(lecturas.rows);
    }

    html += '</div>';

    // Incluir la sección dinámica de canciones
    html += generateDynamicSectionForLiturgia();

    // Incluir el script para manejar la carga dinámica
    html += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>'
    html += '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>'
    html += `<script src="/scripts/liturgias.js"></script>`;
    html += `<script src="/scripts/common.js"></script>`;

    html += `</body></html>`;
    return html;
}

function generateHtmlForNatividadDelSenor(lecturas) {
    const groups = [
        { id: "mass-type-1", name: "Misa de la vigilia", startGroups: [1, 2, 3, 4] },
        { id: "mass-type-2", name: "Misa de media noche", startGroups: [4, 5, 6, 7] },
        { id: "mass-type-3", name: "Misa de la aurora", startGroups: [7, 8, 9, 10] },
        { id: "mass-type-4", name: "Misa del día", startGroups: [10, 11, 12, 13] }
    ];

    let html = '';
    let lecturaIndex = 0; // Índice para seguir las lecturas procesadas

    groups.forEach((group, groupIndex) => {
        html += `<p class="mass-indicator">${group.name}</p>`;

        let readingCounter = 1; // Reiniciar contador de lecturas para cada grupo

        group.startGroups.forEach(groupNumber => {
            html += `<div class="reading-container container"><div id="${group.id}">`;
            // Encontrar la lectura específica para este grupo y este índice
            const lectura = lecturas.find((lectura, index) => lectura.grupo === groupNumber && index >= lecturaIndex);
            if (lectura) {
                const readingIndicator = getReadingIndicatorForNatividad(readingCounter, lectura.ref_biblia);
                html += `<h2 id="reading-indicator_${groupNumber}" class="reading-indicator">${readingIndicator}</h2>`;
                html += `<i class="reading-reference">${lectura.ref_biblia}</i>`;
                if (lectura.ref_biblia.startsWith('Salmo')) {
                    html += `<h3 class="salmo-respuesta">${lectura.resumen}</h3>`;
                }
                const processedContent = processContent(lectura.contenido, lectura.ref_biblia);
                html += `<div class="reading-${readingCounter}">${processedContent}</div>`;
                if (!lectura.ref_biblia.startsWith('Salmo') && !lectura.ref_biblia.startsWith('Interleccional')) {
                    readingCounter++;
                }
                lecturaIndex = lecturas.indexOf(lectura) + 1; // Actualizar el índice de la lectura procesada
            }
            html += '</div></div>';
        });

    });

    return html;
}

function getReadingIndicatorForNatividad(readingCounter, refBiblia) {
    if (refBiblia.startsWith('Salmo')) return 'Salmo responsorial';
    if (['Marcos', 'Mateo', 'Lucas', 'Juan'].some(evangelio => refBiblia.startsWith(evangelio))) {
        return 'Evangelio';
    }
    return ordinalText(readingCounter) + ' lectura';
}

function generateHtmlForRegularLiturgia(lecturas) {
    let html = '';

    let currentGroup = -1;
    let readingCounter = 0; // Contador de lecturas normales
    let optionCount = 0;

    lecturas.forEach((lectura, index) => {
        html += '<div class="reading-container container">'
        if (lectura.grupo !== currentGroup) {
            currentGroup = lectura.grupo;
            optionCount = 1;  // Reset option count for new group

            // Incrementar el contador de lecturas normales solo si no es Salmo o Interleccional
            if (!lectura.ref_biblia.startsWith('Salmo') && !lectura.ref_biblia.startsWith('Interleccional')) {
                readingCounter++;
            }

            const readingIndicator = getReadingIndicator(lectura, currentGroup, readingCounter);
            html += `<h2 id="reading-indicator_${currentGroup}" class="reading-indicator">${readingIndicator}</h2>`;
        } else {
            optionCount++;
            html += `<i class="reading-group-separator">O bien:</i>`;
        }

        const optionClass = `reading-${currentGroup} option-${optionCount}`;
        html += `<div class="${optionClass}">`;
        html += `<i class="reading-reference">${lectura.ref_biblia}</i>`;

        if (lectura.ref_biblia.startsWith('Salmo')) {
            html += `<h3 class="salmo-respuesta">${lectura.resumen}</h3>`;
        }

        // Procesar el contenido de la lectura según el tipo
        const processedContent = processContent(lectura.contenido, lectura.ref_biblia);
        html += processedContent;

        html += `</div></div>`;
    });

    return html;
}

function getReadingIndicator(lectura, group, readingCounter) {
    if (lectura.ref_biblia.startsWith('Salmo')) return 'Salmo responsorial';
    if (lectura.ref_biblia.startsWith('Interleccional')) return 'Interleccional';
    if (['Marcos', 'Mateo', 'Lucas', 'Juan'].some(evangelio => lectura.ref_biblia.startsWith(evangelio))) {
        return 'Evangelio';
    }
    return ordinalText(readingCounter) + ' lectura';
}

function ordinalText(number) {
    const ordinals = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Novena', 'Décima', 'Decimoprimera', 'Decimosegunda', 'Decimotercera'];
    return ordinals[number - 1] || `${number}ª`;
}

// Función para procesar el contenido de las lecturas
function processContent(content, refBiblia) {
    // Eliminar etiquetas <p> y </p>
    let cleanContent = content.replace(/<\/?p>/g, '').replace(/\s\s+/g, ' ').replace(/\//g, '').trim();

    if (refBiblia.startsWith('Salmo') || refBiblia.startsWith('Interleccional')) {
        // Procesar salmos dividiendo en partes por "R."
        return cleanContent.split(/(R\.)/).map(part => {
            return part === 'R.' ? `<p class="r">${part}</p>` : `<p>${part.trim()}</p>`;
        }).join('');
    } else {
        // Para otras lecturas, envolver el contenido en una sola <p>
        return `<p>${cleanContent}</p>`;
    }
}

function generateDynamicSectionForLiturgia(liturgia, etiquetas) {
    let html = `<div id="songs-container" class="songs-container container">`;
    const secciones = [
        "Entrada", "Gloria", "Antífona", "Aleluya", "Ofertorio", 
        "Santo", "Paz", "Comunión", "Comunión 2", "Comunión 3", "Salida"
    ];

    secciones.forEach(seccion => {
        html += `<div class="song-section">
                    <h3>${seccion}</h3>
                    <ul id="songs-${generateFriendlyUrl(seccion)}"></ul>
                 </div>`;
    });

    html += `</div>`;
    return html;
}

generateLiturgiasHtml();
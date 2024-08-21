const fs = require('fs');
const path = require('path');
const db = require('../src/config/dbConfig'); // Ajusta según la configuración de tu base de datos

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

async function generateHTMLFiles() {
  try {
    // Consulta para obtener los capítulos desde la vista materializada
    const chapters = await db.query(`
            SELECT b.libro_id, b.capitulo, b.capitulo_html, l.longname, l.orden_biblia
            FROM biblia_capitulos_completos b
            JOIN libros l ON b.libro_id = l.orden_biblia
            ORDER BY b.libro_id, b.capitulo
        `);

    // Cargar el header común desde el archivo
    const headerTemplate = fs.readFileSync(path.join(__dirname, '../src/views/templates/header.html'), 'utf-8');

    // Agrupar capítulos por libro
    const books = {};
    chapters.rows
      .forEach(chapter => {
      if (!books[chapter.libro_id]) {
        books[chapter.libro_id] = {
          longname: chapter.longname,
          chapters: []
        };
      }
      books[chapter.libro_id].chapters.push(chapter);
    });

    // Generar archivos HTML para cada capítulo
    const bookKeys = Object.keys(books);
    
    bookKeys.forEach((libroId, bookIndex) => {
      const book = books[libroId];
      const bookUrl = generateFriendlyUrl(book.longname);

      book.chapters.forEach((chapter, index) => {
        // Generar el nombre del archivo HTML para el capítulo
        const filename = `${bookUrl}-${chapter.capitulo}.html`;
        const description = `${book.longname}, capítulo ${chapter.capitulo}.`;  // Meta description

        // Determinar URLs de navegación previa y siguiente
        let prevChapterUrl = '#';
        let nextChapterUrl = '#';
        let prevButtonText = '<';
        let nextButtonText = '>';

        // Lógica para determinar la URL y el texto del botón anterior
        if (index > 0) {
            // Capítulos anteriores en el mismo libro
            prevChapterUrl = `/biblia/capitulos/${bookUrl}-${book.chapters[index - 1].capitulo}.html`;
        } else if (bookIndex > 0) {
            // Primer capítulo del libro actual: Ir al último capítulo del libro anterior
            const prevBook = books[bookKeys[bookIndex - 1]];
            const prevBookUrl = generateFriendlyUrl(prevBook.longname);
            const prevBookLastChapter = prevBook.chapters[prevBook.chapters.length - 1].capitulo;
            prevChapterUrl = `/biblia/capitulos/${prevBookUrl}-${prevBookLastChapter}.html`;
            prevButtonText = `Ir a ${prevBook.longname}, capítulo ${prevBookLastChapter}`;
        }

        // Lógica para determinar la URL y el texto del botón siguiente
        if (index < book.chapters.length - 1) {
            // Capítulos siguientes en el mismo libro
            nextChapterUrl = `/biblia/capitulos/${bookUrl}-${book.chapters[index + 1].capitulo}.html`;
        } else if (bookIndex < bookKeys.length - 1) {
            // Último capítulo del libro actual: Ir al primer capítulo del siguiente libro
            const nextBook = books[bookKeys[bookIndex + 1]];
            const nextBookUrl = generateFriendlyUrl(nextBook.longname);
            nextChapterUrl = `/biblia/capitulos/${nextBookUrl}-1.html`;
            nextButtonText = `Ir a ${nextBook.longname}, capítulo 1`;
        }        

        // Generar los botones de capítulos
        const chapterButtons = book.chapters.map(chap => `
                    <button class="btn btn-primary" onclick="location.href='/biblia/capitulos/${bookUrl}-${chap.capitulo}.html'">${chap.capitulo}</button>
                `).join('');

        // Generar el contenido HTML completo
        const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${book.longname} - Capítulo ${chapter.capitulo}</title>
                    <meta name="description" content="${description}">
                    <meta name="keywords" content="Biblia, ${book.longname}, Capítulo ${chapter.capitulo}, ${chapter.longname}">
                    <meta name="author" content="Liturgia Viva">
                    
                    <!-- Open Graph / Facebook -->
                    <meta property="og:type" content="article">
                    <meta property="og:title" content="${book.longname} - Capítulo ${chapter.capitulo}">
                    <meta property="og:description" content="${description}">
                    <meta property="og:image" content="https://www.liturgiaviva.org/images/${bookUrl}-${chapter.capitulo}.jpg">
                    <meta property="og:url" content="https://www.liturgiaviva.org/biblia/capitulos/${filename}">

                    <!-- Twitter -->
                    <meta name="twitter:card" content="summary_large_image">
                    <meta name="twitter:title" content="${book.longname} - Capítulo ${chapter.capitulo}">
                    <meta name="twitter:description" content="${description}">
                    <meta name="twitter:image" content="https://www.liturgiaviva.org/images/${bookUrl}-${chapter.capitulo}.jpg">
                    
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
                    <link rel="stylesheet" href="/styles/biblia.css">
                    <link rel="stylesheet" href="/styles/common.css">
                    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                    <link href="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap-switch-button@1.1.0/css/bootstrap-switch-button.min.css" rel="stylesheet">
                </head>
                <body>
                    <!-- Header Común -->
                    <div id="header-placeholder">${headerTemplate}</div>

                    <!-- Mensaje de sugerencia para añadir comentarios -->
                    <div id="mensaje-comentarios">
                        <p class="text-left">¿Sabías que puedes añadir comentarios a los versículos?</p>
                        <p class="text-left">Haz clic en cualquier versículo y haz tuya esta Biblia.</p>
                        <br>
                        <p class="text-center font-italic font-weight-light">Haz clic aquí para cerrar este mensaje.</p>
                    </div>

                    <!-- Contenido del capítulo -->
                    <div class="container">
                        <div id="content-comments-container">
                            <div id="chapter-content">
                                ${chapter.capitulo_html}
                            </div>
                            <!-- Panel para comentarios -->
                            <div id="comment-panel" class="comment-panel">
                                <h4>Versículos seleccionados</h4>
                                <div id="selected-verses"></div>
                                <div id="comment-buttons">
                                    <button id="add-comment-button" class="btn btn-primary" disabled><i class="fas fa-comment-dots"></i> Añadir comentario</button>
                                    <button id="cancel-comment-button" class="btn btn-primary"><i class="bi bi-x"></i> Cancelar</button>
                                </div>
                                <div id="comment-box" style="display: none;">
                                    <textarea id="comment-text" class="form-control" rows="3" placeholder="Escribe tu comentario aquí..."></textarea>
                                    <button id="save-comment-button" class="btn btn-success mt-2">Guardar comentario</button>
                                    <span id="comment-status" class="text-success mt-2" style="display: none;"></span>
                                    <div id="comment-links" class="mt-2" style="display: none;">
                                        <a href="/biblia/mis-comentarios">Ver mis comentarios</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Navegación entre capítulos -->
                        <div class="navigation d-flex justify-content-center">
                            <button id="prev-chapter" class="btn btn-primary" onclick="location.href='${prevChapterUrl}'">${prevButtonText}</button>
                            <div class="chapter-navigation scroll-horizontal">
                                ${chapterButtons}
                            </div>
                            <button id="next-chapter" class="btn btn-primary" onclick="location.href='${nextChapterUrl}'">${nextButtonText}</button>
                        </div>
                    </div>

                    <!-- Scripts -->
                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                    <script src="/scripts/common.js"></script>
                    <script src="/scripts/biblia.js"></script>
                </body>
                </html>
                `;

        // Guardar el archivo HTML
        fs.writeFileSync(path.join(__dirname, '../src/views/pages/biblia/capitulos', filename), htmlContent);
        console.log(`Archivo generado: ${filename}`);
      });
    });

    console.log('Todos los archivos HTML han sido generados.');
  } catch (error) {
    console.error('Error al generar los archivos HTML:', error);
  }
}

generateHTMLFiles();

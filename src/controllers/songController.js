const db = require('../config/dbConfig');
const axios = require('axios');
const OpenAI = require("openai");
const Papa = require("papaparse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getAllSongs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM canciones');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSongById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM canciones WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    const lineas = await db.query('SELECT * FROM lineas_canciones WHERE cancion_id = $1', [id]);
    res.status(200).json({ ...result.rows[0], lineas: lineas.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createSong = async (req, res) => {
  const { titulo, secciones, etiquetas, autor_letra, autor_musica, contenido } = req.body;
  if (!titulo || !secciones) {
    return res.status(400).json({ error: 'Título y secciones son obligatorios' });
  }
  try {
    const songResult = await db.query(
      'INSERT INTO canciones (titulo, secciones, etiquetas, autor_letra, autor_musica) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, secciones, etiquetas, autor_letra, autor_musica]
    );
    const cancion_id = songResult.rows[0].id;

    const lineasPromises = contenido.map(linea => db.query(
      'INSERT INTO lineas_canciones (cancion_id, tipo_linea, parte_cancion, contenido) VALUES ($1, $2, $3, $4)',
      [cancion_id, linea.tipo_linea, linea.parte_cancion, linea.contenido]
    ));
    await Promise.all(lineasPromises);

    res.status(201).json(songResult.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Código de error para clave duplicada
      // Ajustar la secuencia para la tabla canciones
      try {
        await db.query(
          'SELECT setval(\'canciones_id_seq\', (SELECT MAX(id) FROM canciones) + 1);'
        );
        // Intentar de nuevo la inserción
        const songResult = await db.query(
          'INSERT INTO canciones (titulo, secciones, etiquetas, autor_letra, autor_musica) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [titulo, secciones, etiquetas, autor_letra, autor_musica]
        );
        const cancion_id = songResult.rows[0].id;

        const lineasPromises = contenido.map(linea => db.query(
          'INSERT INTO lineas_canciones (cancion_id, tipo_linea, parte_cancion, contenido) VALUES ($1, $2, $3, $4)',
          [cancion_id, linea.tipo_linea, linea.parte_cancion, linea.contenido]
        ));
        await Promise.all(lineasPromises);

        res.status(201).json(songResult.rows[0]);
      } catch (innerErr) {
        res.status(500).json({ error: innerErr.message });
      }
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

const updateSong = async (req, res) => {
  const { id } = req.params;
  const { titulo, secciones, etiquetas, autor_letra, autor_musica, contenido } = req.body;
  try {
    const result = await db.query(
      'UPDATE canciones SET titulo = $1, secciones = $2, etiquetas = $3, autor_letra = $4, autor_musica = $5 WHERE id = $6 RETURNING *',
      [titulo, secciones, etiquetas, autor_letra, autor_musica, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    await db.query('DELETE FROM lineas_canciones WHERE cancion_id = $1', [id]);
    const lineasPromises = contenido.map(linea => db.query(
      'INSERT INTO lineas_canciones (cancion_id, tipo_linea, parte_cancion, contenido) VALUES ($1, $2, $3, $4)',
      [id, linea.tipo_linea, linea.parte_cancion, linea.contenido]
    ));
    await Promise.all(lineasPromises);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero, eliminar las líneas de canciones asociadas
    await db.query('DELETE FROM lineas_canciones WHERE cancion_id = $1', [id]);

    // Luego, eliminar la canción
    const result = await db.query('DELETE FROM canciones WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    res.status(200).json({ message: 'Canción eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const convertSong = async (req, res) => {
  const { texto } = req.body;
  const prompt = `
    Eres un experto en la conversión de canciones con acordes desde un formato de texto a un formato de tabla.
    Tu principal tarea es estructurar cada línea de la canción en una tabla CSV y clasificar las líneas resultantes.
    El contenido de cada línea debe quedar intacto, sin interpretación alguna. Esto es especialmente crítico cuando hay varios acordes en una misma línea

    Aquí está la canción:
    ${texto}

    1. Primera columna: Clasificación de Líneas:
    - Título: 't'
    - Indicación de cejilla (ejemplo: '(c.2)'): 'c'
    - Letra: 'l'
    - Notas de acordes: 'n'
    - Espacio en blanco: 'x'
    - Eco, normalmente línea entre paréntesis: 'e'
    - Final: 'f'

    2. Segunda columna: Clasificación de Partes de la Canción:
    - Estrofas: 'f1', 'f2', 'f3', etc.
    - Puentes (partes que se repiten antes del estribillo, sin ser propiamente estribillo): 'p1', 'p2', 'p3', etc
    - Estribillo: 'e'

    3. Tercera columna: Contenido: Sustituir los espacios por '_' para poder interpretarlos después, sin eliminar ninguno.
    
    Coloca los mismos acordes de la primera estrofa en aquellas estrofas que no los tengan.
    Es fundamental que devuelvas exclusivamente la tabla CSV, sin explicación alguna, puesto que tu respuesta será posteriormente transformada a formato json. Evita incluir los encabezados (Columna A, Columna B etc).
    Es fundamental también que cada campo esté entre comillas dobles ("") para manejar correctamente las comas en los datos y que utilices comas como delimitadores. Evita incluir comillas dobles adicionales.

    Ejemplo de Salida:
    "n","f1","DO__________________SOL"
    "l","f1","Tengo_sed_de_Ti"
    "n","f1","____________FA"
    "l","f1","Mi_Señor"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    console.log('Response from OpenAI:', JSON.stringify(response, null, 2));

    if (response && response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
      let estructura = response.choices[0].message.content;

      // Eliminar bloques de código y caracteres extraños
      estructura = estructura.replace(/```csv\n/, '').replace(/\n```$/, '').trim();

      // Convertir "_" de vuelta a espacios
      estructura = estructura.replace(/_/g, ' ');

      // Asegurarse de que las comillas dobles sean consistentes y que cada fila tenga tres campos
      estructura = estructura.split('\n').map(line => {
        const fields = line.split('","').map(field => field.replace(/(^"|"$)/g, '')); // Remover comillas en exceso
        while (fields.length < 3) {
          fields.push(''); // Añadir campos vacíos si faltan
        }
        return `"${fields.join('","')}"`; // Reensamblar la línea con comillas y comas
      }).join('\n');

      console.log('CSV Data Attempted to Parse:', estructura);

      // Convertir CSV a JSON usando PapaParse
      const parsed = Papa.parse(estructura, {
        header: false, // No usar el encabezado del CSV
        skipEmptyLines: true,
        quoteChar: '"',
        delimiter: ",",
        dynamicTyping: true
      });

      if (parsed.errors.length) {
        console.error('CSV Parsing Errors:', parsed.errors);
        return res.status(500).json({ error: 'Error parsing CSV response' });
      }

      // Mapear los campos a nombres más claros
      const mappedData = parsed.data.map(row => ({
        'tipo_linea': row[0] || '',
        'parte_cancion': row[1] || '',
        'contenido': row[2] || ''
      }));

      res.status(200).json({ estructura: mappedData });
    } else {
      res.status(500).json({ error: 'Invalid response from OpenAI API' });
    }
  } catch (err) {
    console.error('Error during OpenAI API request:', err.message);
    if (err.response) {
      console.error('API response status:', err.response.status);
      console.error('API response data:', err.response.data);
    }
    res.status(500).json({ error: err.message });
  }
};

const suggestTags = async (req, res) => {
  const { texto } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: `Sugiere etiquetas para el siguiente texto de canción: ${texto}`,
      max_tokens: 50,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const etiquetas = response.data.choices[0].text.trim().split(',').map(e => e.trim());
    res.status(200).json({ etiquetas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para buscar autores
const searchAutores = async (req, res) => {
  const { term } = req.query;
  try {
    const result = await db.query(
      'SELECT id, nombre FROM autores WHERE unaccent(lower(nombre)) ILIKE unaccent(lower($1)) LIMIT 10',
      [`%${term}%`]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para buscar etiquetas
const searchEtiquetas = async (req, res) => {
  const { term } = req.query;
  try {
    const result = await db.query(
      'SELECT id, etiqueta FROM etiquetas WHERE unaccent(lower(etiqueta)) ILIKE unaccent(lower($1)) LIMIT 30',
      [`%${term}%`]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  convertSong,
  suggestTags,
  searchAutores,
  searchEtiquetas,
};

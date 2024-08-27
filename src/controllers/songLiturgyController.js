const db = require('../config/dbConfig');
const axios = require('axios');
const OpenAI = require("openai");
const Papa = require("papaparse");

const getSongsBySectionAndTags = async (req, res) => {
  console.log("getSongsBySectionAndTags called");  // <- Este log es crucial
    try {
        let { seccion, etiquetas } = req.query;
        const etiquetasArray = etiquetas.split(',');
  
        console.log('Sección:', seccion);
        console.log('Etiquetas:', etiquetasArray);

        // Asegúrate de que el array esté formateado correctamente para PostgreSQL
        const formattedEtiquetasArray = `{${etiquetasArray}}`;

        // Si la sección es comunion-2 o comunion-3, buscar también en antifona
        if (seccion === 'comunion-2' || seccion === 'comunion-3') {
          seccion = `(secciones ILIKE '%comunion%' OR secciones ILIKE '%antifona%')`;
        } else {
          seccion = `secciones ILIKE '%${seccion}%'`;
        }
  
        const query = `
          WITH matched_tags AS (
            SELECT id
            FROM canciones, unnest(etiquetas::text[]) AS e(tag)
            WHERE ${seccion}
            AND e.tag = ANY($1::text[])
            GROUP BY id
            HAVING COUNT(*) >= 2
          )
          SELECT *
          FROM canciones
          WHERE id IN (SELECT id FROM matched_tags)
          ORDER BY titulo;
        `;
        
        // Convertir el array en una cadena PostgreSQL-formateada
        const params = [etiquetasArray];
        console.log('Query:', query);
        console.log('Params:', params);
  
        const result = await db.query(query, params);

        if (res.headersSent) {
          console.warn('Las cabeceras ya fueron enviadas, no se puede enviar otra respuesta.');
        } else {
          res.json(result.rows);
        }
        } catch (error) {
          if (!res.headersSent) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener canciones' });
          } else {
            console.error('Error después de enviar la respuesta:', error);
          }
        }
      };
  
  const getRandomSongBySection = async (req, res) => {
    try {
        const { seccion } = req.query;
        const query = `
            SELECT * FROM canciones 
            WHERE secciones ILIKE $1
            ORDER BY RANDOM() LIMIT 1
        `;
        const result = await db.query(query, [`%${seccion}%`]);
  
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener canción aleatoria' });
    }
  };

  module.exports = {    
    getSongsBySectionAndTags,
    getRandomSongBySection
  };
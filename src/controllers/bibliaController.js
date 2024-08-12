const db = require('../config/dbConfig');

const getCapitulo = async (req, res) => {
  const { libro, capitulo } = req.params;
  console.log(`Received request for libro: ${libro}, capitulo: ${capitulo}`);
  
  try {
    const result = await db.query(
      'SELECT capitulo_html FROM biblia_capitulos_completos WHERE libro_id = $1 AND capitulo = $2',
      [libro, capitulo]
    );
    console.log('Database query result:', result.rows);

    if (result.rows.length > 0) {
      const capituloHtml = result.rows[0].capitulo_html;
      console.log('Returning HTML content for the chapter.');
      res.status(200).json({ capituloHtml });
    } else {
      console.log('Chapter not found in database.');
      res.status(404).json({ error: 'Capítulo no encontrado' });
    }
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCapitulo };

const db = require('../config/dbConfig');

const getLiturgiasForDate = async (req, res) => {
  const { date } = req.params;
  try {
      const result = await db.query('SELECT * FROM liturgias_nuevo WHERE fecha = $1', [date]);
      if (result.rows.length > 0) {
          res.send(result.rows[0].contenido_html); // Suponiendo que tienes el contenido en un campo HTML
      } else {
          res.status(404).send('No se encontraron lecturas para esta fecha.');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener las lecturas.');
  }
};

module.exports = { getLiturgiasForDate };
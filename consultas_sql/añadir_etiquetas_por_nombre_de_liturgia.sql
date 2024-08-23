UPDATE liturgias_nuevo
SET etiquetas = etiquetas || ',Pentecostés'
WHERE fecha_liturgica LIKE '%Pentecostés%'
  AND etiquetas NOT LIKE '%Pentecostés%';
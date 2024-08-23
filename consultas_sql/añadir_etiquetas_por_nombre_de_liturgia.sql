UPDATE liturgias_nuevo
SET etiquetas = etiquetas || ',Navidad'
WHERE fecha_liturgica LIKE '%Natividad del Señor%'
  AND etiquetas NOT LIKE '%Navidad%';
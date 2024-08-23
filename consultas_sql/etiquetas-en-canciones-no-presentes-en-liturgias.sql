WITH canciones_etiquetas AS (
    SELECT
        id,
        unnest(etiquetas) AS etiqueta
    FROM
        canciones
)
SELECT
    ce.id AS cancion_id,
    ce.etiqueta AS etiqueta_no_valida
FROM
    canciones_etiquetas ce
LEFT JOIN
    etiquetas e ON ce.etiqueta = e.etiqueta
WHERE
    e.etiqueta IS NULL
ORDER BY cancion_id;

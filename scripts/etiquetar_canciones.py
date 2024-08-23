import os
import psycopg2
import openai
from dotenv import load_dotenv

load_dotenv()

# Conexión a la base de datos
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    port=os.getenv('DB_PORT')
)
cursor = conn.cursor()

# Configuración de OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Obtener todas las etiquetas disponibles
def obtener_etiquetas_disponibles():
    cursor.execute("SELECT etiqueta FROM etiquetas")
    etiquetas = cursor.fetchall()
    return [et[0].capitalize() for et in etiquetas]  # Capitalizar para asegurar coincidencia

etiquetas_disponibles = obtener_etiquetas_disponibles()

# Obtener lecturas por liturgia
def obtener_letra_por_cancion(cancion_id):
    query = """
    SELECT l.contenido
    FROM lineas_canciones l
    WHERE l.cancion_id = %s
    AND tipo_linea = 'l'
    """
    cursor.execute(query, (cancion_id,))
    return cursor.fetchall()

# Generar etiquetas usando OpenAI
def generar_etiquetas(textos):
    prompt = (
        "Eres un experto en liturgia católica y letras de canciones de misa. Conoces la intención de la letra de las canciones, relacionada con los textos de la biblia. "
        "Resume la letra de la siguiente canción en exactamente 4 palabras clave. "
        "Es fundamental que devuelvas el texto como exactamente 4 palabras, ni más ni menos, la primera letra en mayúscula, "
        "separadas por comas sin espacios adicionales. Exclusivamente las palabras, sin explicación alguna. "
        "Las palabras deben ser obligatoriamente escogidas de esta lista de 368, sin proponer ninguna nueva: "
        + ",".join(etiquetas_disponibles) + 
        "El éxito de tu tarea radica en la pertinencia de tu elección. Elecciones demasiado genéricas no aportarán valor. Por ejemplo 'Amor' es una palabra clave que podría considerarse demasiado recurrente" +
        ", ya que a priori todas las canciones de misa, de una u otra manera, hablan de Amor. Puesto que tienes un gran listado, aprovéchalo al máximo para ser lo más pertinente posible en tu respuesta"
        ". Te está totalmente prohibido proporcionar palabras no presentes en el listado anterior."
        + "Asegúrate de que la salida contiene exactamente 4 palabras. Esta es la letra de la canción:\n" + "\n".join(textos)
        + "el formato de ejemplo sería este '{Amor,Paz,Alabanza,Encuentro}'. Aquí tienes otro ejemplo '{Gloria,Agua,Luz}'"
    )

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    etiquetas = response.choices[0].message['content'].strip()
    print(etiquetas)
    return etiquetas

# Filtrar etiquetas generadas para que coincidan con las disponibles
# def filtrar_etiquetas(etiquetas_generadas):
#    etiquetas_lista = etiquetas_generadas.split(',')
#   etiquetas_filtradas = [etiqueta for etiqueta in etiquetas_lista if etiqueta.capitalize() in etiquetas_disponibles]
#    return ', '.join(etiquetas_filtradas)

# Actualizar la tabla liturgias_nuevo con etiquetas
def actualizar_canciones_con_etiquetas(cancion_id, etiquetas):
    print(f"Guardando etiquetas en canción {cancion_id}")
    query = "UPDATE canciones SET etiquetas = %s WHERE id = %s"
    cursor.execute(query, (etiquetas, cancion_id))
    conn.commit()

# Procesar canciones en lotes
def procesar_canciones_en_lotes(tamaño_lote=50, start_id=29):
    print(f'Comenzando el proceso en ID: {start_id}')
    while True:
        sql = cursor.execute("SELECT id FROM canciones WHERE id >= %s ORDER BY id LIMIT %s", (start_id, tamaño_lote))
        print(f'consulta SQL: {sql}')
        canciones = cursor.fetchall()
        
        # Si no hay más canciones, salimos del bucle
        if not canciones:
            break
        
        print(f"Procesando lote de {len(canciones)} canciones. Start ID: {start_id}")

        for cancion in canciones:
            cancion_id = cancion[0]
            letras = obtener_letra_por_cancion(cancion_id)
            textos = [letra[0] for letra in letras]
            print(f"Procesando canción ID {cancion_id}")
            print("Texto de la canción:")
            for texto in textos:
                print(texto[:100])
            etiquetas_generadas = generar_etiquetas(textos)
            actualizar_canciones_con_etiquetas(cancion_id, etiquetas_generadas)
        
        # Actualiza el start_id para la siguiente iteración
        start_id = canciones[-1][0] + 1

if __name__ == "__main__":
    procesar_canciones_en_lotes(tamaño_lote=50, start_id=29)

# Cerrar la conexión a la base de datos
cursor.close()
conn.close()

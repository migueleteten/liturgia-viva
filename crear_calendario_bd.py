import os
import psycopg2
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# Cargar variables de entorno
from dotenv import load_dotenv
load_dotenv()

def obtener_contenido(fecha, anio):
    url = f"https://servicioskoinonia.org/biblico/calendario/texto.php?codigo={fecha}&cicloactivo=2028&cepif=1&cascen=0&ccorpus=0"
    response = requests.get(url)
    if response.status_code == 200:
        content = response.content.decode('utf-8', errors='replace')
        soup = BeautifulSoup(content, 'html5lib')
        return soup
    else:
        return None

def procesar_contenido(soup):
    nombre_fecha_tag = soup.find('font', {'color': '#000000'}) or soup.find('font', {'color': '#FF0000'})
    nombre_fecha = nombre_fecha_tag.text.strip() if nombre_fecha_tag else "Fecha no encontrada"
    
    # Obtener fecha_liturgica
    center_tag = soup.find('center')
    fecha_liturgica_tag = None
    if center_tag:
        h2_tag = center_tag.find('h2')
        if h2_tag:
            p_tags = h2_tag.find_all('p')
            if len(p_tags) > 1:
                fecha_liturgica_tag = p_tags[1].find('b')

    fecha_liturgica = fecha_liturgica_tag.text.strip() if fecha_liturgica_tag else "Fecha litúrgica no encontrada"
    
    divs_justify = soup.find_all('div', align='justify')
    bloques = []
    tiene_opciones = False

    for div_idx, div in enumerate(divs_justify):
        elements = div.find_all(['p', 'blockquote'], recursive=False)
        i = 0
        while i < len(elements):
            element = elements[i]
            if element.name == 'p' and element.find('b') and not element.find('font', color="#0000FF"):
                titulo = element.find('b').get_text(strip=True)
                i += 1
                if i < len(elements) and elements[i].name == 'p' and not elements[i].text.strip():
                    i += 1
                contenido = ""
                resumen = ""
                if i < len(elements) and elements[i].name == 'blockquote':
                    blockquote_element = elements[i]
                    contenido = ' '.join([str(e).strip() for e in blockquote_element.contents if not (e.name == 'i')])
                    resumen = blockquote_element.find('i').get_text(strip=True) if blockquote_element.find('i') else ""
                    i += 1
                bloques.append((titulo, contenido, resumen))
            elif element.name == 'p' and element.find('font', color="#0000FF"):
                tiene_opciones = True
                bloques.append(("esto es una unión", "", ""))
                i += 1
            else:
                i += 1

    opciones = []
    if tiene_opciones:
        i = 0
        while i < len(bloques):
            if bloques[i][0] == "esto es una unión":
                i += 1
                continue
            opciones_actuales = [bloques[i]]
            j = i + 1
            while j < len(bloques) and bloques[j][0] == "esto es una unión":
                j += 1
                if j < len(bloques):
                    opciones_actuales.append(bloques[j])
                    j += 1
            if len(opciones_actuales) > 1:
                opciones.append(opciones_actuales)
            else:
                opciones.append([bloques[i]])
            i = j
    else:
        opciones = [[bloque] for bloque in bloques]

    return nombre_fecha, fecha_liturgica, opciones

def obtener_fechas(fecha_inicial, dias):
    fecha_inicial = datetime.strptime(fecha_inicial, '%Y%m%d')
    fechas = [(fecha_inicial + timedelta(days=d)).strftime('%Y%m%d') for d in range(dias)]
    return fechas

def guardar_en_db(fecha, nombre_fecha, fecha_liturgica, opciones):
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO liturgias_nuevo (fecha, nombre_fecha, fecha_liturgica) VALUES (%s, %s, %s) RETURNING id",
        (fecha, nombre_fecha, fecha_liturgica)
    )
    liturgia_id = cursor.fetchone()[0]

    grupo_id = 1
    for opcion in opciones:
        for bloque in opcion:
            cursor.execute(
                "INSERT INTO lecturas_nuevo (liturgia_id, ref_biblia, contenido, resumen, grupo) VALUES (%s, %s, %s, %s, %s)",
                (liturgia_id, bloque[0], bloque[1], bloque[2], grupo_id)
            )
        grupo_id += 1

    conn.commit()
    cursor.close()
    conn.close()

def procesar_dias(fecha_inicial, dias):
    fechas = obtener_fechas(fecha_inicial, dias)
    anio_actual = fecha_inicial[:4]
    error_detectado = False

    for fecha in fechas:
        print(f"Procesando fecha: {fecha}")
        if error_detectado:
            anio_actual = str(int(anio_actual) + 1)
            error_detectado = False

        soup = obtener_contenido(fecha, anio_actual)
        if not soup:
            anio_siguiente = str(int(anio_actual) + 1)
            soup = obtener_contenido(fecha, anio_siguiente)
            while not soup:
                fecha_dt = datetime.strptime(fecha, '%Y%m%d') + timedelta(days=1)
                fecha = fecha_dt.strftime('%Y%m%d')
                soup = obtener_contenido(fecha, anio_siguiente)
                if fecha[:4] != anio_siguiente:
                    anio_siguiente = str(int(anio_siguiente) + 1)
                    soup = obtener_contenido(fecha, anio_siguiente)
                    if soup:
                        anio_actual = anio_siguiente
                        break
                if not soup:
                    error_detectado = True
                    break

        if soup:
            nombre_fecha, fecha_liturgica, opciones = procesar_contenido(soup)
            guardar_en_db(fecha, nombre_fecha, fecha_liturgica, opciones)

# Proceso para manejar varias fechas
fecha_inicial = '20281126'  # Cambia esta fecha a la fecha de inicio deseada
fechas = procesar_dias(fecha_inicial, 7)  # Procesar los próximos 4 días
# 🎵 Jaye - Frontend (React / Vite)

Jaye es una aplicación web interactiva diseñada para la composición musical asistida por Inteligencia Artificial. Utiliza la notación musical en texto plano (ABC Notation) para permitir a los usuarios escribir, reproducir y expandir sus ideas musicales de forma fluida.

Este proyecto forma parte de un Trabajo de Fin de Máster (TFM).

## ✨ Características Principales

* **Editor Musical ABC:** Escribe partituras en texto plano con renderizado visual en tiempo real.
* **Asistencia por IA:** Generación dinámica de continuaciones musicales basadas en el contexto de tu composición.
* **Síntesis de Audio Web:** Reproducción de las partituras directamente en el navegador con soporte para diferentes instrumentos y ritmos (usando `abcjs`).
* **Gestor de Archivos:** Organización de composiciones mediante un sistema de carpetas.
* **Exportación:** Descarga de partituras en formato PDF y exportación de audio en formato MIDI.
* **Diseño Responsivo:** Interfaz moderna y limpia construida con Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

* **Framework:** React 18 + TypeScript
* **Build Tool:** Vite
* **Estilos:** Tailwind CSS
* **Renderizado Musical:** abcjs
* **Iconografía:** Lucide React
* **Rutas:** React Router DOM
* **Peticiones HTTP:** Axios

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/agetro2003/jaye-front.git
cd jaye-front
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto y añade la URL del backend:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Levantar el servidor de desarrollo:**
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

## 📦 Despliegue
Este proyecto está optimizado para ser desplegado de forma continua en plataformas como Vercel o Netlify.

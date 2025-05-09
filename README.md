# Extensión de Chrome: API-Logger-Pro

Este proyecto es una extensión de Chrome diseñada para capturar los logs de la consola (info, warn, error) de páginas web específicas y enviarlos a un endpoint de API que tú configures. Es una herramienta útil para desarrolladores y testers que necesitan monitorear el comportamiento de aplicaciones web en tiempo real o recolectar logs de errores de manera centralizada.

## Características Principales

* **Captura Selectiva de Logs:**
    * Puedes elegir qué tipos de logs capturar: `info`, `warn`, `error`.
* **Configuración de API Destino:**
    * Establece la URL del endpoint de tu API donde se enviarán los logs.
    * Soporte para token de autenticación (Bearer Token) para APIs protegidas.
    * Botón para probar la conexión con la API enviando un log de prueba.
* **Gestión de Páginas Monitoreadas:**
    * Añade URLs específicas de las páginas web de las cuales deseas capturar logs.
    * Opción para añadir la URL de la página actual con un solo clic.
    * Añade URLs manualmente.
    * Visualiza la lista de páginas monitoreadas y elimina páginas individualmente.
    * Botón para limpiar todas las páginas de la lista de monitoreo.
* **Control Global de Captura:**
    * Un interruptor global para activar o desactivar rápidamente toda la funcionalidad de captura de logs sin perder tu configuración.
* **Interfaz de Usuario Intuitiva:**
    * Popup de configuración fácil de usar para gestionar todas las opciones.
    * Mensajes de estado para feedback al usuario (guardado, errores, etc.).
* **Envío de Datos Estructurados:**
    * Los logs se envían a la API en formato JSON, incluyendo:
        * `type`: Nivel del log (info, warn, error, test).
        * `message`: El contenido del mensaje de log.
        * `url`: La URL de la página donde se originó el log.
        * `timestamp`: Fecha y hora (ISO) de cuándo se capturó el log.
* **Actualización Dinámica:**
    * La extensión actualiza su comportamiento de captura en las pestañas abiertas si la configuración cambia (ej. si se añade o elimina una página del monitoreo, o si se activa/desactiva la captura global).

## ¿Cómo Funciona?

1.  **Configuración:** A través del popup de la extensión, configuras:
    * La URL de tu API y, opcionalmente, un token de autenticación.
    * Los tipos de logs que deseas capturar (info, warn, error).
    * Las URLs de las páginas web que quieres monitorear.
    * El estado del interruptor de captura global.
2.  **Inyección de Script:** La extensión inyecta un script de contenido (`content.js`) en todas las páginas web.
3.  **Verificación y Captura:**
    * El `content.js` primero verifica la configuración almacenada:
        * Si la captura global está desactivada, no hace nada.
        * Si la URL de la página actual está en la lista de páginas monitoreadas, el script sobrescribe las funciones `console.log`, `console.warn`, y `console.error` de esa página.
    * Cuando se llama a una de estas funciones en la página monitoreada, el script:
        * Captura los argumentos del log.
        * Verifica si el tipo de log específico está habilitado para captura.
        * Construye un objeto JSON con la información del log.
        * Envía este objeto JSON mediante una petición `Workspace` al endpoint de API configurado.
        * Ejecuta la función original de la consola para que el log también aparezca normalmente en la consola del desarrollador del navegador.
4.  **Gestión desde el Popup:** Todas las configuraciones se guardan usando `chrome.storage.local`, permitiendo que persistan entre sesiones del navegador.

## Instalación

1.  **Descarga o Clona el Repositorio:**
    ```bash
    git clone https://github.com/felipe55gonzalez/API-Logger-Pro.git
    ```
    O descarga el archivo ZIP y descomprímelo.
2.  **Abre Chrome y ve a Extensiones:** Escribe `chrome://extensions` en la barra de direcciones y presiona Enter.
3.  **Activa el Modo Desarrollador:** Asegúrate de que el interruptor "Modo de desarrollador" en la esquina superior derecha esté activado.
4.  **Carga la Extensión Descomprimida:**
    * Haz clic en el botón "Cargar descomprimida".
    * Navega hasta la carpeta donde clonaste o descomprimiste el proyecto y selecciónala.
5.  ¡La extensión debería aparecer ahora en tu lista de extensiones y estar lista para usar!

## Uso

1.  Haz clic en el icono de la extensión en la barra de herramientas de Chrome para abrir el popup de configuración.
2.  **Configura la API:**
    * Ingresa la URL completa de tu endpoint en "URL de API Destino".
    * Si tu API requiere un token Bearer, ingrésalo en "Token de API".
    * Puedes usar el botón "Probar Conexión API" para enviar un log de prueba.
3.  **Selecciona Tipos de Log:** Marca las casillas para `Info`, `Warn`, y/o `Error` según lo que necesites capturar.
4.  **Añade Páginas a Monitorear:**
    * Navega a la página que quieres monitorear y haz clic en "Agregar Página Actual".
    * O escribe/pega una URL en el campo "Añadir URL manualmente" y haz clic en "Añadir URL".
5.  **Activa la Captura Global:** Asegúrate de que el interruptor "Captura Global Activada" esté encendido.
6.  **Guarda la Configuración:** Haz clic en el botón "Guardar Configuración".
7.  La extensión comenzará a capturar logs de las páginas configuradas y a enviarlos a tu API. Los logs también seguirán apareciendo en la consola de desarrollador del navegador de forma normal.

## Contribuciones

Las contribuciones son bienvenidas. Si tienes ideas para mejorar la extensión o encuentras algún error, por favor abre un *issue* o envía un *pull request*.

---

*Este README fue generado el 9 de mayo de 2025.*

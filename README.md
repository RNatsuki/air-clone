# Sistema de Monitoreo de Dispositivos

Este proyecto trata de replicar el sistema de monitoreo AirControl2 de Ubiquiti, permitiendo la gestión y monitoreo de dispositivos (LiteBeam, Rocket, etc.) en una red local. Utiliza Node.js con Express para el backend, Prisma para la base de datos y Socket.IO para las actualizaciones en tiempo real.
## Características

- Monitoreo de dispositivos en tiempo real
- Recopilación de métricas (CPU, señal, tiempo de actividad, etc.)
- API REST para acceder a la información de dispositivos
- Interfaz en tiempo real mediante Socket.IO
- Almacenamiento persistente con Prisma

## Requisitos

- Node.js v16 o superior
- npm o yarn
- Base de datos SQLite (incluida)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/test.git

# Navegar al directorio del proyecto
cd test

# Instalar dependencias
npm install

# Configurar la base de datos
npx prisma migrate dev

# Iniciar la aplicación
npm start
```

## Implementación del Frontend

Para implementar un frontend que se comunique con esta API, sigue estas instrucciones:

### Opción 1: Frontend independiente

Puedes crear un proyecto frontend independiente utilizando frameworks como React, Vue o Angular:

1. Crea un nuevo proyecto usando tu framework preferido
2. Configura las llamadas API al endpoint `/api/devices` para obtener la lista de dispositivos
3. Implementa la conexión WebSocket para recibir actualizaciones en tiempo real:

```javascript
// Ejemplo con Socket.IO client para actualización en tiempo real
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('deviceMetrics', (data) => {
  console.log('Nueva actualización de métricas:', data);
  // Actualizar UI con los nuevos datos
});
```

### Opción 2: Servir frontend desde Express

También puedes servir el frontend directamente desde Express integrándolo en este proyecto:

1. Crea una carpeta `public` en la raíz del proyecto
2. Coloca los archivos del frontend (HTML, CSS, JS) en esta carpeta
3. Modifica `src/app.ts` para servir estos archivos estáticos:

```typescript
// Agrega en app.ts
app.use(express.static('public'));

// Ruta para servir el index.html en todas las rutas no definidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
```

### API Endpoints

#### REST API

El sistema ofrece los siguientes endpoints REST para gestionar dispositivos:

##### Endpoints de Dispositivos

- `GET /api/devices`
  - **Descripción**: Obtiene la lista completa de todos los dispositivos monitoreados
  - **Respuesta**: Array de objetos Device con toda la información almacenada
  - **Ejemplo de respuesta**:
  ```json
  [
    {
      "mac": "aa:bb:cc:dd:ee:ff",
      "ip": "192.168.1.100",
      "hostname": "router-sala",
      "model": "LiteBeam M5",
      "ssid": "Red-Principal",
      "firmware": "8.7.1",
      "sshUsername": "admin",
      "lastSeen": 1622548800,
      "cpu": 15.5,
      "memory": 42.3,
      "uptime": 1209600,
      "signal": -65
    },
    ...
  ]
  ```

- `GET /api/devices/:mac`
  - **Descripción**: Obtiene información detallada de un dispositivo específico
  - **Parámetros**: `mac` - Dirección MAC del dispositivo (identificador único)
  - **Respuesta**: Objeto Device con todos los detalles del dispositivo
  - **Códigos de estado**:
    - `200 OK`: Dispositivo encontrado
    - `404 Not Found`: Dispositivo no encontrado

- `PUT /api/devices/:mac`
  - **Descripción**: Actualiza la información de un dispositivo existente
  - **Parámetros**: `mac` - Dirección MAC del dispositivo a actualizar
  - **Cuerpo de la petición**: Objeto con los campos a actualizar
  - **Respuesta**: Objeto Device actualizado
  - **Códigos de estado**:
    - `200 OK`: Dispositivo actualizado correctamente
    - `400 Bad Request`: Datos de actualización inválidos
    - `404 Not Found`: Dispositivo no encontrado
    - `500 Internal Server Error`: Error al actualizar el dispositivo

##### Endpoints de Descubrimiento

- `GET /api/devices/discovery`
  - **Descripción**: Inicia un escaneo de red para descubrir nuevos dispositivos
  - **Respuesta**: Lista de dispositivos descubiertos en la red
  - **Ejemplo de uso**: Útil para buscar activamente nuevos dispositivos

- `GET /api/devices/discovered`
  - **Descripción**: Obtiene la lista de dispositivos descubiertos pero aún no añadidos al sistema
  - **Respuesta**: Array de dispositivos descubiertos con información básica

- `POST /api/devices/accept`
  - **Descripción**: Acepta un dispositivo descubierto y lo añade al sistema de monitoreo
  - **Cuerpo de la petición**:
  ```json
  {
    "mac": "aa:bb:cc:dd:ee:ff",
    "sshUsername": "admin",
    "sshPassword": "password"
  }
  ```
  - **Códigos de estado**:
    - `200 OK`: Dispositivo añadido correctamente
    - `400 Bad Request`: Faltan campos requeridos
    - `404 Not Found`: Dispositivo no encontrado en la lista de descubiertos
    - `500 Internal Server Error`: Error al guardar el dispositivo

#### WebSockets

El sistema utiliza Socket.IO para proporcionar actualizaciones en tiempo real:

- **Evento**: `metrics`
  - **Descripción**: Emite actualizaciones de métricas de todos los dispositivos cada segundo
  - **Datos**: Array de objetos con información actualizada de cada dispositivo
  - **Ejemplo de datos recibidos**:
  ```json
  [
    {
      "mac": "aa:bb:cc:dd:ee:ff",
      "ip": "192.168.1.100",
      "hostname": "router-sala",
      "model": "LiteBeam M5",
      "firmware": "8.7.1",
      "lastSeenAgo": 5,
      "ssid": "Red-Principal",
      "signalStrength": -65,
      "online": true
    },
    ...
  ]
  ```
  - **Campos notables**:
    - `lastSeenAgo`: Segundos desde la última actualización
    - `online`: Estado actual del dispositivo (true/false)
    - `signalStrength`: Fuerza de la señal en dBm

## Estructura del proyecto

```
src/
  app.ts                 # Punto de entrada de la aplicación
  api/                   # Rutas y controladores de la API
  core/                  # Lógica de negocio principal
    devices/             # Servicios para gestión de dispositivos
    monitoring/          # Sistema de monitoreo y métricas
    discovery/           # Descubrimiento de dispositivos en la red
  db/                    # Configuración y acceso a la base de datos
  lib/                   # Utilidades y herramientas
  socket/                # Configuración de WebSockets
```

## Licencia

ISC

## Frontend

This project now includes a Next.js frontend located in the `frontend` directory.

### Running the Frontend

1.  **Navigate to the project root directory.**
2.  **Install dependencies (if you haven't already):**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run next:dev
    ```
    This will typically start the frontend on [http://localhost:3000](http://localhost:3000) or the next available port.

### Building the Frontend

To create a production build:

```bash
npm run next:build
```
This will generate an optimized build in the `frontend/.next` directory.

### Starting the Production Frontend

After building, you can start the production server:

```bash
npm run next:start
```
This will serve the optimized build.

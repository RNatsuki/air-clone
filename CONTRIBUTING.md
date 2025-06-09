# Guía de contribución

¡Gracias por tu interés en contribuir a nuestro sistema de monitoreo de dispositivos! Esta guía te ayudará a configurar tu entorno de desarrollo y entender el proceso de contribución.

## Configuración del entorno de desarrollo

1. **Requisitos previos**
   - Node.js v16 o superior
   - npm o yarn
   - Git

2. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/test.git
   cd test
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar la aplicación en modo desarrollo**
   ```bash
   npm start
   ```

## Estructura del proyecto

```
src/
  app.ts                 # Punto de entrada de la aplicación
  api/                   # Rutas y controladores de la API
    devices.ts           # Endpoints para la gestión de dispositivos
  core/
    devices/             # Servicios para gestión de dispositivos
      deviceService.ts   # Lógica para operaciones con dispositivos
    discovery/           # Descubrimiento de dispositivos en la red
      parser.ts          # Parser para mensajes de descubrimiento
      ubntDiscovery.ts   # Implementación específica para dispositivos Ubiquiti
    monitoring/          # Sistema de monitoreo y métricas
      index.ts           # Exporta funcionalidades de monitoreo
      metricStore.ts     # Almacenamiento de métricas
      poller.ts          # Implementación del poller
      pollingManager.ts  # Gestión del ciclo de polling
      metrics/           # Implementaciones de métricas específicas
        cpu.ts
        hostname.ts
        ip.ts
        signal.ts
        ssid.ts
        uptime.ts
    ssh-pool/            # Gestión de conexiones SSH
  db/
    client.ts            # Cliente Prisma
  lib/
    logger.ts            # Sistema de logging
    utils.ts             # Utilidades generales
  socket/
    index.ts             # Configuración de WebSockets
```

## Guía para desarrolladores

### Sistema de polling

El sistema de polling está diseñado para recopilar métricas de dispositivos en intervalos regulares:

```typescript
// pollingManager.ts gestiona los ciclos de polling
export async function startPolling() {
  const devices = await getDevices();
  for (const device of devices) {
    if (pollers.has(device.mac)) continue;

    pollers.set(device.mac, setInterval(() => {
      pollDeviceMetrics(device);
    }, POLL_INTERVAL));

    // Poll immediately on startup
    pollDeviceMetrics(device);
  }
}
```

### Añadir una nueva métrica

Para añadir una nueva métrica al sistema:

1. Crea un nuevo archivo en `src/core/monitoring/metrics/`
2. Implementa y exporta una función para recopilar esa métrica
3. Importa y registra la función en `src/core/monitoring/index.ts`

Ejemplo:
```typescript
// Nueva métrica: src/core/monitoring/metrics/temperature.ts
import { Device } from '@prisma/client';
import { executeCommand } from '../../ssh-pool';

export async function getTemperature(device: Device): Promise<number | null> {
  try {
    const result = await executeCommand(device, 'cat /sys/class/thermal/thermal_zone0/temp');
    return parseInt(result.trim()) / 1000;
  } catch (error) {
    return null;
  }
}
```

### Flujo de trabajo Git

1. **Crear una rama**
   ```bash
   git checkout -b feature/nombre-de-la-caracteristica
   ```

2. **Hacer commits con mensajes descriptivos**
   ```bash
   git commit -m "feat: añadir soporte para métricas de temperatura"
   ```
   Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/)

3. **Enviar cambios y crear un Pull Request**
   ```bash
   git push origin feature/nombre-de-la-caracteristica
   ```

4. Crea un Pull Request en GitHub describiendo los cambios realizados

## Convenciones de código

- Utilizamos TypeScript para todo el código
- Seguimos un estilo similar a Standard JS
- Todos los archivos deben tener tipado explícito
- Documentar funciones públicas con comentarios JSDoc

## Testing

Actualmente estamos trabajando en implementar tests automatizados. Las contribuciones en esta área son especialmente bienvenidas.

## Preguntas y soporte

Si tienes dudas o necesitas ayuda, por favor abre un issue en el repositorio o contacta al equipo de mantenimiento.

import express from 'express';
import http from 'http';
import devicesRouter from './api/devices';
import { setupSocket } from './socket';
import { logger } from './lib/logger';
import { startPolling } from './core/monitoring/pollingManager';


const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api/devices', devicesRouter);

setupSocket(server);
startPolling();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

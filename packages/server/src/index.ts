import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameController } from './controllers/gameController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'StarFarm Backend API', timestamp: new Date() });
});

app.get('/api/player/profile', GameController.getProfile);
app.post('/api/farm/plant', GameController.plant);
app.post('/api/farm/harvest', GameController.harvest);
app.post('/api/market/sell', GameController.sellItem);
app.post('/api/hangar/upgrade', GameController.upgradeShip);
app.post('/api/hangar/equip', GameController.equipShip);
app.post('/api/gacha/roll', GameController.rollGacha);
app.post('/api/battle/complete', GameController.completeBattle);

app.listen(PORT, () => {
  console.log(`🚀 StarFarm Backend Server running on http://localhost:${PORT}`);
});

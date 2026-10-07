import { Request, Response } from 'express';
import { GameService } from '../services/gameService';

export class GameController {
  static async getProfile(req: Request, res: Response) {
    try {
      const username = (req.query.username as string) || 'Commander_Nova';
      const profile = await GameService.getProfile(username);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async plant(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', plotIndex, cropType } = req.body;
      const profile = await GameService.plant(username, Number(plotIndex), cropType);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async harvest(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', plotIndex } = req.body;
      const result = await GameService.harvest(username, Number(plotIndex));
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async sellItem(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', itemId, quantity } = req.body;
      const result = await GameService.sellItem(username, itemId, Number(quantity));
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async upgradeShip(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', playerShipId } = req.body;
      const result = await GameService.upgradeShip(username, Number(playerShipId));
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async equipShip(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', playerShipId } = req.body;
      const profile = await GameService.equipShip(username, Number(playerShipId));
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async rollGacha(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova' } = req.body;
      const result = await GameService.rollGacha(username);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async completeBattle(req: Request, res: Response) {
    try {
      const { username = 'Commander_Nova', stageId, isVictory } = req.body;
      const result = await GameService.completeBattle(username, stageId, Boolean(isVictory));
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

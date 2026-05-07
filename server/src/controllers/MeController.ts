import { Request, Response } from 'express'

export const MeController = {
  get(req: Request, res: Response) {
    res.json({ user: req.currentUser })
  },
}

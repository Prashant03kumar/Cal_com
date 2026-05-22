import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

export async function defaultUser(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({ where: { email: 'alex@calcom.demo' } })
  if (!user) return res.status(500).json({ error: 'Default user not found. Run seed first.' })
  ;(req as any).user = user
  next()
}

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const create = async (req: Request, res: Response) => {
  try {
    const guarantor = await prisma.user.create({ data: { ...req.body, role: 'GUARANTOR' } });
    return res.status(201).json(guarantor);
  } catch (e) { return res.status(500).json({ error: 'Erro create guarantor' }); }
};

export const list = async (req: Request, res: Response) => {
  try {
    const list = await prisma.user.findMany({ where: { role: 'GUARANTOR' } });
    return res.json(list);
  } catch (e) { return res.status(500).json({ error: 'Erro list guarantor' }); }
};

export const getById = async (req: Request, res: Response) => {
  return res.json({ message: 'Not implemented yet' });
};

export const update = async (req: Request, res: Response) => {
  return res.json({ message: 'Not implemented yet' });
};

export const remove = async (req: Request, res: Response) => {
  return res.json({ message: 'Not implemented yet' });
};
// Fix deploy railway - forçando update
import { Request, Response } from 'express';
// ... resto do código
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const create = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const guarantor = await prisma.user.create({
      data: { ...data, role: 'GUARANTOR' } // Assume User model
    });
    return res.status(201).json(guarantor);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar garantidor' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const guarantors = await prisma.user.findMany({
      where: { role: 'GUARANTOR' }
    });
    return res.json(guarantors);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar garantidores' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guarantor = await prisma.user.findUnique({ where: { id } });
    if (!guarantor) return res.status(404).json({ error: 'Garantidor não encontrado' });
    return res.json(guarantor);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar garantidor' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guarantor = await prisma.user.update({
      where: { id },
      data: req.body
    });
    return res.json(guarantor);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar garantidor' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover garantidor' });
  }
};

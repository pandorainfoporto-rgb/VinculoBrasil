// ============================================
// SUPPLIER CONTROLLER - Gestão de Fornecedores 360
// FASE 23: Nested Writes para Address, BankAccount, Contact
// ============================================

import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';

// ============================================
// TYPES
// ============================================

interface SupplierAddress {
  id?: string;
  type?: 'COMMERCIAL' | 'DELIVERY' | 'BILLING';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isPrimary?: boolean;
}

interface SupplierBankAccount {
  id?: string;
  bankCode: string;
  bankName?: string;
  agencyNumber: string;
  accountNumber: string;
  accountType?: 'CHECKING' | 'SAVINGS';
  pixKey?: string;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  holderName?: string;
  holderDocument?: string;
  isPrimary?: boolean;
}

interface SupplierContact {
  id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  department?: string;
  isPrimary?: boolean;
}

interface CreateSupplierBody {
  // Dados principais
  tradeName: string;
  legalName?: string;
  taxId?: string;
  personType?: 'FISICA' | 'JURIDICA';
  stateRegistration?: string;
  municipalRegistration?: string;
  category?: string;
  agencyId?: string;
  isActive?: boolean;

  // Campos legados (para compatibilidade)
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;

  // Nested data
  addresses?: SupplierAddress[];
  bankAccounts?: SupplierBankAccount[];
  contacts?: SupplierContact[];
}

// ============================================
// CREATE SUPPLIER (com nested writes)
// ============================================

/**
 * POST /api/suppliers
 * Creates a new supplier with nested address, bankAccount, contacts
 */
export async function createSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      tradeName,
      legalName,
      taxId,
      personType,
      stateRegistration,
      municipalRegistration,
      category,
      agencyId,
      isActive,
      name,
      cnpj,
      email,
      phone,
      addresses,
      bankAccounts,
      contacts,
    }: CreateSupplierBody = req.body;

    // Validation
    const supplierName = tradeName || name;
    if (!supplierName) {
      throw new AppError('Missing required field: tradeName or name', 400);
    }

    if (!agencyId) {
      throw new AppError('Missing required field: agencyId', 400);
    }

    // Create supplier with nested writes
    const supplier = await prisma.supplier.create({
      data: {
        tradeName: supplierName,
        legalName,
        taxId: taxId || cnpj,
        personType: personType || 'JURIDICA',
        stateRegistration,
        municipalRegistration,
        category: category || 'Geral',
        name: supplierName, // Legacy field
        cnpj: taxId || cnpj,
        email,
        phone,
        agencyId,
        isActive: isActive !== undefined ? isActive : true,

        // Nested creates
        addresses: addresses?.length ? {
          create: addresses.map(addr => ({
            type: addr.type || 'COMMERCIAL',
            street: addr.street,
            number: addr.number,
            complement: addr.complement,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country || 'BR',
            isPrimary: addr.isPrimary || false,
          })),
        } : undefined,

        bankAccounts: bankAccounts?.length ? {
          create: bankAccounts.map(bank => ({
            bankCode: bank.bankCode,
            bankName: bank.bankName,
            agencyNumber: bank.agencyNumber,
            accountNumber: bank.accountNumber,
            accountType: bank.accountType || 'CHECKING',
            pixKey: bank.pixKey,
            pixKeyType: bank.pixKeyType,
            holderName: bank.holderName,
            holderDocument: bank.holderDocument,
            isPrimary: bank.isPrimary || false,
          })),
        } : undefined,

        contacts: contacts?.length ? {
          create: contacts.map(contact => ({
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
            mobile: contact.mobile,
            department: contact.department,
            isPrimary: contact.isPrimary || false,
          })),
        } : undefined,
      },
      include: {
        addresses: true,
        bankAccounts: true,
        contacts: true,
      },
    });

    logger.info(`[Supplier] Created: ${supplier.id} - ${supplier.tradeName}`);

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// LIST SUPPLIERS
// ============================================

/**
 * GET /api/suppliers
 * Lists all suppliers with optional filters
 */
export async function listSuppliers(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId, search, isActive, category, personType } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (category) {
      where.category = category as string;
    }

    if (personType) {
      where.personType = personType as string;
    }

    if (search) {
      where.OR = [
        { tradeName: { contains: search as string, mode: 'insensitive' } },
        { legalName: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { taxId: { contains: search as string, mode: 'insensitive' } },
        { cnpj: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        addresses: true,
        bankAccounts: true,
        contacts: true,
        _count: {
          select: {
            accountsPayable: true,
            serviceOrders: true,
          },
        },
      },
      orderBy: {
        tradeName: 'asc',
      },
    });

    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// GET SUPPLIER BY ID
// ============================================

/**
 * GET /api/suppliers/:id
 * Gets a single supplier by ID with all nested data
 */
export async function getSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        addresses: true,
        bankAccounts: true,
        contacts: true,
        accountsPayable: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        serviceOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// UPDATE SUPPLIER (com nested writes)
// ============================================

/**
 * PUT /api/suppliers/:id
 * Updates a supplier with nested data (upsert strategy)
 */
export async function updateSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      tradeName,
      legalName,
      taxId,
      personType,
      stateRegistration,
      municipalRegistration,
      category,
      isActive,
      name,
      cnpj,
      email,
      phone,
      addresses,
      bankAccounts,
      contacts,
    }: CreateSupplierBody = req.body;

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: {
        addresses: true,
        bankAccounts: true,
        contacts: true,
      },
    });

    if (!existing) {
      throw new AppError('Supplier not found', 404);
    }

    // Use transaction for complex update
    const supplier = await prisma.$transaction(async (tx) => {
      // 1. Update main supplier data
      const updated = await tx.supplier.update({
        where: { id },
        data: {
          ...(tradeName && { tradeName }),
          ...(legalName !== undefined && { legalName }),
          ...(taxId !== undefined && { taxId }),
          ...(personType && { personType }),
          ...(stateRegistration !== undefined && { stateRegistration }),
          ...(municipalRegistration !== undefined && { municipalRegistration }),
          ...(category !== undefined && { category }),
          ...(isActive !== undefined && { isActive }),
          ...(name && { name }),
          ...(cnpj !== undefined && { cnpj }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
        },
      });

      // 2. Handle addresses (delete + recreate strategy for simplicity)
      if (addresses !== undefined) {
        await tx.supplierAddress.deleteMany({ where: { supplierId: id } });
        if (addresses.length > 0) {
          await tx.supplierAddress.createMany({
            data: addresses.map(addr => ({
              supplierId: id,
              type: addr.type || 'COMMERCIAL',
              street: addr.street,
              number: addr.number,
              complement: addr.complement,
              neighborhood: addr.neighborhood,
              city: addr.city,
              state: addr.state,
              zipCode: addr.zipCode,
              country: addr.country || 'BR',
              isPrimary: addr.isPrimary || false,
            })),
          });
        }
      }

      // 3. Handle bankAccounts
      if (bankAccounts !== undefined) {
        await tx.supplierBankAccount.deleteMany({ where: { supplierId: id } });
        if (bankAccounts.length > 0) {
          await tx.supplierBankAccount.createMany({
            data: bankAccounts.map(bank => ({
              supplierId: id,
              bankCode: bank.bankCode,
              bankName: bank.bankName,
              agencyNumber: bank.agencyNumber,
              accountNumber: bank.accountNumber,
              accountType: bank.accountType || 'CHECKING',
              pixKey: bank.pixKey,
              pixKeyType: bank.pixKeyType,
              holderName: bank.holderName,
              holderDocument: bank.holderDocument,
              isPrimary: bank.isPrimary || false,
            })),
          });
        }
      }

      // 4. Handle contacts
      if (contacts !== undefined) {
        await tx.supplierContact.deleteMany({ where: { supplierId: id } });
        if (contacts.length > 0) {
          await tx.supplierContact.createMany({
            data: contacts.map(contact => ({
              supplierId: id,
              name: contact.name,
              role: contact.role,
              email: contact.email,
              phone: contact.phone,
              mobile: contact.mobile,
              department: contact.department,
              isPrimary: contact.isPrimary || false,
            })),
          });
        }
      }

      // 5. Return updated supplier with all relations
      return tx.supplier.findUnique({
        where: { id },
        include: {
          addresses: true,
          bankAccounts: true,
          contacts: true,
        },
      });
    });

    logger.info(`[Supplier] Updated: ${id} - ${supplier?.tradeName}`);

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// DELETE SUPPLIER
// ============================================

/**
 * DELETE /api/suppliers/:id
 * Deletes a supplier (soft delete - sets isActive to false)
 */
export async function deleteSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Supplier not found', 404);
    }

    // Check for related records
    const relatedPayables = await prisma.accountsPayable.count({
      where: { supplierId: id },
    });

    if (relatedPayables > 0) {
      // Soft delete - just deactivate
      const supplier = await prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info(`[Supplier] Soft deleted (has ${relatedPayables} payables): ${id}`);

      return res.json({
        success: true,
        message: 'Supplier deactivated (has related records)',
        data: supplier,
      });
    }

    // Hard delete if no related records (cascade will delete nested)
    await prisma.supplier.delete({
      where: { id },
    });

    logger.info(`[Supplier] Deleted: ${id}`);

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

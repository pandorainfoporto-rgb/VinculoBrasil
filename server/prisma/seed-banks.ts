import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏦 Seeding Bank Registry...');

    const banks = [
        // Principais Bancos Brasileiros (Febraban)
        { code: '001', name: 'Banco do Brasil S.A.', isGateway: false },
        { code: '033', name: 'Banco Santander (Brasil) S.A.', isGateway: false },
        { code: '104', name: 'Caixa Econômica Federal', isGateway: false },
        { code: '237', name: 'Banco Bradesco S.A.', isGateway: false },
        { code: '341', name: 'Itaú Unibanco S.A.', isGateway: false },
        { code: '260', name: 'Nu Pagamentos S.A. (Nubank)', isGateway: false },
        { code: '077', name: 'Banco Inter S.A.', isGateway: false },
        { code: '336', name: 'Banco C6 S.A.', isGateway: false },
        { code: '079', name: 'Banco Original S.A.', isGateway: false },
        { code: '212', name: 'Banco Original S.A.', isGateway: false }, // Nota: confirm codes if needed
        { code: '655', name: 'Banco Votorantim S.A.', isGateway: false },
        { code: '422', name: 'Banco Safra S.A.', isGateway: false },
        { code: '748', name: 'Sicredi', isGateway: false },
        { code: '756', name: 'Sicoob', isGateway: false },
        { code: '041', name: 'Banrisul', isGateway: false },

        // Gateways de Pagamento
        { code: 'ASAAS', name: 'Asaas IP S.A.', isGateway: true },
        { code: 'STRIPE', name: 'Stripe Payments', isGateway: true },
        { code: 'MERCADO_PAGO', name: 'Mercado Pago', isGateway: true },
        { code: 'PAGSEGURO', name: 'PagSeguro Internet S.A.', isGateway: true },
        { code: 'PAYPAL', name: 'PayPal', isGateway: true },
        { code: 'VINDI', name: 'Vindi Pagamentos', isGateway: true },
        { code: 'IUGU', name: 'Iugu Instituição de Pagamento S.A.', isGateway: true },
        { code: 'STONE', name: 'Stone Instituição de Pagamento S.A.', isGateway: true },
    ];

    for (const bank of banks) {
        await prisma.bankRegistry.upsert({
            where: { code: bank.code },
            update: {
                name: bank.name,
                isGateway: bank.isGateway,
            },
            create: {
                code: bank.code,
                name: bank.name,
                isGateway: bank.isGateway,
                isActive: true,
            },
        });
    }

    console.log(`✅ Seeded ${banks.length} banks/gateways.`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding banks:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

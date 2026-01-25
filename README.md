# 🏠 Vínculo Brasil - Plataforma de Tokenização de Recebíveis Imobiliários

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/pandorainfoporto-rgb/VinculoBrasil)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Status](https://img.shields.io/badge/status-Production-brightgreen.svg)]()

> Transformando aluguel em liquidez através de tokenização blockchain

## ✨ Novidades v2.0.0

🔄 **Polling Automático** - Tela atualiza sozinha após pagamento
📧 **Email Automático** - Comprovante enviado automaticamente  
🛡️ **Validação KYC** - CPF/telefone obrigatórios
🔧 **Painel Admin** - Retry manual para falhas
📱 **Mobile-First** - Responsividade completa

**[Ver Changelog Completo](CHANGELOG.md)** | **[Release Notes](docs/RELEASE_NOTES_v2.0.0.md)**

## 🚀 Instalação Rápida

```bash
# Clone
git clone https://github.com/pandorainfoporto-rgb/VinculoBrasil.git
cd VinculoBrasil

# Frontend
npm install
npm run dev

# Backend
cd server
npm install
npm run dev
```

## 📚 Documentação

- [📖 Guia de Implementação](IMPLEMENTATION_GUIDE.md)
- [📝 Resumo Executivo](FINAL_SUMMARY.md)
- [🔄 CHANGELOG](CHANGELOG.md)
- [📋 Release Notes v2.0.0](docs/RELEASE_NOTES_v2.0.0.md)

## 🏗️ Stack

**Frontend**: React 19, TypeScript, TailwindCSS, shadcn/ui
**Backend**: Node.js, Express, Prisma, PostgreSQL
**Blockchain**: Polygon, ERC-1155, Ethers.js

## ⚙️ Configuração

Adicione no `server/.env`:

```bash
DATABASE_URL="postgresql://..."
POLYGON_RPC_URL="https://polygon-rpc.com"
ASAAS_API_KEY="..."
SMTP_HOST="smtp.resend.com"
SMTP_PASS="re_..."
```

[Ver configuração completa →](docs/RELEASE_NOTES_v2.0.0.md#configuração-necessária)

## 📞 Suporte

- 📧 suporte@vinculobrasil.com
- 🐛 [GitHub Issues](https://github.com/pandorainfoporto-rgb/VinculoBrasil/issues)

---

<div align="center">

**v2.0.0 - Production Ready** 🚀

Made with ❤️ by Vínculo Brasil Team

</div>

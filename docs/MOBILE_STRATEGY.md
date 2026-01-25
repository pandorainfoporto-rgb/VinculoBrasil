# Estrategia Mobile - Vinculo.io

## Visao Geral

Este documento descreve a estrategia para disponibilizar o sistema Vinculo como aplicativos Android e iOS, mantendo a base de codigo React existente.

---

## Opcoes Disponiveis

### 1. PWA (Progressive Web App) - RECOMENDADO INICIAL
**Tempo de implementacao: 1-2 dias**

Transforma o app web atual em um aplicativo instalavel diretamente do navegador.

**Vantagens:**
- Implementacao rapida (horas)
- Sem necessidade de publicar nas lojas
- Atualizacoes instantaneas
- Mesmo codigo para web e mobile
- Funciona offline
- Push notifications (com limitacoes no iOS)

**Desvantagens:**
- Experiencia menos "nativa"
- Algumas APIs nativas indisponiveis
- iOS tem restricoes (notificacoes, etc)

**Ideal para:**
- MVP/Lancamento rapido
- Validacao de mercado
- Usuarios que acessam via link

---

### 2. Capacitor - RECOMENDADO PARA LOJAS
**Tempo de implementacao: 1-2 semanas**

Framework da Ionic que empacota apps web em containers nativos.

**Vantagens:**
- Usa o codigo React existente 100%
- Acesso a APIs nativas (camera, GPS, biometria, etc)
- Publicacao na App Store e Google Play
- Performance proxima ao nativo
- Plugins para funcionalidades especificas

**Desvantagens:**
- Requer contas de desenvolvedor ($99/ano Apple, $25 unico Google)
- Processo de revisao das lojas
- Build e deploy mais complexos

**Ideal para:**
- Publicacao nas lojas oficiais
- Funcionalidades nativas (biometria, camera para vistoria)
- Experiencia mais profissional

---

### 3. React Native - NAO RECOMENDADO
**Tempo de implementacao: 2-4 meses**

Reescrever toda a interface em React Native.

**Vantagens:**
- Performance verdadeiramente nativa
- Acesso completo a APIs nativas

**Desvantagens:**
- Requer reescrever TODO o codigo de UI
- Duplica esforco de manutencao
- Componentes diferentes (nao usa shadcn/ui, Tailwind)
- Tempo e custo elevados

**Ideal para:**
- Apps com requisitos extremos de performance
- Equipe dedicada mobile

---

## Estrategia Recomendada

### Fase 1: PWA (Imediato)
1. Configurar manifest.json e service worker
2. Adicionar icones e splash screens
3. Habilitar instalacao "Add to Home Screen"
4. Testar em dispositivos reais

### Fase 2: Capacitor (Apos Validacao)
1. Instalar e configurar Capacitor
2. Adicionar plugins nativos necessarios
3. Gerar builds Android e iOS
4. Publicar nas lojas

---

## Implementacao PWA

### Arquivos Necessarios

1. **manifest.json** - Metadados do app
2. **service-worker.js** - Cache e offline
3. **Icones** - Varios tamanhos para diferentes dispositivos

### Funcionalidades PWA

- **Instalavel**: Adicionar a tela inicial
- **Offline**: Cache de paginas e assets
- **Responsivo**: Ja implementado com Tailwind
- **HTTPS**: Obrigatorio (ja configurado)

---

## Implementacao Capacitor

### Plugins Recomendados

```bash
# Plugins essenciais para Vinculo
@capacitor/app          # Ciclo de vida do app
@capacitor/camera       # Camera para vistorias
@capacitor/geolocation  # GPS para localizacao de imoveis
@capacitor/push-notifications  # Notificacoes
@capacitor/browser      # Abrir links externos
@capacitor/share        # Compartilhamento nativo
@capacitor/splash-screen # Tela de carregamento
@capacitor/status-bar   # Controle da status bar
@capacitor/keyboard     # Controle do teclado
@capacitor/biometrics   # Face ID / Touch ID / Fingerprint
```

### Requisitos para Publicacao

**Google Play Store:**
- Conta de desenvolvedor ($25 taxa unica)
- APK/AAB assinado
- Listagem com screenshots
- Politica de privacidade

**Apple App Store:**
- Apple Developer Program ($99/ano)
- Certificados e provisioning profiles
- Mac para build (ou CI/CD como Codemagic)
- Revisao mais rigorosa

---

## Cronograma Sugerido

| Fase | Atividade | Duracao |
|------|-----------|---------|
| 1 | Configurar PWA | 1-2 dias |
| 2 | Testar PWA em dispositivos | 1 dia |
| 3 | Lancar PWA | Imediato |
| 4 | Configurar Capacitor | 2-3 dias |
| 5 | Adicionar plugins nativos | 3-5 dias |
| 6 | Testar em dispositivos | 2-3 dias |
| 7 | Preparar assets para lojas | 1-2 dias |
| 8 | Submeter para revisao | 1-7 dias |

---

## Proximos Passos

1. [x] Analisar opcoes (este documento)
2. [ ] Configurar PWA (manifest + service worker)
3. [ ] Configurar Capacitor
4. [ ] Criar icones e splash screens
5. [ ] Testar em dispositivos
6. [ ] Publicar nas lojas

---

## Comandos de Referencia

### PWA
```bash
# Gerar icones (usar ferramenta externa)
# Testar PWA
npm run build
npx serve dist
```

### Capacitor
```bash
# Instalar
npm install @capacitor/core @capacitor/cli
npx cap init "Vinculo" "io.vinculo.app"

# Adicionar plataformas
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# Build e sync
npm run build
npx cap sync

# Abrir em IDE nativa
npx cap open android  # Abre Android Studio
npx cap open ios      # Abre Xcode (requer Mac)
```

---

## Consideracoes Especiais para Vinculo

### Funcionalidades que Beneficiam de Nativo

1. **Camera para Vistorias**: Qualidade superior, metadata EXIF
2. **GPS para Imoveis**: Precisao melhor que browser
3. **Biometria**: Face ID/Touch ID para login seguro
4. **Push Notifications**: Alertas de pagamento, mensagens
5. **Deep Links**: Abrir app de links compartilhados

### Integracao Web3

O WalletConnect e conexoes de carteira funcionam bem tanto em PWA quanto Capacitor, usando o protocolo de deep linking para apps de carteira como MetaMask Mobile.

---

*Documento criado em Janeiro 2026*
*Versao 1.0*

# 🌑 Guia de Dark Mode - Regra de Ouro

## Para o Creao e Desenvolvedores

Este guia ensina como **NUNCA MAIS** ter problemas de contraste no Dark Mode.

---

## ⚠️ O Problema Comum

**ERRADO** ❌
```tsx
// Card branco com texto branco no dark mode = INVISÍVEL
<div className="bg-white text-gray-900">
  Olá Mundo
</div>
```

**CORRETO** ✅
```tsx
// Card que se adapta automaticamente
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Olá Mundo
</div>
```

---

## 🎨 Hierarquia de Cores (Copie e Cole)

### 1. Fundo da Página
```tsx
<div className="bg-gray-50 dark:bg-gray-900">
  {/* Conteúdo */}
</div>
```

### 2. Cards (Sempre destacam do fundo)
```tsx
<Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### 3. Títulos (Máximo contraste)
```tsx
<h1 className="text-gray-900 dark:text-white">
  Título Principal
</h1>
```

### 4. Descrições (Leitura suave)
```tsx
<p className="text-gray-500 dark:text-gray-400">
  Descrição ou subtítulo
</p>
```

### 5. Bordas (Separação sutil)
```tsx
<div className="border border-gray-200 dark:border-gray-700">
  {/* Conteúdo */}
</div>
```

---

## 📦 Templates Prontos

### Card de Métrica (KPI)
```tsx
<Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
  <CardContent className="p-6">
    <div className="flex justify-between items-start mb-4">
      {/* Ícone */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
        <TrendingUp className="w-6 h-6" />
      </div>

      {/* Badge */}
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
        +12.5%
      </span>
    </div>

    {/* Título */}
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      Receita Total
    </p>

    {/* Valor */}
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
      R$ 28.900
    </h3>
  </CardContent>
</Card>
```

### Botão Primário
```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Clique Aqui
</Button>
```

### Botão Secundário
```tsx
<Button
  variant="outline"
  className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
>
  Cancelar
</Button>
```

### Lista de Itens
```tsx
<div className="space-y-4">
  {items.map((item) => (
    <div
      key={item.id}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <h4 className="font-bold text-gray-900 dark:text-white">
        {item.title}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {item.description}
      </p>
    </div>
  ))}
</div>
```

---

## 🎯 Paleta de Cores por Categoria

### Backgrounds
| Light | Dark | Uso |
|-------|------|-----|
| `bg-white` | `bg-gray-800` | Cards, Painéis |
| `bg-gray-50` | `bg-gray-900` | Fundo da página |
| `bg-gray-100` | `bg-gray-800` | Seções alternadas |

### Textos
| Light | Dark | Uso |
|-------|------|-----|
| `text-gray-900` | `text-white` | Títulos principais |
| `text-gray-700` | `text-gray-200` | Textos importantes |
| `text-gray-500` | `text-gray-400` | Descrições |
| `text-gray-400` | `text-gray-500` | Placeholders |

### Bordas
| Light | Dark | Uso |
|-------|------|-----|
| `border-gray-100` | `border-gray-700` | Bordas finas |
| `border-gray-200` | `border-gray-700` | Bordas médias |
| `border-gray-300` | `border-gray-600` | Bordas grossas |

### Estados de Cor
| Cor | Light | Dark |
|-----|-------|------|
| **Sucesso** | `text-green-600` | `text-green-400` |
| **Erro** | `text-red-600` | `text-red-400` |
| **Aviso** | `text-amber-600` | `text-amber-400` |
| **Info** | `text-blue-600` | `text-blue-400` |

---

## 🚫 O que NUNCA Fazer

### ❌ ERRADO
```tsx
// Texto branco direto (não se adapta ao light mode)
<p className="text-white">Texto</p>

// Fundo preto absoluto (muito escuro)
<div className="bg-black">Card</div>

// Sem dark mode (fica branco com texto preto no modo escuro)
<div className="bg-white text-gray-900">Card</div>
```

### ✅ CORRETO
```tsx
// Texto que se adapta
<p className="text-gray-900 dark:text-white">Texto</p>

// Fundo cinza escuro (não preto absoluto)
<div className="bg-gray-900">Background</div>

// Com adaptação para dark mode
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Card
</div>
```

---

## 🔧 CSS Global (Já Configurado)

O arquivo `/src/styles.css` já contém as regras automáticas:

```css
/* Cards no Dark Mode viram cinza escuro automaticamente */
.dark .bg-white {
  @apply bg-gray-800;
}

/* Texto preto vira branco automaticamente */
.dark .text-gray-900 {
  @apply text-white;
}

/* Bordas claras viram escuras automaticamente */
.dark .border-gray-100 {
  @apply border-gray-700;
}
```

**Isso significa**: Se você usar as classes corretas, o Dark Mode funciona AUTOMATICAMENTE! ✨

---

## 📝 Checklist Rápido

Antes de commitar, verifique:

- [ ] Todos os cards têm `dark:bg-gray-800`?
- [ ] Todos os títulos têm `dark:text-white`?
- [ ] Todas as descrições têm `dark:text-gray-400`?
- [ ] Todas as bordas têm `dark:border-gray-700`?
- [ ] O fundo da página tem `dark:bg-gray-900`?

Se sim, seu componente está **100% compatível** com Dark Mode! 🎉

---

## 🎓 Exemplo Completo

```tsx
export function MeuComponente() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meu Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Bem-vindo de volta!
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receita
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ 10.000
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Dica Final

**Sempre pense em HIERARQUIA, não em cores fixas:**

1. **Fundo** = Mais escuro
2. **Card** = Destaca do fundo
3. **Título** = Máximo contraste
4. **Descrição** = Contraste médio
5. **Borda** = Separação sutil

Seguindo essa hierarquia, seu design SEMPRE fica bonito! 💎

---

**Criado por**: Claude @ Vínculo Brasil
**Atualizado**: Janeiro 2025

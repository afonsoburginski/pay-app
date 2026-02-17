# Source (`src/`)

Estrutura modular do app. O alias `@/` aponta para esta pasta.

## Estrutura

- **`app/`** – Rotas do Expo Router (file-based routing)
- **`components/`** – Componentes reutilizáveis (UI, ícones, layouts)
- **`hooks/`** – Hooks customizados (tema, color scheme, etc.)
- **`theme/`** – Cores, globals e ThemeProvider
- **`constants/`** – Constantes da aplicação (tema legado, config)
- **`lib/`** – Utilitários e helpers compartilhados
- **`assets/`** – Imagens e assets estáticos (se existir)

## Uso

```ts
import { ThemeProvider } from '@/theme/theme-provider';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

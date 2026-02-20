# Pay-App – Progresso e Próximos Passos

Este documento descreve **o que já foi feito** no app (alinhado ao **document.md**) e **os próximos passos** para chegar ao MVP.

---

## Proposta do app (resumo)

App fintech estilo “dólar digital”: usuário converte moeda local em **USDC**, mantém saldo e gasta globalmente com cartão. Foco em **simplicidade**, **baixo custo** e **LATAM**. Não é plataforma de trading; o usuário não lida com cripto diretamente.

* **Saldo** – Tudo em USDC.
* **Send** – Enviar USDC (entre usuários DolarApp ou sacar para banco em COP/ARS/BRL).
* **Receive** – Adicionar saldo (fiat → USDC ou receber de outro usuário).
* **Card** – Cartão virtual (e depois físico) para gastar USDC no mundo.

Regras de negócio e integrações futuras estão em **document.md** (seções 4 e 16).

---

## Parte já feita

### Stack e infraestrutura

* [x] **Framework** – Expo (SDK 54) + Expo Router (tabs)
* [x] **UI** – React Native, mobile-first
* [x] **Banco local** – WatermelonDB (LokiJS no Expo Go/web; SQLite em dev build)
* [x] **Cache em memória** – React Query (@tanstack/react-query) – staleTime/gcTime configurados
* [x] **Navegação** – Bottom tabs: Account, Cards, Send, Receive (Explore oculto)
* [x] **Tema** – ThemeProvider; verde de marca `#16a34a` usado na Account e tabs
* [x] **Metro** – metro.config.js ajustado para React Query (build legacy)

### Banco de dados (WatermelonDB)

* [x] **Tabela accounts** – Saldo USDC e símbolo da moeda (1 conta por app)
* [x] **Tabela transactions** – Histórico (nome, data, valor USDC, valor fiat, ícone)
* [x] **Tabela dollar_prices** – Preço compra/venda e símbolo fiat (ex.: MXN)
* [x] Schema, models (Account, Transaction, DollarPrice), migrations e seed em `src/database/`
* [x] **DatabaseProvider** – Sobe o DB, roda `seedIfEmpty()` e envolve o app com DatabaseProvider do WatermelonDB
* [x] **Sem dados mockados** – Toda leitura vem do banco; React Query faz cache em memória

### Tela Account (tab principal)

* [x] **Header verde** – Radius 12; faixa verde atrás do scroll no pull-to-refresh
* [x] **Saldo em USDC** – Vindo do banco (accounts), formatado em dólar
* [x] **Badge** – “Balance in USDC” + bandeira
* [x] **Botões Reload e Send** – Largura total do container (flex 1 cada)
* [x] **Lista de transações** – Do banco (transactions), com ícone, nome, data, valor USDC e fiat
* [x] **Link** – “View all transactions” (tela de lista completa ainda não implementada)
* [x] **Card “Digital Dollar Price”** – Compra/venda a partir de `dollar_prices`
* [x] **Pull-to-refresh** – Refetch das queries no DB; overlay verde com um único spinner em posição fixa
* [x] **Hooks de dados** – `useAccountBalance`, `useTransactions`, `useDollarPrice` (React Query + WatermelonDB)
* [x] **Invalidação pós-seed** – DatabaseProvider invalida as queries para a primeira tela já mostrar dados

### Telas Send e Receive

* [x] **Send** – Tela com fluxo “enviar USDC”; texto “email or wallet address” para destinatário (sem integração real)
* [x] **Receive** – Tela para “adicionar saldo”; textos em inglês (sem integração real)

### Tela Cards

* [x] **Cards** – Tela placeholder para cartão virtual/físico (sem lógica de emissão ou gastos)

### Componentes e utilitários

* [x] **Ícones** – User, Help, Plus, Send, Chart, Wallet, CreditCards, Banknotes, etc.
* [x] **DatabaseProvider, ThemeProvider**
* [x] **Query client** – `src/lib/query-client.ts`
* [x] **Hooks de dados** – `src/hooks/use-account-data.ts` (query keys exportadas para invalidação)

---

## O que ainda não foi feito (próximos passos)

Seguindo o **document.md** (seção 4 – Core Features MVP) e a seção 16 (premissa e integrações):

### 1. Autenticação e conta (4.1)

* [ ] Login (email ou social).
* [ ] Verificação de telefone.
* [ ] Integração com parceiro de KYC (conforme doc).

### 2. Fiat → USDC – Depositar (4.2 e 16)

* [ ] Tela “Add balance” / “Receive” funcional com opções:
  * PSE (Colômbia), transferência US, ARG, Brasil, etc.
* [ ] Mostrar taxa de conversão e spread.
* [ ] Confirmação e conversão fiat → USDC.
* [ ] Atualização do saldo em tempo real (já temos DB + React Query; falta backend/parceiro).

### 3. Saldo USDC (4.3)

* [ ] Diferenciar saldo **disponível** vs **pendente** (hoje só um valor).
* [ ] Equivalente em fiat no header (opcional, conforme design).

### 4. USDC → Fiat – Sacar (4.4 e 16)

* [ ] Fluxo “Withdraw to my bank” (COP, ARS, BRL).
* [ ] Valor mínimo, taxa e prazo exibidos.
* [ ] Integração com rails de saque.

### 5. Enviar USDC entre usuários (16)

* [ ] “Send in DolarApp”: enviar para outro usuário (phone, email, @username).
* [ ] Integração com backend/parceiro para transferência entre contas.

### 6. Cartão (4.5 e 16)

* [ ] Cartão virtual (emissão e exibição).
* [ ] Lógica: debitar USDC, converter para moeda local no gasto.
* [ ] Depois: cartão físico.
* [ ] Parceiro Visa/Mastercard.

### 7. Histórico de transações (4.6)

* [ ] Tela “View all transactions” com lista completa.
* [ ] Filtros/tipos: depósitos, saques, conversões, pagamentos com cartão.
* [ ] Status, taxa, FX e timestamp por transação (model/API podem precisar evoluir).

### 8. Preço e gráfico (4.7)

* [ ] USD vs moeda local (já temos buy/sell no card; pode evoluir para mais pares).
* [ ] Gráfico histórico (informacional).

### 9. Backend e sync

* [ ] API real para: auth, saldo, transações, preços, depósitos, saques, envio entre usuários, cartão.
* [ ] Sync do app com a API (pull-to-refresh já preparado; falta implementar o sync no `onRefresh` e possivelmente background sync).
* [ ] Custódia USDC e compliance via parceiros (document.md seções 7 e 9).

### 10. Ajustes de produto e UX

* [ ] Textos e copy em português (ou idioma alvo) onde ainda estiver em inglês.
* [ ] Limites e controles (4.8): limites diários/mensais e níveis de verificação.
* [ ] Tratamento de erros e estados vazios em todas as telas.
* [ ] Testes (unitários e E2E) e revisão de acessibilidade.

---

## Ordem sugerida para os próximos passos

1. **Backend mínimo + auth** – Login e API de saldo/transações para tirar o app “só local”.
2. **Sync no refresh** – No `onRefresh` da Account, chamar API e persistir no WatermelonDB; manter React Query para cache.
3. **“View all transactions”** – Tela de histórico completo usando a mesma fonte de dados (DB + API).
4. **Add balance (Receive)** – Fluxo fiat → USDC com taxa e confirmação (integração com parceiro quando houver).
5. **Withdraw (Send → banco)** – Fluxo USDC → fiat para COP/ARS/BRL.
6. **Send entre usuários** – Envio USDC para outro usuário DolarApp.
7. **Cartão virtual** – Emissão e exibição; depois débito em USDC e parceiro de cartão.
8. **Preço + gráfico** – Evoluir o card de preço e adicionar gráfico histórico.
9. **KYC, limites e compliance** – Conforme document.md e parceiros.

---

## Referência rápida de arquivos

| Área | Arquivos principais |
|------|----------------------|
| Especificação | `document.md` |
| Layout raiz | `src/app/_layout.tsx` (QueryClient, DatabaseProvider, ThemeProvider) |
| Tabs | `src/app/(tabs)/_layout.tsx`, `index.tsx`, `send.tsx`, `receive.tsx`, `cards.tsx` |
| Banco | `src/database/` (schema, migrations, models, seed, index) |
| Provider do DB | `src/components/database-provider.tsx` |
| Cache | `src/lib/query-client.ts`, `src/hooks/use-account-data.ts` |
| Account (UI) | `src/app/(tabs)/index.tsx` |

---

*Última atualização: reflete o estado do app após implementação do banco local, React Query, tela Account completa com refresh, e telas Send/Receive/Cards como placeholders.*

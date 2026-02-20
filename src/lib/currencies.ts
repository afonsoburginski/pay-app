/**
 * Moedas disponíveis para converter para/de USDC (dólar digital).
 * Fonte única para Send (withdraw), Receive (deposit) e preferência no perfil.
 */

export type CurrencyCode = 'BRL' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN' | 'USD';

export type SupportedCurrency = {
  code: CurrencyCode;
  /** Label curto (ex.: "Real (BRL)") – perfil e listas */
  label: string;
  /** Label longo em inglês (ex.: "Brazilian reais (BRL)") – Receive/Send */
  labelLong: string;
  /** Pode depositar nessa moeda → converte para USDC */
  supportsDeposit: boolean;
  /** Pode sacar USDC → recebe nessa moeda no banco */
  supportsWithdraw: boolean;
  /** Método de depósito (ex.: "Pix or bank transfer") – só quando supportsDeposit */
  depositMethod?: string;
};

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  {
    code: 'BRL',
    label: 'Real (BRL)',
    labelLong: 'Brazilian reais (BRL)',
    supportsDeposit: true,
    supportsWithdraw: true,
    depositMethod: 'Pix or bank transfer',
  },
  {
    code: 'COP',
    label: 'Peso colombiano (COP)',
    labelLong: 'Colombian pesos (COP)',
    supportsDeposit: true,
    supportsWithdraw: true,
    depositMethod: 'PSE or bank transfer',
  },
  {
    code: 'ARS',
    label: 'Peso argentino (ARS)',
    labelLong: 'Argentine pesos (ARS)',
    supportsDeposit: true,
    supportsWithdraw: true,
    depositMethod: 'Bank transfer (ARG)',
  },
  {
    code: 'USD',
    label: 'Dólar (USD)',
    labelLong: 'US dollars (USD)',
    supportsDeposit: true,
    supportsWithdraw: true,
    depositMethod: 'US bank transfer',
  },
  {
    code: 'MXN',
    label: 'Peso mexicano (MXN)',
    labelLong: 'Mexican pesos (MXN)',
    supportsDeposit: false,
    supportsWithdraw: false,
  },
  {
    code: 'CLP',
    label: 'Peso chileno (CLP)',
    labelLong: 'Chilean pesos (CLP)',
    supportsDeposit: false,
    supportsWithdraw: false,
  },
  {
    code: 'PEN',
    label: 'Sol (PEN)',
    labelLong: 'Peruvian sol (PEN)',
    supportsDeposit: false,
    supportsWithdraw: false,
  },
];

/** Lista para preferência de moeda no perfil (code + label) */
export const CURRENCIES_FOR_PROFILE = SUPPORTED_CURRENCIES.map(({ code, label }) => ({ code, label }));

/** As mesmas 4 moedas nas telas Send e Receive (converter para/de USDC). Ordem: BRL, COP, ARS, USD. */
const CONVERTIBLE_FOUR = SUPPORTED_CURRENCIES.filter(
  (c) => c.supportsDeposit && c.supportsWithdraw
) as SupportedCurrency[];

/** Moedas para sacar USDC (Send → Withdraw to bank). Mesmas 4 da Receive. */
export const WITHDRAW_CURRENCIES = CONVERTIBLE_FOUR.map((c) => ({
  id: c.code.toLowerCase() as Lowercase<typeof c.code>,
  code: c.code,
  label: c.labelLong,
}));

/** Moedas para depositar e converter para USDC (Receive → Add balance). Mesmas 4 do Send. */
export const DEPOSIT_CURRENCIES = CONVERTIBLE_FOUR.map((c) => ({
  id: c.code.toLowerCase() as Lowercase<typeof c.code>,
  code: c.code,
  primary: c.labelLong,
  secondary: c.code === 'USD' ? 'Deposit in USD → credited as USDC' : `Deposit in ${c.code} → converted to USDC`,
  method: c.depositMethod ?? '',
}));

/** Detalhes de depósito por código (placeholder; dados reais do backend depois) */
export const DEPOSIT_DETAILS: Record<string, { label: string; value: string }[]> = {
  COP: [
    { label: 'Reference number', value: 'REF-COL-2024-987654' },
    { label: 'Bank / method', value: 'PSE – Any supported bank' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  ARS: [
    { label: 'CBU / CVU', value: '0000003100012345678901' },
    { label: 'Bank', value: 'Banco Example AR' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  BRL: [
    { label: 'Pix key (email)', value: 'user@dolarapp.com' },
    { label: 'Or bank transfer', value: 'Branch 1234 – Account 56789-0' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  USD: [
    { label: 'Entity', value: 'Lineage Bank' },
    { label: 'Account number', value: '123456789' },
    { label: 'Routing number', value: '021000021' },
    { label: 'Account type', value: 'Checking' },
  ],
};

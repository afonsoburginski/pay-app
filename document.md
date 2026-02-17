# USDC Fintech App – Business Rules & Product Specification

## 1. Product Goal

Create a simple, low‑cost fintech app that allows users to convert local currencies into USDC, store funds, and spend globally through a Visa or Mastercard debit card. The focus is:

* Simplicity
* Low fees
* Fast global access
* Strong UX
* Compliance via partners
* No direct crypto complexity for users

The product targets emerging markets (LATAM first), especially users who want protection from inflation and easy global payments.

---

## 2. Core Value Proposition

Users should:

1. Protect money in USD value.
2. Move money globally.
3. Spend anywhere with a card.
4. Avoid high banking and FX fees.
5. Access financial services without traditional banks.

The app is positioned as:

* A USD wallet
* A stable global payment account
* A simple digital dollar app

Not a trading or crypto platform.

---

## 3. Target Users

### Primary

* People in high inflation countries.
* Freelancers receiving international payments.
* Remote workers.
* Digital nomads.

### Secondary

* Users who want global payments.
* Users without access to USD banking.

---

## 4. Core Features (MVP)

### 4.1 Account Creation

Users create an account with:

* Email or social login.
* Phone verification.

KYC is handled by infrastructure partners.

### 4.2 Fiat → USDC Conversion

Users deposit local currency.

Business rules:

* The app shows the conversion rate.
* A small spread may be applied.
* The user confirms the conversion.
* The system converts fiat to USDC.
* USDC balance updates in real time.

### 4.3 USDC Balance

Users see:

* Total USDC.
* Fiat equivalent.
* Available vs pending balance.

### 4.4 USDC → Fiat

Users can withdraw:

* Bank transfer.
* Local payment rails.

Business rules:

* Minimum withdrawal amount.
* Withdrawal fee or spread.
* Processing time disclosed.

### 4.5 Card Payments

Users receive a virtual card first.

Later:

* Physical card.

When a user pays:

1. The card checks available USDC.
2. The amount is converted to local currency.
3. The USDC balance is reduced.
4. The transaction appears instantly.

### 4.6 Transaction History

Users can view:

* Deposits
* Withdrawals
* Conversions
* Card payments

Each transaction includes:

* Status
* FX rate
* Fees
* Timestamp

### 4.7 Price & Chart

The app shows:

* USD vs local currency.
* Historical charts.

This is informational only.

---

## 5. Revenue Model

The app aims to keep fees low.

Revenue streams:

1. Interchange from card spending.
2. Small FX spread.
3. Premium features later.

Optional future:

* Subscriptions.
* Rewards.

---

## 6. Fees Strategy

Principles:

* Transparent.
* Lower than banks.
* Competitive vs crypto exchanges.

Possible fees:

* Conversion spread.
* Withdrawal fee.
* Premium subscription.

---

## 7. Compliance & Risk

Handled primarily by partners.

Responsibilities:

* KYC and AML.
* Fraud monitoring.
* Sanctions screening.

Internal responsibilities:

* Suspicious activity monitoring.
* Transaction limits.

---

## 8. Limits & Controls

Users may have:

* Daily limits.
* Monthly limits.
* Tiered levels.

Higher limits require more verification.

---

## 9. Security Principles

* User funds must be protected.
* No direct crypto exposure.
* Custody handled by infrastructure providers.

---

## 10. UX Principles

The app should:

* Hide crypto complexity.
* Focus on "digital dollars".
* Provide instant feedback.
* Show clear balances.
* Be mobile‑first.

---

## 11. Future Features

Not in MVP but planned:

* Cashback.
* Rewards.
* International transfers.
* Savings.
* Bill payments.
* Payroll.

---

## 12. Growth Strategy

Start with:

* LATAM.
* Remote workers.

Then expand globally.

Key growth channels:

* Influencers.
* Community.
* Referral.

---

## 13. Metrics

Key KPIs:

* Active users.
* Volume converted.
* Card spend.
* Retention.
* CAC vs LTV.

---

## 14. Key Risks

* Regulation.
* Partner dependency.
* FX volatility.
* Fraud.

---

## 15. Strategic Focus

The company must prioritize:

1. Growth.
2. User trust.
3. Low cost.
4. Fast iteration.

The product should always remain simple.

---

This document defines the product and business logic to guide development, decision making, and AI assistance tools.

---

## 16. App premise and future integrations

The app already follows this premise in the UI and flows:

* **Balance and currency** – Everything in the app is in **USDC** (digital dollar). The focus is to make converting to digital dollars easy and cheap; it is not a trading or crypto platform.
* **Send** – Always sending USDC. Two options: (1) **Send in DolarApp** (USDC to another DolarApp user) and (2) **Withdraw to my bank** (convert USDC to local currency and send to bank – official South American currencies: COP, ARS, BRL).
* **Receive / Add balance** – Add USDC balance from local currencies (South America) or US dollar transfer; "Request from a friend" in DolarApp option.
* **Card** – Virtual card (and later physical) to spend USDC globally; user does not deal with crypto directly.

The **integrations** below are planned for the future (partners, backends, payment rails); the UI and flows are already prepared for them:

* **Fiat → USDC (deposit)**  
  PSE (Colombia), US bank transfer, ARG transfer, Brazil transfer, etc., per section 4.2.
* **USDC → Fiat (withdrawal)**  
  Withdrawal to bank account in COP, ARS, BRL (and other local currencies), per section 4.4.
* **Send between DolarApp users**  
  Sending USDC to another DolarApp account (phone, email, @username).
* **Debit card**  
  Issuance and processing of virtual/physical card with partner (Visa/Mastercard), per sections 4.5 and 5.
* **KYC / compliance**  
  Via infrastructure partners (section 7).
* **USDC custody**  
  Via infrastructure providers (section 9).

When implementing new screens or features, use this document as the source of truth and keep the premise: simplicity, low cost, "digital dollar" without exposing crypto complexity to the user.

import { Currency, ICurrency } from "@models/database/currency.model";

// Currency conversion conventions
// -------------------------------------------------------------------
// Every currency document stores `exchangeRate` as the number of UNITS
// of that currency that equal 1 unit of the BU's MAIN currency. The main
// currency itself uses exchangeRate=1 by convention.
//
// Example (BU main = USD):
//   USD: exchangeRate = 1
//   EUR: exchangeRate = 0.92   →  1 USD = 0.92 EUR
//   GBP: exchangeRate = 0.79   →  1 USD = 0.79 GBP
//
// All money math inside the API is normalized to the BU's main currency
// before being stored on an Order. Use these helpers — never divide by
// exchange rates inline; the convention is easy to flip without realizing.

/** Convert a value FROM an arbitrary currency TO the BU's main currency. */
export const toMain = (amount: number, fromExchangeRate: number): number => {
  if (!fromExchangeRate || fromExchangeRate <= 0) {
    throw new Error("Invalid source exchangeRate (must be > 0)");
  }
  return amount / fromExchangeRate;
};

/** Convert a value expressed in the main currency TO another currency. */
export const fromMain = (mainAmount: number, toExchangeRate: number): number => {
  if (!toExchangeRate || toExchangeRate <= 0) {
    throw new Error("Invalid target exchangeRate (must be > 0)");
  }
  return mainAmount * toExchangeRate;
};

/** Convert directly between two non-main currencies via main as a pivot. */
export const convert = (
  amount: number,
  fromExchangeRate: number,
  toExchangeRate: number
): number => fromMain(toMain(amount, fromExchangeRate), toExchangeRate);

/** Resolve the (single) main currency document for a given business unit. */
export const getMainCurrency = async (
  businessUnitID: string
): Promise<ICurrency> => {
  const main = await Currency.findOne({
    businessUnit: businessUnitID,
    main: true,
  });
  if (!main) {
    throw new Error(
      `No main currency configured for business unit ${businessUnitID}`
    );
  }
  return main;
};

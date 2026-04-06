import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("Pricing Calculator", () => {
  it("calculates price with markup percentage", () => {
    const result = db.calculatePrice(100, { type: 'markup', value: 50 });
    expect(result).toBe(150); // 100 + 50% = 150
  });

  it("calculates price with margin percentage", () => {
    const result = db.calculatePrice(100, { type: 'margin', value: 50 });
    expect(result).toBe(200); // cost / (1 - margin) = 100 / 0.5 = 200
  });

  it("calculates price with fixed value", () => {
    const result = db.calculatePrice(100, { type: 'fixed', value: 50 });
    expect(result).toBe(150); // 100 + 50 = 150
  });

  it("includes additional costs in calculation", () => {
    const result = db.calculatePrice(100, { type: 'markup', value: 50, additionalCosts: 20 });
    expect(result).toBe(180); // (100 + 20) * 1.5 = 180
  });

  it("throws error for margin >= 100%", () => {
    expect(() => db.calculatePrice(100, { type: 'margin', value: 100 })).toThrow();
    expect(() => db.calculatePrice(100, { type: 'margin', value: 150 })).toThrow();
  });
});

describe("Margin Analysis", () => {
  it("calculates margin and markup from prices", () => {
    const result = db.calculateMarginFromPrice(100, 150);
    
    expect(result.profit).toBe(50);
    expect(result.margin).toBeCloseTo(33.33, 1); // 50/150 * 100 = 33.33%
    expect(result.markup).toBe(50); // 50/100 * 100 = 50%
  });

  it("handles zero selling price", () => {
    const result = db.calculateMarginFromPrice(100, 0);
    
    // When selling price is 0 or negative, function returns zeros
    expect(result.profit).toBe(0);
    expect(result.margin).toBe(0);
    expect(result.markup).toBe(0);
  });

  it("handles negative profit (loss)", () => {
    const result = db.calculateMarginFromPrice(100, 80);
    
    expect(result.profit).toBe(-20);
    expect(result.margin).toBe(-25); // -20/80 * 100 = -25%
    expect(result.markup).toBe(-20); // -20/100 * 100 = -20%
  });
});

describe("DRE Report Structure", () => {
  it("getDreReport function exists and is callable", () => {
    // Test that the function exists
    expect(typeof db.getDreReport).toBe('function');
  });
});

describe("Bank Account Operations", () => {
  it("should have correct bank account structure", async () => {
    // Test that the function exists and returns expected structure
    const accounts = await db.getBankAccounts();
    expect(Array.isArray(accounts)).toBe(true);
  });

  it("should have correct bank transactions structure", async () => {
    const transactions = await db.getBankTransactions({});
    expect(Array.isArray(transactions)).toBe(true);
  });
});

describe("Pricing Rules", () => {
  it("should return array for pricing rules", async () => {
    const rules = await db.getPricingRules();
    expect(Array.isArray(rules)).toBe(true);
  });
});

import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: 'user' | 'admin' = 'user'): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("ERP System - Auth", () => {
  it("returns user info for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });

  it("returns null for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });
});

describe("ERP System - Categories", () => {
  it("lists categories for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.categories.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user trying to list categories", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.categories.list({})).rejects.toThrow();
  });
});

describe("ERP System - Customers", () => {
  it("lists customers for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.customers.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user trying to list customers", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.customers.list({})).rejects.toThrow();
  });
});

describe("ERP System - Products", () => {
  it("lists products for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.products.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user trying to list products", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.products.list({})).rejects.toThrow();
  });
});

describe("ERP System - Orders", () => {
  it("lists orders for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.orders.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user trying to list orders", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.orders.list({})).rejects.toThrow();
  });
});

describe("ERP System - Financial", () => {
  it("lists financial transactions for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.financial.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for unauthenticated user trying to list financial transactions", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.financial.list({})).rejects.toThrow();
  });
});

describe("ERP System - Dashboard", () => {
  it("returns dashboard stats for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.dashboard.stats();
    
    expect(result).toBeDefined();
    expect(typeof result?.totalCustomers).toBe('number');
    expect(typeof result?.totalProducts).toBe('number');
  });

  it("throws for unauthenticated user trying to get dashboard stats", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });
});

describe("ERP System - Admin Only", () => {
  it("allows admin to list users", async () => {
    const ctx = createAuthContext('admin');
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.users.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for regular user trying to list users", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("allows admin to list audit logs", async () => {
    const ctx = createAuthContext('admin');
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.audit.list({});
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws for regular user trying to list audit logs", async () => {
    const ctx = createAuthContext('user');
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.audit.list({})).rejects.toThrow();
  });
});

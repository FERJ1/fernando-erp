      additionalCosts: z.number().optional(),
    })).query(({ input }) => {
      try {
        const price = db.calculatePrice(input.costPrice, {
          type: input.type,
          value: input.value,
          additionalCosts: input.additionalCosts,
        });
        const analysis = db.calculateMarginFromPrice(input.costPrice + (input.additionalCosts || 0), price);
        return {
          suggestedPrice: price,
          margin: analysis.margin,
          markup: analysis.markup,
          profit: analysis.profit,
        };
      } catch (error: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      }
    }),
    
    analyzePrice: protectedProcedure.input(z.object({
      costPrice: z.number(),
      sellingPrice: z.number(),
    })).query(({ input }) => {
      return db.calculateMarginFromPrice(input.costPrice, input.sellingPrice);
    }),
  }),

  // ==================== DRE ====================
  dre: router({
    report: protectedProcedure.input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    })).query(async ({ input }) => {
      return await db.getDreReport(input.startDate, input.endDate);
    }),
    
    categories: router({
      list: protectedProcedure.query(async () => {
        return await db.getDreCategories();
      }),
      
      create: adminProcedure.input(z.object({
        name: z.string().min(1),
        type: z.enum(['revenue', 'cost', 'expense', 'tax']),
        parentId: z.number().optional().nullable(),
        orderIndex: z.number().optional(),
      })).mutation(async ({ ctx, input }) => {
        const result = await db.createDreCategory(input);
        await db.createAuditLog({
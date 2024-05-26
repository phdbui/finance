import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { subDays, parse, differenceInDays } from "date-fns";
import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { calculatePercentage, fillMissingDays } from "@/lib/utils";
const app = new Hono().get(
  "/",
  clerkMiddleware(),
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, {
        res: c.json({ message: "Unauthorized" }, 401),
      });
    }
    const { from, to, accountId } = c.req.valid("query");
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    async function fetchFinancialData(
      userId: string,
      startedDate: Date,
      endDate: Date
    ) {
      return await db
        .select({
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number
            ),
          expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number
            ),
          remaining: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            //   accountId ? eq(accounts.id, accountId) : undefined,
            eq(accounts.userId, userId),
            gte(transactions.date, startedDate),
            lte(transactions.date, endDate)
          )
        );
    }

    const [currentPeriod] = await fetchFinancialData(
      auth.userId,
      startDate,
      endDate
    );
    const [lastPeriod] = await fetchFinancialData(
      auth.userId,
      lastPeriodStart,
      lastPeriodEnd
    );

    const incomeChange = calculatePercentage(
      currentPeriod.income ?? 0,
      lastPeriod.income ?? 0
    );
    const expensesChange = calculatePercentage(
      currentPeriod.expenses ?? 0,
      lastPeriod.expenses ?? 0
    );
    const remainingChange = calculatePercentage(
      currentPeriod.remaining ?? 0,
      lastPeriod.remaining ?? 0
    );

    const category = await db
      .select({
        name: categories.name,
        value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(accounts.id, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          lt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`.mapWith(Number)));

    const topCategories = category.slice(0, 3);
    const otherCategories = category.slice(3);
    const otherSum = otherCategories.reduce((acc, curr) => acc + curr.value, 0);
    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({ name: "Other", value: otherSum });
    }

    const activeDays = await db
      .select({
        date: transactions.date,
        income:
          sql`SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
            Number
          ),
        expenses:
          sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
            Number
          ),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          accountId ? eq(accounts.id, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          // lt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.date)
      .orderBy(transactions.date);

    const days = fillMissingDays(activeDays, startDate, endDate);
    // return c.json({
    //   currentPeriod,
    //   lastPeriod,
    //   incomeChange,
    //   expensesChange,
    //   remainingChange,
    //   finalCategories,
    //   days,
    // });
    return c.json({
      data: {
        remainingAmount: currentPeriod.remaining,
        remainingChange: remainingChange,
        incomeAmount: currentPeriod.income,
        incomeChange: incomeChange,
        expensesAmount: currentPeriod.expenses,
        expensesChange: expensesChange,
        categories: finalCategories,
        days,
      },
    });
  }
);

export default app;

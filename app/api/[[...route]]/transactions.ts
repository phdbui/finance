import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { subDays, parse } from "date-fns";
import {
  transactions,
  categories,
  accounts,
  insertTransactionSchema,
} from "@/db/schema";
import { eq, inArray, and, gte, lte, desc, sql } from "drizzle-orm";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
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
      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));
      return c.json({ data });
    }
  )
  .get(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      if (!id) {
        throw new HTTPException(400, {
          res: c.json({ error: "Invalid id" }, 400),
        });
      }
      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Transaction not found" }, 404),
        });
      }
      return c.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const values = c.req.valid("json");
      const [data] = await db
        .insert(transactions)
        .values({ id: createId(), ...values })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const values = c.req.valid("json");
      const data = await db
        .insert(transactions)
        .values(values.map((t) => ({ id: createId(), ...t })))
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const { ids } = c.req.valid("json");
      if (!ids) {
        throw new HTTPException(400, {
          res: c.json({ error: "Invalid ids" }, 400),
        });
      }
      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(inArray(transactions.id, ids), eq(accounts.userId, auth.userId))
          )
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const { id } = c.req.valid("param");
      if (!id) {
        throw new HTTPException(400, {
          res: c.json({ error: "Invalid id" }, 400),
        });
      }
      const values = c.req.valid("json");

      const transactionToUpdate = db.$with("transaction_to_update").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactions)
        .set(values)
        .where(
          eq(transactions.id, sql`(select id from ${transactionToUpdate})`)
        )
        .returning();
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Transaction not found" }, 404),
        });
      }
      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const { id } = c.req.valid("param");
      if (!id) {
        throw new HTTPException(400, {
          res: c.json({ error: "Invalid id" }, 400),
        });
      }
      const transactionToDelete = db.$with("transaction_to_delete").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );
      const [data] = await db
        .with(transactionToDelete)
        .delete(transactions)
        .where(
          eq(transactions.id, sql`(select id from ${transactionToDelete})`)
        )
        .returning();
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Transaction not found" }, 404),
        });
      }
      return c.json({ data });
    }
  );

export default app;

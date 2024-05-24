import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { eq, inArray, and } from "drizzle-orm";
import { categories, insertCategorySchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, {
        res: c.json({ message: "Unauthorized" }, 401),
      });
    }
    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.userId, auth.userId));
    return c.json({ data });
  })
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
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, auth.userId)));
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Category not found" }, 404),
        });
      }
      return c.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertCategorySchema.pick({ name: true })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ message: "Unauthorized" }, 401),
        });
      }
      const values = c.req.valid("json");
      const [data] = await db
        .insert(categories)
        .values({ id: createId(), userId: auth.userId, ...values })
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
      const data = await db
        .delete(categories)
        .where(
          and(inArray(categories.id, ids), eq(categories.userId, auth.userId))
        )
        .returning({
          id: categories.id,
        });
      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", insertCategorySchema.pick({ name: true })),
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

      const [data] = await db
        .update(categories)
        .set(values)
        .where(and(eq(categories.id, id), eq(categories.userId, auth.userId)))
        .returning();
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Category not found" }, 404),
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
      const [data] = await db
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, auth.userId)))
        .returning();
      if (!data) {
        throw new HTTPException(404, {
          res: c.json({ message: "Category not found" }, 404),
        });
      }
      return c.json({ data });
    }
  );

export default app;

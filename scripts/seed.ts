import { config } from "dotenv";
import { subDays } from "date-fns";
import { neon } from "@neondatabase/serverless";
import { categories, transactions, accounts } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { eachDayOfInterval, format } from "date-fns";
import { convertAmountToMiliunits } from "@/lib/utils";

config({ path: ".env.local" });

const sql = neon(process.env.DRIZZLE_DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = process.env.CLERK_USER_ID!!;

const SEED_CATEGORIES = [
  { id: "category_1", name: "Food", userId: SEED_USER_ID, plaidID: null },
  { id: "category_2", name: "Rent", userId: SEED_USER_ID, plaidID: null },
  { id: "category_3", name: "Utilities", userId: SEED_USER_ID, plaidID: null },
  { id: "category_4", name: "Clothing", userId: SEED_USER_ID, plaidID: null },
  { id: "category_5", name: "Health", userId: SEED_USER_ID, plaidID: null },
  {
    id: "category_6",
    name: "Transportation",
    userId: SEED_USER_ID,
    plaidID: null,
  },
  {
    id: "category_7",
    name: "Entertainment",
    userId: SEED_USER_ID,
    plaidID: null,
  },
  {
    id: "category_8",
    name: "Miscellaneous",
    userId: SEED_USER_ID,
    plaidID: null,
  },
];

const SEED_ACCOUNTS = [
  { id: "account_1", name: "Checking", userId: SEED_USER_ID, plaidID: null },
  { id: "account_2", name: "Savings", userId: SEED_USER_ID, plaidID: null },
];

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 90);

const SEED_TRANSACTIONS: (typeof transactions.$inferInsert)[] = [];

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
  switch (category.name) {
    case "Food":
      return Math.random() * 30 + 10;
    case "Rent":
      return Math.random() * 400 + 90;
    case "Utilities":
      return Math.random() * 200 + 50;
    case "Clothing":
    case "Entertainment":
    case "Miscellaneous":
      return Math.random() * 100 + 20;
    case "Health":
    case "Transportation":
      return Math.random() * 50 + 15;
    default:
      return Math.random() * 50 + 10;
  }
};

const generateTransactionsForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < numTransactions; i++) {
    const category =
      SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];
    const isExpense = Math.random() > 0.6;
    const amount = generateRandomAmount(category);
    const formattedAmount = convertAmountToMiliunits(
      isExpense ? amount * -1 : amount
    );

    const transaction: typeof transactions.$inferInsert = {
      id: `transaction_${format(day, "yyyy-MM-dd")}_${i}`,
      categoryId: category.id,
      accountId: !isExpense ? SEED_ACCOUNTS[1].id : SEED_ACCOUNTS[0].id,
      amount: formattedAmount,
      payee: "Merchant",
      notes: "Random transaction",
      date: day,
    };
    SEED_TRANSACTIONS.push(transaction);
  }
};

const generateTransactions = () => {
  const days = eachDayOfInterval({ start: defaultFrom, end: defaultTo });
  for (const day of days) {
    generateTransactionsForDay(day);
  }
};

generateTransactions();

const main = async () => {
  try {
    await db.delete(categories).execute();
    await db.delete(accounts).execute();
    await db.delete(transactions).execute();

    await db.insert(categories).values(SEED_CATEGORIES).execute();
    await db.insert(accounts).values(SEED_ACCOUNTS).execute();
    await db.insert(transactions).values(SEED_TRANSACTIONS).execute();
  } catch (error) {
    console.log("error during seed", error);
    process.exit(1);
  }
};

main();

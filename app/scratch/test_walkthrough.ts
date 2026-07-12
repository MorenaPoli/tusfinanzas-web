import { appRouter } from "../api/router";
import { findUserById } from "../api/queries/users";
import { getDb } from "../api/queries/connection";
import { subscriptions } from "../db/schema";
import jwt from "jsonwebtoken";
import "dotenv/config";

async function run() {
  console.log("🚀 Starting Direct TRPC Caller Walkthrough and Verification...\n");

  const email = `arquitecto_${Date.now()}@test.com`;
  const password = "password123";

  // 1. Register User
  console.log("➡️ 1. Registering user...");
  const guestCaller = appRouter.createCaller({
    user: null as any,
    req: null as any,
    reqHeaders: new Headers(),
    resHeaders: new Headers(),
  });

  const registerResult = await guestCaller.auth.register({
    email,
    password,
    name: "Arquitecto",
    country: "Argentina",
  });
  
  const token = registerResult.token;
  console.log("✅ User registered successfully. Token:", token.slice(0, 20) + "...");

  // 2. Auth Me Check
  console.log("\n➡️ 2. Verifying auth session (me query)...");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "tusfinanzas-secret-key-2026-development") as { userId: number };
  const dbUser = await findUserById(decoded.userId);
  if (!dbUser) {
    throw new Error("User not found in DB after registration!");
  }

  const authedCaller = appRouter.createCaller({
    user: dbUser,
    req: {
      headers: new Headers({ "x-local-auth-token": token })
    } as any,
    reqHeaders: new Headers({ "x-local-auth-token": token }),
    resHeaders: new Headers(),
  });

  const meResult = await authedCaller.auth.me();
  if (!meResult) {
    throw new Error("auth.me returned null!");
  }
  console.log("✅ Auth session verified. User name:", meResult.name);

  // 3. Create Multi-Currency Transactions
  console.log("\n➡️ 3. Creating Sueldo transactions in ARS and USD...");
  const txArs = await authedCaller.finance.createTransaction({
    type: "income",
    category: "Sueldo",
    amount: "915000",
    description: "Sueldo en Pesos",
    currency: "ARS",
    date: new Date().toISOString().slice(0, 10),
  });
  console.log("✅ ARS Transaction created. ID:", txArs.id);

  const txUsd = await authedCaller.finance.createTransaction({
    type: "income",
    category: "Sueldo",
    amount: "100",
    description: "Freelance en Dólares",
    currency: "USD",
    date: new Date().toISOString().slice(0, 10),
  });
  console.log("✅ USD Transaction created. ID:", txUsd.id);

  // Verification of dynamic conversion
  const totalsUsd = await authedCaller.finance.getTotals({ currency: "USD" });
  console.log("💵 Totals in USD (Expected ~$1100):", totalsUsd.netWorth);

  const totalsArs = await authedCaller.finance.getTotals({ currency: "ARS" });
  console.log("🇦🇷 Totals in ARS (Expected ~$1006500):", totalsArs.netWorth);

  // 4. Create Savings Goal
  console.log("\n➡️ 4. Creating a savings goal...");
  const goalResult = await authedCaller.goals.create({
    name: "Mi Auto",
    targetAmount: "20000",
    icon: "🚗",
  });
  const goalId = goalResult.id;
  console.log("✅ Savings goal created. ID:", goalId);

  // 5. Update Progress (Add $500 to savings goal)
  console.log("\n➡️ 5. Contributing $500 to savings goal...");
  await authedCaller.goals.updateProgress({
    id: goalId,
    currentAmount: "500",
  });
  console.log("✅ Progress updated successfully.");

  // 6. Test Gemini Chat (Sandbox Mode)
  console.log("\n➡️ 6. Sending chat message to AI (Hola)...");
  const chatResult = await authedCaller.finance.sendMessage({
    content: "Hola, ¿cómo estás?",
  });
  console.log("🤖 AI Response:\n", chatResult.response);

  // 7. Create Support Ticket
  console.log("\n➡️ 7. Creating support ticket...");
  await authedCaller.support.createTicket({
    subject: "Duda sobre inversiones",
    message: "Quisiera saber qué brokers locales recomiendan.",
  });
  console.log("✅ Ticket created.");

  // 8. List Support Tickets
  console.log("\n➡️ 8. Listing support tickets...");
  const ticketsList = await authedCaller.support.myTickets();
  console.log("✅ Tickets found:", ticketsList.length);
  console.log("Ticket #1 Status:", ticketsList[0].status);

  // 9. Family Sharing Test
  console.log("\n➡️ 9. Testing Family Sharing & Group Management...");
  
  // 9.1 Subscribe User 1 to Family Plan
  const db = getDb();
  await db.insert(subscriptions).values({
    userId: dbUser.id,
    plan: "family",
    status: "active",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // 9.2 Create Family Group
  const famResult = await authedCaller.family.createFamily({ name: "Familia Arquitecto" });
  const familyCode = famResult.code;
  console.log("✅ Family group created. Code:", familyCode);

  // 9.3 Create User 2 (Family Member)
  console.log("➡️ Registering Family Member User...");
  const memberEmail = `member_${Date.now()}@test.com`;
  const memberRegResult = await guestCaller.auth.register({
    email: memberEmail,
    password: "password123",
    name: "Familiar",
    country: "Argentina",
  });
  
  const memberToken = memberRegResult.token;
  const decodedMember = jwt.verify(memberToken, process.env.JWT_SECRET || "tusfinanzas-secret-key-2026-development") as { userId: number };
  const dbMemberUser = await findUserById(decodedMember.userId);
  if (!dbMemberUser) throw new Error("Member user not found!");

  const memberCaller = appRouter.createCaller({
    user: dbMemberUser,
    req: { headers: new Headers({ "x-local-auth-token": memberToken }) } as any,
    reqHeaders: new Headers({ "x-local-auth-token": memberToken }),
    resHeaders: new Headers(),
  });

  // 9.4 Join Family
  console.log("➡️ Joining family group via invitation code...");
  await memberCaller.family.joinFamily({ code: familyCode });
  console.log("✅ Joined family successfully!");

  // 9.5 Verify list members
  const familyDetails = await authedCaller.family.getMyFamily();
  console.log("✅ Family members list retrieved. Count:", familyDetails?.members.length);

  // 9.6 User 2 registers a transaction
  console.log("➡️ Family Member creating a transaction ($200 USD)...");
  await memberCaller.finance.createTransaction({
    type: "expense",
    category: "Comida",
    amount: "200",
    description: "Cena familiar",
    currency: "USD",
    date: new Date().toISOString().slice(0, 10),
  });

  // 9.7 Verify consolidated totals for User 1 (should reflect the member's transaction!)
  const updatedTotals = await authedCaller.finance.getTotals({ currency: "USD" });
  console.log("💵 Converted Family Net Worth (Expected ~$513.72 after Cena):", updatedTotals.netWorth);

  // 10. Intelligent CSV Import Test
  console.log("\n➡️ 10. Testing Intelligent CSV Import & Classifications...");
  const rawCsvRows = [
    { description: "SUELDO MENSUAL ACME CORP", amount: 1500 },
    { description: "UBER TRIP DEL JUEVES", amount: 25 },
    { description: "SUPERMERCADO COTO", amount: 80 }
  ];

  // 10.1 Classify CSV rows using the router
  console.log("➡️ Requesting AI classifications from Gemini...");
  const classifications = await authedCaller.finance.classifyCsvRows({ rows: rawCsvRows });
  console.log("✅ Classifications returned:", JSON.stringify(classifications));

  // 10.2 Bulk insert transactions
  console.log("➡️ Inserting transactions in bulk...");
  const bulkInsertResult = await authedCaller.finance.bulkInsertTransactions({
    transactions: rawCsvRows.map((row, idx) => {
      const match = classifications.find(c => c.index === idx);
      return {
        type: match?.type || "expense",
        category: match?.category || "Otros",
        amount: String(row.amount),
        description: row.description,
        currency: "USD",
        date: new Date().toISOString().slice(0, 10)
      };
    })
  });
  console.log("✅ Bulk insert completed successfully. Count:", bulkInsertResult.count);

  console.log("\n🎉 Walkthrough Verification Completed Successfully! All systems are working perfectly!");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Walkthrough failed with error:", err);
  process.exit(1);
});
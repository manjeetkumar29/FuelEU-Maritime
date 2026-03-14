import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);
const PORT = process.env.PORT ?? 3001;

async function main() {
  await prisma.$connect();
  console.log("Connected to database");

  app.listen(PORT, () => {
    console.log(`FuelEU Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

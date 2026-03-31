import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client.js"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
  const passwordHash = await bcrypt.hash("duodesk2024", 12)

  await prisma.user.upsert({
    where: { email: "tavmgn196@gmail.com" },
    update: {},
    create: {
      email: "tavmgn196@gmail.com",
      name: "Artyom",
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { email: "alina.schelkunowa@yandex.ru" },
    update: {},
    create: {
      email: "alina.schelkunowa@yandex.ru",
      name: "Alina",
      passwordHash,
    },
  })

  console.log("Seeded 2 users with password: duodesk2024")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

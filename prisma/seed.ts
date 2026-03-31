import "dotenv/config"
import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbPath = path.join(__dirname, "dev.db")
const db = new Database(dbPath)

async function main() {
  const hash = await bcrypt.hash("duodesk2024", 12)
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO User (id, email, name, passwordHash, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `)

  stmt.run("artyom", "tavmgn196@gmail.com", "Artyom", hash, now)
  stmt.run("alina", "alina.schelkunowa@yandex.ru", "Alina", hash, now)

  console.log("Seeded 2 users:")
  console.log("  tavmgn196@gmail.com (Artyom) / duodesk2024")
  console.log("  alina.schelkunowa@yandex.ru (Alina) / duodesk2024")
}

main()
  .then(() => db.close())
  .catch((e) => {
    console.error(e)
    db.close()
    process.exit(1)
  })

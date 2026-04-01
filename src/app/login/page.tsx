"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DuoDesk</h1>
          <p className="text-muted-foreground">Войдите в семейный дашборд</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              Неверный email или пароль
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Почта
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                ring-offset-background focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                ring-offset-background focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Только для семьи. Обратитесь к администратору для создания аккаунта.
        </p>
      </motion.div>
    </div>
  )
}

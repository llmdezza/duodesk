"use client"

import { signOut, useSession } from "next-auth/react"
import { ThemeDock } from "@/components/ui/docks"
import { DashboardSidebar, DashboardBottomNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <div className="md:pl-56">
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur-md flex items-center justify-between px-4">
          <div className="md:hidden font-bold text-lg">DuoDesk</div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {session?.user?.name && `Hi, ${session.user.name}`}
          </div>
          <div className="flex items-center gap-3">
            <ThemeDock />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="p-4 pb-20 md:pb-4">
          {children}
        </main>
      </div>

      <DashboardBottomNav />
    </div>
  )
}

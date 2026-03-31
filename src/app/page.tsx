import { BackgroundPaths } from "@/components/ui/background-paths";
import { Footer } from "@/components/ui/footer";
import { ThemeDock } from "@/components/ui/docks";
import { Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeDock />
      </div>

      <BackgroundPaths
        title="DuoDesk"
        subtitle="Family workspace for Artyom & Alina"
        buttonText="Discover Excellence"
        buttonHref="/dashboard/kanban"
      />

      <Footer
        logo={<Heart className="h-8 w-8" />}
        brandName="DuoDesk"
        socialLinks={[]}
        mainLinks={[
          { href: "/login", label: "Sign In" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/kanban", label: "Kanban" },
          { href: "/dashboard/calendar", label: "Calendar" },
        ]}
        legalLinks={[
          { href: "#", label: "Made with love" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} DuoDesk`,
          license: "Artyom & Alina",
        }}
      />
    </main>
  );
}

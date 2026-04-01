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
        subtitle="Семейное рабочее пространство Артёма и Алины"
        buttonText="Начать работу"
        buttonHref="/dashboard"
      />

      <Footer
        logo={<Heart className="h-8 w-8" />}
        brandName="DuoDesk"
        socialLinks={[]}
        mainLinks={[
          { href: "/login", label: "Войти" },
          { href: "/dashboard", label: "Дашборд" },
          { href: "/dashboard/kanban", label: "Канбан" },
          { href: "/dashboard/calendar", label: "Календарь" },
        ]}
        legalLinks={[
          { href: "#", label: "Сделано с любовью" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} DuoDesk`,
          license: "Артём и Алина",
        }}
      />
    </main>
  );
}

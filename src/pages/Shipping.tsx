import { useEffect, useState } from "react";
import { Navbar } from "@/components/sankhofa/Navbar";
import { Footer } from "@/components/sankhofa/Footer";
import { Expeditions } from "@/components/sankhofa/Expeditions";

const Shipping = () => {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    document.title = lang === "fr"
      ? "Sankhofa Ship — Expéditions & Logistique"
      : "Sankhofa Ship — Shipping & Logistics";

    const desc = lang === "fr"
      ? "Expédiez vos colis et produis avec notre réseau d'expéditeurs agréés. Suivi complet et dédouanement simplifié."
      : "Ship your packages and products with our network of approved carriers. Full tracking and simplified customs.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar lang={lang} setLang={setLang} showCart={false} />
      <div className="pt-4"> {/* Slight buffer for fixed navbar */}
        <Expeditions lang={lang} />
      </div>
      <Footer lang={lang} />
    </main>
  );
};

export default Shipping;

import { useState, useEffect } from "react";
import { Navbar } from "@/components/sankhofa/Navbar";
import { Hero } from "@/components/sankhofa/Hero";
import { Marquee } from "@/components/sankhofa/Marquee";
import { Manifesto } from "@/components/sankhofa/Manifesto";
import { ForWhom } from "@/components/sankhofa/ForWhom";
import { Platform } from "@/components/sankhofa/Platform";
import { Cartography } from "@/components/sankhofa/Cartography";
import { CTA } from "@/components/sankhofa/CTA";
import { Footer } from "@/components/sankhofa/Footer";

const Index = () => {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    document.title = lang === "fr"
      ? "Sankhofa — Vendre l'héritage africain au monde"
      : "Sankhofa — Selling African heritage to the world";

    const desc = lang === "fr"
      ? "Plateforme tout-en-un pour les créateurs, artisans et exportateurs africains. Boutique, paiements, logistique et audience mondiale — depuis vos racines."
      : "All-in-one platform for African creators, artisans and exporters. Storefront, payments, logistics and global audience — rooted in your heritage.";
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
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <Marquee lang={lang} />
      <Manifesto lang={lang} />
      <ForWhom lang={lang} />
      <Platform lang={lang} />
      <Cartography lang={lang} />
      <CTA lang={lang} />
      <Footer lang={lang} />
    </main>
  );
};

export default Index;

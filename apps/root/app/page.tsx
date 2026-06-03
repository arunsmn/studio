import { APPS } from "../data/apps";
import { HeroSection } from "../components/HeroSection";
import { AppGallery } from "../components/AppGallery";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <HeroSection />
      <AppGallery apps={APPS} />
    </main>
  );
}

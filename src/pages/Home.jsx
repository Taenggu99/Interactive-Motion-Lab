import Hero from "../components/Hero.jsx";
import HorizontalCards from "../components/HorizontalCards.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6">
        <Hero />
      </div>

      <HorizontalCards />

      <div className="mx-auto max-w-6xl px-6">
        <Footer />
      </div>
    </div>
  );
}

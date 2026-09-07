import Grain from "@/components/grain";
import Nav from "@/components/nav";
import Hero from "@/components/hero";
import FlashcardDemo from "@/components/flashcard-demo";
import ProductGrid from "@/components/product-grid";
import Metrics from "@/components/metrics";
import FlashcardStats from "@/components/flashcard-stats";
import Pricing from "@/components/pricing";
import Faq from "@/components/faq";
import CtaBand from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Grain />
      <Nav />
      <main>
        <Hero />
        <FlashcardDemo />
        <ProductGrid />
        <Metrics />
        <FlashcardStats />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
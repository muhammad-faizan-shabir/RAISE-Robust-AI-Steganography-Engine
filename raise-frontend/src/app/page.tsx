import { Navbar, Hero, LiveSteganalysis, FeatureGrid, ApiSection, AccessControl, TechStack, Footer } from "@/components/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground dark">
      <Navbar />
      <Hero />
      
      {/* Section 1 - LiveSteganalysis */}
      <div className="bg-gradient-to-b from-black/40 via-black/20 to-background">
        <LiveSteganalysis />
      </div>
      
      {/* Section 2 - AccessControl */}
      <div className="bg-gradient-to-b from-black/40 via-black/20 to-background">
        <AccessControl />
      </div>
      
      {/* Section 3 - FeatureGrid */}
      <div className="bg-gradient-to-b from-black/40 via-black/20 to-background">
        <FeatureGrid />
      </div>
      
      {/* Section 4 - ApiSection */}
      <div className="bg-gradient-to-b from-black/40 via-black/20 to-background">
        <ApiSection />
      </div>
      
      {/* Section 5 - TechStack */}
      <div className="bg-gradient-to-b from-black/40 via-black/20 to-background">
        <TechStack />
      </div>
      
      <Footer />
    </main>
  );
}


import { useEffect } from "react";
import { Navbar } from "../../components/landing/Navbar";
import { HeroSection } from "../../components/landing/HeroSection";
import { HowItWorks } from "../../components/landing/HowItWorks";
import { FeaturesSection } from "../../components/landing/FeaturesSection";
import { IntegrationsBar } from "../../components/landing/IntegrationsBar";
import { Footer } from "../../components/landing/Footer";

export function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in-up").forEach((el) => {
      el.classList.remove("fade-in-up");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <IntegrationsBar />
      <Footer />
    </div>
  );
}

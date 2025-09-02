import React, { useEffect, useState } from 'react';
import Header from "./components/Header";
import CruiseSection from "./components/CruiseSection";
import WorkshopsSection from "./components/WorkshopsSection";
import ConsultationSection from "./components/ConsultationSection";
import Footer from "./components/Footer";
import './Index.css';

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Handle particles.js
    if (window.particlesJS) {
      window.particlesJS("particles-js-canvas-el", {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: "#e09900" },
          shape: { type: "circle" },
          opacity: { value: 0.2 },
          size: { value: 3 },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#e09900",
            opacity: 0.2,
            width: 1
          },
          move: { enable: true, speed: 2 }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" }
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
          }
        },
        retina_detect: true
      });
    }

    // Handle scroll event for scroll button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ position: 'relative', backgroundColor: '#fffbf0' }}>
      {/* Particle canvas */}
      <div
        id="particles-js-canvas-el"
        style={{
          position: "fixed",
          top: 80,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />

      <Header />

      <main className="flex-grow-1" style={{ zIndex: 1 }}>
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-12 col-md-7">
              <CruiseSection />
            </div>
            <div className="col-12 col-md-5">
              <WorkshopsSection />
            </div>
          </div>
        </div>
        <ConsultationSection />
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            backgroundColor: "#e09900",
            border: "none",
            padding: "10px 15px",
            borderRadius: "50%",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Index;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/sections/HeroSection';
import TrustBadges from '@/sections/TrustBadges';
import FeaturedProducts from '@/sections/FeaturedProducts';
import FeaturesSection from '@/sections/FeaturesSection';
import VerificationSection from '@/sections/VerificationSection';
import CinematicUnroll from '@/sections/CinematicUnroll';
import TestimonialsSection from '@/sections/TestimonialsSection';
import CTASection from '@/sections/CTASection';
import DisclaimerSection from '@/sections/DisclaimerSection';
import ContactSection from '@/sections/ContactSection';
import Footer from '@/sections/Footer';
import BatchLookup from '@/components/BatchLookup';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const ageVerified = sessionStorage.getItem('ng_age_verified');
    const seenIntro = sessionStorage.getItem('ng_seen_intro');

    if (!ageVerified) {
      navigate('/age-verify', { replace: true });
    } else if (!seenIntro) {
      navigate('/intro', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FeaturedProducts />
      <FeaturesSection />
      <VerificationSection />
      <CinematicUnroll />
      <TestimonialsSection />
      <CTASection />

      {/* Batch COA Lookup */}
      <section style={{ background: 'var(--bg-light)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px var(--container-pad)' }}>
        <BatchLookup />
      </section>

      <DisclaimerSection />
      <ContactSection />
      <Footer />
    </>
  );
}

// app/page.tsx
import LandingHeader from "@/components/LandingHeader";
import Hero from '../components/Hero';
import Features from '../components/Features';
// import HowItWorks from '../components/HowItWorks';
// import UseCases from '../components/UseCases';
// import Stats from '../components/Stats';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <LandingHeader />
      <>
        <Hero />
        <Features />
        {/* <HowItWorks /> */}
        {/* <UseCases /> */}
        {/* <Stats /> */}
        <Link href="/faq">
        </Link>
        <Footer />
      </>
    </main>
  );
}

// app/faq/page.tsx
import FAQ from "../../components/FAQ";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

export default function FAQPage() {
  return (
    <main>
        <LandingHeader />
            <>
                <FAQ />
            </>
        <Footer />
    </main>
  );
}

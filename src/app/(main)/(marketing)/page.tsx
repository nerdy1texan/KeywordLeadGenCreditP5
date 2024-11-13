import Script from "next/script";
import Faqs from "@/components/Faqs";
import FeatureZigzag from "@/components/FeatureZigzag";
import Pricing from "@/components/Pricing";
import Steps from "@/components/Steps";
import Testimonials from "@/components/Testimonial";
import { Hero2 } from "@/components/Hero2";
import FeatureGrid2 from "@/components/FeatureGrid2";

export default function Page() {
  return (
    <div>
      <Script
        id="smooth-scroll"
        async
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
          `,
        }}
      />
      <Hero2 />
      <FeatureZigzag />
      <FeatureGrid2 />
      <Steps />
      <Testimonials />
      <Pricing />
      <Faqs />
    </div>
  );
}

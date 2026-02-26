import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Categories from "@/components/home/Categories";
import LoyaltyCallout from "@/components/home/LoyaltyCallout";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import ReferralCallout from "@/components/home/ReferralCallout";
import HomeFAQ from "@/components/home/HomeFAQ";

const Index = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <Categories />
        <WhyChooseUs />
        <LoyaltyCallout />
        <ReferralCallout />
        <Testimonials />
        <HomeFAQ />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
};

export default Index;

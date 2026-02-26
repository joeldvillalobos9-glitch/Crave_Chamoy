import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="CraveChamoy chamoy candy collection with mango, watermelon, and chili lime flavors"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-chamoy-dark/80 via-chamoy-dark/50 to-transparent" />
      </div>

      <div className="container relative z-10 py-20 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-body font-semibold mb-6 backdrop-blur-sm border border-primary-foreground/20">
            🌶️ Sweet • Spicy • Tangy
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
            Chamoy Candy
            <br />
            <span className="text-secondary">You'll Crave</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 font-body mb-8 max-w-md leading-relaxed">
            Bold, glossy, and irresistible. Real chamoy sauce meets premium candy — it's sweet heat you can't put down.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/shop">Shop Now 🍬</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-display" asChild>
              <Link to="/rewards">Earn Chamoy Points</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

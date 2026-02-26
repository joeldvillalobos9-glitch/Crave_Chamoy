import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";
import logo from "@/assets/logo.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[540px] md:min-h-[620px] lg:min-h-[700px]">
      {/* Background image with stronger cinematic overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="CraveChamoy chamoy candy collection"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-chamoy-dark via-chamoy-dark/85 to-chamoy-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-chamoy-dark/60 via-transparent to-chamoy-dark/30" />
      </div>

      <div className="container relative z-10 flex flex-col items-start justify-center min-h-[540px] md:min-h-[620px] lg:min-h-[700px] py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-lg flex flex-col gap-8"
        >
          {/* Logo — integrated with a subtle branded glow ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative w-fit"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/10 blur-2xl" />
            <img
              src={logo}
              alt="CraveChamoy"
              className="relative h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-[0_8px_32px_rgba(220,38,38,0.35)]"
            />
          </motion.div>

          {/* Headline — punchy, brand-forward */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.1] tracking-tight">
              Sweet Heat
              <br />
              <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                in Every Bite
              </span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-primary-foreground/75 font-body max-w-md leading-relaxed">
              Bold chamoy candy made with real fruit, chili, and lime — crafted for flavor chasers who crave something unforgettable.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/shop">Shop the Drop 🍬</Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-display backdrop-blur-sm"
              asChild
            >
              <Link to="/rewards">Join Rewards</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const ReferralCallout = () => {
  return (
    <section className="py-16 md:py-24 gradient-dark relative overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-10"
        >
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-body font-semibold mb-4 border border-primary-foreground/20">
              <Users size={16} /> Refer a Friend
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Give $10, Get $10 🤝
            </h2>
            <p className="text-lg text-primary-foreground/70 font-body mb-6 max-w-lg">
              Share CraveChamoy with friends. When they make their first purchase, you both earn $10 off your next order!
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/refer">Start Referring →</Link>
            </Button>
          </div>
          <div className="flex-shrink-0 text-8xl animate-float">
            🎁
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReferralCallout;

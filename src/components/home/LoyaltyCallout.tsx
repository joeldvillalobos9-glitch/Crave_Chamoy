import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Gift, Repeat } from "lucide-react";
import { motion } from "framer-motion";

const LoyaltyCallout = () => {
  return (
    <section className="py-16 md:py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🌶️</div>
        <div className="absolute bottom-10 right-10 text-6xl">🍬</div>
        <div className="absolute top-1/2 left-1/3 text-4xl">✨</div>
      </div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Earn Chamoy Points 🌟
          </h2>
          <p className="text-lg text-primary-foreground/80 font-body mb-10">
            Earn 10 points for every $1 spent. Redeem points for discounts on your favorite candy!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Star, title: "Earn Points", desc: "10 points per $1 spent" },
              { icon: Gift, title: "Redeem Rewards", desc: "100 points = $1 off" },
              { icon: Repeat, title: "Repeat & Save", desc: "More you buy, more you save" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20"
              >
                <item.icon className="mx-auto mb-3 text-primary-foreground" size={28} />
                <h3 className="font-display font-semibold text-primary-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-primary-foreground/70 font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <Button variant="candy" size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
            <Link to="/rewards">Join Chamoy Rewards →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default LoyaltyCallout;

import { motion } from "framer-motion";
import { Truck, Shield, Flame, Heart } from "lucide-react";

const benefits = [
  { icon: Flame, title: "Real Chamoy", desc: "Made with authentic chamoy sauce, not artificial flavoring", color: "gradient-candy" },
  { icon: Truck, title: "Fast Shipping", desc: "Orders ship within 1-2 business days", color: "gradient-lime" },
  { icon: Shield, title: "Quality Promise", desc: "Premium ingredients, bold flavors, every time", color: "gradient-hero" },
  { icon: Heart, title: "Made with Love", desc: "Small-batch candy crafted with passion", color: "gradient-candy" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 md:py-24 gradient-section-pink">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-semibold uppercase tracking-wider border border-primary/20">Why CraveChamoy</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-4">
            Bold Flavor. Real Ingredients. 🌶️
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border/50"
            >
              <div className={`w-14 h-14 rounded-2xl ${b.color} flex items-center justify-center mx-auto mb-4 shadow-candy`}>
                <b.icon className="text-primary-foreground" size={24} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

import { motion } from "framer-motion";
import { Truck, Shield, Flame, Heart } from "lucide-react";

const benefits = [
  { icon: Flame, title: "Real Chamoy", desc: "Made with authentic chamoy sauce, not artificial flavoring" },
  { icon: Truck, title: "Fast Shipping", desc: "Orders ship within 1-2 business days" },
  { icon: Shield, title: "Quality Promise", desc: "Premium ingredients, bold flavors, every time" },
  { icon: Heart, title: "Made with Love", desc: "Small-batch candy crafted with passion" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-body font-semibold text-primary uppercase tracking-wider">Why CraveChamoy</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
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
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl gradient-candy flex items-center justify-center mx-auto mb-4">
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

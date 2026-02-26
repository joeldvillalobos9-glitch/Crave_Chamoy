import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Maria G.", text: "Best chamoy candy I've ever tried! The chili lime kick is perfect. Already on my 3rd order! 🌶️", rating: 5 },
  { name: "Carlos R.", text: "The mango lollipops are INSANE. My whole family is obsessed. Shipping was fast too!", rating: 5 },
  { name: "Ashley T.", text: "I love the Chamoy Points program — I've already saved $15 on my orders. The gummy bears are my fave! 🍬", rating: 5 },
  { name: "David L.", text: "These peach rings are next level. Sweet, spicy, tangy — exactly what chamoy candy should taste like.", rating: 4 },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 gradient-section-warm">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-semibold uppercase tracking-wider border border-primary/20">Reviews</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-4">
            What Fans Are Saying ❤️
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 gradient-candy" />
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className={j < review.rating ? "fill-secondary text-secondary" : "text-muted"} />
                ))}
              </div>
              <p className="text-sm font-body text-foreground mb-4 leading-relaxed">"{review.text}"</p>
              <p className="text-sm font-display font-semibold text-primary">{review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

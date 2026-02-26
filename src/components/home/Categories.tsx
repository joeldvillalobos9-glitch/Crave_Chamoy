import { categories } from "@/data/products";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Categories = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-body font-semibold text-primary uppercase tracking-wider">Browse By</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
            Categories 🍬
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="block bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-4xl block mb-3">{cat.emoji}</span>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                {cat.count > 0 && (
                  <p className="text-xs text-muted-foreground font-body mt-1">{cat.count} products</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

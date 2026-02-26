import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
  const featured = products.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-body font-semibold text-primary uppercase tracking-wider">Our Favorites</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
            Best Sellers 🔥
          </h2>
          <p className="text-muted-foreground font-body mt-3 max-w-md mx-auto">
            The chamoy candy everyone's craving. Sweet, spicy, and gone fast.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop">View All Products →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

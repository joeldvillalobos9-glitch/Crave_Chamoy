import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border/50"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold font-body text-primary-foreground shadow-candy ${
            product.badge === "Sale" ? "bg-secondary" :
            product.badge === "New" ? "gradient-lime" :
            "gradient-candy"
          }`}>
            {product.badge}
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <p className="text-xs font-body text-primary/80 font-semibold mb-1 uppercase tracking-wide">{product.category}</p>
          <h3 className="font-display font-semibold text-base text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-muted"}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-body">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>
          <Button
            variant="default"
            size="icon"
            className="rounded-full h-9 w-9 shadow-candy"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.slug === slug);
  const related = products.filter((p) => p.id !== product?.id).slice(0, 4);

  if (!product) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <span className="text-5xl block mb-4">😢</span>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Product not found</h1>
          <Button variant="default" asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="container py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="text-sm font-body text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary">Home</Link>
            {" / "}
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            {" / "}
            <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-primary">{product.category}</Link>
            {" / "}
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              {product.badge && (
                <span className={`self-start px-3 py-1 rounded-full text-xs font-bold font-body text-primary-foreground mb-3 ${
                  product.badge === "Sale" ? "bg-secondary" : product.badge === "New" ? "gradient-lime" : "bg-primary"
                }`}>
                  {product.badge}
                </span>
              )}

              <p className="text-sm text-muted-foreground font-body mb-1">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-muted"} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-body">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-display font-bold text-foreground">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>

              <p className="text-foreground font-body leading-relaxed mb-6">{product.description}</p>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors text-foreground"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 font-display font-semibold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors text-foreground"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button variant="hero" size="xl" className="flex-1" onClick={() => addItem(product, quantity)}>
                  <ShoppingBag size={20} /> Add to Cart
                </Button>
              </div>

              <Button variant="outline" size="lg" className="mb-8">
                <Heart size={18} /> Add to Wishlist
              </Button>

              {/* Info badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <Truck size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground">Free Shipping</p>
                    <p className="text-xs text-muted-foreground font-body">On orders $35+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <RotateCcw size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground">Easy Returns</p>
                    <p className="text-xs text-muted-foreground font-body">30-day policy</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-body mt-4">
                🌟 Earn {Math.floor(product.price * 10)} Chamoy Points with this purchase!
              </p>
            </motion.div>
          </div>

          {/* Related products */}
          <section className="mt-16 md:mt-24">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8">You Might Also Like 🍬</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Cart = () => {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="container py-8 md:py-12">
          <nav className="text-sm font-body text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary">Home</Link> / <span className="text-foreground">Cart</span>
          </nav>

          <h1 className="text-3xl font-display font-bold text-foreground mb-8">
            Your Cart 🛒 {itemCount > 0 && <span className="text-primary">({itemCount})</span>}
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🛒</span>
              <p className="font-display text-xl text-foreground mb-2">Your cart is empty</p>
              <p className="text-muted-foreground font-body mb-6">Time to add some chamoy goodness!</p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/shop">Shop Now 🍬</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-4 bg-card rounded-2xl p-4 shadow-card"
                  >
                    <Link to={`/product/${item.product.slug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="font-display font-semibold text-foreground truncate">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground font-body">{item.product.category}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-muted text-foreground"><Minus size={14} /></button>
                          <span className="px-3 text-sm font-semibold font-body text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-muted text-foreground"><Plus size={14} /></button>
                        </div>
                        <span className="font-display font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="self-start p-2 text-muted-foreground hover:text-destructive" aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-card rounded-2xl p-6 shadow-card h-fit sticky top-24">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{total >= 35 ? "Free" : "$4.99"}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-display font-bold text-foreground">Total</span>
                    <span className="font-display font-bold text-xl text-foreground">
                      ${(total + (total >= 35 ? 0 : 4.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-primary font-body font-semibold mb-4">
                  🌟 You'll earn {Math.floor(total * 10)} Chamoy Points!
                </p>

                <Button variant="hero" size="xl" className="w-full mb-3">
                  <ShoppingBag size={20} /> Checkout
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/shop">Continue Shopping</Link>
                </Button>

                {total < 35 && (
                  <p className="text-xs text-muted-foreground font-body mt-4 text-center">
                    Add ${(35 - total).toFixed(2)} more for free shipping! 🚚
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;

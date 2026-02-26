import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Rewards", href: "/rewards" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

const Header = () => {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Promo banner */}
      <div className="gradient-hero py-2 text-center">
        <p className="text-sm font-semibold text-primary-foreground font-body tracking-wide">
          🌶️ Create an account & get <span className="underline">5% off</span> your first order! 🌶️
        </p>
      </div>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CraveChamoy - Rich Sweet Spicy Lime Chili candy" className="h-12 md:h-16 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold font-body transition-colors hover:text-primary ${
                  location.pathname === link.href ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Search">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/account" aria-label="Account">
                <User size={20} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart" aria-label="Cart">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border bg-card"
            >
              <div className="container py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-base font-semibold font-body py-2 transition-colors hover:text-primary ${
                      location.pathname === link.href ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-4 pt-2 border-t border-border">
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">Account</Link>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">Wishlist</Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;

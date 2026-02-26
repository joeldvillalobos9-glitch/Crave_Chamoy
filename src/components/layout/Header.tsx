import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
  const { user, signOut } = useAuth();
  const { isAdmin, isSuperAdmin } = useUserRole();

  return (
    <>
      {/* Promo banner */}
      <div className="gradient-hero py-2 text-center">
        <p className="text-sm font-semibold text-primary-foreground font-body tracking-wide">
          🌶️ Create an account & get <span className="underline">5% off</span> your first order! 🌶️
        </p>
      </div>

      <header className="sticky top-0 z-50 bg-chamoy-dark/95 backdrop-blur-md border-b border-primary-foreground/10">
        <div className="container flex items-center justify-between h-18 md:h-22">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo — larger, more dominant */}
          <Link to="/" className="flex items-center -my-1">
            <img src={logo} alt="CraveChamoy" className="h-14 md:h-[4.5rem] w-auto object-contain drop-shadow-[0_2px_8px_rgba(220,38,38,0.2)]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold font-body transition-colors hover:text-secondary ${
                  location.pathname === link.href ? "text-secondary" : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" aria-label="Search">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            </Button>
            {user ? (
              <div className="hidden md:flex items-center gap-2 ml-1">
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-secondary hover:text-secondary hover:bg-secondary/10 font-body" asChild>
                    <Link to="/admin">
                      <LayoutDashboard size={16} />
                      <span className="text-xs font-bold">Dashboard</span>
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-primary-foreground/90 max-w-[100px] truncate font-body">
                    {user.user_metadata?.display_name || user.email?.split("@")[0]}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={signOut} aria-label="Sign out">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 font-body" asChild>
                <Link to="/auth">
                  <User size={18} />
                  <span className="text-xs font-semibold">Sign In</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/cart" aria-label="Cart">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-primary-foreground text-xs font-bold flex items-center justify-center">
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
              className="md:hidden overflow-hidden border-t border-primary-foreground/10 bg-chamoy-dark"
            >
              <div className="container py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-base font-semibold font-body py-2 transition-colors hover:text-secondary ${
                      location.pathname === link.href ? "text-secondary" : "text-primary-foreground/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-secondary font-semibold font-body"
                  >
                    <LayoutDashboard size={18} />
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex flex-col gap-3 pt-2 border-t border-primary-foreground/10">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary-foreground/80 font-body">
                          {user.user_metadata?.display_name || user.email?.split("@")[0]}
                        </span>
                      </div>
                      <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-sm font-medium text-primary-foreground/50 hover:text-secondary">Sign Out</button>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-secondary hover:text-secondary/80 font-body">Sign In / Create Account</Link>
                  )}
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary-foreground/60 hover:text-secondary">Wishlist</Link>
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

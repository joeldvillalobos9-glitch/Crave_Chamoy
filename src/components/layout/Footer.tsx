import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "Chamoy Classics", href: "/shop?category=chamoy-classics" },
    { label: "Gummies", href: "/shop?category=gummies" },
    { label: "Lollipops", href: "/shop?category=lollipops" },
    { label: "Gift Sets", href: "/shop?category=gift-sets" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Account: [
    { label: "My Account", href: "/account" },
    { label: "Chamoy Points", href: "/rewards" },
    { label: "Refer a Friend", href: "/refer" },
    { label: "Order Tracking", href: "/account" },
  ],
  Policies: [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const Footer = () => {
  return (
    <footer className="gradient-section-dark text-primary-foreground">
      <div className="container py-16">
        {/* Top accent bar */}
        <div className="h-1 gradient-hero rounded-full mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="inline-block p-2 rounded-xl bg-chamoy-dark/50 border border-primary-foreground/10 mb-3">
              <img src={logo} alt="CraveChamoy" className="h-16 w-auto object-contain" />
            </div>
            <p className="mt-3 text-sm opacity-70 font-body leading-relaxed">
              Bold chamoy candy made with real chamoy sauce. Sweet, spicy, tangy perfection. 🌶️🍬
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-secondary">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm font-body opacity-60 hover:opacity-100 hover:text-secondary transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-body opacity-50">
            © {new Date().getFullYear()} CraveChamoy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm font-body opacity-50">Made with 🌶️ & ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

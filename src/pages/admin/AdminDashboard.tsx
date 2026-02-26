import { Link } from "react-router-dom";
import {
  Package, ShoppingCart, Users, DollarSign, TrendingUp,
  Star, Tag, Gift, UserPlus, FileText, BarChart3,
  HelpCircle, Palette, Search, ClipboardList,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const statCards = [
  { label: "Total Orders", value: "—", icon: ShoppingCart, color: "from-primary to-accent" },
  { label: "Revenue", value: "—", icon: DollarSign, color: "from-secondary to-primary" },
  { label: "Customers", value: "—", icon: Users, color: "from-accent to-primary" },
  { label: "Products", value: "—", icon: Package, color: "from-chamoy-lime to-secondary" },
];

const quickLinks = [
  { title: "Products", desc: "Manage your product catalog", icon: Package, url: "/admin/products" },
  { title: "Orders", desc: "View and manage orders", icon: ShoppingCart, url: "/admin/orders" },
  { title: "Customers", desc: "Customer management", icon: Users, url: "/admin/customers" },
  { title: "Discounts", desc: "Promotions & coupons", icon: Tag, url: "/admin/discounts" },
  { title: "Analytics", desc: "Store performance", icon: BarChart3, url: "/admin/analytics" },
  { title: "Loyalty", desc: "Chamoy Points program", icon: Gift, url: "/admin/loyalty" },
  { title: "Referrals", desc: "Referral program", icon: UserPlus, url: "/admin/referrals" },
  { title: "Reviews", desc: "Customer reviews", icon: Star, url: "/admin/reviews" },
  { title: "Blog", desc: "Manage blog posts", icon: FileText, url: "/admin/blog" },
  { title: "FAQ", desc: "Manage FAQs", icon: HelpCircle, url: "/admin/faq" },
  { title: "Homepage", desc: "Edit homepage content", icon: Palette, url: "/admin/homepage" },
  { title: "SEO", desc: "Search optimization", icon: Search, url: "/admin/seo" },
  { title: "Audit Log", desc: "Activity history", icon: ClipboardList, url: "/admin/audit-log" },
];

const AdminDashboard = () => {
  const { isSuperAdmin } = useUserRole();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 md:p-5 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <link.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground font-body">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isSuperAdmin && (
        <div>
          <h2 className="text-lg font-display font-semibold text-accent mb-4">Super Admin Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "Admin Accounts", url: "/admin/accounts" },
              { title: "Roles & Permissions", url: "/admin/roles" },
              { title: "Site Settings", url: "/admin/settings" },
              { title: "Loyalty Rules", url: "/admin/loyalty-rules" },
              { title: "Referral Rules", url: "/admin/referral-rules" },
              { title: "Integrations", url: "/admin/integrations" },
              { title: "Global Controls", url: "/admin/global-controls" },
            ].map((link) => (
              <Link
                key={link.url}
                to={link.url}
                className="p-4 rounded-xl bg-card border border-accent/20 hover:border-accent/40 hover:shadow-md transition-all text-sm font-semibold text-foreground font-body"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

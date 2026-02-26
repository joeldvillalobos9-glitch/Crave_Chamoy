import { useLocation } from "react-router-dom";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin/products": { title: "Products", description: "Manage your product catalog, pricing, and details." },
  "/admin/categories": { title: "Categories & Collections", description: "Organize products into categories and collections." },
  "/admin/inventory": { title: "Inventory", description: "Track stock levels and manage inventory." },
  "/admin/orders": { title: "Orders", description: "View, manage, and fulfill customer orders." },
  "/admin/customers": { title: "Customers", description: "View customer profiles, orders, and activity." },
  "/admin/reviews": { title: "Reviews", description: "Moderate and manage customer product reviews." },
  "/admin/discounts": { title: "Discounts & Promotions", description: "Create and manage discount codes and promotions." },
  "/admin/loyalty": { title: "Chamoy Points", description: "Manage the loyalty points program and rewards." },
  "/admin/referrals": { title: "Referrals", description: "Track and manage the referral program." },
  "/admin/blog": { title: "Blog", description: "Create, edit, and publish blog posts." },
  "/admin/faq": { title: "FAQ", description: "Manage frequently asked questions." },
  "/admin/policies": { title: "Policies", description: "Edit store policies (shipping, returns, privacy, etc.)." },
  "/admin/homepage": { title: "Homepage Editor", description: "Customize homepage sections, banners, and content." },
  "/admin/seo": { title: "SEO Manager", description: "Manage meta titles, descriptions, and structured data." },
  "/admin/analytics": { title: "Analytics", description: "View store performance, traffic, and conversion data." },
  "/admin/audit-log": { title: "Audit Log", description: "View a history of all admin actions and changes." },
  "/admin/accounts": { title: "Admin Accounts", description: "Manage admin and super admin user accounts." },
  "/admin/roles": { title: "Roles & Permissions", description: "Configure role-based access and permissions." },
  "/admin/settings": { title: "Site Settings", description: "Global store settings and configuration." },
  "/admin/loyalty-rules": { title: "Loyalty Rules", description: "Configure point earning and redemption rules." },
  "/admin/referral-rules": { title: "Referral Rules", description: "Configure referral rewards and conditions." },
  "/admin/discount-rules": { title: "Discount Stacking Rules", description: "Set rules for how discounts can be combined." },
  "/admin/integrations": { title: "Integrations", description: "Manage third-party integrations and tracking." },
  "/admin/global-controls": { title: "Global Controls", description: "Site-wide business controls and feature toggles." },
};

const AdminPage = () => {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: "Admin", description: "" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{meta.title}</h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">{meta.description}</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-sm text-muted-foreground font-body max-w-md">
          This section is being built. Full management tools for <strong>{meta.title.toLowerCase()}</strong> will be available here.
        </p>
      </div>
    </div>
  );
};

export default AdminPage;

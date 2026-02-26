import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Warehouse, ShoppingCart,
  Users, Star, Tag, Gift, UserPlus, FileText, HelpCircle, FileCheck,
  Palette, Search, BarChart3, ClipboardList, Shield, Settings,
  UserCog, Link2, Sliders, BookOpen, ChevronDown, ChevronRight,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import logo from "@/assets/logo.jpg";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Inventory", url: "/admin/inventory", icon: Warehouse },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Discounts", url: "/admin/discounts", icon: Tag },
  { title: "Loyalty Points", url: "/admin/loyalty", icon: Gift },
  { title: "Referrals", url: "/admin/referrals", icon: UserPlus },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "FAQ", url: "/admin/faq", icon: HelpCircle },
  { title: "Policies", url: "/admin/policies", icon: FileCheck },
  { title: "Homepage Editor", url: "/admin/homepage", icon: Palette },
  { title: "SEO Manager", url: "/admin/seo", icon: Search },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Audit Log", url: "/admin/audit-log", icon: ClipboardList },
];

const superAdminItems = [
  { title: "Admin Accounts", url: "/admin/accounts", icon: UserCog },
  { title: "Roles & Permissions", url: "/admin/roles", icon: Shield },
  { title: "Site Settings", url: "/admin/settings", icon: Settings },
  { title: "Loyalty Rules", url: "/admin/loyalty-rules", icon: BookOpen },
  { title: "Referral Rules", url: "/admin/referral-rules", icon: Link2 },
  { title: "Discount Rules", url: "/admin/discount-rules", icon: Sliders },
  { title: "Integrations", url: "/admin/integrations", icon: Link2 },
  { title: "Global Controls", url: "/admin/global-controls", icon: Settings },
];

function CollapsibleGroup({
  label,
  items,
  collapsed,
  defaultOpen = true,
  accent = false,
}: {
  label: string;
  items: typeof adminItems;
  collapsed: boolean;
  defaultOpen?: boolean;
  accent?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();

  return (
    <SidebarGroup>
      {!collapsed && (
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-accent" : "text-muted-foreground"
          }`}
        >
          {label}
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      )}
      {(open || collapsed) && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const active = location.pathname === item.url;
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon size={18} className={active ? "text-primary" : ""} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const { isSuperAdmin } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card pt-4">
        {/* Brand */}
        <div className={`px-4 pb-4 border-b border-border mb-2 ${collapsed ? "flex justify-center" : ""}`}>
          <NavLink to="/" className="flex items-center gap-2">
            <img src={logo} alt="CraveChamoy" className={collapsed ? "h-8 w-auto" : "h-10 w-auto"} />
            {!collapsed && (
              <span className="text-sm font-display font-bold text-foreground">Admin</span>
            )}
          </NavLink>
        </div>

        <CollapsibleGroup label="Store Management" items={adminItems} collapsed={collapsed} />

        {isSuperAdmin && (
          <CollapsibleGroup
            label="Super Admin"
            items={superAdminItems}
            collapsed={collapsed}
            defaultOpen={false}
            accent
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

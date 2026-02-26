import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const { isSuperAdmin } = useUserRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Admin header bar */}
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-foreground" />
              <span className="text-sm font-semibold text-muted-foreground font-body hidden sm:inline">
                {isSuperAdmin ? "Super Admin" : "Admin"} Panel
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5" asChild>
                <Link to="/">
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">View Store</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-foreground hidden sm:inline max-w-[120px] truncate">
                  {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground h-8 w-8">
                <LogOut size={16} />
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPage from "./pages/admin/AdminPage";
import ProductsPage from "./pages/admin/ProductsPage";
import ProductEditorPage from "./pages/admin/ProductEditorPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import CreateOrderPage from "./pages/admin/CreateOrderPage";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const adminPages = [
  "categories", "inventory", "customers",
  "reviews", "discounts", "loyalty", "referrals", "blog",
  "faq", "policies", "homepage", "seo", "analytics", "audit-log",
];

const superAdminPages = [
  "accounts", "roles", "settings", "loyalty-rules",
  "referral-rules", "discount-rules", "integrations", "global-controls",
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductEditorPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/new" element={<CreateOrderPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              {adminPages.map((page) => (
                <Route key={page} path={page} element={<AdminPage />} />
              ))}
              {superAdminPages.map((page) => (
                <Route key={page} path={page} element={<AdminPage />} />
              ))}
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

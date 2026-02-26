import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ProductStatus = "draft" | "active" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  status: ProductStatus;
  is_visible: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_limited_edition: boolean;
  category_id: string | null;
  tags: string[];
  flavor_type: string | null;
  spice_level: string | null;
  candy_type: string | null;
  fruit_type: string | null;
  package_size: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
  out_of_stock_behavior: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  related_product_ids: string[];
  frequently_bought_with_ids: string[];
  homepage_eligible: boolean;
  collection_featured: boolean;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
}

export interface ProductFilters {
  search: string;
  status: ProductStatus | "all";
  category_id: string | "all";
  stock: "all" | "in_stock" | "out_of_stock" | "low_stock";
  featured: "all" | "yes" | "no";
  on_sale: "all" | "yes" | "no";
}

export const defaultFilters: ProductFilters = {
  search: "",
  status: "all",
  category_id: "all",
  stock: "all",
  featured: "all",
  on_sale: "all",
};

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["admin-products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("updated_at", { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.category_id !== "all") {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.stock === "out_of_stock") {
        query = query.eq("stock_quantity", 0);
      } else if (filters.stock === "low_stock") {
        query = query.lt("stock_quantity", 6); // will compare with threshold client-side too
      } else if (filters.stock === "in_stock") {
        query = query.gt("stock_quantity", 0);
      }
      if (filters.featured === "yes") {
        query = query.eq("is_featured", true);
      } else if (filters.featured === "no") {
        query = query.eq("is_featured", false);
      }
      if (filters.on_sale === "yes") {
        query = query.not("compare_at_price", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Product[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as Category[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Product;
    },
  });
}

export function useProductMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const save = useMutation({
    mutationFn: async (product: Partial<Product> & { id?: string }) => {
      const { categories, ...data } = product as any;
      if (data.id) {
        const { error } = await supabase.from("products").update(data).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-product"] });
      toast({ title: "Product saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Products deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const bulkUpdate = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<Product> }) => {
      const { error } = await supabase.from("products").update(data as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Products updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { save, remove, bulkUpdate };
}

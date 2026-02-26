import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Eye, Loader2 } from "lucide-react";
import { useProduct, useCategories, useProductMutations, type Product } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyProduct: Partial<Product> = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  sku: "",
  price: 0,
  compare_at_price: null,
  cost_price: null,
  status: "draft",
  is_visible: true,
  is_featured: false,
  is_best_seller: false,
  is_new_arrival: false,
  is_limited_edition: false,
  category_id: null,
  tags: [],
  flavor_type: "",
  spice_level: "",
  candy_type: "",
  fruit_type: "",
  package_size: "",
  stock_quantity: 0,
  low_stock_threshold: 5,
  allow_backorder: false,
  out_of_stock_behavior: "hide_buy_button",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  homepage_eligible: false,
  collection_featured: false,
  primary_image_url: "",
};

const ProductEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = id === "new";
  const { data: existing, isLoading: loadingProduct } = useProduct(isNew ? undefined : id);
  const { data: categories = [] } = useCategories();
  const { save, remove } = useProductMutations();
  const [form, setForm] = useState<Partial<Product>>(emptyProduct);
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing && !isNew) {
      setForm(existing);
      setTagsInput((existing.tags || []).join(", "));
    }
  }, [existing, isNew]);

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const autoSlug = () => {
    if (form.name && (!form.slug || isNew)) {
      set("slug", slugify(form.name));
    }
  };

  const handleSave = async (status?: string) => {
    if (!form.name?.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    if (!form.slug?.trim()) {
      set("slug", slugify(form.name));
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      ...form,
      tags,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
      slug: form.slug || slugify(form.name || ""),
      ...(status ? { status } : {}),
    } as any;

    if (!isNew) payload.id = id;
    // Remove relationship data
    delete payload.categories;

    save.mutate(payload, {
      onSuccess: () => navigate("/admin/products"),
    });
  };

  const handleDelete = () => {
    if (id && !isNew) {
      remove.mutate([id], { onSuccess: () => navigate("/admin/products") });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    set("primary_image_url", urlData.publicUrl);
    setUploading(false);
  };

  if (!isNew && loadingProduct) {
    return <div className="p-12 text-center text-muted-foreground">Loading product...</div>;
  }

  const statusColor = form.status === "active" ? "bg-green-500/15 text-green-700" : form.status === "draft" ? "bg-yellow-500/15 text-yellow-700" : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/admin/products"><ArrowLeft size={18} /></Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
              {isNew ? "New Product" : form.name || "Edit Product"}
            </h1>
            {!isNew && (
              <Badge variant="outline" className={`mt-1 capitalize text-xs ${statusColor}`}>
                {form.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && form.slug && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to={`/product/${form.slug}`} target="_blank"><Eye size={14} /> Preview</Link>
            </Button>
          )}
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30">
                  <Trash2 size={14} /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={save.isPending} className="gap-1.5">
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("active")} disabled={save.isPending} className="gap-1.5">
            {save.isPending && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} /> Publish
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="merchandising">Merchandising</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} onBlur={autoSlug} placeholder="e.g. Chamoy Gummy Bears" />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="chamoy-gummy-bears" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea value={form.short_description || ""} onChange={(e) => set("short_description", e.target.value)} rows={2} placeholder="Brief product summary for cards and listings" />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={6} placeholder="Detailed product description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku || ""} onChange={(e) => set("sku", e.target.value)} placeholder="CC-GB-001" className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status || "draft"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_visible ?? true} onCheckedChange={(v) => set("is_visible", v)} />
                <Label>Visible on store</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <Label>Primary Image</Label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                {form.primary_image_url ? (
                  <img src={form.primary_image_url} alt="Primary" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                <p className="text-xs text-muted-foreground">Or paste an image URL:</p>
                <Input value={form.primary_image_url || ""} onChange={(e) => set("primary_image_url", e.target.value)} placeholder="https://..." className="text-sm" />
              </div>
            </div>
            {!form.primary_image_url && (
              <p className="text-xs text-yellow-600">⚠ Missing primary image — product will show a placeholder</p>
            )}
          </div>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" step="0.01" min="0" value={form.price ?? 0} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Compare-at Price</Label>
                <Input type="number" step="0.01" min="0" value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value || null)} placeholder="Original price for sale display" />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input type="number" step="0.01" min="0" value={form.cost_price ?? ""} onChange={(e) => set("cost_price", e.target.value || null)} placeholder="Internal cost tracking" />
              </div>
            </div>
            {form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
              <p className="text-sm text-green-600">
                💰 Sale: {Math.round((1 - Number(form.price) / Number(form.compare_at_price)) * 100)}% off
              </p>
            )}
          </div>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" min="0" value={form.stock_quantity ?? 0} onChange={(e) => set("stock_quantity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" min="0" value={form.low_stock_threshold ?? 5} onChange={(e) => set("low_stock_threshold", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Out-of-Stock Behavior</Label>
                <Select value={form.out_of_stock_behavior || "hide_buy_button"} onValueChange={(v) => set("out_of_stock_behavior", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hide_buy_button">Hide buy button</SelectItem>
                    <SelectItem value="show_out_of_stock">Show "Out of Stock"</SelectItem>
                    <SelectItem value="hide_product">Hide product entirely</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={form.allow_backorder ?? false} onCheckedChange={(v) => set("allow_backorder", v)} />
              <Label>Allow backorders / preorders</Label>
            </div>
          </div>
        </TabsContent>

        {/* Organization */}
        <TabsContent value="organization" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category / Collection</Label>
                <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="spicy, gummy, best-seller (comma-separated)" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Flavor Type</Label>
                <Input value={form.flavor_type || ""} onChange={(e) => set("flavor_type", e.target.value)} placeholder="e.g. Sweet & Spicy" />
              </div>
              <div className="space-y-2">
                <Label>Spice Level</Label>
                <Select value={form.spice_level || "none"} onValueChange={(v) => set("spice_level", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="extra_hot">Extra Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Candy Type</Label>
                <Input value={form.candy_type || ""} onChange={(e) => set("candy_type", e.target.value)} placeholder="e.g. Gummy, Hard, Lollipop" />
              </div>
              <div className="space-y-2">
                <Label>Fruit Type</Label>
                <Input value={form.fruit_type || ""} onChange={(e) => set("fruit_type", e.target.value)} placeholder="e.g. Mango, Watermelon" />
              </div>
              <div className="space-y-2">
                <Label>Package Size</Label>
                <Input value={form.package_size || ""} onChange={(e) => set("package_size", e.target.value)} placeholder="e.g. 8oz, 1lb" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_limited_edition ?? false} onCheckedChange={(v) => set("is_limited_edition", v)} />
                <Label>Limited Edition</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={form.meta_title || ""} onChange={(e) => set("meta_title", e.target.value)} placeholder="SEO title (max 60 chars)" maxLength={60} />
              <p className="text-xs text-muted-foreground">{(form.meta_title || "").length}/60</p>
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea value={form.meta_description || ""} onChange={(e) => set("meta_description", e.target.value)} placeholder="SEO description (max 160 chars)" rows={3} maxLength={160} />
              <p className="text-xs text-muted-foreground">{(form.meta_description || "").length}/160</p>
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input value={form.canonical_url || ""} onChange={(e) => set("canonical_url", e.target.value)} placeholder="https://..." className="font-mono text-sm" />
            </div>
            {/* SEO Preview */}
            <div className="border border-border rounded-lg p-4 space-y-1 bg-muted/30">
              <p className="text-xs text-muted-foreground">Search Preview</p>
              <p className="text-blue-600 text-sm font-medium truncate">
                {form.meta_title || form.name || "Product Title"}
              </p>
              <p className="text-xs text-green-700 font-mono truncate">
                cravechamoy.com/product/{form.slug || "product-slug"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.meta_description || form.short_description || "Product description will appear here..."}
              </p>
            </div>
            {(!form.meta_title || !form.meta_description) && (
              <p className="text-xs text-yellow-600">⚠ Missing SEO fields — fill meta title and description for better search ranking</p>
            )}
          </div>
        </TabsContent>

        {/* Merchandising */}
        <TabsContent value="merchandising" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Badges & Visibility</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured ?? false} onCheckedChange={(v) => set("is_featured", v)} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_best_seller ?? false} onCheckedChange={(v) => set("is_best_seller", v)} />
                <Label>Best Seller</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_new_arrival ?? false} onCheckedChange={(v) => set("is_new_arrival", v)} />
                <Label>New Arrival</Label>
              </div>
            </div>
            <h3 className="font-semibold text-foreground pt-4">Placement</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.homepage_eligible ?? false} onCheckedChange={(v) => set("homepage_eligible", v)} />
                <Label>Eligible for homepage feature</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.collection_featured ?? false} onCheckedChange={(v) => set("collection_featured", v)} />
                <Label>Featured in collection</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductEditorPage;

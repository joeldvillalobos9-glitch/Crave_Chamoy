import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Eye, Loader2, Copy, Archive, ImagePlus, X, GripVertical } from "lucide-react";
import { useProduct, useCategories, useProductMutations, useProducts, defaultFilters, type Product } from "@/hooks/useProducts";
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

function generateSku(name: string): string {
  const prefix = "CC";
  const words = name.trim().split(/\s+/).slice(0, 2);
  const abbr = words.map((w) => w.substring(0, 2).toUpperCase()).join("");
  const uid = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${abbr}-${uid}`;
}

interface GalleryImage {
  id?: string;
  url: string;
  alt: string;
}

const emptyProduct: Partial<Product> = {
  name: "", slug: "", short_description: "", description: "", sku: "",
  price: 0, compare_at_price: null, cost_price: null, status: "draft",
  is_visible: true, is_featured: false, is_best_seller: false,
  is_new_arrival: false, is_limited_edition: false, category_id: null,
  tags: [], flavor_type: "", spice_level: "", candy_type: "", fruit_type: "",
  package_size: "", stock_quantity: 0, low_stock_threshold: 5,
  allow_backorder: false, out_of_stock_behavior: "hide_buy_button",
  meta_title: "", meta_description: "", canonical_url: "",
  homepage_eligible: false, collection_featured: false, primary_image_url: "",
  related_product_ids: [], frequently_bought_with_ids: [],
};

const ProductEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = id === "new";
  const { data: existing, isLoading: loadingProduct } = useProduct(isNew ? undefined : id);
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts(defaultFilters);
  const { save, remove } = useProductMutations();
  const [form, setForm] = useState<Partial<Product>>(emptyProduct);
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [skuManual, setSkuManual] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing && !isNew) {
      setForm(existing);
      setTagsInput((existing.tags || []).join(", "));
      setSkuManual(true); // existing product = don't auto-generate
    }
  }, [existing, isNew]);

  // Load gallery images for existing product
  useEffect(() => {
    if (id && !isNew) {
      supabase.from("product_images").select("*").eq("product_id", id).order("sort_order").then(({ data }) => {
        if (data) setGallery(data.map((d: any) => ({ id: d.id, url: d.image_url, alt: d.alt_text || "" })));
      });
    }
  }, [id, isNew]);

  const set = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const autoSlug = () => {
    if (form.name && (!form.slug || isNew)) set("slug", slugify(form.name));
  };

  const autoSku = useCallback(() => {
    if (isNew && !skuManual && form.name?.trim()) {
      set("sku", generateSku(form.name));
    }
  }, [form.name, isNew, skuManual]);

  useEffect(() => { autoSku(); }, [form.name, autoSku]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Product name is required";
    if (!form.price && form.price !== 0) e.price = "Price is required";
    if (Number(form.price) < 0) e.price = "Price cannot be negative";
    if (form.compare_at_price && Number(form.compare_at_price) > 0 && Number(form.compare_at_price) <= Number(form.price)) {
      e.compare_at_price = "Compare-at price must be higher than price";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast({ title: "Please fix validation errors", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async (status?: string) => {
    if (!validate()) return;
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload: any = {
      ...form, tags,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
      slug: form.slug || slugify(form.name || ""),
      ...(status ? { status } : {}),
    };
    if (!isNew) payload.id = id;
    delete payload.categories;

    save.mutate(payload, {
      onSuccess: () => navigate("/admin/products"),
    });
  };

  const handleDuplicate = () => {
    const dup = { ...form };
    delete (dup as any).id;
    dup.name = `${dup.name} (Copy)`;
    dup.slug = slugify(dup.name || "");
    dup.sku = generateSku(dup.name || "");
    dup.status = "draft";
    delete (dup as any).categories;
    save.mutate(dup as any, {
      onSuccess: () => {
        toast({ title: "Product duplicated as draft" });
        navigate("/admin/products");
      },
    });
  };

  const handleDelete = () => {
    if (id && !isNew) remove.mutate([id], { onSuccess: () => navigate("/admin/products") });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) set("primary_image_url", url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setGalleryUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) setGallery((prev) => [...prev, { url, alt: "" }]);
    }
    setGalleryUploading(false);
  };

  const removeGalleryImage = (idx: number) => setGallery((prev) => prev.filter((_, i) => i !== idx));

  const moveGalleryImage = (from: number, to: number) => {
    setGallery((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const otherProducts = allProducts.filter((p) => p.id !== id);
  const warnings: string[] = [];
  if (!form.primary_image_url) warnings.push("Missing primary image");
  if (!form.meta_title) warnings.push("Missing SEO meta title");
  if (!form.meta_description) warnings.push("Missing SEO meta description");

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
            <div className="flex items-center gap-2 mt-1">
              {!isNew && (
                <Badge variant="outline" className={`capitalize text-xs ${statusColor}`}>{form.status}</Badge>
              )}
              {form.sku && <span className="text-xs font-mono text-muted-foreground">SKU: {form.sku}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && form.slug && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to={`/product/${form.slug}`} target="_blank"><Eye size={14} /> Preview</Link>
            </Button>
          )}
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={save.isPending} className="gap-1.5">
              <Copy size={14} /> Duplicate
            </Button>
          )}
          {!isNew && form.status !== "archived" && (
            <Button variant="outline" size="sm" onClick={() => handleSave("archived")} disabled={save.isPending} className="gap-1.5">
              <Archive size={14} /> Archive
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
                  <AlertDialogDescription>This action cannot be undone. All related images and inventory records will also be removed.</AlertDialogDescription>
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

      {/* Warnings bar */}
      {warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
          <span className="text-yellow-600 text-sm">⚠</span>
          <div className="text-sm text-yellow-700 space-x-2">
            {warnings.map((w) => <span key={w}>• {w}</span>)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="merchandising">Merchandising</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ─── General ─── */}
        <TabsContent value="general" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} onBlur={autoSlug} placeholder="e.g. Chamoy Gummy Bears" className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>SKU</Label>
                  {isNew && (
                    <button type="button" onClick={() => { setSkuManual(!skuManual); if (skuManual && form.name) set("sku", generateSku(form.name)); }}
                      className="text-xs text-primary hover:underline">
                      {skuManual ? "Auto-generate" : "Edit manually"}
                    </button>
                  )}
                </div>
                <Input value={form.sku || ""} onChange={(e) => { setSkuManual(true); set("sku", e.target.value); }} placeholder="CC-GB-A1B2" className="font-mono" readOnly={!skuManual && isNew} />
                <p className="text-xs text-muted-foreground">
                  {isNew && !skuManual ? "Auto-generated from product name" : "Manually set — must be unique"}
                </p>
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
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_visible ?? true} onCheckedChange={(v) => set("is_visible", v)} />
                <Label>Visible on store</Label>
              </div>
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
          </div>
        </TabsContent>

        {/* ─── Media ─── */}
        <TabsContent value="media" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {/* Primary Image */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Primary Image</Label>
              <div className="flex items-start gap-4">
                <div className="w-36 h-36 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {form.primary_image_url ? (
                    <img src={form.primary_image_url} alt="Primary" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <ImagePlus size={24} className="mx-auto text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Input type="file" accept="image/*" onChange={handlePrimaryUpload} disabled={uploading} />
                  {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}
                  <p className="text-xs text-muted-foreground">Or paste an image URL:</p>
                  <Input value={form.primary_image_url || ""} onChange={(e) => set("primary_image_url", e.target.value)} placeholder="https://..." className="text-sm" />
                  {form.primary_image_url && (
                    <Button variant="ghost" size="sm" onClick={() => set("primary_image_url", "")} className="text-destructive text-xs h-7 px-2">Remove</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Gallery Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg border border-border overflow-hidden bg-muted aspect-square">
                    <img src={img.url} alt={img.alt || `Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx > 0 && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-white" onClick={() => moveGalleryImage(idx, idx - 1)}>
                          <GripVertical size={14} />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white" onClick={() => removeGalleryImage(idx)}>
                        <X size={14} />
                      </Button>
                    </div>
                    <Input
                      value={img.alt}
                      onChange={(e) => {
                        const next = [...gallery];
                        next[idx] = { ...next[idx], alt: e.target.value };
                        setGallery(next);
                      }}
                      placeholder="Alt text"
                      className="absolute bottom-0 left-0 right-0 bg-background/90 border-0 border-t text-xs h-7 rounded-none"
                    />
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square cursor-pointer hover:bg-muted/50 transition-colors">
                  {galleryUploading ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : <ImagePlus size={20} className="text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground mt-1">{galleryUploading ? "Uploading..." : "Add images"}</span>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={galleryUploading} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Hover to reorder or remove. Add alt text for SEO.</p>
            </div>
          </div>
        </TabsContent>

        {/* ─── Pricing ─── */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" min="0" value={form.price ?? 0} onChange={(e) => set("price", e.target.value)} className={`pl-7 ${errors.price ? "border-destructive" : ""}`} />
                </div>
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label>Compare-at Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" min="0" value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value || null)} placeholder="0.00" className={`pl-7 ${errors.compare_at_price ? "border-destructive" : ""}`} />
                </div>
                {errors.compare_at_price && <p className="text-xs text-destructive">{errors.compare_at_price}</p>}
              </div>
              <div className="space-y-2">
                <Label>Cost Price <span className="text-muted-foreground">(internal)</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" min="0" value={form.cost_price ?? ""} onChange={(e) => set("cost_price", e.target.value || null)} placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </div>
            {form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && Number(form.price) > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-sm font-medium text-green-700">
                  💰 Sale: {Math.round((1 - Number(form.price) / Number(form.compare_at_price)) * 100)}% off
                </span>
                <span className="text-xs text-green-600">
                  Saves ${(Number(form.compare_at_price) - Number(form.price)).toFixed(2)}
                </span>
              </div>
            )}
            {form.cost_price && Number(form.cost_price) > 0 && Number(form.price) > 0 && (
              <p className="text-xs text-muted-foreground">
                Margin: ${(Number(form.price) - Number(form.cost_price)).toFixed(2)} ({Math.round(((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100)}%)
              </p>
            )}
          </div>
        </TabsContent>

        {/* ─── Inventory ─── */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" min="0" value={form.stock_quantity ?? 0} onChange={(e) => set("stock_quantity", e.target.value)} />
                {Number(form.stock_quantity) <= Number(form.low_stock_threshold || 5) && Number(form.stock_quantity) > 0 && (
                  <p className="text-xs text-yellow-600">⚠ Below low-stock threshold</p>
                )}
                {Number(form.stock_quantity) === 0 && (
                  <p className="text-xs text-destructive">Out of stock</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" min="0" value={form.low_stock_threshold ?? 5} onChange={(e) => set("low_stock_threshold", e.target.value)} />
                <p className="text-xs text-muted-foreground">Alert when stock falls to this level</p>
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

        {/* ─── Organization ─── */}
        <TabsContent value="organization" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category / Collection</Label>
                <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={form.is_limited_edition ?? false} onCheckedChange={(v) => set("is_limited_edition", v)} />
              <Label>Limited Edition / Seasonal</Label>
            </div>
          </div>
        </TabsContent>

        {/* ─── Merchandising ─── */}
        <TabsContent value="merchandising" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Placement Controls</Label>
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
            <div className="space-y-3">
              <Label className="text-base font-semibold">Related Products</Label>
              <p className="text-xs text-muted-foreground">Select products to show as related on this product's page.</p>
              <div className="flex flex-wrap gap-2">
                {otherProducts.map((p) => {
                  const selected = (form.related_product_ids || []).includes(p.id);
                  return (
                    <button key={p.id} type="button"
                      onClick={() => set("related_product_ids", selected ? (form.related_product_ids || []).filter((x) => x !== p.id) : [...(form.related_product_ids || []), p.id])}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected ? "bg-primary/15 border-primary/40 text-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/30"}`}>
                      {p.name}
                    </button>
                  );
                })}
                {otherProducts.length === 0 && <p className="text-xs text-muted-foreground">No other products available yet.</p>}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Frequently Bought Together</Label>
              <div className="flex flex-wrap gap-2">
                {otherProducts.map((p) => {
                  const selected = (form.frequently_bought_with_ids || []).includes(p.id);
                  return (
                    <button key={p.id} type="button"
                      onClick={() => set("frequently_bought_with_ids", selected ? (form.frequently_bought_with_ids || []).filter((x) => x !== p.id) : [...(form.frequently_bought_with_ids || []), p.id])}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected ? "bg-secondary/30 border-secondary/50 text-secondary-foreground" : "bg-muted border-border text-muted-foreground hover:border-secondary/30"}`}>
                      {p.name}
                    </button>
                  );
                })}
                {otherProducts.length === 0 && <p className="text-xs text-muted-foreground">No other products available yet.</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── SEO ─── */}
        <TabsContent value="seo" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={form.meta_title || ""} onChange={(e) => set("meta_title", e.target.value)} placeholder="SEO title (max 60 chars)" maxLength={60} />
              <p className={`text-xs ${(form.meta_title || "").length > 55 ? "text-yellow-600" : "text-muted-foreground"}`}>{(form.meta_title || "").length}/60</p>
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea value={form.meta_description || ""} onChange={(e) => set("meta_description", e.target.value)} placeholder="SEO description (max 160 chars)" rows={3} maxLength={160} />
              <p className={`text-xs ${(form.meta_description || "").length > 150 ? "text-yellow-600" : "text-muted-foreground"}`}>{(form.meta_description || "").length}/160</p>
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input value={form.canonical_url || ""} onChange={(e) => set("canonical_url", e.target.value)} placeholder="https://..." className="font-mono text-sm" />
            </div>
            <div className="border border-border rounded-lg p-4 space-y-1 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Search Preview</p>
              <p className="text-primary text-sm font-medium truncate">
                {form.meta_title || form.name || "Product Title"}
              </p>
              <p className="text-xs text-green-700 font-mono truncate">
                cravechamoy.com/product/{form.slug || "product-slug"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.meta_description || form.short_description || "Product description will appear here..."}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductEditorPage;

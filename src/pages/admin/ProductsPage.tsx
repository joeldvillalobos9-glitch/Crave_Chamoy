import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Trash2, Eye, EyeOff, Star, StarOff, Archive, CheckCircle2, Package } from "lucide-react";
import { useProducts, useCategories, useProductMutations, defaultFilters, type ProductFilters, type Product } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  active: "bg-green-500/15 text-green-700 border-green-500/30",
  draft: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: products = [], isLoading } = useProducts(filters);
  const { data: categories = [] } = useCategories();
  const { remove, bulkUpdate } = useProductMutations();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const bulkAction = (data: Partial<Product>) => {
    bulkUpdate.mutate({ ids: Array.from(selected), data });
    setSelected(new Set());
  };

  const isLowStock = (p: Product) => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">
            {products.length} product{products.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/products/new">
            <Plus size={16} />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={filters.status} onValueChange={(v: any) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category_id} onValueChange={(v) => setFilters({ ...filters, category_id: v })}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.stock} onValueChange={(v: any) => setFilters({ ...filters, stock: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.featured} onValueChange={(v: any) => setFilters({ ...filters, featured: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Featured</SelectItem>
              <SelectItem value="yes">Featured Only</SelectItem>
              <SelectItem value="no">Not Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "active" as any })} className="gap-1.5">
              <CheckCircle2 size={14} /> Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "draft" as any })} className="gap-1.5">
              <EyeOff size={14} /> Unpublish
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "archived" as any })} className="gap-1.5">
              <Archive size={14} /> Archive
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ is_featured: true })} className="gap-1.5">
              <Star size={14} /> Feature
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ is_featured: false })} className="gap-1.5">
              <StarOff size={14} /> Unfeature
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-1.5">
                  <Trash2 size={14} /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selected.size} product{selected.size > 1 ? "s" : ""}?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { remove.mutate(Array.from(selected)); setSelected(new Set()); }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={40} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground font-body">No products found</p>
            <Button asChild size="sm"><Link to="/admin/products/new">Add your first product</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size === products.length && products.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="min-w-[250px]">Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className={selected.has(p.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.primary_image_url ? (
                            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-foreground text-sm line-clamp-1">{p.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusColors[p.status]}`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{p.sku || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.categories?.name || "—"}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {p.compare_at_price && (
                        <span className="line-through text-muted-foreground mr-1">${Number(p.compare_at_price).toFixed(2)}</span>
                      )}
                      ${Number(p.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-medium ${
                        p.stock_quantity === 0
                          ? "text-destructive"
                          : isLowStock(p)
                          ? "text-yellow-600"
                          : "text-foreground"
                      }`}>
                        {p.stock_quantity}
                      </span>
                      {isLowStock(p) && <span className="text-xs text-yellow-600 ml-1">Low</span>}
                      {p.stock_quantity === 0 && <span className="text-xs text-destructive ml-1">Out</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.is_featured && <Badge variant="secondary" className="text-[10px] px-1.5">Featured</Badge>}
                        {p.is_best_seller && <Badge variant="secondary" className="text-[10px] px-1.5">Best</Badge>}
                        {p.is_new_arrival && <Badge variant="secondary" className="text-[10px] px-1.5">New</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/${p.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/product/${p.slug}`} target="_blank">Preview</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => remove.mutate([p.id])} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Best Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
      );
    }
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [activeCategory, sort, search]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Page header */}
        <div className="gradient-dark py-12 md:py-16">
          <div className="container">
            <nav className="text-sm font-body text-primary-foreground/60 mb-4" aria-label="Breadcrumb">
              <a href="/" className="hover:text-primary-foreground">Home</a> / <span className="text-primary-foreground">Shop</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
              {activeCategory === "all" ? "All Products" : categories.find(c => c.slug === activeCategory)?.name || "Shop"} 🍬
            </h1>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          {/* Filters bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-colors ${
                  activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary/10"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-colors ${
                    activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary/10"
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-40"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal size={16} />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground font-body mb-6">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Products grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="font-display text-xl text-foreground mb-2">No products found</p>
              <p className="text-muted-foreground font-body">Try a different search or category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Shop;

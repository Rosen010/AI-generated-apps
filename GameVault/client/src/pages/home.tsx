import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { CategoryFilters } from "@/components/category-filters";
import { ProductGrid } from "@/components/product-grid";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.featured);
  }, [products]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100;
    return Math.ceil(Math.max(...products.map((p) => Number(p.price))) / 10) * 10;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category.toLowerCase() === selectedCategory;
      
      const matchesPrice =
        Number(product.price) >= priceRange[0] &&
        Number(product.price) <= priceRange[1];
      
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, selectedCategory, priceRange, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="flex-1">
        {/* Hero Section */}
        {featuredProducts.length > 0 && !searchQuery && selectedCategory === "all" && (
          <HeroSection featuredProducts={featuredProducts} />
        )}

        {/* Products Section */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : selectedCategory === "all"
                  ? "Browse All Games"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Games`}
              </h2>
              <CategoryFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                maxPrice={maxPrice}
              />
            </div>

            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </section>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}

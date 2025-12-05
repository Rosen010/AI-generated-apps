import { Gamepad2, ShoppingCart, Search, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { Product } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const categories = ["All", "Action", "RPG", "Strategy", "Sports", "Indie", "Horror"];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const { totalItems, setIsOpen } = useCart();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const debouncedSearch = useDebounce(localSearch, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery<Product[]>({
    queryKey: ['/api/products/search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
        return [];
      }
      const response = await fetch(`/api/products/search/${encodeURIComponent(debouncedSearch)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideDesktopSearch = searchContainerRef.current?.contains(target);
      const isInsideMobileSearch = mobileSearchContainerRef.current?.contains(target);
      
      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(localSearch);
    setShowDropdown(false);
  };

  const handleResultClick = (productId: number) => {
    setShowDropdown(false);
    setLocalSearch('');
    setMobileMenuOpen(false);
    setLocation(`/product/${productId}`);
  };

  const SearchDropdown = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!showDropdown || debouncedSearch.length < 2) return null;

    return (
      <div 
        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
        data-testid={isMobile ? "search-dropdown-mobile" : "search-dropdown"}
      >
        {isSearching ? (
          <div className="flex items-center justify-center p-4 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching...</span>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <ul className="py-1">
            {searchResults.slice(0, 8).map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleResultClick(product.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover-elevate active-elevate-2 text-left"
                  data-testid={`search-result-${product.id}`}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-semibold">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                        <span className="text-muted-foreground line-through">
                          ${Number(product.originalPrice).toFixed(2)}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No games found for "{debouncedSearch}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            data-testid="link-home"
          >
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              GameVault
            </span>
          </Link>

          {/* Search - Desktop */}
          <div 
            ref={searchContainerRef}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <form
              onSubmit={handleSearch}
              className="w-full"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search games..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => debouncedSearch.length >= 2 && setShowDropdown(true)}
                  className="pl-10 pr-4"
                  data-testid="input-search"
                />
                {isSearching && localSearch.length >= 2 && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </form>
            <SearchDropdown />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-6 mt-6">
                  <div ref={mobileSearchContainerRef} className="relative">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search games..."
                          value={localSearch}
                          onChange={(e) => setLocalSearch(e.target.value)}
                          onFocus={() => debouncedSearch.length >= 2 && setShowDropdown(true)}
                          className="pl-10"
                          data-testid="input-search-mobile"
                        />
                        {isSearching && localSearch.length >= 2 && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </form>
                    <SearchDropdown isMobile />
                  </div>
                  <nav className="flex flex-col gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-category-mobile-${category.toLowerCase()}`}
                      >
                        {category}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageOpen } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No games found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your filters or search query to find the games you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="product-grid"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

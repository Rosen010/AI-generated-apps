import { ShoppingCart, Star, Monitor, Gamepad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "pc":
        return <Monitor className="h-3 w-3" />;
      case "console":
        return <Gamepad className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className="group overflow-visible transition-transform duration-200 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-md">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2"
          >
            -{discountPercent}%
          </Badge>
        )}
        {product.featured && (
          <Badge
            className="absolute top-2 right-2 bg-primary"
          >
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-lg line-clamp-1"
            data-testid={`text-product-title-${product.id}`}
          >
            {product.title}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          {getPlatformIcon(product.platform) && (
            <Badge variant="outline" className="text-xs gap-1">
              {getPlatformIcon(product.platform)}
              {product.platform}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-bold"
              data-testid={`text-product-price-${product.id}`}
            >
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.inStock ? "Add" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

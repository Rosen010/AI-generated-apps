import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const categories = [
  { id: "all", label: "All" },
  { id: "action", label: "Action" },
  { id: "rpg", label: "RPG" },
  { id: "strategy", label: "Strategy" },
  { id: "sports", label: "Sports" },
  { id: "indie", label: "Indie" },
  { id: "horror", label: "Horror" },
];

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
}

export function CategoryFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 100,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="toggle-elevate"
            data-testid={`button-category-${category.id}`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-4 min-w-[280px]">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">
          Price: ${priceRange[0]} - ${priceRange[1]}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          min={0}
          max={maxPrice}
          step={5}
          className="flex-1"
          data-testid="slider-price-range"
        />
      </div>
    </div>
  );
}

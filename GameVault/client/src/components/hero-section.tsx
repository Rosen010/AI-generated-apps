import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@shared/schema";

interface HeroSectionProps {
  featuredProducts: Product[];
}

export function HeroSection({ featuredProducts }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  if (featuredProducts.length === 0) return null;

  const currentProduct = featuredProducts[currentSlide];

  const goToPrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden" data-testid="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentProduct.imageUrl}
          alt={currentProduct.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {/* Dark wash gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-xl space-y-4 md:space-y-6">
          <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-primary/90 rounded-full">
            Featured Game
          </span>
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            data-testid="hero-title"
          >
            {currentProduct.title}
          </h1>
          <p className="text-base md:text-lg text-white/90 line-clamp-3">
            {currentProduct.description}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-2xl md:text-3xl font-bold text-white">
              ${Number(currentProduct.price).toFixed(2)}
            </span>
            {currentProduct.originalPrice &&
              Number(currentProduct.originalPrice) > Number(currentProduct.price) && (
                <span className="text-lg text-white/60 line-through">
                  ${Number(currentProduct.originalPrice).toFixed(2)}
                </span>
              )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              size="lg"
              onClick={() => addToCart(currentProduct)}
              data-testid="hero-add-to-cart"
            >
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredProducts.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            onClick={goToPrevious}
            data-testid="hero-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            onClick={goToNext}
            data-testid="hero-next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots */}
      {featuredProducts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              data-testid={`hero-dot-${index}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

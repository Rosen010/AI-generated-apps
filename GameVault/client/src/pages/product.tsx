import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { CartSidebar } from "@/components/cart-sidebar";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { Product, Review } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const reviewFormSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Review content is required"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

function StarRating({ rating, onRatingChange, interactive = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          data-testid={`star-${star}`}
        >
          <Star 
            className={`h-5 w-5 ${
              star <= (hoverRating || rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`} 
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/products', id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      authorName: "",
      rating: 0,
      title: "",
      content: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      return apiRequest("POST", `/api/products/${id}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id, 'reviews'] });
      form.reset();
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const onSubmitReview = (data: ReviewFormValues) => {
    createReviewMutation.mutate(data);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          <div className="text-center py-16" data-testid="product-not-found">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground">The game you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSidebar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
            {hasDiscount && (
              <Badge 
                variant="destructive" 
                className="absolute top-4 left-4"
                data-testid="discount-badge"
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" data-testid="category-badge">
                  {product.category}
                </Badge>
                <Badge variant="outline" data-testid="platform-badge">
                  {product.platform}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-2" data-testid="product-title">
                {product.title}
              </h1>
              
              {product.rating && (
                <div className="flex items-center gap-1 mb-4" data-testid="product-rating">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            <div className="flex items-baseline gap-3" data-testid="product-price">
              <span className="text-4xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {product.inStock ? (
                <>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <p className="text-sm text-green-600 dark:text-green-400 text-center" data-testid="stock-status">
                    In Stock - Ready for instant download
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <Button size="lg" className="w-full" disabled data-testid="button-out-of-stock">
                    Out of Stock
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2" data-testid="stock-status">
                    Currently unavailable
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews List */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" data-testid="reviews-heading">Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(averageRating)} />
                  <span className="text-muted-foreground" data-testid="average-rating">
                    {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground py-4" data-testid="no-reviews">
                No reviews yet. Be the first to review this game!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} data-testid={`review-card-${review.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`review-author-${review.id}`}>
                              {review.authorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <h4 className="font-semibold mb-1" data-testid={`review-title-${review.id}`}>
                        {review.title}
                      </h4>
                      <p className="text-muted-foreground text-sm" data-testid={`review-content-${review.id}`}>
                        {review.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your name" 
                              data-testid="input-author-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <div data-testid="rating-input">
                              <StarRating 
                                rating={field.value} 
                                onRatingChange={field.onChange}
                                interactive 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Summary of your review" 
                              data-testid="input-review-title"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your experience with this game..."
                              className="min-h-[120px]"
                              data-testid="input-review-content"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {createReviewMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

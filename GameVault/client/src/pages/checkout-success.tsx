import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { CheckCircle, Package, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import type { Order, Product } from "@shared/schema";

type OrderWithItems = Order & {
  items: Array<{
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: string;
    product: Product;
  }>;
};

export default function CheckoutSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");
  const { clearCart } = useCart();
  const [cartCleared, setCartCleared] = useState(false);

  const { data, isLoading, error } = useQuery<{ order: OrderWithItems; alreadyProcessed: boolean }>({
    queryKey: ["/api/checkout/verify", sessionId],
    queryFn: async () => {
      const verifyRes = await fetch(`/api/checkout/verify/${sessionId}`);
      if (!verifyRes.ok) {
        throw new Error("Failed to verify order");
      }
      const verifyData = await verifyRes.json();
      
      // Fetch the full order with items
      const orderRes = await fetch(`/api/orders/${verifyData.order.id}`);
      if (!orderRes.ok) {
        return verifyData;
      }
      const orderWithItems = await orderRes.json();
      return { order: orderWithItems, alreadyProcessed: verifyData.alreadyProcessed };
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (data?.order && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [data, clearCart, cartCleared]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Session</h1>
            <p className="text-muted-foreground mb-6">
              No checkout session found.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processing Order</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Package className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't verify your order. Please contact support.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { order } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2" data-testid="text-success-title">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                <span>Order #{order.id}</span>
                <span className="text-sm font-normal text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                  {order.status.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Order Details</h3>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3"
                      data-testid={`order-item-${item.productId}`}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span data-testid="text-order-total">${Number(order.total).toFixed(2)}</span>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Delivery Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{order.firstName} {order.lastName}</p>
                  <p>{order.email}</p>
                  <p>{order.address}</p>
                  <p>{order.city}, {order.zipCode}</p>
                  <p>{order.country.toUpperCase()}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  A confirmation email has been sent to {order.email}.
                  Your digital games will be available for download shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="flex-1">
                    <Button className="w-full" data-testid="button-continue-shopping">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href={`/orders?email=${encodeURIComponent(order.email)}`} className="flex-1">
                    <Button variant="outline" className="w-full" data-testid="button-view-orders">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

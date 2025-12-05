import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Package, ArrowLeft, Search, Loader2, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import type { Order, OrderItem, Product } from "@shared/schema";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "failed":
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function OrderCard({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: orderDetails, isLoading: detailsLoading, error: detailsError } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", order.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${order.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch order details");
      }
      return res.json();
    },
    enabled: isOpen,
  });

  return (
    <Card data-testid={`order-card-${order.id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-6">
          <CollapsibleTrigger asChild>
            <button className="w-full text-left" data-testid={`button-expand-order-${order.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-md" />
                  <div>
                    <p className="font-semibold text-lg" data-testid={`order-id-${order.id}`}>
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`order-date-${order.id}`}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Date unavailable'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="font-semibold text-lg" data-testid={`order-total-${order.id}`}>
                    ${Number(order.total).toFixed(2)}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Shipped to: {order.firstName} {order.lastName}</p>
                <p>{order.address}, {order.city}, {order.zipCode}, {order.country}</p>
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Separator className="my-4" />
            
            {detailsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading order details...</span>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <XCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-muted-foreground">Failed to load order details. Please try again.</p>
              </div>
            ) : orderDetails?.items && orderDetails.items.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Order Items ({orderDetails.items.length})
                </h4>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-3 rounded-md bg-muted/50"
                      data-testid={`order-item-${item.id}`}
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-md"
                        data-testid={`order-item-image-${item.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.id}`}>
                          <p 
                            className="font-medium truncate hover:text-primary cursor-pointer"
                            data-testid={`order-item-title-${item.id}`}
                          >
                            {item.product.title}
                          </p>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {item.product.category}
                          </Badge>
                          <Badge variant="outline">
                            {item.product.platform}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" data-testid={`order-item-price-${item.id}`}>
                          ${Number(item.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`order-item-qty-${item.id}`}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    ${orderDetails.items.reduce((sum, item) => 
                      sum + Number(item.price) * item.quantity, 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>
                    ${(orderDetails.items.reduce((sum, item) => 
                      sum + Number(item.price) * item.quantity, 0
                    ) * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No items found for this order.
              </p>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

export default function Orders() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const emailFromUrl = params.get("email") || "";
  
  const [email, setEmail] = useState(emailFromUrl);
  const [searchEmail, setSearchEmail] = useState(emailFromUrl);

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders", searchEmail],
    queryFn: async () => {
      if (!searchEmail) return [];
      const res = await fetch(`/api/orders?email=${encodeURIComponent(searchEmail)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    enabled: !!searchEmail,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8" data-testid="page-title">Order History</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Find Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  data-testid="input-order-email"
                />
                <Button type="submit" disabled={!email} data-testid="button-search-orders">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {!searchEmail ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Enter Your Email</h2>
              <p className="text-muted-foreground">
                Enter the email address you used during checkout to view your orders.
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" data-testid="loading-spinner" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
              <p className="text-muted-foreground">
                There was an error loading your orders. Please try again.
              </p>
            </div>
          ) : orders && orders.length === 0 ? (
            <div className="text-center py-12" data-testid="no-orders-message">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
              <p className="text-muted-foreground mb-6">
                No orders were found for {searchEmail}.
              </p>
              <Link href="/">
                <Button data-testid="button-start-shopping">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4" data-testid="orders-list">
              <p className="text-muted-foreground mb-4">
                Found {orders?.length} order{orders?.length !== 1 ? 's' : ''} for {searchEmail}
              </p>
              {orders?.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}

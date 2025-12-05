import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Lock, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Product, Order } from "@shared/schema";

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

function LoginForm({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        onLogin(password);
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Enter your password to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={!password || isLoading} data-testid="button-admin-login">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-to-shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({ 
  product, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  product?: Product; 
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    imageUrl: product?.imageUrl || "",
    category: product?.category || "Action",
    platform: product?.platform || "PC",
    rating: product?.rating || "",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: formData.price.toString(),
      originalPrice: formData.originalPrice ? formData.originalPrice.toString() : null,
      rating: formData.rating ? formData.rating.toString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Game title"
            required
            data-testid="input-product-title"
          />
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Game description"
            required
            data-testid="input-product-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="29.99"
            required
            data-testid="input-product-price"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price ($)</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            placeholder="Optional - for sales"
            data-testid="input-product-original-price"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            required
            data-testid="input-product-image"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger data-testid="select-product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="RPG">RPG</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Indie">Indie</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
              <SelectItem value="Simulation">Simulation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
            <SelectTrigger data-testid="select-product-platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="PlayStation">PlayStation</SelectItem>
              <SelectItem value="Xbox">Xbox</SelectItem>
              <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
              <SelectItem value="Multi-Platform">Multi-Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            placeholder="4.5"
            data-testid="input-product-rating"
          />
        </div>

        <div className="flex items-center gap-6 pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              data-testid="switch-product-instock"
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              data-testid="switch-product-featured"
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-product">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid="button-save-product">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Product"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ProductsTab({ adminPassword }: { adminPassword: string }) {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword 
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddDialogOpen(false);
      toast({ title: "Product created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword 
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": adminPassword },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({products?.length || 0})</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the details for the new product.</DialogDescription>
            </DialogHeader>
            <ProductForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products?.map((product) => (
          <Card key={product.id} data-testid={`product-card-${product.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate" data-testid={`product-title-${product.id}`}>
                      {product.title}
                    </h3>
                    {product.featured && <Badge variant="secondary">Featured</Badge>}
                    {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline">{product.category}</Badge>
                    <Badge variant="outline">{product.platform}</Badge>
                  </div>
                  <p className="text-lg font-bold mt-2" data-testid={`product-price-${product.id}`}>
                    ${Number(product.price).toFixed(2)}
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ${Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isEditDialogOpen && editingProduct?.id === product.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingProduct(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditDialogOpen(true);
                        }}
                        data-testid={`button-edit-product-${product.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Update the product details.</DialogDescription>
                      </DialogHeader>
                      {editingProduct && (
                        <ProductForm
                          product={editingProduct}
                          onSave={(data) => updateMutation.mutate({ id: editingProduct.id, data })}
                          onCancel={() => {
                            setIsEditDialogOpen(false);
                            setEditingProduct(null);
                          }}
                          isLoading={updateMutation.isPending}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        data-testid={`button-delete-product-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="bg-destructive text-destructive-foreground"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ adminPassword }: { adminPassword: string }) {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", {
        headers: { "X-Admin-Password": adminPassword },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const paidOrders = orders?.filter(o => o.status === "paid" || o.status === "completed").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold" data-testid="text-total-orders">{orders?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold" data-testid="text-total-revenue">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Orders</p>
                <p className="text-2xl font-bold" data-testid="text-paid-orders">{paidOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold">All Orders</h2>

      {orders?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order.id} data-testid={`order-card-${order.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" data-testid={`order-id-${order.id}`}>Order #{order.id}</span>
                      <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`order-email-${order.id}`}>
                      {order.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.firstName} {order.lastName} - {order.city}, {order.country}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Date unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold" data-testid={`order-total-${order.id}`}>
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                    >
                      <SelectTrigger className="w-36" data-testid={`select-order-status-${order.id}`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ adminPassword, onLogout }: { adminPassword: string; onLogout: () => void }) {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", {
        headers: { "X-Admin-Password": adminPassword },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter(p => p.inStock).length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-view-store">
                View Store
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold" data-testid="text-dashboard-products">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-bold" data-testid="text-dashboard-instock">{inStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-dashboard-orders">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-dashboard-revenue">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-4" data-testid="admin-tabs">
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductsTab adminPassword={adminPassword} />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab adminPassword={adminPassword} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPassword");
    if (saved) {
      setAdminPassword(saved);
    }
  }, []);

  const handleLogin = (password: string) => {
    sessionStorage.setItem("adminPassword", password);
    setAdminPassword(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    setAdminPassword(null);
  };

  if (!adminPassword) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <AdminDashboard adminPassword={adminPassword} onLogout={handleLogout} />;
}

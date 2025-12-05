import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Lock, Package, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Please select a country"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "au", label: "Australia" },
  { value: "jp", label: "Japan" },
];

export default function Checkout() {
  const { items, subtotal } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const checkoutData = {
        email: data.email,
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode,
          country: data.country,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      const response = await apiRequest("POST", "/api/checkout/create-session", checkoutData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        setIsRedirecting(true);
        window.location.href = data.url;
      } else {
        toast({
          title: "Checkout Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout failed",
        description: error?.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some games to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate(data);
  };

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some games to your cart before checking out.
            </p>
            <Link href="/">
              <Button data-testid="button-continue-shopping">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
        <CartSidebar />
      </div>
    );
  }

  const isPending = checkoutMutation.isPending || isRedirecting;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@example.com"
                                type="email"
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John"
                                  {...field}
                                  data-testid="input-first-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Doe"
                                  {...field}
                                  data-testid="input-last-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Main Street"
                                {...field}
                                data-testid="input-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="New York"
                                  {...field}
                                  data-testid="input-city"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="10001"
                                  {...field}
                                  data-testid="input-zip"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-country">
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                    data-testid={`option-country-${country.value}`}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted rounded-md p-4">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>
                          You'll be redirected to Stripe's secure checkout to complete your payment.
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-4 text-muted-foreground">
                        <span className="text-sm">Accepted cards:</span>
                        <SiVisa className="h-6 w-8" />
                        <SiMastercard className="h-6 w-6" />
                        <SiAmericanexpress className="h-6 w-6" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit - Desktop */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full hidden lg:flex"
                    disabled={isPending}
                    data-testid="button-place-order"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Proceed to Payment - ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile: Accordion */}
                  <Accordion type="single" collapsible className="lg:hidden">
                    <AccordionItem value="items" className="border-none">
                      <AccordionTrigger className="py-0 hover:no-underline">
                        <span className="text-sm">
                          {items.length} {items.length === 1 ? "item" : "items"} in cart
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.product.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-medium">
                                ${(Number(item.product.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Desktop: Always show items */}
                  <div className="hidden lg:block space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3"
                        data-testid={`checkout-item-${item.productId}`}
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">${total.toFixed(2)}</span>
                  </div>

                  {/* Submit - Mobile */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full lg:hidden"
                    disabled={isPending}
                    onClick={form.handleSubmit(onSubmit)}
                    data-testid="button-place-order-mobile"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}

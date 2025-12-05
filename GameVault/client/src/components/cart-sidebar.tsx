import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { Link } from "wouter";

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal, clearCart } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {items.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              Looks like you haven't added any games yet. Start browsing to find your next adventure!
            </p>
            <Button onClick={() => setIsOpen(false)} data-testid="button-browse-games">
              Browse Games
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.productId}`}
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.product.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeFromCart(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span
                            className="w-8 text-center text-sm"
                            data-testid={`text-quantity-${item.productId}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-muted-foreground"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear cart
                </Button>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Subtotal</span>
                <span
                  className="text-xl font-bold"
                  data-testid="text-cart-subtotal"
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Link href="/checkout">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

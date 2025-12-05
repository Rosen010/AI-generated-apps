import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SiVisa, SiMastercard, SiPaypal, SiApplepay } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">GameVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for digital games. Find the best deals on the
              latest titles and timeless classics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All Games
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Deals
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                New Releases
              </a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Returns Policy
              </a>
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </a>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get updates on new releases and exclusive deals.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button type="submit" data-testid="button-subscribe">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            2024 GameVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Payment methods:</span>
            <div className="flex items-center gap-3">
              <SiVisa className="h-6 w-8 text-muted-foreground" />
              <SiMastercard className="h-6 w-8 text-muted-foreground" />
              <SiPaypal className="h-5 w-8 text-muted-foreground" />
              <SiApplepay className="h-6 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

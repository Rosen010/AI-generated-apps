import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  // Create Stripe Checkout Session
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      
      const sessionSchema = z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })),
        email: z.string().email(),
        customerInfo: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          address: z.string().min(1),
          city: z.string().min(1),
          zipCode: z.string().min(1),
          country: z.string().min(1),
        }),
      });

      const validatedData = sessionSchema.parse(req.body);

      // Build line items from cart
      const lineItems = [];
      let serverTotal = 0;
      const validatedItems: Array<{ productId: number; quantity: number; price: string; title: string }> = [];

      for (const item of validatedData.items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (!product.inStock) {
          return res.status(400).json({ error: `Product ${product.title} is out of stock` });
        }

        const priceInCents = Math.round(Number(product.price) * 100);
        serverTotal += priceInCents * item.quantity;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          title: product.title,
        });

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description.substring(0, 500),
              images: product.imageUrl.startsWith('http') ? [product.imageUrl] : [],
            },
            unit_amount: priceInCents,
          },
          quantity: item.quantity,
        });
      }

      // Add tax line item (10%)
      const taxAmount = Math.round(serverTotal * 0.1);
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax (10%)',
            description: 'Sales tax',
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });

      // Get base URL with fallback for non-Replit environments
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain 
        ? `https://${replitDomain}`
        : (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`);
      
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout`,
        customer_email: validatedData.email,
        metadata: {
          orderItems: JSON.stringify(validatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))),
          firstName: validatedData.customerInfo.firstName,
          lastName: validatedData.customerInfo.lastName,
          address: validatedData.customerInfo.address,
          city: validatedData.customerInfo.city,
          zipCode: validatedData.customerInfo.zipCode,
          country: validatedData.customerInfo.country,
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid checkout data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Verify checkout session and create order
  app.get("/api/checkout/verify/:sessionId", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const { sessionId } = req.params;

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Check if order already exists for this session
      const existingOrders = await storage.getOrdersByStripeSessionId(sessionId);
      if (existingOrders.length > 0) {
        return res.json({ order: existingOrders[0], alreadyProcessed: true });
      }

      // Create order from session metadata
      const metadata = session.metadata || {};
      const orderItems = JSON.parse(metadata.orderItems || '[]');
      
      // Use Stripe's amount_total for accurate total (in cents, convert to dollars)
      const total = session.amount_total ? (session.amount_total / 100) : 0;

      const order = await storage.createOrder({
        sessionId: "stripe-" + sessionId,
        email: session.customer_email || '',
        firstName: metadata.firstName || '',
        lastName: metadata.lastName || '',
        address: metadata.address || '',
        city: metadata.city || '',
        zipCode: metadata.zipCode || '',
        country: metadata.country || '',
        total: total.toFixed(2),
        status: "paid",
        stripeSessionId: sessionId,
      });

      // Create order items
      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      res.json({ order, alreadyProcessed: false });
    } catch (error) {
      console.error("Error verifying checkout session:", error);
      res.status(500).json({ error: "Failed to verify checkout session" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  // Search products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Get user orders by email
  app.get("/api/orders", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const orders = await storage.getOrdersByEmail(email);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get order with items
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      const order = await storage.getOrderWithItems(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Legacy create order endpoint (without Stripe)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      
      const orderSchema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        zipCode: z.string().min(1),
        country: z.string().min(1),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })),
      });

      const validatedData = orderSchema.parse(orderData);

      let serverTotal = 0;
      const validatedItems: Array<{ productId: number; quantity: number; price: string }> = [];

      for (const item of validatedData.items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (!product.inStock) {
          return res.status(400).json({ error: `Product ${product.title} is out of stock` });
        }
        
        const itemTotal = Number(product.price) * item.quantity;
        serverTotal += itemTotal;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const totalWithTax = serverTotal * 1.1;

      const order = await storage.createOrder({
        sessionId: "web-session-" + Date.now(),
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        address: validatedData.address,
        city: validatedData.city,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        total: totalWithTax.toFixed(2),
        status: "pending",
      });

      for (const item of validatedItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get reviews for a product
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create a review for a product
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Verify product exists
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const reviewSchema = z.object({
        authorName: z.string().min(1, "Name is required"),
        rating: z.number().min(1).max(5),
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Review content is required"),
      });

      const validatedData = reviewSchema.parse(req.body);

      const review = await storage.createReview({
        productId,
        authorName: validatedData.authorName,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Admin authentication middleware
  const verifyAdminPassword = (req: any, res: any, next: any) => {
    const password = req.headers["x-admin-password"];
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({ error: "Admin password not configured" });
    }
    
    if (password !== adminPassword) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    next();
  };

  // Admin: Verify password
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({ error: "Admin password not configured" });
    }
    
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", verifyAdminPassword, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin: Update order status
  app.patch("/api/admin/orders/:id/status", verifyAdminPassword, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Admin: Create product
  app.post("/api/admin/products", verifyAdminPassword, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin: Update product
  app.patch("/api/admin/products/:id", verifyAdminPassword, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const updatedProduct = await storage.updateProduct(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", verifyAdminPassword, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  return httpServer;
}

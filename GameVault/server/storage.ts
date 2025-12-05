import {
  products,
  cartItems,
  orders,
  orderItems,
  reviews,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersBySession(sessionId: string): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getOrdersByStripeSessionId(stripeSessionId: string): Promise<Order[]>;
  getOrderWithItems(orderId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Reviews
  getReviewsByProductId(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.title, searchPattern),
          ilike(products.description, searchPattern)
        )
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId))
      .innerJoin(products, eq(cartItems.productId, products.id));

    return items.map((item) => ({
      ...item.cart_items,
      product: item.products,
    }));
  }

  async getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId))
      );
    return item || undefined;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(orderItem).returning();
    return newItem;
  }

  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.email, email)).orderBy(orders.createdAt);
  }

  async getOrdersByStripeSessionId(stripeSessionId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId));
  }

  async getOrderWithItems(orderId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .innerJoin(products, eq(orderItems.productId, products.id));

    return {
      ...order,
      items: items.map((item) => ({
        ...item.order_items,
        product: item.products,
      })),
    };
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(orders.createdAt);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  // Reviews
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(reviews.createdAt);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
}

export const storage = new DatabaseStorage();

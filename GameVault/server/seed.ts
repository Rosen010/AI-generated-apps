import { db } from "./db";
import { products } from "@shared/schema";

const gameProducts = [
  {
    title: "Galactic Conquest",
    description: "Lead humanity's last stand against an overwhelming alien invasion in this epic sci-fi action shooter. Experience intense combat, strategic warfare, and stunning visuals across multiple worlds.",
    price: "59.99",
    originalPrice: "69.99",
    imageUrl: "/assets/generated_images/sci-fi_action_game_cover.png",
    category: "Action",
    platform: "PC",
    rating: "4.8",
    inStock: true,
    featured: true,
  },
  {
    title: "Dragon's Legacy",
    description: "Embark on an epic fantasy adventure as you battle ancient dragons, master powerful magic, and save the kingdom from eternal darkness. A massive open-world RPG experience awaits.",
    price: "49.99",
    originalPrice: "59.99",
    imageUrl: "/assets/generated_images/fantasy_rpg_game_cover.png",
    category: "RPG",
    platform: "PC",
    rating: "4.9",
    inStock: true,
    featured: true,
  },
  {
    title: "Desert Storm Command",
    description: "Take command of the world's most powerful military forces in this realistic tactical strategy game. Plan your attacks, manage resources, and lead your troops to victory.",
    price: "39.99",
    originalPrice: null,
    imageUrl: "/assets/generated_images/military_strategy_game_cover.png",
    category: "Strategy",
    platform: "PC",
    rating: "4.6",
    inStock: true,
    featured: false,
  },
  {
    title: "Midnight Racer",
    description: "Race through neon-lit city streets in the ultimate underground racing experience. Customize your cars, outrun rivals, and become the legend of the midnight racing scene.",
    price: "44.99",
    originalPrice: "54.99",
    imageUrl: "/assets/generated_images/racing_sports_game_cover.png",
    category: "Sports",
    platform: "PC",
    rating: "4.5",
    inStock: true,
    featured: true,
  },
  {
    title: "Enchanted Grove",
    description: "A charming pixel-art adventure through magical forests filled with friendly creatures, puzzles, and heartwarming stories. Perfect for players seeking a cozy gaming experience.",
    price: "19.99",
    originalPrice: null,
    imageUrl: "/assets/generated_images/indie_adventure_game_cover.png",
    category: "Indie",
    platform: "PC",
    rating: "4.7",
    inStock: true,
    featured: false,
  },
  {
    title: "Silent Ward",
    description: "Survive the horrors of an abandoned hospital where something evil lurks in every shadow. Uncover the dark secrets while staying alive in this heart-pounding survival horror experience.",
    price: "34.99",
    originalPrice: "44.99",
    imageUrl: "/assets/generated_images/horror_survival_game_cover.png",
    category: "Horror",
    platform: "PC",
    rating: "4.4",
    inStock: true,
    featured: false,
  },
  {
    title: "Cosmic Horizons",
    description: "Explore the vast mysteries of the universe in this stunning space exploration game. Discover alien civilizations, mine resources, and chart your own course among the stars.",
    price: "54.99",
    originalPrice: null,
    imageUrl: "/assets/generated_images/space_exploration_game_cover.png",
    category: "Action",
    platform: "PC",
    rating: "4.8",
    inStock: true,
    featured: true,
  },
  {
    title: "Ultimate Fighters Arena",
    description: "Enter the arena and prove your fighting skills against warriors from around the world. Master unique fighting styles, execute devastating combos, and become the ultimate champion.",
    price: "29.99",
    originalPrice: "39.99",
    imageUrl: "/assets/generated_images/fighting_game_cover_art.png",
    category: "Action",
    platform: "PC",
    rating: "4.3",
    inStock: true,
    featured: false,
  },
];

export async function seedDatabase() {
  // Check if products already exist
  const existingProducts = await db.select().from(products);
  
  if (existingProducts.length > 0) {
    console.log("Database already has", existingProducts.length, "products - skipping seed");
    return;
  }

  console.log("Seeding database with game products...");

  // Insert all products
  for (const product of gameProducts) {
    await db.insert(products).values(product);
  }

  console.log("Seeding complete! Added", gameProducts.length, "products");
}

// Run seed if this file is executed directly
seedDatabase().catch(console.error);

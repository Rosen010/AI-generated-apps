# Design Guidelines: Gaming Web Shop

## Design Approach

**Reference-Based Approach:** Drawing inspiration from Steam, Epic Games Store, and modern gaming e-commerce platforms, combined with Shopify's clean product presentation. This creates a bold, immersive gaming aesthetic while maintaining e-commerce usability standards.

**Key Principles:**
- Bold, confident typography that conveys gaming energy
- Card-based product grids for easy scanning
- Generous product imagery with hover interactions
- Clear information hierarchy prioritizing game titles and prices

## Typography

**Font Selection:**
- Primary: Inter or Roboto (600-700 weight for headings, 400-500 for body)
- Accent: Bebas Neue or Rajdhani for hero headlines and CTAs (gaming energy)

**Hierarchy:**
- Hero Headlines: 4xl-6xl, bold/extra-bold, uppercase spacing
- Section Headers: 3xl-4xl, semibold
- Product Titles: xl-2xl, semibold
- Body Text: base-lg, regular
- UI Labels: sm-base, medium

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, and 24 (e.g., p-4, gap-8, mb-12)

**Container Strategy:**
- Full-width sections with inner max-w-7xl containers
- Product grids: max-w-7xl
- Checkout forms: max-w-3xl
- Cart sidebar: Fixed 400px width

**Grid Systems:**
- Desktop: 4-column product grid (grid-cols-4)
- Tablet: 3-column (md:grid-cols-3)
- Mobile: 2-column (grid-cols-2)
- Featured products: 3-column hero grid

## Component Library

### Navigation Header
- Sticky header with logo, search bar, category navigation, cart icon
- Search bar: Prominent center placement, full-width on mobile
- Cart badge: Pill indicator showing item count
- Height: h-16 on mobile, h-20 on desktop

### Hero Section
- Full-width featured game carousel (3-5 slides)
- Height: 60vh on desktop, 50vh on mobile
- Overlay gradient for text readability
- CTA buttons with backdrop blur (backdrop-blur-sm bg-white/10)
- Auto-rotating every 5 seconds with manual controls

### Product Cards
- Image: 16:9 aspect ratio, object-cover
- Card structure: Image → Title → Price → Platform icons → Add to Cart button
- Hover: Subtle lift (transform translate-y-1) and shadow increase
- Price: Large, bold display
- Spacing: p-4 internal padding, gap-6 between cards

### Shopping Cart (Sidebar)
- Slide-in from right side
- Backdrop overlay with blur
- Cart items: Thumbnail (80px) + details + quantity controls + remove
- Sticky footer with subtotal and checkout button
- Empty state: Icon + message + "Browse Games" CTA

### Category Filters
- Horizontal pill-style filters on desktop
- Dropdown on mobile
- Active state: Filled style
- Categories: All, Action, RPG, Strategy, Sports, Indie
- Price range slider component

### Checkout Page
- Two-column layout: Form (left, 60%) + Order Summary (right, 40%)
- Single-column on mobile
- Form sections: Contact → Billing → Payment
- Order summary: Sticky on desktop, collapsible accordion on mobile
- Progressive disclosure for form sections

### Product Detail Modal/Page
- Large game cover image (left, 50%)
- Details section (right, 50%): Title → Price → Description → Platform badges → Add to Cart
- Screenshot gallery below
- Breadcrumb navigation at top

### Footer
- Three-column layout: About + Quick Links + Contact
- Newsletter signup: Single-line input with inline button
- Social icons: Simple icon links
- Payment method badges
- Copyright and legal links

## Images

**Hero Section:**
- 3-5 high-quality game banner images (1920x800px recommended)
- Featured games with dramatic artwork
- Text overlay safe area with gradient backdrop

**Product Catalog:**
- Game cover images for every product (16:9 ratio)
- Minimum 20 diverse game titles with authentic cover art
- Use placeholder service or actual game imagery

**Category Imagery:**
- Optional header images for category pages
- Background patterns for empty states

**Placement Strategy:**
- Hero carousel: Full-width at top
- Product grid: Dominant image in each card
- Cart thumbnails: Small square (80x80px)
- Checkout summary: Tiny thumbnails (60x60px)

## Interactive Elements

**Buttons:**
- Primary CTA: Large, rounded (rounded-lg), semibold text
- Secondary: Outlined style
- Icon buttons: For cart, favorites, quick view
- Hover states: Built-in button component states

**Animations:**
- Product card hover: Subtle lift only
- Cart slide-in: Smooth 300ms transition
- Loading states: Spinner for async operations
- No distracting scroll animations

**Form Inputs:**
- Rounded corners (rounded-md)
- Clear labels above inputs
- Validation: Inline error messages below fields
- Focus states: Clear border highlight

This creates a modern, gaming-focused e-commerce experience that balances visual impact with usability and conversion optimization.
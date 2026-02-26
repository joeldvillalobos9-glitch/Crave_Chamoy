import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  badge?: string;
  inStock: boolean;
  sku: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Chamoy Candy",
    slug: "classic-chamoy-candy",
    price: 8.99,
    compareAtPrice: 11.99,
    image: product1,
    images: [product1],
    category: "Chamoy Classics",
    categorySlug: "chamoy-classics",
    description: "Our signature chamoy candy — sweet, spicy, and tangy all in one bite. Made with real chamoy sauce and a dusting of chili lime powder. Each piece delivers the authentic chamoy flavor you crave.",
    shortDescription: "Sweet, spicy & tangy chamoy candy",
    rating: 4.8,
    reviewCount: 124,
    tags: ["bestseller", "classic", "chamoy"],
    badge: "Best Seller",
    inStock: true,
    sku: "CC-001",
  },
  {
    id: "2",
    name: "Mango Chamoy Lollipop",
    slug: "mango-chamoy-lollipop",
    price: 6.99,
    image: product2,
    images: [product2],
    category: "Lollipops",
    categorySlug: "lollipops",
    description: "Juicy mango lollipop coated in chamoy sauce and chili lime powder. A perfect balance of sweet tropical mango and spicy chamoy kick.",
    shortDescription: "Mango lollipop with chamoy & chili lime",
    rating: 4.9,
    reviewCount: 89,
    tags: ["mango", "lollipop", "popular"],
    badge: "New",
    inStock: true,
    sku: "ML-002",
  },
  {
    id: "3",
    name: "Watermelon Chamoy Gummies",
    slug: "watermelon-chamoy-gummies",
    price: 9.99,
    image: product3,
    images: [product3],
    category: "Gummies",
    categorySlug: "gummies",
    description: "Fresh watermelon gummies coated in chamoy and tajin-style chili powder. Sweet, sour, and spicy with every chewy bite.",
    shortDescription: "Watermelon gummies with chamoy coating",
    rating: 4.7,
    reviewCount: 67,
    tags: ["watermelon", "gummy", "fruity"],
    inStock: true,
    sku: "WG-003",
  },
  {
    id: "4",
    name: "Chamoy Peach Rings",
    slug: "chamoy-peach-rings",
    price: 7.99,
    compareAtPrice: 9.99,
    image: product4,
    images: [product4],
    category: "Gummies",
    categorySlug: "gummies",
    description: "Classic peach ring gummies drenched in chamoy sauce and dusted with chili powder. A sweet-and-spicy twist on a nostalgic favorite.",
    shortDescription: "Peach rings drenched in chamoy sauce",
    rating: 4.6,
    reviewCount: 53,
    tags: ["peach", "gummy", "nostalgic"],
    badge: "Sale",
    inStock: true,
    sku: "PR-004",
  },
  {
    id: "5",
    name: "Tamarind Chamoy Balls",
    slug: "tamarind-chamoy-balls",
    price: 10.99,
    image: product5,
    images: [product5],
    category: "Chamoy Classics",
    categorySlug: "chamoy-classics",
    description: "Rich tamarind candy balls coated in chamoy and chili powder. An authentic Mexican candy experience with deep, complex flavor.",
    shortDescription: "Tamarind balls with chamoy & chili",
    rating: 4.9,
    reviewCount: 41,
    tags: ["tamarind", "traditional", "spicy"],
    inStock: true,
    sku: "TB-005",
  },
  {
    id: "6",
    name: "Chamoy Gummy Bears",
    slug: "chamoy-gummy-bears",
    price: 8.49,
    image: product6,
    images: [product6],
    category: "Gummies",
    categorySlug: "gummies",
    description: "Colorful gummy bears coated in chamoy sauce and chili lime seasoning. Fun, fruity, and packed with sweet heat.",
    shortDescription: "Gummy bears with chamoy & chili lime",
    rating: 4.5,
    reviewCount: 78,
    tags: ["gummy bears", "fun", "colorful"],
    badge: "Popular",
    inStock: true,
    sku: "GB-006",
  },
];

export const categories = [
  { name: "Chamoy Classics", slug: "chamoy-classics", count: 2, emoji: "🌶️" },
  { name: "Gummies", slug: "gummies", count: 3, emoji: "🍬" },
  { name: "Lollipops", slug: "lollipops", count: 1, emoji: "🍭" },
  { name: "Gift Sets", slug: "gift-sets", count: 0, emoji: "🎁" },
  { name: "New Arrivals", slug: "new-arrivals", count: 0, emoji: "✨" },
];

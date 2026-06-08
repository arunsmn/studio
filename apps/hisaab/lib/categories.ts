import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  ShoppingBag,
  Tv,
  Zap,
  Home,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import type { Category } from "./types";

interface CategoryMeta {
  colour: string;
  Icon: React.ElementType;
  chartColour: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: { colour: "text-orange-500", Icon: UtensilsCrossed, chartColour: "#f97316" },
  Transport: { colour: "text-blue-500", Icon: Car, chartColour: "#3b82f6" },
  Groceries: { colour: "text-green-500", Icon: ShoppingCart, chartColour: "#22c55e" },
  Shopping: { colour: "text-pink-500", Icon: ShoppingBag, chartColour: "#ec4899" },
  Entertainment: { colour: "text-purple-500", Icon: Tv, chartColour: "#a855f7" },
  "Bills & Recharge": { colour: "text-yellow-500", Icon: Zap, chartColour: "#eab308" },
  "EMI & Rent": { colour: "text-red-500", Icon: Home, chartColour: "#ef4444" },
  Health: { colour: "text-teal-500", Icon: Heart, chartColour: "#14b8a6" },
  Others: { colour: "text-gray-400", Icon: MoreHorizontal, chartColour: "#9ca3af" },
};

export const ALL_CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Groceries",
  "Shopping",
  "Entertainment",
  "Bills & Recharge",
  "EMI & Rent",
  "Health",
  "Others",
];

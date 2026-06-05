export type AIModel = "gemini" | "claude";

export type Category =
  | "Food"
  | "Transport"
  | "Groceries"
  | "Shopping"
  | "Entertainment"
  | "Bills & Recharge"
  | "EMI & Rent"
  | "Health"
  | "Others";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  createdAt: string;
  model: AIModel;
}

export interface ParsedExpense {
  amount: number;
  category: Category;
  description: string;
  date: string;
}

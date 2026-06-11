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

export interface PartialExpense {
  category: Category;
  description: string;
  date: string;
}

export type ParseExpenseResult =
  | { type: "complete"; expense: ParsedExpense }
  | { type: "needsAmount"; partial: PartialExpense }
  | { type: "multiple"; expenses: ParsedExpense[] };

export interface ChartEntry {
  name: Category;
  value: number;
}

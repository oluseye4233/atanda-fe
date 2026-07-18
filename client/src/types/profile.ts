export interface ProfileUpdate {
  name: string;
  role: string;
  department: string;
  location: string;
  seniority: string;
}

export interface ProfileCredits {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: string;
}

export interface SpcSalesSummary {
  totalEarned: number;
  salesCount: number;
}

export interface DeleteAccountBody {
  confirm: "DELETE";
}

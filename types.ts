
export enum UserRole {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favorites: string[]; // Array of artwork IDs
  isMarketingAuthorized: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  images: string[];
  hammerPrice: number; // In RMB
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  auctionHouse: string;
  auctionSession: string;
  auctionDate: string; // YYYY-MM-DD
  auctionTime: string; // HH:mm
  dimensions: string;
  material: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
}

export interface IndexPoint {
  date: string; // YYYY-MM
  value: number;
  volume: number;
  avgPrice: number;
}

export type SortField = 'date' | 'price_high' | 'price_low';

export interface SearchQuery {
  keyword: string;
  isExact: boolean;
  page: number;
  pageSize: number;
  sortField: SortField;
}

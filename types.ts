export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // 新增：保存用户密码
  role: UserRole;
  favorites: string[]; // IDs of favorite artworks
  isMarketingAuthorized: boolean;
}

export type ArtworkStatus = 'DRAFT' | 'PUBLISHED';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  material: string;
  dimensions: string;
  creationYear?: string;
  
  hammerPrice: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  
  auctionHouse: string;
  auctionDate: string;
  auctionTime?: string;
  auctionSession?: string;
  
  description: string;
  thumbnail: string;
  images: string[];
  
  createdAt: string;
  status: ArtworkStatus;
}

export type SortField = 'date' | 'price_high' | 'price_low';

// types.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  favorites: string[];
  isMarketingAuthorized: boolean;
  // ⚠️ 新增
  isVip?: boolean;
  vipExpireAt?: string;
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

export interface Advertisement {
  id: string;
  slotId: string;
  name: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

export type SortField = 'date' | 'price_high' | 'price_low';

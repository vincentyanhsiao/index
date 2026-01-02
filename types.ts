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

// 新增：广告数据类型
export interface Advertisement {
  id: string;
  slotId: string;   // 广告位唯一标识 (如 'home_trending')
  name: string;     // 管理员看的名称 (如 '首页-近期成交下方')
  title: string;    // 默认展示的标题 (当没传图片时显示)
  imageUrl: string; // 广告图片链接
  linkUrl: string;  // 点击跳转链接
  isActive: boolean;
}

export type SortField = 'date' | 'price_high' | 'price_low';

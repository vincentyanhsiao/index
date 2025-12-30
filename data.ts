
import { Artwork } from './types';

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: '南山秋色图',
    artist: '张大千',
    category: '中国书画',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop'],
    hammerPrice: 12500000.00,
    estimatedPriceMin: 10000000.00,
    estimatedPriceMax: 15000000.00,
    auctionHouse: '中国保利',
    auctionSession: '近现代书画精品场',
    auctionDate: '2023-11-20',
    auctionTime: '14:30',
    dimensions: '136cm × 68cm',
    material: '设色纸本',
    description: '此幅作于张大千晚年，笔墨苍劲淋漓，色彩明丽，展现了其卓越的艺术成就。',
    status: 'PUBLISHED',
    createdAt: '2023-11-20T00:00:00Z'
  },
  {
    id: '2',
    title: '抽象构成 No.5',
    artist: '吴冠中',
    category: '油画',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'],
    hammerPrice: 8800000.00,
    estimatedPriceMin: 7000000.00,
    estimatedPriceMax: 9000000.00,
    auctionHouse: '嘉德拍卖',
    auctionSession: '当代艺术夜场',
    auctionDate: '2023-10-15',
    auctionTime: '19:00',
    dimensions: '100cm × 80cm',
    material: '布面油彩',
    description: '吴冠中油画作品中点、线、面的极致运用，充满了韵律感。',
    status: 'PUBLISHED',
    createdAt: '2023-10-15T00:00:00Z'
  },
  // Spread data over multiple months for interesting chart
  ...Array.from({ length: 40 }).map((_, i) => {
    const month = (i % 12) + 1;
    const year = 2023 + Math.floor(i / 12);
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-10`;
    return {
      id: `mock-${i + 4}`,
      title: `历史佳作 ${i + 1}`,
      artist: i % 3 === 0 ? '齐白石' : i % 3 === 1 ? '张大千' : '李可染',
      category: i % 4 === 0 ? '油画' : i % 4 === 1 ? '瓷器' : '中国书画',
      thumbnail: `https://picsum.photos/seed/art${i}/400/300`,
      images: [`https://picsum.photos/seed/art${i}/1200/800`],
      hammerPrice: Math.floor(Math.random() * 5000000) + 500000,
      estimatedPriceMin: 400000,
      estimatedPriceMax: 6000000,
      auctionHouse: i % 2 === 0 ? '保利' : '嘉德',
      auctionSession: '例行大拍',
      auctionDate: dateStr,
      auctionTime: '15:00',
      dimensions: '60cm × 40cm',
      material: '综合材质',
      description: '这是生成的模拟交易数据。',
      status: 'PUBLISHED' as const,
      createdAt: dateStr + 'T10:00:00Z'
    };
  })
];

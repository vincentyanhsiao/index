import React from 'react';
import { Artwork } from '../types';

interface Props {
  artwork: Artwork;
}

const ArtworkCard: React.FC<Props> = ({ artwork }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      {/* 1. 图片区域 */}
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
        <img 
          src={artwork.thumbnail} 
          alt={artwork.title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-white text-[10px] font-medium">
          {artwork.category}
        </div>
      </div>

      {/* 2. 信息区域 */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* 修改：作品名称放在最上方 */}
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 leading-snug text-base">
            {artwork.title}
          </h3>

          {/* 修改：艺术家名称 + 创作时间 放在作品名称下面 */}
          <div className="flex items-center mb-3 flex-wrap">
             <span className="text-blue-600 font-bold text-sm mr-2">
               {artwork.artist}
             </span>
             {artwork.creationYear && (
               <span className="text-gray-400 text-xs font-medium">
                 {artwork.creationYear}
               </span>
             )}
          </div>

          {/* 价格区域 */}
          <div className="mb-4">
            <div className="flex items-baseline space-x-1">
               <span className="text-xs text-gray-500">成交价</span>
               <span className="text-lg font-black text-red-600">
                 ¥{artwork.hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
               </span>
            </div>
            {/* 估价小字 */}
            <div className="text-[10px] text-gray-400 mt-0.5">
               估价: {artwork.estimatedPriceMin.toLocaleString()} - {artwork.estimatedPriceMax.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* 底部拍卖信息 */}
        <div className="pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
          <span className="truncate max-w-[60%]">{artwork.auctionHouse}</span>
          <span>{artwork.auctionDate}</span>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;

import React from 'react';
import { Artwork } from '../types';
import { MapPin, Calendar, Lock } from 'lucide-react';

interface Props {
  artwork: Artwork;
  onClick?: () => void;
  // ⚠️ 新增：控制是否隐藏价格
  maskPrice?: boolean; 
}

const ArtworkCard: React.FC<Props> = ({ artwork, onClick, maskPrice = false }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full flex flex-col"
    >
      {/* 图片区域 */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <img 
          src={artwork.thumbnail} 
          alt={artwork.title} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
          {artwork.category}
        </div>
      </div>

      {/* 信息区域 */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {artwork.title}
          </h3>
          <p className="text-gray-500 text-sm font-medium mb-3">{artwork.artist}</p>
          
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center text-xs text-gray-400">
              <MapPin size={12} className="mr-1.5 text-gray-300" />
              <span className="truncate max-w-[180px]">{artwork.auctionHouse}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <Calendar size={12} className="mr-1.5 text-gray-300" />
              <span>{artwork.auctionDate}</span>
            </div>
          </div>
        </div>

        {/* ⚠️ 价格显示逻辑核心修改 */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">成交价</span>
          
          {maskPrice ? (
            // --- VIP 隐藏状态样式 ---
            <div className="relative">
              <span className="text-lg font-black text-gray-200 blur-[2px] select-none">
                ¥ 888,888
              </span>
              <div className="absolute inset-0 flex items-center justify-end">
                <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center border border-amber-100">
                   <Lock size={10} className="mr-1" /> VIP
                </span>
              </div>
            </div>
          ) : (
            // --- 正常显示样式 ---
            <span className="text-lg font-black text-red-600">
              ¥ {artwork.hammerPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;

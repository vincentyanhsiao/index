
import React from 'react';
import { Link } from 'react-router-dom';
import { Artwork } from '../types';
import { Calendar, Tag, ChevronRight } from 'lucide-react';

interface Props {
  artwork: Artwork;
}

const ArtworkCard: React.FC<Props> = ({ artwork }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={artwork.thumbnail} 
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs rounded-md">
          {artwork.category}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-1 text-sm font-medium text-blue-600">{artwork.artist}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1">{artwork.title}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar size={14} className="mr-1.5" />
            <span>成交日期：{artwork.auctionDate}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <Tag size={14} className="mr-1.5" />
            <span className="truncate">拍卖行：{artwork.auctionHouse}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-xs block">成交价</span>
            <span className="text-xl font-bold text-red-600">
              ¥ {artwork.hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Link 
            to={`/artwork/${artwork.id}`}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;

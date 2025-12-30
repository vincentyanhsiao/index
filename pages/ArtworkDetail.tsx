import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { ArrowLeft, Share2, MapPin, Calendar, Maximize2, ChevronLeft, ChevronRight, Check, Copy } from 'lucide-react';

interface Props {
  artworks: Artwork[];
}

const ArtworkDetail: React.FC<Props> = ({ artworks }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artwork = artworks.find(a => a.id === id);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 核心逻辑：计算相关作品
  const relatedArtworks = useMemo(() => {
    if (!artwork) return [];
    
    // 策略1: 优先查找同艺术家的其他作品 (排除当前作品)
    const sameArtist = artworks.filter(a => 
      a.artist === artwork.artist && a.id !== artwork.id
    );
    
    // 如果有同艺术家的作品，直接返回（最多显示4个）
    if (sameArtist.length > 0) {
      return sameArtist.slice(0, 4);
    }

    // 策略2: 如果没有同艺术家作品，查找同场拍卖会的作品
    // 匹配条件：同拍卖行 + 同专场名 + 排除当前作品
    const sameSession = artworks.filter(a => 
      a.auctionHouse === artwork.auctionHouse &&
      a.auctionSession === artwork.auctionSession && // 允许专场为空的情况匹配
      a.id !== artwork.id
    );

    return sameSession.slice(0, 4);

  }, [artwork, artworks]);

  if (!artwork) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-600">作品不存在</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">返回上一页</button>
      </div>
    );
  }

  // 辅助函数：生成带样式的搜索链接
  const SearchLink = ({ keyword, className, children }: { keyword: string, className?: string, children: React.ReactNode }) => (
    <Link 
      to={`/search?q=${encodeURIComponent(keyword)}`}
      className={`hover:text-blue-600 hover:underline transition-colors cursor-pointer ${className || ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );

  const handleShare = async () => {
    const shareData = {
      title: `ArtsyAuction - ${artwork.title}`,
      text: `我在ArtsyAuction发现了一件精彩的艺术品：${artwork.artist}《${artwork.title}》，成交价 ¥${artwork.hammerPrice.toLocaleString()}。`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('分享取消或失败', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        alert('复制链接失败，请手动复制浏览器地址栏');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-8 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> 返回
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="relative group aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <img 
              src={artwork.images[activeImageIdx]} 
              alt={artwork.title}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => setShowModal(true)}
            />
            <button 
              onClick={() => setShowModal(true)}
              className="absolute bottom-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 size={20} />
            </button>
            
            {artwork.images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : artwork.images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/60 rounded-full hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev < artwork.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/60 rounded-full hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
            {artwork.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition ${
                  activeImageIdx === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="text-blue-600 font-bold mb-1 text-lg">
              <SearchLink keyword={artwork.artist}>
                {artwork.artist}
              </SearchLink>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{artwork.title}</h1>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                <SearchLink keyword={artwork.category}>
                  {artwork.category}
                </SearchLink>
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                <SearchLink keyword={artwork.material}>
                  {artwork.material}
                </SearchLink>
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-8">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-medium">成交价:</span>
              <div className="text-right">
                <span className="text-3xl font-black text-red-600">¥ {artwork.hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="block text-xs text-gray-400 mt-1">人民币 (RMB)</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 font-medium text-sm">估价:</span>
              <span className="text-gray-900 font-bold">
                ¥ {artwork.estimatedPriceMin.toLocaleString()} - {artwork.estimatedPriceMax.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 font-medium text-sm">规格:</span>
              <span className="text-gray-900">{artwork.dimensions}</span>
            </div>
          </div>

          <div className="mb-8">
            <button 
              onClick={handleShare}
              className={`w-full flex items-center justify-center space-x-2 py-4 border-2 rounded-xl font-bold transition-all active:scale-95 ${
                isCopied 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-blue-100 hover:text-blue-600'
              }`}
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              <span>{isCopied ? '链接已复制' : '分享此作品'}</span>
            </button>
          </div>

          <div className="border-t pt-8 space-y-6">
            <h3 className="text-lg font-bold">拍卖信息</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-400">拍卖行 / 拍卖会</div>
                  <div className="font-bold text-gray-900">
                    <SearchLink keyword={artwork.auctionHouse}>
                      {artwork.auctionHouse}
                    </SearchLink>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    <SearchLink keyword={artwork.auctionSession}>
                      {artwork.auctionSession}
                    </SearchLink>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg mr-4">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-400">成交时间</div>
                  <div className="font-bold text-gray-900">{artwork.auctionDate} {artwork.auctionTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 pb-4 border-b">作品介绍</h3>
        <div className="prose prose-blue max-w-none text-gray-600 leading-loose whitespace-pre-wrap font-normal">
          {artwork.description || '暂无详细介绍'}
        </div>
      </div>

      {/* Related Artworks Section (New) */}
      {relatedArtworks.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">相关作品</h3>
            <span className="text-sm text-gray-400">
               {relatedArtworks[0].artist === artwork.artist ? '更多该艺术家作品' : '同场拍卖会其他作品'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArtworks.map(art => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition"
          >
            <ChevronLeft size={48} className="rotate-45" />
          </button>
          <img 
            src={artwork.images[activeImageIdx]} 
            className="max-w-full max-h-full object-contain" 
            alt="zoom" 
          />
        </div>
      )}
    </div>
  );
};

export default ArtworkDetail;

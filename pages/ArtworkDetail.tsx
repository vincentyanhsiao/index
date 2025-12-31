import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { ArrowLeft, Share2, MapPin, Calendar, Maximize2, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';

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

  // 滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // SEO & OG Tags
  useEffect(() => {
    if (!artwork) return;

    const originalTitle = document.title;
    document.title = `${artwork.artist} | ${artwork.title} | ¥${artwork.hammerPrice.toLocaleString()}`;

    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const originalOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    setMetaTag('og:image', artwork.thumbnail);
    setMetaTag('og:description', `${artwork.artist}创作。FUHUNG ART INDEX | 艺术品交易数据查询平台`);

    return () => {
      document.title = originalTitle.includes('FUHUNG ART INDEX') ? originalTitle : 'FUHUNG ART INDEX | 艺术品交易数据查询平台';
      
      if (originalOgImage) {
        setMetaTag('og:image', originalOgImage);
      } else {
        document.querySelector('meta[property="og:image"]')?.remove();
      }
      document.querySelector('meta[property="og:description"]')?.remove();
    };
  }, [artwork]);

  // 相关作品推荐逻辑
  const relatedArtworks = useMemo(() => {
    if (!artwork) return [];
    
    const sameArtist = artworks.filter(a => 
      a.artist === artwork.artist && a.id !== artwork.id
    );
    
    if (sameArtist.length > 0) return sameArtist.slice(0, 4);

    const sameSession = artworks.filter(a => 
      a.auctionHouse === artwork.auctionHouse &&
      a.auctionSession === artwork.auctionSession && 
      a.id !== artwork.id
    );

    return sameSession.slice(0, 4);
  }, [artwork, artworks]);

  const isSameArtistRecommendation = useMemo(() => {
    if (!relatedArtworks.length || !artwork) return false;
    return relatedArtworks[0].artist === artwork.artist;
  }, [relatedArtworks, artwork]);

  // 图片切换逻辑
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (artwork && artwork.images.length > 1) {
      setActiveImageIdx(prev => (prev < artwork.images.length - 1 ? prev + 1 : 0));
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (artwork && artwork.images.length > 1) {
      setActiveImageIdx(prev => (prev > 0 ? prev - 1 : artwork.images.length - 1));
    }
  };

  if (!artwork) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-600">作品不存在</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">返回上一页</button>
      </div>
    );
  }

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
    const shareContent = `${artwork.artist} | ${artwork.title} | ¥${artwork.hammerPrice.toLocaleString()}`;
    const shareData = { title: shareContent, text: shareContent, url: window.location.href };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('分享取消', err); }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareContent} ${window.location.href}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) { alert('复制链接失败'); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 mt-4 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> 返回
      </button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* 左侧：图片轮播 */}
        <div className="space-y-4 select-none">
          <div className="relative group aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <img 
              src={artwork.images[activeImageIdx]} 
              alt={artwork.title}
              className="w-full h-full object-contain cursor-zoom-in transition-transform duration-500"
              onClick={() => setShowModal(true)}
            />
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              className="absolute top-4 right-4 p-2.5 bg-black/5 backdrop-blur-sm rounded-full text-gray-600 hover:bg-black/10 transition"
              title="点击放大"
            >
              <Maximize2 size={20} />
            </button>

            {artwork.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 active:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 active:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {artwork.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIdx(idx); }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${
                        activeImageIdx === idx ? 'bg-white w-6' : 'bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右侧：信息区域 */}
        <div className="flex flex-col">
          {/* 1. 头部信息：统一风格，同一行显示 */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{artwork.title}</h1>
            
            {/* 统一的 Flex 容器，gap-2 控制间距 */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* 艺术家 (样式与后面完全一致) */}
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition">
                <SearchLink keyword={artwork.artist}>
                  {artwork.artist}
                </SearchLink>
              </span>

              {/* 创作年份 (样式与前后完全一致) */}
              {artwork.creationYear && (
                 <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                   {artwork.creationYear}
                 </span>
              )}

              {/* 分类 (样式与前后完全一致) */}
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition">
                <SearchLink keyword={artwork.category}>
                  {artwork.category}
                </SearchLink>
              </span>
              
              {/* 材质 (样式与前后完全一致) */}
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition">
                <SearchLink keyword={artwork.material}>
                  {artwork.material}
                </SearchLink>
              </span>
            </div>
          </div>

          {/* 2. 价格卡片 */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-8 border border-gray-100">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
              <span className="text-gray-500 font-medium">拍卖成交价:</span>
              <div className="text-right">
                <span className="text-2xl lg:text-3xl font-black text-red-600">¥ {artwork.hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

          {/* 3. 拍卖信息 */}
          <div className="mb-8 space-y-4">
            <div className="bg-white rounded-xl border p-4 space-y-4 shadow-sm">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">拍卖行 / 拍卖会</div>
                  <div className="font-bold text-gray-900">
                    <SearchLink keyword={artwork.auctionHouse}>
                      {artwork.auctionHouse}
                    </SearchLink>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5 hover:text-blue-600 transition">
                    <SearchLink keyword={artwork.auctionSession}>
                      {artwork.auctionSession}
                    </SearchLink>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex items-start">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg mr-3 mt-0.5">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">成交时间</div>
                  <div className="font-bold text-gray-900">{artwork.auctionDate} <span className="text-gray-400 text-sm font-normal ml-1">{artwork.auctionTime}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 分享按钮 */}
          <div className="mb-8">
            <button 
              onClick={handleShare}
              className={`w-full flex items-center justify-center space-x-2 py-4 border-2 rounded-xl font-bold transition-all active:scale-95 shadow-sm ${
                isCopied 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'border-gray-100 text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-100 hover:text-blue-600'
              }`}
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              <span>{isCopied ? '内容已复制' : '分享此作品'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 作品介绍 */}
      <div className="mt-8 lg:mt-16 bg-white rounded-3xl p-6 lg:p-12 shadow-sm border border-gray-100">
        <h3 className="text-xl lg:text-2xl font-bold mb-6 pb-4 border-b">作品介绍</h3>
        <div className="prose prose-blue max-w-none text-gray-600 leading-loose whitespace-pre-wrap font-normal">
          {artwork.description || '暂无详细介绍'}
        </div>
      </div>

      {/* 相关作品 */}
      {relatedArtworks.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">相关作品</h3>
            <Link 
              to={
                isSameArtistRecommendation 
                  ? `/search?q=${encodeURIComponent(artwork.artist)}` 
                  : `/search?q=${encodeURIComponent(artwork.auctionHouse + ' ' + artwork.auctionSession)}`
              }
              className="group flex items-center space-x-1 text-sm text-blue-600 font-medium hover:text-blue-700 transition"
            >
              <span>查看更多</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArtworks.map(art => (
              <Link key={art.id} to={`/artwork/${art.id}`} className="block group">
                <ArtworkCard artwork={art} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 缩放模态框 */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            <ChevronLeft size={32} className="rotate-45" />
          </button>
          
          <img 
            src={artwork.images[activeImageIdx]} 
            className="max-w-full max-h-full object-contain select-none" 
            alt="zoom" 
          />
          {artwork.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition"><ChevronLeft size={48} /></button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition"><ChevronRight size={48} /></button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                {artwork.images.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-all ${activeImageIdx === idx ? 'bg-white w-4' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtworkDetail;

import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Artwork, Advertisement } from '../types';
import SearchSection from '../components/SearchSection';
import ArtworkCard from '../components/ArtworkCard';
import { TrendingUp, ShieldCheck, Search, Zap, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  artworks: Artwork[];
  ads: Advertisement[]; // 接收广告数据
}

const Home: React.FC<Props> = ({ artworks, ads }) => {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, isExact: boolean) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}${isExact ? '&exact=true' : ''}`);
  };

  const publishedArtworks = useMemo(() => artworks.filter(a => a.status === 'PUBLISHED'), [artworks]);

  const trendingArtworks = useMemo(() => {
    return [...publishedArtworks].sort((a, b) => b.auctionDate.localeCompare(a.auctionDate)).slice(0, 8);
  }, [publishedArtworks]);

  const categorySections = useMemo(() => {
    const categories = Array.from(new Set(publishedArtworks.map(a => a.category))).filter(Boolean);
    return categories.map(category => {
      const categoryItems = publishedArtworks.filter(a => a.category === category).sort((a, b) => b.auctionDate.localeCompare(a.auctionDate)).slice(0, 8);
      return { title: category, items: categoryItems };
    }).filter(section => section.items.length > 0);
  }, [publishedArtworks]);

  // 辅助函数：渲染广告
  const renderAd = (slotId: string, defaultGradient: string, defaultTitle: string) => {
    const ad = ads.find(a => a.slotId === slotId);
    if (!ad || !ad.isActive) return null;

    // 如果上传了图片，显示图片模式
    if (ad.imageUrl) {
      return (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 md:h-40 rounded-2xl overflow-hidden relative group my-8 md:my-12 shadow-sm hover:shadow-lg transition-all">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute top-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 rounded-bl-lg">广告</div>
        </a>
      );
    }

    // 否则显示默认渐变模式 (保留原来的设计)
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 md:h-40 rounded-2xl overflow-hidden relative group my-8 md:my-12 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-r ${defaultGradient} transition-transform duration-700 group-hover:scale-105`}></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
          <div className="flex items-center space-x-2 mb-1">
            <Zap size={18} className="text-yellow-300 fill-current animate-pulse"/>
            <span className="text-xs md:text-sm font-medium tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">Sponsored</span>
          </div>
          <h3 className="text-xl md:text-3xl font-black tracking-wide drop-shadow-sm text-center">{ad.title || defaultTitle}</h3>
          <div className="mt-3 flex items-center space-x-1 text-xs md:text-sm font-bold bg-white text-gray-900 px-4 py-1.5 rounded-full hover:bg-yellow-300 transition-colors cursor-pointer">
            <span>立即查看详情</span><ExternalLink size={14} />
          </div>
        </div>
        <div className="absolute top-0 right-0 bg-black/30 text-white text-[10px] px-2 py-1 rounded-bl-lg backdrop-blur-sm z-20">广告</div>
      </a>
    );
  };

  return (
    <div className="space-y-20 pb-20">
      <section className="text-center py-16 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">挖掘艺术品的 <span className="text-blue-600">真实价值</span></h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 px-4">专业的艺术品交易数据查询平台，注册会员解锁更多高级功能，助您精准把握市场脉搏。</p>
        <div className="px-4"><SearchSection onSearch={handleSearch} /></div>
      </section>

      <section className="grid md:grid-cols-4 gap-8 px-4">
        {[
          { icon: <Search className="text-blue-600" />, title: '多维搜索', desc: '支持艺术家、作品名、拍卖行多维度模糊及精准查询' },
          { icon: <TrendingUp className="text-green-600" />, title: '行情趋势', desc: '实时更新拍卖成交价，掌握作品市场价格走势' },
          { icon: <ShieldCheck className="text-purple-600" />, title: '权威认证', desc: '数据来源于全球主流拍卖行，确保真实有效' },
          { icon: <Zap className="text-orange-600" />, title: '会员服务', desc: '注册即享专属收藏夹、数据导出等高级权益' },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">{feature.icon}</div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between px-4 border-l-4 border-blue-600 ml-4 lg:ml-0">
          <div><h2 className="text-2xl font-bold text-gray-900">精选近期成交</h2><p className="text-sm text-gray-500 mt-1">汇集全球拍卖行最新落槌的重点拍品</p></div>
          <button onClick={() => navigate('/search')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm">查看全部 <ArrowRight size={16} className="ml-1"/></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {trendingArtworks.map(artwork => <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="block group"><ArtworkCard artwork={artwork} /></Link>)}
        </div>
      </section>

      {/* 广告位 1：近期成交下方 */}
      <div className="px-4">
        {renderAd('home_trending', 'from-orange-500 to-pink-600', '专业艺术品估值服务 · 专家在线')}
      </div>

      {categorySections.map((section, idx) => (
        <React.Fragment key={idx}>
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{animationDelay: `${idx * 100}ms`}}>
            <div className="flex items-center justify-between px-4 border-l-4 border-gray-900 ml-4 lg:ml-0">
              <div className="flex items-center"><h2 className="text-2xl font-bold text-gray-900 mr-3">{section.title}</h2><span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">{section.title}专区</span></div>
              <button onClick={() => navigate(`/search?q=${encodeURIComponent(section.title)}`)} className="text-gray-500 hover:text-gray-900 font-medium flex items-center text-sm transition">更多{section.title} <ArrowRight size={16} className="ml-1"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {section.items.map(artwork => <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="block group"><ArtworkCard artwork={artwork} /></Link>)}
            </div>
          </section>

          {/* 广告位 2/3/4：分类插屏广告 (循环使用3个广告位) */}
          <div className="px-4">
             {idx % 3 === 0 && renderAd('home_category_1', 'from-indigo-600 to-purple-700', '2026 春季拍卖会 · 全球征集开启')}
             {idx % 3 === 1 && renderAd('home_category_2', 'from-blue-600 to-cyan-600', 'FUHUNG VIP 会员 · 限时 0 元体验')}
             {idx % 3 === 2 && renderAd('home_category_3', 'from-emerald-600 to-teal-700', '名家书画鉴赏与投资价值 · 大师讲座')}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Home;

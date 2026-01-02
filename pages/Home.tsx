import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Artwork } from '../types';
import SearchSection from '../components/SearchSection';
import ArtworkCard from '../components/ArtworkCard';
import { TrendingUp, ShieldCheck, Search, Zap, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  artworks: Artwork[];
}

const Home: React.FC<Props> = ({ artworks }) => {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, isExact: boolean) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}${isExact ? '&exact=true' : ''}`);
  };

  const publishedArtworks = useMemo(() => 
    artworks.filter(a => a.status === 'PUBLISHED'), 
  [artworks]);

  const trendingArtworks = useMemo(() => {
    return [...publishedArtworks]
      .sort((a, b) => b.auctionDate.localeCompare(a.auctionDate))
      .slice(0, 8);
  }, [publishedArtworks]);

  const categorySections = useMemo(() => {
    const categories = Array.from(new Set(publishedArtworks.map(a => a.category))).filter(Boolean);
    
    return categories.map(category => {
      const categoryItems = publishedArtworks
        .filter(a => a.category === category)
        .sort((a, b) => b.auctionDate.localeCompare(a.auctionDate))
        .slice(0, 8);

      return {
        title: category,
        items: categoryItems
      };
    }).filter(section => section.items.length > 0);
  }, [publishedArtworks]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          挖掘艺术品的 <span className="text-blue-600">真实价值</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 px-4">
          免费的专业艺术品交易数据查询平台，助您精准把握艺术市场脉搏。
        </p>
        <div className="px-4">
          <SearchSection onSearch={handleSearch} />
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-4 gap-8 px-4">
        {[
          { icon: <Search className="text-blue-600" />, title: '多维搜索', desc: '支持艺术家、作品名、拍卖行多维度模糊及精准查询' },
          { icon: <TrendingUp className="text-green-600" />, title: '行情趋势', desc: '实时更新拍卖成交价，掌握作品市场价格走势' },
          { icon: <ShieldCheck className="text-purple-600" />, title: '权威认证', desc: '数据来源于全球主流拍卖行，确保真实有效' },
          { icon: <Zap className="text-orange-600" />, title: '会员服务', desc: '注册即享专属收藏夹、数据导出等高级权益' },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* 精选近期成交 */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4 border-l-4 border-blue-600 ml-4 lg:ml-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">精选近期成交</h2>
            <p className="text-sm text-gray-500 mt-1">汇集全球拍卖行最新落槌的重点拍品</p>
          </div>
          <button onClick={() => navigate('/search')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm">
            查看全部 <ArrowRight size={16} className="ml-1"/>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {trendingArtworks.map(artwork => (
            <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="block group">
              <ArtworkCard artwork={artwork} />
            </Link>
          ))}
        </div>
      </section>

      {/* 自动生成的分类推荐版块 + 广告位 */}
      {categorySections.map((section, idx) => (
        <React.Fragment key={idx}>
          {/* 分类版块 */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{animationDelay: `${idx * 100}ms`}}>
            <div className="flex items-center justify-between px-4 border-l-4 border-gray-900 ml-4 lg:ml-0">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900 mr-3">{section.title}</h2>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                  {section.title}专区
                </span>
              </div>
              <button 
                onClick={() => navigate(`/search?q=${encodeURIComponent(section.title)}`)} 
                className="text-gray-500 hover:text-gray-900 font-medium flex items-center text-sm transition"
              >
                更多{section.title} <ArrowRight size={16} className="ml-1"/>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {section.items.map(artwork => (
                <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="block group">
                  <ArtworkCard artwork={artwork} />
                </Link>
              ))}
            </div>
          </section>

          {/* === 新增：广告位 (Ad Slot) === 
            1. 位置：每个分类版块之后
            2. 样式：固定高度 (h-32 md:h-40)，圆角，阴影
            3. 功能：新窗口打开 (target="_blank")
            4. 内容：使用循环模版模拟不同的广告内容
          */}
          <div className="px-4">
            <a 
              href="https://www.example.com" // 这里可以替换为真实的广告链接
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-32 md:h-40 rounded-2xl overflow-hidden relative group my-8 md:my-12 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* 广告背景（使用渐变色模拟 Banner） */}
              <div className={`absolute inset-0 bg-gradient-to-r ${
                idx % 3 === 0 ? 'from-indigo-600 to-purple-700' : 
                idx % 3 === 1 ? 'from-blue-600 to-cyan-600' : 
                'from-emerald-600 to-teal-700'
              } transition-transform duration-700 group-hover:scale-105`}></div>
              
              {/* 装饰性纹理 */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

              {/* 广告内容文字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap size={18} className="text-yellow-300 fill-current animate-pulse"/>
                  <span className="text-xs md:text-sm font-medium tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">Sponsored</span>
                </div>
                <h3 className="text-xl md:text-3xl font-black tracking-wide drop-shadow-sm text-center">
                  {idx % 3 === 0 ? '2026 春季拍卖会 · 全球征集开启' : 
                   idx % 3 === 1 ? 'FUHUNG VIP 会员 · 限时 0 元体验' : 
                   '名家书画鉴赏与投资价值 · 大师讲座'}
                </h3>
                <div className="mt-3 flex items-center space-x-1 text-xs md:text-sm font-bold bg-white text-gray-900 px-4 py-1.5 rounded-full hover:bg-yellow-300 transition-colors cursor-pointer">
                  <span>立即查看详情</span>
                  <ExternalLink size={14} />
                </div>
              </div>

              {/* 广告标识 */}
              <div className="absolute top-0 right-0 bg-black/30 text-white text-[10px] px-2 py-1 rounded-bl-lg backdrop-blur-sm z-20">
                广告
              </div>
            </a>
          </div>
        </React.Fragment>
      ))}

    </div>
  );
};

export default Home;

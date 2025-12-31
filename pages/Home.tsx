import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Artwork } from '../types';
import SearchSection from '../components/SearchSection';
import ArtworkCard from '../components/ArtworkCard';
import { TrendingUp, ShieldCheck, Search, Zap, ArrowRight, Layers } from 'lucide-react';

interface Props {
  artworks: Artwork[];
}

const Home: React.FC<Props> = ({ artworks }) => {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, isExact: boolean) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}${isExact ? '&exact=true' : ''}`);
  };

  // 1. 获取所有已上架的作品
  const publishedArtworks = useMemo(() => 
    artworks.filter(a => a.status === 'PUBLISHED'), 
  [artworks]);

  // 2. 修改：顶部精选改为显示最新的 8 条数据 (原来是4条)
  const trendingArtworks = useMemo(() => {
    return [...publishedArtworks]
      .sort((a, b) => b.auctionDate.localeCompare(a.auctionDate))
      .slice(0, 8);
  }, [publishedArtworks]);

  // 3. 核心升级：按分类自动生成推荐版块
  const categorySections = useMemo(() => {
    // 3.1 提取所有不重复的分类名称
    const categories = Array.from(new Set(publishedArtworks.map(a => a.category))).filter(Boolean);
    
    // 3.2 为每个分类构建数据
    return categories.map(category => {
      const categoryItems = publishedArtworks
        .filter(a => a.category === category)
        .sort((a, b) => b.auctionDate.localeCompare(a.auctionDate)) // 按时间倒序
        .slice(0, 8); // 每个分类只显示前8个

      return {
        title: category,
        items: categoryItems
      };
    }).filter(section => section.items.length > 0); // 过滤掉没有数据的分类
  }, [publishedArtworks]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          挖掘艺术品的 <span className="text-blue-600">真实价值</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 px-4">
          免费的艺术品交易数据查询平台，助您精准把握艺术市场脉搏。
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
          { icon: <Zap className="text-orange-600" />, title: '完全免费', desc: '无需注册登录，即刻查询所有历史成交数据' },
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

      {/* 4. 精选近期成交 (显示8个) */}
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

      {/* 5. 自动生成的分类推荐版块 */}
      {categorySections.map((section, idx) => (
        <section key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{animationDelay: `${idx * 100}ms`}}>
          <div className="flex items-center justify-between px-4 border-l-4 border-gray-900 ml-4 lg:ml-0">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900 mr-3">{section.title}</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                {section.title}专区
              </span>
            </div>
            {/* 点击更多跳转到搜索页并自动搜索该分类 */}
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
      ))}

    </div>
  );
};

export default Home;

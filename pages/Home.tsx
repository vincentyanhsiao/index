
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Artwork } from '../types';
import SearchSection from '../components/SearchSection';
import ArtworkCard from '../components/ArtworkCard';
import { TrendingUp, ShieldCheck, Search, Users } from 'lucide-react';

interface Props {
  artworks: Artwork[];
}

const Home: React.FC<Props> = ({ artworks }) => {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, isExact: boolean) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}${isExact ? '&exact=true' : ''}`);
  };

  const trendingArtworks = artworks.slice(0, 4);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          挖掘艺术品的 <span className="text-blue-600">真实价值</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 px-4">
          专业的艺术品交易数据查询平台，收录数万条海内外拍卖行历史记录，助您精准把握市场脉搏。
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
          { icon: <Users className="text-orange-600" />, title: '会员专享', desc: '注册即享个人收藏夹功能，同步追踪心仪佳作' },
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

      {/* Trending Artworks */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold">精选近期成交</h2>
          <button onClick={() => navigate('/search')} className="text-blue-600 hover:text-blue-700 font-medium">查看全部 →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {trendingArtworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

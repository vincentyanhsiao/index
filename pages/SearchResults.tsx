import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Artwork, User, UserRole } from '../types'; // 引入 UserRole
import ArtworkCard from '../components/ArtworkCard';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface Props {
  artworks: Artwork[];
  user?: User | null; // 确保接收 user 参数
}

const SearchResults: React.FC<Props> = ({ artworks, user }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // ⚠️ 核心判断逻辑：管理员或VIP才能看价格
  const canViewPrice = user?.role === UserRole.ADMIN || user?.isVip;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  const filteredArtworks = artworks.filter(art => 
    art.title.toLowerCase().includes(query.toLowerCase()) ||
    art.artist.toLowerCase().includes(query.toLowerCase()) ||
    art.auctionHouse.toLowerCase().includes(query.toLowerCase()) ||
    art.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-blue-600">首页</Link>
          <span>/</span>
          <span>搜索结果</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          "{query}" 的搜索结果
        </h1>
        <p className="text-gray-500 mt-2 flex items-center">
          <Search size={16} className="mr-2" />
          找到 {filteredArtworks.length} 件相关拍品
          {!canViewPrice && filteredArtworks.length > 0 && (
             <span className="ml-4 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
               🔒 升级 VIP 可查看成交价格
             </span>
          )}
        </p>
      </div>

      {filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtworks.map(art => (
            <Link key={art.id} to={`/artwork/${art.id}`} className="block h-full">
              {/* ⚠️ 传入 maskPrice 参数：如果不能看价格，就传 true */}
              <ArtworkCard 
                artwork={art} 
                maskPrice={!canViewPrice} 
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">没有找到相关结果</h3>
          <p className="text-gray-500 mb-6">尝试更换关键词，或者搜索艺术家的名字</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
             返回首页
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

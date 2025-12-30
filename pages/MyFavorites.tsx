
import React from 'react';
import { User, Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  user: User;
  artworks: Artwork[];
}

const MyFavorites: React.FC<Props> = ({ user, artworks }) => {
  const favoriteArtworks = artworks.filter(a => user.favorites.includes(a.id));

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的收藏</h1>
        <p className="text-gray-500">您收藏的所有精选艺术品数据，共 {favoriteArtworks.length} 件</p>
      </div>

      {favoriteArtworks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} />
          </div>
          <h3 className="text-xl font-bold mb-4">收藏夹空空如也</h3>
          <p className="text-gray-400 mb-8 max-w-xs mx-auto">浏览拍卖数据，点击“心形”图标，即可将您感兴趣的作品保存在这里。</p>
          <Link to="/search" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            <Search size={20} />
            <span>立即去查询数据</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoriteArtworks.map(art => (
            <ArtworkCard key={art.id} artwork={art} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;

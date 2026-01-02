import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Artwork, Advertisement } from './types';
import { INITIAL_ARTWORKS } from './data';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ArtworkDetail from './pages/ArtworkDetail';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import MarketIndex from './pages/MarketIndex';
import MyFavorites from './pages/MyFavorites';
import Terms from './pages/Terms';

const STORAGE_KEYS = {
  USER: 'artsy_user',
  ADS: 'artsy_ads' 
};

// 默认广告位配置
const INITIAL_ADS: Advertisement[] = [
  { id: 'ad_1', slotId: 'home_trending', name: '首页-近期成交下方', title: '专业艺术品估值服务 · 专家在线', imageUrl: '', linkUrl: 'https://www.example.com', isActive: true },
  { id: 'ad_2', slotId: 'home_category_1', name: '首页-分类插屏1', title: '2026 春季拍卖会 · 全球征集开启', imageUrl: '', linkUrl: 'https://www.example.com', isActive: true },
  { id: 'ad_3', slotId: 'home_category_2', name: '首页-分类插屏2', title: 'FUHUNG VIP 会员 · 限时 0 元体验', imageUrl: '', linkUrl: 'https://www.example.com', isActive: true },
  { id: 'ad_4', slotId: 'home_category_3', name: '首页-分类插屏3', title: '名家书画鉴赏与投资价值 · 大师讲座', imageUrl: '', linkUrl: 'https://www.example.com', isActive: true },
  { id: 'ad_5', slotId: 'detail_footer', name: '详情页-底部横幅', title: '想了解此艺术家的更多市场数据？', imageUrl: '', linkUrl: 'https://www.example.com', isActive: true },
];

const App: React.FC = () => {
  // 当前登录用户 (本地持久化登录状态)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  // 所有用户列表 (管理员用，从后台获取)
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // 艺术品数据 (从后台获取)
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // 广告数据 (本地暂存，实际项目建议也移至数据库)
  const [ads, setAds] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADS);
    return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  // --- 初始化：从服务器拉取数据 ---
  useEffect(() => {
    fetchArtworks();
    if (currentUser?.role === UserRole.ADMIN) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchArtworks = async () => {
    try {
      const res = await fetch('/api/artworks');
      if (res.ok) {
        const data = await res.json();
        // 如果数据库为空，使用初始数据填充 (可选)
        if (data.length === 0) {
           setArtworks(INITIAL_ARTWORKS);
        } else {
           setArtworks(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      setArtworks(INITIAL_ARTWORKS); // 降级方案
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setAllUsers(await res.json());
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  }, [ads]);

  // --- 操作逻辑：调用 API ---

  const handleAuthSuccess = (user: User, isRegister: boolean) => {
    setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);
  
  const toggleFavorite = (artworkId: string) => {
    if (!currentUser) return;
    const isFavorite = currentUser.favorites.includes(artworkId);
    const newFavorites = isFavorite 
      ? currentUser.favorites.filter(id => id !== artworkId)
      : [...currentUser.favorites, artworkId];

    // 更新本地状态
    setCurrentUser({ ...currentUser, favorites: newFavorites });
    // TODO: 调用 API 更新用户收藏 (此处暂略，需后端支持 PUT /api/users/:id)
  };

  const addArtwork = async (artwork: Artwork) => {
    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artwork)
      });
      if (res.ok) {
        const savedArt = await res.json();
        setArtworks(prev => [savedArt, ...prev]);
      }
    } catch (error) {
      alert('发布失败，请重试');
    }
  };

  const updateArtwork = async (updatedArtwork: Artwork) => {
    try {
      const res = await fetch(`/api/artworks/${updatedArtwork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArtwork)
      });
      if (res.ok) {
        setArtworks(prev => prev.map(a => a.id === updatedArtwork.id ? updatedArtwork : a));
      }
    } catch (error) {
      alert('更新失败');
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArtworks(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleBatchImport = async (newArtworks: Artwork[]) => {
    // 简单实现：循环调用添加接口 (量大时建议后端增加批量接口)
    for (const art of newArtworks) {
      await addArtwork(art);
    }
    alert('批量导入完成');
    fetchArtworks(); // 刷新列表
  };

  const updateAd = (updatedAd: Advertisement) => {
    setAds(prev => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home artworks={artworks} ads={ads} />} />
            <Route path="/search" element={<SearchResults artworks={artworks} />} />
            <Route path="/index" element={<MarketIndex artworks={artworks} />} />
            
            <Route 
              path="/artwork/:id" 
              element={
                <ArtworkDetail 
                  artworks={artworks} 
                  user={currentUser}
                  onToggleFavorite={toggleFavorite}
                  ads={ads} 
                />
              } 
            />
            
            <Route 
              path="/login" 
              element={
                <Auth 
                  onAuthSuccess={handleAuthSuccess} 
                />
              } 
            />
            
            <Route path="/terms" element={<Terms />} />
            
            <Route 
              path="/favorites" 
              element={
                currentUser 
                  ? <MyFavorites user={currentUser} artworks={artworks} /> 
                  : <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                currentUser?.role === UserRole.ADMIN 
                  ? <AdminDashboard 
                      artworks={artworks} 
                      allUsers={allUsers}
                      ads={ads}
                      onUpdate={updateArtwork} 
                      onDelete={deleteArtwork} 
                      onAdd={addArtwork}
                      onBatchImport={handleBatchImport}
                      onUpdateAd={updateAd}
                    /> 
                  : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
        <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
          <p>© 2026 FUHUNG ART INDEX 艺术品交易数据查询系统. All rights reserved.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;

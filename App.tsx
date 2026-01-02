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
  ALL_USERS: 'artsy_all_users',
  ARTWORKS: 'artsy_artworks',
  ADS: 'artsy_ads' // 新增：广告存储key
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    const defaultAdmin: User = {
      id: 'admin-01',
      name: '管理员',
      email: 'admin@fuhung.cn',
      password: 'xiao1988HB',
      role: UserRole.ADMIN,
      favorites: [],
      isMarketingAuthorized: false
    };
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARTWORKS);
    return saved ? JSON.parse(saved) : INITIAL_ARTWORKS;
  });

  // 新增：广告状态管理
  const [ads, setAds] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADS);
    return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  }, [ads]);

  const handleAuthSuccess = (user: User, isRegister: boolean) => {
    setCurrentUser(user);
    if (isRegister) {
      setAllUsers(prev => [...prev, user]);
    }
  };

  const handlePasswordReset = (email: string, newPass: string) => {
    setAllUsers(prev => prev.map(u => 
      u.email === email ? { ...u, password: newPass } : u
    ));
  };

  const logout = () => setCurrentUser(null);
  
  const toggleFavorite = (artworkId: string) => {
    if (!currentUser) return;
    const isFavorite = currentUser.favorites.includes(artworkId);
    const newFavorites = isFavorite 
      ? currentUser.favorites.filter(id => id !== artworkId)
      : [...currentUser.favorites, artworkId];

    setCurrentUser({ ...currentUser, favorites: newFavorites });
  };

  const updateArtwork = (updatedArtwork: Artwork) => {
    setArtworks(prev => prev.map(a => a.id === updatedArtwork.id ? updatedArtwork : a));
  };

  const deleteArtwork = (id: string) => {
    setArtworks(prev => prev.filter(a => a.id !== id));
  };

  const addArtwork = (artwork: Artwork) => {
    setArtworks(prev => [artwork, ...prev]);
  };

  const handleBatchImport = (newArtworks: Artwork[]) => {
    setArtworks(prev => [...newArtworks, ...prev]);
  };

  // 新增：更新广告的方法
  const updateAd = (updatedAd: Advertisement) => {
    setAds(prev => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* 传递 ads */}
            <Route path="/" element={<Home artworks={artworks} ads={ads} />} />
            <Route path="/search" element={<SearchResults artworks={artworks} />} />
            <Route path="/index" element={<MarketIndex artworks={artworks} />} />
            
            {/* 传递 ads */}
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
                  users={allUsers} 
                  onPasswordReset={handlePasswordReset} 
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
            
            {/* 传递 ads 和 updateAd */}
            <Route 
              path="/admin/*" 
              element={
                currentUser?.role === UserRole.ADMIN 
                  ? <AdminDashboard 
                      artworks={artworks} 
                      allUsers={allUsers}
                      ads={ads} // Pass ads
                      onUpdate={updateArtwork} 
                      onDelete={deleteArtwork} 
                      onAdd={addArtwork}
                      onBatchImport={handleBatchImport}
                      onUpdateAd={updateAd} // Pass update handler
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

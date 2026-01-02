import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Artwork } from './types';
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
  ALL_USERS: 'artsy_all_users', // 存储所有用户列表
  ARTWORKS: 'artsy_artworks'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  // 管理所有注册用户
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    // 默认包含一个管理员账号，避免空列表
    const defaultAdmin: User = {
      id: 'admin-01',
      name: '管理员',
      email: 'admin@fuhung.cn',
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // 持久化所有用户数据
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
  }, [artworks]);

  // 修改登录/注册逻辑
  const handleAuthSuccess = (user: User, isRegister: boolean) => {
    setCurrentUser(user);
    if (isRegister) {
      // 如果是新注册，添加到用户列表
      setAllUsers(prev => [...prev, user]);
    }
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

  // 批量导入艺术品
  const handleBatchImport = (newArtworks: Artwork[]) => {
    setArtworks(prev => [...newArtworks, ...prev]);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home artworks={artworks} />} />
            <Route path="/search" element={<SearchResults artworks={artworks} />} />
            
            {/* 修正点：这里的 MarketIndex 不再传递 user 参数 */}
            <Route path="/index" element={<MarketIndex artworks={artworks} />} />
            
            <Route 
              path="/artwork/:id" 
              element={
                <ArtworkDetail 
                  artworks={artworks} 
                  user={currentUser}
                  onToggleFavorite={toggleFavorite}
                />
              } 
            />
            
            <Route path="/login" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
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
                      allUsers={allUsers} // 传递所有用户数据
                      onUpdate={updateArtwork} 
                      onDelete={deleteArtwork} 
                      onAdd={addArtwork}
                      onBatchImport={handleBatchImport} // 传递批量导入函数
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

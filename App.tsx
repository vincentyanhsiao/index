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
  ALL_USERS: 'artsy_all_users',
  ARTWORKS: 'artsy_artworks'
};

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
      password: 'xiao1988HB', // 补充管理员密码记录
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
  }, [artworks]);

  const handleAuthSuccess = (user: User, isRegister: boolean) => {
    setCurrentUser(user);
    if (isRegister) {
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
            
            {/* 修改点：将 allUsers 传递给 Auth 组件，用于登录校验 */}
            <Route path="/login" element={<Auth onAuthSuccess={handleAuthSuccess} users={allUsers} />} />
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
                      onUpdate={updateArtwork} 
                      onDelete={deleteArtwork} 
                      onAdd={addArtwork}
                      onBatchImport={handleBatchImport}
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

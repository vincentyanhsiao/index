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
import Terms from './pages/Terms'; // 1. 引入新页面

const STORAGE_KEYS = {
  USER: 'artsy_user',
  ARTWORKS: 'artsy_artworks'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARTWORKS);
    return saved ? JSON.parse(saved) : INITIAL_ARTWORKS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
  }, [artworks]);

  const login = (user: User) => setCurrentUser(user);
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
            
            <Route path="/login" element={<Auth onAuthSuccess={login} />} />
            
            {/* 2. 添加协议页路由 */}
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
                      onUpdate={updateArtwork} 
                      onDelete={deleteArtwork} 
                      onAdd={addArtwork}
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

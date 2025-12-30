
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Search, User as UserIcon, LogOut, Heart, LayoutDashboard, Menu, X, BarChart3 } from 'lucide-react';

interface Props {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:inline">
            ArtsyAuction
          </span>
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">首页</Link>
          <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium">数据查询</Link>
          <Link to="/index" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium">
            <BarChart3 size={18} />
            <span>市场指数</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200"></div>

          {user ? (
            <div className="flex items-center space-x-4">
              {user.role === UserRole.ADMIN && (
                <Link to="/admin" className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition">
                  <LayoutDashboard size={18} />
                  <span>管理后台</span>
                </Link>
              )}
              {user.role === UserRole.MEMBER && (
                <Link to="/favorites" className="flex items-center space-x-1 text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-full transition">
                  <Heart size={18} />
                  <span>我的收藏</span>
                </Link>
              )}
              <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="退出登录"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 font-medium">登录</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">注册</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 space-y-4 shadow-xl animate-in slide-in-from-top">
          <Link to="/" className="block text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>首页</Link>
          <Link to="/search" className="block text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>数据查询</Link>
          <Link to="/index" className="block text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>市场指数</Link>
          <hr />
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <Link to="/admin" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>管理后台</Link>
              )}
              <Link to="/favorites" className="block text-pink-600 font-medium" onClick={() => setIsMenuOpen(false)}>我的收藏</Link>
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="block text-red-500 font-medium w-full text-left"
              >
                退出登录
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link to="/login" className="text-center py-2 border rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>登录</Link>
              <Link to="/register" className="text-center py-2 bg-blue-600 text-white rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>注册</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

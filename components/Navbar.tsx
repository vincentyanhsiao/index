import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { LayoutDashboard, Menu, X, BarChart3, LogOut, User as UserIcon, Heart } from 'lucide-react';

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
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:inline">
            FUHUNG ART INDEX
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
            // 已登录状态
            <div className="flex items-center space-x-4">
              <Link to="/favorites" className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 transition" title="我的收藏">
                <Heart size={20} />
              </Link>
              
              <div className="flex items-center space-x-3 pl-2">
                <div className="text-sm font-bold text-gray-700">{user.name}</div>
                {user.role === UserRole.ADMIN && (
                   <Link to="/admin" className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition" title="管理后台">
                     <LayoutDashboard size={18} />
                   </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            // 未登录状态
            <Link to="/login" className="flex items-center space-x-2 bg-gray-900 text-white px-5 py-2 rounded-full font-bold hover:bg-black transition shadow-lg shadow-gray-200">
              <UserIcon size={16} />
              <span>登录 / 注册</span>
            </Link>
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
              <Link to="/favorites" className="block text-pink-600 font-medium" onClick={() => setIsMenuOpen(false)}>我的收藏</Link>
              {user.role === UserRole.ADMIN && (
                 <Link to="/admin" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>管理后台</Link>
              )}
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="block text-red-500 font-medium w-full text-left"
              >
                退出登录
              </button>
            </>
          ) : (
             <Link to="/login" className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
               登录 / 注册
             </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

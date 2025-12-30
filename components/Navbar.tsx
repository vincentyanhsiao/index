import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { LayoutDashboard, Menu, X, BarChart3, LogOut, Lock } from 'lucide-react';

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

          {user && user.role === UserRole.ADMIN ? (
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition">
                <LayoutDashboard size={18} />
                <span>管理后台</span>
              </Link>
              <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                <span className="text-sm font-medium text-gray-700">管理员</span>
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
               {/* 仅保留一个低调的后台登录入口 */}
              <Link to="/login" className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 text-sm font-medium">
                <Lock size={14} />
                <span>管理员入口</span>
              </Link>
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
          {user && user.role === UserRole.ADMIN ? (
            <>
              <Link to="/admin" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>管理后台</Link>
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="block text-red-500 font-medium w-full text-left"
              >
                退出登录
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-gray-400 text-sm" onClick={() => setIsMenuOpen(false)}>管理员登录</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

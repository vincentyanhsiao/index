import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Menu, X, Search, User as UserIcon, LogOut, Shield, Crown, ScanLine, MessageCircle, Heart } from 'lucide-react';
// ✅ 引入二维码图片
import vipQrCodeImg from '../assets/vip_qrcode.jpg';

interface Props {
  user?: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // 联系我们弹窗组件
  const ContactModal = (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <button 
            onClick={() => setShowContactModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 rounded-full transition-colors"
        >
            <X size={20} />
        </button>
        
        <div className="text-center space-y-6 pt-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm transform -rotate-3">
               <MessageCircle size={32} />
            </div>
            
            <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">联系官方客服</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">
                    如有任何疑问、商务合作<br/>
                    或需<span className="text-blue-600 font-bold">开通 VIP 会员服务</span><br/>
                    请扫码添加客服微信
                </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 inline-block group cursor-pointer" onClick={() => setShowContactModal(false)}>
                <img 
                    src={vipQrCodeImg} 
                    alt="Contact Admin" 
                    className="w-40 h-40 object-contain mix-blend-darken filter group-hover:contrast-125 transition-all"
                />
                <div className="flex items-center justify-center text-xs text-gray-500 mt-4 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                   <ScanLine size={14} className="mr-1.5 text-blue-500" />
                   微信扫一扫 · 在线咨询
                </div>
            </div>

            <p className="text-xs text-gray-300">
                工作时间：周一至周日 9:00 - 22:00
            </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Logo 区域 */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              F
            </div>
            <div className={`flex flex-col ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              <span className="font-black tracking-tight leading-none text-lg">FUHUNG</span>
              <span className="text-[10px] tracking-widest uppercase opacity-60 font-medium">Art Index</span>
            </div>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6 text-sm font-bold text-gray-600">
              <Link to="/" className="hover:text-black transition">首页</Link>
              
              {/* ✅ 修改点：将链接从 /market 改为 /index，对应 App.tsx 中的路由配置 */}
              <Link to="/index" className="hover:text-black transition">市场指数</Link>
              
              {/* ✅ 联系我们 (保留) */}
              <button 
                onClick={() => setShowContactModal(true)} 
                className="hover:text-blue-600 transition flex items-center gap-1"
              >
                联系我们
              </button>
            </div>

            <div className="h-4 w-px bg-gray-300/50"></div>

            <div className="flex items-center space-x-4">
              {/* 🗑️ 已移除：数据搜索图标 (因为首页已有搜索) */}
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-black text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">{user.name}</span>
                  </button>
                  
                  {/* 下拉菜单 */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400">登录账号</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                    </div>
                    
                    {/* ✅ 将"我的收藏"移入下拉菜单，保证功能不丢失 */}
                    <Link to="/favorites" className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition">
                        <Heart size={16} className="text-red-500" />
                        <span>我的收藏</span>
                    </Link>

                    {user.role === UserRole.ADMIN && (
                      <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition">
                        <Shield size={16} className="text-blue-600" />
                        <span>后台管理</span>
                      </Link>
                    )}
                    {user.isVip ? (
                       <div className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-amber-600 bg-amber-50 rounded-xl mb-1">
                         <Crown size={16} className="fill-current" />
                         <span>尊贵 VIP 会员</span>
                       </div>
                    ) : (
                       <button onClick={() => setShowContactModal(true)} className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition text-left">
                         <Crown size={16} className="text-gray-400" />
                         <span>开通 VIP</span>
                       </button>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition">
                      <LogOut size={16} />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-700">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 移动端菜单全屏覆盖 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in slide-in-from-top-10 duration-200">
          <div className="flex flex-col space-y-6 text-lg font-bold text-gray-800">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-100">首页</Link>
            
            {/* 移动端：市场指数 (此处无需修改，之前已是 /index) */}
            <Link to="/index" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-100">市场指数</Link>
            
            <button onClick={() => { setIsMenuOpen(false); setShowContactModal(true); }} className="py-2 border-b border-gray-100 text-left flex items-center justify-between">
                <span>联系我们</span>
                <MessageCircle size={18} className="text-gray-400"/>
            </button>

            {user && user.role === UserRole.ADMIN && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-100 text-blue-600">后台管理</Link>
            )}

            {!user && (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-3 bg-black text-white text-center rounded-xl shadow-lg mt-4">
                立即登录
              </Link>
            )}
            
            {user && (
              <button onClick={handleLogout} className="py-3 text-red-500 text-center mt-4">退出登录</button>
            )}
          </div>
        </div>
      )}

      {/* 渲染弹窗 */}
      {showContactModal && ContactModal}
    </>
  );
};

export default Navbar;

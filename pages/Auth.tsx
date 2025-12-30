
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  type: 'login' | 'register';
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<Props> = ({ type, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    marketing: false
  });
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const validate = () => {
    if (type === 'register') {
      if (!formData.name.trim()) return '请输入真实姓名';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '邮箱格式不正确';
      if (formData.password.length < 6 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        return '密码需6-20位，且包含字母和数字';
      }
      if (formData.password !== formData.confirmPassword) return '两次输入的密码不一致';
    } else {
      if (!formData.email) return '请输入邮箱';
      if (!formData.password) return '请输入密码';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }

    // Mock auth logic
    if (type === 'register') {
      setShowModal(true);
    } else {
      // Simulate login
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.email.split('@')[0],
        email: formData.email,
        role: formData.email.includes('admin') ? UserRole.ADMIN : UserRole.MEMBER,
        favorites: [],
        isMarketingAuthorized: false
      };
      onAuthSuccess(mockUser);
      navigate(mockUser.role === UserRole.ADMIN ? '/admin' : '/');
    }
  };

  const handleFinalRegister = () => {
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: UserRole.MEMBER,
      favorites: [],
      isMarketingAuthorized: formData.marketing
    };
    onAuthSuccess(mockUser);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{type === 'login' ? '欢迎回来' : '创建新账号'}</h2>
          <p className="text-blue-100 text-sm">开启您的艺术价值挖掘之旅</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center">
              <ShieldCheck size={16} className="mr-2" /> {error}
            </div>
          )}

          {type === 'register' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">真实姓名</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  placeholder="请输入真实姓名"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                placeholder="example@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">设置密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {type === 'register' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span>{type === 'login' ? '立即登录' : '提交注册'}</span>
            <ArrowRight size={18} />
          </button>

          <div className="text-center text-sm text-gray-500">
            {type === 'login' ? (
              <>
                还没有账号？ <Link to="/register" className="text-blue-600 font-bold hover:underline">立即注册</Link>
              </>
            ) : (
              <>
                已有账号？ <Link to="/login" className="text-blue-600 font-bold hover:underline">返回登录</Link>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full animate-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">最后一步</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              我们已向您的邮箱发送验证码，有效时间10分钟。
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="输入 6 位验证码"
                className="w-full text-center tracking-widest text-lg font-bold py-3 border rounded-xl"
                maxLength={6}
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
            </div>

            <label className="flex items-start space-x-2 mb-8 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.marketing}
                onChange={e => setFormData({...formData, marketing: e.target.checked})}
              />
              <span className="text-xs text-gray-500 leading-tight">
                授权接收艺术品拍卖资讯、营销活动等邮件。勾选后可在会员中心取消授权。
              </span>
            </label>

            <button
              onClick={handleFinalRegister}
              disabled={formData.code.length !== 6}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 transition"
            >
              完成并进入系统
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;

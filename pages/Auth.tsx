import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('请输入管理员账号和密码');
      return;
    }

    // 强制检查：必须包含 admin 字符才能登录
    if (!formData.email.toLowerCase().includes('admin')) {
      setError('非管理员账号无法登录后台');
      return;
    }

    // 模拟管理员登录成功
    const adminUser: User = {
      id: 'admin-01',
      name: '管理员',
      email: formData.email,
      role: UserRole.ADMIN,
      favorites: [],
      isMarketingAuthorized: false
    };
    
    onAuthSuccess(adminUser);
    navigate('/admin');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">管理员后台登录</h2>
          <p className="text-gray-400 text-sm">仅限内部工作人员访问</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center">
              <ShieldCheck size={16} className="mr-2" /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">管理员账号</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                placeholder="请输入后台管理邮箱"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                placeholder="请输入密码"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all"
          >
            <span>进入后台</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight, User as UserIcon, CheckCircle } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: User, isRegister: boolean) => void;
  users: User[]; // 新增：接收用户列表数据
}

type AuthMode = 'LOGIN' | 'REGISTER';

const Auth: React.FC<Props> = ({ onAuthSuccess, users }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreed: false
  });
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'LOGIN') {
      // --- 登录逻辑 ---
      if (!formData.email || !formData.password) {
        setError('请输入账号和密码');
        return;
      }

      // 1. 管理员强制校验 (最高优先级)
      if (formData.email === 'admin@fuhung.cn') {
        if (formData.password === 'xiao1988HB') {
          const adminUser: User = {
            id: 'admin-01',
            name: '超级管理员',
            email: formData.email,
            role: UserRole.ADMIN,
            favorites: [],
            isMarketingAuthorized: false
          };
          onAuthSuccess(adminUser, false);
          navigate('/admin');
          return;
        } else {
          setError('管理员密码错误');
          return;
        }
      }

      // 2. 普通会员真实校验
      // 在用户列表中查找邮箱和密码都匹配的用户
      const foundUser = users.find(u => u.email === formData.email && u.password === formData.password);

      if (foundUser) {
        // 登录成功
        onAuthSuccess(foundUser, false);
        navigate('/');
      } else {
        // 登录失败：判断是账号不存在还是密码错
        const emailExists = users.some(u => u.email === formData.email);
        if (emailExists) {
          setError('密码错误，请重试');
        } else {
          setError('该账号未注册，请先注册');
        }
      }
      
    } else {
      // --- 注册逻辑 ---
      if (!formData.name || !formData.email || !formData.password) {
        setError('请填写完整的注册信息（包括密码）');
        return;
      }
      
      if (!formData.agreed) {
        setError('请阅读并同意服务协议');
        return;
      }

      // 检查邮箱是否已被注册
      const isDuplicate = users.some(u => u.email === formData.email);
      if (isDuplicate) {
        setError('该邮箱已被注册，请直接登录');
        return;
      }

      // 注册成功
      const newUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password, // 保存密码
        role: UserRole.USER,
        favorites: [],
        isMarketingAuthorized: true
      };

      onAuthSuccess(newUser, true);
      alert('注册成功，欢迎加入！');
      navigate('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
        
        {/* 顶部切换栏 */}
        <div className="flex border-b">
          <button
            onClick={() => { setMode('LOGIN'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              mode === 'LOGIN' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            账号登录
          </button>
          <button
            onClick={() => { setMode('REGISTER'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              mode === 'REGISTER' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            快速注册
          </button>
        </div>

        <div className="bg-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'LOGIN' ? '欢迎回来' : '加入 FUHUNG'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'LOGIN' ? '登录以管理您的收藏和偏好' : '注册即刻享受会员专属权益'}
            </p>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={16} className="mr-2 flex-shrink-0" /> {error}
              </div>
            )}

            {/* 注册模式：显示姓名输入框 */}
            {mode === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">姓名</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                    placeholder="请输入您的真实姓名"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* 公共：邮箱输入框 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                {mode === 'LOGIN' ? '账号 / 邮箱' : '电子邮箱'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  placeholder={mode === 'LOGIN' ? "请输入邮箱或管理员账号" : "请输入您的常用邮箱"}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* 密码框：现在注册和登录都需要显示密码框 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                {mode === 'LOGIN' ? '密码' : '设置密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  placeholder={mode === 'LOGIN' ? "请输入密码" : "请设置登录密码"}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* 注册模式：协议勾选 */}
            {mode === 'REGISTER' && (
              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 transition-all"
                    checked={formData.agreed}
                    onChange={e => setFormData({...formData, agreed: e.target.checked})}
                  />
                  <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" size={12} />
                </div>
                <span className="text-xs text-gray-500 leading-tight pt-0.5 group-hover:text-gray-700">
                  我已阅读并同意 <Link to="/terms" target="_blank" className="text-blue-600 hover:underline mx-1">《FUHUNG 用户服务协议》</Link>
                </span>
              </label>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black active:scale-95 transition-all shadow-lg shadow-gray-200"
            >
              <span>{mode === 'LOGIN' ? '立即登录' : '立即注册'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

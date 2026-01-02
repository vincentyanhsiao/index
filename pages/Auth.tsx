import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight, User as UserIcon, CheckCircle, RefreshCw } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: User, isRegister: boolean) => void;
  users: User[];
  // 新增：接收重置密码的函数
  onPasswordReset: (email: string, newPass: string) => void;
}

// 新增 FORGOT 模式
type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT';

const Auth: React.FC<Props> = ({ onAuthSuccess, users, onPasswordReset }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', // 新增：确认密码字段
    agreed: false
  });
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- 找回密码逻辑 ---
    if (mode === 'FORGOT') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('请填写完整信息');
        return;
      }
      
      // 1. 校验邮箱是否存在
      const userExists = users.some(u => u.email === formData.email);
      if (!userExists) {
        setError('该邮箱未注册');
        return;
      }

      // 2. 校验两次密码是否一致 (即"重新输入2次相同的验证码/密码")
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致，请重新输入');
        return;
      }

      // 3. 执行重置
      onPasswordReset(formData.email, formData.password);
      alert('密码重置成功！请使用新密码登录。');
      setMode('LOGIN'); // 切换回登录页
      return;
    }

    // --- 登录逻辑 ---
    if (mode === 'LOGIN') {
      if (!formData.email || !formData.password) {
        setError('请输入账号和密码');
        return;
      }

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

      const foundUser = users.find(u => u.email === formData.email && u.password === formData.password);

      if (foundUser) {
        onAuthSuccess(foundUser, false);
        navigate('/');
      } else {
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
        setError('请填写完整的注册信息');
        return;
      }
      
      if (!formData.agreed) {
        setError('请阅读并同意服务协议');
        return;
      }

      const isDuplicate = users.some(u => u.email === formData.email);
      if (isDuplicate) {
        setError('该邮箱已被注册，请直接登录');
        return;
      }

      const newUser: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
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
              {mode === 'LOGIN' ? '欢迎回来' : mode === 'REGISTER' ? '加入 FUHUNG' : '重置密码'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'LOGIN' ? '登录以管理您的收藏和偏好' : mode === 'REGISTER' ? '注册即刻享受会员专属权益' : '验证身份并设置新密码'}
            </p>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={16} className="mr-2 flex-shrink-0" /> {error}
              </div>
            )}

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

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                {mode === 'LOGIN' ? '账号 / 邮箱' : '电子邮箱'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  placeholder={mode === 'LOGIN' ? "请输入邮箱或管理员账号" : "请输入您的注册邮箱"}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                {mode === 'LOGIN' ? '密码' : mode === 'FORGOT' ? '新密码' : '设置密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  placeholder={mode === 'FORGOT' ? "请输入新密码" : "请输入密码"}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* 找回密码模式：确认密码输入框 */}
            {mode === 'FORGOT' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

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
              <span>
                {mode === 'LOGIN' ? '立即登录' : mode === 'REGISTER' ? '立即注册' : '重置密码'}
              </span>
              <ArrowRight size={18} />
            </button>

            {/* 登录模式下显示“忘记密码”链接 */}
            {mode === 'LOGIN' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('FORGOT'); setError(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center justify-center mx-auto"
                >
                  <RefreshCw size={14} className="mr-1" /> 忘记密码？
                </button>
              </div>
            )}

            {/* 找回密码模式下显示“返回登录” */}
            {mode === 'FORGOT' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setError(''); }}
                  className="text-sm text-blue-600 font-bold hover:underline transition"
                >
                  返回登录
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

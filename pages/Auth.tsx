import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Mail, Lock, ShieldCheck, ArrowRight, User as UserIcon, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: User, isRegister: boolean) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT';

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false
  });
  
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // --- 找回密码 ---
      if (mode === 'FORGOT') {
        if (!formData.email || !formData.password || !formData.confirmPassword) throw new Error('请填写完整信息');
        if (formData.password !== formData.confirmPassword) throw new Error('两次密码不一致');

        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, newPassword: formData.password })
        });
        
        // --- 防御性检查开始 ---
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const text = await res.text();
           console.error("API 错误响应:", text);
           throw new Error(`服务器连接异常: 返回了非 JSON 数据 (状态码 ${res.status})。请按 F12 查看控制台详情。`);
        }
        // --- 防御性检查结束 ---

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '重置失败');

        alert('密码重置成功，请登录');
        setMode('LOGIN');
      } 
      // --- 登录 ---
      else if (mode === 'LOGIN') {
        if (!formData.email || !formData.password) throw new Error('请输入账号和密码');

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        // --- 防御性检查开始 ---
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const text = await res.text();
           console.error("API 错误响应:", text);
           // 这里我们能抓到到底是 404 (接口没找到) 还是 500 (数据库挂了)
           if (res.status === 404) {
             throw new Error('API 接口未找到 (404)。可能是后端服务未启动，Zeabur 可能只部署了前端静态页面。');
           }
           throw new Error(`登录失败: 服务器返回异常 (状态码 ${res.status})`);
        }
        // --- 防御性检查结束 ---

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '登录失败');

        onAuthSuccess(data, false);
        navigate('/');
      } 
      // --- 注册 ---
      else {
        if (!formData.name || !formData.email || !formData.password) throw new Error('请填写完整注册信息');
        if (!formData.agreed) throw new Error('请同意服务协议');

        const newUser = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: UserRole.USER,
          favorites: [],
          isMarketingAuthorized: true
        };

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        // --- 防御性检查开始 ---
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const text = await res.text();
           console.error("API 错误响应:", text);
           throw new Error(`注册失败: 服务器返回异常 (状态码 ${res.status})`);
        }
        // --- 防御性检查结束 ---

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '注册失败');

        onAuthSuccess(data, true);
        alert('注册成功！');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Auth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* 顶部切换栏 */}
        <div className="flex border-b">
          <button onClick={() => { setMode('LOGIN'); setError(''); }} className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'LOGIN' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}>账号登录</button>
          <button onClick={() => { setMode('REGISTER'); setError(''); }} className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'REGISTER' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}>快速注册</button>
        </div>

        <div className="bg-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{mode === 'LOGIN' ? '欢迎回来' : mode === 'REGISTER' ? '加入 FUHUNG' : '重置密码'}</h2>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center"><ShieldCheck size={16} className="mr-2" /> {error}</div>}

            {mode === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">姓名</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:border-blue-500" placeholder="您的姓名" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:border-blue-500" placeholder="请输入邮箱" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">{mode === 'FORGOT' ? '新密码' : '密码'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:border-blue-500" placeholder="请输入密码" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            {mode === 'FORGOT' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:border-blue-500" placeholder="再次输入密码" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>
            )}

            {mode === 'REGISTER' && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={formData.agreed} onChange={e => setFormData({...formData, agreed: e.target.checked})} />
                <span className="text-xs text-gray-500">同意 <Link to="/terms" className="text-blue-600">服务协议</Link></span>
              </label>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="animate-spin" /> : <><span className="mr-2">{mode === 'LOGIN' ? '登录' : mode === 'REGISTER' ? '注册' : '重置'}</span><ArrowRight size={18} /></>}
            </button>

            {mode === 'LOGIN' && (
              <button type="button" onClick={() => { setMode('FORGOT'); setError(''); }} className="w-full text-sm text-gray-400 hover:text-gray-600 flex justify-center items-center"><RefreshCw size={14} className="mr-1" /> 忘记密码？</button>
            )}
            {mode === 'FORGOT' && (
              <button type="button" onClick={() => { setMode('LOGIN'); setError(''); }} className="w-full text-sm text-blue-600 font-bold hover:underline">返回登录</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

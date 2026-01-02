import React, { useState, useRef } from 'react';
import { Artwork, User, Advertisement, UserRole } from '../types';
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, Upload, Users, Monitor, ExternalLink, Save, ArrowLeft, X, Crown, CheckCircle } from 'lucide-react';

interface Props {
  artworks: Artwork[];
  allUsers: User[];
  ads: Advertisement[];
  onUpdate: (art: Artwork) => void;
  onDelete: (id: string) => void;
  onAdd: (art: Artwork) => void;
  onBatchImport: (arts: Artwork[]) => void;
  onUpdateAd: (ad: Advertisement) => void;
}

type AdminTab = 'ARTWORKS' | 'USERS' | 'ADS';

const AdminDashboard: React.FC<Props> = ({ artworks, allUsers, ads, onUpdate, onDelete, onAdd, onBatchImport, onUpdateAd }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('ARTWORKS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Artwork>>({});
  
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [adFormData, setAdFormData] = useState<Partial<Advertisement>>({});

  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const adImageUploadRef = useRef<HTMLInputElement>(null);

  const filteredArtworks = artworks.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 核心：管理员开通 VIP 功能 ---
  const handleToggleVip = async (userId: string, currentStatus: boolean) => {
      const months = currentStatus ? 0 : 12; // 如果当前是VIP就取消，如果不是就开通1年
      const actionText = currentStatus ? '取消 VIP 资格' : '开通 1 年 VIP';
      
      if (!window.confirm(`确定要为该用户 ${actionText} 吗？`)) return;

      try {
          const res = await fetch(`/api/users/${userId}/vip`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ isVip: !currentStatus, months: months })
          });
          if (res.ok) {
              alert('操作成功！请刷新页面查看最新状态。');
              // 理想情况下应该调用父组件刷新用户列表，这里简单处理提示刷新
              window.location.reload(); 
          } else {
              alert('操作失败');
          }
      } catch (error) {
          alert('网络错误');
      }
  };

  const handleEdit = (art: Artwork) => {
    setEditingId(art.id);
    setFormData(art);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条艺术品数据吗？此操作不可撤销。')) {
      onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setFormData({});
      }
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.artist || !formData.hammerPrice || !formData.thumbnail) {
      alert('作品名称、艺术家、成交价、主图为必填项');
      return;
    }

    const safeData = {
      ...formData,
      category: formData.category || '其他',
      auctionSession: formData.auctionSession || '',
      description: formData.description || '',
      material: formData.material || '',
      dimensions: formData.dimensions || '',
      creationYear: formData.creationYear || '',
      auctionTime: formData.auctionTime || '',
      auctionHouse: formData.auctionHouse || '',
      estimatedPriceMin: Number(formData.estimatedPriceMin) || 0,
      estimatedPriceMax: Number(formData.estimatedPriceMax) || 0,
      hammerPrice: Number(formData.hammerPrice) || 0,
      status: formData.status || 'PUBLISHED',
      auctionDate: formData.auctionDate || new Date().toISOString().split('T')[0],
    };

    if (isAdding) {
      const newArt: Artwork = {
        ...(safeData as Artwork),
        id: Math.random().toString(36).substr(2, 9),
        images: formData.images || [formData.thumbnail!],
        createdAt: new Date().toISOString(),
      };
      onAdd(newArt);
      setIsAdding(false);
    } else if (editingId) {
      onUpdate(safeData as Artwork);
      setEditingId(null);
    }
    setFormData({});
    alert('保存成功！');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAd: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isAd) setAdFormData(prev => ({ ...prev, imageUrl: base64String }));
      else setFormData(prev => ({ ...prev, thumbnail: base64String }));
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const handleExportUsers = () => {
    if (!allUsers || allUsers.length === 0) {
      alert('暂无会员数据可导出');
      return;
    }
    const headers = ['用户ID', '姓名', '电子邮箱', '角色', 'VIP状态', '到期时间'];
    const rows = allUsers.map(u => [
      u.id, u.name, u.email, 
      u.role === 'ADMIN' ? '管理员' : '普通会员', 
      u.isVip ? '是' : '否',
      u.vipExpireAt ? new Date(u.vipExpireAt).toLocaleDateString() : '-'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FUHUNG_会员名册_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const validArtworks: Artwork[] = json.map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.title || '未命名作品',
            artist: item.artist || '佚名',
            category: item.category || '其他',
            material: item.material || '',
            dimensions: item.dimensions || '',
            creationYear: item.creationYear || '',
            hammerPrice: Number(item.hammerPrice) || 0,
            estimatedPriceMin: Number(item.estimatedPriceMin) || 0,
            estimatedPriceMax: Number(item.estimatedPriceMax) || 0,
            auctionHouse: item.auctionHouse || '',
            auctionDate: item.auctionDate || new Date().toISOString().split('T')[0],
            auctionTime: item.auctionTime || '',
            auctionSession: item.auctionSession || '',
            description: item.description || '',
            thumbnail: item.thumbnail || 'https://via.placeholder.com/400',
            images: item.images || (item.thumbnail ? [item.thumbnail] : []),
            status: 'PUBLISHED',
            createdAt: new Date().toISOString()
          }));
          onBatchImport(validArtworks);
          alert(`成功导入 ${validArtworks.length} 条艺术品数据！`);
        } else {
          alert('导入失败：文件格式必须是 JSON 数组');
        }
      } catch (err) {
        alert('导入失败：JSON 文件解析错误');
      }
      if (batchFileInputRef.current) batchFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setAdFormData(ad);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAd = () => {
    if (editingAdId && adFormData.id) {
      onUpdateAd(adFormData as Advertisement);
      setEditingAdId(null);
      setAdFormData({});
      alert('广告位更新成功！');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">后台管理中心</h1>
          <p className="text-gray-500">
            {currentTab === 'ARTWORKS' && `当前共有 ${artworks.length} 件艺术品数据`}
            {currentTab === 'USERS' && `当前共有 ${allUsers.length} 位注册会员`}
            {currentTab === 'ADS' && '管理网站各处的广告位内容'}
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setCurrentTab('ARTWORKS')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${currentTab === 'ARTWORKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>艺术品管理</button>
          <button onClick={() => setCurrentTab('ADS')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${currentTab === 'ADS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>广告位管理</button>
          <button onClick={() => setCurrentTab('USERS')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${currentTab === 'USERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>会员列表</button>
        </div>
      </div>

      {currentTab === 'ARTWORKS' && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
               <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="搜索作品或艺术家..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              {!isAdding && !editingId && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => batchFileInputRef.current?.click()} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-50 text-sm whitespace-nowrap">
                    <Upload size={16} /><span>导入</span>
                  </button>
                  <input type="file" ref={batchFileInputRef} onChange={handleBatchFileChange} accept=".json" className="hidden" />
                  <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ status: 'PUBLISHED' }); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-blue-700 text-sm whitespace-nowrap shadow-sm">
                    <Plus size={16} /><span>新增</span>
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider">
                  <tr><th className="px-6 py-4 font-bold">作品信息</th><th className="px-6 py-4 font-bold">成交价</th><th className="px-6 py-4 font-bold">状态</th><th className="px-6 py-4 text-right">操作</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArtworks.map(art => (
                    <tr key={art.id} className={`transition hover:bg-gray-50 ${editingId === art.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img src={art.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{art.title}</div>
                            <div className="text-gray-500 text-xs">{art.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="font-bold text-gray-700">¥{art.hammerPrice.toLocaleString()}</div></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${art.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {art.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleEdit(art)} className={`p-2 rounded-lg transition ${editingId === art.id ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}><Edit3 size={18}/></button>
                          <button onClick={() => handleDelete(art.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {(isAdding || editingId) ? (
              <div className="bg-white rounded-2xl border p-5 shadow-lg sticky top-24 space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-900">{isAdding ? '发布新艺术品' : '编辑作品信息'}</h3>
                  <button onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }} className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition"><X size={20} /></button>
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><ImageIcon size={14}/> 作品主图 (封面) *</label>
                   <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition group"
                      onClick={() => imageUploadRef.current?.click()}
                   >
                      {formData.thumbnail ? (
                        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                           <img src={formData.thumbnail} className="w-full h-full object-contain" alt="preview" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-bold flex items-center gap-1"><Upload size={12}/> 更换图片</span>
                           </div>
                        </div>
                      ) : (
                        <div className="py-4">
                           <Upload size={32} className="text-gray-300 mx-auto mb-2 group-hover:text-blue-500" />
                           <span className="text-xs text-gray-500 group-hover:text-blue-600">点击上传图片 (Max 2MB)</span>
                        </div>
                      )}
                      <input type="file" ref={imageUploadRef} onChange={(e) => handleImageUpload(e, false)} accept="image/*" className="hidden" />
                   </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500">作品名称 *</label><input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">艺术家 *</label><input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm" value={formData.artist || ''} onChange={e => setFormData({...formData, artist: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">年份</label><input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="如: 1998" value={formData.creationYear || ''} onChange={e => setFormData({...formData, creationYear: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500">分类</label><input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="如: 中国书画" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500">成交价 (RMB) *</label><input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none font-mono font-bold text-red-600" value={formData.hammerPrice || ''} onChange={e => setFormData({...formData, hammerPrice: Number(e.target.value)})} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">估价 Min</label><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.estimatedPriceMin || ''} onChange={e => setFormData({...formData, estimatedPriceMin: Number(e.target.value)})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">估价 Max</label><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.estimatedPriceMax || ''} onChange={e => setFormData({...formData, estimatedPriceMax: Number(e.target.value)})} /></div>
                    </div>
                    
                    <details className="group">
                        <summary className="text-xs font-bold text-blue-600 cursor-pointer list-none flex items-center gap-1 mt-2">
                           <Plus size={12} className="group-open:rotate-45 transition-transform"/> 填写更多详细参数 (材质、尺寸、拍卖行等)
                        </summary>
                        <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-1">
                           <div className="grid grid-cols-2 gap-3">
                              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="材质 (如: 设色纸本)" value={formData.material || ''} onChange={e => setFormData({...formData, material: e.target.value})} />
                              <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="尺寸 (如: 120x60cm)" value={formData.dimensions || ''} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
                           </div>
                           <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="拍卖行名称" value={formData.auctionHouse || ''} onChange={e => setFormData({...formData, auctionHouse: e.target.value})} />
                           <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="拍卖专场" value={formData.auctionSession || ''} onChange={e => setFormData({...formData, auctionSession: e.target.value})} />
                           <div className="grid grid-cols-2 gap-3">
                              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.auctionDate || ''} onChange={e => setFormData({...formData, auctionDate: e.target.value})} />
                              <input type="time" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.auctionTime || ''} onChange={e => setFormData({...formData, auctionTime: e.target.value})} />
                           </div>
                           <textarea className="w-full px-3 py-2 border rounded-lg text-sm h-20" placeholder="作品介绍..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </details>
                </div>

                <div className="pt-4 border-t flex flex-col gap-3">
                   <div className="flex items-center justify-between"><label className="text-xs font-bold text-gray-500">发布状态</label><select className="px-2 py-1 border rounded text-sm bg-gray-50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="PUBLISHED">立即上架</option><option value="DRAFT">存为草稿</option></select></div>
                   <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition"><Save size={18} /> 保存并{isAdding ? '发布' : '更新'}</button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed rounded-3xl p-8 text-center sticky top-24 h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm text-gray-300"><Edit3 size={32} /></div>
                <h4 className="font-bold text-gray-600 mb-2">准备就绪</h4>
                <p className="text-sm text-gray-400 px-4">点击左侧列表中的 <span className="text-blue-600 font-bold"><Edit3 size={12} className="inline"/> 编辑</span> 按钮，<br/>或者点击顶部的 <span className="text-blue-600 font-bold">新增</span> 按钮开始操作。</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'ADS' && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {ads.map(ad => (
              <div key={ad.id} className={`bg-white p-6 rounded-2xl border shadow-sm transition hover:shadow-md cursor-pointer ${editingAdId === ad.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => handleEditAd(ad)}>
                <div className="flex justify-between items-start mb-4">
                  <div><h3 className="font-bold text-gray-900 flex items-center gap-2"><Monitor size={16} className="text-blue-500" />{ad.name}</h3><p className="text-xs text-gray-400 mt-1 font-mono">{ad.slotId}</p></div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{ad.isActive ? '启用中' : '已停用'}</span>
                </div>
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative group">
                  {ad.imageUrl ? <img src={ad.imageUrl} className="w-full h-full object-cover" alt="ad preview" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gradient-to-r from-gray-50 to-gray-100">无图片，将显示默认渐变样式</div>}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">{ad.title}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            {editingAdId ? (
              <div className="bg-white rounded-2xl border p-6 shadow-lg sticky top-24 animate-in slide-in-from-right space-y-5">
                <div className="flex items-center justify-between border-b pb-4"><h3 className="text-lg font-bold text-gray-900">编辑广告位</h3><button onClick={() => { setEditingAdId(null); setAdFormData({}); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500">广告标题 / 文案</label><input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm" value={adFormData.title || ''} onChange={e => setAdFormData({...adFormData, title: e.target.value})} placeholder="例如：2026 春季拍卖会" /></div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><ImageIcon size={14}/> 广告图片</label>
                     <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition group" onClick={() => adImageUploadRef.current?.click()}>
                        {adFormData.imageUrl ? (
                          <div className="relative w-full aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden">
                             <img src={adFormData.imageUrl} className="w-full h-full object-cover" alt="preview" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold flex items-center gap-1"><Upload size={12}/> 更换</span></div>
                          </div>
                        ) : (
                          <div className="py-2"><Upload size={24} className="text-gray-300 mx-auto mb-1 group-hover:text-blue-500" /><span className="text-xs text-gray-500 group-hover:text-blue-600">点击上传广告图</span></div>
                        )}
                        <input type="file" ref={adImageUploadRef} onChange={(e) => handleImageUpload(e, true)} accept="image/*" className="hidden" />
                     </div>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 flex items-center gap-1"><ExternalLink size={14} /> 跳转链接</label><input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm" value={adFormData.linkUrl || ''} onChange={e => setAdFormData({...adFormData, linkUrl: e.target.value})} placeholder="https://..." /></div>
                  <div className="flex items-center space-x-3 pt-2"><input type="checkbox" id="adActive" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" checked={adFormData.isActive} onChange={e => setAdFormData({...adFormData, isActive: e.target.checked})} /><label htmlFor="adActive" className="text-sm font-bold text-gray-700 cursor-pointer">启用此广告位</label></div>
                </div>
                <div className="pt-6 grid grid-cols-2 gap-3"><button onClick={() => { setEditingAdId(null); setAdFormData({}); }} className="py-2 border rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition text-sm">取消</button><button onClick={handleSaveAd} className="py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition text-sm"><Save size={16} /> 保存</button></div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed rounded-3xl p-8 text-center sticky top-24 h-[300px] flex flex-col items-center justify-center"><Monitor size={32} className="text-gray-300 mb-2" /><p className="text-sm text-gray-400">选择左侧广告位进行编辑</p></div>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 3: 会员列表 (⚠️ 新增操作按钮) --- */}
      {currentTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={handleExportUsers} className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-green-700 transition shadow-sm">
              <Users size={18} /><span>导出会员名单</span>
            </button>
          </div>
          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider">
                <tr><th className="px-6 py-4 font-bold">用户ID</th><th className="px-6 py-4 font-bold">姓名</th><th className="px-6 py-4 font-bold">邮箱</th><th className="px-6 py-4 font-bold">身份</th><th className="px-6 py-4 font-bold">到期时间</th><th className="px-6 py-4 text-right">管理</th></tr>
              </thead>
              <tbody className="divide-y">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-gray-500">{u.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                        {u.role === 'ADMIN' ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">管理员</span> : 
                         u.isVip ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 flex items-center w-fit"><Crown size={12} className="mr-1"/> VIP会员</span> : 
                         <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500">普通用户</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{u.vipExpireAt ? new Date(u.vipExpireAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                            <button 
                                onClick={() => handleToggleVip(u.id, !!u.isVip)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${u.isVip ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                            >
                                {u.isVip ? '取消VIP' : '开通VIP'}
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

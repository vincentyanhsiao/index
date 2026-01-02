import React, { useState, useRef } from 'react';
import { Artwork, User } from '../types';
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, Upload, Download, Users } from 'lucide-react';

interface Props {
  artworks: Artwork[];
  allUsers: User[]; // 新增：接收用户列表
  onUpdate: (art: Artwork) => void;
  onDelete: (id: string) => void;
  onAdd: (art: Artwork) => void;
  onBatchImport: (arts: Artwork[]) => void; // 新增：批量导入回调
}

const AdminDashboard: React.FC<Props> = ({ artworks, allUsers, onUpdate, onDelete, onAdd, onBatchImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Artwork>>({});
  
  // 文件上传 input 的引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredArtworks = artworks.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (art: Artwork) => {
    setEditingId(art.id);
    setFormData(art);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条艺术品数据吗？此操作不可撤销。')) {
      onDelete(id);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.artist || !formData.hammerPrice || !formData.thumbnail) {
      alert('作品名称、艺术家、价格、主图均不可为空');
      return;
    }

    const safeData = {
      ...formData,
      auctionSession: formData.auctionSession || '',
      description: formData.description || '',
      material: formData.material || '',
      dimensions: formData.dimensions || '',
      creationYear: formData.creationYear || '',
      auctionTime: formData.auctionTime || '',
      status: formData.status || 'PUBLISHED',
    };

    if (isAdding) {
      const exists = artworks.find(a => a.title === safeData.title && a.artist === safeData.artist);
      if (exists) {
        alert('该作品已有发布记录，请勿重复发布');
        return;
      }

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
  };

  // --- 新功能 1: 导出会员数据 ---
  const handleExportUsers = () => {
    if (!allUsers || allUsers.length === 0) {
      alert('暂无会员数据可导出');
      return;
    }

    // 定义 CSV 表头
    const headers = ['用户ID', '姓名', '电子邮箱', '角色', '注册时间'];
    
    // 转换数据行
    const rows = allUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.role === 'ADMIN' ? '管理员' : '普通会员',
      new Date().toLocaleDateString() // 模拟注册时间，实际项目中应在User类型中增加createdAt字段
    ]);

    // 拼接 CSV 内容 (处理中文乱码需要 BOM)
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 创建 Blob 并下载
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FUHUNG_会员名册_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 新功能 2: 批量导入艺术品 ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // 简单的校验与转换
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
            status: 'PUBLISHED', // 默认直接发布
            createdAt: new Date().toISOString()
          }));

          onBatchImport(validArtworks);
          alert(`成功导入 ${validArtworks.length} 条艺术品数据！`);
        } else {
          alert('导入失败：文件格式必须是 JSON 数组');
        }
      } catch (err) {
        console.error(err);
        alert('导入失败：JSON 文件解析错误');
      }
      // 清空 input，允许重复上传同一文件
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据管理后台</h1>
          <p className="text-gray-500">当前共有 {artworks.length} 件艺术品数据</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* 会员导出按钮 */}
          <button 
            onClick={handleExportUsers}
            className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-green-700 transition shadow-sm"
          >
            <Users size={18} />
            <span>导出会员 ({allUsers.length})</span>
          </button>

          {/* 批量导入按钮 */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-50 transition shadow-sm"
          >
            <Upload size={18} />
            <span>批量导入</span>
          </button>
          {/* 隐藏的文件输入框 */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />

          {/* 单个发布按钮 */}
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ status: 'PUBLISHED' }); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            <span>发布新数据</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="搜索列表中的作品或艺术家..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">作品详情</th>
                  <th className="px-6 py-4 font-bold">成交价</th>
                  <th className="px-6 py-4 font-bold">状态</th>
                  <th className="px-6 py-4 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredArtworks.map(art => (
                  <tr key={art.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={art.thumbnail} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <div className="font-bold text-gray-900">{art.title}</div>
                          <div className="text-gray-500 text-xs">{art.artist} | {art.creationYear || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700">¥{art.hammerPrice.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">{art.auctionDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        art.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {art.status === 'PUBLISHED' ? '已上架' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(art)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(art.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit/Add Form */}
        <div className="lg:col-span-1">
          {(isAdding || editingId) ? (
            <div className="bg-white rounded-2xl border p-6 shadow-lg sticky top-24 space-y-4 animate-in slide-in-from-right">
              <h3 className="text-lg font-bold border-b pb-4">{isAdding ? '发布新艺术品' : '编辑艺术品数据'}</h3>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">作品名称 *</label>
                  <input 
                    className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">艺术家 *</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.artist || ''} 
                      onChange={e => setFormData({...formData, artist: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">创作年份</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      placeholder="如：1998年作"
                      value={formData.creationYear || ''} 
                      onChange={e => setFormData({...formData, creationYear: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">作品分类 *</label>
                  <input 
                    className="w-full px-3 py-2 border rounded-lg" 
                    placeholder="如：中国书画"
                    value={formData.category || ''} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">材质</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      placeholder="如：设色纸本"
                      value={formData.material || ''} 
                      onChange={e => setFormData({...formData, material: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">尺寸</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      placeholder="如：136cm × 68cm"
                      value={formData.dimensions || ''} 
                      onChange={e => setFormData({...formData, dimensions: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">成交价 (RMB) *</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.hammerPrice || ''} 
                    onChange={e => setFormData({...formData, hammerPrice: Number(e.target.value)})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">估价 Min</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.estimatedPriceMin || ''} 
                      onChange={e => setFormData({...formData, estimatedPriceMin: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">估价 Max</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.estimatedPriceMax || ''} 
                      onChange={e => setFormData({...formData, estimatedPriceMax: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">拍卖行名称</label>
                  <input 
                    className="w-full px-3 py-2 border rounded-lg" 
                    value={formData.auctionHouse || ''} 
                    onChange={e => setFormData({...formData, auctionHouse: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">拍卖专场</label>
                  <input 
                    className="w-full px-3 py-2 border rounded-lg" 
                    placeholder="如：现当代艺术夜场"
                    value={formData.auctionSession || ''} 
                    onChange={e => setFormData({...formData, auctionSession: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">成交日期</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.auctionDate || ''} 
                      onChange={e => setFormData({...formData, auctionDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">具体时间</label>
                    <input 
                      type="time"
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.auctionTime || ''} 
                      onChange={e => setFormData({...formData, auctionTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">状态</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="PUBLISHED">上架</option>
                      <option value="DRAFT">草稿</option>
                    </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">主图 URL *</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      className="flex-grow px-3 py-2 border rounded-lg" 
                      placeholder="https://..."
                      value={formData.thumbnail || ''} 
                      onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                    />
                    <div className="w-10 h-10 border rounded bg-gray-50 overflow-hidden flex items-center justify-center">
                      {formData.thumbnail ? <img src={formData.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={18}/>}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">作品介绍</label>
                  <textarea 
                    className="w-full px-3 py-2 border rounded-lg h-24" 
                    placeholder="请输入关于此作品的详细介绍..."
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }}
                  className="py-2 border rounded-xl hover:bg-gray-50 font-medium"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  className="py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  保存发布
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed rounded-3xl p-8 text-center sticky top-24">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Plus size={32} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-600 mb-2">选择作品开始操作</h4>
              <p className="text-sm text-gray-400">点击列表中的编辑按钮，或点击上方“发布新数据”按钮开始管理数据。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


import React, { useState } from 'react';
import { Artwork } from '../types';
import { Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, Eye, Image as ImageIcon } from 'lucide-react';

interface Props {
  artworks: Artwork[];
  onUpdate: (art: Artwork) => void;
  onDelete: (id: string) => void;
  onAdd: (art: Artwork) => void;
}

const AdminDashboard: React.FC<Props> = ({ artworks, onUpdate, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Artwork>>({});

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

    if (isAdding) {
      // Check for duplicates
      const exists = artworks.find(a => a.title === formData.title && a.artist === formData.artist);
      if (exists) {
        alert('该作品已有发布记录，请勿重复发布');
        return;
      }

      const newArt: Artwork = {
        ...formData as Artwork,
        id: Math.random().toString(36).substr(2, 9),
        images: formData.images || [formData.thumbnail!],
        createdAt: new Date().toISOString(),
        status: formData.status || 'PUBLISHED'
      };
      onAdd(newArt);
      setIsAdding(false);
    } else if (editingId) {
      onUpdate(formData as Artwork);
      setEditingId(null);
    }
    setFormData({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据管理后台</h1>
          <p className="text-gray-500">当前共有 {artworks.length} 件艺术品数据，会员注册数：1,280</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ status: 'PUBLISHED' }); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>发布新数据</span>
        </button>
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
                          <div className="text-gray-500 text-xs">{art.artist} | {art.category}</div>
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
                    <label className="text-xs font-bold text-gray-500">作品分类 *</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={formData.category || ''} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
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

import React, { useMemo, useState } from 'react';
import { Artwork, IndexPoint, User } from '../types';
import { BarChart3, TrendingUp, TrendingDown, Info, Calendar, Download, Trophy, Medal, ChevronRight, Filter, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  artworks: Artwork[];
  user?: User | null; // 新增：接收用户信息以判断权限
}

type ViewType = 'trend' | 'ranking';

const MarketIndex: React.FC<Props> = ({ artworks, user }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>('trend');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Filter Logic
  const categories = ['all', ...Array.from(new Set(artworks.map(a => a.category)))];
  const years = ['all', ...Array.from(new Set(artworks.map(a => a.auctionDate.substring(0, 4)))).sort().reverse()];

  // 辅助函数：计算中位数
  const calculateMedian = (values: number[]) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Index Calculation Logic
  const indexData = useMemo(() => {
    const filtered = artworks.filter(a => 
      (selectedCategory === 'all' || a.category === selectedCategory) &&
      (selectedYear === 'all' || a.auctionDate.startsWith(selectedYear))
    );

    const monthlyGroups: Record<string, Artwork[]> = {};
    filtered.forEach(art => {
      const month = art.auctionDate.substring(0, 7);
      if (!monthlyGroups[month]) monthlyGroups[month] = [];
      monthlyGroups[month].push(art);
    });

    const months = Object.keys(monthlyGroups).sort();
    if (months.length === 0) return [];

    const monthlyStats = months.map(m => {
      const arts = monthlyGroups[m];
      const prices = arts.map(a => a.hammerPrice);
      const medianPrice = calculateMedian(prices);
      return {
        date: m,
        volume: arts.length,
        price: medianPrice,
        arts
      };
    });

    const baseStats = monthlyStats[0];
    const basePrice = baseStats.price || 1;
    const baseVolume = baseStats.volume || 1;

    return monthlyStats.map(stat => {
      const priceRatio = stat.price / basePrice;
      const volumeRatio = stat.volume / baseVolume;
      let indexValue = Math.round((priceRatio * 0.7 + volumeRatio * 0.3) * 1000);
      if (stat.volume === 0) indexValue = 0;

      return { 
        date: stat.date, 
        value: indexValue, 
        volume: stat.volume, 
        avgPrice: stat.price 
      } as IndexPoint;
    });
  }, [artworks, selectedCategory, selectedYear]);

  // Ranking Logic
  const rankingList = useMemo(() => {
    return artworks
      .filter(a => 
        (selectedCategory === 'all' || a.category === selectedCategory) &&
        (selectedYear === 'all' || a.auctionDate.startsWith(selectedYear))
      )
      .sort((a, b) => b.hammerPrice - a.hammerPrice)
      .slice(0, 50);
  }, [artworks, selectedCategory, selectedYear]);

  const latestIndex = indexData[indexData.length - 1]?.value || 0;
  const prevIndex = indexData[indexData.length - 2]?.value || 1000;
  const changePercent = ((latestIndex - prevIndex) / (prevIndex || 1) * 100).toFixed(2);
  const isUp = latestIndex >= prevIndex;

  // --- 新增：导出报表功能 ---
  const handleExportReport = () => {
    // 1. 权限校验
    if (!user) {
      if (window.confirm('导出专业报表是会员专属权益，是否前往登录？')) {
        navigate('/login');
      }
      return;
    }

    if (rankingList.length === 0) {
      alert('当前筛选条件下没有数据可导出');
      return;
    }

    // 2. 准备 CSV 数据
    // 添加 UTF-8 BOM 防止 Excel 乱码
    const headers = ['排名', '作品名称', '艺术家', '分类', '创作年份', '成交价(RMB)', '拍卖行', '拍卖场次', '成交日期'];
    
    const rows = rankingList.map((art, index) => [
      index + 1,
      `"${art.title.replace(/"/g, '""')}"`, // 处理包含逗号或引号的标题
      art.artist,
      art.category,
      art.creationYear || '-',
      art.hammerPrice,
      art.auctionHouse,
      art.auctionSession,
      art.auctionDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 3. 触发下载
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 生成文件名：FUHUNG_2026年度_油画_TOP50报表.csv
    const catName = selectedCategory === 'all' ? '全部分类' : selectedCategory;
    const yearName = selectedYear === 'all' ? '历史至今' : `${selectedYear}年度`;
    link.href = url;
    link.setAttribute('download', `FUHUNG_${yearName}_${catName}_TOP50报表.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple SVG Chart Generator
  const Chart = () => {
    if (indexData.length < 2) return <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">该筛选条件下数据不足，无法生成趋势图</div>;
    const maxVal = Math.max(...indexData.map(d => d.value)) * 1.2;
    const minVal = Math.min(...indexData.map(d => d.value)) * 0.8;
    const range = maxVal - minVal || 1;
    const width = 800;
    const height = 300;
    const padding = 40;
    const points = indexData.map((d, i) => {
      const x = padding + (i / (indexData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
    const areaPoints = `${points} ${width - padding},${height - padding} ${padding},${height - padding}`;

    return (
      <div className="relative w-full overflow-x-auto pb-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-auto overflow-visible">
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i / 4) * (height - padding * 2);
            const val = Math.round(maxVal - (i / 4) * range);
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padding - 10} y={y + 5} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">{val}</text>
              </g>
            );
          })}
          {indexData.map((d, i) => {
            if (indexData.length > 10 && i % Math.ceil(indexData.length / 6) !== 0) return null;
            const x = padding + (i / (indexData.length - 1)) * (width - padding * 2);
            return <text key={i} x={x} y={height - 15} textAnchor="middle" className="text-[10px] fill-gray-400 font-medium">{d.date}</text>;
          })}
          <polyline fill="url(#gradient)" points={areaPoints} className="opacity-20" />
          <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header & Main Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex-grow">
          <div className="flex items-center space-x-2 text-blue-600 font-bold mb-2">
            <BarChart3 size={24} />
            <span className="tracking-widest uppercase text-sm">Artsy Data Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900">艺术品市场风向标</h1>
        </div>
        
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl self-start">
          <button
            onClick={() => setActiveView('trend')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeView === 'trend' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            指数趋势
          </button>
          <button
            onClick={() => setActiveView('ranking')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeView === 'ranking' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            拍卖排行榜
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-10 flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-3">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">分类筛选:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

        <div className="flex items-center space-x-3">
          <Clock size={18} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700">时间维度:</span>
          <select
            className="bg-gray-50 border-none rounded-full px-4 py-1.5 text-xs font-bold outline-none cursor-pointer"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">历史至今</option>
            {years.filter(y => y !== 'all').map(y => <option key={y} value={y}>{y}年度</option>)}
          </select>
        </div>
      </div>

      {activeView === 'trend' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">当前市场指数</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-gray-900">{latestIndex}</span>
                <div className={`flex items-center text-sm font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
                  {isUp ? '+' : ''}{changePercent}%
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">周期最高指数</div>
              <div className="text-4xl font-black text-gray-900">{Math.max(...indexData.map(d => d.value), 0)}</div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">区间成交件数</div>
              <div className="text-4xl font-black text-blue-600">{indexData.reduce((sum, d) => sum + d.volume, 0)} <span className="text-sm">件</span></div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">指数波动曲线</h3>
              <Info size={16} className="text-gray-300 cursor-help" />
            </div>
            <Chart />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-2xl font-black text-gray-900 flex items-center">
                <Trophy className="text-yellow-500 mr-3" size={28} />
                拍卖成交排行榜 Top 50
              </h3>
              <p className="text-sm text-gray-400 mt-1">按成交金额降序排列，展示市场的头部交易动态</p>
            </div>
            {/* 修改点：绑定点击事件，并根据登录状态改变样式 */}
            <button 
              onClick={handleExportReport}
              className={`flex items-center space-x-2 font-bold hover:underline transition ${
                user ? 'text-blue-600 cursor-pointer' : 'text-gray-400'
              }`}
              title={user ? "点击导出报表" : "会员专享功能"}
            >
              <Download size={18} />
              <span>{user ? '导出报表' : '会员导出'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">排名</th>
                  <th className="px-8 py-5">拍品详情</th>
                  <th className="px-8 py-5">拍卖行</th>
                  <th className="px-8 py-5 text-right">成交价格 (RMB)</th>
                  <th className="px-8 py-5 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rankingList.map((art, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={art.id} className="group hover:bg-blue-50/40 transition-colors">
                      <td className="px-8 py-6">
                        {rank <= 3 ? (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                            rank === 2 ? 'bg-gray-100 text-gray-500' : 
                            'bg-orange-100 text-orange-600'
                          }`}>
                            <Medal size={24} />
                          </div>
                        ) : (
                          <span className="text-xl font-black text-gray-300 group-hover:text-blue-200 transition-colors ml-3">{rank}</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-5">
                          <img src={art.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div>
                            <div className="font-black text-gray-900 line-clamp-1">{art.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{art.artist} · {art.category}</div>
                            <div className="text-[10px] text-gray-400 flex items-center mt-1">
                              <Calendar size={10} className="mr-1" /> {art.auctionDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-gray-700">{art.auctionHouse}</div>
                        <div className="text-[10px] text-gray-400">{art.auctionSession}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-xl font-black text-red-600">¥{art.hammerPrice.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400 font-bold">成交价</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Link 
                          to={`/artwork/${art.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rankingList.length === 0 && (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Trophy size={40} />
                </div>
                <h4 className="font-bold text-gray-600">暂无符合条件的成交数据</h4>
                <p className="text-sm text-gray-400">请尝试调整筛选维度</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketIndex;

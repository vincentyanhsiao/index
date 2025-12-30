import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Artwork, SortField } from '../types';
import SearchSection from '../components/SearchSection';
import ArtworkCard from '../components/ArtworkCard';
import { ArrowUpDown, AlertCircle, Loader2, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

interface Props {
  artworks: Artwork[];
}

const SearchResults: React.FC<Props> = ({ artworks }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const exact = searchParams.get('exact') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simulate loading
  useEffect(() => {
    if (query) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [query, exact]);

  // Handle Search Execution
  const handleSearch = (keyword: string, isExact: boolean) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}${isExact ? '&exact=true' : ''}`);
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredArtworks = useMemo(() => {
    // 1. 先过滤掉草稿状态的数据，只显示已上架的
    const publishedArtworks = artworks.filter(art => art.status === 'PUBLISHED');

    if (!query.trim()) return publishedArtworks;

    const searchTerms = query.toLowerCase().split(/\s+/);
    
    return publishedArtworks.filter(art => {
      // ⚠️ 修复核心：这里加了 || '' 保护，防止因字段缺失导致页面崩溃
      const fields = [
        art.title, 
        art.artist, 
        art.category, 
        art.auctionHouse, 
        art.auctionSession || '' 
      ].map(f => (f || '').toLowerCase());
      
      if (exact) {
        return searchTerms.some(term => fields.some(f => f === term));
      } else {
        return searchTerms.every(term => fields.some(f => f.includes(term)));
      }
    });
  }, [artworks, query, exact]);

  // Sort Logic
  const sortedArtworks = useMemo(() => {
    const list = [...filteredArtworks];
    
    // Special rule: if searching for Auction House, fixed sort by date
    const isAuctionHouseSearch = query.toLowerCase().includes('保利') || query.toLowerCase().includes('嘉德') || query.toLowerCase().includes('拍卖');
    
    if (isAuctionHouseSearch) {
      return list.sort((a, b) => b.auctionDate.localeCompare(a.auctionDate));
    }

    switch (sortField) {
      case 'date':
        return list.sort((a, b) => b.auctionDate.localeCompare(a.auctionDate));
      case 'price_high':
        return list.sort((a, b) => b.hammerPrice - a.hammerPrice);
      case 'price_low':
        return list.sort((a, b) => a.hammerPrice - b.hammerPrice);
      default:
        return list;
    }
  }, [filteredArtworks, sortField, query]);

  // Pagination
  const totalPages = Math.ceil(sortedArtworks.length / itemsPerPage);
  const paginatedArtworks = sortedArtworks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAuctionHouseSearch = query.toLowerCase().includes('保利') || query.toLowerCase().includes('嘉德') || query.toLowerCase().includes('拍卖');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">开始您的查询</h1>
        <SearchSection onSearch={handleSearch} />
        <div className="mt-12 text-center text-gray-400">
           请输入关键词搜索艺术品交易数据
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <SearchSection onSearch={handleSearch} initialKeyword={query} initialIsExact={exact} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b">
        <div className="text-gray-600">
          搜索 <span className="font-bold text-gray-900">“{query}”</span>，共找到 <span className="font-bold text-blue-600">{filteredArtworks.length}</span> 条结果
        </div>
        
        {!isAuctionHouseSearch && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 flex items-center"><ArrowUpDown size={16} className="mr-1" /> 排序方式:</span>
            <select 
              className="bg-white border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="date">拍卖时间从近到远</option>
              <option value="price_high">成交价格从高到低</option>
              <option value="price_low">成交价格从低到高</option>
            </select>
          </div>
        )}
        {isAuctionHouseSearch && (
          <div className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
            拍卖行搜索固定按时间排序
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-blue-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <span className="text-lg font-medium">正在检索数据...</span>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
          <AlertCircle size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">未查询到相关艺术品</h3>
          <p className="text-gray-400">可尝试调整关键词或搜索更宽泛的内容</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {paginatedArtworks.map(art => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="flex justify-center">
            <button 
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-600 transition"
            >
              <ArrowUp size={18} />
              <span>回到顶部</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;


import React, { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (keyword: string, isExact: boolean) => void;
  initialKeyword?: string;
  initialIsExact?: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, initialKeyword = '', initialIsExact = false }) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isExact, setIsExact] = useState(initialIsExact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim(), isExact);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <input
            type="text"
            className="w-full h-14 pl-12 pr-32 rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
            placeholder="请输入艺术家 / 作品 / 分类 / 拍卖行 / 拍卖会名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={24} />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
             <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              搜 索
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                checked={isExact}
                onChange={(e) => setIsExact(e.target.checked)}
              />
              <span className="group-hover:text-gray-700">精准匹配</span>
            </label>
            <div className="flex items-center space-x-1 group cursor-help">
              <HelpCircle size={14} />
              <span>支持多关键词空格分隔</span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            热门搜索：
            <button type="button" onClick={() => { setKeyword('齐白石'); onSearch('齐白石', false); }} className="mx-1 hover:text-blue-600">齐白石</button>
            <button type="button" onClick={() => { setKeyword('嘉德'); onSearch('嘉德', false); }} className="mx-1 hover:text-blue-600">嘉德</button>
            <button type="button" onClick={() => { setKeyword('油画'); onSearch('油画', false); }} className="mx-1 hover:text-blue-600">油画</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchSection;

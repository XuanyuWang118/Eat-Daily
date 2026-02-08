import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, PriceLevel, FilterState, CATEGORIES } from './types';
import { INITIAL_FOODS } from './constants';
import { FoodCard } from './components/FoodCard';
import { Button } from './components/Button';
import { getFoodRecommendationComment } from './services/geminiService';
import { Utensils, Settings, Plus, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';

// Main App Component
const App: React.FC = () => {
  // State
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('myFoods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });
  
  const [view, setView] = useState<'decider' | 'list' | 'add'>('decider');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [aiComment, setAiComment] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    maxPrice: PriceLevel.LUXURY,
    tags: [],
  });

  // Save to local storage whenever foods change
  useEffect(() => {
    localStorage.setItem('myFoods', JSON.stringify(foods));
  }, [foods]);

  // Derived state: Filtered foods
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      if (food.priceLevel > filters.maxPrice) return false;
      if (filters.tags.length > 0) {
        // Must match at least one selected tag
        const hasTag = food.tags.some(t => filters.tags.includes(t));
        if (!hasTag) return false;
      }
      return true;
    });
  }, [foods, filters]);

  // --- Handlers ---

  const handleRandomSelect = async () => {
    if (filteredFoods.length === 0) {
      alert("没有符合条件的食物，请调整筛选条件！");
      return;
    }

    setIsSpinning(true);
    setSelectedFood(null);
    setAiComment('');
    
    // Simple slot machine effect
    let duration = 100;
    const maxDuration = 800;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredFoods.length);
      setSelectedFood(filteredFoods[randomIndex]);
      duration += 50;
      if (duration > maxDuration) {
        clearInterval(interval);
        finalizeSelection(filteredFoods[randomIndex]);
      }
    }, 100);
  };

  const finalizeSelection = async (food: FoodItem) => {
    setIsSpinning(false);
    setSelectedFood(food);
    
    // Call AI
    setIsAiLoading(true);
    const comment = await getFoodRecommendationComment(food);
    setAiComment(comment);
    setIsAiLoading(false);
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleDeleteFood = (id: string) => {
    if (confirm('确定要删除这个美食记录吗？')) {
      setFoods(foods.filter(f => f.id !== id));
    }
  };

  const handleAddFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const priceLevel = Number(formData.get('priceLevel')) as PriceLevel;
    const category = formData.get('category') as string;
    
    const newItem: FoodItem = {
      id: Date.now().toString(),
      imageNo: 0, // Default or generic image logic
      name,
      location,
      priceLevel,
      tags: [category],
      rating: 4,
      postDate: new Date().toLocaleDateString()
    };

    setFoods([...foods, newItem]);
    setView('list');
  };

  // --- Render Helpers ---

  const renderDecider = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto px-4 pb-20">
      
      {/* Header Area */}
      <div className="text-center mb-8 pt-8">
         <h1 className="text-3xl font-bold text-gray-800 mb-2">今天吃什么？</h1>
         <p className="text-gray-500 text-sm">从 {filteredFoods.length} 个备选方案中选择</p>
      </div>

      {/* Main Card Display */}
      <div className="w-full mb-8 relative min-h-[400px]">
        {selectedFood ? (
          <FoodCard 
            food={selectedFood} 
            highlight={true} 
            aiComment={aiComment} 
            isAiLoading={isAiLoading}
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
             <Utensils className="w-16 h-16 text-gray-300 mb-4" />
             <p className="text-gray-400 font-medium">点击下方按钮开始随机</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <Button 
          onClick={handleRandomSelect} 
          disabled={isSpinning || filteredFoods.length === 0}
          fullWidth 
          size="lg"
          className="shadow-orange-500/40 py-6 text-xl"
        >
          {isSpinning ? (
            <span className="flex items-center"><RefreshCw className="animate-spin mr-2"/> 正在选择...</span>
          ) : (
            selectedFood ? "换一个试试" : "帮我决定！"
          )}
        </Button>

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          {showFilters ? "收起筛选" : "偏好设置"}
        </Button>
      </div>

      {/* Filter Panel (Slide down) */}
      {showFilters && (
        <div className="w-full bg-white mt-4 p-4 rounded-xl shadow-lg border border-gray-100 animate-fade-in-down">
          <div className="mb-4">
             <label className="text-xs font-bold text-gray-500 uppercase block mb-2">最高价位</label>
             <input 
               type="range" 
               min="1" 
               max="4" 
               value={filters.maxPrice}
               onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value) as PriceLevel})}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
             <div className="flex justify-between text-xs text-gray-400 mt-1">
               <span>¥</span>
               <span>¥¥</span>
               <span>¥¥¥</span>
               <span>¥¥¥¥</span>
             </div>
          </div>

          <div className="mb-4">
             <label className="text-xs font-bold text-gray-500 uppercase block mb-2">想吃什么类?</label>
             <div className="flex flex-wrap gap-2">
               {CATEGORIES.map(cat => (
                 <button
                   key={cat}
                   onClick={() => toggleTagFilter(cat)}
                   className={`px-3 py-1 rounded-full text-xs transition-colors ${
                     filters.tags.includes(cat) 
                     ? 'bg-orange-500 text-white' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderList = () => (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">美食清单 ({foods.length})</h2>
        <Button variant="secondary" size="sm" onClick={() => setView('add')}>
          <Plus className="w-4 h-4 mr-1" /> 添加
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {foods.map(food => (
          <div key={food.id} className="relative group">
            <FoodCard food={food} />
            <button 
              onClick={() => handleDeleteFood(food.id)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddForm = () => (
    <div className="w-full max-w-md mx-auto px-4 pt-8">
       <button onClick={() => setView('list')} className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
         <ArrowLeft className="w-4 h-4 mr-1" /> 返回列表
       </button>
       
       <h2 className="text-2xl font-bold text-gray-800 mb-6">添加新美食</h2>
       
       <form onSubmit={handleAddFood} className="space-y-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
           <input required name="name" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="例如：必胜客" />
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">位置/备注</label>
           <input required name="location" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="例如：环球中心 3楼" />
         </div>

         <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价位</label>
              <select name="priceLevel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="1">¥ (便宜)</option>
                <option value="2">¥¥ (适中)</option>
                <option value="3">¥¥¥ (较贵)</option>
                <option value="4">¥¥¥¥ (奢侈)</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主要分类</label>
              <select name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
         </div>

         <Button type="submit" fullWidth size="lg">保存</Button>
       </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* View Router */}
      {view === 'decider' && renderDecider()}
      {view === 'list' && renderList()}
      {view === 'add' && renderAddForm()}

      {/* Bottom Navigation */}
      {view !== 'add' && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50 safe-area-bottom">
          <button 
            onClick={() => setView('decider')}
            className={`flex flex-col items-center space-y-1 ${view === 'decider' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-xs font-medium">做决定</span>
          </button>
          
          <button 
            onClick={() => setView('list')}
            className={`flex flex-col items-center space-y-1 ${view === 'list' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <Utensils className="w-6 h-6" />
            <span className="text-xs font-medium">我的菜单</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

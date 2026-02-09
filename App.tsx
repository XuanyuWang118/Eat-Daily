import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FoodItem, PriceLevel, FilterState, CUISINE_CATEGORIES, SCENE_TAGS, LOCATIONS, CampusLocation, CANTEEN_OPTIONS } from './types';
import { INITIAL_FOODS } from './constants';
import { FoodCard } from './components/FoodCard';
import { Button } from './components/Button';
import { getFoodRecommendationComment } from './services/geminiService';
import { Utensils, Settings, Plus, Trash2, ArrowLeft, RefreshCw, Check, RotateCcw, Filter, Bike, Map, LayoutGrid, List as ListIcon, Image as ImageIcon, ImageOff, Shuffle } from 'lucide-react';

// Main App Component
const App: React.FC = () => {
  // State
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('myFoods');
    const loadedFoods = saved ? JSON.parse(saved) : INITIAL_FOODS;
    return loadedFoods;
  });
  
  const [view, setView] = useState<'decider' | 'list' | 'add'>('decider');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [aiComment, setAiComment] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // List View Display State
  const [isGridLayout, setIsGridLayout] = useState(false); // false = list (1 col), true = grid (2 col)
  const [showImages, setShowImages] = useState(true);
  const [shuffledFoods, setShuffledFoods] = useState<FoodItem[]>([]);

  // Expanded Filter State
  const [filters, setFilters] = useState<FilterState>({
    locations: [], 
    canteens: [], 
    priceLevels: [],
    onlyTakeout: false,
    categories: [],
    scenes: [],
  });

  // Save to local storage whenever foods change
  useEffect(() => {
    localStorage.setItem('myFoods', JSON.stringify(foods));
  }, [foods]);

  // Derived state: Complex Filter Logic
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      // 1. Takeout Mode (Priority 1)
      if (filters.onlyTakeout) {
        if (!food.tags.includes('外卖')) return false;
      } else {
        // 2. Location (Priority 2, only if not Takeout mode)
        if (filters.locations.length > 0) {
          if (!filters.locations.includes(food.campusLocation)) return false;

          // 3. Canteen (Priority 3, only if '校内' is selected)
          if (food.campusLocation === '校内' && filters.canteens.length > 0) {
             if (food.canteen && !filters.canteens.includes(food.canteen)) return false;
          }
        }
      }

      // 4. Price (OR logic)
      if (filters.priceLevels.length > 0) {
        if (!filters.priceLevels.includes(food.priceLevel)) return false;
      }
      
      // 5. Categories (OR logic)
      if (filters.categories.length > 0) {
        const hasCategory = food.tags.some(t => filters.categories.includes(t));
        if (!hasCategory) return false;
      }

      // 6. Scenes/Flavor (OR logic)
      if (filters.scenes.length > 0) {
        const hasScene = food.tags.some(t => filters.scenes.includes(t));
        if (!hasScene) return false;
      }

      return true;
    });
  }, [foods, filters]);

  // --- Shuffle Logic ---
  const shuffleList = useCallback(() => {
    const array = [...foods];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    setShuffledFoods(array);
  }, [foods]);

  // Initialize/Update shuffled list when foods change or when entering list view
  useEffect(() => {
    shuffleList();
  }, [shuffleList]);

  // Re-shuffle specifically when entering 'list' view to ensure randomness every time
  useEffect(() => {
    if (view === 'list') {
      shuffleList();
    }
  }, [view, shuffleList]);

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

  const toggleLocationFilter = (loc: CampusLocation) => {
    setFilters(prev => {
      const newLocations = prev.locations.includes(loc)
        ? prev.locations.filter(l => l !== loc)
        : [...prev.locations, loc];
      const shouldClearCanteens = !newLocations.includes('校内');
      return {
        ...prev,
        locations: newLocations,
        canteens: shouldClearCanteens ? [] : prev.canteens
      };
    });
  };

  const toggleCanteenFilter = (canteen: string) => {
    setFilters(prev => ({
      ...prev,
      canteens: prev.canteens.includes(canteen)
        ? prev.canteens.filter(c => c !== canteen)
        : [...prev.canteens, canteen]
    }));
  };

  const togglePriceFilter = (level: PriceLevel) => {
    setFilters(prev => ({
      ...prev,
      priceLevels: prev.priceLevels.includes(level)
        ? prev.priceLevels.filter(p => p !== level)
        : [...prev.priceLevels, level]
    }));
  };

  const toggleCategoryFilter = (cat: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const toggleSceneFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      scenes: prev.scenes.includes(tag) 
        ? prev.scenes.filter(t => t !== tag)
        : [...prev.scenes, tag]
    }));
  };

  const handleDeleteFood = (id: string) => {
    if (confirm('确定要删除这个美食记录吗？')) {
      setFoods(foods.filter(f => f.id !== id));
      // shuffling handled by useEffect dependency on foods
    }
  };

  const handleResetFilters = () => {
    setFilters({
      locations: [],
      canteens: [],
      priceLevels: [],
      onlyTakeout: false,
      categories: [],
      scenes: [],
    });
  };

  const handleAddFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const category = formData.get('category') as string;
    const campusLocation = formData.get('campusLocation') as CampusLocation;
    const canteen = formData.get('canteen') as string;
    const isTakeout = formData.get('isTakeout') === 'on';

    const newTags = [category];
    if (isTakeout) newTags.push('外卖');
    
    const newItem: FoodItem = {
      id: Date.now().toString(),
      imageNo: 0,
      name,
      location,
      campusLocation,
      canteen: campusLocation === '校内' ? canteen : undefined,
      priceLevel: PriceLevel.MODERATE, 
      tags: newTags,
      rating: 4,
      postDate: new Date().toLocaleDateString()
    };

    setFoods([...foods, newItem]);
    setView('list');
  };

  // --- Filter UI Components ---

  const renderFilterSection = (title: string, content: React.ReactNode, subtitle?: string) => (
    <div className="mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-gray-800 uppercase flex items-center">
           {title}
        </label>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
      {content}
    </div>
  );

  // --- Render Views ---

  const renderDecider = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto px-4 pb-20">
      
      {/* Header Area */}
      <div className="text-center mb-8 pt-8">
         <h1 className="text-3xl font-bold text-gray-800 mb-2">今天吃什么？</h1>
         <p className="text-gray-500 text-sm">
           当前选中 {filteredFoods.length} 个备选方案
         </p>
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
          className={`flex items-center justify-center ${showFilters ? 'bg-gray-100 border-gray-300' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "收起筛选" : "筛选 / 偏好设置"}
        </Button>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="w-full bg-white mt-4 p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in-down mb-10">
          
          {/* Level 1: Location & Mode */}
          {renderFilterSection("位置与方式", (
            <div className="flex flex-col gap-3">
               <button 
                  onClick={() => setFilters(prev => ({ ...prev, onlyTakeout: !prev.onlyTakeout }))}
                  className={`w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center border ${filters.onlyTakeout ? 'bg-yellow-500 border-yellow-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}
               >
                 <Bike className="w-4 h-4 mr-2" />
                 {filters.onlyTakeout ? "已开启：只看外卖 (忽略位置)" : "点个外卖？"}
               </button>

               <div className="flex gap-2">
                 {LOCATIONS.map(loc => {
                   const isSelected = filters.locations.includes(loc);
                   const isDisabled = filters.onlyTakeout; 
                   return (
                     <button 
                       key={loc} 
                       onClick={() => !isDisabled && toggleLocationFilter(loc)}
                       disabled={isDisabled}
                       className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border 
                         ${isDisabled ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed' : 
                           isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                     >
                       {loc}
                     </button>
                   );
                 })}
               </div>
            </div>
          ))}

          {/* Level 2: Canteens */}
          {!filters.onlyTakeout && filters.locations.includes('校内') && renderFilterSection("选择食堂", (
             <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
               <div className="flex flex-wrap gap-2">
                 {CANTEEN_OPTIONS.map(canteen => {
                   const isSelected = filters.canteens.includes(canteen);
                   return (
                     <button 
                       key={canteen} 
                       onClick={() => toggleCanteenFilter(canteen)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                         isSelected 
                           ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                           : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                       }`}
                     >
                       {canteen}
                     </button>
                   );
                 })}
               </div>
             </div>
          ), "可多选 (默认全部)")}

          {/* Price */}
          {renderFilterSection("预算区间", (
            <div className="flex gap-2">
              {[PriceLevel.CHEAP, PriceLevel.MODERATE, PriceLevel.EXPENSIVE].map(level => {
                 const isSelected = filters.priceLevels.includes(level);
                 const labels: Record<string, string> = {
                   [PriceLevel.CHEAP]: '¥20↓', 
                   [PriceLevel.MODERATE]: '¥20-60', 
                   [PriceLevel.EXPENSIVE]: '¥60+'
                 };
                 return (
                   <button key={level} onClick={() => togglePriceFilter(level)}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                     {labels[level]}
                   </button>
                 );
              })}
            </div>
          ))}

          {/* Categories */}
          {renderFilterSection("想吃什么？ (菜系)", (
            <div className="flex flex-wrap gap-2">
               {CUISINE_CATEGORIES.map(cat => {
                 const isSelected = filters.categories.includes(cat);
                 return (
                   <button key={cat} onClick={() => toggleCategoryFilter(cat)}
                     className={`px-3 py-1.5 rounded-full text-xs transition-all border ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                     {cat}
                   </button>
                 );
               })}
            </div>
          ), "多选")}

          {/* Scenes */}
          {renderFilterSection("场景 / 口味", (
            <div className="flex flex-wrap gap-2">
               {SCENE_TAGS.map(tag => {
                 if (tag === '外卖') return null;
                 const isSelected = filters.scenes.includes(tag);
                 return (
                   <button key={tag} onClick={() => toggleSceneFilter(tag)}
                     className={`px-3 py-1.5 rounded-full text-xs transition-all border ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                     {tag}
                   </button>
                 );
               })}
            </div>
          ), "多选")}

          <div className="pt-4 border-t border-gray-100">
             <button 
               onClick={handleResetFilters}
               className="w-full flex items-center justify-center py-3 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
             >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置筛选条件
             </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderList = () => (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">美食清单 ({shuffledFoods.length})</h2>
          <Button variant="secondary" size="sm" onClick={() => setView('add')}>
            <Plus className="w-4 h-4 mr-1" /> 添加
          </Button>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={shuffleList}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1.5" />
            随机打乱
          </button>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
            <button
              onClick={() => setIsGridLayout(false)}
              className={`p-1.5 rounded-lg transition-colors ${!isGridLayout ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
              title="单列视图"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridLayout(true)}
              className={`p-1.5 rounded-lg transition-colors ${isGridLayout ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
              title="双列视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
            <button
              onClick={() => setShowImages(!showImages)}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${!showImages ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {showImages ? <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> : <ImageOff className="w-3.5 h-3.5 mr-1.5" />}
              {showImages ? "显示图片" : "仅看文字"}
            </button>
          </div>
        </div>
      </div>

      {/* List Grid */}
      <div className={`grid gap-4 ${isGridLayout ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {shuffledFoods.map(food => (
          <div key={food.id} className="relative group h-full">
            <FoodCard food={food} showImage={showImages} />
            <button 
              onClick={() => handleDeleteFood(food.id)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-10"
              title="删除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const [addFormCampusLocation, setAddFormCampusLocation] = useState<CampusLocation>('校内');

  const renderAddForm = () => (
    <div className="w-full max-w-md mx-auto px-4 pt-8">
       <button onClick={() => setView('list')} className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
         <ArrowLeft className="w-4 h-4 mr-1" /> 返回列表
       </button>
       
       <h2 className="text-2xl font-bold text-gray-800 mb-6">添加新美食</h2>
       
       <form onSubmit={handleAddFood} className="space-y-6">
         {/* Form content remains same */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
           <input required name="name" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="例如：必胜客" />
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">位置/备注</label>
           <input required name="location" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="例如：环球中心 3楼" />
         </div>
         
         <div className="grid grid-cols-1 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">位置类型</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="campusLocation" 
                      value="校内" 
                      checked={addFormCampusLocation === '校内'}
                      onChange={() => setAddFormCampusLocation('校内')}
                      className="mr-2 accent-orange-500" 
                    />
                    校内
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="campusLocation" 
                      value="校外" 
                      checked={addFormCampusLocation === '校外'}
                      onChange={() => setAddFormCampusLocation('校外')}
                      className="mr-2 accent-orange-500" 
                    />
                    校外
                  </label>
                </div>
             </div>

             {addFormCampusLocation === '校内' && (
               <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择食堂</label>
                  <select name="canteen" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                    {CANTEEN_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
             )}

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">额外选项</label>
                 <label className="flex items-center mt-2">
                    <input type="checkbox" name="isTakeout" className="mr-2 accent-orange-500 w-4 h-4" />
                    支持外卖
                  </label>
             </div>
         </div>

         <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主要分类</label>
              <select name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                {CUISINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
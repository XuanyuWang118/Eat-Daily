import React, { useState } from 'react';
import { FoodItem } from '../types';
import { MapPin, Calendar, Tag, ExternalLink, Quote, ThumbsUp } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  highlight?: boolean;
  aiComment?: string;
  isAiLoading?: boolean;
  showImage?: boolean; // New prop to control image visibility
}

export const FoodCard: React.FC<FoodCardProps> = ({ 
  food, 
  highlight = false, 
  aiComment, 
  isAiLoading,
  showImage = true // Default to true
}) => {
  const [imgError, setImgError] = useState(false);

  // Update image path to use just the number: /images/101.jpg
  const imageSource = !imgError 
    ? `/images/${food.imageNo}.jpg` 
    : `https://picsum.photos/seed/${food.id}/800/600`; 

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl transition-all duration-500 h-full flex flex-col ${highlight ? 'shadow-2xl ring-4 ring-orange-400 scale-105 transform' : 'shadow-md border border-gray-100'}`}>
      {/* Image Section - Conditionally Rendered */}
      {showImage && (
        <div 
          className="relative w-full overflow-hidden group bg-gray-100 shrink-0"
          style={{ aspectRatio: '16 / 9' }}
        >
          <img 
            src={imageSource}
            alt={food.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          
          {food.originalUrl && (
            <a 
              href={food.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all flex items-center gap-1 text-xs px-3"
              title="去小红书看原文"
            >
               <ExternalLink className="w-3 h-3" /> 
               <span className="font-medium">小红书</span>
            </a>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-gray-900 leading-tight flex-1 mr-2 ${showImage ? 'text-xl' : 'text-lg'}`}>
            {food.name}
          </h3>
          <div className="text-right shrink-0">
             {food.specificPrice && (
                 <span className={`font-bold text-orange-600 ${showImage ? 'text-lg' : 'text-base'}`}>
                   {food.specificPrice}
                 </span>
             )}
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span className="font-medium text-gray-800 line-clamp-1">{food.location}</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span className="text-gray-500 scale-90 origin-left">{food.postDate}</span>
            </div>
            {food.recommendationIndex && (
                 <div className="flex items-center text-orange-600 text-[10px] font-bold bg-orange-100 px-1.5 py-0.5 rounded-md">
                     <ThumbsUp className="w-3 h-3 mr-1" /> {food.recommendationIndex}
                 </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Always show Campus Location Tag first */}
          <span className={`px-1.5 py-0.5 text-[10px] rounded-full flex items-center border ${food.campusLocation === '校内' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {food.campusLocation}
          </span>
          {food.canteen && (
             <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full flex items-center border border-blue-100">
               {food.canteen}
             </span>
          )}
          {food.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded-full flex items-center border border-orange-100">
              <Tag className="w-3 h-3 mr-0.5" /> {tag}
            </span>
          ))}
        </div>

        {/* Original Post Excerpt - Only show if images are shown or if explicitly desired, to save space in grid */}
        {food.originalPost && !aiComment && !isAiLoading && showImage && (
          <div className="mt-auto pt-2">
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 relative">
              <Quote className="w-3 h-3 text-gray-300 absolute top-1.5 left-1.5 transform -scale-x-100" />
              <p className="pl-4 italic line-clamp-2 leading-relaxed">
                {food.originalPost}
              </p>
            </div>
          </div>
        )}

        {/* AI Comment Section */}
        {(aiComment || isAiLoading) && (
          <div className="mt-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 transition-all duration-300">
             {/* ... content omitted for brevity, same as before ... */}
             <p className="text-xs text-gray-700 italic leading-relaxed whitespace-pre-line">
                {aiComment}
              </p>
          </div>
        )}
      </div>
    </div>
  );
};
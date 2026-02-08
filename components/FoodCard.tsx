import React, { useState } from 'react';
import { FoodItem, PriceLevel } from '../types';
import { MapPin, Calendar, DollarSign, Star, Tag, ExternalLink, Quote, ThumbsUp } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  highlight?: boolean;
  aiComment?: string;
  isAiLoading?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, highlight = false, aiComment, isAiLoading }) => {
  const [imgError, setImgError] = useState(false);

  // Update image path to use just the number: /images/101.jpg
  const imageSource = !imgError 
    ? `/images/${food.imageNo}.jpg` 
    : `https://picsum.photos/seed/${food.id}/400/300`;

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl transition-all duration-500 ${highlight ? 'shadow-2xl ring-4 ring-orange-400 scale-105 transform' : 'shadow-md border border-gray-100'}`}>
      <div className="relative h-48 w-full overflow-hidden group">
        <img 
          src={imageSource}
          alt={food.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center shadow-sm">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="text-sm font-bold text-gray-800">{food.rating}</span>
        </div>
        
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

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{food.name}</h3>
          <div className="flex text-orange-500">
            {[...Array(4)].map((_, i) => (
              <DollarSign 
                key={i} 
                className={`w-4 h-4 ${i < food.priceLevel ? 'fill-orange-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-800">{food.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-500">发布于 {food.postDate}</span>
            </div>
            {food.recommendationIndex && (
                 <div className="flex items-center text-orange-600 text-xs font-bold bg-orange-100 px-2 py-1 rounded-md">
                     <ThumbsUp className="w-3 h-3 mr-1" /> 推荐指数 {food.recommendationIndex}
                 </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {food.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full flex items-center">
              <Tag className="w-3 h-3 mr-1" /> {tag}
            </span>
          ))}
        </div>

        {/* Original Post Excerpt (if available) - Hidden if AI comment is showing */}
        {food.originalPost && !aiComment && !isAiLoading && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 relative">
            <Quote className="w-4 h-4 text-gray-300 absolute top-2 left-2 transform -scale-x-100" />
            <p className="pl-6 italic line-clamp-3 leading-relaxed">
              {food.originalPost}
            </p>
          </div>
        )}

        {(aiComment || isAiLoading) && (
          <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 transition-all duration-300">
            <div className="flex items-center mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                AI 推荐理由
              </span>
            </div>
            {isAiLoading ? (
               <div className="animate-pulse flex space-x-4">
                 <div className="flex-1 space-y-2 py-1">
                   <div className="h-2 bg-indigo-200 rounded"></div>
                   <div className="h-2 bg-indigo-200 rounded w-5/6"></div>
                 </div>
               </div>
            ) : (
              <p className="text-sm text-gray-700 italic leading-relaxed whitespace-pre-line">
                {aiComment}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

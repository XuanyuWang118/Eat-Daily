import { FoodItem } from '../types';

// Using the API Key provided by the user. 
// In a production environment, this should be in process.env.API_KEY
const ALIYUN_API_KEY = 'sk-cfb43f4acda246de907779261df8f103'; 
const ALIYUN_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export const getFoodRecommendationComment = async (food: FoodItem): Promise<string> => {
  try {
    const prompt = `
      我刚刚随机选择了一家餐厅作为今天的饭点。
      
      美食信息:
      名称: ${food.name}
      地点: ${food.location}
      类别: ${food.tags.join(', ')}
      博主原始评价: "${food.originalPost}"

      请按照以下结构生成一段推荐语（60字以内）：
      1. 第一句：直接引用博主评价中最诱人的一句（保留原汁原味）。
      2. 第二句：以你的口吻，结合食物特点进行幽默、热情的补充推荐，确认这个选择很棒。
      
      要求：
      - 用中文回答。
      - 必须引用原文。
      - 语气自然朋友化。
    `;

    const response = await fetch(ALIYUN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIYUN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-plus-2025-12-01",
        messages: [
          {
            role: "system",
            content: "你是一个热情、幽默的美食点评家。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Aliyun API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || food.originalPost || "这家店看起来不错，快去试试吧！";

  } catch (error) {
    console.error("AI API Error:", error);
    // On error, strictly return the original post content as requested
    return food.originalPost || "系统繁忙，建议直接尝试！"; 
  }
};

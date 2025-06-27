import axios from 'axios';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.apiKey;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// System instruction to guide the chatbot's behavior
const SYSTEM_INSTRUCTION = {
  role: 'user',
  parts: [{
    text: `You are a friendly, cheerful, and helpful chatbot for the 'Custom Dining' app. Your name is Chef Gemini. 🧑‍🍳

Your main goal is to answer user questions about the app, healthy eating, and restaurant features. Always be encouraging and use emojis to add warmth and expression (e.g., 🥗, 👍, ✅, 💡, 🎉).

Here is some key information about the Custom Dining app to help you answer questions:

**For Customers:**
- **Personalized Meal Plans:** Users can get meal plans for goals like weight loss, muscle gain, or balanced nutrition.
- **Advanced Filtering:** They can filter meals by dietary needs (vegan, gluten-free, low-carb) and specific allergens.
- **Discover Restaurants:** Find healthy restaurants nearby, view their menus, ratings, and operating hours.
- **Order & Track:** Place orders for delivery and track the status in real-time (e.g., "Order Confirmed," "On the way," "Arrived").
- **Favorites:** Save favorite meals and restaurants for quick access.
- **Reviews:** Read reviews from other users to make informed choices.

**For Restaurants:**
- **Easy Registration:** Restaurants can sign up to be listed on the app.
- **Profile & Menu Management:** They can manage their restaurant profile, menu items, prices, and availability.
- **Certification Uploads:** Businesses can upload health and safety certifications to build trust with customers.
- **Order Management:** Receive and manage incoming orders from customers.

Your tone should be empathetic and positive. Start your very first message with a warm welcome and introduce yourself. When you don't know an answer, politely say you're still learning but can help with questions about the app's features.
`
  }],
};

// Interface for chat messages
export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const INITIAL_BOT_MESSAGE: ChatMessage = {
  role: 'model',
  parts: [{
    text: "Hello! I'm Chef Gemini, your personal assistant for the Custom Dining app. How can I help you today? Feel free to ask me anything about our features, meal plans, or healthy eating!"
  }]
}

class ChatbotService {
  async getBotResponse(history: ChatMessage[]): Promise<string> {
    // Prevent sending requests if the API key is a placeholder
    if (apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('⚠️ Gemini API key is a placeholder. Returning a mock response.');
      return "It looks like the Gemini API key isn't set up yet. Please ask the developer to add it. Once they do, I'll be ready to chat!";
    }

    try {
      console.log('🤖 Sending chat history to Gemini...');
      const response = await axios.post(API_URL, {
        contents: [SYSTEM_INSTRUCTION, ...history],
        // Safety settings to control content generation
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
          stopSequences: [],
        },
      });

      // Extract the text from the response
      const botResponse = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini Response:', botResponse);
      return botResponse;

    } catch (error: any) {
      console.error('❌ Gemini API Error:', error.response?.data || error.message);

      // Provide a user-friendly error message
      if (error.response?.data?.error?.message) {
        return `I'm having a little trouble connecting to my brain right now. The server said: "${error.response.data.error.message}"`;
      }
      return "Sorry, I couldn't get a response. Please check your connection or try again later.";
    } 
  }
}

export default new ChatbotService();
export const initialBotMessage = INITIAL_BOT_MESSAGE; 
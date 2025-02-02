import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './WeatherChat.module.css';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const WeatherChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const { currentWeather } = useSelector((state: RootState) => state.weather);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (question: string): string => {
    if (!currentWeather) return "I'm waiting for weather data to assist you.";
    
    const temp = currentWeather.main.temp;
    const condition = currentWeather.weather[0].main.toLowerCase();
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    
    // Convert question to lowercase for easier matching
    question = question.toLowerCase();

    if (question.includes('umbrella')) {
      return condition.includes('rain') 
        ? "Yes, you should definitely take an umbrella today! It's raining."
        : "No need for an umbrella today, the weather is " + condition;
    }

    if (question.includes('rain') || question.includes('raining')) {
      return condition.includes('rain')
        ? "Yes, it's raining right now. Don't forget your umbrella!"
        : "No rain at the moment. The weather is " + condition;
    }

    if (question.includes('temperature') || question.includes('hot') || question.includes('cold')) {
      return `The temperature is ${temp}°C. ${
        temp > 30 ? "It's very hot!" :
        temp > 20 ? "It's pleasantly warm." :
        temp > 10 ? "It's mild." :
        "It's quite cold!"
      }`;
    }

    if (question.includes('travel') || question.includes('trip') || question.includes('drive')) {
      if (condition.includes('rain')) {
        return "Drive carefully! Roads might be wet. Reduce speed and maintain safe distance.";
      }
      if (windSpeed > 10) {
        return "Strong winds today. Be cautious while driving.";
      }
      return "Weather conditions are good for traveling!";
    }

    if (question.includes('wear') || question.includes('clothes') || question.includes('clothing')) {
      if (temp > 30) return "Wear light, breathable clothing. Don't forget sunscreen!";
      if (temp > 20) return "Perfect for light clothing like t-shirts and shorts.";
      if (temp > 10) return "Bring a light jacket or sweater.";
      return "Dress warmly! You'll need winter clothing.";
    }

    if (question.includes('outdoor') || question.includes('outside') || question.includes('activity')) {
      if (condition.includes('rain')) {
        return "Indoor activities recommended due to rain. Maybe visit a museum or cafe?";
      }
      if (temp > 20 && condition.includes('clear')) {
        return "Perfect weather for outdoor activities! Great time for parks or sports.";
      }
      return `Current conditions are ${condition}. ${
        temp > 15 ? "Should be okay for outdoor activities!" : "Might be a bit cold for outdoor activities."
      }`;
    }

    return `Currently in ${currentWeather.name}, it's ${temp}°C with ${condition} conditions. 
            How can I help you plan your day?`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse = generateResponse(input);
    const botMessage: ChatMessage = {
      text: botResponse,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    speak(botResponse);
    setInput('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <span className={styles.botIcon}>🤖</span>
        <h3>Weather Assistant</h3>
        {isSpeaking && <span className={styles.speakingIndicator}>Speaking...</span>}
      </div>

      <div className={styles.chatMessages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
          >
            <span className={styles.messageIcon}>{message.isBot ? '🤖' : '👤'}</span>
            <div className={styles.messageContent}>
              <p>{message.text}</p>
              <small>{message.timestamp.toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.chatInput}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about weather, clothing, travel, or activities..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendButton}>
          Send <span>📤</span>
        </button>
      </form>
    </div>
  );
};

export default WeatherChat; 
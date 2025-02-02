import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './WeatherAI.module.css';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'weather' | 'clothing' | 'activity' | 'health' | 'travel';
  icon?: string;
}

const WeatherAI: React.FC = () => {
  const { currentWeather } = useSelector((state: RootState) => state.weather);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const convertTemp = (temp: number) => {
    if (isCelsius) return temp;
    return (temp * 9/5) + 32;
  };

  const speak = useCallback((text: string) => {
    // Check if browser supports speech synthesis
    if (!window.speechSynthesis) {
      console.log('Speech synthesis not supported in this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateResponse = (question: string): ChatMessage => {
    if (!currentWeather) return {
      text: "I'm waiting for weather data to assist you.",
      isBot: true,
      timestamp: new Date(),
      icon: '⏳'
    };

    const temp = currentWeather.main.temp;
    const condition = currentWeather.weather[0].main.toLowerCase();
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    const feelsLike = currentWeather.main.feels_like;
    const cityName = currentWeather.name;
    
    question = question.toLowerCase();

    // Enhanced temperature response
    if (question.includes('temperature') || question.includes('how hot') || question.includes('how cold')) {
      let response = `🌡️ Temperature Report for ${cityName}:\n\n`;
      response += `Current Temperature: ${temp}°C\n`;
      response += `Feels Like: ${feelsLike}°C\n`;
      response += `Humidity: ${humidity}%\n\n`;

      response += `Temperature Analysis:\n`;
      if (temp > 35) {
        response += `- Extremely hot conditions\n`;
        response += `- Heat advisory in effect\n`;
        response += `- Stay hydrated and avoid direct sun\n`;
      } else if (temp > 30) {
        response += `- Very warm conditions\n`;
        response += `- Use sun protection\n`;
        response += `- Stay hydrated\n`;
      } else if (temp > 25) {
        response += `- Warm and comfortable\n`;
        response += `- Perfect for outdoor activities\n`;
      } else if (temp > 20) {
        response += `- Pleasant temperature\n`;
        response += `- Ideal for most activities\n`;
      } else if (temp > 15) {
        response += `- Mild conditions\n`;
        response += `- Light jacket recommended\n`;
      } else if (temp > 10) {
        response += `- Cool weather\n`;
        response += `- Jacket needed\n`;
      } else {
        response += `- Cold conditions\n`;
        response += `- Bundle up warmly\n`;
      }

      if (Math.abs(temp - feelsLike) > 3) {
        response += `\nNote: Due to humidity and wind, it feels ${feelsLike > temp ? 'warmer' : 'cooler'} than actual temperature`;
      }

      return {
        text: response,
        isBot: true,
        timestamp: new Date(),
        type: 'weather',
        icon: '🌡️'
      };
    }

    // Enhanced umbrella response
    if (question.includes('umbrella') || question.includes('rain')) {
      let response = `☔ Umbrella Advisory for ${cityName}:\n\n`;
      response += `Current Conditions: ${currentWeather.weather[0].description}\n`;
      response += `Temperature: ${temp}°C\n\n`;

      if (condition.includes('rain')) {
        response += `Current Status: Raining\n\n`;
        response += `Recommendations:\n`;
        response += `- Yes, definitely take an umbrella!\n`;
        response += `- Also recommended:\n`;
        response += `  • Waterproof jacket\n`;
        response += `  • Water-resistant footwear\n`;
        response += `  • Avoid carrying electronics exposed\n`;
        if (windSpeed > 5) {
          response += `\nCaution: Windy conditions (${windSpeed}m/s)\n`;
          response += `- Use a sturdy umbrella\n`;
          response += `- Be careful in open areas\n`;
        }
      } else if (condition.includes('clouds')) {
        response += `Current Status: Cloudy\n\n`;
        response += `Recommendations:\n`;
        response += `- Take an umbrella as precaution\n`;
        response += `- Chance of unexpected rain\n`;
        response += `- Keep it handy but not urgent\n`;
      } else {
        response += `Current Status: Clear\n\n`;
        response += `Recommendations:\n`;
        response += `- No umbrella needed\n`;
        response += `- Clear conditions expected\n`;
        response += `- Consider sunscreen instead!\n`;
      }

      return {
        text: response,
        isBot: true,
        timestamp: new Date(),
        type: 'weather',
        icon: '☔'
      };
    }

    // Enhanced clothing advice
    if (question.includes('wear') || question.includes('clothes') || question.includes('clothing')) {
      let response = `👔 Clothing Recommendations for ${cityName}:\n\n`;
      response += `Current Conditions:\n`;
      response += `- Temperature: ${temp}°C\n`;
      response += `- Weather: ${currentWeather.weather[0].description}\n`;
      response += `- Humidity: ${humidity}%\n\n`;

      response += `Recommended Clothing:\n`;
      if (temp > 30) {
        response += `- Light, breathable clothing\n`;
        response += `- Short sleeves recommended\n`;
        response += `- Light colors preferred\n`;
        response += `- Sun hat or cap\n`;
        response += `- Sunglasses\n\n`;
        response += `Essential: Apply sunscreen!\n`;
      } else if (temp > 25) {
        response += `- Light clothing\n`;
        response += `- T-shirt and shorts/light pants\n`;
        response += `- Light jacket for evening\n`;
        response += `- Sun protection recommended\n`;
      } else if (temp > 20) {
        response += `- Comfortable clothing\n`;
        response += `- Light long sleeves option\n`;
        response += `- Regular pants\n`;
        response += `- Light jacket might be needed\n`;
      } else if (temp > 15) {
        response += `- Light layers recommended\n`;
        response += `- Long sleeves\n`;
        response += `- Light jacket or sweater\n`;
        response += `- Regular pants\n`;
      } else {
        response += `- Warm clothing needed\n`;
        response += `- Multiple layers\n`;
        response += `- Warm jacket\n`;
        response += `- Long pants\n`;
        response += `- Consider scarf and gloves\n`;
      }

      if (condition.includes('rain')) {
        response += `\nRain Protection:\n`;
        response += `- Waterproof jacket\n`;
        response += `- Water-resistant shoes\n`;
        response += `- Umbrella recommended\n`;
      }

      if (humidity > 70) {
        response += `\nHigh Humidity Note:\n`;
        response += `- Choose moisture-wicking fabrics\n`;
        response += `- Avoid heavy materials\n`;
      }

      return {
        text: response,
        isBot: true,
        timestamp: new Date(),
        type: 'clothing',
        icon: '👔'
      };
    }

    // Enhanced outdoor activities response
    if (question.includes('outdoor') || question.includes('outside') || question.includes('activities')) {
      let response = `In ${cityName}, with current temperature of ${temp}°C and ${condition} conditions:\n\n`;
      
      if (condition.includes('clouds')) {
        response += `☁️ Cloudy Weather Alert!\n`;
        response += `- Generally suitable for outdoor activities\n`;
        response += `- Temperature is comfortable at ${temp}°C\n\n`;
        
        response += `Recommendations:\n`;
        response += `- Take an umbrella as precaution (clouds might bring unexpected rain)\n`;
        response += `- Ideal for:\n`;
        response += `  • Walking or jogging\n`;
        response += `  • Park visits\n`;
        response += `  • Sports activities\n`;
        response += `  • Photography (diffused light is great!)\n\n`;
        
        response += `Safety Tips:\n`;
        response += `- Check weather updates regularly\n`;
        response += `- Keep water for hydration\n`;
        response += `- Carry a light jacket\n`;
        
        if (humidity > 70) {
          response += `\n💧 High Humidity Alert (${humidity}%):\n`;
          response += `- Take frequent breaks\n`;
          response += `- Stay hydrated\n`;
          response += `- Wear moisture-wicking clothes\n`;
        }

        if (windSpeed > 8) {
          response += `\n💨 Wind Speed Alert (${windSpeed}m/s):\n`;
          response += `- Be careful with wind-sensitive equipment\n`;
          response += `- Secure loose items\n`;
        }

        response += `\nTime-based Recommendation:\n`;
        const hour = new Date().getHours();
        if (hour > 6 && hour < 10) {
          response += `- Morning time: Perfect for jogging or exercise\n`;
        } else if (hour > 10 && hour < 16) {
          response += `- Mid-day: Good for general outdoor activities\n`;
        } else if (hour > 16 && hour < 19) {
          response += `- Evening: Ideal for sports or park visits\n`;
        } else {
          response += `- Night time: Limited visibility, indoor activities recommended\n`;
        }
      } 
      else if (condition.includes('rain')) {
        response += `🌧️ It's currently raining!\n`;
        response += `- Outdoor activities not recommended\n`;
        response += `- You'll need an umbrella if you must go out\n`;
        response += `- Consider indoor alternatives like museums or cafes\n`;
        response += `\nTip: Wait for the rain to stop for better outdoor conditions.`;
      } 
      else if (condition.includes('snow')) {
        response += `❄️ It's snowing!\n`;
        response += `- Winter outdoor activities possible (skiing, snowboarding)\n`;
        response += `- Dress very warmly\n`;
        response += `- Be careful of slippery conditions`;
      }
      else if (temp < 10) {
        response += `🥶 It's quite cold!\n`;
        response += `- Limited outdoor activities recommended\n`;
        response += `- If going out, wear warm layers\n`;
        response += `- Short duration activities only\n`;
        response += `- Consider indoor alternatives`;
      }
      else if (temp > 35) {
        response += `🌡️ It's very hot!\n`;
        response += `- Outdoor activities not recommended during peak hours\n`;
        response += `- Risk of heat exhaustion\n`;
        response += `- If necessary, limit to early morning or evening\n`;
        response += `- Stay hydrated and seek shade frequently`;
      }
      else if (temp >= 20 && temp <= 30 && (condition.includes('clear') || condition.includes('sun'))) {
        response += `☀️ Perfect weather for outdoor activities!\n`;
        response += `- Great for parks, sports, or hiking\n`;
        response += `- Don't forget sunscreen\n`;
        response += `- Bring water to stay hydrated\n`;
        response += `- Enjoy the beautiful weather!`;
      }
      else if (temp >= 10 && temp < 20) {
        response += `🌥️ Moderate temperature, suitable for outdoor activities\n`;
        response += `- Good for walking, jogging, or cycling\n`;
        response += `- Wear appropriate layers\n`;
        response += `- Most outdoor activities are possible\n`;
        response += `- Comfortable conditions for exercise`;
      }

      if (windSpeed > 10) {
        response += `\n\nNote: Strong winds present. Be careful with wind-sensitive activities.`;
      }

      return {
        text: response,
        isBot: true,
        timestamp: new Date(),
        type: 'activity',
        icon: '🎯'
      };
    }

    // Health tips
    if (question.includes('health') || question.includes('exercise') || question.includes('workout')) {
      let tips = [];
      if (temp > 30) tips.push("Stay hydrated!");
      if (humidity > 70) tips.push("Take breaks during exercise due to high humidity.");
      if (condition.includes('rain')) tips.push("Indoor exercise recommended.");
      
      return {
        text: tips.join('\n') || "Weather conditions are good for exercise.",
        isBot: true,
        timestamp: new Date(),
        type: 'health',
        icon: '💪'
      };
    }

    // Travel conditions
    if (question.includes('travel') || question.includes('drive') || question.includes('commute')) {
      let travel = '';
      if (windSpeed > 10) {
        travel = "Strong winds - drive carefully.";
      } else if (condition.includes('rain')) {
        travel = "Wet roads - reduce speed.";
      } else {
        travel = "Good conditions for travel.";
      }
      return {
        text: travel,
        isBot: true,
        timestamp: new Date(),
        type: 'travel',
        icon: '🚗'
      };
    }

    // Default response with current conditions
    return {
      text: `Current weather in ${cityName}:
Temperature: ${temp}°C
Conditions: ${currentWeather.weather[0].description}
Humidity: ${humidity}%
Wind Speed: ${windSpeed} m/s

How else can I help you?`,
      isBot: true,
      timestamp: new Date(),
      type: 'weather',
      icon: '🤖'
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      text: input,
      isBot: false,
      timestamp: new Date(),
      icon: '👤'
    };

    const botResponse = generateResponse(input);
    setMessages(prev => [...prev, userMessage, botResponse]);
    speak(botResponse.text);
    setInput('');
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial greeting with ZEPHYR branding
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentWeather) {
      const greeting = {
        text: `Hello! I'm ZEPHYR 🌟, your Intelligent Weather Assistant.
              Currently monitoring weather in ${currentWeather.name}.
              I can help you with:
              🌡️ Weather conditions
              👔 Clothing recommendations
              🎯 Activity suggestions
              🚗 Travel advice
              ☔ Umbrella needs
              
              How may I assist you today?`,
        isBot: true,
        timestamp: new Date(),
        icon: '🤖'
      };
      setMessages([greeting]);
      speak(greeting.text);
    }
  }, [currentWeather]);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return '🌧️ Rainy';
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️ Sunny';
    if (lowerCondition.includes('cloud')) return '☁️ Cloudy';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️ Foggy';
    if (lowerCondition.includes('snow')) return '❄️ Snowy';
    if (lowerCondition.includes('thunder')) return '⛈️ Stormy';
    if (lowerCondition.includes('smoke')) return '🌫️ Smoky';
    return '🌤️ Sunny';
  };

  const getWeatherGuide = (isMetric: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const temp = currentWeather?.main.temp || 0;
    const region = currentWeather?.name || '';
    
    // Customize ranges based on location and current conditions
    if (region.includes('Mumbai') || region.includes('Chennai') || region.includes('Delhi')) {
      return (
        <div className={styles.weatherIcons}>
          Hot: ☀️ {isMetric ? '30-40°C' : '86-104°F'}<br/>
          Warm: 🌤️ {isMetric ? '25-30°C' : '77-86°F'}<br/>
          Pleasant: ☁️ {isMetric ? '20-25°C' : '68-77°F'}<br/>
          Cool: 🌥️ {isMetric ? '15-20°C' : '59-68°F'}<br/>
          Rainy: 🌧️ {isMetric ? '22-28°C' : '72-82°F'}<br/>
          Foggy/Smoky: 🌫️ {isMetric ? '10-25°C' : '50-77°F'}
        </div>
      );
    } else {
      return (
        <div className={styles.weatherIcons}>
          Summer: ☀️ {isMetric ? '25-35°C' : '77-95°F'}<br/>
          Spring: 🌤️ {isMetric ? '15-25°C' : '59-77°F'}<br/>
          Autumn: 🍂 {isMetric ? '10-20°C' : '50-68°F'}<br/>
          Winter: ❄️ {isMetric ? '-5-10°C' : '23-50°F'}<br/>
          Rainy: 🌧️ {isMetric ? '15-25°C' : '59-77°F'}<br/>
          Stormy: ⛈️ {isMetric ? '15-30°C' : '59-86°F'}
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.aiContainer}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitle}>
            <span className={styles.aiIcon}>🤖</span>
            <h2>ZEPHYR - Weather Intelligence</h2>
            {isSpeaking && <span className={styles.speakingIndicator}>Speaking...</span>}
          </div>
        </div>

        <div className={styles.weatherInfo}>
          {currentWeather && (
            <div className={styles.currentWeather}>
              <h2 className={styles.city}>{currentWeather.name}</h2>
              <div className={styles.temperature}>
                {convertTemp(currentWeather.main.temp).toFixed(1)}°
                <button 
                  className={styles.unitToggle}
                  onClick={() => setIsCelsius(!isCelsius)}
                >
                  {isCelsius ? 'C' : 'F'}
                </button>
              </div>
              <div className={styles.description}>
                {getWeatherIcon(currentWeather.weather[0].main)}
              </div>
              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Humidity</div>
                  <div className={styles.detailValue}>
                    💧 {currentWeather.main.humidity}%
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Wind Speed</div>
                  <div className={styles.detailValue}>
                    💨 {currentWeather.wind.speed} m/s
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Current</div>
                  <div className={styles.detailValue}>
                    {getWeatherIcon(currentWeather.weather[0].main)}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Local Weather Guide</div>
                  <div className={styles.detailValue}>
                    {getWeatherGuide(isCelsius)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.chatSection}>
          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
              >
                <span className={styles.messageIcon}>{message.icon}</span>
                <div className={`${styles.messageContent} ${message.type ? styles[message.type] : ''}`}>
                  <pre>{message.text}</pre>
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
              placeholder="Ask me about weather, clothing, activities, or travel..."
              className={styles.input}
            />
            <button type="submit" className={styles.sendButton}>
              Ask <span>🎯</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeatherAI; 
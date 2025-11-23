
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles, Tag } from 'lucide-react';
import { BotConfig, Message } from '../types';
import { getAssetUrl } from '../services/directus';

const DIRECTUS_URL = process.env.DIRECTUS_CRM_URL;

const ChatWidget: React.FC = () => {
  const [config, setConfig] = useState<Partial<BotConfig>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2)}`);

  // Simple markdown to HTML parser for AI responses
  const markdownToHtml = (text: string): string => {
    // Process bold first as it's inline and simpler
    const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const lines = boldedText.split('\n');
    
    // Check for standard markdown list (multi-line)
    const isStandardList = lines.length > 1 && lines.some(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
    if (isStandardList) {
        let html = '';
        let inList = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${trimmed.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed) {
                    html += `<p>${trimmed}</p>`;
                }
            }
        }
        if (inList) html += '</ul>';
        return html;
    }

    // Check for special inline list format (e.g., "text... * item 1 * item 2")
    const inlineParts = boldedText.split(/\s\*\s/);
    if (inlineParts.length > 1) {
        let html = `<p>${inlineParts[0]}</p><ul>`;
        for (let i = 1; i < inlineParts.length; i++) {
            html += `<li>${inlineParts[i]}</li>`;
        }
        html += '</ul>';
        return html;
    }

    // Fallback: just paragraphs for newlines
    return lines.filter(line => line.trim()).map(line => `<p>${line}</p>`).join('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const botId = params.get('id');

    if (!botId) {
      setError("Bot ID is missing.");
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const publicFields = [
          'chatbot_name', 'chabot_title', 'chatbot_welcome', 'chatbot_logo', 
          'chatbot_color', 'chatbot_input', 'chatbot_suggestion', 'chatbot_active', 'chatbot_webhook'
        ].join(',');
        
        const response = await fetch(`${DIRECTUS_URL}/items/chatbot/${botId}?fields=${publicFields}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const { data } = await response.json();
        
        const fetchedConfig: Partial<BotConfig> = {
          name: data.chatbot_name,
          description: data.chabot_title,
          welcomeMessage: data.chatbot_welcome,
          logoUrl: data.chatbot_logo ? getAssetUrl(data.chatbot_logo) : undefined,
          primaryColor: data.chatbot_color,
          chatInputPlaceholder: data.chatbot_input,
          suggestions: data.chatbot_suggestion,
          isActive: data.chatbot_active,
          n8nWebhookUrl: data.chatbot_webhook,
        };

        setConfig(fetchedConfig);
        
        // Set root variable for primary color for the launcher button
        if(fetchedConfig.primaryColor) {
           window.parent.document.documentElement.style.setProperty('--chatbot-primary-color', fetchedConfig.primaryColor);
        }

        if (fetchedConfig.welcomeMessage) {
          setMessages([{
            id: 'welcome', role: 'model', text: fetchedConfig.welcomeMessage, timestamp: Date.now()
          }]);
        }

      } catch (err) {
        console.error(err);
        setError("Could not load bot configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading || !config.n8nWebhookUrl) return;

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(config.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          chatInput: textToSend,
          action: 'chat'
        })
      });

      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      
      // --- Robustly extract text from potential N8N response structures ---
      function extractTextFromN8N(responseData: any): string | null {
          if (!responseData) return null;

          if (typeof responseData === 'string') {
              try {
                  responseData = JSON.parse(responseData);
              } catch (e) {
                  return responseData;
              }
          }
          
          const findText = (d: any): string | null => {
              if (!d) return null;
              if (typeof d === 'string') return d;
              if (typeof d !== 'object') return null;

              const keys = ['text', 'output', 'answer', 'message'];
              for (const key of keys) {
                  if (typeof d[key] === 'string' && d[key].trim() !== '') {
                      return d[key];
                  }
              }
              
              if (d.json) {
                  const nestedText = findText(d.json);
                  if (nestedText) return nestedText;
              }

              return null;
          }

          if (Array.isArray(responseData) && responseData.length > 0) {
              const text = findText(responseData[0]);
              if (text) return text;
          }

          if (typeof responseData === 'object' && !Array.isArray(responseData)) {
              const text = findText(responseData);
              if (text) return text;
          }

          return null;
      }
      
      const responseText = extractTextFromN8N(data) || "پاسخ معتبری از سرور دریافت نشد. لطفا ساختار JSON خروجی وب‌هوک را بررسی کنید.";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error("Error sending message:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'model', text: "خطا در ارتباط با سرور. لطفا از صحت آدرس وب‌هوک و تنظیمات CORS اطمینان حاصل کنید.", timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    if (config.welcomeMessage) {
        setMessages([{
        id: 'welcome_restart', role: 'model', text: config.welcomeMessage, timestamp: Date.now()
        }]);
    } else {
        setMessages([]);
    }
  };
  
  if (loading) {
     return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>;
  }
  
  if (error) {
     return <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-t-[1.5rem] flex flex-col h-full w-full max-w-sm mx-auto relative font-vazir" dir="rtl">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between text-white rounded-t-[1.5rem]"
        style={{ backgroundColor: config.primaryColor || '#3b82f6' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm overflow-hidden">
             {config.logoUrl ? <img src={config.logoUrl} alt="Bot" className="w-full h-full object-cover" /> : <Bot size={20}/>}
          </div>
          <div>
            <h3 className="font-bold text-sm">{config.name || 'Chatbot'}</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${config.isActive !== false ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {config.isActive !== false ? 'آنلاین' : 'آفلاین'}
            </p>
          </div>
        </div>
        <button onClick={handleRestart} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="شروع مجدد">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-widget`}
            style={{ animationDelay: `${index * 50}ms`}}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs
              ${msg.role === 'user' ? 'bg-gray-400' : ''}`}
              style={msg.role === 'model' ? { backgroundColor: config.primaryColor } : {}}
            >
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100' 
                  : 'text-white rounded-br-none chat-content'
                }`}
              style={msg.role === 'model' ? { backgroundColor: config.primaryColor } : {}}
            >
              {msg.role === 'model' ? (
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && messages.length > 0 && (
          <div className="flex items-end gap-2">
             <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: config.primaryColor }}>
                <Bot size={14} />
             </div>
             <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-br-none shadow-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips & Input */}
      <div className="bg-white border-t border-gray-100">
        {config.suggestions && config.suggestions.length > 0 && messages.length <= 1 && (
           <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth: 'none'}}>
              {config.suggestions.map((suggestion, idx) => (
                  <button
                     key={idx}
                     onClick={() => handleSend(suggestion)}
                     disabled={loading}
                     className="flex-shrink-0 text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 px-3 py-1.5 rounded-full transition-all border border-gray-200 whitespace-nowrap flex items-center gap-1 group"
                  >
                      <Tag size={10} className="text-gray-400 group-hover:text-blue-400" />
                      {suggestion}
                  </button>
              ))}
           </div>
        )}

        <div className="p-4">
            <div className="relative flex items-center">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={config.chatInputPlaceholder || "پیام خود را بنویسید..."}
                disabled={config.isActive === false}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pr-4 pl-12 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || config.isActive === false}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20"
                style={{ backgroundColor: config.primaryColor }}
            >
                <Send size={16} className={loading ? 'opacity-0' : 'rtl:rotate-180'} />
                {loading && <Sparkles size={16} className="absolute top-2 left-2 animate-spin" />}
            </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">قدرت گرفته از IR48</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
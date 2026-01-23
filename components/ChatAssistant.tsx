import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { getStormHistory } from '../services/stormService';

interface Message {
  role: 'user' | 'model';
  text: string;
  isStormResult?: boolean;
}

interface ChatAssistantProps {
  onNavigate?: (view: string) => void;
}

const SUGGESTIONS = [
  "Check my storm history",
  "Explain my insurance policy",
  "How much does a repair cost?",
  "Is moss dangerous for roofs?"
];

// Local Markdown helper to avoid dependency issues
const MarkdownDisplay = ({ text }: { text: string }) => {
  return (
    <div className="prose prose-sm prose-slate max-w-none">
      {text.split('\n').map((line, i) => (
        <p key={i} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-gray-900 mt-4' : 'text-gray-700'}`}>
          {line.replace(/^#+\s/, '')}
        </p>
      ))}
    </div>
  )
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm the Phoenix AI assistant. Ask me about roof maintenance, insurance claims, or our services." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStormCheck = async (zip: string) => {
    // Clean the zip input (remove any trailing bracket if regex was loose)
    const cleanZip = zip.replace(/[^\d]/g, '').slice(0, 5);

    try {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error("Google Places API is not fully loaded. Please refresh.");
      }

      // Show scanning message immediately
      setMessages(prev => [...prev, {
        role: 'model',
        text: `🛰️ Accessing area data for ${cleanZip}...`
      }]);

      // Use PlacesService instead of Geocoder to bypass potential Geocoding API restrictions
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      const result = await new Promise<any>((resolve, reject) => {
        service.findPlaceFromQuery({
          query: `postal code ${cleanZip} USA`,
          fields: ['geometry', 'name']
        }, (results: any, status: any) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error(`Location lookup failed for ${cleanZip} (${status})`));
          }
        });
      });

      const location = result.geometry.location;
      const latValue = typeof location.lat === 'function' ? location.lat() : location.lat;
      const lngValue = typeof location.lng === 'function' ? location.lng() : location.lng;

      if (!latValue || !lngValue) throw new Error("Could not determine coordinates for this area.");

      const stormData = await getStormHistory(latValue, lngValue);

      if (stormData && stormData.events && stormData.events.length > 0) {
        const recent = stormData.events[0];
        const resultMsg = `### Area Scan Complete\n\n**Zip Code:** ${cleanZip}\n**Most Recent Event:** ${recent.type} on ${recent.date}\n**Severity:** ${recent.severity}\n**Distance:** Approx. ${recent.distance} miles from area center.\n\n${recent.insurancePotential ? "⚠️ **This area has documented high-impact damage.**" : "Minor storm activity detected for this area."}\n\nACTION_BUTTON: [Open Live Storm Map](storm)`;
        setMessages(prev => [...prev, { role: 'model', text: resultMsg, isStormResult: true }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `I scanned records for ${cleanZip} and found no major storm events in the last 12 months. ACTION_BUTTON: [Check Detailed Map](storm)`, isStormResult: true }]);
      }
    } catch (error: any) {
      console.error("Storm Check Error:", error);
      const detail = error.message || "Unknown error";
      setMessages(prev => [...prev, { role: 'model', text: `I couldn't verify ${cleanZip} (${detail}). Please ensure it's a valid US zip code. ACTION_BUTTON: [Open Storm Tracker](storm)` }]);
    }
  };

  const handleSend = async (forcedMessage?: string) => {
    const userMessage = forcedMessage || input;
    if (!userMessage.trim()) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const data = await apiClient.post('/api/chat', {
        message: userMessage,
        history: messages.slice(1)
      });

      const botResponse = data.text || "I'm having trouble connecting right now. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);

      // Robust regex to handle [Zip] or [[Zip]] or just Zip
      const stormMatch = botResponse.match(/ACTION_STORM_CHECK:\s*\[?\[?(\d{5})\]?\]?/);
      if (stormMatch && stormMatch[1]) {
        await handleStormCheck(stormMatch[1]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try scheduling an inspection directly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseActionButtons = (text: string) => {
    // Hide the special marker from the user
    const leanText = text.replace(/ACTION_STORM_CHECK:\s*\[?\d{5}\]?/g, '').trim();

    const buttonRegex = /ACTION_BUTTON:\s*\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = buttonRegex.exec(leanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: leanText.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'button', label: match[1], view: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < leanText.length) {
      parts.push({ type: 'text', content: leanText.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: leanText }];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl w-80 sm:w-96 mb-4 border border-gray-100 overflow-hidden flex flex-col h-[500px] sm:h-[600px] max-h-[calc(100vh-120px)] animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
              <span className="font-black uppercase tracking-tighter italic text-lg">Phoenix Assistant</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSend("Main Menu")}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-slate-800 px-2 py-1 rounded-md"
              >
                Menu
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:text-phoenix-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 min-h-0 shrink grow">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-phoenix-600 text-white rounded-br-none shadow-lg'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                >
                  {msg.role === 'user' ? (
                    <p className="font-medium">{msg.text}</p>
                  ) : (
                    <div className="space-y-3">
                      {parseActionButtons(msg.text).map((part, pIdx) => (
                        part.type === 'button' ? (
                          <button
                            key={pIdx}
                            onClick={() => {
                              if (part.view?.startsWith('send:')) {
                                handleSend(part.view.replace('send:', ''));
                              } else {
                                onNavigate?.(part.view as any);
                              }
                            }}
                            className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md group"
                          >
                            {part.label}
                            {part.view?.startsWith('send:') ? (
                              <MessageCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            )}
                          </button>
                        ) : (
                          <MarkdownDisplay key={pIdx} text={part.content || ''} />
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold hover:border-phoenix-500 hover:text-phoenix-600 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-50 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your roof..."
              className="flex-1 bg-slate-100 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-phoenix-500/20 transition-all border-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-phoenix-600 hover:bg-phoenix-700 text-white p-5 rounded-[2rem] shadow-2xl transition-all hover:scale-110 flex items-center justify-center group ring-4 ring-phoenix-500/10"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
};

// components/wildlife-ai-chat-card.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Bird, Send, Brain, Minimize2, Maximize2, AlertTriangle } from 'lucide-react';

export function WildlifeAIChatCard() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    const updatedConversation = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(updatedConversation);

    try {
      const response = await fetch('/api/ai/wildlife-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedConversation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri komunikaciji sa AI asistentom');
      }

      setConversation([
        ...updatedConversation,
        { role: 'assistant', content: data.content }
      ]);

    } catch (error) {
      console.error('Error:', error);
      setConversation([
        ...updatedConversation,
        { 
          role: 'assistant', 
          content: 'Žao mi je, došlo je do greške. Molim pokušajte ponovo.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, conversation, isLoading]);

  const quickQuestions = [
    "Koje su najčešće vrste ptica na aerodromu?",
    "Kako da smanjim rizik od galebova?",
    "Koje su hitne procedure za kritične situacije?",
    "Analiziraj trendove posmatranja",
    "Preporuke za sezonsku prevenciju"
  ];

  const clearChat = () => {
    setConversation([]);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header - isti gradient kao u originalnoj verziji */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bird className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">AI Wildlife Asistent</h3>
              <p className="text-sm text-white/80">Aerodrom Tivat - Savjeti i analize</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
            >
              Očisti
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/20"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className={`flex-1 p-4 space-y-3 overflow-y-auto ${
          isExpanded ? 'max-h-80' : 'max-h-48'
        } transition-all duration-200 bg-gray-50/50`}
      >
        {conversation.length === 0 && (
          <div className="text-center text-gray-600 py-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bird className="w-8 h-8 text-blue-500" />
            </div>
            <p className="font-medium text-lg mb-2">Dobrodošao u AI asistent! 🦅</p>
            <p className="text-sm text-gray-500 mb-6">
              Mogu da pomognem sa analizom rizika, preporukama za kontrolu i EASA/ICAO savjetima.
            </p>
            
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="block w-full text-left p-3 text-sm bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {msg.role === 'user' ? 'Vi' : 'AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-sm border border-gray-200">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs ml-2 font-medium">
                  AI asistent razmišlja...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Postavite pitanje o divljim životinjama..."
            className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <Brain className="w-3 h-3" />
            <span>{conversation.length} poruka</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            <span>Aerodrom Tivat</span>
          </span>
        </div>
      </div>
    </div>
  );
}
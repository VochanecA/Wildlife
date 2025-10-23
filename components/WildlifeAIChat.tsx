// components/WildlifeAIChat.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Bird, AlertTriangle, Upload, Send } from 'lucide-react';

interface WildlifeAIChatProps {
  className?: string;
  currentSighting?: any; // Možeš da proslediš trenutno posmatranje
}

export function WildlifeAIChat({ className = '', currentSighting }: WildlifeAIChatProps) {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          messages: updatedConversation,
          sightingData: currentSighting
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
  }, [message, conversation, isLoading, currentSighting]);

  const quickQuestions = [
    "Koje su najčešće vrste ptica na aerodromu?",
    "Kako da smanjim rizik od galebova?",
    "Koje su hitne procedure za kritične situacije?",
    "Analiziraj trendove posmatranja",
    "Preporuke za sezonsku prevenciju"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
        title="AI Asistent za divlje životinje"
      >
        <Bird className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[600px] ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bird className="w-5 h-5" />
            <h3 className="font-semibold">AI Wildlife Asistent</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-white/80 mt-1">Aerodrom Tivat - Savjeti i analize</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
        {conversation.length === 0 && (
          <div className="text-center text-gray-600 py-4">
            <Bird className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="font-medium">Dobrodošao u AI asistent</p>
            <p className="text-sm">Postavi pitanje o upravljanju divljim životinjama</p>
            
            <div className="mt-4 space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="block w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs ml-2">AI asistent razmišlja...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Postavite pitanje o divljim životinjama..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
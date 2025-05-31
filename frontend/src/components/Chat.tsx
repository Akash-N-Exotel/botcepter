import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { API_URL } from '../constants';

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    used_objectives: string[];
    used_tool_calls: string[];
  };
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  objectives?: string[];
  toolCalls?: string[];
}

interface Iteration {
  number: number;
  accuracy: number;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [callCount, setCallCount] = useState(0);
  const [currentIteration, setCurrentIteration] = useState<Iteration>({ number: 1, accuracy: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start the chat session when component mounts
    startChat();
  }, []);

  const startChat = async () => {
    try {
      const response = await fetch(`${API_URL}/start-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          
        })
      });
      const data = await response.json();
      setSessionId(data.session_id);
      
      // Add the greeting message to chat
      if (data.greeting) {
        addMessage(data.greeting, 'bot');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      addMessage('Failed to start chat. Please try again later.', 'bot');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot', objectives?: string[], toolCalls?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      objectives,
      toolCalls,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAccuracyChange = (newAccuracy: number) => {
    setCurrentIteration(prev => ({
      ...prev,
      accuracy: newAccuracy
    }));
  };

  const startNewIteration = () => {
    setCurrentIteration(prev => ({
      number: prev.number + 1,
      accuracy: 0
    }));
    setCallCount(0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    // Add user message to chat
    addMessage(inputMessage, 'user');
    const userMessage = inputMessage;
    setInputMessage('');

    // Increment call count
    const currentCallCount = callCount + 1;
    setCallCount(currentCallCount);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          query: userMessage,
          call_count: currentCallCount,
          iteration: currentIteration.number,
          accuracy: currentIteration.accuracy
        }),
      });

      const chatResponse: ChatResponse = await response.json();
      
      if (chatResponse.success && chatResponse.data) {
        addMessage(
          chatResponse.data.response,
          'bot',
          chatResponse.data.used_objectives,
          chatResponse.data.used_tool_calls
        );
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('Sorry, there was an error processing your message. Please try again.', 'bot');
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-white rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Live chat with Bot</h2>
        
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              
              {message.objectives && message.objectives.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Used Objectives:</p>
                  <ul className="list-disc list-inside opacity-75">
                    {message.objectives.map((objective, index) => (
                      <li key={index} className="break-words">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Used Tools:</p>
                  <ul className="list-disc list-inside opacity-75">
                    {message.toolCalls.map((tool, index) => (
                      <li key={index} className="break-words">{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <span className="text-xs opacity-75 block mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!sessionId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!sessionId}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat; 
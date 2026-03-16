import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { chatWithDocument } from '../utils/api';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ChatTab = ({ documentId, documentStatus }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithDocument(documentId, question, messages);
      const aiMessage = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (documentStatus !== 'ready') {
    return (
      <div className={`p-8 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat Not Available</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Document must be processed before you can chat with it.
        </p>
      </div>
    );
  }

  const suggestedQuestions = [
    'What is the main topic of this document?',
    'Summarize the key points',
    'What are the important dates mentioned?',
    'List the main entities or people referenced'
  ];

  return (
    <div className={`rounded-lg overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
      style={{ height: '600px' }}
    >
      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Chat with Document
        </h3>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
          AI-Powered
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ChatBubbleLeftRightIcon className={`h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Ask anything about this document
            </h4>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              AI will answer based on the document content
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${theme === 'dark'
                    ? 'border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user'
                    ? 'bg-blue-600 ml-2'
                    : `${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} mr-2`
                  }`}>
                    {msg.role === 'user'
                      ? <UserIcon className="h-4 w-4 text-white" />
                      : <SparklesIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} rounded-bl-md`
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-2 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <SparklesIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex space-x-1.5">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } ${isLoading ? 'opacity-50' : ''}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-colors ${input.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              : `${theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;

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
      <div className="card-premium-no-hover p-12 text-center flex flex-col items-center justify-center">
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chat Not Available</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Document must be fully processed before you can chat with it.
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
    <div className="card-premium-no-hover overflow-hidden flex flex-col backdrop-blur-md bg-white/50 dark:bg-[#0f172a]/30 h-[600px] border border-slate-100 dark:border-slate-800/40">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-500 animate-pulse" />
          <h3 className="font-bold text-slate-950 dark:text-white text-sm">
            Chat with Document
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20">
            AI-Powered
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-5">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/35 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner">
              <ChatBubbleLeftRightIcon className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Document Q&A Sandbox
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Ask questions about content layout, calculations, dates, or summaries. Our AI queries the extracted schema to respond.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-left text-xs font-semibold p-3 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white transition-all cursor-pointer truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[80%] gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user'
                    ? 'bg-blue-600 shadow-md shadow-blue-500/20 text-white'
                    : 'bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20'
                  }`}>
                    {msg.role === 'user'
                      ? <UserIcon className="h-4.5 w-4.5" />
                      : <SparklesIcon className="h-4.5 w-4.5" />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/10 font-medium'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200/40 dark:border-slate-800/40 font-medium'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20">
                    <SparklesIcon className="h-4.5 w-4.5 animate-spin" />
                  </div>
                  <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex space-x-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            disabled={isLoading}
            className="flex-1 input-premium pr-4 focus:ring-4 focus:ring-blue-500/10"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-colors cursor-pointer ${input.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border dark:border-slate-700'
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

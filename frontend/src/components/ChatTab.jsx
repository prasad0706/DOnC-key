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
      <div className="card-static p-12 text-center flex flex-col items-center justify-center">
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-[var(--ink-muted)]" />
        <h3 className="text-lg font-display font-semibold text-[var(--ink)] mb-2">Chat Not Available</h3>
        <p className="text-sm text-[var(--ink-muted)]">
          Document must reach READY status stamp before querying via assistant.
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
    <div className="card-static overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-sunken)]">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-[var(--accent-teal)]" />
          <h3 className="font-display font-semibold text-[var(--ink)] text-sm">
            Document Assistant Ledger
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--accent-teal)]">
            AI-REASON
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--surface)]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-5">
            <div className="p-4 bg-[var(--surface-sunken)] text-[var(--accent-teal)] rounded-full border border-[var(--border)]">
              <ChatBubbleLeftRightIcon className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-lg font-display font-semibold text-[var(--ink)]">
                Document Record Inquiry
              </h4>
              <p className="text-xs text-[var(--ink-muted)] mt-1 font-medium leading-relaxed">
                Query extracted catalog data, totals, or summaries. AI responds using the record's schema profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-left text-xs font-medium p-3 rounded border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-all cursor-pointer truncate"
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
                  <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border border-[var(--border)] ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent-teal)] text-white'
                      : 'bg-[var(--surface-sunken)] text-[var(--accent-teal)]'
                  }`}>
                    {msg.role === 'user'
                      ? <UserIcon className="h-4 w-4" />
                      : <SparklesIcon className="h-4 w-4" />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent-teal)] text-white font-medium'
                      : 'bg-[var(--surface-sunken)] text-[var(--ink)] border border-[var(--border)] font-medium'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-[var(--surface-sunken)] text-[var(--accent-teal)] border border-[var(--border)]">
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <div className="px-4 py-3 rounded bg-[var(--surface-sunken)] border border-[var(--border)] text-xs font-mono text-[var(--ink-muted)]">
                    <span>Drafting response…</span> <span className="typewriter-cursor">▌</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-sunken)]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document record..."
            disabled={isLoading}
            className="flex-1 input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary p-3"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;

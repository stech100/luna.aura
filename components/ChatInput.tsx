import React, { useState, useRef, useEffect } from 'react';
import { UpArrowIcon } from './icons/UpArrowIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Aura..."
        className="w-full bg-gray-100 dark:bg-[#40414F] text-gray-800 dark:text-white rounded-2xl p-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow duration-200 border border-gray-200 dark:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
        rows={1}
        style={{ maxHeight: '200px' }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-800 text-white rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-900 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-200 transition-all transform hover:scale-110 active:scale-95"
      >
        <UpArrowIcon />
      </button>
    </form>
  );
};
import React from 'react';
import type { Message, User } from '../types';
import { BotIcon } from './icons/BotIcon';

interface ChatMessageProps {
  message: Message;
  user: User | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, user }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 animate-slide-in-fade-in ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full flex items-center justify-center">
            <BotIcon />
        </div>
      )}
      <div className={`max-w-3xl p-4 rounded-2xl text-white ${isModel ? 'bg-gray-700 dark:bg-gray-800/50' : 'bg-cyan-600 dark:bg-cyan-600/80'}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      {!isModel && user && (
         <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
      )}
      {!isModel && !user && (
         <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
      )}
    </div>
  );
};
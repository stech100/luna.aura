import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EditIcon } from './icons/EditIcon';
import { DotsIcon } from './icons/DotsIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LogoIcon } from './icons/LogoIcon';
import type { Conversation, User } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  editingConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onSetEditing: (id: string | null) => void;
  onRename: (id: string, newTitle: string) => void;
  onInitiateDelete: (convo: Conversation) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isMounted: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, 
  activeConversationId, 
  editingConversationId,
  onNewChat, 
  onSelectChat, 
  onSetEditing,
  onRename,
  onInitiateDelete,
  user, 
  onLogin, 
  onLogout,
  isMounted
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openContextMenuId, setOpenContextMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    return conversations.filter(convo => 
      convo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setOpenContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>, convoId: string) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem('newTitle') as HTMLInputElement;
      onRename(convoId, input.value);
  };

  return (
    <div className={`w-64 bg-white dark:bg-gradient-to-b from-[#012A2D] via-[#005F63] to-[#00C2C7] p-2 flex flex-col transition-transform duration-500 ease-out ${isMounted ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4">
        <LogoIcon />
      </div>
      <div className="mt-4 px-2 space-y-3">
        <button onClick={onNewChat} className="w-full flex items-center justify-between bg-gray-100 dark:bg-[#1f2937] text-gray-800 dark:text-white py-3 px-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-[#374151] transition-all duration-200 transform hover:scale-105">
          <span>New Chat</span>
          <EditIcon />
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#1f2937] text-gray-800 dark:text-white py-3 pl-10 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-transparent"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">
            <SearchIcon />
          </div>
        </div>
      </div>
      <nav className="mt-4 flex-1 px-2 space-y-2 overflow-y-auto" ref={contextMenuRef}>
        {filteredConversations.map((convo) => (
          <div key={convo.id} className="relative group">
            <button
              onClick={() => onSelectChat(convo.id)}
              className={`w-full text-left py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                activeConversationId === convo.id 
                  ? 'bg-gray-200 dark:bg-[#1f2937] border border-cyan-400 shadow-[0_0_10px_0_rgba(0,255,255,0.5)]' 
                  : 'bg-gray-100/50 dark:bg-[#1f2937]/50 hover:bg-gray-200/80 dark:hover:bg-[#1f2937] transform hover:scale-[1.02]'
              }`}
            >
              {editingConversationId === convo.id ? (
                 <form onSubmit={(e) => handleRenameSubmit(e, convo.id)} className="flex-grow">
                    <input
                      name="newTitle"
                      defaultValue={convo.title}
                      onBlur={(e) => onRename(convo.id, e.target.value)}
                      autoFocus
                      className="w-full bg-transparent outline-none ring-1 ring-cyan-400 rounded px-1 -ml-1 text-gray-800 dark:text-white"
                    />
                 </form>
              ) : (
                <span className="truncate pr-8">{convo.title}</span>
              )}
            </button>
            {editingConversationId !== convo.id && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => setOpenContextMenuId(openContextMenuId === convo.id ? null : convo.id)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-opacity"
                  aria-haspopup="true"
                  aria-expanded={openContextMenuId === convo.id}
                >
                  <DotsIcon />
                </button>
                {openContextMenuId === convo.id && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#2d3748] rounded-xl shadow-xl p-1 z-20 border dark:border-gray-700 animate-slide-in-fade-in" style={{ animationDuration: '150ms' }}>
                    <button 
                      onClick={() => { onSetEditing(convo.id); setOpenContextMenuId(null); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                    >
                      <PencilIcon />
                      Rename
                    </button>
                    <button 
                      onClick={() => { onInitiateDelete(convo); setOpenContextMenuId(null); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                    >
                      <TrashIcon />
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-auto p-2" ref={userMenuRef}>
        <div className="relative">
          {user ? (
            <>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-full flex items-center space-x-3 bg-gray-100 dark:bg-[#1f2937] py-3 px-4 rounded-full hover:bg-gray-200 dark:hover:bg-[#374151] transition-colors">
                <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
                <span className="font-medium flex-1 text-left">{user.name}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#2d3748] rounded-2xl shadow-lg p-2 border dark:border-gray-700 animate-slide-in-fade-in" style={{ animationDuration: '150ms' }}>
                   <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                   </div>
                   <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                      Logout
                   </button>
                </div>
              )}
            </>
          ) : (
            <button onClick={onLogin} className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-[#1f2937] py-3 px-4 rounded-full hover:bg-gray-200 dark:hover:bg-[#374151] transition-colors">
              <GoogleIcon />
              <span className="font-medium">Login with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
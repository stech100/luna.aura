import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AVAILABLE_MODELS } from './services/geminiService';
import type { Conversation, User } from './types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0]);
  const [user, setUser] = useState<User | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const handleLogin = useCallback(() => {
    setUser({
      name: 'Atrixxu dev',
      email: 'atrixxu.dev@example.com',
      avatar: 'https://picsum.photos/seed/atrixxudev/40/40',
    });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, []);

  useEffect(() => {
    if (conversations.length === 0) {
      handleNewChat();
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, handleNewChat]);

  const updateConversation = useCallback((convoId: string, updater: (convo: Conversation) => Conversation) => {
    setConversations(prev =>
      prev.map(c => (c.id === convoId ? updater(c) : c))
    );
  }, []);

  const handleConfirmDelete = () => {
    if (!conversationToDelete) return;

    const deletedId = conversationToDelete.id;
    const originalConversations = [...conversations];
    const newConversations = conversations.filter(c => c.id !== deletedId);
    setConversations(newConversations);

    if (activeConversationId === deletedId) {
      if (newConversations.length > 0) {
        const deletedIndex = originalConversations.findIndex(c => c.id === deletedId);
        const newActiveIndex = Math.max(0, deletedIndex - 1);
        setActiveConversationId(newConversations[newActiveIndex].id);
      } else {
        handleNewChat();
      }
    }
    setConversationToDelete(null);
  };
  
  const handleRenameConversation = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateConversation(id, (convo) => ({ ...convo, title: newTitle.trim() }));
    }
    setEditingConversationId(null);
  };

  const handleConfirmClearAll = () => {
    setConversations([]);
    const newChat = handleNewChat();
    setActiveConversationId(newChat.id);
    setIsClearAllModalOpen(false);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <>
      <div className={`flex h-screen w-screen text-gray-800 dark:text-white bg-white dark:bg-[#343541] transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <Sidebar 
          isMounted={isMounted}
          conversations={conversations}
          activeConversationId={activeConversationId}
          editingConversationId={editingConversationId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveConversationId}
          onSetEditing={setEditingConversationId}
          onRename={handleRenameConversation}
          onInitiateDelete={setConversationToDelete}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <main className={`flex-1 flex flex-col relative transition-opacity duration-500 delay-200 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
          {activeConversation ? (
            <ChatView 
              key={activeConversation.id} 
              conversation={activeConversation}
              updateConversation={updateConversation}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              user={user}
              theme={theme}
              setTheme={setTheme}
              onInitiateClearAll={() => setIsClearAllModalOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#343541]">
              <h1 className="text-2xl text-gray-400 dark:text-gray-500">Select or create a new chat</h1>
            </div>
          )}
        </main>
      </div>
      <ConfirmationModal
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Chat"
        confirmText="Delete"
      >
        <p>Are you sure you want to permanently delete the chat titled "{conversationToDelete?.title}"?</p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Conversations"
        confirmText="Clear All"
      >
        <p>Are you sure you want to permanently delete all conversations? This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
};

export default App;
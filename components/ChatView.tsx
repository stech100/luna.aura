import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageStream, AVAILABLE_MODELS } from '../services/geminiService';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { CogIcon } from './icons/CogIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ExportIcon } from './icons/ExportIcon';
import { TrashIcon } from './icons/TrashIcon';
import type { Conversation, Message, User } from '../types';

type Theme = 'light' | 'dark';

interface ChatViewProps {
    conversation: Conversation;
    updateConversation: (convoId: string, updater: (convo: Conversation) => Conversation) => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
    user: User | null;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onInitiateClearAll: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
    conversation, 
    updateConversation, 
    selectedModel, 
    onModelChange, 
    user,
    theme,
    setTheme,
    onInitiateClearAll
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modelSelectorRef = useRef<HTMLDivElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
                setIsModelSelectorOpen(false);
            }
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSendMessage = useCallback(async (messageText: string) => {
        setIsLoading(true);
        
        const userMessage: Message = { role: 'user', text: messageText };
        
        updateConversation(conversation.id, convo => {
            const newMessages = [...convo.messages, userMessage];
            const newTitle = convo.messages.length === 0 ? messageText.substring(0, 30) : convo.title;
            return { ...convo, messages: newMessages, title: newTitle };
        });

        const currentHistory = [...conversation.messages, userMessage];
        
        const modelMessagePlaceholder: Message = { role: 'model', text: '' };
         updateConversation(conversation.id, convo => ({
            ...convo,
            messages: [...convo.messages, modelMessagePlaceholder]
        }));

        try {
            const stream = await sendMessageStream(currentHistory, messageText, selectedModel);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                updateConversation(conversation.id, convo => {
                    const updatedMessages = [...convo.messages];
                    updatedMessages[updatedMessages.length - 1] = { role: 'model', text: fullResponse + "..." };
                    return { ...convo, messages: updatedMessages };
                });
            }
             updateConversation(conversation.id, convo => {
                    const updatedMessages = [...convo.messages];
                    updatedMessages[updatedMessages.length - 1] = { role: 'model', text: fullResponse };
                    return { ...convo, messages: updatedMessages };
                });

        } catch (error) {
            console.error("Error sending message:", error);
            updateConversation(conversation.id, convo => {
                 const updatedMessages = [...convo.messages];
                 updatedMessages[updatedMessages.length - 1] = { role: 'model', text: "Sorry, I encountered an error." };
                 return { ...convo, messages: updatedMessages };
            });
        } finally {
            setIsLoading(false);
        }
    }, [conversation.id, conversation.messages, updateConversation, selectedModel]);

    const handleExportChat = () => {
        const chatContent = conversation.messages.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n\n');
        const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.title.replace(/ /g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsSettingsOpen(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#343541]">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative group" ref={modelSelectorRef}>
                    <button 
                      onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                      className="flex items-center cursor-pointer"
                      aria-haspopup="true"
                      aria-expanded={isModelSelectorOpen}
                    >
                      <span className="text-lg font-semibold">Aura AI ({selectedModel})</span>
                      <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 ml-2 transition-transform transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isModelSelectorOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#2d3748] rounded-2xl shadow-lg p-2 z-10 border dark:border-gray-700 animate-slide-in-fade-in" style={{ animationDuration: '150ms' }}>
                            <ul>
                                {AVAILABLE_MODELS.map(model => (
                                    <li key={model}>
                                        <button 
                                            onClick={() => {
                                                onModelChange(model);
                                                setIsModelSelectorOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                                selectedModel === model ? 'bg-cyan-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {model}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed">
                                        More models coming soon...
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                  </div>
                <div className="relative" ref={settingsMenuRef}>
                    <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors transform hover:scale-110">
                        <CogIcon />
                    </button>
                    {isSettingsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#2d3748] rounded-2xl shadow-lg p-2 z-10 border dark:border-gray-700 animate-slide-in-fade-in" style={{ animationDuration: '150ms' }}>
                            <div className="p-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">THEME</span>
                                <div className="mt-2 flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-lg p-1">
                                    <button onClick={() => setTheme('light')} className={`w-1/2 flex justify-center items-center gap-2 py-1 rounded-md text-sm ${theme === 'light' ? 'bg-white dark:bg-gray-700' : ''}`}>
                                        <SunIcon /> Light
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`w-1/2 flex justify-center items-center gap-2 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-white dark:bg-gray-700' : ''}`}>
                                        <MoonIcon /> Dark
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button onClick={handleExportChat} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                                <ExportIcon /> Export Chat
                            </button>
                            <button onClick={onInitiateClearAll} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                                <TrashIcon /> Clear All Chats
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {conversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 animate-slide-in-fade-in">
                        <div className="text-3xl font-bold mb-2">luna.aura</div>
                        <div className="text-xl">How can I help you today?</div>
                    </div>
                ) : (
                    conversation.messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} user={user} />
                    ))
                )}
                {isLoading && conversation.messages[conversation.messages.length - 1]?.role !== 'model' && (
                     <ChatMessage message={{ role: 'model', text: '...' }} user={user} />
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-6 pb-6 w-full max-w-4xl mx-auto">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Aura AI can make mistakes. Please fact-check answers if not sure of them.
                </p>
            </div>
        </div>
    );
};
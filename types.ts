
export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

import axios from './axios.config';

export const chatService = {
  getConversations: () => axios.get('/chat/conversations'),
  getMessages: (userId: string) => axios.get(`/chat/messages?userId=${userId}`),
  sendMessage: (data: { receiverId: string; content: string; type: string }) => 
    axios.post('/chat/messages', data),
};
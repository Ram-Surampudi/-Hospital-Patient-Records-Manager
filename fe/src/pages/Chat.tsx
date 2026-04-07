import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Badge,
  InputAdornment,
  Alert,
  Chip,
  Button,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  MedicalServices as MedicalIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as SuperAdminIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  patientId?: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Chat: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  
  // Handle both patientId and doctorId from URL
  const patientIdFromUrl = searchParams.get('patientId');
  const doctorIdFromUrl = searchParams.get('doctorId');
  const personNameFromUrl = searchParams.get('doctorName') || searchParams.get('patientName');
  const personRoleFromUrl = searchParams.get('doctorId') ? 'doctor' : 'patient';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [authError, setAuthError] = useState(false);
  const [sending, setSending] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access chat');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchConversations();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
      updateUrlWithSelectedUser(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL params on initial load (both patient and doctor)
  useEffect(() => {
    if (isInitialLoad && conversations.length > 0) {
      const personId = patientIdFromUrl || doctorIdFromUrl;
      if (personId && personNameFromUrl) {
        const existingConversation = conversations.find(c => c.userId === personId);
        if (existingConversation) {
          setSelectedUser(existingConversation);
        } else {
          const newConversation = {
            userId: personId,
            userName: personNameFromUrl,
            userRole: personRoleFromUrl,
            lastMessage: 'Start a conversation',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
          };
          setSelectedUser(newConversation);
          setConversations(prev => [newConversation, ...prev]);
        }
        setIsInitialLoad(false);
      }
    }
  }, [conversations, patientIdFromUrl, doctorIdFromUrl, personNameFromUrl, personRoleFromUrl, isInitialLoad]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateUrlWithSelectedUser = (user: Conversation) => {
    const basePath = location.pathname;
    let newUrl;
    if (user.userRole === 'patient') {
      newUrl = `${basePath}?patientId=${user.userId}&patientName=${encodeURIComponent(user.userName)}`;
    } else {
      newUrl = `${basePath}?doctorId=${user.userId}&doctorName=${encodeURIComponent(user.userName)}`;
    }
    navigate(newUrl, { replace: true });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/chat/conversations');
      setConversations(response.data);
      setAuthError(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setAuthError(true);
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error('Failed to load conversations');
      }
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/chat/messages?userId=${userId}`);
      setMessages(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await axios.post('/chat/messages', {
        receiverId: selectedUser.userId,
        content: messageContent,
        type: 'text',
      });
      
      await fetchMessages(selectedUser.userId);
      await fetchConversations();
      inputRef.current?.focus();
    } catch (error: any) {
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedUser(conversation);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <SuperAdminIcon />;
      case 'admin': return <AdminIcon />;
      case 'doctor': return <MedicalIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return '#ff6b6b';
      case 'admin': return '#4ecdc4';
      case 'doctor': return '#45b7d1';
      default: return '#96ceb4';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(search.toLowerCase())
  );

  if (authError) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/login')}>
              Login Again
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          Session expired. Please login again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 2 }}>
      {/* Conversations List Sidebar */}
      <Paper
        sx={{
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.shadows[2],
          bgcolor: 'background.paper',
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              Messages
            </Typography>
            <Chip
              label={`${conversations.length}`}
              size="small"
              sx={{
                ml: 'auto',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: alpha(theme.palette.common.black, 0.02),
              },
            }}
          />
        </Box>

        {/* Conversations List */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ChatIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                No conversations found
              </Typography>
            </Box>
          ) : (
            filteredConversations.map((conv, index) => (
              <ListItemButton
                key={conv.userId}
                selected={selectedUser?.userId === conv.userId}
                onClick={() => handleSelectConversation(conv)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: index !== filteredConversations.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={conv.unreadCount === 0}
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: getRoleColor(conv.userRole),
                        width: 48,
                        height: 48,
                        boxShadow: theme.shadows[1],
                      }}
                    >
                      {getRoleIcon(conv.userRole)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={selectedUser?.userId === conv.userId ? 600 : 500}>
                      {conv.userName}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'block' }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 180,
                        }}
                      >
                        {conv.lastMessage?.substring(0, 50)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                        {formatTime(conv.lastMessageTime)}
                      </Typography>
                    </Box>
                  }
                />
                {conv.unreadCount > 0 && (
                  <Chip
                    label={conv.unreadCount}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      fontSize: '0.65rem',
                      bgcolor: theme.palette.error.main,
                      color: 'white',
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* Chat Area */}
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.shadows[2],
        }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: getRoleColor(selectedUser.userRole),
                  width: 48,
                  height: 48,
                  boxShadow: theme.shadows[1],
                }}
              >
                {getRoleIcon(selectedUser.userRole)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedUser.userName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedUser.userRole}
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2.5,
                bgcolor: alpha(theme.palette.common.black, 0.02),
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px',
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress size={40} />
                </Box>
              ) : messages.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Box textAlign="center">
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <ChatIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Start a conversation with {selectedUser.userName}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                    
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              mt: 0.5,
                              bgcolor: getRoleColor(message.sender?.role || 'user'),
                            }}
                          >
                            {getRoleIcon(message.sender?.role || 'user')}
                          </Avatar>
                        )}
                        {!isOwn && !showAvatar && <Box sx={{ width: 40, mr: 1 }} />}
                        
                        <Box sx={{ maxWidth: '65%' }}>
                          {!isOwn && showAvatar && (
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                              {message.sender?.name}
                            </Typography>
                          )}
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: isOwn ? theme.palette.primary.main : 'white',
                              color: isOwn ? 'white' : 'text.primary',
                              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              boxShadow: theme.shadows[1],
                            }}
                          >
                            <Typography variant="body2" sx={{ wordBreak: 'break-word', fontSize: '0.875rem' }}>
                              {message.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.7,
                                display: 'block',
                                mt: 0.5,
                                fontSize: '0.6rem',
                                textAlign: 'right',
                              }}
                            >
                              {formatTime(message.createdAt)}
                              {isOwn && message.isRead && ' ✓✓'}
                              {isOwn && !message.isRead && ' ✓'}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box display="flex" gap={1} alignItems="flex-end">
                <IconButton size="small" sx={{ color: theme.palette.grey[500] }}>
                  <AttachFileIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: theme.palette.grey[500] }}>
                  <EmojiIcon />
                </IconButton>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !sending) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sending}
                  inputRef={inputRef}
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.common.black, 0.02),
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    bgcolor: newMessage.trim() ? theme.palette.primary.main : theme.palette.grey[300],
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    '&.Mui-disabled': {
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.grey[500],
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Box textAlign="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <ChatIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Avatar>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                Welcome to Chat
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Select a conversation from the sidebar to start messaging
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Chat;
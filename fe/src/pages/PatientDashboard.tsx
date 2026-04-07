import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  alpha,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Message as MessageIcon,
  Description as RecordIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  MedicalServices as MedicalIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Bloodtype as BloodtypeIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  department: string;
  consultationFee: number;
}

interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  recordType: string;
  createdAt: string;
  doctor: { name: string; email: string };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface PatientInfo {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: string;
  diagnosis: string;
  allergies: string;
  chronicConditions: string;
  ward: string;
  roomNumber: string;
  bedNumber: string;
  status: string;
  admittedAt: string;
  dischargedAt: string | null;
  createdAt: string;
  createdBy: string;
  creator?: { name: string; email: string; role: string };
}

interface DashboardData {
  profile: any;
  patient: PatientInfo;
  notifications: Notification[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  messages: Message[];
}

const PatientDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typing, setTyping] = useState(false);
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (token && user) {
      const newSocket = io('http://localhost:5001', {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on('new_message', (message: Message) => {
        if (selectedDoctor && message.senderId === selectedDoctor.id) {
          setMessages((prev) => [...prev, message]);
        }
        fetchDashboard();
      });

      newSocket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (selectedDoctor && data.userId === selectedDoctor.id) {
          setIsDoctorTyping(data.isTyping);
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [token, user, selectedDoctor]);

  useEffect(() => {
    fetchDashboard();
    if (user?.needsPasswordChange) {
      setChangePasswordOpen(true);
      toast.warning('Please change your default password');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/patient/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (doctorId: string) => {
    try {
      const response = await axios.get(`/chat/messages?userId=${doctorId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedDoctor) return;

    try {
      const response = await axios.post('/chat/messages', {
        receiverId: selectedDoctor.id,
        content: messageText,
        type: 'text',
      });
      
      setMessages([...messages, response.data]);
      setMessageText('');
      socket?.emit('send_message', {
        receiverId: selectedDoctor.id,
        content: messageText,
        type: 'text',
      });
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedDoctor) return;
    setTyping(isTyping);
    socket?.emit('typing', {
      receiverId: selectedDoctor.id,
      isTyping,
    });
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      await axios.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const openChatWithDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    fetchMessages(doctor.id);
    setChatOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return '#ff4757';
      case 'discharged': return '#2ed573';
      case 'critical': return '#ffa502';
      default: return '#747d8c';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'admitted': return <ScheduleIcon sx={{ fontSize: 14 }} />;
      case 'discharged': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
      case 'critical': return <WarningIcon sx={{ fontSize: 14 }} />;
      default: return <HospitalIcon sx={{ fontSize: 14 }} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  const patientInfo = dashboardData?.patient;
  const creator = patientInfo?.creator;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Back Button */}
      

      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={500}>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Your health is our priority. Here's your health dashboard.
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<LockIcon sx={{ fontSize: 18 }} />}
          onClick={() => setChangePasswordOpen(true)}
          sx={{ 
            mt: 1.5,
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          Change Password
        </Button>
      </Paper>

      {/* Patient Information Card */}
      {patientInfo && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary" sx={{ fontSize: '0.9rem' }}>
              Personal Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Name:</strong> {patientInfo.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Email:</strong> {user?.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Phone:</strong> {patientInfo.phone}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Age:</strong> {patientInfo.age} years</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {patientInfo.gender === 'Male' ? <MaleIcon sx={{ fontSize: 16, color: '#666' }} /> : <FemaleIcon sx={{ fontSize: 16, color: '#666' }} />}
                  <Typography variant="body2"><strong>Gender:</strong> {patientInfo.gender}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BloodtypeIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Blood Group:</strong> {patientInfo.bloodGroup}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <HospitalIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2"><strong>Ward:</strong> {patientInfo.ward}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Chip 
                    icon={getStatusIcon(patientInfo.status)}
                    label={patientInfo.status.toUpperCase()} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(getStatusColor(patientInfo.status), 0.1),
                      color: getStatusColor(patientInfo.status),
                      fontSize: '0.7rem',
                      height: 22,
                      '& .MuiChip-icon': { fontSize: 14 }
                    }}
                  />
                  <Typography variant="body2"><strong>Admitted:</strong> {new Date(patientInfo.admittedAt).toLocaleDateString()}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  <strong>Created by:</strong> {creator?.name || 'N/A'} ({creator?.role || 'N/A'})
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Account created on: {new Date(patientInfo.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="textSecondary">Doctors</Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {dashboardData?.doctors?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), width: 36, height: 36 }}>
                  <PersonIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="textSecondary">Records</Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {dashboardData?.medicalRecords?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#2ed573', 0.1), width: 36, height: 36 }}>
                  <RecordIcon sx={{ fontSize: 18, color: '#2ed573' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="textSecondary">Messages</Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {dashboardData?.messages?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#ffa502', 0.1), width: 36, height: 36 }}>
                  <MessageIcon sx={{ fontSize: 18, color: '#ffa502' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="textSecondary">Alerts</Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {dashboardData?.notifications?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#ff4757', 0.1), width: 36, height: 36 }}>
                  <MessageIcon sx={{ fontSize: 18, color: '#ff4757' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => setTabValue(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: '0.75rem',
              minHeight: 40,
              textTransform: 'none',
            }
          }}
        >
          <Tab label="My Doctors" />
          <Tab label="Medical Records" />
          <Tab label="Messages" />
          <Tab label="Notifications" />
        </Tabs>
        
        {/* My Doctors Tab */}
        {tabValue === 0 && (
          <Box p={2}>
            {dashboardData?.doctors?.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No doctors assigned yet.</Alert>
            ) : (
              <List disablePadding>
                {dashboardData?.doctors?.map((doctor: Doctor) => (
                  <React.Fragment key={doctor.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), width: 40, height: 40 }}>
                          <HospitalIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500}>
                            Dr. {doctor.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="textSecondary">
                            {doctor.specialization} • {doctor.experienceYears} yrs exp
                          </Typography>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
                        onClick={() => openChatWithDoctor(doctor)}
                        sx={{ 
                          fontSize: '0.7rem', 
                          textTransform: 'none',
                          borderRadius: 1.5,
                          px: 1.5
                        }}
                      >
                        Message
                      </Button>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
        
        {/* Medical Records Tab */}
        {tabValue === 1 && (
          <Box p={2}>
            {dashboardData?.medicalRecords?.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No medical records found.</Alert>
            ) : (
              <List disablePadding>
                {dashboardData?.medicalRecords?.map((record: MedicalRecord) => (
                  <React.Fragment key={record.id}>
                    <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha('#2ed573', 0.1), width: 40, height: 40 }}>
                          <MedicalIcon sx={{ fontSize: 20, color: '#2ed573' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500}>
                            {record.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="textSecondary" display="block">
                              {record.recordType.replace('_', ' ').toUpperCase()} • {new Date(record.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                              {record.description?.substring(0, 100)}...
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              By: Dr. {record.doctor?.name}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
        
        {/* Messages Tab */}
        {tabValue === 2 && (
          <Box p={2}>
            {dashboardData?.messages?.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No messages yet.</Alert>
            ) : (
              <List disablePadding>
                {dashboardData?.messages?.slice(0, 5).map((message: Message) => (
                  <React.Fragment key={message.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: message.senderId === user?.id ? alpha('#1976d2', 0.1) : alpha('#2ed573', 0.1) }}>
                          <MessageIcon sx={{ fontSize: 16, color: message.senderId === user?.id ? '#1976d2' : '#2ed573' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{message.senderId === user?.id ? 'You' : `Dr. ${message.sender?.name}`}</strong>
                            {!message.isRead && message.receiverId === user?.id && (
                              <Chip label="New" size="small" color="error" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                            )}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {message.content?.substring(0, 60)}...
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(message.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                if (dashboardData?.doctors?.[0]) {
                  openChatWithDoctor(dashboardData.doctors[0]);
                } else {
                  toast.error('No doctors available to chat');
                }
              }}
              sx={{ mt: 2, fontSize: '0.75rem', textTransform: 'none' }}
            >
              Send New Message
            </Button>
          </Box>
        )}
        
        {/* Notifications Tab */}
        {tabValue === 3 && (
          <Box p={2}>
            {dashboardData?.notifications?.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No notifications.</Alert>
            ) : (
              <List disablePadding>
                {dashboardData?.notifications?.map((notification: Notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: notification.type === 'emergency' ? alpha('#ff4757', 0.1) : alpha('#1976d2', 0.1) }}>
                          <MessageIcon sx={{ fontSize: 16, color: notification.type === 'emergency' ? '#ff4757' : '#1976d2' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={notification.type}
                        size="small"
                        sx={{ height: 20, fontSize: '0.6rem' }}
                        color={notification.type === 'emergency' ? 'error' : 'primary'}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 2, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), width: 32, height: 32 }}>
              <HospitalIcon sx={{ fontSize: 18, color: '#1976d2' }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2">Dr. {selectedDoctor?.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {selectedDoctor?.specialization}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 1 }}>
          <Box sx={{ height: 350, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto', mb: 1.5, p: 1 }}>
              {messages.length === 0 ? (
                <Typography color="textSecondary" textAlign="center" py={3} variant="caption">
                  No messages yet. Start a conversation!
                </Typography>
              ) : (
                <>
                  {messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1,
                          maxWidth: '75%',
                          bgcolor: msg.senderId === user?.id ? '#1976d2' : '#f0f0f0',
                          color: msg.senderId === user?.id ? 'white' : 'text.primary',
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {msg.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  {isDoctorTyping && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                      <Paper sx={{ p: 0.75, bgcolor: '#f0f0f0' }}>
                        <Typography variant="caption" color="textSecondary">
                          Dr. {selectedDoctor?.name} is typing...
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            <Box display="flex" gap={0.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onFocus={() => handleTyping(true)}
                onBlur={() => handleTyping(false)}
                multiline
                maxRows={2}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem' } }}
              />
              <IconButton 
                color="primary" 
                onClick={sendMessage}
                disabled={!messageText.trim()}
                size="small"
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ p: 2, pb: 1, fontSize: '1rem' }}>Change Password</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            size="small"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            size="small"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            size="small"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
          <Alert severity="info" sx={{ mt: 1.5, py: 0, '& .MuiAlert-message': { fontSize: '0.7rem' } }}>
            Password must be at least 6 characters long.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={handleChangePassword}
            size="small"
            sx={{ mt: 2 }}
          >
            Change Password
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PatientDashboard;
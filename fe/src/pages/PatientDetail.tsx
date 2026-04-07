import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Chat as ChatIcon,
  MedicalServices as MedicalIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Bloodtype as BloodtypeIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
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
  updatedAt: string;
  createdBy: string;
  creator?: { name: string; email: string; role: string };
}

interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  recordType: string;
  createdAt: string;
  doctor?: { name: string; email: string };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: { name: string; role: string };
  receiver: { name: string; role: string };
}

interface AssignedDoctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  isPrimary: boolean;
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assignedDoctors, setAssignedDoctors] = useState<AssignedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    emergencyContact: '',
    diagnosis: '',
    allergies: '',
    chronicConditions: '',
    ward: '',
    roomNumber: '',
    bedNumber: '',
  });
  
  const [medicalForm, setMedicalForm] = useState({
    title: '',
    description: '',
    recordType: 'prescription',
  });

  const canEdit = user?.role === 'admin' || user?.role === 'superadmin';
  const canDischarge = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'doctor';
  const canAddMedical = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'doctor';

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
      fetchMedicalRecords();
      fetchMessages();
      fetchAssignedDoctors();
    }
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/patients/${id}`);
      setPatient(response.data);
      setEditForm({
        name: response.data.name,
        age: response.data.age.toString(),
        phone: response.data.phone,
        address: response.data.address || '',
        emergencyContact: response.data.emergencyContact || '',
        diagnosis: response.data.diagnosis || '',
        allergies: response.data.allergies || '',
        chronicConditions: response.data.chronicConditions || '',
        ward: response.data.ward,
        roomNumber: response.data.roomNumber || '',
        bedNumber: response.data.bedNumber || '',
      });
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      setError(error.response?.data?.message || 'Failed to fetch patient details');
      toast.error('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`/patients/${id}/medical-records`);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/chat/messages?patientId=${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAssignedDoctors = async () => {
    try {
      const response = await axios.get(`/patients/${id}/doctors`);
      setAssignedDoctors(response.data);
    } catch (error) {
      console.error('Error fetching assigned doctors:', error);
      setAssignedDoctors([]);
    }
  };

  const handleUpdatePatient = async () => {
    try {
      await axios.put(`/patients/${id}`, {
        name: editForm.name,
        age: parseInt(editForm.age),
        phone: editForm.phone,
        address: editForm.address,
        emergencyContact: editForm.emergencyContact,
        diagnosis: editForm.diagnosis,
        allergies: editForm.allergies,
        chronicConditions: editForm.chronicConditions,
        ward: editForm.ward,
        roomNumber: editForm.roomNumber,
        bedNumber: editForm.bedNumber,
      });
      toast.success('Patient updated successfully');
      setEditDialogOpen(false);
      fetchPatientDetails();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    }
  };

  const handleDischargePatient = async () => {
    try {
      await axios.patch(`/patients/${id}/discharge`);
      toast.success('Patient discharged successfully');
      setDischargeDialogOpen(false);
      fetchPatientDetails();
    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error('Failed to discharge patient');
    }
  };

  const handleAddMedicalRecord = async () => {
    try {
      await axios.post('/patients/medical-record', {
        patientId: id,
        title: medicalForm.title,
        description: medicalForm.description,
        recordType: medicalForm.recordType,
      });
      toast.success('Medical record added successfully');
      setMedicalDialogOpen(false);
      setMedicalForm({ title: '', description: '', recordType: 'prescription' });
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast.error('Failed to add medical record');
    }
  };

  const handleChatNavigation = () => {
    // Use window.location for a hard navigation to avoid state issues
    window.location.href = `/chat?patientId=${patient?.id}&patientName=${encodeURIComponent(patient?.name || '')}`;
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

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return '#1976d2';
      case 'lab_report': return '#2ed573';
      case 'radiology': return '#ffa502';
      default: return '#747d8c';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !patient) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Patient not found'}</Alert>
        <Button sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients')}>
          Back to Patients
        </Button>
      </Box>
    );
  }

  const creator = patient.creator;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          
          <Typography variant="h5" fontWeight={600}>
            {patient.name}
          </Typography>
          <Chip 
            icon={getStatusIcon(patient.status)}
            label={patient.status.toUpperCase()} 
            sx={{ 
              bgcolor: alpha(getStatusColor(patient.status), 0.1),
              color: getStatusColor(patient.status),
              fontWeight: 500,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        </Box>
        <Box display="flex" gap={1}>
          {canEdit && (
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 18 }} />} 
              onClick={() => setEditDialogOpen(true)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Edit
            </Button>
          )}
          {canAddMedical && patient.status === 'admitted' && (
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<MedicalIcon sx={{ fontSize: 18 }} />} 
              onClick={() => setMedicalDialogOpen(true)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Add Record
            </Button>
          )}
          {canDischarge && patient.status === 'admitted' && (
            <Button 
              variant="contained" 
              color="warning" 
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />} 
              onClick={() => setDischargeDialogOpen(true)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Discharge
            </Button>
          )}
          <Button 
  variant="contained" 
  size="small"
  startIcon={<ChatIcon sx={{ fontSize: 18 }} />} 
  onClick={() => navigate(`/chat?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`)}
  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
>
  Chat
</Button>
        </Box>
      </Box>

      {/* Rest of your component remains the same */}
      {/* Patient Info Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), width: 40, height: 40 }}>
                {patient.gender === 'Male' ? <MaleIcon sx={{ color: '#1976d2', fontSize: 22 }} /> : <FemaleIcon sx={{ color: '#1976d2', fontSize: 22 }} />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Personal Information</Typography>
                <Typography variant="caption" color="textSecondary">Patient ID: {patient.patientId}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Age</Typography>
                <Typography variant="body2">{patient.age} years</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Gender</Typography>
                <Typography variant="body2">{patient.gender}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Blood Group</Typography>
                <Typography variant="body2">{patient.bloodGroup}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Phone</Typography>
                <Typography variant="body2">{patient.phone}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Email</Typography>
                <Typography variant="body2">{patient.email || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Address</Typography>
                <Typography variant="body2">{patient.address || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Emergency Contact</Typography>
                <Typography variant="body2">{patient.emergencyContact || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" color="textSecondary">
                  <strong>Created by:</strong> {creator?.name || 'N/A'} ({creator?.role || 'N/A'})
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  {new Date(patient.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Avatar sx={{ bgcolor: alpha('#2ed573', 0.1), width: 40, height: 40 }}>
                <HospitalIcon sx={{ color: '#2ed573', fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Medical Information</Typography>
                <Typography variant="caption" color="textSecondary">Admission & Treatment</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Ward</Typography>
                <Typography variant="body2">{patient.ward}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Room/Bed</Typography>
                <Typography variant="body2">{patient.roomNumber || 'N/A'} / {patient.bedNumber || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Diagnosis</Typography>
                <Typography variant="body2">{patient.diagnosis || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Allergies</Typography>
                <Typography variant="body2">{patient.allergies || 'None'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">Chronic Conditions</Typography>
                <Typography variant="body2">{patient.chronicConditions || 'None'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Admitted On</Typography>
                <Typography variant="body2">{new Date(patient.admittedAt).toLocaleDateString()}</Typography>
              </Grid>
              {patient.dischargedAt && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Discharged On</Typography>
                  <Typography variant="body2">{new Date(patient.dischargedAt).toLocaleDateString()}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Assigned Doctors Section */}
      {assignedDoctors.length > 0 && (
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Assigned Doctors
          </Typography>
          <Grid container spacing={1.5}>
            {assignedDoctors.map((doctor) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doctor.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), width: 32, height: 32 }}>
                        <PersonIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Dr. {doctor.name}
                          {doctor.isPrimary && (
                            <Chip label="Primary" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {doctor.specialization}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

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
          <Tab label="Medical Records" />
          <Tab label="Messages" />
        </Tabs>

        {/* Medical Records Tab */}
        {tabValue === 0 && (
          <Box p={2}>
            {medicalRecords.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No medical records found.</Alert>
            ) : (
              <Grid container spacing={2}>
                {medicalRecords.map((record) => (
                  <Grid size={{ xs: 12, md: 6 }} key={record.id}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Chip 
                          label={record.recordType.replace('_', ' ').toUpperCase()} 
                          size="small"
                          sx={{ 
                            mb: 1, 
                            height: 22, 
                            fontSize: '0.6rem',
                            bgcolor: alpha(getRecordTypeColor(record.recordType), 0.1),
                            color: getRecordTypeColor(record.recordType),
                          }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>{record.title}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                          {record.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Created: {new Date(record.createdAt).toLocaleString()}
                          {record.doctor && ` by Dr. ${record.doctor.name}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Messages Tab */}
        {tabValue === 1 && (
          <Box p={2}>
            {messages.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No messages yet.</Alert>
            ) : (
              <List disablePadding>
                {messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#1976d2', 0.1) }}>
                          <MessageIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{message.sender.name}</strong> ({message.sender.role})
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {message.content}
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
              onClick={handleChatNavigation}
              sx={{ mt: 2, fontSize: '0.75rem', textTransform: 'none' }}
            >
              Send New Message
            </Button>
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 2, fontSize: '1rem' }}>Edit Patient Details</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Age" type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Emergency Contact" value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Address" multiline rows={2} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Ward</InputLabel>
                <Select value={editForm.ward} onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })} label="Ward">
                  <MenuItem value="ICU">ICU</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Pediatric">Pediatric</MenuItem>
                  <MenuItem value="Maternity">Maternity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Room Number" value={editForm.roomNumber} onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Bed Number" value={editForm.bedNumber} onChange={(e) => setEditForm({ ...editForm, bedNumber: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Diagnosis" multiline rows={2} value={editForm.diagnosis} onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Allergies" value={editForm.allergies} onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Chronic Conditions" value={editForm.chronicConditions} onChange={(e) => setEditForm({ ...editForm, chronicConditions: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleUpdatePatient} variant="contained" size="small">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialogOpen} onClose={() => setDischargeDialogOpen(false)}>
        <DialogTitle sx={{ p: 2, fontSize: '1rem' }}>Discharge Patient</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="body2">Are you sure you want to discharge {patient.name}?</Typography>
          <Alert severity="warning" sx={{ mt: 1.5, py: 0 }}>
            This action will mark the patient as discharged and cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDischargeDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleDischargePatient} variant="contained" color="warning" size="small">Confirm Discharge</Button>
        </DialogActions>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={medicalDialogOpen} onClose={() => setMedicalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 2, fontSize: '1rem' }}>Add Medical Record</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Record Type</InputLabel>
                <Select value={medicalForm.recordType} onChange={(e) => setMedicalForm({ ...medicalForm, recordType: e.target.value })} label="Record Type">
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="lab_report">Lab Report</MenuItem>
                  <MenuItem value="radiology">Radiology</MenuItem>
                  <MenuItem value="surgery_note">Surgery Note</MenuItem>
                  <MenuItem value="discharge_summary">Discharge Summary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Title" value={medicalForm.title} onChange={(e) => setMedicalForm({ ...medicalForm, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Description" multiline rows={4} value={medicalForm.description} onChange={(e) => setMedicalForm({ ...medicalForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMedicalDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleAddMedicalRecord} variant="contained" size="small">Add Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDetail;
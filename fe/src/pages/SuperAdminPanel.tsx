import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  alpha,
  Card,
  CardContent,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HospitalIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  doctorProfile?: {
    specialization: string;
    qualification: string;
    experienceYears: number;
    licenseNumber: string;
    department: string;
    consultationFee: number;
  };
}

interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

const SuperAdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [admins, setAdmins] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createDoctorOpen, setCreateDoctorOpen] = useState(false);
  const [createHospitalOpen, setCreateHospitalOpen] = useState(false);
  const [editHospitalOpen, setEditHospitalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalAdmins: 0,
    totalDoctors: 0,
    activeUsers: 0,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualification: '',
    experienceYears: '',
    licenseNumber: '',
    department: '',
    consultationFee: '',
  });
  
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    type: 'big',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [tabValue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (tabValue === 0) {
        const adminsRes = await axios.get('/users?role=admin');
        setAdmins(adminsRes.data);
      } else if (tabValue === 1) {
        const doctorsRes = await axios.get('/users?role=doctor');
        setDoctors(doctorsRes.data);
      } else if (tabValue === 2) {
        const hospitalsRes = await axios.get('/users/hospitals');
        setHospitals(hospitalsRes.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [hospitalsRes, adminsRes, doctorsRes] = await Promise.all([
        axios.get('/users/hospitals'),
        axios.get('/users?role=admin'),
        axios.get('/users?role=doctor'),
      ]);
      
      setStats({
        totalHospitals: hospitalsRes.data.length,
        totalAdmins: adminsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        activeUsers: adminsRes.data.filter((u: User) => u.isActive).length + doctorsRes.data.filter((u: User) => u.isActive).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateHospital = async () => {
    try {
      await axios.post('/users/hospitals', hospitalForm);
      toast.success('Hospital created successfully');
      setCreateHospitalOpen(false);
      fetchData();
      fetchStats();
      setHospitalForm({ name: '', type: 'big', address: '', phone: '', email: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create hospital');
    }
  };

  const handleUpdateHospital = async () => {
    if (!editingHospital) return;
    try {
      await axios.put(`/users/hospitals/${editingHospital.id}`, hospitalForm);
      toast.success('Hospital updated successfully');
      setEditHospitalOpen(false);
      setEditingHospital(null);
      fetchData();
      setHospitalForm({ name: '', type: 'big', address: '', phone: '', email: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hospital? This will also delete all associated data.')) {
      try {
        await axios.delete(`/users/hospitals/${id}`);
        toast.success('Hospital deleted successfully');
        fetchData();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete hospital');
      }
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await axios.post('/users/admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        hospitalId: selectedHospital,
      });
      toast.success('Admin created successfully');
      setCreateAdminOpen(false);
      fetchData();
      fetchStats();
      setFormData({ name: '', email: '', password: '', specialization: '', qualification: '', experienceYears: '', licenseNumber: '', department: '', consultationFee: '' });
      setSelectedHospital('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleCreateDoctor = async () => {
    try {
      await axios.post('/users/doctor', {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experienceYears: parseInt(formData.experienceYears),
        licenseNumber: formData.licenseNumber,
        department: formData.department,
        consultationFee: parseFloat(formData.consultationFee),
        hospitalId: selectedHospital,
      });
      toast.success('Doctor created successfully');
      setCreateDoctorOpen(false);
      fetchData();
      fetchStats();
      setFormData({ name: '', email: '', password: '', specialization: '', qualification: '', experienceYears: '', licenseNumber: '', department: '', consultationFee: '' });
      setSelectedHospital('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/users/${id}/toggle`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchData();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        toast.success('User deleted successfully');
        fetchData();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const openEditHospitalDialog = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setHospitalForm({
      name: hospital.name,
      type: hospital.type,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email,
    });
    setEditHospitalOpen(true);
  };

  const statCards = [
    { title: 'Total Hospitals', value: stats.totalHospitals, icon: <HospitalIcon />, color: '#1976d2', bgColor: alpha('#1976d2', 0.1) },
    { title: 'Total Admins', value: stats.totalAdmins, icon: <AdminIcon />, color: '#4ecdc4', bgColor: alpha('#4ecdc4', 0.1) },
    { title: 'Total Doctors', value: stats.totalDoctors, icon: <MedicalIcon />, color: '#45b7d1', bgColor: alpha('#45b7d1', 0.1) },
    { title: 'Active Users', value: stats.activeUsers, icon: <CheckCircleIcon />, color: '#2ed573', bgColor: alpha('#2ed573', 0.1) },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Super Admin Panel
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => { fetchData(); fetchStats(); }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => setTabValue(v)} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Admins" icon={<AdminIcon />} iconPosition="start" />
          <Tab label="Doctors" icon={<MedicalIcon />} iconPosition="start" />
          <Tab label="Hospitals" icon={<HospitalIcon />} iconPosition="start" />
        </Tabs>
        
        {/* Admins Tab */}
        {tabValue === 0 && (
          <Box p={3}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateAdminOpen(true)}>
                Create New Admin
              </Button>
            </Box>
            {admins.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">No admins found. Click "Create New Admin" to add one.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id} hover>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell><Chip label={admin.role} size="small" color="primary" /></TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.isActive ? 'Active' : 'Inactive'} 
                            color={admin.isActive ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Tooltip title={admin.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton size="small" onClick={() => handleToggleStatus(admin.id, admin.isActive)}>
                              {admin.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteUser(admin.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        {/* Doctors Tab */}
        {tabValue === 1 && (
          <Box p={3}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateDoctorOpen(true)}>
                Create New Doctor
              </Button>
            </Box>
            {doctors.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">No doctors found. Click "Create New Doctor" to add one.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Specialization</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Experience</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doctors.map((doctor) => (
                      <TableRow key={doctor.id} hover>
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.doctorProfile?.specialization || 'N/A'}</TableCell>
                        <TableCell>{doctor.doctorProfile?.department || 'N/A'}</TableCell>
                        <TableCell>{doctor.doctorProfile?.experienceYears || 0} years</TableCell>
                        <TableCell>
                          <Chip 
                            label={doctor.isActive ? 'Active' : 'Inactive'} 
                            color={doctor.isActive ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={doctor.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton size="small" onClick={() => handleToggleStatus(doctor.id, doctor.isActive)}>
                              {doctor.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteUser(doctor.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        {/* Hospitals Tab */}
        {tabValue === 2 && (
          <Box p={3}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="contained" startIcon={<HospitalIcon />} onClick={() => setCreateHospitalOpen(true)}>
                Add New Hospital
              </Button>
            </Box>
            {hospitals.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">No hospitals found. Click "Add New Hospital" to add one.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hospitals.map((hospital) => (
                      <TableRow key={hospital.id} hover>
                        <TableCell>{hospital.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={hospital.type === 'big' ? 'BIG Hospital' : 'Small Clinic'} 
                            color={hospital.type === 'big' ? 'primary' : 'success'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{hospital.address}</TableCell>
                        <TableCell>{hospital.phone}</TableCell>
                        <TableCell>{hospital.email}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEditHospitalDialog(hospital)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteHospital(hospital.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Create Hospital Dialog */}
      <Dialog open={createHospitalOpen} onClose={() => setCreateHospitalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Hospital/Clinic</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Hospital/Clinic Name" value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={hospitalForm.type} onChange={(e) => setHospitalForm({ ...hospitalForm, type: e.target.value })} label="Type">
                  <MenuItem value="big">BIG Hospital (Has Admin)</MenuItem>
                  <MenuItem value="small">Small Clinic (Direct Doctor Management)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Address" value={hospitalForm.address} onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone" value={hospitalForm.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={hospitalForm.email} onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={handleCreateHospital}>Create Hospital</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Edit Hospital Dialog */}
      <Dialog open={editHospitalOpen} onClose={() => setEditHospitalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Hospital/Clinic</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Hospital/Clinic Name" value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={hospitalForm.type} onChange={(e) => setHospitalForm({ ...hospitalForm, type: e.target.value })} label="Type">
                  <MenuItem value="big">BIG Hospital (Has Admin)</MenuItem>
                  <MenuItem value="small">Small Clinic (Direct Doctor Management)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Address" value={hospitalForm.address} onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone" value={hospitalForm.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={hospitalForm.email} onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={handleUpdateHospital}>Update Hospital</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      
      {/* Create Admin Dialog */}
      <Dialog open={createAdminOpen} onClose={() => setCreateAdminOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Hospital</InputLabel>
                <Select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} label="Select Hospital">
                  {hospitals.filter(h => h.type === 'big').map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">Admin will have full access to manage doctors and patients in this hospital.</Alert>
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={handleCreateAdmin}>Create Admin</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      
      {/* Create Doctor Dialog */}
      <Dialog open={createDoctorOpen} onClose={() => setCreateDoctorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Doctor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Specialization" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Qualification" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Experience Years" type="number" value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="License Number" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Consultation Fee" type="number" value={formData.consultationFee} onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Hospital/Clinic</InputLabel>
                <Select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} label="Select Hospital/Clinic">
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name} ({hospital.type === 'big' ? 'BIG Hospital' : 'Small Clinic'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">Default password: doctor123</Alert>
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={handleCreateDoctor}>Create Doctor</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SuperAdminPanel;
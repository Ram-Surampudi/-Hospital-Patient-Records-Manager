import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  department: string;
  consultationFee: number;
  isActive: boolean;
  createdAt: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  ward: string;
  status: string;
  admittedAt: string;
}

interface DashboardData {
  hospital: {
    id: string;
    name: string;
  };
  stats: {
    totalDoctors: number;
    totalPatients: number;
    admittedPatients: number;
    dischargedPatients: number;
  };
  doctors: Doctor[];
  patients: Patient[];
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patients/admin/dashboard');
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        await axios.delete(`/users/${doctorId}`);
        toast.success('Doctor removed successfully');
        fetchDashboard();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to remove doctor');
      }
    }
  };

  const handleAddDoctor = () => {
    navigate('/admin/doctors/new');
  };

  const handleAddPatient = () => {
    navigate('/admin/patients/new');
  };

  const getStatusColor = (status: string) => {
    return status === 'admitted' ? '#ff4757' : '#2ed573';
  };

  const getStatusBgColor = (status: string) => {
    return status === 'admitted' ? alpha('#ff4757', 0.1) : alpha('#2ed573', 0.1);
  };

  const statsCards = [
    {
      title: 'Total Doctors',
      value: dashboardData?.stats.totalDoctors || 0,
      icon: <MedicalIcon />,
      color: '#1976d2',
      bgColor: alpha('#1976d2', 0.1),
    },
    {
      title: 'Total Patients',
      value: dashboardData?.stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#9b59b6',
      bgColor: alpha('#9b59b6', 0.1),
    },
    {
      title: 'Admitted Patients',
      value: dashboardData?.stats.admittedPatients || 0,
      icon: <HospitalIcon />,
      color: '#ff4757',
      bgColor: alpha('#ff4757', 0.1),
    },
    {
      title: 'Discharged Patients',
      value: dashboardData?.stats.dischargedPatients || 0,
      icon: <CheckCircleIcon />,
      color: '#2ed573',
      bgColor: alpha('#2ed573', 0.1),
    },
  ];

  if (loading) {
    return (
      <Box className="dashboard-loading">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box className="dashboard-empty">
        <DashboardIcon className="empty-icon" />
        <Typography variant="h6" className="empty-title">
          Admin Dashboard
        </Typography>
        <Paper className="empty-paper">
          <Typography variant="body2" color="textSecondary">
            No hospital assigned to this admin account.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="admin-dashboard">
      {/* Header Section */}
      <Box className="dashboard-header">
        <Box className="header-title">
          <Typography variant="h5" className="title">
            Admin Dashboard
          </Typography>
          <Typography variant="body2" className="subtitle">
            {dashboardData.hospital.name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon className="small-icon" />}
          onClick={fetchDashboard}
          className="refresh-btn"
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} className="stats-container">
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="stat-card">
              <CardContent className="stat-card-content">
                <Box className="stat-info">
                  <Typography variant="caption" className="stat-label">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" className="stat-value" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar className="stat-avatar" sx={{ bgcolor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Section */}
      <Paper className="tabs-container">
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => setTabValue(v)}
          className="custom-tabs"
        >
          <Tab label="Doctors" className="tab-label" />
          <Tab label="Patients" className="tab-label" />
        </Tabs>

        {/* Doctors Tab */}
        {tabValue === 0 && (
          <Box className="tab-content">
            <Box className="tab-header">
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon className="small-icon" />}
                onClick={handleAddDoctor}
                className="add-btn"
              >
                Add New Doctor
              </Button>
            </Box>
            {dashboardData.doctors.length === 0 ? (
              <Box className="empty-state">
                <MedicalIcon className="empty-state-icon" />
                <Typography variant="body2" color="textSecondary">
                  No doctors found. Click "Add New Doctor" to create one.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} className="table-container">
                <Table size="small" className="custom-table">
                  <TableHead>
                    <TableRow className="table-header">
                      <TableCell className="table-cell">Name</TableCell>
                      <TableCell className="table-cell">Specialization</TableCell>
                      <TableCell className="table-cell">Department</TableCell>
                      <TableCell className="table-cell">Experience</TableCell>
                      <TableCell className="table-cell">Fee</TableCell>
                      <TableCell className="table-cell">Status</TableCell>
                      <TableCell className="table-cell">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.doctors.map((doctor, index) => (
                      <TableRow key={doctor.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <TableCell className="table-cell">
                          <Typography variant="body2" className="doctor-name">
                            {doctor.name}
                          </Typography>
                          <Typography variant="caption" className="doctor-email">
                            {doctor.email}
                          </Typography>
                        </TableCell>
                        <TableCell className="table-cell">{doctor.specialization}</TableCell>
                        <TableCell className="table-cell">{doctor.department}</TableCell>
                        <TableCell className="table-cell">{doctor.experienceYears}y</TableCell>
                        <TableCell className="table-cell">${doctor.consultationFee}</TableCell>
                        <TableCell className="table-cell">
                          <Chip
                            label={doctor.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            className={`status-chip ${doctor.isActive ? 'active' : 'inactive'}`}
                          />
                        </TableCell>
                        <TableCell className="table-cell">
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="Chat with Doctor" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/chat?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}`)}
                                sx={{
                                  color: theme.palette.secondary.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  },
                                }}
                              >
                                <ChatIcon className="small-icon" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Doctor" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="delete-btn"
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                <DeleteIcon className="small-icon" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Patients Tab */}
        {tabValue === 1 && (
          <Box className="tab-content">
            <Box className="tab-header">
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon className="small-icon" />}
                onClick={handleAddPatient}
                className="add-btn"
              >
                Add New Patient
              </Button>
            </Box>
            {dashboardData.patients.length === 0 ? (
              <Box className="empty-state">
                <PeopleIcon className="empty-state-icon" />
                <Typography variant="body2" color="textSecondary">
                  No patients found. Click "Add New Patient" to create one.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} className="table-container">
                <Table size="small" className="custom-table">
                  <TableHead>
                    <TableRow className="table-header">
                      <TableCell className="table-cell">Patient ID</TableCell>
                      <TableCell className="table-cell">Name</TableCell>
                      <TableCell className="table-cell">Age/Gender</TableCell>
                      <TableCell className="table-cell">Blood Group</TableCell>
                      <TableCell className="table-cell">Ward</TableCell>
                      <TableCell className="table-cell">Status</TableCell>
                      <TableCell className="table-cell">Admitted On</TableCell>
                      <TableCell className="table-cell">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.patients.map((patient, index) => (
                      <TableRow key={patient.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <TableCell className="table-cell patient-id">{patient.patientId}</TableCell>
                        <TableCell className="table-cell">
                          <Typography variant="body2" className="patient-name">
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" className="patient-phone">
                            {patient.phone}
                          </Typography>
                        </TableCell>
                        <TableCell className="table-cell">{patient.age} / {patient.gender}</TableCell>
                        <TableCell className="table-cell">
                          <Chip
                            label={patient.bloodGroup}
                            size="small"
                            className="blood-group-chip"
                          />
                        </TableCell>
                        <TableCell className="table-cell">{patient.ward}</TableCell>
                        <TableCell className="table-cell">
                          <Chip
                            label={patient.status.toUpperCase()}
                            size="small"
                            className={`status-chip ${patient.status}`}
                            sx={{
                              bgcolor: getStatusBgColor(patient.status),
                              color: getStatusColor(patient.status),
                            }}
                          />
                        </TableCell>
                        <TableCell className="table-cell">
                          {new Date(patient.admittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="table-cell">
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="View Details" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                className="view-btn"
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                <ViewIcon className="small-icon" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chat with Patient" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/chat?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`)}
                                sx={{
                                  color: theme.palette.secondary.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  },
                                }}
                              >
                                <ChatIcon className="small-icon" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
    </Box>
  );
};

export default AdminDashboard;
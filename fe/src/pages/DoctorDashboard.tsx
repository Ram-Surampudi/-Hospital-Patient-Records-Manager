import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Button,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Chat as ChatIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  ward: string;
  diagnosis: string;
  status: string;
  admittedAt: string;
}

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/patients/doctor/my-patients');
      setPatients(response.data || []);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to fetch patients');
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return '#ff4757';
      case 'discharged': return '#2ed573';
      case 'critical': return '#ffa502';
      default: return '#747d8c';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'admitted': return alpha('#ff4757', 0.1);
      case 'discharged': return alpha('#2ed573', 0.1);
      case 'critical': return alpha('#ffa502', 0.1);
      default: return alpha('#747d8c', 0.1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'admitted': return <HospitalIcon sx={{ fontSize: 14 }} />;
      case 'discharged': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
      case 'critical': return <WarningIcon sx={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: <PeopleIcon />,
      color: '#1976d2',
      bgColor: alpha('#1976d2', 0.1),
    },
    {
      title: 'Admitted',
      value: patients.filter(p => p.status === 'admitted').length,
      icon: <HospitalIcon />,
      color: '#ff4757',
      bgColor: alpha('#ff4757', 0.1),
    },
    {
      title: 'Critical',
      value: patients.filter(p => p.status === 'critical').length,
      icon: <WarningIcon />,
      color: '#ffa502',
      bgColor: alpha('#ffa502', 0.1),
    },
    {
      title: 'Discharged',
      value: patients.filter(p => p.status === 'discharged').length,
      icon: <CheckCircleIcon />,
      color: '#2ed573',
      bgColor: alpha('#2ed573', 0.1),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={300} height={50} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchPatients}>
              Retry
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <DashboardIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Typography variant="h4" fontWeight={600}>
              Doctor Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Welcome back, Dr. {user?.name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="textSecondary" 
                      gutterBottom
                      sx={{ fontWeight: 500, letterSpacing: '0.5px' }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      fontWeight={700}
                      sx={{ color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      width: 56,
                      height: 56,
                      '& .MuiSvgIcon-root': {
                        fontSize: 28,
                        color: stat.color,
                      },
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Patients Table Section */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          My Assigned Patients
        </Typography>
        <Chip 
          label={`${patients.length} patients`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Box>

      {patients.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <MedicalIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Patients Assigned
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Patients will appear here once assigned to you by an admin.
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.shadows[2],
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Patient ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age/Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Blood Group</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ward</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Diagnosis</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient, index) => (
                  <TableRow
                    key={patient.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.3),
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {patient.patientId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {patient.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {patient.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {patient.age} / {patient.gender}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient.bloodGroup}
                        size="small"
                        sx={{
                          bgcolor: alpha('#1976d2', 0.1),
                          color: '#1976d2',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{patient.ward}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {patient.diagnosis || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(patient.status)}
                        label={patient.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getStatusBgColor(patient.status),
                          color: getStatusColor(patient.status),
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 26,
                          '& .MuiChip-icon': {
                            fontSize: 14,
                            color: getStatusColor(patient.status),
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View Details" arrow>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chat with Patient" arrow>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/doctor/chat?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`)}
                            sx={{
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              },
                            }}
                          >
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default DoctorDashboard;
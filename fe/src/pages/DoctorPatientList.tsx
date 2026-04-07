import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Chat as ChatIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config';
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

const DoctorPatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPatients();
  }, []);

  const fetchMyPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/my-patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch your patients');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted':
        return 'error';
      case 'discharged':
        return 'success';
      case 'critical':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>My Patients</Typography>
        <Alert severity="info">
          You don't have any patients assigned yet. Patients will appear here once assigned by an admin.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Patients</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Patients assigned to you for care and treatment
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age/Gender</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Ward</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.patientId}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>
                  {patient.age} / {patient.gender}
                </TableCell>
                <TableCell>{patient.bloodGroup}</TableCell>
                <TableCell>{patient.ward}</TableCell>
                <TableCell>{patient.diagnosis || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={patient.status.toUpperCase()}
                    color={getStatusColor(patient.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chat">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate('/chat', { state: { patientId: patient.id, patientName: patient.name } })}
                    >
                      <ChatIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Medical Record">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => {/* Open add medical record modal */}}
                    >
                      <MedicalIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DoctorPatientList;
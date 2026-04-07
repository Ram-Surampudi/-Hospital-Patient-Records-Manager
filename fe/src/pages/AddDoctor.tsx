import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AddDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    qualification: '',
    experienceYears: '',
    licenseNumber: '',
    department: '',
    consultationFee: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      });
      
      toast.success('Doctor created successfully!');
      toast.success('Temporary password: doctor123');
      navigate(getDashboardPath());
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'GeneralMedicine',
    'Emergency',
    'Radiology',
    'Surgery',
    'Psychiatry',
    'Dermatology',
  ];

  const specializations = [
    'Interventional Cardiology',
    'Pediatric Neurology',
    'Joint Replacement',
    'General Pediatrics',
    'Family Medicine',
    'Emergency Medicine',
    'Diagnostic Radiology',
    'General Surgery',
    'Clinical Psychiatry',
    'Cosmetic Dermatology',
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add New Doctor to Your Hospital
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Create a new doctor account for your hospital. They will receive a temporary password.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  label="Specialization"
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                placeholder="e.g., MD, MBBS, PhD"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Experience (Years)"
                name="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Consultation Fee ($)"
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <strong>Note:</strong> This doctor will be automatically added to your hospital.
            <br />
            <strong>Temporary Password:</strong> doctor123
            <br />
            The doctor will need to change their password after first login.
          </Alert>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Doctor'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddDoctor;
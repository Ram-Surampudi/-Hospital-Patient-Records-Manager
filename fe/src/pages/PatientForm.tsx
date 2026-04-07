import React, { useState, useEffect } from 'react';
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
  alpha,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';

const PatientForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    address: '',
    emergencyContact: '',
    diagnosis: '',
    ward: '',
  });

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/patients/${id}`);
      const patient = response.data;
      setFormData({
        name: patient.name,
        email: patient.email || '',
        age: patient.age.toString(),
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        phone: patient.phone,
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        diagnosis: patient.diagnosis || '',
        ward: patient.ward,
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isEdit && !formData.email) {
      toast.error('Email is required for patient login');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`/patients/${id}`, {
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          diagnosis: formData.diagnosis,
          ward: formData.ward,
        });
        toast.success('Patient updated successfully');
      } else {
        await axios.post('/users/patient', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          diagnosis: formData.diagnosis,
          ward: formData.ward,
        });
        toast.success('Patient created successfully!');
        toast.success(`Login: ${formData.email} / patient123`);
      }
      const getPatientsPath = () => {
  if (user?.role === 'admin') return '/admin/patients';
  if (user?.role === 'doctor') return '/doctor/patients';
  return '/patients';
};
navigate(getPatientsPath());
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genders = ['Male', 'Female', 'Other'];
  const wards = ['ICU', 'Emergency', 'General', 'Pediatric', 'Maternity', 'Cardiology', 'Neurology', 'Orthopedics'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {isEdit ? 'Edit Patient' : 'Register New Patient'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {isEdit ? 'Update patient information' : 'Fill in the details to register a new patient'}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required={!isEdit}
                disabled={isEdit}
                helperText={isEdit ? "Email cannot be changed" : "Used for patient login"}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Age *"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Gender *</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="Gender *"
                >
                  {genders.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Blood Group *</InputLabel>
                <Select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  label="Blood Group *"
                >
                  {bloodGroups.map((bg) => (
                    <MenuItem key={bg} value={bg}>
                      {bg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Ward *</InputLabel>
                <Select
                  name="ward"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  label="Ward *"
                >
                  {wards.map((ward) => (
                    <MenuItem key={ward} value={ward}>
                      {ward}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Emergency Contact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name and phone number of emergency contact"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Initial Diagnosis"
                name="diagnosis"
                multiline
                rows={2}
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Initial diagnosis or reason for admission"
              />
            </Grid>
          </Grid>

          {!isEdit && (
            <Alert severity="info" sx={{ mt: 2, py: 0 }}>
              <Typography variant="caption">
                <strong>Login Credentials:</strong> {formData.email || '[Email]'} / patient123
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/patients')} size="small">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading} size="small">
              {loading ? <CircularProgress size={20} /> : (isEdit ? 'Update Patient' : 'Register Patient')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientForm;
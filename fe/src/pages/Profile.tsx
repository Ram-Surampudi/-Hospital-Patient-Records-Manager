import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Card,
  CardContent,
  alpha,
  useTheme,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  MedicalServices as MedicalIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as SuperAdminIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';

interface UserProfile {
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
  patientProfile?: {
    bloodGroup: string;
    allergies: string;
    chronicConditions: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
}

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [doctorEditForm, setDoctorEditForm] = useState({
    specialization: '',
    qualification: '',
    experienceYears: '',
    licenseNumber: '',
    department: '',
    consultationFee: '',
  });

  const [patientEditForm, setPatientEditForm] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/me');
      setProfile(response.data);
      
      // Initialize edit forms
      setEditForm({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
      });
      
      if (response.data.doctorProfile) {
        setDoctorEditForm({
          specialization: response.data.doctorProfile.specialization || '',
          qualification: response.data.doctorProfile.qualification || '',
          experienceYears: response.data.doctorProfile.experienceYears?.toString() || '',
          licenseNumber: response.data.doctorProfile.licenseNumber || '',
          department: response.data.doctorProfile.department || '',
          consultationFee: response.data.doctorProfile.consultationFee?.toString() || '',
        });
      }
      
      if (response.data.patientProfile) {
        setPatientEditForm({
          bloodGroup: response.data.patientProfile.bloodGroup || '',
          allergies: response.data.patientProfile.allergies || '',
          chronicConditions: response.data.patientProfile.chronicConditions || '',
          emergencyContact: response.data.patientProfile.emergencyContact || '',
          emergencyPhone: response.data.patientProfile.emergencyPhone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
      };
      
      if (profile?.role === 'doctor' && doctorEditForm) {
        updateData.doctorProfile = {
          specialization: doctorEditForm.specialization,
          qualification: doctorEditForm.qualification,
          experienceYears: parseInt(doctorEditForm.experienceYears),
          licenseNumber: doctorEditForm.licenseNumber,
          department: doctorEditForm.department,
          consultationFee: parseFloat(doctorEditForm.consultationFee),
        };
      }
      
      if (profile?.role === 'patient' && patientEditForm) {
        updateData.patientProfile = {
          bloodGroup: patientEditForm.bloodGroup,
          allergies: patientEditForm.allergies,
          chronicConditions: patientEditForm.chronicConditions,
          emergencyContact: patientEditForm.emergencyContact,
          emergencyPhone: patientEditForm.emergencyPhone,
        };
      }
      
      await axios.put('/users/profile', updateData);
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      await axios.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Administrator';
      case 'admin': return 'Hospital Administrator';
      case 'doctor': return 'Medical Doctor';
      case 'patient': return 'Patient';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={200} height={50} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          My Profile
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setChangePasswordOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Change Password
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                height: 100,
                background: `linear-gradient(135deg, ${getRoleColor(profile.role)} 0%, ${alpha(getRoleColor(profile.role), 0.6)} 100%)`,
              }}
            />
            <Box sx={{ textAlign: 'center', mt: -5, mb: 2 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  bgcolor: getRoleColor(profile.role),
                  border: '4px solid white',
                  boxShadow: theme.shadows[3],
                }}
              >
                {getRoleIcon(profile.role)}
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {profile.name}
              </Typography>
              <Chip
                label={getRoleDisplayName(profile.role)}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: alpha(getRoleColor(profile.role), 0.1),
                  color: getRoleColor(profile.role),
                  fontWeight: 500,
                }}
              />
              <Chip
                label={profile.isActive ? 'Active' : 'Inactive'}
                size="small"
                sx={{
                  mt: 1,
                  ml: 1,
                  bgcolor: profile.isActive ? alpha('#2ed573', 0.1) : alpha('#ff4757', 0.1),
                  color: profile.isActive ? '#2ed573' : '#ff4757',
                }}
              />
            </Box>
            <Divider />
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Email:</strong> {profile.email}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <BadgeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Role:</strong> {getRoleDisplayName(profile.role)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1">{profile.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Email Address</Typography>
                  <Typography variant="body1">{profile.email}</Typography>
                </Grid>
              </Grid>

              {/* Doctor Specific Information */}
              {profile.role === 'doctor' && profile.doctorProfile && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mt: 3 }} gutterBottom>
                    Professional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Specialization</Typography>
                      <Typography variant="body1">{profile.doctorProfile.specialization}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Qualification</Typography>
                      <Typography variant="body1">{profile.doctorProfile.qualification}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Experience</Typography>
                      <Typography variant="body1">{profile.doctorProfile.experienceYears} years</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">License Number</Typography>
                      <Typography variant="body1">{profile.doctorProfile.licenseNumber}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                      <Typography variant="body1">{profile.doctorProfile.department}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Consultation Fee</Typography>
                      <Typography variant="body1">${profile.doctorProfile.consultationFee}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Patient Specific Information */}
              {profile.role === 'patient' && profile.patientProfile && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mt: 3 }} gutterBottom>
                    Medical Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Blood Group</Typography>
                      <Typography variant="body1">{profile.patientProfile.bloodGroup || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Allergies</Typography>
                      <Typography variant="body1">{profile.patientProfile.allergies || 'None'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="textSecondary">Chronic Conditions</Typography>
                      <Typography variant="body1">{profile.patientProfile.chronicConditions || 'None'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Emergency Contact</Typography>
                      <Typography variant="body1">{profile.patientProfile.emergencyContact || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="textSecondary">Emergency Phone</Typography>
                      <Typography variant="body1">{profile.patientProfile.emergencyPhone || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600}>Edit Profile</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                size="small"
              />
            </Grid>
            
            {profile.role === 'doctor' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>
                    Professional Details
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    value={doctorEditForm.specialization}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, specialization: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    value={doctorEditForm.qualification}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, qualification: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Experience (Years)"
                    type="number"
                    value={doctorEditForm.experienceYears}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, experienceYears: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={doctorEditForm.licenseNumber}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, licenseNumber: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={doctorEditForm.department}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, department: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Consultation Fee ($)"
                    type="number"
                    value={doctorEditForm.consultationFee}
                    onChange={(e) => setDoctorEditForm({ ...doctorEditForm, consultationFee: e.target.value })}
                    size="small"
                  />
                </Grid>
              </>
            )}

            {profile.role === 'patient' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>
                    Medical Information
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Blood Group"
                    value={patientEditForm.bloodGroup}
                    onChange={(e) => setPatientEditForm({ ...patientEditForm, bloodGroup: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Allergies"
                    value={patientEditForm.allergies}
                    onChange={(e) => setPatientEditForm({ ...patientEditForm, allergies: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Chronic Conditions"
                    value={patientEditForm.chronicConditions}
                    onChange={(e) => setPatientEditForm({ ...patientEditForm, chronicConditions: e.target.value })}
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={patientEditForm.emergencyContact}
                    onChange={(e) => setPatientEditForm({ ...patientEditForm, emergencyContact: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    value={patientEditForm.emergencyPhone}
                    onChange={(e) => setPatientEditForm({ ...patientEditForm, emergencyPhone: e.target.value })}
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleUpdateProfile} variant="contained" startIcon={<SaveIcon />} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600}>Change Password</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2, py: 0 }}>
            Password must be at least 6 characters long
          </Alert>
          <TextField
            fullWidth
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { patientService, userService } from '../services';

interface DashboardStats {
  totalPatients: number;
  admittedPatients: number;
  dischargedToday: number;
  totalUsers: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    admittedPatients: 0,
    dischargedToday: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, usersRes] = await Promise.all([
        patientService.getAll(),
        user?.role === 'superadmin' ? userService.getAll() : Promise.resolve({ data: [] }),
      ]);

      const patients = patientsRes.data;
      const totalPatients = patients.length;
      const admittedPatients = patients.filter((p: any) => p.status === 'admitted').length;
      const dischargedToday = patients.filter((p: any) =>
        p.status === 'discharged' &&
        new Date(p.dischargedAt).toDateString() === new Date().toDateString()
      ).length;

      setStats({
        totalPatients,
        admittedPatients,
        dischargedToday,
        totalUsers: usersRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: getRoleColor(user?.role || ''),
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role?.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2">Total Patients</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.admittedPatients}
                </Typography>
                <Typography variant="body2">Admitted</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.dischargedToday}
                </Typography>
                <Typography variant="body2">Discharged Today</Typography>
              </Paper>
            </Grid>
            {user?.role === 'superadmin' && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main">
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2">Total Users</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

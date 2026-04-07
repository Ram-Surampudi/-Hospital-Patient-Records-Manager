import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';
import AddDoctor from './pages/AddDoctor';
import AddPatient from './pages/AddPatient';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import PatientForm from './pages/PatientForm';
import Chat from './pages/Chat';
import SuperAdminPanel from './pages/SuperAdminPanel';
import Profile from './pages/Profile';
import PatientDashboard from './pages/PatientDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Super Admin Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<RoleBasedRoute allowedRoles={['superadmin']} />}>
                <Route element={<Layout />}>
                  <Route path="/superadmin/dashboard" element={<SuperAdminPanel />} />
                  <Route path="/superadmin/hospitals" element={<SuperAdminPanel />} />
                  <Route path="/superadmin/admins" element={<SuperAdminPanel />} />
                  <Route path="/superadmin/doctors" element={<SuperAdminPanel />} />
                  <Route path="/superadmin/chat" element={<Chat />} />
                  <Route path="/superadmin/profile" element={<Profile />} />
                </Route>
              </Route>
            </Route>
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                <Route element={<Layout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/doctors/new" element={<AddDoctor />} />
                  <Route path="/admin/patients/new" element={<AddPatient />} />
                  <Route path="/admin/patients" element={<PatientList />} />
                  <Route path="/admin/patients/:id" element={<PatientDetail />} />
                  <Route path="/admin/chat" element={<Chat />} />
                  <Route path="/admin/profile" element={<Profile />} />
                </Route>
              </Route>
            </Route>
            
            {/* Doctor Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<RoleBasedRoute allowedRoles={['doctor']} />}>
                <Route element={<Layout />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/patients" element={<PatientList />} />
                  <Route path="/doctor/patients/new" element={<AddPatient />} />
                  <Route path="/doctor/patients/:id" element={<PatientDetail />} />
                  <Route path="/doctor/chat" element={<Chat />} />
                  <Route path="/doctor/profile" element={<Profile />} />
                </Route>
              </Route>
            </Route>
            
            {/* Patient Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<RoleBasedRoute allowedRoles={['patient']} />}>

                <Route element={<Layout />}>
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/chat" element={<Chat />} />
      <Route path="/patient/profile" element={<Profile />} />
    </Route>
              </Route>
            </Route>
            
            {/* Default redirect based on role */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
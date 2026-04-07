import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Person as ProfileIcon,
  LocalHospital as HospitalIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ Base path
  const getBasePath = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'doctor': return '/doctor';
      case 'superadmin': return '/superadmin';
      case 'patient': return '/patient';
      default: return '';
    }
  };

  const basePath = getBasePath();

  // ✅ FULL MENU (ROLE BASED)
  const getMenuItems = () => {
    const items: any[] = [];

    // 🔷 Dashboard (ALL roles including patient)
    items.push({
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: `${basePath}/dashboard`,
      roles: ['admin', 'doctor', 'superadmin', 'patient'],
    });

    // 🔷 Patients (admin + doctor only)
    if (user?.role === 'admin' || user?.role === 'doctor') {
      items.push({
        text: 'Patients',
        icon: <PeopleIcon />,
        path: `${basePath}/patients`,
        roles: ['admin', 'doctor'],
      });
    }

    // 🔷 Chat (ALL roles including patient ✅)
    items.push({
      text: 'Chat',
      icon: <ChatIcon />,
      path: `${basePath}/chat`,
      roles: ['admin', 'doctor', 'superadmin', 'patient'],
    });

    // 🔷 Super Admin menus
    if (user?.role === 'superadmin') {
      items.push(
        {
          text: 'Hospitals',
          icon: <HospitalIcon />,
          path: '/superadmin/hospitals',
          roles: ['superadmin'],
        },
        {
          text: 'Admins',
          icon: <AdminIcon />,
          path: '/superadmin/admins',
          roles: ['superadmin'],
        },
        {
          text: 'Doctors',
          icon: <MedicalIcon />,
          path: '/superadmin/doctors',
          roles: ['superadmin'],
        }
      );
    }

    // 🔷 Profile (ALL roles including patient)
    items.push({
      text: 'Profile',
      icon: <ProfileIcon />,
      path: `${basePath}/profile`,
      roles: ['admin', 'doctor', 'superadmin', 'patient'],
    });

    return items;
  };

  const menuItems = getMenuItems();

  // ✅ Role Display
  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'superadmin': return 'Super Administrator';
      case 'admin': return 'Hospital Administrator';
      case 'doctor': return 'Medical Doctor';
      case 'patient': return 'Patient';
      default: return 'User';
    }
  };

  // ✅ Role Color
  const getRoleColor = () => {
    switch (user?.role) {
      case 'superadmin': return '#ff6b6b';
      case 'admin': return '#4ecdc4';
      case 'doctor': return '#45b7d1';
      case 'patient': return '#6c5ce7';
      default: return '#96ceb4';
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1a1a2e',
          color: '#fff',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />

      {/* 🔷 HEADER */}
      <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Hospital Manager
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: alpha('#fff', 0.7), display: 'block', mt: 1 }}
        >
          {getRoleDisplayName()}
        </Typography>

        <Box
          sx={{
            mt: 1.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(getRoleColor(), 0.2),
            color: getRoleColor(),
            fontSize: '0.7rem',
            display: 'inline-block',
          }}
        >
          {user?.name}
        </Box>
      </Box>

      <Divider sx={{ bgcolor: alpha('#fff', 0.1) }} />

      {/* 🔷 MENU */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                cursor: 'pointer',

                bgcolor: isActive ? alpha('#1976d2', 0.3) : 'transparent',

                '&:hover': {
                  bgcolor: alpha('#fff', 0.08),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#1976d2' : alpha('#fff', 0.7),
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  sx: {
                    color: isActive ? '#1976d2' : alpha('#fff', 0.8),
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
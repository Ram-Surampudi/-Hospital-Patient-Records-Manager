import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ open, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfile = () => {
    handleClose();
    if (user?.role === 'admin') navigate('/admin/profile');
    else if (user?.role === 'doctor') navigate('/doctor/profile');
    else if (user?.role === 'superadmin') navigate('/superadmin/profile');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '#ff6b6b';
      case 'admin':
        return '#4ecdc4';
      case 'doctor':
        return '#45b7d1';
      default:
        return '#96ceb4';
    }
  };

  const getDashboardTitle = () => {
    if (user?.role === 'admin') return 'Admin Dashboard';
    if (user?.role === 'doctor') return 'Doctor Dashboard';
    if (user?.role === 'superadmin') return 'Super Admin Panel';
    return 'Hospital Patient Records';
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {getDashboardTitle()}
        </Typography>
        
        <IconButton color="inherit">
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              mr: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: getRoleColor(user?.role || ''),
              color: 'white',
            }}
          >
            {user?.role?.toUpperCase()}
          </Typography>
          <IconButton onClick={handleMenu} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user?.role || '') }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
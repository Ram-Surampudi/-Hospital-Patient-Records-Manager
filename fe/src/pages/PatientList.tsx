import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Grid,
  alpha,
  useTheme,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

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

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchPatients();
  }, [ward, status]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (ward) params.ward = ward;
      if (status) params.status = status;
      if (search) params.search = search;

      const response = await axios.get('/patients', { params });
      setPatients(response.data);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPatients();
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setWard('');
    setStatus('');
    setPage(0);
    fetchPatients();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/patients/${id}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete patient');
      }
    }
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

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': '#1976d2',
      'A-': '#2196f3',
      'B+': '#2ed573',
      'B-': '#00b894',
      'O+': '#ff4757',
      'O-': '#ff6b81',
      'AB+': '#9b59b6',
      'AB-': '#a29bfe',
    };
    return colors[bloodGroup] || '#747d8c';
  };

  // Get base path based on user role
  const getBasePath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'doctor') return '/doctor';
    if (user?.role === 'superadmin') return '/superadmin';
    return '';
  };

  const basePath = getBasePath();

  // Role-based action visibility
  const canEdit = user?.role === 'admin' || user?.role === 'superadmin';
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';
  const canAdd = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'doctor';

  // Navigation handlers
  const handleViewPatient = (id: string) => {
    navigate(`${basePath}/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    navigate(`${basePath}/patients/${id}/edit`);
  };

  const handleAddPatient = () => {
    navigate(`${basePath}/patients/new`);
  };

  const hasFilters = search !== '' || ward !== '' || status !== '';

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={250} height={50} />
          <Skeleton variant="rounded" width={180} height={40} />
        </Box>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={400} />
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
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Patient Directory
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage and view all patient records
          </Typography>
        </Box>
        {canAdd && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Register New Patient
          </Button>
        )}
      </Box>

      {/* Filters Section */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or phone"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ward</InputLabel>
              <Select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                label="Ward"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Wards</MenuItem>
                <MenuItem value="ICU">ICU</MenuItem>
                <MenuItem value="Emergency">Emergency</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Pediatric">Pediatric</MenuItem>
                <MenuItem value="Maternity">Maternity</MenuItem>
                <MenuItem value="Cardiology">Cardiology</MenuItem>
                <MenuItem value="Neurology">Neurology</MenuItem>
                <MenuItem value="Orthopedics">Orthopedics</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="admitted">Admitted</MenuItem>
                <MenuItem value="discharged">Discharged</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                Search
              </Button>
              {hasFilters && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: theme.palette.grey[300],
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {/* Active Filters Display */}
        {hasFilters && (
          <Box display="flex" gap={1} mt={2} flexWrap="wrap">
            <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            {search && (
              <Chip
                label={`Search: ${search}`}
                size="small"
                onDelete={() => setSearch('')}
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
            {ward && (
              <Chip
                label={`Ward: ${ward}`}
                size="small"
                onDelete={() => setWard('')}
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
            {status && (
              <Chip
                label={`Status: ${status}`}
                size="small"
                onDelete={() => setStatus('')}
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Patients Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[1],
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Patient ID</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Age/Gender</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Blood Group</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Ward</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Admitted On</TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    No patients found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Try adjusting your search or filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient, index) => (
                  <TableRow
                    key={patient.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.3),
                      transition: 'background-color 0.2s',
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
                          bgcolor: alpha(getBloodGroupColor(patient.bloodGroup), 0.1),
                          color: getBloodGroupColor(patient.bloodGroup),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{patient.ward}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getStatusBgColor(patient.status),
                          color: getStatusColor(patient.status),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 26,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(patient.admittedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View Details" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleViewPatient(patient.id)}
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
                        {canEdit && (
                          <Tooltip title="Edit Patient" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditPatient(patient.id)}
                              sx={{
                                color: theme.palette.warning.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Delete Patient" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(patient.id)}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        {patients.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={patients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              '& .MuiTablePagination-select': {
                borderRadius: 1,
              },
            }}
          />
        )}
      </TableContainer>
    </Box>
  );
};

export default PatientList;
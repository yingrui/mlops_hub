import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Science as ExperimentIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar, {
  SearchFilters,
} from '../../components/UI/SearchBar/SearchBar';
import { Experiment } from '../../types';
import { apiService } from '../../services/api';

const Experiments: React.FC = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  // Prevent duplicate API calls
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadExperiments();
    }
  }, []);

  const loadExperiments = async () => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    
    try {
      hasLoaded.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.getExperiments();
      const experimentsData = response.experiments || [];
      
      // Convert MLflow experiments to frontend format
      const convertedExperiments = experimentsData.map((exp: any) => 
        apiService.convertMLflowToExperiment(exp)
      );
      
      setExperiments(convertedExperiments);
      setFilteredExperiments(convertedExperiments);
    } catch (err) {
      console.error('Failed to load experiments:', err);
      setError(`Failed to load experiments: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    let filtered = experiments;

    if (query) {
      filtered = filtered.filter(
        experiment =>
          experiment.name.toLowerCase().includes(query.toLowerCase()) ||
          experiment.description.toLowerCase().includes(query.toLowerCase()) ||
          experiment.tags.some(tag =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    if (filters.visibility) {
      // Map visibility filter to experiment status or other criteria
      if (filters.visibility === 'public') {
        filtered = filtered.filter(
          experiment => experiment.status === 'active'
        );
      } else if (filters.visibility === 'private') {
        filtered = filtered.filter(
          experiment => experiment.status === 'completed'
        );
      }
    }

    if (filters.owner) {
      filtered = filtered.filter(experiment =>
        experiment.owner.username
          .toLowerCase()
          .includes(filters.owner.toLowerCase())
      );
    }

    setFilteredExperiments(filtered);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    experiment: Experiment
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedExperiment(experiment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExperiment(null);
  };

  const handleView = () => {
    if (selectedExperiment) {
      navigate(`/experiments/${selectedExperiment.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedExperiment) {
      console.log('Edit experiment:', selectedExperiment.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedExperiment) {
      setExperiments(experiments.filter(e => e.id !== selectedExperiment.id));
      setFilteredExperiments(
        filteredExperiments.filter(e => e.id !== selectedExperiment.id)
      );
    }
    handleMenuClose();
  };

  const handleRunExperiment = () => {
    if (selectedExperiment) {
      console.log('Run experiment:', selectedExperiment.id);
    }
    handleMenuClose();
  };

  const handleStopExperiment = () => {
    if (selectedExperiment) {
      console.log('Stop experiment:', selectedExperiment.id);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <LinearProgress sx={{ width: 20, height: 20, borderRadius: '50%' }} />
        );
      case 'completed':
        return <RunIcon color="primary" />;
      case 'failed':
        return <StopIcon color="error" />;
      default:
        return null;
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
        renderCell: params => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <ExperimentIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {params.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {params.row.runs.length} runs
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: params => (
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(params.value)}
            <Chip
              label={params.value}
              size="small"
              color={getStatusColor(params.value) as any}
              variant="outlined"
            />
          </Box>
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        width: 250,
        renderCell: params => (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {params.value.slice(0, 3).map((tag: string, index: number) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
            {params.value.length > 3 && (
              <Chip
                label={`+${params.value.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        ),
      },
      {
        field: 'owner',
        headerName: 'Owner',
        width: 150,
        renderCell: params => (
          <Typography variant="body2">{params.value.username}</Typography>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 180,
        renderCell: params => (
          <Typography variant="body2">
            {new Date(params.value).toLocaleString()}
          </Typography>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Experiments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/experiments/create')}
        >
          Create Experiment
        </Button>
      </Box>

      <Card>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search experiments..."
            showFilters={true}
          />

          <DataTable
            rows={filteredExperiments}
            columns={columns}
            onRowClick={params => navigate(`/experiments/${params.id}`)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={row => row.id}
            density="comfortable"
          />
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {selectedExperiment?.status === 'active' ? (
          <MenuItem onClick={handleStopExperiment}>
            <ListItemIcon>
              <StopIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Stop Experiment</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleRunExperiment}>
            <ListItemIcon>
              <RunIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Run Experiment</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Experiments;

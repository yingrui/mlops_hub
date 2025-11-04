import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Monitor as MonitoringIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar, {
  SearchFilters,
} from '../../components/UI/SearchBar/SearchBar';
import { ModelMonitoring, Alert as AlertType } from '../../types';

// Mock data for demonstration
const mockMonitoring: ModelMonitoring[] = [
  {
    id: '1',
    modelId: '1',
    name: 'Sentiment Analysis API',
    type: 'api',
    status: 'active',
    metrics: [
      {
        name: 'accuracy',
        value: 0.94,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { min: 0.9, max: 1.0 },
        status: 'normal',
      },
      {
        name: 'prediction_drift',
        value: 0.02,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { max: 0.1 },
        status: 'normal',
      },
    ],
    alerts: [
      {
        id: '1',
        type: 'performance',
        severity: 'medium',
        message: 'Accuracy dropped below 90% threshold',
        status: 'active',
        createdAt: '2023-02-25T15:30:00Z',
      },
    ],
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2023-02-25T16:00:00Z',
  },
  {
    id: '2',
    modelId: '2',
    name: 'Token Classification Batch',
    type: 'batch',
    status: 'active',
    metrics: [
      {
        name: 'accuracy',
        value: 0.87,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { min: 0.85, max: 1.0 },
        status: 'normal',
      },
      {
        name: 'data_drift',
        value: 0.15,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { max: 0.1 },
        status: 'warning',
      },
    ],
    alerts: [
      {
        id: '2',
        type: 'drift',
        severity: 'high',
        message: 'Data drift detected - 15% deviation from training data',
        status: 'active',
        createdAt: '2023-02-25T14:00:00Z',
      },
    ],
    createdAt: '2023-02-15T09:00:00Z',
    updatedAt: '2023-02-25T16:00:00Z',
  },
  {
    id: '3',
    modelId: '3',
    name: 'Text Embedding API',
    type: 'api',
    status: 'paused',
    metrics: [
      {
        name: 'mae',
        value: 0.12,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { max: 0.15 },
        status: 'normal',
      },
      {
        name: 'prediction_drift',
        value: 0.08,
        timestamp: '2023-02-25T16:00:00Z',
        threshold: { max: 0.1 },
        status: 'warning',
      },
    ],
    alerts: [],
    createdAt: '2023-02-10T11:00:00Z',
    updatedAt: '2023-02-25T16:00:00Z',
  },
];

const Monitoring: React.FC = () => {
  const navigate = useNavigate();
  const [monitoring, setMonitoring] =
    useState<ModelMonitoring[]>(mockMonitoring);
  const [filteredMonitoring, setFilteredMonitoring] =
    useState<ModelMonitoring[]>(mockMonitoring);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMonitor, setSelectedMonitor] =
    useState<ModelMonitoring | null>(null);

  const handleSearch = (query: string, filters: SearchFilters) => {
    let filtered = monitoring;

    if (query) {
      filtered = filtered.filter(monitor =>
        monitor.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredMonitoring(filtered);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    monitor: ModelMonitoring
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMonitor(monitor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMonitor(null);
  };

  const handleView = () => {
    if (selectedMonitor) {
      navigate(`/monitoring/${selectedMonitor.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedMonitor) {
      console.log('Edit monitoring:', selectedMonitor.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMonitor) {
      setMonitoring(monitoring.filter(m => m.id !== selectedMonitor.id));
      setFilteredMonitoring(
        filteredMonitoring.filter(m => m.id !== selectedMonitor.id)
      );
    }
    handleMenuClose();
  };

  const handleStart = () => {
    if (selectedMonitor) {
      setMonitoring(
        monitoring.map(m =>
          m.id === selectedMonitor.id ? { ...m, status: 'active' as const } : m
        )
      );
      setFilteredMonitoring(
        filteredMonitoring.map(m =>
          m.id === selectedMonitor.id ? { ...m, status: 'active' as const } : m
        )
      );
    }
    handleMenuClose();
  };

  const handleStop = () => {
    if (selectedMonitor) {
      setMonitoring(
        monitoring.map(m =>
          m.id === selectedMonitor.id ? { ...m, status: 'paused' as const } : m
        )
      );
      setFilteredMonitoring(
        filteredMonitoring.map(m =>
          m.id === selectedMonitor.id ? { ...m, status: 'paused' as const } : m
        )
      );
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return '🌐';
      case 'batch':
        return '⚡';
      case 'streaming':
        return '📡';
      case 'scheduled':
        return '⏰';
      case 'webhook':
        return '🔗';
      default:
        return '📊';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon color="success" />;
      case 'paused':
        return <StopIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Entrypoint Name',
        width: 200,
        renderCell: params => (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {getTypeIcon(params.row.type)} {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: params => (
          <Chip
            label={params.value}
            size="small"
            color={getStatusColor(params.value) as any}
            variant="outlined"
          />
        ),
      },
      {
        field: 'alerts',
        headerName: 'Alerts',
        width: 120,
        renderCell: params => {
          const activeAlerts = params.value.filter(
            (alert: AlertType) => alert.status === 'active'
          );
          return (
            <Chip
              label={activeAlerts.length}
              size="small"
              color={activeAlerts.length > 0 ? 'error' : 'success'}
              variant="outlined"
            />
          );
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Last Checked',
        width: 150,
        renderCell: params => (
          <Typography variant="body2" color="textSecondary">
            {new Date(params.value).toLocaleString()}
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Monitoring
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/monitoring/create')}
        >
          Add Monitor
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <SearchBar
              placeholder="Search monitoring..."
              onSearch={handleSearch}
            />
          </Box>

          <DataTable
            rows={filteredMonitoring}
            columns={columns}
            onRowClick={params => navigate(`/monitoring/${params.id}`)}
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
        {selectedMonitor?.status === 'active' ? (
          <MenuItem onClick={handleStop}>
            <ListItemIcon>
              <StopIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pause Monitoring</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleStart}>
            <ListItemIcon>
              <StartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Start Monitoring</ListItemText>
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

export default Monitoring;

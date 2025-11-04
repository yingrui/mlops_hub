import React, { useState, useMemo } from 'react';
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
  Visibility as VisibilityIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar, {
  SearchFilters,
} from '../../components/UI/SearchBar/SearchBar';
import { Run } from '../../types';

// Mock data for demonstration
const mockRuns: Run[] = [
  {
    id: '1',
    name: 'Run 1 - BERT Fine-tuning',
    status: 'completed',
    experimentId: '1',
    startedAt: '2023-02-20T10:00:00Z',
    endedAt: '2023-02-20T12:30:00Z',
    duration: 9000, // 2.5 hours in seconds
    parameters: {
      learning_rate: 0.0001,
      batch_size: 16,
      epochs: 10,
      optimizer: 'AdamW',
    },
    metrics: {
      accuracy: 0.94,
      loss: 0.15,
      precision: 0.93,
      recall: 0.92,
      f1_score: 0.925,
    },
    artifacts: [],
    logs: [],
    tags: ['bert', 'sentiment', 'fine-tuning'],
  },
  {
    id: '2',
    name: 'Run 2 - Hyperparameter Search',
    status: 'running',
    experimentId: '1',
    startedAt: '2023-02-25T14:00:00Z',
    endedAt: undefined,
    duration: undefined,
    parameters: {
      learning_rate: 0.0002,
      batch_size: 32,
      epochs: 15,
      optimizer: 'AdamW',
    },
    metrics: {
      accuracy: 0.89,
      loss: 0.22,
    },
    artifacts: [],
    logs: [],
    tags: ['hyperparameter', 'search'],
  },
  {
    id: '3',
    name: 'Run 3 - ResNet Training',
    status: 'failed',
    experimentId: '2',
    startedAt: '2023-02-15T09:00:00Z',
    endedAt: '2023-02-15T10:15:00Z',
    duration: 4500, // 1.25 hours
    parameters: {
      learning_rate: 0.001,
      batch_size: 64,
      epochs: 20,
      optimizer: 'SGD',
    },
    metrics: {
      accuracy: 0.76,
      loss: 0.45,
    },
    artifacts: [],
    logs: [],
    tags: ['resnet', 'image-classification'],
  },
  {
    id: '4',
    name: 'Run 4 - LSTM Forecasting',
    status: 'cancelled',
    experimentId: '3',
    startedAt: '2023-02-10T11:00:00Z',
    endedAt: '2023-02-10T11:30:00Z',
    duration: 1800, // 30 minutes
    parameters: {
      learning_rate: 0.01,
      batch_size: 32,
      epochs: 50,
      optimizer: 'Adam',
    },
    metrics: {
      mae: 0.12,
      rmse: 0.18,
    },
    artifacts: [],
    logs: [],
    tags: ['lstm', 'time-series'],
  },
];

const Runs: React.FC = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Run[]>(mockRuns);
  const [filteredRuns, setFilteredRuns] = useState<Run[]>(mockRuns);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);

  const handleSearch = (query: string, filters: SearchFilters) => {
    let filtered = runs;

    if (query) {
      filtered = filtered.filter(
        run =>
          run.name.toLowerCase().includes(query.toLowerCase()) ||
          run.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredRuns(filtered);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, run: Run) => {
    setAnchorEl(event.currentTarget);
    setSelectedRun(run);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRun(null);
  };

  const handleView = () => {
    if (selectedRun) {
      navigate(`/runs/${selectedRun.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRun) {
      setRuns(runs.filter(r => r.id !== selectedRun.id));
      setFilteredRuns(filteredRuns.filter(r => r.id !== selectedRun.id));
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedRun) {
      console.log('Download run artifacts:', selectedRun.id);
    }
    handleMenuClose();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Running...';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'info';
      case 'completed':
        return 'success';
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
      case 'running':
        return (
          <LinearProgress sx={{ width: 20, height: 20, borderRadius: '50%' }} />
        );
      case 'completed':
        return <RunIcon color="success" />;
      case 'failed':
        return <StopIcon color="error" />;
      case 'cancelled':
        return <StopIcon color="warning" />;
      default:
        return null;
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
        renderCell: params => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
              <RunIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {params.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Experiment: {params.row.experimentId}
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
        field: 'metrics',
        headerName: 'Best Metric',
        width: 150,
        renderCell: params => {
          const metrics = params.value as Record<string, number>;
          const bestMetric = Object.entries(metrics).reduce((a, b) =>
            (a[1] as number) > (b[1] as number) ? a : b
          );
          return (
            <Typography variant="body2">
              {bestMetric[0]}: {(bestMetric[1] as number).toFixed(3)}
            </Typography>
          );
        },
      },
      {
        field: 'duration',
        headerName: 'Duration',
        width: 120,
        renderCell: params => (
          <Typography variant="body2">
            {formatDuration(params.value)}
          </Typography>
        ),
      },
      {
        field: 'parameters',
        headerName: 'Key Parameters',
        width: 200,
        renderCell: params => (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="caption">
              LR: {params.value.learning_rate}
            </Typography>
            <Typography variant="caption">
              Batch: {params.value.batch_size}
            </Typography>
            <Typography variant="caption">
              Epochs: {params.value.epochs}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'startedAt',
        headerName: 'Started',
        width: 150,
        renderCell: params => (
          <Typography variant="body2">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        width: 150,
        renderCell: params => (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {params.value.slice(0, 2).map((tag: string, index: number) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
            {params.value.length > 2 && (
              <Chip
                label={`+${params.value.length - 2}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Runs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/runs/create')}
        >
          Start New Run
        </Button>
      </Box>

      <Card>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search runs..."
            showFilters={true}
          />

          <DataTable
            rows={filteredRuns}
            columns={columns}
            onRowClick={params => navigate(`/runs/${params.id}`)}
            onDelete={handleDelete}
            onDownload={handleDownload}
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
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Artifacts</ListItemText>
        </MenuItem>
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

export default Runs;

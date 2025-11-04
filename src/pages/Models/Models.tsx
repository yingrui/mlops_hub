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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Psychology as ModelIcon,
  PlayArrow as DeployIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar, {
  SearchFilters,
} from '../../components/UI/SearchBar/SearchBar';
import { Model, MLflowRegisteredModel, MLflowModelVersion } from '../../types';
import { apiService } from '../../services/api';

const Models: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const hasLoaded = useRef(false);

  const loadModels = async () => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    
    try {
      hasLoaded.current = true;
      setLoading(true);
      setError(null);

      // Fetch models from MLflow API
      const response = await apiService.getMLflowModels();
      const mlflowModels = response.registered_models || [];

      // Convert MLflow models to frontend format using latest_versions from the response
      const convertedModels = mlflowModels.map(mlflowModel => {
        // Use the latest version from the model's latest_versions field
        const latestVersion = mlflowModel.latest_versions?.[0];
        return apiService.convertMLflowToModel(mlflowModel, latestVersion);
      });

      setModels(convertedModels);
      setFilteredModels(convertedModels);
    } catch (err) {
      console.error('Failed to load models:', err);
      setError('Failed to load models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load models from MLflow API
  useEffect(() => {
    loadModels();
  }, []);

  const handleRefresh = () => {
    hasLoaded.current = false;
    loadModels();
  };

  const handleSearch = async (query: string, filters: SearchFilters) => {
    try {
      setLoading(true);

      if (query) {
        // Use MLflow search API for better search results
        const response = await apiService.searchMLflowModels(
          `name ILIKE '%${query}%'`
        );
        const mlflowModels = response.registered_models || [];

        // Convert using latest_versions from the response
        const convertedModels = mlflowModels.map(mlflowModel => {
          const latestVersion = mlflowModel.latest_versions?.[0];
          return apiService.convertMLflowToModel(mlflowModel, latestVersion);
        });

        setFilteredModels(convertedModels);
      } else {
        // No query, show all models
        setFilteredModels(models);
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to local filtering
      let filtered = models;

      if (query) {
        filtered = filtered.filter(
          model =>
            model.name.toLowerCase().includes(query.toLowerCase()) ||
            model.description.toLowerCase().includes(query.toLowerCase()) ||
            model.tags.some(tag =>
              tag.toLowerCase().includes(query.toLowerCase())
            )
        );
      }

      setFilteredModels(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    model: Model
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedModel(model);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModel(null);
  };

  const handleView = () => {
    if (selectedModel) {
      navigate(`/models/1/versions/3`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedModel) {
      console.log('Edit model:', selectedModel.id);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedModel) {
      try {
        await apiService.deleteMLflowModel(selectedModel.name);
        // Refresh the models list
        await loadModels();
      } catch (err) {
        console.error('Failed to delete model:', err);
        setError('Failed to delete model. Please try again.');
      }
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedModel) {
      console.log('Download model:', selectedModel.id);
    }
    handleMenuClose();
  };

  const handleDeploy = () => {
    if (selectedModel) {
      console.log('Deploy model:', selectedModel.id);
    }
    handleMenuClose();
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 0.9) return 'success';
    if (value >= 0.8) return 'warning';
    return 'error';
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
              <ModelIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {params.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {params.row.framework}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'version',
        headerName: 'Version',
        width: 100,
        renderCell: params => (
          <Typography variant="body2" fontWeight="medium">
            v{params.value}
          </Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
        renderCell: params => (
          <Typography variant="body2" noWrap>
            {params.value || 'No description'}
          </Typography>
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        width: 200,
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
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: params => (
          <Chip
            label={params.value || 'Unknown'}
            size="small"
            color={
              params.value === 'READY'
                ? 'success'
                : params.value === 'FAILED'
                ? 'error'
                : 'warning'
            }
            variant="outlined"
          />
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
        width: 150,
        renderCell: params => (
          <Typography variant="body2">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        ),
      },
    ],
    [navigate]
  );

  if (loading && models.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
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
        <Typography variant="h4">Models</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/models/upload')}
          >
            Create Model
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search models..."
            showFilters={false} // Simplified for MLflow integration
          />

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              rows={filteredModels}
              columns={columns}
              onRowClick={params => navigate(`/models/${params.row.name}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
              getRowId={row => row.id}
              density="comfortable"
            />
          )}
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
        <MenuItem onClick={handleDeploy}>
          <ListItemIcon>
            <DeployIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Deploy</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
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

export default Models;

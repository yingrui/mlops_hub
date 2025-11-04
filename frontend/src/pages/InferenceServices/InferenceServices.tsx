import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridRowId } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import AddServiceDialog from '../../components/UI/AddServiceDialog/AddServiceDialog';
import { InferenceService } from '../../types';
import { apiService } from '../../services/api';

const InferenceServices: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [services, setServices] = useState<InferenceService[]>([]);

  // Prevent duplicate API calls
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadServices();
    }
  }, []);

  const loadServices = async () => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    try {
      hasLoaded.current = true;
      console.log('Loading inference services from API...');
      const data = await apiService.getInferenceServices();
      console.log('API response:', data);
      // Parse tags from JSON string to array for each service
      const processedData = data.map(service => {
        let tags = [];
        try {
          if (service.tags) {
            if (typeof service.tags === 'string') {
              tags = JSON.parse(service.tags);
            } else if (Array.isArray(service.tags)) {
              tags = service.tags;
            }
          }
        } catch (error) {
          console.error('Error parsing tags for service:', service.name, 'tags:', service.tags, error);
          tags = [];
        }
        return {
          ...service,
          tags: tags
        };
      });
      console.log('Processed data:', processedData);
      setServices(processedData);
    } catch (error) {
      console.error('Failed to load inference services:', error);
      // Don't fall back to mock data - just show empty list
      setServices([]);
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;

    return services.filter(
      service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags && (() => {
          try {
            const tags = typeof service.tags === 'string' ? JSON.parse(service.tags) : service.tags;
            return Array.isArray(tags) && tags.some((tag: string) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            );
          } catch (error) {
            return false;
          }
        })()
    );
  }, [services, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      case 'no_response':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon />;
      case 'stopped':
        return <StopIcon />;
      case 'error':
        return <StopIcon />;
      case 'pending':
        return <RefreshIcon />;
      default:
        return <StopIcon />;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.description}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'baseUrl',
      headerName: 'Base URL',
      width: 200,
      renderCell: (params: any) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => window.open(params.value, '_blank')}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'namespace',
      headerName: 'Namespace',
      width: 120,
    },
    {
      field: 'replicas',
      headerName: 'Replicas',
      width: 100,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {params.value}/{params.row.replicas}
        </Typography>
      ),
    },
    {
      field: 'resources',
      headerName: 'Resources',
      width: 150,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="caption" display="block">
            CPU: {params.row.cpu}
          </Typography>
          <Typography variant="caption" display="block">
            Memory: {params.row.memory}
          </Typography>
          {params.row.gpu && (
            <Typography variant="caption" display="block">
              GPU: {params.row.gpu}
            </Typography>
          )}
        </Box>
      ),
      },
      {
        field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params: any) => {
        let tags = [];
        try {
          if (params.value) {
            if (typeof params.value === 'string') {
              tags = JSON.parse(params.value);
            } else if (Array.isArray(params.value)) {
              tags = params.value;
            }
          }
        } catch (error) {
          console.error('Error parsing tags in renderCell:', params.value, error);
          tags = [];
        }
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((tag: string) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            {tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{tags.length - 3} more
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params: any) => (
        <Typography variant="caption">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  const handleCreate = () => {
    setAddDialogOpen(true);
  };

  const handleSaveService = async (service: Partial<InferenceService>) => {
    try {
      // Convert tags array to JSON string for backend
      const serviceData = {
        ...service,
        tags: service.tags ? JSON.stringify(service.tags) : JSON.stringify([])
      };
      const createdService = await apiService.createInferenceService(serviceData);
      // Parse tags back to array for frontend
      const processedService = {
        ...createdService,
        tags: createdService.tags ? JSON.parse(createdService.tags) : []
      };
      setServices(prev => [...prev, processedService]);
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  const handleEdit = (id: GridRowId) => {
    console.log('Edit inference service:', id);
  };

  const handleDelete = async (id: GridRowId) => {
    try {
      await apiService.deleteInferenceService(Number(id));
      setServices(prev => prev.filter(service => service.id !== Number(id)));
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleView = (id: GridRowId) => {
    navigate(`/inference-services/${id}`);
  };

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
        <Typography variant="h4" component="h1">
          Inference Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Service
        </Button>
      </Box>

      <Card>
        <CardContent>
          <SearchBar
            placeholder="Search inference services..."
            onSearch={setSearchQuery}
            showFilters={true}
          />

          <DataTable
            rows={filteredServices}
            columns={columns}
            density="comfortable"
            onRowClick={params => handleView(params.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      <AddServiceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveService}
      />
    </Box>
  );
};

export default InferenceServices;

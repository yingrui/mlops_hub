import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Timeline as ActivitiesIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar, {
  SearchFilters,
} from '../../components/UI/SearchBar/SearchBar';

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'solution_download',
    user: 'Alex Brown',
    resource: 'Knowledge Extraction Solution',
    timestamp: '30 minutes ago',
    status: 'completed',
  },
  {
    id: '2',
    type: 'entrypoint_deploy',
    user: 'John Doe',
    resource: 'Sentiment Analysis API',
    timestamp: '1 hour ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'solution_create',
    user: 'Sarah Wilson',
    resource: 'Fraud Detection Engine',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'dataset_upload',
    user: 'Jane Smith',
    resource: 'Customer Data v2.1',
    timestamp: '3 hours ago',
    status: 'completed',
  },
  {
    id: '5',
    type: 'model_upload',
    user: 'Mike Johnson',
    resource: 'BERT Classification Model',
    timestamp: '5 hours ago',
    status: 'completed',
  },
  {
    id: '6',
    type: 'experiment_create',
    user: 'David Lee',
    resource: 'Hyperparameter Tuning',
    timestamp: '7 hours ago',
    status: 'running',
  },
  {
    id: '7',
    type: 'alert_triggered',
    user: 'System',
    resource: 'Model Drift Alert',
    timestamp: '9 hours ago',
    status: 'warning',
  },
  {
    id: '8',
    type: 'inference_service_deploy',
    user: 'Emma Davis',
    resource: 'NLP Service #2',
    timestamp: '12 hours ago',
    status: 'completed',
  },
  {
    id: '9',
    type: 'model_upload',
    user: 'Chris Taylor',
    resource: 'ResNet-50 Image Classifier',
    timestamp: '1 day ago',
    status: 'completed',
  },
  {
    id: '10',
    type: 'experiment_create',
    user: 'Lisa Wang',
    resource: 'A/B Testing Framework',
    timestamp: '1 day ago',
    status: 'completed',
  },
  {
    id: '11',
    type: 'entrypoint_update',
    user: 'Tom Wilson',
    resource: 'Text Classification API',
    timestamp: '2 days ago',
    status: 'completed',
  },
  {
    id: '12',
    type: 'dataset_upload',
    user: 'Maria Garcia',
    resource: 'Financial Transactions Dataset',
    timestamp: '2 days ago',
    status: 'completed',
  },
  {
    id: '13',
    type: 'solution_download',
    user: 'Alex Brown',
    resource: 'Time Series Forecasting',
    timestamp: '3 days ago',
    status: 'completed',
  },
  {
    id: '14',
    type: 'inference_service_update',
    user: 'John Doe',
    resource: 'Computer Vision Service',
    timestamp: '3 days ago',
    status: 'completed',
  },
  {
    id: '15',
    type: 'alert_triggered',
    user: 'System',
    resource: 'High Memory Usage Alert',
    timestamp: '4 days ago',
    status: 'warning',
  },
];

const Activities: React.FC = () => {
  const [activities, setActivities] = useState(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState(mockActivities);

  const handleSearch = (query: string, filters?: any) => {
    let filtered = activities;

    if (query) {
      filtered = filtered.filter(
        activity =>
          activity.resource.toLowerCase().includes(query.toLowerCase()) ||
          activity.user.toLowerCase().includes(query.toLowerCase()) ||
          activity.type.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(
        activity => activity.status === filters.status
      );
    }

    if (filters?.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    setFilteredActivities(filtered);
  };

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    setActivities([...mockActivities]);
    setFilteredActivities([...mockActivities]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'running':
        return (
          <LinearProgress sx={{ width: 20, height: 20, borderRadius: '50%' }} />
        );
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'solution_download':
        return 'Downloaded Solution';
      case 'entrypoint_deploy':
        return 'Deployed Entrypoint';
      case 'solution_create':
        return 'Created Solution';
      case 'dataset_upload':
        return 'Uploaded Dataset';
      case 'model_upload':
        return 'Uploaded Model';
      case 'experiment_create':
        return 'Created Experiment';
      case 'alert_triggered':
        return 'Alert Triggered';
      case 'inference_service_deploy':
        return 'Deployed Service';
      case 'entrypoint_update':
        return 'Updated Entrypoint';
      case 'inference_service_update':
        return 'Updated Service';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'resource',
        headerName: 'Activity',
        width: 300,
        renderCell: params => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {getStatusIcon(params.row.status)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {params.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getActivityTypeLabel(params.row.type)}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'user',
        headerName: 'User',
        width: 150,
        renderCell: params => (
          <Typography variant="body2">{params.value}</Typography>
        ),
      },
      {
        field: 'timestamp',
        headerName: 'Time',
        width: 120,
        renderCell: params => (
          <Typography variant="body2" color="textSecondary">
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: params => (
          <Chip
            label={params.value}
            color={getStatusColor(params.value) as any}
            size="small"
            variant="outlined"
          />
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
        <Typography variant="h4">Activities</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      <Card>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search activities..."
            showFilters={true}
            filterOptions={[
              {
                label: 'Status',
                value: 'status',
                options: [
                  { label: 'Completed', value: 'completed' },
                  { label: 'Running', value: 'running' },
                  { label: 'Warning', value: 'warning' },
                ],
              },
              {
                label: 'Type',
                value: 'type',
                options: [
                  { label: 'Solution Download', value: 'solution_download' },
                  { label: 'Entrypoint Deploy', value: 'entrypoint_deploy' },
                  { label: 'Solution Create', value: 'solution_create' },
                  { label: 'Dataset Upload', value: 'dataset_upload' },
                  { label: 'Model Upload', value: 'model_upload' },
                  { label: 'Experiment Create', value: 'experiment_create' },
                  { label: 'Alert Triggered', value: 'alert_triggered' },
                  {
                    label: 'Inference Service Deploy',
                    value: 'inference_service_deploy',
                  },
                  { label: 'Entrypoint Update', value: 'entrypoint_update' },
                  {
                    label: 'Inference Service Update',
                    value: 'inference_service_update',
                  },
                ],
              },
            ]}
          />

          <DataTable
            rows={filteredActivities}
            columns={columns}
            getRowId={row => row.id}
            density="comfortable"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Activities;

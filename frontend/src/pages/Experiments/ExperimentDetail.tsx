import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  Assessment as MetricsIcon,
  Science as ExperimentIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from 'recharts';

import DataTable from '../../components/UI/DataTable/DataTable';
import { Run, Experiment } from '../../types';
import { GridRowId } from '@mui/x-data-grid';
import { apiService } from '../../services/api';

const ExperimentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // Start with Runs tab
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate API calls
  const hasLoadedExperiment = useRef(false);
  const hasLoadedRuns = useRef(false);

  useEffect(() => {
    if (id && !hasLoadedExperiment.current) {
      loadExperiment();
    }
  }, [id]);

  useEffect(() => {
    if (id && !hasLoadedRuns.current) {
      loadRuns();
    }
  }, [id]);

  const loadExperiment = async () => {
    if (!id || hasLoadedExperiment.current) return;
    
    try {
      hasLoadedExperiment.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.getExperiment(id);
      console.log('Raw MLflow experiment response:', response);
      const convertedExperiment = apiService.convertMLflowToExperiment(response);
      console.log('Converted experiment:', convertedExperiment);
      setExperiment(convertedExperiment);
    } catch (err) {
      console.error('Failed to load experiment:', err);
      setError(`Failed to load experiment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRuns = async () => {
    if (!id || hasLoadedRuns.current) return;
    
    try {
      hasLoadedRuns.current = true;
      
      const response = await apiService.searchRuns(id);
      const runsData = response.runs || [];
      
      // Convert MLflow runs to frontend format
      const convertedRuns = runsData.map((run: any) => 
        apiService.convertMLflowToRun(run)
      );
      
      setRuns(convertedRuns);
    } catch (err) {
      console.error('Failed to load runs:', err);
      // Don't set error for runs, just log it
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finished':
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleEditRun = (runId: GridRowId) => {
    console.log('Edit run:', runId);
    // TODO: Implement edit run functionality
  };

  const handleDeleteRun = (runId: GridRowId) => {
    console.log('Delete run:', runId);
    // TODO: Implement delete run functionality
  };

  const handleDownloadRun = (runId: GridRowId) => {
    console.log('Download run:', runId);
    // TODO: Implement download run functionality
  };

  const handleViewRun = (runId: GridRowId) => {
    navigate(`/runs/${runId}`);
  };

  const runsColumns = [
    {
      field: 'name',
      headerName: 'Run Name',
      width: 200,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.row.startedAt).toLocaleString()}
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
          size="small"
          color={getStatusColor(params.value) as any}
        />
      ),
    },
    {
      field: 'dataset',
      headerName: 'Dataset',
      width: 200,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.row.dataset || 'N/A'}
          </Typography>
          {params.row.datasetDigest && (
            <Typography variant="caption" color="text.secondary">
              {params.row.datasetDigest}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 120,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {Math.floor(params.value / 60)}m {params.value % 60}s
        </Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params: any) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {params.value.slice(0, 2).map((tag: string, index: number) => (
            <Tooltip key={index} title={tag} arrow>
              <Chip label={tag} size="small" variant="outlined" />
            </Tooltip>
          ))}
          {params.value.length > 2 && (
            <Tooltip 
              title={
                <Box>
                  {params.value.slice(2).map((tag: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {tag}
                    </Typography>
                  ))}
                </Box>
              } 
              arrow
            >
              <Chip
                label={`+${params.value.length - 2}`}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => handleViewRun(params.row.id)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteRun(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const renderRuns = () => (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Runs ({runs.length})</Typography>
        </Box>

        <DataTable
          rows={runs}
          columns={runsColumns}
          onRowClick={params => handleViewRun(params.id)}
          onEdit={handleEditRun}
          onDelete={handleDeleteRun}
          onDownload={handleDownloadRun}
          getRowId={row => row.id}
          pageSize={10}
        />
      </CardContent>
    </Card>
  );

  const renderMetrics = () => {
    const completedRuns = runs.filter(run => run.status === 'finished' || run.status === 'completed');

    // Extract all unique metrics from runs
    const allMetrics = new Set<string>();
    runs.forEach(run => {
      Object.keys(run.metrics || {}).forEach(metric => allMetrics.add(metric));
    });

    // Get runs with metrics data for charts
    const runsWithMetrics = completedRuns.filter(run => Object.keys(run.metrics || {}).length > 0);

    return (
      <Grid container spacing={3}>
        {/* Metrics Charts */}
        {Array.from(allMetrics).map(metric => {
          const chartData = runsWithMetrics.map(run => ({
            name: run.name,
            value: run.metrics[metric] || 0,
            runId: run.id,
            timestamp: run.startedAt
          }));

          return (
            <Grid item xs={12} md={6} key={metric}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {metric.toUpperCase()} Trend Across Runs
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 'dataMax']} />
                      <RechartsTooltip 
                        formatter={(value: any) => [value.toFixed(3), metric.toUpperCase()]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return `${payload[0].payload.runId}`;
                          }
                          return label;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };


  // Loading state
  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/experiments')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Loading Experiment...
          </Typography>
        </Box>
        <LinearProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/experiments')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="error">
            Error
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                hasLoadedExperiment.current = false;
                hasLoadedRuns.current = false;
                loadExperiment();
              }}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // No experiment data
  if (!experiment) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/experiments')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Experiment Not Found
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography>The requested experiment could not be found.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/experiments')}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
          <ExperimentIcon fontSize="large" />
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="h4" gutterBottom>
            {experiment.name || 'Unknown Experiment'}
          </Typography>
          <Chip
            label="Experiment"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Rename
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArchiveIcon />}
            color="secondary"
          >
            Archive
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<TimelineIcon />} label="Runs" />
            <Tab icon={<MetricsIcon />} label="Metrics" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderRuns()}
          {activeTab === 1 && renderMetrics()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExperimentDetail;
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as DeployIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  Assessment as MetricsIcon,
  PlayArrow as PlaygroundIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
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
  BarChart,
  Bar,
} from 'recharts';

import { Entrypoint } from '../../types';
import { apiService } from '../../services/api';

// Mock metrics data for charts
const mockMetricsData = [
  { time: '00:00', requests: 120, latency: 42, errors: 2 },
  { time: '04:00', requests: 85, latency: 38, errors: 1 },
  { time: '08:00', requests: 340, latency: 45, errors: 3 },
  { time: '12:00', requests: 520, latency: 48, errors: 5 },
  { time: '16:00', requests: 480, latency: 44, errors: 2 },
  { time: '20:00', requests: 380, latency: 46, errors: 4 },
];

const EntrypointDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [entrypoint, setEntrypoint] = useState<Entrypoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playgroundRequestBody, setPlaygroundRequestBody] = useState('{"texts": [""]}');
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [dialogContentType, setDialogContentType] = useState<'request' | 'response'>('request');
  const [metricsData, setMetricsData] = useState<any>(null);
  const [dailyMetricsData, setDailyMetricsData] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  
  // Prevent duplicate API calls
  const hasLoaded = useRef(false);
  const historyLoaded = useRef(false);
  const metricsLoaded = useRef(false);

  useEffect(() => {
    if (id && !hasLoaded.current) {
      loadEntrypoint(id);
    }
  }, [id]);

  const loadEntrypoint = async (entrypointId: string) => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    
    try {
      hasLoaded.current = true;
      setLoading(true);
      setError(null);
      const data = await apiService.getEntrypointById(Number(entrypointId));
      
      // Transform backend data to match frontend Entrypoint interface
      let tags: string[] = [];
      if (data.tags) {
        try {
          tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
        } catch {
          tags = [];
        }
      }

      let deploymentConfig = {};
      if (data.deploymentConfig) {
        try {
          deploymentConfig = typeof data.deploymentConfig === 'string' 
            ? JSON.parse(data.deploymentConfig) 
            : data.deploymentConfig;
        } catch {
          deploymentConfig = {};
        }
      }

      let metrics = {};
      if (data.metricsData) {
        try {
          metrics = typeof data.metricsData === 'string' 
            ? JSON.parse(data.metricsData) 
            : data.metricsData;
        } catch {
          metrics = {};
        }
      }

      // Ensure metrics has default values to prevent undefined errors
      const safeMetrics = {
        requests: 0,
        latency: 0,
        errorRate: 0,
        throughput: 0,
        uptime: 0,
        lastRequest: undefined,
        ...metrics,
      };

      // Ensure deploymentConfig has default values to prevent undefined errors
      const safeDeploymentConfig = {
        replicas: 1,
        resources: {
          cpu: '1000m',
          memory: '2Gi',
        },
        environment: {},
        healthCheck: {
          path: '/health',
          interval: 30,
          timeout: 5,
        },
        scaling: {
          minReplicas: 1,
          maxReplicas: 10,
          targetCPU: 70,
        },
        ...deploymentConfig,
      };

      const transformedEntrypoint: Entrypoint = {
        id: data.id.toString(),
        name: data.name,
        description: data.description || '',
        version: data.version || '1.0.0',
        type: data.type || 'api',
        status: data.status || 'inactive',
        _links: data._links,
        method: data.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined,
        modelId: data.modelId?.toString() || '',
        modelName: data.modelName || '',
        modelType: data.modelType || undefined,
        inferenceServiceId: data.inferenceServiceId?.toString() || '',
        inferenceServiceName: data.inferenceServiceName || '',
        path: data.path || undefined,
        fullInferencePath: data.fullInferencePath || undefined,
        tags,
        visibility: data.visibility || 'private' as 'public' | 'private' | 'organization',
        owner: {
          id: data.ownerId?.toString() || '',
          username: data.ownerUsername || 'unknown',
          email: '',
          role: 'user',
          createdAt: data.createdAt || new Date().toISOString(),
        },
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastDeployed: data.lastDeployed,
        deploymentConfig: safeDeploymentConfig as any,
        metrics: safeMetrics as any,
        metadata: {},
      };
      
      setEntrypoint(transformedEntrypoint);
    } catch (err) {
      console.error('Failed to load entrypoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entrypoint');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !entrypoint) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Entrypoint not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/entrypoints')}>
          Back to Entrypoints
        </Button>
      </Box>
    );
  }

  const handlePlaygroundTest = async () => {
    if (!entrypoint || !playgroundRequestBody.trim()) {
      setPlaygroundError('Please enter a request body');
      return;
    }

    try {
      setPlaygroundLoading(true);
      setPlaygroundError(null);
      setPlaygroundResponse(null);

      // Parse the JSON request body
      let requestBody;
      try {
        requestBody = JSON.parse(playgroundRequestBody);
      } catch (e) {
        setPlaygroundError('Invalid JSON format');
        setPlaygroundLoading(false);
        return;
      }

      const response = await apiService.callEntrypoint(Number(entrypoint.id), requestBody);
      setPlaygroundResponse(response);
    } catch (err) {
      console.error('Failed to test entrypoint:', err);
      setPlaygroundError(err instanceof Error ? err.message : 'Failed to test entrypoint');
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'deployed':
        return 'primary';
      case 'inactive':
        return 'default';
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
        return '📦';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Load history when switching to History tab
    if (newValue === 3 && !historyLoaded.current && id) {
      loadHistory();
    }
    // Load metrics when switching to Metrics tab
    if (newValue === 1 && !metricsLoaded.current && id) {
      loadMetrics();
    }
  };

  const loadHistory = async () => {
    if (!id) return;
    
    try {
      setHistoryLoading(true);
      const data = await apiService.getEntrypointHistory(Number(id));
      setHistory(data);
      historyLoaded.current = true;
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRefreshHistory = () => {
    historyLoaded.current = false; // Allow reload
    loadHistory();
  };

  const loadMetrics = async () => {
    if (!id) return;
    
    try {
      setMetricsLoading(true);
      const [stats, daily] = await Promise.all([
        apiService.getEntrypointMetrics(Number(id), 24),
        apiService.getEntrypointDailyMetrics(Number(id), 30)
      ]);
      setMetricsData(stats);
      setDailyMetricsData(daily);
      metricsLoaded.current = true;
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography variant="body1" paragraph>
              {entrypoint.description}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {entrypoint.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Endpoint
                </Typography>
                <Typography variant="body2">
                  {entrypoint._links?.self || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Method
                </Typography>
                <Typography variant="body2">
                  {entrypoint.method || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(entrypoint.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Deployed
                </Typography>
                <Typography variant="body2">
                  {entrypoint.lastDeployed
                    ? new Date(entrypoint.lastDeployed).toLocaleDateString()
                    : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Total Requests"
                  secondary={entrypoint.metrics.requests.toLocaleString()}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Avg Latency"
                  secondary={`${entrypoint.metrics.latency}ms`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Error Rate"
                  secondary={`${(entrypoint.metrics.errorRate * 100).toFixed(
                    2
                  )}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Uptime"
                  secondary={`${entrypoint.metrics.uptime}%`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMetrics = () => (
    <Grid container spacing={3}>
      {metricsLoading ? (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </Grid>
      ) : metricsData ? (
        <>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h3" color="primary">
                  {metricsData.totalRequests || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last {metricsData.timeRangeHours || 24} hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Latency
                </Typography>
                <Typography variant="h3" color="secondary">
                  {Math.round(metricsData.averageLatency || 0)}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Response time
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Rate
                </Typography>
                <Typography variant="h3" color="error">
                  {metricsData.errorRate?.toFixed(2) || 0}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metricsData.errorRate || 0}
                    color={metricsData.errorRate > 10 ? 'error' : 'primary'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h3" color="success.main">
                  {(100 - (metricsData.errorRate || 0)).toFixed(2)}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={100 - (metricsData.errorRate || 0)}
                    color="success"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Breakdown (Last 30 Days)
                </Typography>
                {dailyMetricsData?.timeSeries ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyMetricsData.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#1976d2"
                        strokeWidth={2}
                        name="Total Requests"
                      />
                      <Line
                        type="monotone"
                        dataKey="successful"
                        stroke="#4caf50"
                        strokeWidth={2}
                        name="Successful"
                      />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#f44336"
                        strokeWidth={2}
                        name="Errors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info">No daily metrics data available.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Alert severity="info">No metrics data available.</Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderPlayground = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Request Body
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter a JSON request body to test the entrypoint. The format depends on the model type.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Request Body (JSON)"
                multiline
                rows={12}
                value={playgroundRequestBody}
                onChange={(e) => setPlaygroundRequestBody(e.target.value)}
                placeholder='{"texts": [""]}'
                variant="outlined"
              />
            </Box>

            {playgroundError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {playgroundError}
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={playgroundLoading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handlePlaygroundTest}
              disabled={!playgroundRequestBody.trim() || playgroundLoading}
              fullWidth
            >
              {playgroundLoading ? 'Testing...' : 'Send Request'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        {playgroundResponse && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 500,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(playgroundResponse, null, 2)}
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleHistoryPageChange = (event: unknown, newPage: number) => {
    setHistoryPage(newPage);
  };

  const handleHistoryRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHistoryRowsPerPage(parseInt(event.target.value, 10));
    setHistoryPage(0);
  };

  const openHistoryDialog = (item: any, type: 'request' | 'response') => {
    setSelectedHistoryItem(item);
    setDialogContentType(type);
    setHistoryDialogOpen(true);
  };

  const renderHistory = () => {
    const startIndex = historyPage * historyRowsPerPage;
    const endIndex = startIndex + historyRowsPerPage;
    const paginatedHistory = history.slice(startIndex, endIndex);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Inference History
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshHistory}
                  disabled={historyLoading}
                >
                  Refresh
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                View all previous inference requests and responses. Click to expand full content.
              </Typography>

              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : history.length === 0 ? (
                <Alert severity="info">No inference history available.</Alert>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Timestamp</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Code</strong></TableCell>
                          <TableCell><strong>Request</strong></TableCell>
                          <TableCell><strong>Response</strong></TableCell>
                          <TableCell><strong>Elapsed</strong></TableCell>
                          <TableCell><strong>Error</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedHistory.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(item.createdAt).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                color={item.status === 'success' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{item.statusCode}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                onClick={() => openHistoryDialog(item, 'request')}
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {truncateText(item.requestBody)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                onClick={() => openHistoryDialog(item, 'response')}
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {truncateText(item.responseBody || 'No response')}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {item.elapsedTimeMs}ms
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {item.errorMessage ? (
                                <Tooltip title={item.errorMessage}>
                                  <Alert severity="error" sx={{ py: 0, px: 1 }}>
                                    Error
                                  </Alert>
                                </Tooltip>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={history.length}
                    page={historyPage}
                    onPageChange={handleHistoryPageChange}
                    rowsPerPage={historyRowsPerPage}
                    onRowsPerPageChange={handleHistoryRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Dialog for viewing full request/response */}
        <Dialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            View {dialogContentType === 'request' ? 'Request' : 'Response'} Body
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                maxHeight: '60vh',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {dialogContentType === 'request'
                ? selectedHistoryItem?.requestBody
                : selectedHistoryItem?.responseBody || 'No response'}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/entrypoints')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {getTypeIcon(entrypoint.type)} {entrypoint.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              v{entrypoint.version} • {entrypoint.type.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={entrypoint.status}
            color={getStatusColor(entrypoint.status) as any}
            sx={{ mr: 1 }}
          />
          <Tooltip title="Edit">
            <IconButton>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deploy">
            <IconButton>
              <DeployIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<ViewIcon />} label="Overview" />
            <Tab icon={<MetricsIcon />} label="Metrics" />
            <Tab icon={<PlaygroundIcon />} label="Playground" />
            <Tab icon={<HistoryIcon />} label="History" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && renderMetrics()}
          {activeTab === 2 && renderPlayground()}
          {activeTab === 3 && renderHistory()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EntrypointDetail;

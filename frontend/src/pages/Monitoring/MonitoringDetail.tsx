import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  CircularProgress,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CardActions,
  Tooltip,
  Alert,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Description as ReportsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Assessment as MetricsIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
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
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for monitoring detail
const mockMonitoringDetail = {
  id: '1',
  modelId: '1',
  name: 'Sentiment Analysis API',
  type: 'api',
  status: 'active',
  description: 'Model performance monitoring for sentiment analysis API',
  createdAt: '2023-02-20T10:00:00Z',
  updatedAt: '2023-02-25T16:00:00Z',
  owner: {
    id: 'user-1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Reports data
  reports: [
    {
      id: '1',
      name: 'Data Drift Report - 2024-01-15',
      type: 'data_drift',
      status: 'completed',
      createdAt: '2024-01-15T16:00:00Z',
      size: '2.3 MB',
      description:
        'Data drift detection and analysis report for model performance monitoring',
    },
    {
      id: '2',
      name: 'Data Mining Report - 2024-01-14',
      type: 'data_mining',
      status: 'completed',
      createdAt: '2024-01-14T14:30:00Z',
      size: '1.8 MB',
      description: 'Data mining insights and pattern analysis report',
    },
    {
      id: '3',
      name: 'Sampling and Auto Label Report - 2024-01-13',
      type: 'sampling_auto_label',
      status: 'completed',
      createdAt: '2024-01-13T15:45:00Z',
      size: '3.1 MB',
      description: 'Automated sampling and labeling analysis report',
    },
  ],
  // Metrics data for charts
  metrics: [
    {
      id: '1',
      reportId: '1',
      name: 'Data Drift Report - 2024-01-15',
      timestamp: '2024-01-15T16:00:00Z',
      driftScore: 0.12,
      meanTextLength: 245,
      meanSentenceCount: 3.2,
      meanWordCount: 42,
    },
    {
      id: '2',
      reportId: '2',
      name: 'Data Mining Report - 2024-01-14',
      timestamp: '2024-01-14T14:30:00Z',
      driftScore: 0.08,
      meanTextLength: 198,
      meanSentenceCount: 2.8,
      meanWordCount: 35,
    },
    {
      id: '3',
      reportId: '3',
      name: 'Sampling and Auto Label Report - 2024-01-13',
      timestamp: '2024-01-13T15:45:00Z',
      driftScore: 0.15,
      meanTextLength: 312,
      meanSentenceCount: 4.1,
      meanWordCount: 58,
    },
    {
      id: '4',
      reportId: '4',
      name: 'Data Drift Report - 2024-01-12',
      timestamp: '2024-01-12T16:00:00Z',
      driftScore: 0.05,
      meanTextLength: 167,
      meanSentenceCount: 2.3,
      meanWordCount: 28,
    },
    {
      id: '5',
      reportId: '5',
      name: 'Data Mining Report - 2024-01-11',
      timestamp: '2024-01-11T14:30:00Z',
      driftScore: 0.18,
      meanTextLength: 289,
      meanSentenceCount: 3.9,
      meanWordCount: 51,
    },
  ],
  // History data
  history: [
    {
      id: '1',
      timestamp: '2023-02-25T16:00:00Z',
      requestId: 'req_12345',
      status: 'success',
      responseTime: 120,
      inputSize: 1024,
      outputSize: 512,
      errorMessage: null,
      inputText: 'This is a great product! I love it.',
      outputText:
        '{"sentiment": "positive", "confidence": 0.95, "label": "positive"}',
    },
    {
      id: '2',
      timestamp: '2023-02-25T15:58:00Z',
      requestId: 'req_12344',
      status: 'error',
      responseTime: 50,
      inputSize: 2048,
      outputSize: 0,
      errorMessage: 'Invalid input format',
      inputText: 'Invalid JSON: {malformed}',
      outputText: null,
    },
    {
      id: '3',
      timestamp: '2023-02-25T15:56:00Z',
      requestId: 'req_12343',
      status: 'success',
      responseTime: 95,
      inputSize: 512,
      outputSize: 256,
      errorMessage: null,
      inputText: 'The service was terrible and slow.',
      outputText:
        '{"sentiment": "negative", "confidence": 0.89, "label": "negative"}',
    },
    {
      id: '4',
      timestamp: '2023-02-25T15:54:00Z',
      requestId: 'req_12342',
      status: 'success',
      responseTime: 110,
      inputSize: 768,
      outputSize: 384,
      errorMessage: null,
      inputText: 'The product is okay, nothing special.',
      outputText:
        '{"sentiment": "neutral", "confidence": 0.72, "label": "neutral"}',
    },
    {
      id: '5',
      timestamp: '2023-02-25T15:52:00Z',
      requestId: 'req_12341',
      status: 'success',
      responseTime: 88,
      inputSize: 640,
      outputSize: 320,
      errorMessage: null,
      inputText: 'Amazing quality and fast delivery!',
      outputText:
        '{"sentiment": "positive", "confidence": 0.98, "label": "positive"}',
    },
  ],
  // Settings data
  settings: {
    enabled: true,
    checkInterval: 300, // 5 minutes
    reportGeneration: {
      enabled: true,
      schedule: 'daily',
      time: '02:00',
      retention: 30, // days
    },
    alerts: {
      enabled: true,
      email: 'john@example.com',
      thresholds: {
        accuracy: { min: 0.9 },
        responseTime: { max: 200 },
        errorRate: { max: 0.05 },
      },
    },
    dataRetention: {
      history: 90, // days
      reports: 30, // days
    },
  },
  // Monitoring jobs data
  jobs: [
    {
      id: 'job_1',
      name: 'Data Drift Detection',
      type: 'data_drift',
      status: 'running',
      schedule: {
        type: 'cron',
        value: '0 2 * * 1', // Every Monday at 2 AM
        timezone: 'UTC',
      },
      lastRun: '2024-01-15T02:00:00Z',
      nextRun: null as string | null,
      description: 'Monitors data distribution changes in model inputs',
      enabled: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'job_2',
      name: 'Model Performance Check',
      type: 'performance',
      status: 'paused',
      schedule: {
        type: 'cron',
        value: '0 2 * * 2', // Every Tuesday at 2 AM
        timezone: 'UTC',
      },
      lastRun: '2024-01-16T02:00:00Z',
      nextRun: null as string | null,
      description: 'Evaluates model accuracy and response time metrics',
      enabled: false,
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'job_3',
      name: 'Outlier Detection',
      type: 'outlier',
      status: 'stopped',
      schedule: {
        type: 'cron',
        value: '0 2 * * 3', // Every Wednesday at 2 AM
        timezone: 'UTC',
      },
      lastRun: '2024-01-17T02:00:00Z',
      nextRun: null as string | null,
      description: 'Detects unusual patterns in model predictions',
      enabled: false,
      createdAt: '2024-01-03T00:00:00Z',
    },
    {
      id: 'job_4',
      name: 'Bias Detection',
      type: 'bias',
      status: 'running',
      schedule: {
        type: 'cron',
        value: '0 2 * * 4', // Every Thursday at 2 AM
        timezone: 'UTC',
      },
      lastRun: '2024-01-18T02:00:00Z',
      nextRun: null as string | null,
      description: 'Analyzes model predictions for potential bias',
      enabled: true,
      createdAt: '2024-01-04T00:00:00Z',
    },
  ],
};

const MonitoringDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [outputTextSearch, setOutputTextSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historySemanticSearch, setHistorySemanticSearch] = useState('');
  const [isHistorySearching, setIsHistorySearching] = useState(false);
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Job management state
  const [jobs, setJobs] = useState(mockMonitoringDetail.jobs);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobMenuAnchor, setJobMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // New job form state
  const [newJob, setNewJob] = useState({
    name: '',
    type: 'data_drift',
    description: '',
    schedule: {
      type: 'cron' as 'interval' | 'cron',
      value: '0 2 * * 1' as number | string, // Default to Monday at 2 AM
      timezone: 'UTC',
    },
    enabled: true,
  });

  const monitoring = mockMonitoringDetail;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleReportSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReportSearchQuery(event.target.value);
  };

  const handleOutputTextSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOutputTextSearch(event.target.value);
  };

  const handleDateFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(event.target.value);
  };

  const handleHistorySemanticSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHistorySemanticSearch(event.target.value);
  };

  const handleSearchHistory = () => {
    setIsHistorySearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsHistorySearching(false);
    }, 1000);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getConfidence = (outputText: string | null): number | null => {
    if (!outputText) return null;
    try {
      const parsed = JSON.parse(outputText);
      return parsed.confidence || null;
    } catch {
      return null;
    }
  };

  // Job management handlers
  const handleAddJob = () => {
    const job = {
      id: `job_${Date.now()}`,
      name: newJob.name,
      type: newJob.type,
      description: newJob.description,
      status: 'stopped',
      schedule: {
        type: newJob.schedule.type,
        value:
          newJob.schedule.type === 'interval'
            ? typeof newJob.schedule.value === 'string'
              ? parseInt(newJob.schedule.value)
              : newJob.schedule.value
            : typeof newJob.schedule.value === 'number'
            ? newJob.schedule.value.toString()
            : newJob.schedule.value,
        timezone: newJob.schedule.timezone,
      },
      lastRun: '2024-01-15T00:00:00Z', // Default last run
      nextRun: null as string | null,
      enabled: newJob.enabled,
      createdAt: new Date().toISOString(),
    };
    setJobs([...jobs, job] as any);
    setShowAddJobDialog(false);
    setNewJob({
      name: '',
      type: 'data_drift',
      description: '',
      schedule: {
        type: 'cron' as 'interval' | 'cron',
        value: '0 2 * * 1' as number | string,
        timezone: 'UTC',
      },
      enabled: true,
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    setJobMenuAnchor(null);
    setSelectedJobId(null);
  };

  const handleToggleJobStatus = (jobId: string) => {
    setJobs(
      jobs.map(job => {
        if (job.id === jobId) {
          const newStatus = job.status === 'running' ? 'paused' : 'running';
          return {
            ...job,
            status: newStatus,
            enabled: newStatus === 'running',
          };
        }
        return job;
      }) as any
    );
  };

  const handleStopJob = (jobId: string) => {
    setJobs(
      jobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: 'stopped',
            enabled: false,
            nextRun: null as string | null,
          };
        }
        return job;
      }) as any
    );
  };

  const handleJobMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    jobId: string
  ) => {
    setJobMenuAnchor(event.currentTarget);
    setSelectedJobId(jobId);
  };

  const handleJobMenuClose = () => {
    setJobMenuAnchor(null);
    setSelectedJobId(null);
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'paused':
        return 'warning';
      case 'stopped':
        return 'error';
      default:
        return 'default';
    }
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'data_drift':
        return '📊';
      case 'performance':
        return '⚡';
      case 'outlier':
        return '🚨';
      case 'bias':
        return '⚖️';
      default:
        return '📋';
    }
  };

  const formatSchedule = (schedule: any) => {
    if (schedule.type === 'cron') {
      return schedule.value;
    }
    return 'Manual';
  };

  const filteredHistory = monitoring.history.filter(item => {
    // General search (Request ID, Error Message, Input Text, and Output Text)
    const matchesSearch =
      item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.errorMessage &&
        item.errorMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.inputText &&
        item.inputText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.outputText &&
        item.outputText.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    // Semantic search (intelligent matching)
    const matchesSemantic =
      !historySemanticSearch ||
      (() => {
        const query = historySemanticSearch.toLowerCase();
        const searchableText = `${item.requestId} ${item.inputText || ''} ${
          item.outputText || ''
        } ${item.errorMessage || ''}`.toLowerCase();

        // Simple semantic matching for history items
        const semanticKeywords = {
          positive: [
            'positive',
            'great',
            'amazing',
            'excellent',
            'good',
            'love',
            'best',
          ],
          negative: [
            'negative',
            'terrible',
            'bad',
            'awful',
            'hate',
            'worst',
            'poor',
          ],
          neutral: ['neutral', 'okay', 'average', 'normal', 'fine', 'decent'],
          error: [
            'error',
            'failed',
            'exception',
            'invalid',
            'malformed',
            'timeout',
          ],
          success: [
            'success',
            'completed',
            'working',
            'valid',
            'correct',
            'accurate',
          ],
          sentiment: [
            'sentiment',
            'emotion',
            'feeling',
            'mood',
            'tone',
            'attitude',
          ],
          confidence: [
            'confidence',
            'score',
            'probability',
            'certainty',
            'reliability',
          ],
        };

        // Check if any semantic keywords match
        for (const [category, keywords] of Object.entries(semanticKeywords)) {
          if (query.includes(category)) {
            return keywords.some(keyword => searchableText.includes(keyword));
          }
        }

        // Fallback to regular text search
        return searchableText.includes(query);
      })();

    // Date range filter
    const itemDate = new Date(item.timestamp);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDateRange =
      (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);

    return (
      matchesSearch && matchesStatus && matchesSemantic && matchesDateRange
    );
  });

  // Sort the filtered history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case 'requestId':
        aValue = a.requestId;
        bValue = b.requestId;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'responseTime':
        aValue = a.responseTime;
        bValue = b.responseTime;
        break;
      case 'confidence':
        aValue = getConfidence(a.outputText);
        bValue = getConfidence(b.outputText);
        // Handle null values by putting them at the end
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredReports = monitoring.reports.filter(report => {
    const matchesSearch =
      report.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      report.description
        .toLowerCase()
        .includes(reportSearchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(reportSearchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'generating':
        return <ScheduleIcon color="warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'generating':
        return 'warning';
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

  const renderReports = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <TextField
                size="small"
                placeholder="Search reports..."
                value={reportSearchQuery}
                onChange={handleReportSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => console.log('Refresh reports')}
              >
                Refresh
              </Button>
            </Box>
            {filteredReports.length > 0 ? (
              <List>
                {filteredReports.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <ListItem
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 2,
                        px: 0,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            fontWeight="medium"
                            sx={{
                              cursor: 'pointer',
                              color: 'primary.main',
                              '&:hover': {
                                color: 'primary.dark',
                                textDecoration: 'underline',
                              },
                            }}
                            onClick={() => {
                              navigate(
                                `/monitoring/${id}/reports/${report.id}`
                              );
                            }}
                          >
                            {report.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {report.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              Created:{' '}
                              {new Date(report.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            console.log('Download report', report.id)
                          }
                          disabled={report.status === 'generating'}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < filteredReports.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <SearchIcon
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No reports found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or clear the search to see all
                  reports.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMetrics = () => {
    const completedMetrics = mockMonitoringDetail.metrics;

    return (
      <Grid container spacing={3}>
        {/* Percentile Text Content Drift Score Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Percentile Text Content Drift Score
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={completedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 0.3]} />
                  <RechartsTooltip
                    formatter={(value: number) => [
                      (value * 100).toFixed(1) + '%',
                      'Drift Score',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="driftScore"
                    stroke="#ff6b6b"
                    strokeWidth={2}
                    dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Mean Text Length Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mean Text Length
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={completedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: number) => [
                      value.toFixed(0),
                      'Characters',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="meanTextLength"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Mean Sentence Count Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mean Sentence Count
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={completedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: number) => [
                      value.toFixed(1),
                      'Sentences',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="meanSentenceCount"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Mean Word Count Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mean Word Count
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={completedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: number) => [value.toFixed(0), 'Words']}
                  />
                  <Line
                    type="monotone"
                    dataKey="meanWordCount"
                    stroke="#ed6c02"
                    strokeWidth={2}
                    dot={{ fill: '#ed6c02', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderHistory = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Request History
              </Typography>

              {/* Search Filters - All in One Row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search Request ID, Error, Input, or Output text..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 250 }}
                />
                <TextField
                  size="small"
                  placeholder="Semantic search..."
                  value={historySemanticSearch}
                  onChange={handleHistorySemanticSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                      },
                    },
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="datetime-local"
                  label="From Date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                />
                <TextField
                  size="small"
                  type="datetime-local"
                  label="To Date"
                  value={dateTo}
                  onChange={handleDateToChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                />
                <Button
                  variant="contained"
                  startIcon={
                    isHistorySearching ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SearchIcon />
                    )
                  }
                  onClick={handleSearchHistory}
                  disabled={isHistorySearching}
                  sx={{ minWidth: 100 }}
                >
                  {isHistorySearching ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    // Generate JSONL data from filtered history
                    const jsonlData = sortedHistory.map(item => ({
                      timestamp: item.timestamp,
                      requestId: item.requestId,
                      status: item.status,
                      responseTime: item.responseTime,
                      inputSize: item.inputSize,
                      outputSize: item.outputSize,
                      inputText: item.inputText,
                      outputText: item.outputText,
                      confidence: getConfidence(item.outputText),
                      errorMessage: item.errorMessage,
                    }));

                    // Convert to JSONL string (one JSON object per line)
                    const jsonlContent = jsonlData
                      .map(item => JSON.stringify(item))
                      .join('\n');

                    // Create and download file
                    const blob = new Blob([jsonlContent], {
                      type: 'application/jsonl;charset=utf-8;',
                    });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute(
                      'download',
                      `monitoring_history_${
                        new Date().toISOString().split('T')[0]
                      }.jsonl`
                    );
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  sx={{ minWidth: 120 }}
                >
                  Download
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleSort('timestamp')}
                      >
                        Timestamp
                        {sortField === 'timestamp' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleSort('requestId')}
                      >
                        Request ID
                        {sortField === 'requestId' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortField === 'status' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleSort('responseTime')}
                      >
                        Response Time
                        {sortField === 'responseTime' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>Input Text</TableCell>
                    <TableCell>Output</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleSort('confidence')}
                      >
                        Confidence
                        {sortField === 'confidence' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>Error Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedHistory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {item.requestId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={getStatusColor(item.status) as any}
                          icon={getStatusIcon(item.status) || undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.responseTime}ms
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                          }}
                          title={item.inputText}
                        >
                          {item.inputText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: item.outputText
                              ? 'text.primary'
                              : 'text.secondary',
                          }}
                          title={item.outputText || 'No output'}
                        >
                          {item.outputText || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              getConfidence(item.outputText) !== null
                                ? 'text.primary'
                                : 'text.secondary',
                            fontWeight:
                              getConfidence(item.outputText) !== null
                                ? 'medium'
                                : 'normal',
                          }}
                        >
                          {getConfidence(item.outputText) !== null
                            ? `${(
                                getConfidence(item.outputText)! * 100
                              ).toFixed(1)}%`
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={item.errorMessage ? 'error' : 'text.secondary'}
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.errorMessage || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6">Monitoring Jobs</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddJobDialog(true)}
              >
                Add Job
              </Button>
            </Box>

            {jobs.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <ScheduleIcon
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No monitoring jobs configured
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Create your first monitoring job to start tracking model
                  performance
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddJobDialog(true)}
                >
                  Add Your First Job
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map(job => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="h6" component="span">
                              {getJobTypeIcon(job.type)}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {job.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={job.type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={job.status}
                            size="small"
                            color={getJobStatusColor(job.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatSchedule(job.schedule)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {job.lastRun
                              ? new Date(job.lastRun).toLocaleString()
                              : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={job.description}
                          >
                            {job.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              justifyContent: 'center',
                            }}
                          >
                            {job.status === 'running' ? (
                              <Tooltip title="Pause Job">
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleJobStatus(job.id)}
                                  color="warning"
                                >
                                  <PauseIcon />
                                </IconButton>
                              </Tooltip>
                            ) : job.status === 'paused' ? (
                              <Tooltip title="Resume Job">
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleJobStatus(job.id)}
                                  color="success"
                                >
                                  <PlayIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Start Job">
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleJobStatus(job.id)}
                                  color="success"
                                >
                                  <PlayIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Stop Job">
                              <IconButton
                                size="small"
                                onClick={() => handleStopJob(job.id)}
                                color="error"
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={e => handleJobMenuOpen(e, job.id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Add Job Dialog */}
      <Dialog
        open={showAddJobDialog}
        onClose={() => setShowAddJobDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Monitoring Job</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Job Name"
              value={newJob.name}
              onChange={e => setNewJob({ ...newJob, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newJob.description}
              onChange={e =>
                setNewJob({ ...newJob, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={newJob.type}
                onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                label="Job Type"
              >
                <MenuItem value="data_drift">Data Drift Detection</MenuItem>
                <MenuItem value="performance">Model Performance Check</MenuItem>
                <MenuItem value="outlier">Outlier Detection</MenuItem>
                <MenuItem value="bias">Bias Detection</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Cron Expression"
              value={newJob.schedule.value}
              onChange={e =>
                setNewJob({
                  ...newJob,
                  schedule: { ...newJob.schedule, value: e.target.value },
                })
              }
              fullWidth
              placeholder="0 2 * * 1"
              helperText="Format: minute hour day month dayOfWeek (e.g., '0 2 * * 1' = Every Monday at 2 AM)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newJob.enabled}
                  onChange={e =>
                    setNewJob({ ...newJob, enabled: e.target.checked })
                  }
                />
              }
              label="Enable job immediately"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddJobDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddJob}
            variant="contained"
            disabled={!newJob.name.trim()}
          >
            Add Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Actions Menu */}
      <Menu
        anchorEl={jobMenuAnchor}
        open={Boolean(jobMenuAnchor)}
        onClose={handleJobMenuClose}
      >
        <MenuItem onClick={() => handleJobMenuClose()}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Job</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedJobId) {
              handleDeleteJob(selectedJobId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Job</ListItemText>
        </MenuItem>
      </Menu>
    </Grid>
  );

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
          <IconButton onClick={() => navigate('/monitoring')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {getTypeIcon(monitoring.type)} {monitoring.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitoring Details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => console.log('Refresh monitoring')}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => console.log('Edit monitoring')}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => console.log('Delete monitoring')}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<ReportsIcon />} label="Reports" />
            <Tab icon={<MetricsIcon />} label="Metrics" />
            <Tab icon={<HistoryIcon />} label="History" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>
        <CardContent>
          {activeTab === 0 && renderReports()}
          {activeTab === 1 && renderMetrics()}
          {activeTab === 2 && renderHistory()}
          {activeTab === 3 && renderSettings()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MonitoringDetail;

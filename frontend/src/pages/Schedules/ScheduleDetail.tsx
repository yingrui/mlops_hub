import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Settings as SettingsIcon,
  VpnKey as EnvironmentIcon,
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Mock data for schedule details
const mockScheduleDetail = {
  id: 'schedule_1',
  name: 'Data Drift Detection',
  status: 'active',
  cronExpression: '0 2 * * 1', // Every Monday at 2 AM
  timezone: 'UTC',
  lastRun: '2024-01-15T02:00:00Z',
  nextRun: '2024-01-22T02:00:00Z',
  parameters:
    '{"threshold": 0.1, "window_size": 1000, "model_id": "model_123"}',
  environmentVariables: 'DRIFT_THRESHOLD=0.1,ENV=production,LOG_LEVEL=info',
  command:
    'python scripts/drift_detection.py --model-id=model_123 --threshold=0.1',
  entity: '/monitoring/monitor_456',
  codebase: 'mlops-monitoring',
  enabled: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T02:00:00Z',
  description: 'Monitors data distribution changes in model inputs',
  runs: [
    {
      id: 'run_1',
      status: 'completed',
      startTime: '2024-01-15T02:00:00Z',
      endTime: '2024-01-15T02:05:30Z',
      duration: 330, // seconds
      exitCode: 0,
      logs: 'Data drift analysis completed successfully. No significant drift detected.',
      metrics: {
        driftScore: 0.05,
        dataPoints: 1000,
        alerts: 0,
      },
    },
    {
      id: 'run_2',
      status: 'failed',
      startTime: '2024-01-08T02:00:00Z',
      endTime: '2024-01-08T02:02:15Z',
      duration: 135,
      exitCode: 1,
      logs: 'Error: Model not found. Please check model_id parameter.',
      metrics: {
        driftScore: null,
        dataPoints: 0,
        alerts: 1,
      },
    },
    {
      id: 'run_3',
      status: 'running',
      startTime: '2024-01-22T02:00:00Z',
      endTime: null,
      duration: null,
      exitCode: null,
      logs: 'Starting data drift analysis...',
      metrics: {
        driftScore: null,
        dataPoints: 0,
        alerts: 0,
      },
    },
  ],
};

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState(mockScheduleDetail);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    // Handle delete functionality
    console.log('Delete schedule:', id);
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    setSchedule(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active',
      enabled: !prev.enabled,
    }));
  };

  const handleStop = () => {
    setSchedule(prev => ({
      ...prev,
      status: 'stopped',
      enabled: false,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'stopped':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRunStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getRunStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderRuns = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Schedule Runs
        </Typography>

        {schedule.runs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PlayCircleIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No runs yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This schedule hasn't been executed yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Exit Code</TableCell>
                  <TableCell>Metrics</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.runs.map(run => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {getRunStatusIcon(run.status)}
                        <Chip
                          label={run.status}
                          size="small"
                          color={getRunStatusColor(run.status) as any}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(run.startTime).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {run.endTime
                          ? new Date(run.endTime).toLocaleString()
                          : 'Running...'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(run.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          run.exitCode === 0 ? 'success.main' : 'error.main'
                        }
                      >
                        {run.exitCode !== null ? run.exitCode : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {run.metrics.driftScore !== null && (
                          <Typography variant="caption">
                            Drift: {(run.metrics.driftScore * 100).toFixed(2)}%
                          </Typography>
                        )}
                        <Typography variant="caption">
                          Data Points: {run.metrics.dataPoints}
                        </Typography>
                        {run.metrics.alerts > 0 && (
                          <Typography variant="caption" color="error">
                            Alerts: {run.metrics.alerts}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6">Schedule Settings</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ScheduleIcon />
              Basic Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Schedule Name"
                  secondary={schedule.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={schedule.status}
                      size="small"
                      color={getStatusColor(schedule.status) as any}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Crontab Expression"
                  secondary={
                    <Typography variant="body2" fontFamily="monospace">
                      {schedule.cronExpression}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Timezone"
                  secondary={schedule.timezone}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Last Run"
                  secondary={
                    schedule.lastRun
                      ? new Date(schedule.lastRun).toLocaleString()
                      : 'Never'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Next Run"
                  secondary={
                    schedule.nextRun
                      ? new Date(schedule.nextRun).toLocaleString()
                      : 'N/A'
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Codebase Information */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CodeIcon />
              Codebase
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Codebase"
                  secondary={schedule.codebase}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Entity URI"
                  secondary={
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(schedule.entity, '_blank')}
                    >
                      {schedule.entity}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Command */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TerminalIcon />
              Command
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={schedule.command}
              InputProps={{
                readOnly: !isEditing,
                sx: { fontFamily: 'monospace' },
              }}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>

          {/* Parameters */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <SettingsIcon />
              Parameters
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={schedule.parameters}
              InputProps={{
                readOnly: !isEditing,
                sx: { fontFamily: 'monospace' },
              }}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>

          {/* Environment Variables */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <EnvironmentIcon />
              Environment Variables
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={schedule.environmentVariables}
              InputProps={{
                readOnly: !isEditing,
                sx: { fontFamily: 'monospace' },
              }}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setIsEditing(false)}>
              Save Changes
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/schedules')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {schedule.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Schedule • {schedule.status.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={schedule.status === 'active' ? 'Pause' : 'Resume'}>
            <IconButton onClick={handleToggleStatus}>
              {schedule.status === 'active' ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Stop">
            <IconButton
              onClick={handleStop}
              disabled={schedule.status === 'stopped'}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<PlayCircleIcon />} label="Runs" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {tabValue === 0 && renderRuns()}
          {tabValue === 1 && renderSettings()}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Schedule</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Schedule</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ScheduleDetail;

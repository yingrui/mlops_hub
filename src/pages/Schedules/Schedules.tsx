import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar from '../../components/UI/SearchBar/SearchBar';

// Mock data for schedules
const mockSchedules = [
  {
    id: 'schedule_1',
    name: 'Data Drift Detection',
    status: 'active',
    cronExpression: '0 2 * * 1', // Every Monday at 2 AM
    timezone: 'UTC',
    lastRun: '2024-01-15T02:00:00Z',
    parameters: '{"threshold": 0.1, "window_size": 1000}',
    environmentVariables: 'DRIFT_THRESHOLD=0.1,ENV=production',
    command: 'python scripts/drift_detection.py --model-id=model_123',
    entity: '/monitoring/monitor_456',
    codebase: 'mlops-monitoring',
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'schedule_2',
    name: 'Model Performance Monitoring',
    status: 'active',
    cronExpression: '0 2 * * 2', // Every Tuesday at 2 AM
    timezone: 'UTC',
    lastRun: '2024-01-16T02:00:00Z',
    parameters: '{"metrics": ["accuracy", "f1_score"], "baseline": 0.85}',
    environmentVariables: 'PERF_BASELINE=0.85,LOG_LEVEL=info',
    command: 'python scripts/performance_monitor.py --model-id=model_789',
    entity: '/monitoring/monitor_101',
    codebase: 'mlops-monitoring',
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'schedule_3',
    name: 'Outlier Detection',
    status: 'paused',
    cronExpression: '0 2 * * 3', // Every Wednesday at 2 AM
    timezone: 'UTC',
    lastRun: '2024-01-17T02:00:00Z',
    parameters: '{"method": "isolation_forest", "contamination": 0.1}',
    environmentVariables: 'OUTLIER_METHOD=isolation_forest,CONTAMINATION=0.1',
    command: 'python scripts/outlier_detection.py --data-source=api',
    entity: '/monitoring/monitor_202',
    codebase: 'mlops-monitoring',
    enabled: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'schedule_4',
    name: 'Model Retraining',
    status: 'active',
    cronExpression: '0 2 * * 4', // Every Thursday at 2 AM
    timezone: 'UTC',
    lastRun: '2024-01-18T02:00:00Z',
    parameters: '{"retrain_threshold": 0.05, "max_epochs": 100}',
    environmentVariables: 'RETRAIN_THRESHOLD=0.05,MAX_EPOCHS=100',
    command:
      'python scripts/retrain_model.py --model-id=model_456 --data-path=/data',
    entity: '/models/model_456',
    codebase: 'mlops-training',
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const Schedules: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState(mockSchedules);
  const [filteredSchedules, setFilteredSchedules] = useState(mockSchedules);
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);

  // New schedule form state
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    cronExpression: '0 2 * * 1',
    timezone: 'UTC',
    parameters: '',
    environmentVariables: '',
    command: '',
    entity: '',
    codebase: '',
    enabled: true,
  });

  const handleAddSchedule = () => {
    const schedule = {
      id: `schedule_${Date.now()}`,
      ...newSchedule,
      status: 'active',
      lastRun: null,
      createdAt: new Date().toISOString(),
    };

    setSchedules([...schedules, schedule as any]);
    setShowAddScheduleDialog(false);
    setNewSchedule({
      name: '',
      cronExpression: '0 2 * * 1',
      timezone: 'UTC',
      parameters: '',
      environmentVariables: '',
      command: '',
      entity: '',
      codebase: '',
      enabled: true,
    });
  };

  const handleSearch = (query: string) => {
    let filtered = schedules;

    if (query) {
      filtered = filtered.filter(
        schedule =>
          schedule.name.toLowerCase().includes(query.toLowerCase()) ||
          schedule.command.toLowerCase().includes(query.toLowerCase()) ||
          schedule.entity.toLowerCase().includes(query.toLowerCase()) ||
          schedule.codebase.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredSchedules(filtered);
  };

  const handleEdit = (id: GridRowId) => {
    // Handle edit functionality
    console.log('Edit schedule:', id);
  };

  const handleRowClick = (params: any) => {
    navigate(`/schedules/${params.id}`);
  };

  const handleDelete = (id: GridRowId) => {
    const scheduleId = String(id);
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    setFilteredSchedules(
      filteredSchedules.filter(schedule => schedule.id !== scheduleId)
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Schedule Name',
      width: 200,
      renderCell: params => (
        <Typography variant="subtitle1" fontWeight="medium">
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
          size="small"
          color={getScheduleStatusColor(params.value) as any}
        />
      ),
    },
    {
      field: 'cronExpression',
      headerName: 'Crontab',
      width: 150,
      renderCell: params => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'lastRun',
      headerName: 'Last Run',
      width: 180,
      renderCell: params => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleString() : 'Never'}
        </Typography>
      ),
    },
    {
      field: 'codebase',
      headerName: 'Codebase',
      width: 150,
      renderCell: params => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.value}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'parameters',
      headerName: 'Parameters',
      width: 200,
      renderCell: params => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.value}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'environmentVariables',
      headerName: 'Environment Variables',
      width: 200,
      renderCell: params => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.value}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'command',
      headerName: 'Command',
      width: 250,
      renderCell: params => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.value}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'entity',
      headerName: 'Entity',
      width: 200,
      renderCell: params => (
        <Typography
          variant="body2"
          color="primary"
          sx={{
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          title={params.value}
          onClick={() => window.open(params.value, '_blank')}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
  ];

  const getScheduleStatusColor = (status: string) => {
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
          Schedules
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddScheduleDialog(true)}
        >
          Add Schedule
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <SearchBar
              placeholder="Search schedules..."
              onSearch={handleSearch}
            />
          </Box>

          <DataTable
            rows={filteredSchedules}
            columns={columns}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={row => row.id}
            density="comfortable"
            initialState={{
              columns: {
                columnVisibilityModel: {
                  codebase: false,
                  parameters: false,
                  environmentVariables: false,
                  command: false,
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Add Schedule Dialog */}
      <Dialog
        open={showAddScheduleDialog}
        onClose={() => setShowAddScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Schedule Name"
              value={newSchedule.name}
              onChange={e =>
                setNewSchedule({ ...newSchedule, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Crontab"
              value={newSchedule.cronExpression}
              onChange={e =>
                setNewSchedule({
                  ...newSchedule,
                  cronExpression: e.target.value,
                })
              }
              fullWidth
              placeholder="0 2 * * 1"
              helperText="Format: minute hour day month dayOfWeek (e.g., '0 2 * * 1' = Every Monday at 2 AM)"
            />
            <TextField
              label="Timezone"
              value={newSchedule.timezone}
              onChange={e =>
                setNewSchedule({ ...newSchedule, timezone: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Parameters (JSON)"
              value={newSchedule.parameters}
              onChange={e =>
                setNewSchedule({ ...newSchedule, parameters: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
              placeholder='{"threshold": 0.1, "window_size": 1000}'
            />
            <TextField
              label="Environment Variables"
              value={newSchedule.environmentVariables}
              onChange={e =>
                setNewSchedule({
                  ...newSchedule,
                  environmentVariables: e.target.value,
                })
              }
              fullWidth
              placeholder="DRIFT_THRESHOLD=0.1,ENV=production"
            />
            <TextField
              label="Command"
              value={newSchedule.command}
              onChange={e =>
                setNewSchedule({ ...newSchedule, command: e.target.value })
              }
              fullWidth
              placeholder="python scripts/drift_detection.py --model-id=model_123"
            />
            <TextField
              label="Entity URI"
              value={newSchedule.entity}
              onChange={e =>
                setNewSchedule({ ...newSchedule, entity: e.target.value })
              }
              fullWidth
              placeholder="/monitoring/monitor_456"
            />
            <TextField
              label="Codebase"
              value={newSchedule.codebase}
              onChange={e =>
                setNewSchedule({ ...newSchedule, codebase: e.target.value })
              }
              fullWidth
              placeholder="mlops-monitoring"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddScheduleDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSchedule}
            variant="contained"
            disabled={!newSchedule.name || !newSchedule.cronExpression}
          >
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedules;

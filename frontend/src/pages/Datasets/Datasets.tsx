import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as DatasetIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import { Dataset, DatasetVersion } from '../../types';
import { apiService } from '../../services/api';

const Datasets: React.FC = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Map<number, DatasetVersion[]>>(
    new Map()
  );
  const hasLoaded = useRef(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    
    try {
      hasLoaded.current = true;
      setLoading(true);
      setError(null);
      const data = await apiService.getDatasets();
      setDatasets(data);
      setFilteredDatasets(data);

      // Use versions from the datasets API response instead of making individual calls
      const versionsMap = new Map<number, DatasetVersion[]>();
      for (const dataset of data) {
        // Use versions from the dataset's versions field if available
        let datasetVersions = dataset.versions || [];
        // Sort versions by versionNumber descending to ensure latest version is first
        datasetVersions = [...datasetVersions].sort((a, b) => b.versionNumber - a.versionNumber);
        versionsMap.set(dataset.id, datasetVersions);
      }
      setVersions(versionsMap);
    } catch (err) {
      setError('Failed to load datasets');
      console.error('Error loading datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    let filtered = datasets;

    if (query) {
      filtered = filtered.filter(
        dataset =>
          dataset.name.toLowerCase().includes(query.toLowerCase()) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredDatasets(filtered);
  };

  const handleEdit = (id: GridRowId) => {
    console.log('Edit dataset:', id);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: GridRowId) => {
    try {
      await apiService.deleteDataset(id.toString());
      setDatasets(datasets.filter(d => d.id !== id));
      setFilteredDatasets(filteredDatasets.filter(d => d.id !== id));
      // Remove versions for this dataset
      const newVersions = new Map(versions);
      newVersions.delete(Number(id));
      setVersions(newVersions);
    } catch (err) {
      console.error('Error deleting dataset:', err);
      setError('Failed to delete dataset');
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
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <DatasetIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {params.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {params.row.id}
              </Typography>
            </Box>
          </Box>
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
        field: 'versions',
        headerName: 'Versions',
        width: 120,
        renderCell: params => {
          const datasetVersions = versions.get(params.row.id) || [];
          const committedCount = datasetVersions.filter(
            v => v.status === 'COMMITTED'
          ).length;
          const draftCount = datasetVersions.filter(
            v => v.status === 'DRAFT'
          ).length;

          return (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Chip
                label={`${committedCount} committed`}
                size="small"
                color="success"
                variant="outlined"
              />
              {draftCount > 0 && (
                <Chip
                  label={`${draftCount} draft`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          );
        },
      },
      {
        field: 'latestVersion',
        headerName: 'Latest Version',
        width: 150,
        renderCell: params => {
          const datasetVersions = versions.get(params.row.id) || [];
          // Versions are already sorted by version number desc, so the first one is the latest (highest version number)
          const latestVersion = datasetVersions[0];

          if (!latestVersion) {
            return (
              <Typography variant="body2" color="textSecondary">
                No versions
              </Typography>
            );
          }

          return (
            <Box>
              <Typography variant="body2" fontWeight="bold">
                v{latestVersion.versionNumber}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {latestVersion.status}
              </Typography>
            </Box>
          );
        },
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
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        renderCell: params => (
          <Box display="flex" gap={1}>
            <Tooltip title="View Dataset">
              <IconButton
                size="small"
                onClick={() => navigate(`/datasets/${params.id}`)}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [versions, navigate]
  );

  if (loading) {
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
        <Typography variant="h4">Datasets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/datasets/upload')}
        >
          Create Dataset
        </Button>
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
            placeholder="Search datasets..."
            showFilters={false}
          />

          <DataTable
            rows={filteredDatasets}
            columns={columns}
            onRowClick={params => navigate(`/datasets/${params.id}`)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getRowId={row => row.id}
            density="comfortable"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Datasets;

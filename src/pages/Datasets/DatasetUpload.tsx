import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const DatasetUpload: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileFormat, setFileFormat] = useState('Custom');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Please provide a dataset name');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Create the dataset (without files)
      const dataset = await apiService.createDataset({
        name: name.trim(),
        description: description.trim() || undefined,
        fileFormat: fileFormat,
      });

      setSuccess(true);
      setTimeout(() => {
        // Navigate to the dataset detail page where user can create versions and upload files
        navigate(`/datasets/${dataset.id}`);
      }, 2000);
    } catch (err) {
      setError('Failed to create dataset');
      console.error('Create error:', err);
    } finally {
      setCreating(false);
    }
  };

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Dataset created successfully! Redirecting to dataset details...
        </Alert>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/datasets')}
        >
          Back to Datasets
        </Button>
        <Typography variant="h4">Create Dataset</Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Information Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  backgroundColor: 'grey.50',
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <StorageIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    New Versioned Dataset System
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Create a dataset container first, then add versions and files.
                  This allows for better organization and version control.
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label="Version Control"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Multiple Files"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Manual Commit"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Paper>

              {/* Dataset Name */}
              <TextField
                label="Dataset Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                required
                placeholder="Enter a name for your dataset"
                helperText="This will be the main identifier for your dataset"
              />

              {/* Description */}
              <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Describe your dataset (optional)"
                helperText="Provide a detailed description of what this dataset contains"
              />

              {/* File Format */}
              <FormControl fullWidth>
                <InputLabel>File Format</InputLabel>
                <Select
                  value={fileFormat}
                  label="File Format"
                  onChange={e => setFileFormat(e.target.value)}
                >
                  <MenuItem value="Custom">Custom</MenuItem>
                  <MenuItem value="JSONL">JSONL</MenuItem>
                  <MenuItem value="JSON">JSON</MenuItem>
                  <MenuItem value="CSV">CSV</MenuItem>
                  <MenuItem value="Parquet">Parquet</MenuItem>
                  <MenuItem value="HDF5">HDF5</MenuItem>
                  <MenuItem value="TXT">TXT</MenuItem>
                </Select>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Select the primary file format for this dataset. You can
                  upload files of any format to versions.
                </Typography>
              </FormControl>

              {/* Next Steps Info */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Next Steps After Creation:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography
                    component="li"
                    variant="body2"
                    color="textSecondary"
                  >
                    Create a new version for your dataset
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    color="textSecondary"
                  >
                    Upload files to the version
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    color="textSecondary"
                  >
                    Commit the version when ready
                  </Typography>
                </Box>
              </Paper>

              {/* Error Message */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/datasets')}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!name.trim() || creating}
                >
                  {creating ? 'Creating...' : 'Create Dataset'}
                </Button>
              </Box>

              {creating && <LinearProgress />}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DatasetUpload;

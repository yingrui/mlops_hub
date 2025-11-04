import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Avatar,
  Rating,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridRowId } from '@mui/x-data-grid';

import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import { Solution } from '../../types';

// Mock data for solutions
const mockSolutions: Solution[] = [
  {
    id: 'sol-3',
    name: 'Text Classification Pipeline',
    description:
      'Multi-class text classification solution with support for custom categories. Includes data preprocessing, model training, and evaluation tools.',
    category: 'nlp',
    type: 'text_classification',
    status: 'available',
    difficulty: 'beginner',
    tags: ['nlp', 'classification', 'text-processing', 'bert', 'fasttext'],
    visibility: 'public',
    owner: {
      id: 'user-3',
      username: 'mike_johnson',
      email: 'mike@example.com',
      role: 'user',
      createdAt: '2024-01-10T00:00:00Z',
    },
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-03-08T16:45:00Z',
    downloadCount: 2100,
    rating: 4.9,
    useCases: [
      'Email categorization',
      'Content moderation',
      'Customer feedback analysis',
      'News article classification',
    ],
    requirements: {
      frameworks: ['transformers', 'scikit-learn', 'nltk'],
      datasets: ['labeled-text-data'],
      compute: 'GPU recommended',
      memory: '6GB+ RAM',
    },
    templates: [],
    metadata: {
      accuracy: 0.92,
      supportedLanguages: ['English', 'Spanish', 'French'],
      maxCategories: 50,
    },
  },
  {
    id: 'sol-1',
    name: 'Knowledge Extraction from Documents',
    description:
      'Extract structured information from given document using advanced NLP techniques. Perfect for processing contracts, reports, and legal documents.',
    category: 'nlp',
    type: 'knowledge_extraction',
    status: 'available',
    difficulty: 'intermediate',
    tags: ['nlp', 'document-processing', 'information-extraction', 'bert'],
    visibility: 'public',
    owner: {
      id: 'user-1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z',
    downloadCount: 1250,
    rating: 4.8,
    useCases: [
      'Contract analysis',
      'Legal document processing',
      'Research paper extraction',
      'Financial report analysis',
    ],
    requirements: {
      frameworks: ['transformers', 'spacy', 'pytorch'],
      datasets: ['custom-documents', 'legal-texts'],
      compute: 'GPU recommended',
      memory: '8GB+ RAM',
    },
    templates: [],
    metadata: {
      accuracy: 0.94,
      processingTime: '2-5 minutes per document',
      supportedFormats: ['PDF', 'DOCX', 'TXT'],
      example: {
        input:
          'This Agreement is entered into on January 15, 2024, between ABC Corp (Company) and XYZ Ltd (Client) for the provision of software development services. The total contract value is $150,000 payable in monthly installments of $12,500 over 12 months. The project duration is from February 1, 2024 to January 31, 2025.',
        output: {
          contractType: 'Software Development Services',
          parties: ['ABC Corp', 'XYZ Ltd'],
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          totalValue: 150000,
          paymentSchedule: 'Monthly installments of $12,500',
          duration: '12 months',
        },
      },
    },
  },
  {
    id: 'sol-2',
    name: 'Sales Prediction Model',
    description:
      'Predict future sales using historical data and external factors. Built with time series analysis and machine learning for accurate forecasting.',
    category: 'time_series',
    type: 'sales_prediction',
    status: 'available',
    difficulty: 'beginner',
    tags: ['time-series', 'forecasting', 'sales', 'prophet', 'arima'],
    visibility: 'public',
    owner: {
      id: 'user-2',
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2024-01-05T00:00:00Z',
    },
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-03-05T11:00:00Z',
    downloadCount: 890,
    rating: 4.6,
    useCases: [
      'Revenue forecasting',
      'Inventory planning',
      'Marketing budget allocation',
      'Seasonal trend analysis',
    ],
    requirements: {
      frameworks: ['prophet', 'scikit-learn', 'pandas'],
      datasets: ['sales-history', 'external-factors'],
      compute: 'CPU sufficient',
      memory: '4GB+ RAM',
    },
    templates: [],
    metadata: {
      accuracy: 0.87,
      forecastHorizon: '3-12 months',
      supportedFrequencies: ['daily', 'weekly', 'monthly'],
    },
  },
  {
    id: 'sol-4',
    name: 'Image Recognition System',
    description:
      'Computer vision solution for object detection and image classification. Supports custom training and real-time inference.',
    category: 'computer_vision',
    type: 'image_recognition',
    status: 'available',
    difficulty: 'advanced',
    tags: ['computer-vision', 'object-detection', 'yolo', 'resnet', 'opencv'],
    visibility: 'public',
    owner: {
      id: 'user-4',
      username: 'sarah_wilson',
      email: 'sarah@example.com',
      role: 'admin',
      createdAt: '2024-01-15T00:00:00Z',
    },
    createdAt: '2024-03-05T09:30:00Z',
    updatedAt: '2024-03-12T13:20:00Z',
    downloadCount: 750,
    rating: 4.7,
    useCases: [
      'Quality control in manufacturing',
      'Security surveillance',
      'Medical image analysis',
      'Autonomous vehicle perception',
    ],
    requirements: {
      frameworks: ['tensorflow', 'opencv', 'yolov5'],
      datasets: ['custom-image-dataset'],
      compute: 'GPU required',
      memory: '16GB+ RAM',
    },
    templates: [],
    metadata: {
      accuracy: 0.96,
      inferenceTime: '50-100ms per image',
      supportedFormats: ['JPEG', 'PNG', 'BMP'],
    },
  },
  {
    id: 'sol-5',
    name: 'Fraud Detection Engine',
    description:
      'Real-time fraud detection using machine learning algorithms. Detects anomalous patterns in financial transactions and user behavior.',
    category: 'anomaly_detection',
    type: 'fraud_detection',
    status: 'available',
    difficulty: 'advanced',
    tags: [
      'anomaly-detection',
      'fraud',
      'isolation-forest',
      'autoencoder',
      'finance',
    ],
    visibility: 'private',
    owner: {
      id: 'user-5',
      username: 'alex_brown',
      email: 'alex@example.com',
      role: 'user',
      createdAt: '2024-01-20T00:00:00Z',
    },
    createdAt: '2024-03-10T11:15:00Z',
    updatedAt: '2024-03-14T09:30:00Z',
    downloadCount: 320,
    rating: 4.5,
    useCases: [
      'Credit card fraud detection',
      'Insurance claim fraud',
      'Identity theft prevention',
      'Transaction monitoring',
    ],
    requirements: {
      frameworks: ['scikit-learn', 'tensorflow', 'pandas'],
      datasets: ['transaction-data', 'user-behavior'],
      compute: 'GPU recommended',
      memory: '8GB+ RAM',
    },
    templates: [],
    metadata: {
      accuracy: 0.98,
      falsePositiveRate: 0.02,
      realTimeProcessing: true,
    },
  },
];

const Solutions: React.FC = () => {
  const [filteredSolutions, setFilteredSolutions] = useState(mockSolutions);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    const filtered = mockSolutions.filter(
      solution =>
        solution.name.toLowerCase().includes(query.toLowerCase()) ||
        solution.description.toLowerCase().includes(query.toLowerCase()) ||
        solution.tags.some(tag =>
          tag.toLowerCase().includes(query.toLowerCase())
        ) ||
        solution.useCases.some(useCase =>
          useCase.toLowerCase().includes(query.toLowerCase())
        )
    );
    setFilteredSolutions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_development':
        return 'warning';
      case 'deprecated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nlp':
        return '📝';
      case 'computer_vision':
        return '👁️';
      case 'time_series':
        return '📈';
      case 'recommendation':
        return '💡';
      case 'anomaly_detection':
        return '⚠️';
      default:
        return '🔧';
    }
  };

  const handleView = (id: GridRowId) => {
    navigate(`/solutions/${id}`);
  };

  const handleDownload = (id: GridRowId) => {
    console.log('Download solution:', id);
    // TODO: Implement download functionality
  };

  const handleStar = (id: GridRowId) => {
    console.log('Star solution:', id);
    // TODO: Implement star/favorite functionality
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Solution',
      width: 250,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            {getCategoryIcon(params.row.category)}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      renderCell: params => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 100,
      renderCell: params => (
        <Chip
          label={params.value.replace('_', ' ').toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Level',
      width: 80,
      renderCell: params => (
        <Chip
          label={params.value}
          size="small"
          color={getDifficultyColor(params.value) as any}
        />
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Rating value={params.value} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'downloadCount',
      headerName: 'Downloads',
      width: 90,
      renderCell: params => (
        <Typography variant="body2">{params.value.toLocaleString()}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: params => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value) as any}
        />
      ),
    },
  ];

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
          Solutions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create new experiment')}
        >
          Create Experiment
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search solutions by name, description, tags, or use cases..."
            showFilters={true}
            filterOptions={[
              {
                label: 'Category',
                value: 'category',
                options: [
                  { label: 'NLP', value: 'nlp' },
                  { label: 'Computer Vision', value: 'computer_vision' },
                  { label: 'Time Series', value: 'time_series' },
                  { label: 'Recommendation', value: 'recommendation' },
                  { label: 'Anomaly Detection', value: 'anomaly_detection' },
                ],
              },
              {
                label: 'Difficulty',
                value: 'difficulty',
                options: [
                  { label: 'Beginner', value: 'beginner' },
                  { label: 'Intermediate', value: 'intermediate' },
                  { label: 'Advanced', value: 'advanced' },
                ],
              },
              {
                label: 'Status',
                value: 'status',
                options: [
                  { label: 'Available', value: 'available' },
                  { label: 'In Development', value: 'in_development' },
                  { label: 'Deprecated', value: 'deprecated' },
                ],
              },
              {
                label: 'Visibility',
                value: 'visibility',
                options: [
                  { label: 'Public', value: 'public' },
                  { label: 'Private', value: 'private' },
                  { label: 'Organization', value: 'organization' },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

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
            <Typography variant="h6">
              Available Solutions ({filteredSolutions.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <DataTable
            rows={filteredSolutions}
            columns={columns}
            onRowClick={params => handleView(params.id)}
            onDownload={handleDownload}
            getRowId={row => row.id}
            pageSize={15}
            pageSizeOptions={[10, 15, 25, 50]}
            disableSelectionOnClick
            density="comfortable"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Solutions;

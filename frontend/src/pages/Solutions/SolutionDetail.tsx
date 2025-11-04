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
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Monitor as MonitorIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  RocketLaunch as RocketLaunchIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for solution detail
const mockSolution = {
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
    example: {
      input:
        'This product is absolutely amazing! I love the quality and the customer service was excellent. Highly recommend to everyone!',
      output: {
        category: 'positive',
        confidence: 0.95,
        subcategories: ['product_quality', 'customer_service'],
        sentiment: 'positive',
        keyPhrases: [
          'amazing',
          'love the quality',
          'excellent',
          'highly recommend',
        ],
      },
    },
  },
};

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isStarred, setIsStarred] = useState(false);

  const solution = mockSolution; // In real app, fetch by id

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Solution Overview
            </Typography>
            <Typography variant="body1" paragraph>
              {solution.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Use Cases
              </Typography>
              <List dense>
                {solution.useCases.map((useCase, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      <TimelineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={useCase} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {solution.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2">
                  <Chip
                    label={solution.category.replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Difficulty
                </Typography>
                <Typography variant="body2">
                  <Chip
                    label={solution.difficulty}
                    size="small"
                    color={getDifficultyColor(solution.difficulty) as any}
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2">
                  <Chip
                    label={solution.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(solution.status) as any}
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Owner
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {solution.owner.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">
                    {solution.owner.username}
                  </Typography>
                </Box>
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
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Downloads"
                  secondary={solution.downloadCount.toLocaleString()}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Rating"
                  secondary={
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Rating
                        value={solution.rating}
                        precision={0.1}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({solution.rating})
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Accuracy"
                  secondary={`${(solution.metadata.accuracy * 100).toFixed(
                    1
                  )}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Max Categories"
                  secondary={solution.metadata.maxCategories}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Frameworks
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}
              >
                {solution.requirements.frameworks.map(framework => (
                  <Chip
                    key={framework}
                    label={framework}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Compute
              </Typography>
              <Typography variant="body2">
                {solution.requirements.compute}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Memory
              </Typography>
              <Typography variant="body2">
                {solution.requirements.memory}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCodebase = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Text Classification Pipeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete implementation with documentation and examples
                </Typography>
              </Box>
              <Chip
                label="Python"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Repository Structure
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre',
                  overflow: 'auto',
                }}
              >
                {`text-classification-pipeline/
├── README.md
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── classifier.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── bert_classifier.py
│   │   └── fasttext_classifier.py
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   ├── text_cleaner.py
│   │   └── tokenizer.py
│   └── utils/
│       ├── __init__.py
│       ├── data_loader.py
│       └── metrics.py
├── examples/
│   ├── email_classification.py
│   ├── sentiment_analysis.py
│   └── sample_data/
│       ├── emails.csv
│       └── reviews.json
├── tests/
│   ├── __init__.py
│   ├── test_classifier.py
│   └── test_preprocessing.py
└── docs/
    ├── installation.md
    ├── api_reference.md
    └── training_guide.md`}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Key Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="BERT and FastText models"
                    secondary="State-of-the-art models for accurate text classification"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Multi-class classification support"
                    secondary="Support for up to 50 different categories"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Text preprocessing pipeline"
                    secondary="Advanced text cleaning, tokenization, and normalization"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Real-time inference"
                    secondary="Fast prediction with confidence scores and sentiment analysis"
                  />
                </ListItem>
              </List>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<CodeIcon />}
                onClick={() =>
                  window.open(
                    'https://github.com/mlops-hub/text-classification-pipeline',
                    '_blank'
                  )
                }
              >
                View Code
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );


  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          MLOps Job Commands
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use the following command lines to launch various MLOps jobs for the
          Knowledge Extraction solution. These commands are ready to use with
          the MLOps Hub CLI.
        </Typography>
      </Grid>

      {/* Training Job */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PlayIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Training Job</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Launch a training job to train the model with your dataset.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops train \\
  --solution knowledge-extraction \\
  --dataset-path ./data/training \\
  --output-path ./models \\
  --config config/train_config.yaml \\
  --gpu-count 1 \\
  --epochs 50 \\
  --batch-size 32`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Drift Monitoring */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MonitorIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Data Drift Monitoring</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set up continuous monitoring to detect data drift in your
              production data.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops monitor data-drift \\
  --solution knowledge-extraction \\
  --baseline-dataset ./data/baseline \\
  --production-dataset ./data/production \\
  --threshold 0.1 \\
  --schedule "0 2 * * *" \\
  --alert-email admin@company.com`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Quality Checking */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Data Quality Checking</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Run comprehensive data quality checks on your dataset to ensure
              data integrity and consistency.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops check data-quality \\
  --solution knowledge-extraction \\
  --dataset-path ./data/validation \\
  --quality-rules config/quality_rules.yaml \\
  --output-report ./reports/quality_report.html \\
  --check-completeness \\
  --check-consistency \\
  --check-validity`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Model Validation */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VerifiedIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Model Validation</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Validate your trained model against test data to ensure it meets
              performance requirements.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops validate model \\
  --solution knowledge-extraction \\
  --model-path ./models/trained_model.pkl \\
  --test-dataset ./data/test \\
  --metrics accuracy,precision,recall,f1 \\
  --min-accuracy 0.85 \\
  --output-report ./reports/validation_report.json`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Model Deployment */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RocketLaunchIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Model Deployment</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Deploy your trained model as a REST API endpoint for production
              use.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops deploy model \\
  --solution knowledge-extraction \\
  --model-path ./models/trained_model.pkl \\
  --endpoint-name knowledge-extraction-api \\
  --replicas 3 \\
  --cpu-request 1000m \\
  --memory-request 2Gi \\
  --port 8080`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Monitoring */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Performance Monitoring</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Monitor model performance in production to track accuracy,
              latency, and throughput metrics.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography component="pre" sx={{ margin: 0 }}>
                {`mlops monitor performance \\
  --solution knowledge-extraction \\
  --endpoint-url http://api.company.com/knowledge-extraction \\
  --metrics latency,throughput,accuracy \\
  --sampling-rate 0.1 \\
  --dashboard-url http://monitoring.company.com \\
  --alert-threshold latency:500ms`}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<CodeIcon />}>
                Edit Command
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Additional Information */}
      <Grid item xs={12}>
        <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="info.main" gutterBottom>
            Command Usage Tips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • All commands require the MLOps Hub CLI to be installed and
            configured
            <br />
            • Replace placeholder paths with your actual data and model
            locations
            <br />
            • Adjust resource requirements (CPU, memory) based on your
            infrastructure
            <br />
            • Use environment variables for sensitive configuration values
            <br />• Check the documentation for additional parameters and
            options
          </Typography>
        </Box>
      </Grid>
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
          <IconButton onClick={() => navigate('/solutions')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <Typography variant="h4" component="span">
                {getCategoryIcon(solution.category)}
              </Typography>
              <Typography variant="h4" component="h1">
                {solution.name}
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              {solution.category.replace('_', ' ').toUpperCase()} •{' '}
              {solution.difficulty.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip
            title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <IconButton onClick={() => setIsStarred(!isStarred)}>
              {isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bookmark">
            <IconButton>
              <BookmarkIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Download solution')}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<InfoIcon />} label="Overview" />
            <Tab icon={<CodeIcon />} label="Codebase" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && renderCodebase()}
          {activeTab === 2 && renderSettings()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolutionDetail;

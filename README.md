# MLOps Hub

A comprehensive MLOps platform built with React frontend and Java Spring Boot backend, providing dataset management, model management, experiment tracking, model monitoring, and automated scheduling capabilities with enterprise-grade authentication and distributed computing support.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React application with TypeScript
- Responsive UI with comprehensive MLOps features
- Real-time data visualization and monitoring

### Backend (Java Spring Boot + Java 25)
- **Java 25** with Spring Boot 3.4.0
- **Keycloak Authentication** for enterprise security
- **PostgreSQL Database** for data persistence
- **MinIO Object Storage** for file management
- **MLflow Integration** for experiment tracking
- **Ray Cluster** for distributed computing

## 🛠️ Backend Services

### 🔐 Authentication & Security
- **Keycloak Server**: Enterprise identity provider (Port 8081)
- **JWT Token Validation**: Stateless authentication
- **Role-Based Access Control**: admin, user, ml-engineer, data-scientist roles
- **OAuth2 Integration**: Complete OAuth2 flow support

### 🗄️ Data Management
- **PostgreSQL Database**: Primary data store (Port 5432)
- **MinIO Object Storage**: S3-compatible file storage (Ports 9000, 9001)
- **Flyway Migrations**: Database schema management
- **JPA/Hibernate**: Object-relational mapping

### 🤖 ML Operations
- **MLflow Server**: Experiment tracking and model registry (Port 5000)
- **Ray Cluster**: Distributed computing platform (Ports 8265, 10001)
- **Model Management**: Version control and deployment
- **Experiment Tracking**: Comprehensive ML experiment management

### 🔌 API Services
- **RESTful APIs**: Complete CRUD operations for all entities
- **Health Monitoring**: Service status and integration checks
- **File Operations**: Upload, download, and management
- **Real-time Integration**: WebSocket support for live updates

## 🚀 Features

### 🏠 Dashboard & Navigation
- **Home Dashboard**: Overview of all MLOps activities and metrics
- **Responsive Navigation**: Sidebar with collapsible menu for all features
- **User Profile**: Account management and settings
- **Activities Feed**: Real-time activity tracking across the platform

### 🗄️ Dataset Management
- Upload and manage datasets in various formats (CSV, JSON, Parquet, HDF5, TFRecord)
- Version control and metadata tracking
- Advanced search and filtering capabilities
- Public/private/organization visibility settings
- Dataset preview and statistics
- Detailed dataset information pages

### 🤖 Model Management
- Upload and version machine learning models
- Support for multiple frameworks (TensorFlow, PyTorch, Scikit-learn, ONNX)
- Model performance metrics and evaluation
- Model deployment capabilities
- Code examples and usage documentation
- Model versioning and comparison

### 🧪 Experiment Tracking
- Create and manage ML experiments
- Track experiment parameters and configurations
- Compare different experiment runs with interactive charts
- Experiment status monitoring (active, completed, failed, cancelled)
- Tag-based organization and filtering
- Detailed experiment metrics visualization

### 🏃 Run Management
- Detailed run tracking with parameters and metrics
- Real-time run status monitoring
- Artifact management and download
- Run comparison and analysis
- Training logs and visualization
- Performance metrics tracking

### 📊 Model Monitoring
- **Real-time Monitoring**: Live model performance tracking
- **Data Drift Detection**: Automated drift detection with alerts
- **Performance Metrics**: Accuracy, precision, recall, F1-score tracking
- **Text Analysis Metrics**: 
  - Percentile text content drift score
  - Mean text length analysis
  - Mean sentence count tracking
  - Mean word count monitoring
- **Interactive Charts**: Line charts for trend analysis
- **Alert Management**: Custom threshold alerts and notifications
- **Report Generation**: Automated monitoring reports
- **History Tracking**: Detailed request/response history

### ⏰ Automated Scheduling
- **Schedule Management**: Create and manage automated tasks
- **Cron-based Scheduling**: Flexible scheduling with crontab expressions
- **Job Configuration**: Set parameters, environment variables, and commands
- **Run History**: Track execution history and status
- **Entity Linking**: Connect schedules to specific models, datasets, or experiments
- **Codebase Integration**: Link schedules to specific code repositories

### 🔌 Inference Services
- **Service Management**: Deploy and manage model inference endpoints
- **API Endpoints**: RESTful API for model serving
- **Load Balancing**: Distribute traffic across multiple instances
- **Health Monitoring**: Service health and performance tracking
- **Scaling**: Auto-scaling based on demand

### 🎯 Entrypoints
- **API Gateway**: Centralized entry point for all services
- **Request Routing**: Intelligent routing to appropriate services
- **Authentication**: Secure access control
- **Rate Limiting**: Protect services from abuse
- **Monitoring**: Track usage and performance

### 🧩 Solutions
- **Solution Templates**: Pre-built MLOps solution templates
- **End-to-End Pipelines**: Complete ML workflows
- **Best Practices**: Industry-standard MLOps patterns
- **Custom Solutions**: Build and share custom solutions

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Material-UI Components**: Consistent, accessible design system
- **Dark/Light Theme**: Theme switching capability
- **Interactive Visualizations**: Rich charts and graphs with Recharts
- **Advanced Data Tables**: Sortable, filterable, exportable data grids
- **Real-time Updates**: Live data refresh and notifications
- **Intuitive Navigation**: Breadcrumb navigation and deep linking

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Material-UI (MUI) v5**: Component library and design system
- **React Router v6**: Client-side routing
- **React Query**: Server state management and caching
- **Recharts**: Data visualization and charts
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Notification system

### Backend
- **Java 25**: Latest Java with enhanced performance and new features
- **Spring Boot 3.4.0**: Enterprise application framework
- **Spring Security**: Authentication and authorization
- **PostgreSQL 15**: Relational database with advanced features
- **MinIO**: S3-compatible object storage
- **MLflow**: ML experiment tracking and model registry
- **Ray**: Distributed computing platform
- **Keycloak**: Enterprise identity and access management
- **Docker & Docker Compose**: Containerization and orchestration

### Development Tools
- **Create React App**: Build tooling and development server
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

### UI Components
- **DataGrid**: Advanced data tables with sorting, filtering, pagination
- **Date Pickers**: Date range selection and filtering
- **Charts**: Line charts, bar charts, scatter plots
- **Forms**: Comprehensive form components with validation
- **Navigation**: Responsive sidebar and breadcrumb navigation

## 📁 Project Structure

```
mlops_hub/
├── frontend/                # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── ...
│   ├── public/              # Public static files
│   └── package.json         # Frontend dependencies
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/        # Java source code
│   │       └── resources/   # Configuration files
│   └── pom.xml              # Maven dependencies
└── inference_server/       # Python inference server
    ├── app/                  # Application code
    └── requirements.txt      # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

#### Frontend
- **Node.js 16+**: JavaScript runtime
- **npm or yarn**: Package manager

#### Backend
- **Java 25+**: Latest Java runtime
- **Maven 3.6+**: Build tool
- **Docker & Docker Compose**: For containerized services

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd mlops_hub
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Start all services with Docker Compose
./start.sh

# Or start services individually
docker-compose up -d
```

#### 4. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Keycloak Admin**: [http://localhost:8081](http://localhost:8081) (admin/admin)
- **MLflow UI**: [http://localhost:5000](http://localhost:5000)
- **Ray Dashboard**: [http://localhost:8265](http://localhost:8265)
- **Ray Client**: localhost:20000
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (minioadmin/minioadmin)

### Available Scripts

#### Frontend Scripts
- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run lint` - Runs ESLint for code quality

#### Backend Scripts
```bash
cd backend

# Choose your deployment mode:
./dev.sh               # Development: K8s infrastructure + local backend


# Additional commands:
./dev.sh delete        # Delete infrastructure from K8s
```

## 🧩 Key Components

### DataTable Component
A powerful, reusable data table with:
- **Sorting**: Multi-column sorting capabilities
- **Filtering**: Advanced filtering options
- **Pagination**: Configurable page sizes
- **Row Selection**: Single and multi-row selection
- **Action Buttons**: Edit, delete, download actions
- **Search**: Real-time search functionality
- **Export**: Data export capabilities
- **Column Management**: Show/hide columns
- **Density Control**: Compact, standard, comfortable views

### SearchBar Component
Advanced search functionality with:
- **Text Search**: Real-time text search
- **Filter Options**: Multiple filter types
- **Date Range Selection**: Time-based filtering
- **Tag Filtering**: Tag-based search
- **Real-time Results**: Instant search results

### Layout Component
Main application layout featuring:
- **Responsive Navigation**: Collapsible sidebar
- **User Profile Menu**: Account management
- **Notification System**: Real-time notifications
- **Breadcrumb Navigation**: Context-aware navigation
- **Mobile Support**: Touch-friendly mobile interface

## 📊 Monitoring Features

### Text Analysis Metrics
The monitoring system includes specialized text analysis capabilities:

- **Drift Detection**: Track data drift in text content over time
- **Text Length Analysis**: Monitor average text length changes
- **Sentence Count Tracking**: Track sentence count variations
- **Word Count Monitoring**: Monitor word count distributions
- **Interactive Charts**: Visualize trends with line charts
- **Alert System**: Get notified of significant changes

### Performance Metrics
- **Accuracy Tracking**: Model accuracy over time
- **Precision/Recall**: Classification performance metrics
- **F1-Score**: Balanced performance measurement
- **Response Time**: API response time monitoring
- **Throughput**: Request processing rates

## ⏰ Scheduling System

### Job Management
- **Cron Expressions**: Flexible scheduling with standard cron syntax
- **Job Configuration**: Set parameters, environment variables, commands
- **Entity Linking**: Connect jobs to specific models, datasets, experiments
- **Run History**: Track execution history and results
- **Status Monitoring**: Real-time job status updates

### Supported Job Types
- **Data Processing**: Automated data pipeline jobs
- **Model Training**: Scheduled model retraining
- **Monitoring Jobs**: Automated monitoring and alerting
- **Report Generation**: Scheduled report creation
- **Model Deployment**: Automated deployment workflows

## 🔌 API Integration

The application is designed to work with a backend API. Expected endpoints:

- `/api/datasets` - Dataset management
- `/api/models` - Model management
- `/api/experiments` - Experiment tracking
- `/api/runs` - Run management
- `/api/monitoring` - Model monitoring
- `/api/schedules` - Job scheduling
- `/api/inference-services` - Inference service management
- `/api/entrypoints` - API gateway management
- `/api/solutions` - Solution templates
- `/api/activities` - Activity tracking
- `/api/users` - User management

## 🎨 UI/UX Features

### Design System
- **Material-UI Components**: Consistent, accessible design
- **Custom Theme**: Branded color scheme and typography
- **Responsive Grid**: Adaptive layout system
- **Interactive Elements**: Hover states and animations
- **Loading States**: Skeleton loaders and progress indicators

### Data Visualization
- **Line Charts**: Trend analysis and time series data
- **Bar Charts**: Comparative data visualization
- **Scatter Plots**: Correlation analysis
- **Interactive Tooltips**: Detailed data on hover
- **Responsive Charts**: Adapt to different screen sizes

### User Experience
- **Intuitive Navigation**: Clear information architecture
- **Search & Filter**: Powerful data discovery
- **Real-time Updates**: Live data refresh
- **Error Handling**: Graceful error states
- **Loading States**: Clear feedback during operations

## 🚧 Roadmap

### Completed Features ✅
- [x] Core MLOps platform structure
- [x] Dataset management with versioning
- [x] Model management and deployment
- [x] Experiment tracking with metrics visualization
- [x] Run management and artifact tracking
- [x] Model monitoring with text analysis metrics
- [x] Automated scheduling system
- [x] Inference service management
- [x] API gateway (entrypoints)
- [x] Solution templates
- [x] Activity tracking
- [x] Responsive UI with Material-UI
- [x] Advanced data tables
- [x] Interactive charts and visualizations

### In Progress 🚧
- [ ] Backend API integration
- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Advanced visualization components

### Planned Features 📋
- [ ] Model deployment pipeline
- [ ] Data versioning and lineage
- [ ] Collaborative features
- [ ] API documentation
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Advanced monitoring dashboards
- [ ] Custom metric definitions
- [ ] A/B testing framework
- [ ] Model performance comparison
- [ ] Automated model retraining
- [ ] Data quality monitoring
- [ ] Cost optimization tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Write meaningful commit messages
- Add proper error handling
- Include responsive design considerations
- Test on multiple screen sizes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@mlopshub.com or create an issue in the repository.

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- Recharts for powerful data visualization
- React Query for efficient data fetching
- The MLOps community for inspiration and best practices
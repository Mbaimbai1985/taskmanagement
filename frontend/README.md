# TaskManager Frontend - React Application

A modern, responsive React frontend for the TaskManager application, featuring real-time task management, authentication, role-based permissions, and a beautiful user interface.

##  Quick Start

### Prerequisites
- **Node.js 16+** (LTS recommended)
- **npm 8+** or **yarn 1.22+**
- **Git**

### Installation & Setup
```bash
# Clone the repository
git clone <repository-url>
cd task-management-system/frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend URL**: `http://localhost:3000`

### Available Scripts
```bash
# Development server with hot reloading
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject

# Lint and fix code
npm run lint
npm run lint:fix
```

##  Architecture & Structure

### Project Structure
```
frontend/
├── public/                     # Static assets
│   ├── index.html             # Main HTML template
│   ├── favicon.ico            # App icon
│   └── manifest.json          # PWA manifest
├── src/                       # Source code
│   ├── api/                   # API service layer
│   │   └── ApiService.js      # Centralized API client
│   ├── common/                # Shared components
│   │   └── Navbar.jsx         # Navigation bar
│   ├── components/            # Reusable components
│   │   ├── TaskDetails.jsx    # Task details modal
│   │   └── TaskDetails.css    # Component styling
│   ├── guard/                 # Route protection
│   │   └── AuthRoute.jsx      # Protected route wrapper
│   ├── pages/                 # Page components
│   │   ├── AdminTasksPage.jsx # Admin dashboard
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   └── TasksPage.jsx      # Main tasks dashboard
│   ├── services/              # Business logic services
│   │   └── WebSocketService.js # Real-time communication
│   ├── App.js                 # Main app component
│   ├── App.css                # Global styles
│   └── index.js               # React entry point
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

##  UI/UX Features

### Design System
- **Color Palette**: Modern blue/purple gradient theme
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable, accessible components
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Layout**: CSS Grid and Flexbox
- **Touch Friendly**: Large tap targets and gestures

### Accessibility
- **Semantic HTML**: Proper HTML5 elements
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG 2.1 AA compliant

##  Technologies & Dependencies

### Core Technologies
- **React 18+** - UI framework with Hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **WebSocket** - Real-time communication
- **CSS3** - Modern styling with Grid/Flexbox

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "@hello-pangea/dnd": "^16.5.0",
    "sockjs-client": "^1.6.1",
    "stompjs": "^2.3.3"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  }
}
```

##  Authentication Flow

### Login Process
1. User enters email/password
2. Frontend validates input
3. API call to `/api/auth/login`
4. JWT token stored in localStorage
5. User redirected to dashboard
6. Token included in subsequent requests

### Registration Process
1. User fills registration form
2. Frontend validation (email format, password strength)
3. API call to `/api/auth/register`
4. Automatic login after successful registration
5. Welcome dashboard display

### Token Management
```javascript
// ApiService.js token handling
static getToken() {
  return localStorage.getItem('token');
}

static setToken(token) {
  localStorage.setItem('token', token);
}

static removeToken() {
  localStorage.removeItem('token');
}

static getHeader() {
  return {
    Authorization: `Bearer ${this.getToken()}`
  };
}
```

### Protected Routes
```javascript
// AuthRoute.jsx - Route protection
const AuthRoute = ({ element }) => {
  const isAuthenticated = ApiService.isAuthenticated();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};
```

##  State Management

### Component State (useState)
```javascript
// Example: TasksPage.jsx
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### Effect Management (useEffect)
```javascript
// Example: Loading tasks on component mount
useEffect(() => {
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllMyTasks();
      setTasks(response.data);
    } catch (error) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  fetchTasks();
}, []);
```

### Permission State
```javascript
// Role-based UI rendering
const [permissions, setPermissions] = useState({
  canCreateTasks: false,
  canDeleteTasks: false,
  canUpdateTasks: false
});

useEffect(() => {
  const loadPermissions = async () => {
    const canCreate = await ApiService.canCreateTasks();
    const canDelete = await ApiService.canDeleteTasks();
    const canUpdate = await ApiService.canUpdateTasks();
    
    setPermissions({ canCreate, canDelete, canUpdate });
  };
  
  loadPermissions();
}, []);
```

##  API Integration

### ApiService Structure
```javascript
class ApiService {
  static API_URL = 'http://localhost:8080/api';
  
  // Authentication
  static async login(loginRequest) { /* ... */ }
  static async register(userRequest) { /* ... */ }
  
  // Task Management
  static async getAllMyTasks() { /* ... */ }
  static async createTask(taskRequest) { /* ... */ }
  static async updateTask(taskRequest) { /* ... */ }
  static async deleteTask(taskId) { /* ... */ }
  
  // Comment Management
  static async addComment(taskId, comment) { /* ... */ }
  static async getTaskComments(taskId) { /* ... */ }
  static async updateComment(commentId, comment) { /* ... */ }
  static async deleteComment(commentId) { /* ... */ }
  
  // Permission Checks
  static async canCreateTasks() { /* ... */ }
  static async canDeleteTasks() { /* ... */ }
  static async canEditComment(username) { /* ... */ }
}
```

### Error Handling
```javascript
// Global error handling pattern
try {
  const response = await ApiService.createTask(taskData);
  // Success handling
  setTasks([...tasks, response.data]);
  setSuccess('Task created successfully');
} catch (error) {
  // Error handling
  if (error.response?.status === 401) {
    // Redirect to login
    ApiService.logout();
    navigate('/login');
  } else {
    setError(error.response?.data?.message || 'An error occurred');
  }
}
```

##  Real-time Features

### WebSocket Connection
```javascript
// WebSocketService.js
class WebSocketService {
  static connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      console.log('WebSocket connected');
    });
  }
  
  static subscribeToTasks(callback) {
    return this.stompClient.subscribe('/topic/tasks', (message) => {
      const taskUpdate = JSON.parse(message.body);
      callback(taskUpdate);
    });
  }
}
```

### Real-time Task Updates
```javascript
// TasksPage.jsx - WebSocket integration
useEffect(() => {
  // Subscribe to task updates
  const unsubscribe = WebSocketService.subscribeToTasks((update) => {
    // Update local state based on WebSocket message
    handleTaskUpdate(update);
  });
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
```

##  Component Documentation

### TasksPage Component
**Purpose**: Main dashboard displaying user tasks
**Features**: 
- Task filtering by status
- Create new tasks
- Task status updates
- Real-time updates

```javascript
// Usage
<TasksPage />

// Props: None (uses authentication context)
```

### TaskDetails Component
**Purpose**: Modal for viewing/editing task details and comments
**Features**:
- Task information display
- Comment CRUD operations
- Status change controls
- Permission-based UI

```javascript
// Usage
<TaskDetails 
  task={selectedTask}
  onClose={handleCloseModal}
  onTaskUpdate={handleTaskUpdate}
/>
```

### AuthRoute Component
**Purpose**: Protects routes requiring authentication
```javascript
// Usage
<Route 
  path="/dashboard" 
  element={<AuthRoute element={<TasksPage />} />} 
/>
```

### Navbar Component
**Purpose**: Navigation bar with user info and logout
**Features**:
- User role display
- Navigation links
- Logout functionality
- Responsive design

##  User Experience

### Loading States
```javascript
// Loading component pattern
{loading ? (
  <div className="loading-spinner">Loading tasks...</div>
) : (
  <TaskList tasks={tasks} />
)}
```

### Error Handling
```javascript
// Error display pattern
{error && (
  <div className="error-message">
    <p>{error}</p>
    <button onClick={retryAction}>Try Again</button>
  </div>
)}
```

### Success Feedback
```javascript
// Success notification pattern
{success && (
  <div className="success-message">
    <p>{success}</p>
  </div>
)}
```

### Form Validation
```javascript
// Form validation example
const validateForm = () => {
  const errors = {};
  
  if (!title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!description.trim()) {
    errors.description = 'Description is required';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

##  Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test TaskDetails.test.js
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   │   ├── TaskDetails.test.js
│   │   └── TasksPage.test.js
│   ├── services/
│   │   └── ApiService.test.js
│   └── utils/
│       └── auth.test.js
```

### Sample Test
```javascript
// TaskDetails.test.js
import { render, screen } from '@testing-library/react';
import TaskDetails from '../components/TaskDetails';

test('renders task title', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description'
  };
  
  render(
    <TaskDetails 
      task={mockTask}
      onClose={() => {}}
      onTaskUpdate={() => {}}
    />
  );
  
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
```

##  Build & Deployment

### Development Build
```bash
npm start
# Serves on http://localhost:3000
# Hot reloading enabled
# Source maps included
```

### Production Build
```bash
npm run build
# Creates optimized build in 'build/' folder
# Code splitting enabled
# Assets minified and compressed
```

### Environment Variables
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=http://localhost:8080/ws

# .env.production
REACT_APP_API_URL=https://api.taskmanager.com/api
REACT_APP_WS_URL=https://api.taskmanager.com/ws
```

### Deployment Options
```bash
# Static hosting (Netlify, Vercel)
npm run build
# Deploy 'build' folder

# Docker deployment
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
EXPOSE 80
```

##  Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

### Proxy Configuration
```json
// package.json - Development API proxy
{
  "proxy": "http://localhost:8080"
}
```

##  Performance Optimization

### Code Splitting
```javascript
// Lazy loading pages
const TasksPage = lazy(() => import('./pages/TasksPage'));
const AdminPage = lazy(() => import('./pages/AdminTasksPage'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <TasksPage />
</Suspense>
```

### Memoization
```javascript
// React.memo for component optimization
export default React.memo(TaskDetails);

// useMemo for expensive calculations
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === selectedStatus);
}, [tasks, selectedStatus]);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm install -g source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

##  Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// If CORS issues, check backend CORS configuration
// or use proxy in package.json for development
```

#### WebSocket Connection Issues
```javascript
// Check WebSocket URL configuration
// Ensure backend WebSocket endpoint is running
```

#### Authentication Issues
```javascript
// Clear localStorage if token issues
localStorage.clear();
// Check token expiration
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

##  Future Enhancements

- [ ] Progressive Web App (PWA) features
- [ ] Offline support with service workers
- [ ] Advanced drag-and-drop with react-beautiful-dnd
- [ ] Real-time notifications
- [ ] Dark/light theme toggle
- [ ] Advanced search and filtering
- [ ] Keyboard shortcuts
- [ ] Internationalization (i18n)
- [ ] Performance monitoring
- [ ] Component library documentation

##  Contributing

### Development Guidelines
1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error boundaries
4. Write tests for new components
5. Follow CSS naming conventions
6. Ensure mobile responsiveness

### Code Style
- Use ESLint configuration
- Prettier for code formatting
- Meaningful component and variable names
- Proper JSDoc comments

---

**TaskManager Frontend** - Creating beautiful, responsive, and user-friendly task management experiences! 

# Frontend Architecture Documentation

## Overview
This document describes the professional-grade architecture implemented for the Project_Trikla frontend application. The architecture follows industry best practices and patterns commonly used in enterprise React applications.

## Table of Contents
1. [Architecture Principles](#architecture-principles)
2. [Directory Structure](#directory-structure)
3. [Design Patterns](#design-patterns)
4. [Component Documentation](#component-documentation)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Accessibility](#accessibility)
8. [Performance Optimizations](#performance-optimizations)
9. [Development Guidelines](#development-guidelines)

---

## Architecture Principles

### 1. Separation of Concerns
- **Business Logic** → Custom Hooks (`hooks/`)
- **Presentation** → React Components (`components/`)
- **Configuration** → Constants (`constants/`)
- **Utilities** → Pure Functions (`utils/`)

### 2. Single Responsibility Principle
Each module has one clear purpose:
- `useMapState.js` - Manages map-related state only
- `coordinates.js` - Handles coordinate operations only
- `ActionButtons.jsx` - Renders action buttons only

### 3. DRY (Don't Repeat Yourself)
- Shared configuration extracted to `constants/index.js`
- Reusable logic extracted to custom hooks
- Common utilities centralized in `utils/`

### 4. Component Composition
Small, focused components composed together rather than large monolithic components.

### 5. Type Safety
Runtime type checking with PropTypes on all components.

---

## Directory Structure

```
src/
├── constants/
│   └── index.js                    # Centralized app configuration
│
├── utils/
│   ├── coordinates.js              # Coordinate validation & formatting
│   └── logger.js                   # Structured console logging
│
├── hooks/
│   ├── useMapState.js              # Map state management
│   ├── useNotification.js          # Message/notification handling
│   └── useCoordinateSubmission.js  # Submission logic
│
├── components/
│   ├── ErrorBoundary/
│   │   ├── ErrorBoundary.jsx       # Error catching component
│   │   ├── ErrorBoundary.css       # Error UI styles
│   │   └── index.js                # Barrel export
│   │
│   ├── Map/
│   │   ├── LocationMarker.jsx      # Map click & marker display
│   │   ├── InteractiveMap.jsx      # Main map container
│   │   ├── leafletConfig.js        # Leaflet icon setup
│   │   └── index.js                # Barrel export
│   │
│   ├── UI/
│   │   ├── ActionButtons.jsx       # Confirm/Clear buttons
│   │   ├── ActionButtons.css
│   │   ├── CoordinatesDisplay.jsx  # Coordinate panel
│   │   ├── CoordinatesDisplay.css
│   │   ├── InfoPanel.jsx           # Zoom/status info
│   │   ├── InfoPanel.css
│   │   ├── Header.jsx              # Title & instructions
│   │   ├── Header.css
│   │   ├── Notification.jsx        # Alert messages
│   │   ├── Notification.css
│   │   └── index.js                # Barrel export
│   │
│   └── MapSelector.jsx             # Main orchestrator component
│
├── App.jsx                         # Root component with ErrorBoundary
├── App.css                         # Global layout styles
├── main.jsx                        # Application entry point
└── index.css                       # Global CSS reset & base styles
```

---

## Design Patterns

### 1. Custom Hooks Pattern
Extract stateful logic into reusable hooks.

**Example: useMapState.js**
```javascript
export const useMapState = () => {
  const [position, setPosition] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const mapRef = useRef(null);

  // ... logic

  return { position, zoomLevel, mapRef, handleMapClick, ... };
};
```

**Benefits:**
- Logic reusability across components
- Easier testing (hooks can be tested in isolation)
- Cleaner component code

### 2. Composition Pattern
Build complex UIs from small, focused components.

**Example: MapSelector.jsx**
```javascript
const MapSelector = () => {
  const { position, ... } = useMapState();
  const { message, ... } = useNotification();
  
  return (
    <div className="map-selector-container">
      <Header />
      <InteractiveMap />
      <CoordinatesDisplay />
      <ActionButtons />
      <Notification />
    </div>
  );
};
```

**Benefits:**
- Each component is small and testable
- Easy to understand and maintain
- Flexible and reusable

### 3. Error Boundary Pattern
Catch JavaScript errors anywhere in the component tree.

**Example: App.jsx**
```javascript
<ErrorBoundary>
  <MapSelector />
</ErrorBoundary>
```

**Benefits:**
- Prevents entire app from crashing
- Provides graceful fallback UI
- Logs errors for debugging

### 4. Barrel Export Pattern
Simplify imports with index.js files.

**Example: components/UI/index.js**
```javascript
export { ActionButtons } from './ActionButtons';
export { CoordinatesDisplay } from './CoordinatesDisplay';
// ...
```

**Usage:**
```javascript
import { ActionButtons, CoordinatesDisplay } from '../components/UI';
```

### 5. Memoization Pattern
Optimize performance with React.memo and useCallback.

**Example: LocationMarker.jsx**
```javascript
export const LocationMarker = React.memo(({ position, onLocationSelect }) => {
  // Component only re-renders if props change
});
```

---

## Component Documentation

### Core Components

#### 1. MapSelector (Orchestrator)
**Purpose:** Main component that orchestrates all child components and hooks.

**Responsibilities:**
- Initializes Leaflet configuration
- Composes all UI and Map components
- Connects hooks to components via props
- Manages overall application state flow

**Props:** None (root component)

**Key Features:**
- Uses custom hooks for state management
- Implements composition pattern
- PropTypes validation
- Clean, readable JSX structure

---

#### 2. InteractiveMap
**Purpose:** Renders the Leaflet map with tile layer and handles map events.

**Props:**
```javascript
{
  position: { lat: number, lng: number } | null,
  onLocationSelect: (latlng) => void,
  onZoomChange: (zoom) => void,
  center: [number, number],
  zoom: number,
  minZoom: number,
  maxZoom: number,
  maxBounds: [[number, number], [number, number]],
  tileLayerUrl: string,
  attribution: string
}
```

**Features:**
- World bounds enforcement
- Zoom constraints
- OpenStreetMap tile layer
- Event forwarding to parent

---

#### 3. LocationMarker
**Purpose:** Handles map click events and displays marker at selected location.

**Props:**
```javascript
{
  position: { lat: number, lng: number } | null,
  onLocationSelect: (latlng) => void,
  onZoomChange: (zoom) => void
}
```

**Features:**
- UseMapEvents hook for click handling
- Marker display at selected position
- Popup with formatted coordinates
- Memoized for performance

---

#### 4. ActionButtons
**Purpose:** Renders Confirm and Clear buttons with event handling.

**Props:**
```javascript
{
  position: { lat: number, lng: number } | null,
  onConfirm: () => void,
  onClear: () => void,
  isSubmitting: boolean
}
```

**Features:**
- Keyboard navigation (Enter/Escape)
- Disabled states
- Loading states
- ARIA labels for accessibility
- Focus management

---

#### 5. CoordinatesDisplay
**Purpose:** Shows selected coordinates in a floating panel.

**Props:**
```javascript
{
  position: { lat: number, lng: number } | null
}
```

**Features:**
- Formatted coordinate display (6 decimal places)
- ARIA live region for screen readers
- Animated slide-in
- Conditional rendering (only when position exists)

---

#### 6. InfoPanel
**Purpose:** Displays zoom level and selection status.

**Props:**
```javascript
{
  zoomLevel: number,
  isLocationSelected: boolean
}
```

**Features:**
- ARIA status role
- Dynamic status message
- Always visible at bottom-left

---

#### 7. Header
**Purpose:** Application title and instructions.

**Props:**
```javascript
{
  title: string,
  instructions: string
}
```

**Features:**
- Customizable title/instructions
- Glassmorphic design
- Centered at top
- Responsive design

---

#### 8. Notification
**Purpose:** Displays alert messages (success/error/warning/info).

**Props:**
```javascript
{
  message: string | null,
  type: 'success' | 'error' | 'warning' | 'info',
  onClose: () => void
}
```

**Features:**
- Type-based styling
- Close button
- ARIA alert role
- Animated slide-in
- Auto-hide support (via useNotification hook)

---

#### 9. ErrorBoundary
**Purpose:** Catches errors anywhere in component tree and displays fallback UI.

**Props:**
```javascript
{
  children: ReactNode,
  fallback: ReactNode (optional)
}
```

**Features:**
- Class component (required for error boundaries)
- Displays error details in development
- Retry and reload buttons
- Error logging to console
- Styled fallback UI

---

## State Management

### Custom Hooks Architecture

#### 1. useMapState
**State:**
- `position`: Current marker position `{ lat, lng }`
- `zoomLevel`: Current map zoom level
- `mapRef`: Reference to Leaflet map instance

**Methods:**
- `handleMapClick(latlng)`: Updates position on map click
- `handleZoomChange(zoom)`: Updates zoom level
- `clearPosition()`: Clears selected position
- `getMapInstance()`: Returns map instance for imperative operations

**Usage:**
```javascript
const { position, zoomLevel, mapRef, handleMapClick, clearPosition } = useMapState();
```

---

#### 2. useNotification
**State:**
- `message`: Current notification message
- `messageType`: Type of message ('success', 'error', 'warning', 'info')

**Methods:**
- `showNotification(message, type, duration)`: Shows notification with auto-hide
- `showSuccess(message, duration)`: Helper for success messages
- `showError(message, duration)`: Helper for error messages
- `showWarning(message, duration)`: Helper for warning messages
- `hideNotification()`: Manually hides notification

**Features:**
- Auto-hide with configurable duration (default 3s)
- Cleanup on unmount (prevents memory leaks)

**Usage:**
```javascript
const { message, messageType, showSuccess, showError } = useNotification();
```

---

#### 3. useCoordinateSubmission
**State:**
- `isSubmitting`: Boolean indicating submission in progress

**Methods:**
- `submitCoordinates(position, onSuccess, onError)`: Handles async submission
  - Validates coordinates
  - Logs to console
  - Calls success/error callbacks

**Usage:**
```javascript
const { isSubmitting, submitCoordinates } = useCoordinateSubmission();

const handleConfirm = () => {
  submitCoordinates(
    position,
    () => showSuccess('Coordinates submitted!'),
    (error) => showError(error)
  );
};
```

---

## Error Handling

### Levels of Error Handling

#### 1. Component Level (ErrorBoundary)
Catches React rendering errors, lifecycle errors, and constructor errors.

**What it catches:**
- Errors in render methods
- Errors in lifecycle methods
- Errors in constructors of child components

**What it doesn't catch:**
- Event handlers (use try-catch)
- Async code (use try-catch)
- Server-side rendering errors
- Errors in ErrorBoundary itself

**Implementation:**
```javascript
<ErrorBoundary>
  <MapSelector />
</ErrorBoundary>
```

---

#### 2. Function Level (Validation)
Input validation prevents errors before they occur.

**Example: coordinates.js**
```javascript
export const isValidCoordinates = (position) => {
  if (!position || typeof position !== 'object') return false;
  
  const { lat, lng } = position;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  
  return true;
};
```

---

#### 3. Async Level (Try-Catch)
Handle errors in async operations.

**Example: useCoordinateSubmission.js**
```javascript
const submitCoordinates = async (position, onSuccess, onError) => {
  try {
    setIsSubmitting(true);
    
    if (!isValidCoordinates(position)) {
      throw new Error('Invalid coordinates');
    }
    
    // ... operation
    
    onSuccess?.();
  } catch (error) {
    onError?.(error.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Accessibility

### ARIA Implementation

#### 1. Semantic HTML
Use semantic elements wherever possible.

```javascript
<header>...</header>
<main>...</main>
<button>...</button>
```

---

#### 2. ARIA Labels
Descriptive labels for screen readers.

**Example: ActionButtons.jsx**
```javascript
<button
  aria-label={ARIA_LABELS.CONFIRM_SELECTION}
  aria-disabled={!position || isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Confirm'}
</button>
```

---

#### 3. ARIA Live Regions
Announce dynamic content changes.

**Example: CoordinatesDisplay.jsx**
```javascript
<div aria-live="polite" aria-atomic="true">
  Lat: {formatCoordinate(position.lat)}
  Lng: {formatCoordinate(position.lng)}
</div>
```

---

#### 4. ARIA Roles
Define component purpose.

**Example: InfoPanel.jsx**
```javascript
<div role="status" aria-live="polite">
  Zoom: {zoomLevel}
</div>
```

**Example: Notification.jsx**
```javascript
<div role="alert" className="notification">
  {message}
</div>
```

---

#### 5. Keyboard Navigation
Full keyboard support for interactive elements.

**Example: ActionButtons.jsx**
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === KEYBOARD_KEYS.ENTER && position && !isSubmitting) {
      onConfirm();
    } else if (e.key === KEYBOARD_KEYS.ESCAPE && position) {
      onClear();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, [position, isSubmitting, onConfirm, onClear]);
```

---

## Performance Optimizations

### 1. React.memo
Prevent unnecessary re-renders of components.

**When to use:**
- Pure functional components
- Components that receive same props frequently
- Expensive render operations

**Example:**
```javascript
export const LocationMarker = React.memo(({ position, onLocationSelect }) => {
  // Component only re-renders if position or onLocationSelect changes
});
```

---

### 2. useCallback
Memoize callback functions to prevent child re-renders.

**When to use:**
- Callbacks passed to child components wrapped in React.memo
- Dependencies in useEffect that should be stable

**Example:**
```javascript
const handleMapClick = useCallback((latlng) => {
  setPosition(latlng);
}, []); // Stable reference across renders
```

---

### 3. useMemo
Memoize expensive calculations.

**When to use:**
- Expensive computations
- Creating objects/arrays that are used as dependencies

**Example:**
```javascript
const formattedCoordinates = useMemo(() => {
  if (!position) return null;
  return {
    lat: formatCoordinate(position.lat),
    lng: formatCoordinate(position.lng)
  };
}, [position]);
```

---

### 4. Code Splitting (Future Enhancement)
Lazy load components to reduce initial bundle size.

**Example:**
```javascript
const MapSelector = React.lazy(() => import('./components/MapSelector'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MapSelector />
    </Suspense>
  );
}
```

---

## Development Guidelines

### 1. Component Creation Checklist
- [ ] Component has single, clear responsibility
- [ ] PropTypes defined for all props
- [ ] displayName set for debugging
- [ ] Memoized if pure and used frequently
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation where applicable
- [ ] Separate CSS file for styles
- [ ] Barrel export in index.js
- [ ] JSDoc comments for complex logic

---

### 2. Hook Creation Checklist
- [ ] Hook name starts with "use"
- [ ] Clear purpose documented
- [ ] All dependencies in useEffect/useCallback/useMemo
- [ ] Cleanup functions for subscriptions/timers
- [ ] Returns object with named exports
- [ ] JSDoc comments for parameters and return value

---

### 3. Utility Function Checklist
- [ ] Pure function (no side effects)
- [ ] Clear input/output types
- [ ] Edge cases handled
- [ ] JSDoc comments with examples
- [ ] Unit test coverage
- [ ] Named export

---

### 4. Code Style Guidelines

**Naming Conventions:**
- **Components**: PascalCase (`MapSelector.jsx`)
- **Hooks**: camelCase with "use" prefix (`useMapState.js`)
- **Utilities**: camelCase (`coordinates.js`)
- **Constants**: UPPER_SNAKE_CASE (`MAP_CONFIG`)
- **CSS Classes**: kebab-case (`map-selector-container`)

**File Organization:**
- One component per file
- Related files in same directory
- Barrel exports (index.js) for directory-level exports
- CSS files co-located with components

**Import Order:**
1. React imports
2. Third-party libraries
3. Internal components
4. Internal hooks
5. Internal utilities
6. Internal constants
7. CSS files

**Example:**
```javascript
import React, { useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { LocationMarker } from './LocationMarker';
import { useMapState } from '../../hooks/useMapState';
import { isValidCoordinates } from '../../utils/coordinates';
import { MAP_CONFIG } from '../../constants';

import './InteractiveMap.css';
```

---

### 5. Testing Strategy

**Unit Tests (Utilities & Hooks):**
- Test pure functions in isolation
- Test hooks with @testing-library/react-hooks
- Mock external dependencies

**Component Tests:**
- Test component rendering
- Test user interactions
- Test prop changes
- Test accessibility (screen reader, keyboard)

**Integration Tests:**
- Test component compositions
- Test data flow between components
- Test error scenarios

**Example Test Structure:**
```javascript
describe('useMapState', () => {
  it('should initialize with null position', () => {
    // Test hook initialization
  });

  it('should update position on handleMapClick', () => {
    // Test state updates
  });

  it('should clear position on clearPosition', () => {
    // Test state clearing
  });
});
```

---

### 6. Git Commit Guidelines

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Code style changes (formatting)
- `docs`: Documentation changes
- `test`: Test additions/changes
- `chore`: Build process, dependencies

**Examples:**
```
feat(map): add distance calculation utility

Implemented Haversine formula to calculate distance between
two coordinate points. Used for validating marker placement.

Closes #123
```

```
refactor(components): extract UI components from MapSelector

Split monolithic MapSelector into smaller, focused components:
- ActionButtons
- CoordinatesDisplay
- InfoPanel
- Header
- Notification

Improves maintainability and testability.
```

---

## Conclusion

This architecture provides:
- **Maintainability**: Small, focused modules are easy to understand and modify
- **Testability**: Pure functions, isolated hooks, and small components are easy to test
- **Scalability**: Modular structure supports growth without increasing complexity
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance**: Memoization and optimization patterns prevent unnecessary renders
- **Developer Experience**: Clear patterns, conventions, and documentation

For questions or suggestions, please refer to the team lead or create an issue in the project repository.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team

# Focus To-Do Clone

A vanilla JavaScript implementation of the Focus To-Do application with Pomodoro timer and task management features.

## Project Structure

```
Focus-ToDo-CoPilot/
├── index.html              # Main entry point
├── assets/                 # Static assets
│   ├── images/            # Images and icons
│   └── sounds/            # Notification sounds
├── styles/                # CSS files
│   ├── main.css          # Main styles
│   ├── timer.css         # Timer component styles
│   └── tasks.css         # Task list styles
└── scripts/              # JavaScript modules
    ├── app.js            # Main application logic
    ├── timer.js          # Timer functionality
    ├── tasks.js          # Task management
    ├── storage.js        # Local storage handling
    ├── ui.js            # UI updates and rendering
    └── utils.js          # Utility functions
```

## Features
- Pomodoro timer with customizable sessions
- Task and project management
- Progress tracking and reports
- Local storage persistence
- Desktop notifications

## Architecture

### Core Modules
1. Timer Module (`timer.js`)
   - Manages Pomodoro sessions
   - Handles session transitions
   - Emits events for session completion
   - Session types: focus (25m), short break (5m), long break (15m)

2. Task Manager (`tasks.js`)
   - Handles CRUD operations for tasks
   - Manages task state and pomodoro tracking
   - Validates task input
   - Emits events for task updates

3. Storage Service (`storage.js`)
   - Persists application state
   - Handles data serialization/deserialization
   - Manages localStorage operations
   - Key storage items: tasks, timer state, statistics

4. Reports Service (`reports.js`)
   - Tracks daily and weekly statistics
   - Calculates productivity metrics
   - Generates performance reports
   - Maintains historical data

5. Notification Service (`notifications.js`)
   - Manages desktop notifications
   - Handles sound effects
   - Controls notification permissions
   - Manages user preferences

## Data Flow
```
Timer Completion → Update Task Progress → Update Statistics → Save State
↓
Notification Service → User Interaction → Task State Change
↓
Storage Service → Data Persistence → Reports Update
```

## Event System
- Timer events: start, pause, complete
- Task events: add, update, delete, complete
- Storage events: save, load, clear
- Notification events: show, sound, permission

## State Management
1. Timer State:
   - Current session type
   - Time remaining
   - Running status
   - Current task

2. Task State:
   - Task list
   - Active task
   - Task progress
   - Task metadata

3. Application State:
   - Current view
   - User preferences
   - Statistics
   - Session history

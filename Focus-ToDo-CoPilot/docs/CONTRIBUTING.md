# Contributing Guide

## Code Organization

```
src/
├── scripts/           # JavaScript modules
│   ├── app.js        # Application entry point
│   ├── timer.js      # Timer functionality
│   ├── tasks.js      # Task management
│   ├── storage.js    # Data persistence
│   ├── reports.js    # Statistics and reports
│   └── notifications.js # Notifications handling
├── styles/           # CSS modules
└── assets/          # Static resources
```

## Module Dependencies
- app.js → All other modules
- timer.js → storage.js, notifications.js
- tasks.js → storage.js
- reports.js → storage.js
- notifications.js (independent)

## Best Practices
1. Use ES6+ features
2. Follow SOLID principles
3. Implement error handling
4. Add JSDoc comments
5. Validate inputs
6. Test edge cases

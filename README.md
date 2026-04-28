# Developer Dashboard

A React dashboard that helps developers track their GitHub activity, manage personal tasks, and view a live weather widget for their city.

## Features

### GitHub Activity Tracker

- Enter any GitHub username to view their profile stats
- Shows public repositories, followers, and following count
- Displays recent activity (pushes, pull requests, issues, etc.)
- Uses GitHub REST API (no authentication required)

### Task Manager

- Add, complete, and delete personal tasks
- Filter tasks by: All, Active, or Completed
- Tasks persist in localStorage
- Shows remaining vs completed task count

### Weather Widget

- Search weather by city name
- Displays current temperature, weather condition, wind speed, and humidity
- Uses Open-Meteo API (free, no API key required)
- Remembers last searched city

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **CSS** - Custom styling with CSS variables
- **APIs**:
  - [GitHub API](https://docs.github.com/en/rest)
  - [Open-Meteo API](https://open-meteo.com/)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── src/
│   ├── App.jsx        # Main app with all components
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies
└── vite.config.js     # Vite configuration
```

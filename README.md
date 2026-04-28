# Developer Dashboard

A React dashboard that helps developers track their GitHub activity, manage personal tasks, and view a live weather widget for their city.

## Features

### GitHub Activity Tracker

- Enter any GitHub username to view their profile stats
- Shows public repositories, followers, and following count
- Displays recent activity (pushes, pull requests, issues, etc.)
- Uses GitHub REST API (no authentication required)
- Includes search/filter functionality with useMemo

### Task Manager

- Add, complete, and delete personal tasks
- Filter tasks by: All, Active, or Completed
- Tasks persist in localStorage
- Shows remaining vs completed task count
- **Fully controlled component** - input tied to state

### Weather Widget

- Search weather by city name
- Displays current temperature, weather condition, wind speed, and humidity
- Uses wttr.in API (free, no API key required)
- Remembers last searched city

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **CSS** - Custom styling with CSS variables
- **APIs**:
  - [GitHub API](https://api.github.com/users/ichema4u)
  - [wttr.in Weather API](https://wttr.in)

## Custom Hook: useFetch

A reusable custom hook that handles all data fetching:

```javascript
// filepath: src/useFetch.js
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...options,
          signal: abortController.signal,
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!abortController.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: abort fetch on unmount or URL change
    return () => abortController.abort();
  }, [url, options.method, options.headers]);

  return { data, loading, error };
}
```

**Why use useFetch?**

- **DRY Principle**: Eliminates repetitive loading/error/data state in every component
- **Automatic Cleanup**: AbortController prevents memory leaks from stale requests
- **Reusability**: Use anywhere with just `{ data, loading, error } = useFetch(url)`

## React Hooks Used

### 1. useEffect with Proper Dependencies

| Component    | Purpose                    | Dependencies |
| ------------ | -------------------------- | ------------ |
| Task Manager | Save tasks to localStorage | `[tasks]`    |
| Weather      | Save city to localStorage  | `[city]`     |

**What happens if dependency array is removed?**

```javascript
// ❌ WRONG - empty dependency array
useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, []); // Runs only ONCE on mount - never saves changes!
```

**Correct version:**

```javascript
// ✅ CORRECT
useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]); // Runs whenever tasks changes
```

### 2. useMemo - Performance Optimization

**GitHub Page - Filtered Events:**

```javascript
const filteredEvents = useMemo(() => {
  if (!eventsData || !searchInput) return eventsData || [];

  const searchLower = searchInput.toLowerCase();
  return eventsData.filter(
    (event) =>
      event.repo.name.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower),
  );
}, [eventsData, searchInput]);
```

**What useMemo protects against:**

- Prevents re-filtering on every render (e.g., when user types in search)
- Only recalculates when `eventsData` or `searchInput` actually changes
- Critical for large event lists

### 3. Controlled vs Uncontrolled Components

**Controlled (Task Form):**

```javascript
const [newTask, setNewTask] = useState("");

<input
  value={newTask} // State controls value
  onChange={(e) => setNewTask(e.target.value)} // State updates on every keystroke
/>;
```

**Uncontrolled (what to avoid):**

```javascript
const inputRef = useRef(null);
<input ref={inputRef} />; // Must use inputRef.current.value to read
```

**Why controlled?**

- Instant validation and feedback
- Programmatic reset capability (`setNewTask("")`)
- Predictable state for testing

## Fix: Weather Widget Inefficiency

**Original Problem:**

```javascript
// ❌ ORIGINAL - had TWO useEffects with empty arrays
useEffect(() => {
  fetchWeather(city);
}, []); // Runs on mount only

useEffect(() => {
  if (city) {
    fetchWeather(city);
  }
}, []); // ALSO runs on mount only - duplicate!
```

**Issues:**

1. Empty dependency array `[]` — fetch only runs once, not when `city` changes
2. Duplicate useEffect — two effects doing the same thing

**Fixed:**

```javascript
// ✅ FIXED
// Fetch handled by useFetch hook - automatically refetches when URL changes
const { data: weatherData, loading, error } = useFetch(weatherUrl);

// Single useEffect with proper dependency
useEffect(() => {
  if (city) {
    localStorage.setItem("weatherCity", city);
  }
}, [city]); // Runs whenever city changes
```

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
React Class Task 1/
├── src/
│   ├── App.jsx        # Main app with all components
│   ├── useFetch.js    # Custom hook for data fetching
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
├── README.md          # This file
└── .github/
    └── copilot-instructions.md
```

## API Endpoints Used

| Service | Endpoint                                  | Default  |
| ------- | ----------------------------------------- | -------- |
| GitHub  | `https://api.github.com/users/{username}` | ichema4u |
| Weather | `https://wttr.in/{city}?format=j1`        | New York |

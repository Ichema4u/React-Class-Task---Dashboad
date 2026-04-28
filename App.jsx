import { useState, useEffect, useMemo, useCallback } from "react";
import useFetch from "./useFetch";

// GitHub Activity Component
function GitHubActivity() {
  const [username, setUsername] = useState("ichema4u");
  const [searchInput, setSearchInput] = useState("");

  // Build URLs for fetching
  const userUrl = username.trim()
    ? `https://api.github.com/users/${username}`
    : "";
  const eventsUrl = username.trim()
    ? `https://api.github.com/users/${username}/events?per_page=20`
    : "";

  // Use custom hook for user data
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useFetch(userUrl);

  // Use custom hook for events data
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
  } = useFetch(eventsUrl);

  // Memoize the filtered/sorted repos list when there's a search input
  const filteredEvents = useMemo(() => {
    if (!eventsData || !searchInput) return eventsData || [];

    const searchLower = searchInput.toLowerCase();
    return eventsData.filter(
      (event) =>
        event.repo.name.toLowerCase().includes(searchLower) ||
        event.type.toLowerCase().includes(searchLower),
    );
  }, [eventsData, searchInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setSearchInput("");
    }
  };

  const getEventType = (type) => {
    const typeMap = {
      PushEvent: "push",
      PullRequestEvent: "pull_request",
      IssuesEvent: "issues",
      ForkEvent: "fork",
      WatchEvent: "star",
      CreateEvent: "create",
      DeleteEvent: "delete",
    };
    return typeMap[type] || "other";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isLoading = userLoading || eventsLoading;
  const error = userError || eventsError;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub Activity
        </h3>
      </div>

      <form className="github-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          Fetch
        </button>
      </form>

      {/* Search input for filtering events - demonstrates useMemo */}
      {userData && (
        <div className="github-search">
          <input
            type="text"
            placeholder="Filter events..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid var(--bg-card)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
            }}
          />
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <span>Loading GitHub data...</span>
        </div>
      )}

      {error && !isLoading && <div className="error">{error}</div>}

      {userData && !isLoading && (
        <>
          <div className="github-stats">
            <div className="stat-item">
              <div className="stat-value">{userData.public_repos}</div>
              <div className="stat-label">Repositories</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userData.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userData.following}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>

          {filteredEvents && filteredEvents.length > 0 && (
            <div className="recent-events">
              <h4>Recent Activity {searchInput && `(filtered)`}</h4>
              {filteredEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="event-item">
                  <span className={`event-type ${getEventType(event.type)}`}>
                    {event.type.replace("Event", "")}
                  </span>
                  <span className="event-repo">
                    {event.repo.name.split("/")[1] || event.repo.name}
                  </span>
                  <span className="event-time">
                    {formatTime(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!userData && !isLoading && !error && (
        <div className="loading">Enter a GitHub username to fetch data</div>
      )}
    </div>
  );
}

// Task Manager Component - Fully Controlled Form
function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fully controlled input - tied to state
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  // FIXED: Proper dependency array for useEffect
  // This useEffect saves tasks to localStorage and has proper dependency
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Controlled form handler
  const handleInputChange = useCallback((e) => {
    setNewTask(e.target.value);
  }, []);

  // Controlled form submit
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTask,
        completed: false,
      },
    ]);
    setNewTask(""); // Clear the controlled input
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const activeCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks],
  );
  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks],
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Task Manager
        </h3>
      </div>

      {/* Fully Controlled Form - every input tied to state */}
      <form className="task-input" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={handleInputChange}
        />
        <button type="submit">Add</button>
      </form>

      <div className="task-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active ({activeCount})
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({completedCount})
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="loading">
            {filter === "all"
              ? "No tasks yet - add one above!"
              : `No ${filter} tasks`}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div
                className={`task-checkbox ${task.completed ? "checked" : ""}`}
                onClick={() => toggleTask(task.id)}
              />
              <span
                className={`task-text ${task.completed ? "completed" : ""}`}
              >
                {task.text}
              </span>
              <button
                className="task-delete"
                onClick={() => deleteTask(task.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="task-stats">
        <span>{activeCount} remaining</span>
        <span>{completedCount} completed</span>
      </div>
    </div>
  );
}

// Weather Widget Component
function WeatherWidget() {
  const [city, setCity] = useState(() => {
    try {
      return localStorage.getItem("weatherCity") || "New York";
    } catch {
      return "New York";
    }
  });

  // Controlled input state
  const [inputValue, setInputValue] = useState(city);

  // Build URL for weather
  const weatherUrl = city.trim()
    ? `https://wttr.in/${encodeURIComponent(city)}?format=j1`
    : "";

  // Use custom hook for weather data
  const { data: weatherData, loading, error } = useFetch(weatherUrl);

  // Transform data for display
  const weather = useMemo(() => {
    if (!weatherData?.current_condition?.[0]) return null;

    const current = weatherData.current_condition[0];
    const area = weatherData.nearest_area?.[0];

    return {
      temp: parseInt(current.temp_C) || 0,
      condition: current.weatherDesc?.[0]?.value || "Unknown",
      wind: parseInt(current.wind_speed) || 0,
      humidity: parseInt(current.humidity) || 0,
      city: area?.areaName?.[0]?.value || city,
      country: area?.country?.[0]?.value || "",
    };
  }, [weatherData, city]);

  // FIXED: Proper useEffect with city dependency
  // This was the problematic useEffect - now has proper dependency
  useEffect(() => {
    if (city) {
      localStorage.setItem("weatherCity", city);
    }
  }, [city]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCity(inputValue.trim());
    }
  };

  // Handle input change - controlled component
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          Weather
        </h3>
      </div>

      {/* Fully Controlled Form */}
      <form className="weather-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city name"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      {loading && <div className="loading">Loading weather...</div>}

      {error && !loading && <div className="error">{error}</div>}

      {weather && !loading && (
        <>
          <div className="weather-current">
            <span className="weather-icon">
              {weather.condition.toLowerCase().includes("sun")
                ? "☀️"
                : weather.condition.toLowerCase().includes("rain")
                  ? "🌧️"
                  : weather.condition.toLowerCase().includes("cloud")
                    ? "☁️"
                    : weather.condition.toLowerCase().includes("snow")
                      ? "❄️"
                      : "⛅"}
            </span>
            <div>
              <div className="weather-temp">{weather.temp}°C</div>
              <div className="weather-desc">{weather.condition}</div>
            </div>
          </div>

          <div className="weather-location">
            {weather.city}, {weather.country}
          </div>

          <div className="weather-details">
            <div className="weather-detail">
              <div className="weather-detail-label">Wind</div>
              <div className="weather-detail-value">{weather.wind} km/h</div>
            </div>
            <div className="weather-detail">
              <div className="weather-detail-label">Humidity</div>
              <div className="weather-detail-value">{weather.humidity}%</div>
            </div>
          </div>
        </>
      )}

      {!weather && !loading && !error && (
        <div className="loading">Enter a city to get weather</div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Developer Dashboard</h1>
        <p>Track your GitHub activity, manage tasks, and check the weather</p>
      </header>

      <div className="dashboard-grid">
        <GitHubActivity />
        <TaskManager />
        <WeatherWidget />
      </div>
    </div>
  );
}

export default App;

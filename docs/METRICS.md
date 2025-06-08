# Request Metrics

The backend includes middleware that records the start and end time of every API call. Timing data is kept in memory and can be retrieved via the `/metrics` endpoint.

Start the backend with `encore run` and then visit `http://localhost:4000/metrics` to view the latest timings.

Each entry contains the HTTP method, request path, timestamps and total duration in milliseconds:

```json
{
  "method": "GET",
  "path": "/tasks",
  "startedAt": "2024-05-01T12:00:00.000Z",
  "endedAt": "2024-05-01T12:00:00.123Z",
  "durationMs": 123
}
```

When deployed to Encore Cloud you can also inspect these metrics from the Monitoring tab in the dashboard.

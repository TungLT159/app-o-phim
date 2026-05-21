import {
  getInProgressMovies,
  getRecentInProgressMovies,
  shouldShowContinueWatching,
} from "./watchHistoryManager";

beforeEach(() => {
  localStorage.clear();
});

test("shows continue watching from the 1 percent threshold", () => {
  expect(shouldShowContinueWatching(12, 1200)).toBe(true);
  expect(shouldShowContinueWatching(11, 1200)).toBe(false);
});

test("in-progress movies include items from 1 percent through 95 percent", () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      { key: "below", percentage: 0.9 },
      { key: "one", percentage: 1 },
      { key: "ninety-five", percentage: 95 },
      { key: "above", percentage: 95.1 },
    ]),
  );

  expect(getInProgressMovies().map((item) => item.key)).toEqual([
    "one",
    "ninety-five",
  ]);
});

test("in-progress movies derive missing percentage from current time and duration", () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "derived-progress",
        movieId: "derived-progress",
        currentTime: 120,
        duration: 600,
        timestamp: "2026-01-01T00:00:00.000Z",
        movieInfo: { slug: "derived-progress" },
      },
    ]),
  );

  expect(getRecentInProgressMovies().map((item) => item.key)).toEqual([
    "derived-progress",
  ]);
});

test("recent in-progress movies filter range, sort newest first, and dedupe by movie", () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "below",
        movieId: "below-id",
        percentage: 0.9,
        timestamp: "2026-01-05T00:00:00.000Z",
        movieInfo: { slug: "below" },
      },
      {
        key: "movie-a-old",
        movieId: "movie-a-id",
        percentage: 20,
        timestamp: "2026-01-01T00:00:00.000Z",
        movieInfo: { slug: "movie-a" },
      },
      {
        key: "movie-b",
        movieId: "movie-b-id",
        percentage: 30,
        timestamp: "2026-01-03T00:00:00.000Z",
        movieInfo: { slug: "movie-b" },
      },
      {
        key: "movie-a-new",
        movieId: "movie-a-id",
        percentage: 40,
        timestamp: "2026-01-04T00:00:00.000Z",
        movieInfo: { slug: "movie-a" },
      },
      {
        key: "above",
        movieId: "above-id",
        percentage: 95.1,
        timestamp: "2026-01-06T00:00:00.000Z",
        movieInfo: { slug: "above" },
      },
      {
        key: "movie-c",
        movieId: "movie-c-id",
        percentage: 95,
        timestamp: "2026-01-02T00:00:00.000Z",
        movieInfo: { slug: "" },
      },
    ]),
  );

  expect(getRecentInProgressMovies().map((item) => item.key)).toEqual([
    "movie-a-new",
    "movie-b",
    "movie-c",
  ]);
});

test("recent in-progress movies default to 10 newest unique movies", () => {
  const history = Array.from({ length: 12 }, (_, index) => ({
    key: `movie-${index}`,
    movieId: `movie-${index}`,
    percentage: 50,
    timestamp: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    movieInfo: { slug: `movie-${index}` },
  }));

  localStorage.setItem("ophim_watch_history:v1", JSON.stringify(history));

  expect(getRecentInProgressMovies().map((item) => item.key)).toEqual([
    "movie-11",
    "movie-10",
    "movie-9",
    "movie-8",
    "movie-7",
    "movie-6",
    "movie-5",
    "movie-4",
    "movie-3",
    "movie-2",
  ]);
});

test("recent in-progress movies sort missing and invalid timestamps after valid timestamps", () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "invalid-timestamp",
        movieId: "invalid-timestamp",
        percentage: 50,
        timestamp: "not-a-date",
        movieInfo: { slug: "invalid-timestamp" },
      },
      {
        key: "missing-timestamp",
        movieId: "missing-timestamp",
        percentage: 50,
        movieInfo: { slug: "missing-timestamp" },
      },
      {
        key: "valid-newer",
        movieId: "valid-newer",
        percentage: 50,
        timestamp: "2026-01-02T00:00:00.000Z",
        movieInfo: { slug: "valid-newer" },
      },
      {
        key: "valid-older",
        movieId: "valid-older",
        percentage: 50,
        timestamp: "2026-01-01T00:00:00.000Z",
        movieInfo: { slug: "valid-older" },
      },
      {
        key: "valid-pre-1970",
        movieId: "valid-pre-1970",
        percentage: 50,
        timestamp: "1969-12-31T23:59:59.000Z",
        movieInfo: { slug: "valid-pre-1970" },
      },
    ]),
  );

  expect(getRecentInProgressMovies().map((item) => item.key)).toEqual([
    "valid-newer",
    "valid-older",
    "valid-pre-1970",
    "invalid-timestamp",
    "missing-timestamp",
  ]);
});

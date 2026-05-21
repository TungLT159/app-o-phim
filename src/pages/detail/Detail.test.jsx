import React from "react";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import Detail from "./Detail";
import tmdbApi from "../../api/tmdbApi";
import { clearAllEpisodeLinks } from "../../utils/episodeLinkManager";
import {
  flushWatchHistory,
  formatTime,
  getWatchProgress,
  saveWatchProgress,
  shouldShowContinueWatching,
} from "../../utils/watchHistoryManager";

jest.mock("hls.js", () => ({
  isSupported: () => false,
}));

jest.mock("../../api/tmdbApi", () => ({
  detail: jest.fn(),
  episode: jest.fn(() => Promise.resolve({ playlistUrl: null })),
}));

jest.mock("../../utils/tmdbImageFetcher", () => ({
  fetchTMDBImages: jest.fn(() =>
    Promise.resolve({ posterUrl: "/poster.jpg", backdropUrl: "/backdrop.jpg", overview: "" }),
  ),
}));

jest.mock("../../utils/watchHistoryManager", () => {
  const getHistory = () => {
    const history =
      global.localStorage.getItem("ophim_watch_history:v1") ||
      global.localStorage.getItem("ophim_watch_history");
    return history ? JSON.parse(history) : [];
  };

  return {
    getWatchProgress: jest.fn((movieId, episodeName) =>
      Promise.resolve(
        getHistory().find((item) => item.key === `${movieId}_${episodeName}`) || null,
      ),
    ),
    saveWatchProgress: jest.fn((movieId, episodeName, currentTime, duration, movieInfo = {}) => {
      const history = getHistory();
      const key = `${movieId}_${episodeName}`;
      const watchItem = {
        key,
        movieId,
        episodeName,
        currentTime,
        duration,
        percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
        timestamp: new Date().toISOString(),
        movieInfo,
      };
      const existingIndex = history.findIndex((item) => item.key === key);

      if (existingIndex === -1) {
        history.unshift(watchItem);
      } else {
        history[existingIndex] = watchItem;
      }

      global.localStorage.setItem("ophim_watch_history:v1", JSON.stringify(history));
      return Promise.resolve();
    }),
    flushWatchHistory: jest.fn(() => Promise.resolve()),
    formatTime: jest.fn((seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }),
    shouldShowContinueWatching: jest.fn((currentTime, duration) => {
      if (!currentTime || !duration) return false;
      const percentage = (currentTime / duration) * 100;
      return percentage >= 1 && percentage <= 95;
    }),
  };
});

jest.mock("../../components/similar-movies/SimilarMovies", () => () => (
  <div>Similar movies loaded</div>
));

jest.mock("../../components/video-player/CustomVideoPlayer", () => ({
  videoRef,
}) => <video ref={videoRef} data-testid="video-player" />);

jest.mock("../../components/episode-scroll/EpisodeScroll", () => ({
  episodes,
  onSelectEpisode,
}) => (
  <button type="button" onClick={() => onSelectEpisode(episodes[1])}>
    Chọn tập 2
  </button>
));

jest.mock("react-helmet", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

const NavigateToEpisodeButton = () => {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate("?ep=0:tap-2")}>
      Đi tới tập 2
    </button>
  );
};

const NavigateToMovieButton = () => {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate("/movie/next-movie")}>
      Đi tới phim mới
    </button>
  );
};

const movieDetail = {
  title: "Test Movie",
  name: "Test Movie",
  content: "Test content",
  episode_current: "Tập 2",
  episodes: [
    {
      server_name: "Vietsub",
      server_data: [
        { name: "1", slug: "tap-1" },
        { name: "2", slug: "tap-2" },
      ],
    },
  ],
};

const renderDetail = (initialEntry = "/movie/test-movie") =>
  render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

const setMediaProperty = (element, property, value) => {
  Object.defineProperty(element, property, {
    configurable: true,
    writable: true,
    value,
  });
};

const getMockHistory = () => {
  const history =
    localStorage.getItem("ophim_watch_history:v1") ||
    localStorage.getItem("ophim_watch_history");
  return history ? JSON.parse(history) : [];
};

const mockSaveWatchProgress = (
  movieId,
  episodeName,
  currentTime,
  duration,
  movieInfo = {},
) => {
  const history = getMockHistory();
  const key = `${movieId}_${episodeName}`;
  const watchItem = {
    key,
    movieId,
    episodeName,
    currentTime,
    duration,
    percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
    timestamp: new Date().toISOString(),
    movieInfo,
  };
  const existingIndex = history.findIndex((item) => item.key === key);

  if (existingIndex === -1) {
    history.unshift(watchItem);
  } else {
    history[existingIndex] = watchItem;
  }

  localStorage.setItem("ophim_watch_history:v1", JSON.stringify(history));
  return Promise.resolve();
};

beforeEach(() => {
  clearAllEpisodeLinks();
  localStorage.clear();
  jest.clearAllMocks();
  getWatchProgress.mockImplementation((movieId, episodeName) =>
    Promise.resolve(
      getMockHistory().find((item) => item.key === `${movieId}_${episodeName}`) || null,
    ),
  );
  saveWatchProgress.mockImplementation(mockSaveWatchProgress);
  flushWatchHistory.mockResolvedValue(undefined);
  formatTime.mockImplementation((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  });
  shouldShowContinueWatching.mockImplementation((currentTime, duration) => {
    if (!currentTime || !duration) return false;
    const percentage = (currentTime / duration) * 100;
    return percentage >= 1 && percentage <= 95;
  });
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
  tmdbApi.detail.mockResolvedValue({ data: { item: movieDetail } });
  tmdbApi.episode.mockResolvedValue({ playlistUrl: "/video.m3u8" });
});

test("reserves the detail layout while movie data is loading", () => {
  tmdbApi.detail.mockImplementation(() => new Promise(() => {}));

  const { container } = render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByRole("status", { name: "Đang tải phim" })).toBeInTheDocument();
  expect(container.querySelector(".banner")).toBeInTheDocument();
  expect(container.querySelector(".movie-content")).toBeInTheDocument();
  expect(container.querySelector(".video-wrapper")).toBeInTheDocument();
});

test("saved progress prefers group-aware episode keys over legacy episode names", async () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "test-movie_0:tap-1",
        movieId: "test-movie",
        episodeName: "0:tap-1",
        currentTime: 240,
        duration: 1200,
        percentage: 20,
      },
      {
        key: "test-movie_1",
        movieId: "test-movie",
        episodeName: "1",
        currentTime: 120,
        duration: 1200,
        percentage: 10,
      },
    ]),
  );

  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie?ep=0:tap-1"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Tiếp tục xem từ/)).toHaveTextContent(
    "Tiếp tục xem từ 04:00?",
  );
});

test("shows saved progress notice for progress at the 1 percent threshold", async () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "test-movie_0:tap-1",
        movieId: "test-movie",
        episodeName: "0:tap-1",
        currentTime: 12,
        duration: 1200,
        percentage: 1,
      },
    ]),
  );

  renderDetail("/movie/test-movie?ep=0:tap-1");

  expect(await screen.findByText(/Tiếp tục xem từ/)).toHaveTextContent(
    "Tiếp tục xem từ 00:12?",
  );
});

test("selecting an episode updates the URL without refetching movie detail", async () => {
  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByText("Chọn tập 2");
  expect(tmdbApi.detail).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByText("Chọn tập 2"));

  await waitFor(() => expect(tmdbApi.detail).toHaveBeenCalledTimes(1));
});

test("defers similar movies until after the critical video area renders", async () => {
  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByTestId("video-player");

  expect(screen.queryByText("Similar movies loaded")).not.toBeInTheDocument();
});

test("URL episode changes load saved progress for the new episode", async () => {
  localStorage.setItem(
    "ophim_watch_history:v1",
    JSON.stringify([
      {
        key: "test-movie_2",
        movieId: "test-movie",
        episodeName: "2",
        currentTime: 120,
        duration: 1200,
        percentage: 10,
      },
    ]),
  );

  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/:category/:id"
          element={
            <>
              <NavigateToEpisodeButton />
              <Detail />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByText("Đi tới tập 2");
  expect(screen.queryByText(/Tiếp tục xem từ/)).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Đi tới tập 2"));

  expect(await screen.findByText(/Tiếp tục xem từ/)).toHaveTextContent(
    "Tiếp tục xem từ 02:00?",
  );
});

test("ignores stale async saved progress when the URL episode changes before load resolves", async () => {
  let resolveFirstProgress;
  getWatchProgress
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstProgress = resolve;
        }),
    )
    .mockImplementation((movieId, episodeName) =>
      Promise.resolve(
        episodeName === "0:tap-2"
          ? {
              key: `${movieId}_${episodeName}`,
              movieId,
              episodeName,
              currentTime: 120,
              duration: 1200,
              percentage: 10,
            }
          : null,
      ),
    );

  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/:category/:id"
          element={
            <>
              <NavigateToEpisodeButton />
              <Detail />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByText("Đi tới tập 2");

  fireEvent.click(screen.getByText("Đi tới tập 2"));

  expect(await screen.findByText(/Tiếp tục xem từ/)).toHaveTextContent(
    "Tiếp tục xem từ 02:00?",
  );

  await act(async () => {
    resolveFirstProgress({
      key: "test-movie_0:tap-1",
      movieId: "test-movie",
      episodeName: "0:tap-1",
      currentTime: 240,
      duration: 1200,
      percentage: 20,
    });
  });

  expect(screen.getByText(/Tiếp tục xem từ/)).toHaveTextContent(
    "Tiếp tục xem từ 02:00?",
  );
});

test("saves final watch progress on unmount before the 5-second interval", async () => {
  const { unmount } = renderDetail();

  const video = await screen.findByTestId("video-player");
  setMediaProperty(video, "currentTime", 123);
  setMediaProperty(video, "duration", 1200);

  fireEvent(video, new Event("timeupdate"));
  unmount();

  const history = JSON.parse(localStorage.getItem("ophim_watch_history:v1"));
  expect(history[0]).toMatchObject({
    key: "test-movie_0:tap-1",
    movieId: "test-movie",
    episodeName: "0:tap-1",
    currentTime: 123,
    duration: 1200,
  });
  expect(saveWatchProgress).toHaveBeenCalled();
  await waitFor(() => expect(flushWatchHistory).toHaveBeenCalled());
});

test("saves final watch progress on pagehide before the 5-second interval", async () => {
  renderDetail();

  const video = await screen.findByTestId("video-player");
  setMediaProperty(video, "currentTime", 234);
  setMediaProperty(video, "duration", 1200);

  fireEvent(video, new Event("timeupdate"));

  act(() => {
    window.dispatchEvent(new Event("pagehide"));
  });

  const history = JSON.parse(localStorage.getItem("ophim_watch_history:v1"));
  expect(history[0]).toMatchObject({
    key: "test-movie_0:tap-1",
    currentTime: 234,
    duration: 1200,
  });
  expect(saveWatchProgress).toHaveBeenCalled();
  await waitFor(() => expect(flushWatchHistory).toHaveBeenCalled());
});

test("flushes final watch progress when the page becomes hidden", async () => {
  renderDetail();

  const video = await screen.findByTestId("video-player");
  setMediaProperty(video, "currentTime", 345);
  setMediaProperty(video, "duration", 1200);

  fireEvent(video, new Event("timeupdate"));

  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "hidden",
  });

  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });

  expect(saveWatchProgress).toHaveBeenCalled();
  await waitFor(() => expect(flushWatchHistory).toHaveBeenCalled());
});

test("shows a playback error when the current episode has no playable link", async () => {
  tmdbApi.episode.mockResolvedValue({ playlistUrl: null, link_embed: null });

  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/:category/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(
    await screen.findByText("Không tìm thấy link phát video."),
  ).toBeInTheDocument();
});

test("route id changes do not request old episode slug for the new movie while detail is pending", async () => {
  tmdbApi.detail
    .mockResolvedValueOnce({ data: { item: movieDetail } })
    .mockImplementationOnce(() => new Promise(() => {}));

  render(
    <MemoryRouter
      initialEntries={["/movie/test-movie"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/:category/:id"
          element={
            <>
              <NavigateToMovieButton />
              <Detail />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByTestId("video-player");

  fireEvent.click(screen.getByText("Đi tới phim mới"));

  await waitFor(() => expect(tmdbApi.detail).toHaveBeenCalledTimes(2));

  expect(tmdbApi.episode).not.toHaveBeenCalledWith("next-movie", "tap-1", 0);
});

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import EpisodeScroll from "./EpisodeScroll";

test("selects the clicked episode when grouped episodes share the same name", () => {
  const seasonOneEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "phan-1-tap-1",
    episodeGroupTitle: "Phần 1",
  };
  const seasonTwoEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "phan-2-tap-1",
    episodeGroupTitle: "Phần 2",
  };
  const onSelectEpisode = jest.fn();

  render(
    <EpisodeScroll
      episodes={[seasonOneEpisode, seasonTwoEpisode]}
      episodeGroups={[
        { title: "Phần 1", episodes: [seasonOneEpisode] },
        { title: "Phần 2", episodes: [seasonTwoEpisode] },
      ]}
      currentEpisode={seasonOneEpisode}
      onSelectEpisode={onSelectEpisode}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: /Phần 2/ }));
  fireEvent.click(screen.getByLabelText("Phần 2 Tập 1"));

  expect(onSelectEpisode).toHaveBeenCalledWith(seasonTwoEpisode);
  expect(screen.queryByLabelText("Phần 1 Tập 1")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Phần 2 Tập 1")).toHaveAttribute(
    "aria-current",
    "false",
  );
});

test("renders only the active episode group in tab mode", () => {
  const seasonOneEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "0:tap-1",
    episodeGroupIndex: 0,
    episodeGroupTitle: "Phần 1",
  };
  const seasonTwoEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "1:tap-1",
    episodeGroupIndex: 1,
    episodeGroupTitle: "Phần 2",
  };

  render(
    <EpisodeScroll
      episodes={[seasonOneEpisode, seasonTwoEpisode]}
      episodeGroups={[
        { title: "Phần 1", episodes: [seasonOneEpisode] },
        { title: "Phần 2", episodes: [seasonTwoEpisode] },
      ]}
      currentEpisode={seasonTwoEpisode}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getByRole("tab", { name: /Phần 2/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByLabelText("Phần 2 Tập 1")).toBeInTheDocument();
  expect(screen.queryByLabelText("Phần 1 Tập 1")).not.toBeInTheDocument();
});

test("selects the compacted tab that contains the current episode", () => {
  const secondServerEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "1:tap-1",
    episodeGroupIndex: 1,
    episodeGroupTitle: "Thuyết minh",
  };
  const thirdServerEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "2:tap-1",
    episodeGroupIndex: 2,
    episodeGroupTitle: "Lồng tiếng",
  };

  render(
    <EpisodeScroll
      episodes={[secondServerEpisode, thirdServerEpisode]}
      episodeGroups={[
        { title: "Thuyết minh", episodes: [secondServerEpisode] },
        { title: "Lồng tiếng", episodes: [thirdServerEpisode] },
      ]}
      currentEpisode={secondServerEpisode}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getByRole("tab", { name: /Thuyết minh/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByLabelText("Thuyết minh Tập 1")).toHaveAttribute(
    "aria-current",
    "true",
  );
  expect(screen.queryByLabelText("Lồng tiếng Tập 1")).not.toBeInTheDocument();
});

test("switching tabs does not select an episode", () => {
  const seasonOneEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "0:tap-1",
    episodeGroupIndex: 0,
    episodeGroupTitle: "Phần 1",
  };
  const seasonTwoEpisode = {
    name: "1",
    slug: "tap-1",
    episodeKey: "1:tap-1",
    episodeGroupIndex: 1,
    episodeGroupTitle: "Phần 2",
  };
  const onSelectEpisode = jest.fn();

  render(
    <EpisodeScroll
      episodes={[seasonOneEpisode, seasonTwoEpisode]}
      episodeGroups={[
        { title: "Phần 1", episodes: [seasonOneEpisode] },
        { title: "Phần 2", episodes: [seasonTwoEpisode] },
      ]}
      currentEpisode={seasonOneEpisode}
      onSelectEpisode={onSelectEpisode}
    />,
  );

  fireEvent.click(screen.getByRole("tab", { name: /Phần 2/ }));

  expect(onSelectEpisode).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Phần 2 Tập 1")).toBeInTheDocument();
});

test("does not mount every episode button for a large active group", () => {
  const episodes = Array.from({ length: 1000 }, (_, index) => ({
    name: `${index + 1}`,
    slug: `tap-${index + 1}`,
    episodeKey: `0:tap-${index + 1}`,
    episodeGroupIndex: 0,
    episodeGroupTitle: "Vietsub",
  }));

  render(
    <EpisodeScroll
      episodes={episodes}
      episodeGroups={[{ title: "Vietsub", episodes }]}
      currentEpisode={episodes[0]}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getAllByRole("button", { name: /Vietsub Tập/ }).length).toBeLessThanOrEqual(150);
  expect(screen.queryByLabelText("Vietsub Tập 1000")).not.toBeInTheDocument();
});

test("windows medium episode lists before they become expensive to scroll", () => {
  const episodes = Array.from({ length: 100 }, (_, index) => ({
    name: `${index + 1}`,
    slug: `tap-${index + 1}`,
    episodeKey: `0:tap-${index + 1}`,
    episodeGroupIndex: 0,
    episodeGroupTitle: "Vietsub",
  }));

  render(
    <EpisodeScroll
      episodes={episodes}
      episodeGroups={[{ title: "Vietsub", episodes }]}
      currentEpisode={episodes[0]}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getAllByRole("button", { name: /Vietsub Tập/ }).length).toBeLessThan(100);
});

test("mounts the current episode when it is deep in a large active group", () => {
  const episodes = Array.from({ length: 1000 }, (_, index) => ({
    name: `${index + 1}`,
    slug: `tap-${index + 1}`,
    episodeKey: `0:tap-${index + 1}`,
    episodeGroupIndex: 0,
    episodeGroupTitle: "Vietsub",
  }));

  render(
    <EpisodeScroll
      episodes={episodes}
      episodeGroups={[{ title: "Vietsub", episodes }]}
      currentEpisode={episodes[499]}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getByLabelText("Vietsub Tập 500")).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test("uses the active tab index when mounting a deep current episode", () => {
  const seasonOneEpisodes = Array.from({ length: 1000 }, (_, index) => ({
    name: `${index + 1}`,
    slug: `s1-tap-${index + 1}`,
    episodeKey: `0:tap-${index + 1}`,
    episodeGroupIndex: 0,
    episodeGroupTitle: "Phần 1",
  }));
  const seasonTwoEpisodes = Array.from({ length: 1000 }, (_, index) => ({
    name: `${index + 1}`,
    slug: `s2-tap-${index + 1}`,
    episodeKey: `1:tap-${index + 1}`,
    episodeGroupIndex: 1,
    episodeGroupTitle: "Phần 2",
  }));

  render(
    <EpisodeScroll
      episodes={[...seasonOneEpisodes, ...seasonTwoEpisodes]}
      episodeGroups={[
        { title: "Phần 1", episodes: seasonOneEpisodes },
        { title: "Phần 2", episodes: seasonTwoEpisodes },
      ]}
      currentEpisode={seasonTwoEpisodes[499]}
      onSelectEpisode={jest.fn()}
    />,
  );

  expect(screen.getByLabelText("Phần 2 Tập 500")).toHaveAttribute(
    "aria-current",
    "true",
  );
});

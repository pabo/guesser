import { getCurrentDateString } from "./utils";

export enum StorageKeys {
  FoundWordsAllLengths = "foundWordsAllLengths",
  IsGivenUp = "isGivenUp",
  DailySeed = "dailySeed",
  Version = "version",
}

export const localStorageInit = () => {
  // bump this version to force a localStorage wipe on next client page load
  const CURRENT_VERSION = "2";

  const version = localStorage.getItem(StorageKeys.Version);
  if (!version || version !== CURRENT_VERSION) {
    localStorage.clear();
  }

  localStorage.setItem(StorageKeys.Version, CURRENT_VERSION);

  // Reset these keys if the dailySeed in localStorage is not the same as today's
  // https://github.com/pmndrs/jotai/discussions/2121
  const dailyGameStateKeys = [
    StorageKeys.FoundWordsAllLengths,
    StorageKeys.IsGivenUp,
  ];

  const dailySeedFromStorage = localStorage.getItem(StorageKeys.DailySeed);

  if (dailySeedFromStorage !== getCurrentDateString()) {
    dailyGameStateKeys.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(StorageKeys.DailySeed, getCurrentDateString());
  }
};

import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  choosePattern,
  combineArrays,
  getCurrentDateString,
  getIndexOfFirstUndefined,
  objectOfArraysCopy,
} from "../utils/utils";
import { getDataMuseWords } from "../api";
import { localStorageInit } from "../utils/localStorage";
import { StorageKeys } from "../utils/localStorage";

// We pick one target word at random, then create a pattern that matches the target word
// and several others. We give the player the pattern so that they can guess all the matching words

export const MAX_NUMBER_OF_VALID_WORDS = 45;
export const MINIMUM_NGRAM_SCORE = 0.01; // .01 occurrences per million words (google ngram)
const CHECK_FOR_NEW_DAY_INTERVAL = 60000; // 1 minute

export const store = getDefaultStore();

const init = () => {
  localStorageInit();
  populateWordList();
};

export enum WordLength {
  Five = 5,
  Seven = 7,
}

export type WordLengthToFoundWordsMap = {
  [key in WordLength]: string[];
};

// functions
export const populateWordList = () => {
  const length = store.get(wordLengthAtom);

  if (length === WordLength.Five) {
    import("../../wordlists/wordle").then(({ words5 }) => {
      store.set(wordsAtom, words5);
    });
  } else {
    import("../../wordlists/enable7").then(({ words7 }) => {
      store.set(wordsAtom, words7);
    });
  }
};

export const changeWordLength = (length: WordLength) => {
  store.set(wordLengthAtom, length);

  populateWordList();

  // TODO: is there a way where I dont have to manually call this
  store.set(guessArrayAtom, new Array(length).fill(undefined));
};

// we want to add the letter to the guess aray in slot that corresponds to the first
// undefined slot in the combined array
export const addLetterToGuess = (letter: string) => {
  const index = store.get(firstUndefinedIndexInCombinedAtom);
  const array = store.get(guessArrayAtom);

  store.set(
    guessArrayAtom,
    array.length === 0 ? [letter] : array.with(index, letter)
  );
};

// atoms
export const wordsAtom = atom<string[]>([]);
export const wordLengthAtom = atom(WordLength.Five);
export const placeholderWordAtom = atom((get) =>
  new Array(get(wordLengthAtom)).fill("x").join("")
);
export const isDailyModeAtom = atom(true);
export const isGivenUpAtom = atomWithStorage(StorageKeys.IsGivenUp, false);
export const dailySeedAtom = atomWithStorage(
  StorageKeys.DailySeed,
  getCurrentDateString()
);

// TODO: this is probably just for testing. Not sure if we want to blow away someone's daily puzzle at midnight, without a refresh?
// check for date change
setInterval(() => {
  if (store.get(dailySeedAtom) !== getCurrentDateString()) {
    store.set(dailySeedAtom, getCurrentDateString());
  }
}, CHECK_FOR_NEW_DAY_INTERVAL);

// whenever the day changes, we need to reset the word and guess and game state
store.sub(dailySeedAtom, () => {
  console.log("seed value is changed to", store.get(dailySeedAtom));

  store.set(foundWordsAllLengthsAtom, {} as WordLengthToFoundWordsMap);
  store.set(isGivenUpAtom, false);
});

export const patternRegexAtom = atom((get) => {
  return choosePattern(
    get(wordsAtom),
    get(dailySeedAtom),
    MAX_NUMBER_OF_VALID_WORDS
  );
});

export const patternArrayAtom = atom((get) => {
  return get(patternRegexAtom)
    .source.split("")
    .map((x) => (x === "." ? undefined : x));
});

export const unparedValidWordsAtom = atom((get) => {
  const words = get(wordsAtom);
  const pattern = get(patternRegexAtom);

  return words.filter((word) => pattern.exec(word));
});

// TODO: BUG can I initialize this with leading nulls if they should be there
export const guessArrayAtom = atom(
  new Array(store.get(wordLengthAtom)).fill(undefined)
);

// we maintain two separate sparse arrays for the pattern and the guess, above.
// this is the combined array
export const combinedGuessAndPatternArrayAtom = atom((get) => {
  const patternArray = get(patternArrayAtom);
  const guessArray = get(guessArrayAtom);

  return combineArrays(patternArray, guessArray) || [];
});

export const firstUndefinedIndexInCombinedAtom = atom((get) =>
  getIndexOfFirstUndefined(get(combinedGuessAndPatternArrayAtom))
);

export const wordsMetadataAtom = atom(async (get) => {
  const pattern = get(patternArrayAtom);
  return await getDataMuseWords(pattern);
});

// The list of words that fit the given pattern
export const validWordsAtom = atom(async (get) => {
  const words = get(unparedValidWordsAtom);
  const wordsInfo = await get(wordsMetadataAtom);

  const newWords = words.filter((word) => {
    const wordInfo = wordsInfo?.get(word);
    return (
      wordInfo &&
      wordInfo?.definitions?.length >= 1 &&
      wordInfo.frequency > MINIMUM_NGRAM_SCORE
    );
  });

  return newWords;
});

export const foundWordsAllLengthsAtom = atomWithStorage(
  StorageKeys.FoundWordsAllLengths,
  {} as WordLengthToFoundWordsMap
);

// found words is derived based on wordLength
export const foundWordsAtom = atom(
  (get) => {
    const foundWordsAllLengths = get(foundWordsAllLengthsAtom);
    const wordLength = get(wordLengthAtom);

    return foundWordsAllLengths[wordLength] || [];
  },
  (get, set, newFoundWord: string) => {
    // This "setter" isnt actually setting the value here. It's more of a
    //  `addWordToFoundWords` than a `setFoundWords`. Is this ok?
    const foundWordsAllLengths = get(foundWordsAllLengthsAtom);
    const wordLength = get(wordLengthAtom);

    const newFoundWordsAllLengths = objectOfArraysCopy(foundWordsAllLengths);

    if (newFoundWordsAllLengths[wordLength]) {
      newFoundWordsAllLengths[wordLength].push(newFoundWord);
    } else {
      newFoundWordsAllLengths[wordLength] = [newFoundWord];
    }
    set(foundWordsAllLengthsAtom, newFoundWordsAllLengths);
  }
);

export const unfoundWordsAtom = atom(async (get) => {
  const foundWords = get(foundWordsAtom);
  const validWords = await get(validWordsAtom);

  return validWords.filter((word) => !foundWords.includes(word));
});

export const gameOverAtom = atom(async (get) => {
  const isGivenUp = get(isGivenUpAtom);
  const foundWords = get(foundWordsAtom);
  const validWords = await get(validWordsAtom);

  return isGivenUp || foundWords.length === validWords.length;
});

export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);
export const guessIsRepeatAtom = atom(false);

// TODO: this could have been a state honestly. with component composition?
export const selectedKeyAtom = atom<string | null>(null);

// This allows us to temporarily disable keyboard input, for deduping click and move
export const acceptingInputAtom = atom(true);

init();

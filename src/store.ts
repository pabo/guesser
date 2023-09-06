import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  choosePattern,
  combineArrays,
  getIndexOfFirstUndefined,
  objectOfArraysCopy,
} from "./utils";
import { getDataMuseWords } from "./api";

// We pick one target word at random, then create a pattern that matches the target word
// and several others. We give the player the pattern so that they can guess all the matching words

export const MAX_NUMBER_OF_VALID_WORDS = 45;
export const MINIMUM_NGRAM_SCORE = .01; // .01 occurrences per million words (google ngram)
const CHECK_FOR_NEW_DAY_INTERVAL = 60000; // 1 minute

const store = getDefaultStore();

// bump this version to force a localStorage wipe on next client page load
const CURRENT_VERSION = "1";

const versionKey = "version";
const version = localStorage.getItem(versionKey);
if (!version || version !== CURRENT_VERSION) {
  localStorage.clear();
}
localStorage.setItem(versionKey, CURRENT_VERSION);

export enum WordLength {
  Five = 5,
  Seven = 7,
}

export type WordLengthToFoundWordsMap = {
  [key in WordLength]: string[];
};

// default 5 letter length
export const wordLengthAtom = atom(WordLength.Five);
// export const wordLengthAtom = atomWithStorage("wordLength", WordLength.Five);
// TODO: jotai bug? immediately, this is the default value, instead of the stored value

export const populateWordList = () => {
  const length = store.get(wordLengthAtom);

  if (length === WordLength.Five) {
    import("../wordlists/wordle").then(({ words5 }) => {
      store.set(wordsAtom, words5);
    });
  } else {
    import("../wordlists/enable7").then(({ words7 }) => {
      store.set(wordsAtom, words7);
    });
  }
};

export const placeholderWordAtom = atom(get => new Array(get(wordLengthAtom)).fill("x").join(""))

export const changeWordLength = (length: WordLength) => {
  store.set(wordLengthAtom, length);

  populateWordList();

  // TODO: is there a way where I dont have to manually call this
  store.set(guessArrayAtom, new Array(length).fill(undefined));
};

export const getCurrentDateString = () => new Date().toDateString();
export const isDailyModeAtom = atom(true);
export const isGivenUpAtom = atomWithStorage("isGivenUp", false);


export const dailySeedAtom = atomWithStorage("dailySeed", getCurrentDateString())

// whenever the day changes, we need to reset the word and guess and game state
store.sub(dailySeedAtom, () => {
    console.log('seed value is changed to', store.get(dailySeedAtom))

    store.set(foundWordsAllLengthsAtom, {} as WordLengthToFoundWordsMap);
    store.set(isGivenUpAtom, false);
});

// TODO: this is probably just for testing. Not sure if we want to blow away someone's daily puzzle at midnight, without a refresh?
// check for date change
setInterval(() => {
  if (store.get(dailySeedAtom) !== getCurrentDateString()) {
    store.set(dailySeedAtom, getCurrentDateString());
  }
}, CHECK_FOR_NEW_DAY_INTERVAL);

export const wordsAtom = atom<string[]>([]);

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

export const wordsMetadataAtom = atom(async (get) => {
  const pattern = get(patternArrayAtom);
  return await getDataMuseWords(pattern);
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

// we want to add the letter to the guess aray in slot that corresponds to the first
// undefined slot in the combined array
const addLetterToGuess = (letter: string) => {
  const index = store.get(firstUndefinedIndexInCombinedAtom);
  const array = store.get(guessArrayAtom);

  store.set(
    guessArrayAtom,
    // @ts-ignore-next-line array.with is fine!
    array.length === 0 ? [letter] : array.with(index, letter)
  );
};

export const firstUndefinedIndexInCombinedAtom = atom((get) =>
  getIndexOfFirstUndefined(get(combinedGuessAndPatternArrayAtom))
);

// The list of words that fit the given pattern
export const validWordsAtom = atom(async (get) => {
  const words = get(unparedValidWordsAtom);
  const wordsInfo = await get(wordsMetadataAtom);

  const newWords =  words.filter((word) => {
    const wordInfo = wordsInfo?.get(word);
    return wordInfo && wordInfo?.definitions?.length >= 1 && wordInfo.frequency > MINIMUM_NGRAM_SCORE;
  });

  return newWords;
});

export const unparedValidWordsAtom = atom((get) => {
  const words = get(wordsAtom);
  const pattern = get(patternRegexAtom);

  return words.filter((word) => pattern.exec(word));
});

export const foundWordsAllLengthsAtom = atomWithStorage(
  "foundWordsAllLengths",
  {} as WordLengthToFoundWordsMap
);

// found words is derived based on wordLength
// TODO: the "setter" isnt actually setting the value here. It's more of a
//  `addWordToFoundWords` than a `setFoundWords`. Is this ok?
export const foundWordsAtom = atom(
  (get) => {
    const foundWordsAllLengths = get(foundWordsAllLengthsAtom);
    const wordLength = get(wordLengthAtom);

    return foundWordsAllLengths[wordLength] || [];
  },
  (get, set, newFoundWord: string) => {
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

const allowedKeys = [
  "backspace",
  "del",
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
];

// accepts single letter keys, 'Backspace', 'Del, and 'Enter'
export const acceptLetterInput = async (keyPossiblyUpperCased: string) => {
  const key = keyPossiblyUpperCased.toLowerCase();

  // TODO: the whole animation thing is janky. timings are coupled, states are messy
  // no typing while animation is happening, while we are deduping for input, and
  // ignore allowed keys
  if (
    store.get(guessIsBadAtom) ||
    store.get(guessIsGoodAtom) ||
    !store.get(acceptingInputAtom) ||
    !allowedKeys.includes(key)
  ) {
    return;
  }

  // handle backspace/del
  if (key === "backspace" || key === "del") {
    const lastGuessIndex = store
      .get(guessArrayAtom)
      .findLastIndex((x) => x !== undefined);

    // @ts-ignore-next-line
    store.set(guessArrayAtom, (guess) => guess.with(lastGuessIndex, undefined));
    return;
  }

  // handle letters
  addLetterToGuess(key);

  // TODO: semi hacky way to dedupe click/move touch events
  store.set(acceptingInputAtom, false);
  setTimeout(() => {
    store.set(acceptingInputAtom, true);
  }, 50);

  // does this guess finish a word?
  const index = store.get(firstUndefinedIndexInCombinedAtom);

  if (index === -1 || index >= store.get(wordLengthAtom)) {
    // give time for animation to complete, and then reset the guess input
    // TODO: should this hook into onanimationend instead?
    setTimeout(
      () =>
        store.set(
          guessArrayAtom,
          new Array(store.get(wordLengthAtom)).fill(undefined)
        ),
      300
    );

    const potentialWord = store.get(combinedGuessAndPatternArrayAtom).join("");

    // is it repeat?
    if (store.get(foundWordsAtom)?.includes(potentialWord)) {
      store.set(guessIsRepeatAtom, true);
      return;
    }

    // is it valid?
    const validWords =await store.get(validWordsAtom);

    if (validWords.includes(potentialWord)) {
      store.set(guessIsGoodAtom, true);

      // remember, this is not a true 'set'. It adds to the foundWords array.
      store.set(foundWordsAtom, potentialWord);

      return;
    }

    //or invalid?
    store.set(guessIsBadAtom, true);
  }
};

export const init = () => {
  populateWordList();
};

init();

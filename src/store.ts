import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { words as words5 } from "../wordlists/wordle";
import { words as words7 } from "../wordlists/enable7";
import {
  choosePattern,
  combineArrays,
  getIndexOfFirstUndefined,
  objectOfArraysCopy,
} from "./utils";

// We pick one target word at random, then create a pattern that matches the target word
// and several others. We give the player the pattern so that they can guess all the matching words

export const MAX_NUMBER_OF_VALID_WORDS = 45;

// TODO: How do atoms know to connect to the default store? If I don't use the default store, do I have to manually attach all atoms to it?
const store = getDefaultStore();

export enum WordLength {
  Five = 5,
  Seven = 7,
}

export type WordLengthToFoundWordsMap = {
  [key in WordLength]: string[];
};

const wordlistMapping: { [key in WordLength]: string[] } = {
  [WordLength.Five]: words5,
  [WordLength.Seven]: words7,
};

// default 5 letter length
export const wordLengthAtom = atomWithStorage("wordLength", WordLength.Five);
export const wordlistUrlAtom = atom(
  (get) => wordlistMapping[get(wordLengthAtom)]
);

export const getCurrentDateString = () => new Date().toDateString();
// atoms
export const isDailyModeAtom = atom(true);

export const dailySeedAtom = atom(
  getCurrentDateString(),
  (_get, set, newValue) => {
    console.log("getting dailySeedAtom");
    // whenever we set this, we want to do a bunch of shit
    set(dailySeedAtom, newValue);
    set(foundWordsAllLengthsAtom, {} as WordLengthToFoundWordsMap);
  }
);

// TODO: this is probably just for testing. Not sure if we want to blow away someone's daily puzzle at midnight?
// check for date change
setInterval(() => {
  if (store.get(dailySeedAtom) !== getCurrentDateString()) {
    store.set(dailySeedAtom, getCurrentDateString());
  }
}, 60000);

export const wordsAtom = atom((get) => {
  const wordLength = get(wordLengthAtom);
  return wordlistMapping[wordLength];
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

// TODO: BUG can I initialize this with leading nulls if they should be there
export const guessArrayAtom = atom(
  new Array(store.get(wordLengthAtom)).fill(undefined)
);

// we want to add the letter to the guess aray in slot that corresponds to the first
// undefined slot in the combined array
const addLetterToGuess = (letter: string) => {
  const index = store.get(fistUndefinedIndexInCombinedAtom);
  const array = store.get(guessArrayAtom);

  store.set(
    guessArrayAtom,
    // @ts-ignore-next-line array.with is fine!
    array.length === 0 ? [letter] : array.with(index, letter)
  );
};

// we maintain two separate sparse arrays for the pattern and the guess, above.
// this is the combined array
export const combinedGuessAndPatternArrayAtom = atom((get) => {
  const patternArray = get(patternArrayAtom);
  const guessArray = get(guessArrayAtom);

  return combineArrays(patternArray, guessArray) || [];
});

export const fistUndefinedIndexInCombinedAtom = atom((get) =>
  getIndexOfFirstUndefined(get(combinedGuessAndPatternArrayAtom))
);

// The list of words that fit the given pattern,
// all of which the user is ultimately trying to guess
export const validWordsAtom = atom((get) => {
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

export const gameOverAtom = atom((get) => {
  const foundWords = get(foundWordsAtom);
  const validWords = get(validWordsAtom);

  return foundWords.length === validWords.length;
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
export const acceptLetterInput = (keyPossiblyUpperCased: string) => {
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

    store.set(guessArrayAtom, (guess) => guess.slice(0, lastGuessIndex));
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
  const index = store.get(fistUndefinedIndexInCombinedAtom);

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
    if (store.get(validWordsAtom).includes(potentialWord)) {
      store.set(guessIsGoodAtom, true);

      // remember, this is not a true 'set'. It adds to the foundWords array.
      store.set(foundWordsAtom, potentialWord);

      return;
    }

    //or invalid?
    store.set(guessIsBadAtom, true);
  }
};

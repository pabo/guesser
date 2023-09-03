import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { words as words5 } from "../wordlists/wordle";
import { words as words7 } from "../wordlists/enable7";
import seedrandom from "seedrandom";

// We pick one target word at random, then create a pattern that matches the target word
// and several others. We give the player the pattern so that they can guess all the matching words

export const LETTERS_TO_REVEAL = 2;
export const MAX_NUMBER_OF_VALID_WORDS = 45;

export enum WordLength {
  Five = 5,
  Seven = 7,
}

const wordlistMapping: { [key in WordLength]: string[] } = {
  [WordLength.Five]: words5,
  [WordLength.Seven]: words7,
};

// default 5 letter length
export const wordLengthAtom = atomWithStorage("wordLength", WordLength.Five);
export const wordlistUrlAtom = atom(
  (get) => wordlistMapping[get(wordLengthAtom)],
);

const createRegex = (word: string, indexesToReveal: number[]) => {
  const letters = word.split("");
  const patternLetters = new Array(letters.length).fill(".");

  for (const index of indexesToReveal) {
    patternLetters[index] = letters[index];
  }

  const regex = new RegExp(patternLetters.join(""));

  return regex;
};

// choose a word from a seed, or the daily word
export const choosePattern = (words: string[], seed?: string) => {
  const date = new Date();

  const rng = seedrandom(
    seed ? seed : `${date.getFullYear()}${date.getMonth()}${date.getDate()}`,
  );

  const word = words[Math.floor(rng() * words.length) + 1];

  const indexesToReveal: number[] = [];
  let regex: RegExp;

  do {
    let candidate;

    do {
      // -1/+1 doesnt allow the first letter to be fixed which is a workaround for the bug
      candidate = Math.floor(rng() * (word.length - 1)) + 1;
    } while (candidate === undefined || indexesToReveal.includes(candidate));

    indexesToReveal.push(candidate);

    regex = createRegex(word, indexesToReveal);
  } while (
    words.filter((word) => regex.exec(word)).length > MAX_NUMBER_OF_VALID_WORDS
  );

  return createRegex(word, indexesToReveal);
};

export const getCurrentDateString = () => new Date().toDateString();
// atoms
export const isDailyModeAtom = atom(true);

export const dailySeedAtom = atom(
  getCurrentDateString(),
  (get, set, newValue) => {
    console.log("getting dailySeedAtom");
    // whenever we set this, we want to do a bunch of shit
    set(dailySeedAtom, newValue);
    set(foundWordsAllLengthsAtom, {} as WordLengthToFoundWordsMap);
  },
);

export const wordsAtom = atom((get) => {
  const wordLength = get(wordLengthAtom);
  return wordlistMapping[wordLength];
});

export const patternAtom = atom((get) => {
  console.log("patternAtom");
  return choosePattern(get(wordsAtom), get(dailySeedAtom));
});

export const patternArrayAtom = atom((get) => {
  return get(patternAtom)
    .source.split("")
    .map((x) => (x === "." ? undefined : x));
});

export const validWordsAtom = atom((get) => {
  const words = get(wordsAtom);
  const pattern = get(patternAtom);

  return words.filter((word) => pattern.exec(word));
});

// game progress

// TODO: BUG can I initialize this with leading nulls if they should be there
export const guessArrayAtom = atom<(string | undefined)[]>([]);

type WordLengthToFoundWordsMap = {
  [key in WordLength]: string[];
};

export const foundWordsAllLengthsAtom = atomWithStorage(
  "foundWordsAllLengths",
  {} as WordLengthToFoundWordsMap,
);

const objectOfArraysCopy = (oaa: WordLengthToFoundWordsMap) => {
  let newOaa = {} as WordLengthToFoundWordsMap;

  for (const [key, array] of Object.entries(oaa)) {
    // OK this is some TS grossness, but it works
    // eslint-disable-next-line
    // @ts-ignore-next-line
    const temp = { [WordLength[WordLength[parseInt(key, 10)]]]: [...array] };
    newOaa = { ...newOaa, ...temp };
  }

  return newOaa;
};

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
  },
);

export const gameOverAtom = atom((get) => {
  const foundWords = get(foundWordsAtom);
  const validWords = get(validWordsAtom);

  return foundWords.length === validWords.length;
});

export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);
export const guessIsRepeatAtom = atom(false);

// combines arrays by masking the second onto the first. nullish values in earlier arrays are filled with the values
// from later arrays
//
// result array will have same length as first array.
export const meldArrays: <T, U>(array1: T[], array2: U[]) => (T | U)[] = (
  array1,
  array2,
) => {
  return array1.map((value1, index) => {
    const value2 = array2[index];

    return value1 ?? value2;
  });
};

export const combinedGuessAndPatternAtom = atom((get) => {
  const patternArray = get(patternArrayAtom);
  const guessArray = get(guessArrayAtom);

  return meldArrays(patternArray, guessArray);
});

// const date = new Date();
// export const seedAtom = atomWithStorage("seed", `${date.getFullYear()}${date.getMonth()}${date.getDate()}`)

// Keyboard
// TODO: this could have been a state honestly. with component composition?
export const selectedKeyAtom = atom<string | null>(null);

// This allows us to temporarily disable keyboard input, for deduping click and move
export const acceptingInputAtom = atom(true);

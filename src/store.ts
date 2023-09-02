import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
// import wordsUrl from "../wordlists/enable7.txt";
import wordsUrl from "../wordlists/wordle.txt";
import seedrandom from "seedrandom";

export const LETTERS_TO_REVEAL = 2;
export const WORD_LENGTH = 5;
export const MAX_NUMBER_OF_VALID_WORDS = 45;

// We pick one target word at random, then create a pattern that matches the target word
// and several others. We give the player the pattern so that they can guess all the matching words

// const TESTING_SEED = "asaaaaaaaaadfsadfasdf";
const TESTING_SEED = undefined;

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
    seed ? seed : `${date.getFullYear()}${date.getMonth()}${date.getDate()}`
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

// atoms

// main fetch, which is async. It is this async-ness that trickles down
// into all the derived atoms. If we made this a bundled import instead, there
// would be no async. I'm leaving it async for now to get more familiar with async atoms
export const wordsAtom = atom(async () => {
  const response = await fetch(wordsUrl);
  return (await response.text()).split("\n");
});

export const patternAtom = atom(async (get) =>
  choosePattern(await get(wordsAtom), TESTING_SEED)
);
export const patternArrayAtom = atom(async (get) => {
  return (await get(patternAtom)).source
    .split("")
    .map((x) => (x === "." ? undefined : x));
});

export const validWordsAtom = atom(async (get) => {
  const words = await get(wordsAtom);
  const pattern = await get(patternAtom);

  return words.filter((word) => pattern.exec(word));
});

// game progress

// can I initialize this with leading nulls if they should be there
export const guessArrayAtom = atom<(string | undefined)[]>([]);

export const foundWordsAtom = atomWithStorage<string[]>("foundWords", []);
export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);
export const guessIsRepeatAtom = atom(false);

// combines arrays by masking the second onto the first. nullish values in earlier arrays are filled with the values
// from later arrays
//
// result array will have same length as first array.
export const meldArrays: <T, U>(array1: T[], array2: U[]) => (T | U)[] = (
  array1,
  array2
) => {
  return array1.map((value1, index) => {
    const value2 = array2[index];

    return value1 ?? value2;
  });
};

export const combinedGuessAndPatternAtom = atom(async (get) => {
  const patternArray = await get(patternArrayAtom);
  const guessArray = get(guessArrayAtom);

  return meldArrays(patternArray, guessArray);
});

// const date = new Date();
// export const seedAtom = atomWithStorage("seed", `${date.getFullYear()}${date.getMonth()}${date.getDate()}`)


// Keyboard
// TODO: this could have been a state honestly. with component composition?
export const selectedKeyAtom = atom<string|null>(null);

// This allows us to temporarily disable keyboard input, for deduping click and move
export const acceptingInputAtom = atom(true);
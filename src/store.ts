import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import wordsUrl from "../wordlists/enable7.txt";
import seedrandom from "seedrandom";

export const LETTERS_TO_REVEAL = 2;
export const WORD_LENGTH = 7;
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
      candidate = Math.floor(rng() * word.length - 1) + 1;
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

export const patternAtom = atom(async (get) => choosePattern(await get(wordsAtom), TESTING_SEED));
export const patternArrayAtom = atom(async (get) => {
  return (await get(patternAtom)).source.split("");
});

export const validWordsAtom = atom(async (get) => {
  const words = await get(wordsAtom);
  const pattern = await get(patternAtom);

  return words.filter((word) => pattern.exec(word));
});

// game progress
export const guessArrayAtom = atomWithStorage<string[]>("guessArray", []);
export const foundWordsAtom = atomWithStorage<string[]>("foundWords", []);
export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);

// const date = new Date();
// export const seedAtom = atomWithStorage("seed", `${date.getFullYear()}${date.getMonth()}${date.getDate()}`)
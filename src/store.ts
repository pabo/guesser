import { atom } from "jotai";
import { atomWithStorage, loadable } from "jotai/utils";
import wordsUrl from "../wordlists/enable7.txt";
import seedrandom from "seedrandom";

export const LETTERS_TO_REVEAL = 2;
export const WORD_LENGTH = 7;
// const TESTING_SEED = "asaaaaaaaaaaaaaaaadfsadfasdf";
const TESTING_SEED = undefined;

// choose a word from a seed, or the daily word
export const choosePattern = (words: string[], seed?: string) => {
  const date = new Date();

  const rng = seedrandom(
    seed ? seed : `${date.getFullYear()}${date.getMonth()}${date.getDate()}`
  );

  const word = words[Math.floor(rng() * words.length) + 1];

  const indexesToReveal: number[] = [];

  for (let i = 0; i < LETTERS_TO_REVEAL; i++) {
    let candidate;

    do {
      console.log("doing");
      candidate = Math.floor(rng() * word.length) + 1;
    } while (candidate === undefined || indexesToReveal.includes(candidate));

    indexesToReveal.push(candidate);
  }

  const letters = word.split("");
  const patternLetters = new Array(letters.length).fill(".");

  for (const index of indexesToReveal) {
    patternLetters[index] = letters[index];
  }

  const regex = new RegExp(patternLetters.join(""));

  return regex;
};

// async atoms
export const wordsAtom = atom(async () => {
  const response = await fetch(wordsUrl);
  return (await response.text()).split("\n");
});

export const loadableAtom = loadable(wordsAtom);

export const patternAtom = atom(async (get) =>
  choosePattern(await get(wordsAtom), TESTING_SEED)
);

export const patternArrayAtom = atom(async (get) => {
  return (await get(patternAtom)).source.split("");
});

export const patternDisplayAtom = atom(async (get) => {
  return (await get(patternAtom)).source
    .replaceAll(".", "_")
    .split("")
    .join(" ");
});

export const validWordsAtom = atom(async (get) => {
  const words = await get(wordsAtom);
  const pattern = await get(patternAtom);

  return words.filter((word) => pattern.exec(word));
});

export const currentGuessDisplayAtom = atom(async (get) => {
  const currentGuess = get(currentGuessArrayAtom);
  const pattern = await get(patternAtom);

  const rv = pattern.source
    .split("")
    .map((p, index) => {
      if (p !== ".") {
        // a pattern letter is set
        return p;
      }

      if (currentGuess[index]) {
        return currentGuess[index];
      }

      return "_";
    })
    .join(" ");

  console.log("returning ", rv);
  return rv;
});

export const currentGuessLoadableAtom = loadable(currentGuessDisplayAtom);

//read / write example
// const readWriteAtom = atom(
//     (get) => get(priceAtom) * 2,
//     (get, set, newPrice) => {
//       set(priceAtom, newPrice / 2)
//       // you can set as many atoms as you want at the same time
//     }
//   )

// sync atoms
export const foundWordsAtom = atomWithStorage<string[]>("foundWords", []);
export const currentGuessArrayAtom = atom<string[]>([]);
export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);

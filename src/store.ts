import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import wordsUrl from "../wordlists/enable7.txt";
import seedrandom from "seedrandom";

export const LETTERS_TO_REVEAL = 2;
export const WORD_LENGTH = 7;
export const NUMBER_OF_VALID_WORDS = 45;
// const TESTING_SEED = "asaaaaaaaaaaaaaaaadfsadfasdf";
const TESTING_SEED = undefined;

const createRegex = (word: string, indexesToReveal: number[]) => {
  const letters = word.split("");
  const patternLetters = new Array(letters.length).fill(".");

  for (const index of indexesToReveal) {
    patternLetters[index] = letters[index];
  }

  const regex = new RegExp(patternLetters.join(""));

  return regex;

}

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
    console.log("trying for an index...")
    let candidate;

    do {
      candidate = Math.floor(rng() * word.length -1) + 1;
    } while (candidate === undefined || indexesToReveal.includes(candidate));

    indexesToReveal.push(candidate);
    console.log("pushed new index", indexesToReveal)

    regex = createRegex(word, indexesToReveal);

    console.log("regex is ", regex.source)
    console.log("valid words are", words.filter(word => regex.exec(word)));

  } while (words.filter(word => regex.exec(word)).length > NUMBER_OF_VALID_WORDS)

  return createRegex(word, indexesToReveal);
};

// async atoms

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

// sync atoms
export const foundWordsAtom = atomWithStorage<string[]>("foundWords", []);
export const currentGuessArrayAtom = atom<string[]>([]);
export const guessIsGoodAtom = atom(false);
export const guessIsBadAtom = atom(false);

// const date = new Date();
// export const seedAtom = atomWithStorage("seed", `${date.getFullYear()}${date.getMonth()}${date.getDate()}`)
import seedrandom from "seedrandom";
import { WordLengthToFoundWordsMap, WordLength } from "./store";

// a place for functions that don't need atoms, or operate only on arguments

export const createRegex = (word: string, indexesToReveal: number[]) => {
  const letters = word.split("");
  const patternLetters = new Array(letters.length).fill(".");

  for (const index of indexesToReveal) {
    patternLetters[index] = letters[index];
  }

  const regex = new RegExp(patternLetters.join(""));

  return regex;
};

// choose a word from a seed, or the daily word
export const choosePattern = (
  words: string[],
  seed: string,
  maxResults: number
) => {
  const rng = seedrandom(seed);

  const word = words[Math.floor(rng() * words.length) + 1] || "";

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
  } while (words.filter((word) => regex.exec(word)).length > maxResults);

  return createRegex(word, indexesToReveal);
};

export const getIndexOfFirstUndefined = (array: unknown[]) => {
  return array.findIndex((x) => x === undefined);
};

// combines arrays by masking the second onto the first. nullish values in earlier arrays are filled with the values
// from later arrays
//
// result array will have same length as first array.
export const combineArrays: (
  array1: (string | undefined)[],
  array2: (string | undefined)[]
) => (string | undefined)[] = (array1, array2) => {
  return array1.map((value1, index) => {
    const value2 = array2[index];

    return value1 ?? value2 ?? undefined;
  });
};

// TODO: the type here should be more generic
export const objectOfArraysCopy = (oaa: WordLengthToFoundWordsMap) => {
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

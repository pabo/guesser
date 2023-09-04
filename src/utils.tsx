import seedrandom from "seedrandom";

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
  } while (words.filter((word) => regex.exec(word)).length > maxResults);

  return createRegex(word, indexesToReveal);
};

export const getIndexOfFirstUndefined = (array: unknown[]) => {
  return array.findIndex((x) => x === undefined);
};

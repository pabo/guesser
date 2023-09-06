import { getDefaultStore } from "jotai";
import {
  guessIsBadAtom,
  guessIsGoodAtom,
  acceptingInputAtom,
  gameOverAtom,
  guessArrayAtom,
  addLetterToGuess,
  firstUndefinedIndexInCombinedAtom,
  wordLengthAtom,
  combinedGuessAndPatternArrayAtom,
  foundWordsAtom,
  guessIsRepeatAtom,
  validWordsAtom,
} from "./main.store";

export const store = getDefaultStore();

export const allowedKeys = [
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
    !allowedKeys.includes(key) ||
    (await store.get(gameOverAtom))
  ) {
    return;
  }

  // handle backspace/del
  if (key === "backspace" || key === "del") {
    const lastGuessIndex = store
      .get(guessArrayAtom)
      .findLastIndex((x) => x !== undefined);

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
  if (index !== -1 && index < store.get(wordLengthAtom)) {
    return;
  }

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
  const validWords = await store.get(validWordsAtom);

  if (validWords.includes(potentialWord)) {
    store.set(guessIsGoodAtom, true);
    store.set(foundWordsAtom, potentialWord); // not true "set"; essentially a "push"

    return;
  }

  //or invalid?
  store.set(guessIsBadAtom, true);
};

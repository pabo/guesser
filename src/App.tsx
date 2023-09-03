import { useAtom } from "jotai";
import {
  foundWordsAtom,
  guessArrayAtom,
  validWordsAtom,
  patternArrayAtom,
  guessIsGoodAtom,
  guessIsBadAtom,
  meldArrays,
  guessIsRepeatAtom,
  acceptingInputAtom,
  dailySeedAtom,
  getCurrentDateString,
  wordLengthAtom,
} from "./store";
import { useEffect, useRef } from "react";
import { Guess } from "./Guess";
import { Word } from "./Word";
import { Keyboard } from "./Keyboard";
import { Links } from "./Links";

export const App = () => {
  const [wordLength] = useAtom(wordLengthAtom);
  const [patternArray] = useAtom(patternArrayAtom);
  const [guessArray, setGuessArray] = useAtom(guessArrayAtom);
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [foundWords, addWordToFoundWords] = useAtom(foundWordsAtom);
  const [acceptingInput, setAcceptingInput] = useAtom(acceptingInputAtom);
  const [dailySeed, setDailySeed] = useAtom(dailySeedAtom);

  // TODO: this is probably just for testing. Not sure if we want to blow away someone's daily puzzle at midnight?
  useEffect(() => {
    const handle = setInterval(() => {
      // checking for date change
      if (dailySeed !== getCurrentDateString()) {
        setDailySeed(getCurrentDateString());
      }
    }, 1000);

    return () => clearInterval(handle);
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  type EventLikeObject = {
    key: string;
  };

  // TODO: need to get this logic out of the component. Do I need to pass all the required inputs into a store function? Or how else do I hook into the atoms?
  const handleKeyDown = (e: EventLikeObject) => {
    // TODO: the whole animation thing is janky. timings are coupled, states are messy
    // no typing while animation is happening
    if (guessIsBad || guessIsGood || !acceptingInput) {
      return;
    }

    // TODO: event.keycode is deprecated. can key or code do a range?
    const allowedKeys = "abcdefghijklmnopqrstuvwxyz".split("");

    // remove the last guessed letter
    if (e.key === "Backspace" || e.key === "del") {
      const lastGuessIndex = guessArray.findLastIndex((x) => x !== undefined);

      setGuessArray((guess) => guess.slice(0, lastGuessIndex));
      return;
    }

    if (allowedKeys.includes(e.key)) {
      // add the typed letter to the guess
      const lettersToAdd: (string | undefined)[] = [e.key];

      // also add pattern characters until you get to the next undefined
      let index = guessArray.length + 1;
      let nextPatternCharacter = patternArray[index];

      while (index < wordLength && nextPatternCharacter !== undefined) {
        lettersToAdd.push(undefined);
        nextPatternCharacter = patternArray[++index];
      }

      setGuessArray((guess) => [...guess, ...lettersToAdd]);

      // TODO: semi hacky way to dedupe click/move touch events
      setAcceptingInput(false);
      setTimeout(() => {
        setAcceptingInput(true);
      }, 50);

      // does this guess finish a word?
      if (guessArray.length + lettersToAdd.length >= wordLength) {
        // give time for animation to complete, and then reset the guess input
        // TODO: should this hook into onanimationend instead?
        setTimeout(() => setGuessArray([]), 300);

        const nextGuessArray = [...guessArray, ...lettersToAdd];
        const potentialWord = meldArrays(patternArray, nextGuessArray).join("");

        // is it repeat?
        if (foundWords?.includes(potentialWord)) {
          setGuessIsRepeat(true);
          return;
        }

        // is it valid?
        if (validWords.includes(potentialWord)) {
          setGuessIsGood(true);
          addWordToFoundWords(potentialWord);

          return;
        }

        //or invalid?
        setGuessIsBad(true);
      }
    }
  };

  return (
    <div className="page" ref={ref} tabIndex={0} onKeyDown={handleKeyDown}>
      <Links />
      <div className="main">
        <div className="description">
          Find as many words as you can that fit the pattern. Hi mom!
        </div>
        <Guess />
        <div className="words">
          {validWords.map((word, index) => (
            <Word key={index} word={word} />
          ))}
        </div>
        <Keyboard handleKeyInput={handleKeyDown} />
      </div>
    </div>
  );
};

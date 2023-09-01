import { useAtom } from "jotai";
import "./App.css";
import {
  foundWordsAtom,
  loadableAtom,
  currentGuessArrayAtom,
  WORD_LENGTH,
  validWordsAtom,
  patternArrayAtom,
  guessIsGoodAtom,
  guessIsBadAtom,
  wordsAtom,
} from "./store";
import { startTransition, useEffect, useRef } from "react";
import githubImgUrl from "./assets/github-mark.png";
import { Guess } from "./Guess";
import { Word } from "./WOrd";

export const App = () => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [currentGuessArray, setCurrentGuessArray] = useAtom(
    currentGuessArrayAtom
  );
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [, setFoundWords] = useAtom(foundWordsAtom);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // no typing while animation is happening
    if (guessIsBad || guessIsGood) {
      return;
    }

    // TODO: keycode is deprecated. can key or code do a range?
    const allowedKeys = "abcdefghijklmnopqrstuvwxyz".split("");

    //TODO: should backspace back over the pattern?
    if (e.key === "Backspace") {
      startTransition(() => {
        setCurrentGuessArray((guess) => guess.slice(0, -1));
      });
      return;
    }

    startTransition(() => {
      if (allowedKeys.includes(e.key)) {
        const nextPatternCharacter = patternArray[currentGuessArray.length];
        if (nextPatternCharacter !== "." && nextPatternCharacter !== e.key) {
          // if we're attemting to "overwrite" a pattern'ed letter, assume they skipped typing it
          setCurrentGuessArray((guess) => [...guess, nextPatternCharacter]);
        }

        setCurrentGuessArray((guess) => [...guess, e.key]);
      }
    });

    // does this guess finish a word?
    if (currentGuessArray.length >= WORD_LENGTH - 1) {
      const fullGuess = [...currentGuessArray, e.key].join("");

      // is it valid?
      setTimeout(() => setCurrentGuessArray([]), 300);

      if (validWords.includes(fullGuess)) {
        setGuessIsGood(true);
        setFoundWords((words) => [...words, fullGuess]);
        return;
      }

      //or invalid?
      setGuessIsBad(true);
    }
  };

  return (
    <div className="page" ref={ref} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="links">
        <a href="https://github.com/pabo/guesser">
          <img src={githubImgUrl} height="30px" />
        </a>
      </div>
      <div className="main">
        <div className="description">
          Find as many words as you can that fit the pattern. Hi mom!
        </div>
        <Guess />
      </div>
      <div className="words flex">
        {validWords.map((word, index) => (
          <Word key={index} word={word} />
        ))}
      </div>
    </div>
  );
};

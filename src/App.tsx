import { useAtom } from "jotai";
import "./App.css";
import {
  foundWordsAtom,
  guessArrayAtom,
  WORD_LENGTH,
  validWordsAtom,
  patternArrayAtom,
  guessIsGoodAtom,
  guessIsBadAtom,
} from "./store";
import { startTransition } from "react";
import githubImgUrl from "./assets/github-mark.png";
import { Guess } from "./Guess";
import { Word } from "./Word";
import { Keyboard } from "./Keyboard";

export const App = () => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [guessArray, setGuessArray] = useAtom(guessArrayAtom);
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [, setFoundWords] = useAtom(foundWordsAtom);

  type EventLikeObject = {
    key: string;
  };

  const handleKeyDown = (e: EventLikeObject) => {
    // no typing while animation is happening
    if (guessIsBad || guessIsGood) {
      return;
    }

    // TODO: event.keycode is deprecated. can key or code do a range?
    const allowedKeys = "abcdefghijklmnopqrstuvwxyz".split("");

    //TODO: should backspace back over the pattern?
    if (e.key === "Backspace") {
      startTransition(() => {
        setGuessArray((guess) => guess.slice(0, -1));
      });
      return;
    }

    if (allowedKeys.includes(e.key)) {
      // add the typed letter to the guess
      const lettersToAdd = [e.key];

      // also add pattern characters until you get to the next "."
      let index = guessArray.length + 1;
      let nextPatternCharacter = patternArray[index];

      while (index < WORD_LENGTH && nextPatternCharacter !== ".") {
        lettersToAdd.push(nextPatternCharacter);
        nextPatternCharacter = patternArray[++index];
      }

      // wrapped because a synchronous event (user click) causes an async update (async atoms).
      // and without this, we would block rendering or something
      startTransition(() => {
        setGuessArray((guess) => [...guess, ...lettersToAdd]);
      });

      // does this guess finish a word?
      if (guessArray.length + lettersToAdd.length >= WORD_LENGTH) {
        // give time for animation to complete, and then
        // TODO: should this hook into onanimationend instead?
        setTimeout(() => setGuessArray([]), 300);

        const fullGuess = [...guessArray, ...lettersToAdd].join("");
        // is it valid?
        if (validWords.includes(fullGuess)) {
          setGuessIsGood(true);
          setFoundWords((words) => [...words, fullGuess]);
          return;
        }

        //or invalid?
        setGuessIsBad(true);
      }
    }
  };

  return (
    <div className="page" tabIndex={0} onKeyDown={handleKeyDown}>
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
        <div className="words flex">
          {validWords.map((word, index) => (
            <Word key={index} word={word} />
          ))}
        </div>
        <Keyboard handleKeyInput={handleKeyDown} />
      </div>
    </div>
  );
};

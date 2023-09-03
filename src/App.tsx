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
  wordLengthAtom,
  WordLength,
} from "./store";
import { useEffect, useRef } from "react";
import githubImgUrl from "./assets/github-mark.png";
import { Guess } from "./Guess";
import { Word } from "./Word";
import { Keyboard } from "./Keyboard";
import classNames from "classnames";

export const App = () => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [guessArray, setGuessArray] = useAtom(guessArrayAtom);
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [foundWords, addWordToFoundWords] = useAtom(foundWordsAtom);
  const [acceptingInput, setAcceptingInput] = useAtom(acceptingInputAtom);
  const [wordLength, setWordLength] = useAtom(wordLengthAtom);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  type EventLikeObject = {
    key: string;
  };

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

  const changeWordLength = (length: WordLength) => {
    setWordLength(length);
    setGuessArray([]);
  };

  return (
    <div className="page" ref={ref} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="links vertically-centered">
        <button
          className={classNames({
            "selected-button": wordLength === WordLength.Five,
          })}
          onClick={() => changeWordLength(WordLength.Five)}
        >
          5
        </button>
        <button
          className={classNames({
            "selected-button": wordLength === WordLength.Seven,
          })}
          onClick={() => changeWordLength(WordLength.Seven)}
        >
          7
        </button>
        <div className="link-image">
          <a href="https://github.com/pabo/guesser">
            <img src={githubImgUrl} />
          </a>
        </div>
      </div>
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

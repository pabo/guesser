import { useAtom } from "jotai";
import {
  foundWordsAtom,
  guessArrayAtom,
  WORD_LENGTH,
  validWordsAtom,
  patternArrayAtom,
  guessIsGoodAtom,
  guessIsBadAtom,
  meldArrays,
  guessIsRepeatAtom,
  acceptingInputAtom,
} from "./store";
import { startTransition, useEffect, useRef } from "react";
import githubImgUrl from "./assets/github-mark.png";
import { Guess } from "./Guess";
import { Word } from "./Word";
import { Keyboard } from "./Keyboard";

export const App = () => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [guessArray, setGuessArray] = useAtom(guessArrayAtom);
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [foundWords, setFoundWords] = useAtom(foundWordsAtom);
  const [acceptingInput, setAcceptingInput] = useAtom(acceptingInputAtom);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  type EventLikeObject = {
    key: string;
  };

  const handleKeyDown = (e: EventLikeObject) => {
    console.log("handling key", e.key);
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

      startTransition(() => {
        setGuessArray((guess) => guess.slice(0, lastGuessIndex));
      });
      return;
    }

    if (allowedKeys.includes(e.key)) {
      // add the typed letter to the guess
      const lettersToAdd: (string | undefined)[] = [e.key];

      // also add pattern characters until you get to the next undefined
      let index = guessArray.length + 1;
      let nextPatternCharacter = patternArray[index];

      while (index < WORD_LENGTH && nextPatternCharacter !== undefined) {
        lettersToAdd.push(undefined);
        nextPatternCharacter = patternArray[++index];
      }

      // wrapped because a synchronous event (user click) causes an async update (async atoms).
      // and without this, we would block rendering or something
      startTransition(() => {
        setGuessArray((guess) => [...guess, ...lettersToAdd]);
        console.log("preventing input");
        setAcceptingInput(false);
        setTimeout(() => {
          setAcceptingInput(true);
          console.log("allowing input");
        }, 100);
      });

      // does this guess finish a word?
      if (guessArray.length + lettersToAdd.length >= WORD_LENGTH) {
        // give time for animation to complete, and then reset the guess input
        // TODO: should this hook into onanimationend instead?
        setTimeout(() => setGuessArray([]), 300);

        const nextGuessArray = [...guessArray, ...lettersToAdd];
        const potentialWord = meldArrays(patternArray, nextGuessArray).join("");

        // is it repeat?
        console.log("found words is", foundWords);
        if (foundWords.includes(potentialWord)) {
          console.log("setting repeat");
          setGuessIsRepeat(true);
          return;
        }

        // is it valid?
        if (validWords.includes(potentialWord)) {
          setGuessIsGood(true);
          setFoundWords((words) => [...words, potentialWord]);
          return;
        }

        //or invalid?
        setGuessIsBad(true);
      }
    }
  };

  const handleSettingsClick = () => {
    console.log("open settings");
  };

  return (
    <div className="page" ref={ref} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="links vertically-centered">
        <button onClick={handleSettingsClick}>Settings</button>
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

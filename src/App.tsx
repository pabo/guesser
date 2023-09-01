import { useAtom } from "jotai";
import "./App.css";
import {
  foundWordsAtom,
  loadableAtom,
  currentGuessArrayAtom,
  WORD_LENGTH,
  validWordsAtom,
  patternArrayAtom,
  currentGuessLoadableAtom,
  guessIsGoodAtom,
  guessIsBadAtom,
} from "./store";
import { useEffect, useRef } from "react";
import githubImgUrl from "./assets/github-mark.png";

export const App = () => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [currentGuessArray, setCurrentGuessArray] = useAtom(
    currentGuessArrayAtom
  );
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [validWords] = useAtom(validWordsAtom);
  const [, setFoundWords] = useAtom(foundWordsAtom);
  const [wordsLoadable] = useAtom(loadableAtom);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  });

  if (wordsLoadable.state === "loading") return <div>Loading...</div>;
  if (wordsLoadable.state === "hasError") return <div>Error...</div>;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // no typing while animation is happening
    if (guessIsBad || guessIsGood) {
      return;
    }

    // TODO: keycode is deprecated. can key or code do a range?
    const allowedKeys = "abcdefghijklmnopqrstuvwxyz".split("");

    //TODO: should backspace back over the pattern?
    if (e.key === "Backspace") {
      setCurrentGuessArray((guess) => guess.slice(0, -1));
      return;
    }

    if (allowedKeys.includes(e.key)) {
      const nextPatternCharacter = patternArray[currentGuessArray.length];
      if (nextPatternCharacter !== "." && nextPatternCharacter !== e.key) {
        // if we're attemting to "overwrite" a pattern'ed letter, assume they skipped typing it
        setCurrentGuessArray((guess) => [...guess, nextPatternCharacter]);
      }

      setCurrentGuessArray((guess) => [...guess, e.key]);
    }

    console.log("fuccent geuss array", currentGuessArray);
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
    <>
      <div className="links">
        <a href="https://github.com/pabo/guesser">
          <img src={githubImgUrl} height="30px" />
        </a>
      </div>
      <div className="main" ref={ref} tabIndex={0} onKeyDown={handleKeyDown}>
        <Guess />
      </div>
      <div className="words flex">
        {validWords.map((word, index) => (
          <Word key={index} word={word} />
        ))}
      </div>
    </>
  );
};

const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [currentGuessLoadable] = useAtom(currentGuessLoadableAtom);

  if (currentGuessLoadable.state === "loading") return <div>Loading...</div>;
  if (currentGuessLoadable.state === "hasError") return <div>Error...</div>;

  return (
    <h1
      className={`guess ${guessIsGood ? "good-guess" : ""} ${
        guessIsBad ? "bad-guess" : ""
      }`}
      onAnimationEnd={() => {
        setGuessIsGood(false);
        setGuessIsBad(false);
      }}
    >
      {currentGuessLoadable.data}
    </h1>
  );
};

type WordProps = {
  word: string;
};

const Word: React.FC<WordProps> = ({ word }) => {
  const [foundWords] = useAtom(foundWordsAtom);
  const isFound = foundWords.includes(word);

  const placeholder = "xxxxxxx";

  return (
    <div className={`word ${isFound ? "" : "faded"}`}>
      {isFound ? word : placeholder}{" "}
    </div>
  );
};

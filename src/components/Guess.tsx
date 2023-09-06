import { useAtom } from "jotai";
import {
  guessIsGoodAtom,
  guessIsBadAtom,
  combinedGuessAndPatternArrayAtom,
  patternArrayAtom,
  gameOverAtom,
  fistUndefinedIndexInCombinedAtom,
} from "../store";
import classNames from "classnames";
import styles from "./Guess.module.css";
import { startTransition } from "react";

export const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom, { delay: 0 });
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom, { delay: 0 });
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternArrayAtom, {
    delay: 0,
  });
  const [gameOver] = useAtom(gameOverAtom, { delay: 0 });

  return (
    <h2
      className={classNames(styles.guess, {
        [styles.goodGuess]: guessIsGood,
        [styles.badGuess]: guessIsBad,
      })}
      onAnimationEnd={() => {
        startTransition(() => {
          setGuessIsGood(false);
          setGuessIsBad(false);
        });
      }}
    >
      {gameOver && "You win!"}
      {!gameOver &&
        combinedGuessAndPattern.map(
          (letter: string | undefined, index: number) => {
            return <GuessLetter key={index} letter={letter} index={index} />;
          }
        )}
    </h2>
  );
};

type GuessLetterProps = {
  letter?: string;
  index: number;
};

export const GuessLetter: React.FC<GuessLetterProps> = ({ letter, index }) => {
  const [patternArray] = useAtom(patternArrayAtom);
  const [firstUndefinedIndex] = useAtom(fistUndefinedIndexInCombinedAtom);

  return (
    <div
      className={classNames(styles.guessLetter, {
        [styles.guessFilledLetter]: index < firstUndefinedIndex,
        [styles.guessNextLetter]: index === firstUndefinedIndex,
        [styles.guessFixedLetter]: patternArray[index],
      })}
    >
      {letter || "\u00A0" /* &nbsp; */}
    </div>
  );
};

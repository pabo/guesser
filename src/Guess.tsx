import { useAtom } from "jotai";
import {
  guessIsGoodAtom,
  guessIsBadAtom,
  guessArrayAtom,
  combinedGuessAndPatternAtom,
  // guessIsRepeatAtom,
} from "./store";
import { Suspense } from "react";
import classNames from "classnames";

export const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  // const [guessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternAtom);

  return (
    <Suspense fallback={"fallback"}>
      <h2
        className={classNames({
          flex: true,
          guess: true,
          "good-guess": guessIsGood,
          "bad-guess": guessIsBad,
          // "repeat-guess": guessIsRepeat,
        })}
        onAnimationEnd={() => {
          setGuessIsGood(false);
          setGuessIsBad(false);
        }}
      >
        {combinedGuessAndPattern.map(
          (letter: string | undefined, index: number) => {
            return <GuessLetter key={index} letter={letter} index={index} />;
          }
        )}
      </h2>
    </Suspense>
  );
};

type GuessLetterProps = {
  letter?: string;
  index: number;
};

export const GuessLetter: React.FC<GuessLetterProps> = ({ letter, index }) => {
  const [guessArray] = useAtom(guessArrayAtom);

  return (
    <div
      className={classNames({
        "guess-letter": true,
        "guess-next-letter": guessArray.length === index,
      })}
    >
      {letter || "\u00A0" /* &nbsp; */}
    </div>
  );
};

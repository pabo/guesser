import { useAtom } from "jotai";
import {
  guessIsGoodAtom,
  guessIsBadAtom,
  patternArrayAtom,
  guessArrayAtom,
} from "./store";
import { Suspense } from "react";
import classNames from "classnames";

export const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [patternArray] = useAtom(patternArrayAtom);

  return (
    <Suspense fallback={"fallback"}>
      <h2
        className={classNames({
          flex: true,
          guess: true,
          "good-guess": guessIsGood,
          "bad-guess": guessIsBad,
        })}
        onAnimationEnd={() => {
          setGuessIsGood(false);
          setGuessIsBad(false);
        }}
      >
        {patternArray.map((letter: string, index: number) => {
          return (
            <GuessLetter key={index} patternLetter={letter} index={index} />
          );
        })}
      </h2>
    </Suspense>
  );
};

type GuessLetterProps = {
  patternLetter: string;
  index: number;
};

export const GuessLetter: React.FC<GuessLetterProps> = ({
  patternLetter,
  index,
}) => {
  const [guessArray] = useAtom(guessArrayAtom);
  const guessLetter = guessArray[index];

  return (
    <div
      className={classNames({
        "guess-letter": true,
        "guess-next-letter": guessArray.length === index,
      })}
    >
      {patternLetter === "."
        ? guessLetter
          ? guessLetter
          : patternLetter
        : patternLetter}
    </div>
  );
};

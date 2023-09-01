import { useAtom } from "jotai";
import {
  guessIsGoodAtom,
  guessIsBadAtom,
  currentGuessDisplayAtom,
} from "./store";
import { Suspense } from "react";

export const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [currentGuessDisplay] = useAtom(currentGuessDisplayAtom);

  return (
    <Suspense fallback={"fallback"}>
      <h1
        className={`guess ${guessIsGood ? "good-guess" : ""} ${
          guessIsBad ? "bad-guess" : ""
        }`}
        onAnimationEnd={() => {
          setGuessIsGood(false);
          setGuessIsBad(false);
        }}
      >
        {currentGuessDisplay}
      </h1>
    </Suspense>
  );
};

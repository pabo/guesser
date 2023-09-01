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

  const handleKeyDown = (e: React.SyntheticEvent) => {
    // e.preventDefault();

    console.log(e);
  };

  return (
    <Suspense fallback={"fallback"}>
      <h2
        className={`guess ${guessIsGood ? "good-guess" : ""} ${
          guessIsBad ? "bad-guess" : ""
        }`}
        onChange={handleKeyDown}
        onAnimationEnd={() => {
          setGuessIsGood(false);
          setGuessIsBad(false);
        }}
      >
        {currentGuessDisplay}
      </h2>
    </Suspense>
  );
};

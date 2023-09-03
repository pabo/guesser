import { useAtom } from "jotai";
import {
  guessIsGoodAtom,
  guessIsBadAtom,
  guessArrayAtom,
  combinedGuessAndPatternAtom,
  patternArrayAtom,
  gameOverAtom,
} from "./store";
import classNames from "classnames";

export const Guess = () => {
  const [guessIsGood, setGuessIsGood] = useAtom(guessIsGoodAtom);
  const [guessIsBad, setGuessIsBad] = useAtom(guessIsBadAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternAtom);
  const [gameOver] = useAtom(gameOverAtom);

  return (
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
  const [guessArray] = useAtom(guessArrayAtom);
  const [patternArray] = useAtom(patternArrayAtom);

  return (
    <div
      className={classNames({
        "guess-letter": true,
        "guess-filled-letter": index < guessArray.length,
        "guess-next-letter": index === guessArray.length,
        "guess-fixed-letter": patternArray[index],
      })}
    >
      {letter || "\u00A0" /* &nbsp; */}
    </div>
  );
};

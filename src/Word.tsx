import { useAtom } from "jotai";
import {
  combinedGuessAndPatternAtom,
  foundWordsAtom,
  guessIsRepeatAtom,
  wordLengthAtom,
} from "./store";
import classNames from "classnames";

type WordProps = {
  word: string;
};

export const Word: React.FC<WordProps> = ({ word }) => {
  const [foundWords] = useAtom(foundWordsAtom);
  const [guessIsRepeat, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternAtom);
  const [wordLength] = useAtom(wordLengthAtom);
  const isFound = foundWords.includes(word);

  const placeholder = new Array(wordLength).fill("x").join("");

  return (
    <div
      onAnimationEnd={() => {
        // TODO: why is/isnt this needed
        setGuessIsRepeat(false);
      }}
      className={classNames({
        word: true,
        faded: !isFound,
        repeat: guessIsRepeat && combinedGuessAndPattern.join("") === word,
      })}
    >
      {isFound ? word : placeholder}{" "}
    </div>
  );
};
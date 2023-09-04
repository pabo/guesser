import { useAtom } from "jotai";
import classNames from "classnames";
import {
  combinedGuessAndPatternArrayAtom,
  foundWordsAtom,
  guessIsRepeatAtom,
  wordLengthAtom,
} from "./store";

type WordProps = {
  word: string;
};

export const Word: React.FC<WordProps> = ({ word }) => {
  const [foundWords] = useAtom(foundWordsAtom);
  const [guessIsRepeat, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternArrayAtom);
  const [wordLength] = useAtom(wordLengthAtom);
  const isFound = foundWords.includes(word);

  const placeholder = new Array(wordLength).fill("x").join("");

  return (
    <div
      onAnimationEnd={() => {
        setGuessIsRepeat(false);
      }}
      className={classNames({
        word: true,
        faded: !isFound,
        repeat: guessIsRepeat && word === combinedGuessAndPattern.join(""),
      })}
    >
      {isFound ? word : placeholder}{" "}
    </div>
  );
};

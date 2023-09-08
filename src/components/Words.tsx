import { useAtom } from "jotai";
import classNames from "classnames";
import {
  combinedGuessAndPatternArrayAtom,
  foundWordsAtom,
  guessIsRepeatAtom,
  isGivenUpAtom,
  placeholderWordAtom,
  unfoundWordsAtom,
} from "../stores/main.store";
import styles from "./Words.module.css";
import { WordInfo } from "./WordInfo";

export const Words = () => {
  const [foundWords] = useAtom(foundWordsAtom, { delay: 0 });
  const [unFoundWords] = useAtom(unfoundWordsAtom, { delay: 0 });

  return (
    <div className={styles.words}>
      {unFoundWords.map((word, index) => (
        <Word key={index} word={word} />
      ))}
      {foundWords.toReversed().map((word, index) => (
        <Word key={index} word={word} />
      ))}
    </div>
  );
};

type WordProps = {
  word: string;
};

export const Word: React.FC<WordProps> = ({ word }) => {
  const [placeholder] = useAtom(placeholderWordAtom);
  const [isGivenUp] = useAtom(isGivenUpAtom);
  const [foundWords] = useAtom(foundWordsAtom);
  const [guessIsRepeat, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternArrayAtom);

  const isFound = foundWords.includes(word);

  return (
    <div
      onAnimationEnd={() => {
        setGuessIsRepeat(false);
      }}
      className={classNames(styles.word, {
        [styles.notFound]: !isFound,
        [styles.isGivenUp]: isGivenUp,
        [styles.repeat]:
          guessIsRepeat && word === combinedGuessAndPattern.join(""),
      })}
    >
      <div>{isFound || isGivenUp ? word : placeholder} </div>
      <WordInfo word={word} isFound={isFound} />
    </div>
  );
};

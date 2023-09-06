import { useAtom } from "jotai";
import classNames from "classnames";
import {
  combinedGuessAndPatternArrayAtom,
  foundWordsAtom,
  guessIsRepeatAtom,
  wordLengthAtom,
} from "../store";
import styles from "./Words.module.css";
import { WordInfo } from "./WordInfo";
import { useState } from "react";

type WordsProps = {
  words: string[];
};

export const Words: React.FC<WordsProps> = ({ words }) => {
  return (
    <div className={styles.words}>
      {words.map((word, index) => (
        <Word key={index} word={word} />
      ))}
    </div>
  );
};

type WordProps = {
  word: string;
};

export const Word: React.FC<WordProps> = ({ word }) => {
  const [foundWords] = useAtom(foundWordsAtom);
  const [guessIsRepeat, setGuessIsRepeat] = useAtom(guessIsRepeatAtom);
  const [combinedGuessAndPattern] = useAtom(combinedGuessAndPatternArrayAtom);
  const [wordLength] = useAtom(wordLengthAtom);

  const [showWordInfo, setShowWordInfo] = useState(false);

  const isFound = foundWords.includes(word);
  const placeholder = new Array(wordLength).fill("x").join("");

  return (
    <div
      onMouseEnter={() => setShowWordInfo(true)}
      onMouseLeave={() => setShowWordInfo(false)}
      onAnimationEnd={() => {
        setGuessIsRepeat(false);
      }}
      className={classNames(styles.word, {
        [styles.faded]: !isFound,
        [styles.repeat]:
          guessIsRepeat && word === combinedGuessAndPattern.join(""),
      })}
    >
      {isFound ? word : placeholder} {showWordInfo && <WordInfo word={word} />}
    </div>
  );
};

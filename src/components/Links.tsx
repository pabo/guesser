import classNames from "classnames";
import githubImgUrl from "../assets/github-mark.png";
import {
  WordLength,
  guessArrayAtom,
  isDailyModeAtom,
  wordLengthAtom,
} from "../store";
import { useAtom } from "jotai";
// import style from "./Links.module.css?inline";
import styles from "./Links.module.css";

export const Links = () => {
  const [isDailyMode, setIsDailyMode] = useAtom(isDailyModeAtom);
  const [wordLength, setWordLength] = useAtom(wordLengthAtom);
  const [, setGuessArray] = useAtom(guessArrayAtom);

  // TODO: put this in store
  const changeWordLength = (length: WordLength) => {
    setWordLength(length);

    // TODO: is there a way where I dont have to manually call this
    setGuessArray(new Array(length).fill(undefined));
  };

  return (
    <div className={styles.links}>
      <Button
        text="Daily"
        isSelected={isDailyMode}
        clickHandler={() => setIsDailyMode(true)}
      />
      {/* <Button
        text="Random"
        isSelected={!isDailyMode}
        clickHandler={() => setIsDailyMode(false)}
      /> */}
      <Button
        text={WordLength.Five.toString()}
        isSelected={wordLength === WordLength.Five}
        clickHandler={() => changeWordLength(WordLength.Five)}
      />
      <Button
        text={WordLength.Seven.toString()}
        isSelected={wordLength === WordLength.Seven}
        clickHandler={() => changeWordLength(WordLength.Seven)}
      />
      <div className={styles.linkImage}>
        <a href="https://github.com/pabo/guesser">
          <img src={githubImgUrl} />
        </a>
      </div>
    </div>
  );
};

type ButtonProps = {
  text: string;
  isSelected: boolean;
  clickHandler: () => void;
};

const Button: React.FC<ButtonProps> = ({ text, isSelected, clickHandler }) => {
  return (
    <button
      className={classNames(styles.button, { [styles.selected]: isSelected })}
      onClick={clickHandler}
    >
      {text}
    </button>
  );
};

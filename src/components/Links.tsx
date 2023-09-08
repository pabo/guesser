import classNames from "classnames";
import githubImgUrl from "../assets/github-mark.png";
import {
  WordLength,
  changeWordLength,
  // isDailyModeAtom,
  isGivenUpAtom,
  wordLengthAtom,
} from "../stores/main.store";
import { useAtom } from "jotai";
import styles from "./Links.module.css";

export const Links = () => {
  // const [isDailyMode, setIsDailyMode] = useAtom(isDailyModeAtom);
  const [isGivenUp, setIsGivenUp] = useAtom(isGivenUpAtom);
  const [wordLength] = useAtom(wordLengthAtom);

  return (
    <div className={styles.links}>
      <Button
        text="Give up"
        isSelected={isGivenUp}
        clickHandler={() => setIsGivenUp(true)}
      />
      {/* <Button
        text="Daily"
        isSelected={isDailyMode}
        clickHandler={() => setIsDailyMode(true)}
      /> */}
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
      className={classNames({ selected: isSelected })}
      onClick={clickHandler}
    >
      {text}
    </button>
  );
};

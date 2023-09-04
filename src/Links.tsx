import classNames from "classnames";
import githubImgUrl from "./assets/github-mark.png";
import {
  WordLength,
  guessArrayAtom,
  isDailyModeAtom,
  wordLengthAtom,
} from "./store";
import { useAtom } from "jotai";

export const Links = () => {
  const [isDailyMode, setIsDailyMode] = useAtom(isDailyModeAtom);
  const [wordLength, setWordLength] = useAtom(wordLengthAtom);
  const [, setGuessArray] = useAtom(guessArrayAtom);

  const changeWordLength = (length: WordLength) => {
    // TODO: put this in store
    setWordLength(length);
    setGuessArray(new Array(wordLength).fill(undefined));
  };

  return (
    <div className="links vertically-centered">
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
      <div className="link-image">
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
      className={classNames({
        "selected-button": isSelected,
      })}
      onClick={clickHandler}
    >
      {text}
    </button>
  );
};

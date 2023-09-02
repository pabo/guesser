import classNames from "classnames";
import { WordLength, wordLengthAtom } from "./store";
import { useAtom } from "jotai";

type SettingsProps = {
  isOpen: boolean;
};

export const Settings: React.FC<SettingsProps> = ({ isOpen }) => {
  const [wordLength, setWordLength] = useAtom(wordLengthAtom);

  return (
    <div className={classNames({ settings: true, "is-open": isOpen })}>
      <div className="close">X</div>
      <div className="modal-content">
        <button
          className={classNames({
            "selected-button": wordLength === WordLength.Five,
          })}
          onClick={() => setWordLength(WordLength.Five)}
        >
          5 letters
        </button>
        <button
          className={classNames({
            "selected-button": wordLength === WordLength.Seven,
          })}
          onClick={() => setWordLength(WordLength.Seven)}
        >
          7 letters
        </button>
      </div>
    </div>
  );
};

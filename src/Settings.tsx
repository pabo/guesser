import classNames from "classnames";
import { WordLength, wordLengthAtom } from "./store";
import { useAtom } from "jotai";
import { startTransition } from "react";

type SettingsProps = {
  isOpen: boolean;
};

export const Settings: React.FC<SettingsProps> = ({ isOpen }) => {
  const [, setWordLength] = useAtom(wordLengthAtom);
  const handleClick = () => {
    startTransition(() =>
      setWordLength((wordLength) =>
        wordLength === WordLength.Five ? WordLength.Seven : WordLength.Five
      )
    );
  };

  return (
    <div className={classNames({ settings: true, "is-open": isOpen })}>
      <button onClick={handleClick}>Toggle word length</button>
    </div>
  );
};

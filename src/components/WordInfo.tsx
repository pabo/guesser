import { useAtom } from "jotai";
import styles from "./WordInfo.module.css";
import { wordsMetadataAtom } from "../stores/main.store";
import classNames from "classnames";

export interface WordInfoProps {
  word: string;
  isFound: boolean;
}

export const WordInfo: React.FC<WordInfoProps> = ({ word, isFound }) => {
  const [wordMetadata] = useAtom(wordsMetadataAtom);
  const wordInfo = wordMetadata?.get(word);

  return (
    <div className={classNames(styles.wordInfo, { [styles.isFound]: isFound })}>
      <div>{wordInfo?.definitions[0]}</div>
      {/* <div>parts of speech: {wordInfo?.partsOfSpeech}</div> */}
      {/* <div>frequency: {wordInfo?.frequency}</div> */}
    </div>
  );
};

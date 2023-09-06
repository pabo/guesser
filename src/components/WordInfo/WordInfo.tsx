import { useAtom } from "jotai";
import styles from "./WordInfo.module.css";
import { wordsMetadataAtom } from "../../store";

export interface WordInfoProps {
  word: string;
}

export const WordInfo: React.FC<WordInfoProps> = ({ word }) => {
  const [wordMetadata] = useAtom(wordsMetadataAtom);
  const wordInfo = wordMetadata?.get(word);

  return (
    <div className={styles.wordInfo}>
      <div>{wordInfo?.definitions[0]}</div>
      {/* <div>parts of speech: {wordInfo?.partsOfSpeech}</div> */}
      {/* <div>frequency: {wordInfo?.frequency}</div> */}
    </div>
  );
};

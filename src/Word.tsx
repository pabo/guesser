import { useAtom } from "jotai";
import { foundWordsAtom } from "./store";

type WordProps = {
  word: string;
};

export const Word: React.FC<WordProps> = ({ word }) => {
  const [foundWords] = useAtom(foundWordsAtom);
  const isFound = foundWords.includes(word);

  const placeholder = "xxxxxxx";

  return (
    <div className={`word ${isFound ? "" : "faded"}`}>
      {isFound ? word : placeholder}{" "}
    </div>
  );
};

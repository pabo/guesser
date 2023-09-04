import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { validWordsAtom, acceptLetterInput } from "../store";
import { Guess } from "./Guess";
import { Words } from "./Words";
import { Keyboard } from "./Keyboard";
import { Links } from "./Links";
import styles from "./App.module.css";

export const App = () => {
  const [validWords] = useAtom(validWordsAtom);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      className={styles.page}
      ref={ref}
      tabIndex={0}
      onKeyDown={(e) => {
        acceptLetterInput(e.key);
      }}
    >
      <Links />
      <div className={styles.main}>
        <div>Find as many words as you can that fit the pattern. Hi mom!</div>
        <Guess />
        <Words words={validWords} />
        <Keyboard />
      </div>
    </div>
  );
};

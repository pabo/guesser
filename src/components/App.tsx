import { Suspense, startTransition, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { validWordsAtom, acceptLetterInput } from "../store";
import { Guess } from "./Guess";
import { Words } from "./Words";
import { Keyboard } from "./Keyboard";
import { Links } from "./Links";
import styles from "./App.module.css";

export const App = () => {
  const [validWords] = useAtom(validWordsAtom, { delay: 0 });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    // suspense here means that every action that touches an async atom will cause a flash while we re-render?
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //TODO: blahhhhhhhhhhhhhhhhhhh
    //https://github.com/pmndrs/jotai/discussions/2003
    // useAtom(blahAtom, { delay: 0})

    <Suspense>
      <div
        className={styles.page}
        ref={ref}
        tabIndex={0}
        onKeyDown={(e) => {
          startTransition(() => {
            acceptLetterInput(e.key);
          });
        }}
      >
        <Links />
        <div className={styles.main}>
          <div>Find as many words as you can that fit the pattern. Hi mom!</div>
          <Guess />
          <Words words={validWords} />
          {/* <WordsMetadata /> */}
          <Keyboard />
        </div>
      </div>
    </Suspense>
  );
};

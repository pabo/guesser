import { Suspense, startTransition, useEffect, useRef } from "react";
import { acceptLetterInput } from "../stores/keyboard.store";
import { Guess } from "./Guess";
import { Words } from "./Words";
import { Keyboard } from "./Keyboard";
import { Links } from "./Links";
import styles from "./App.module.css";

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    // suspense here means that every action that touches an async atom will cause a flash while we re-render? Unless we do delay 0 or another workaround
    // useAtom(blahAtom, { delay: 0})
    // https://github.com/pmndrs/jotai/discussions/2003

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
        <div className={styles.main}>
          <div className={styles.top}>
            <Links />
            <div>
              Find as many words as you can that fit the pattern. Hi mom!
            </div>
            <Guess />
          </div>
          <Words />
          <Keyboard />
        </div>
      </div>
    </Suspense>
  );
};

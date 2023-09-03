import { useAtom } from "jotai";
import {
  validWordsAtom,
  dailySeedAtom,
  getCurrentDateString,
  acceptLetterInput,
} from "./store";
import { useEffect, useRef } from "react";
import { Guess } from "./Guess";
import { Word } from "./Word";
import { Keyboard } from "./Keyboard";
import { Links } from "./Links";

export const App = () => {
  const [validWords] = useAtom(validWordsAtom);
  const [dailySeed, setDailySeed] = useAtom(dailySeedAtom);

  // TODO: this is probably just for testing. Not sure if we want to blow away someone's daily puzzle at midnight?
  useEffect(() => {
    const handle = setInterval(() => {
      // checking for date change
      if (dailySeed !== getCurrentDateString()) {
        setDailySeed(getCurrentDateString());
      }
    }, 1000);

    return () => clearInterval(handle);
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      className="page"
      ref={ref}
      tabIndex={0}
      onKeyDown={(e) => {
        acceptLetterInput(e.key);
      }}
    >
      <Links />
      <div className="main">
        <div className="description">
          Find as many words as you can that fit the pattern. Hi mom!
        </div>
        <Guess />
        <div className="words">
          {validWords.map((word, index) => (
            <Word key={index} word={word} />
          ))}
        </div>
        <Keyboard />
      </div>
    </div>
  );
};

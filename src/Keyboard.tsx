import { useCallback } from "react";
import { useAtom } from "jotai";
import classNames from "classnames";
import throttle from "lodash/throttle";
import { acceptLetterInput, selectedKeyAtom } from "./store";

const keysTopRow = "QWERTYUIOP".split("");
const keysMiddleRow = " ASDFGHJKL ".split("");
const keysBottomRow = "ZXCVBNM".split("");

export const Keyboard = () => {
  const [selectedKey, setSelectedKey] = useAtom(selectedKeyAtom);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const key = target.getAttribute("data-key");
    setSelectedKey(key);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];

    const elementsAtPoint = document.elementsFromPoint(
      touch.pageX,
      touch.pageY
    );
    const keyElement = elementsAtPoint.find((el) =>
      el.hasAttribute("data-key")
    );

    const key = keyElement?.getAttribute("data-key") ?? null;

    setSelectedKey(key);
  };

  const throttledTouchMove = useCallback(throttle(handleTouchMove, 50), []);

  const handleTouchEnd = () => {
    if (selectedKey) {
      acceptLetterInput(selectedKey);
    }

    setSelectedKey(null);
  };

  const handleTouchCancel = () => {
    setSelectedKey(null);
  };

  return (
    <div
      className="keyboard"
      onTouchStart={handleTouchStart}
      onTouchMove={throttledTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <KeyboardRow keys={keysTopRow} position={"top"} />
      <KeyboardRow keys={keysMiddleRow} position={"middle"} />
      <KeyboardRow keys={keysBottomRow} position={"bottom"} />
    </div>
  );
};

type KeyboardRowProps = {
  keys: string[];
  position: string;
};

const KeyboardRow: React.FC<KeyboardRowProps> = ({ keys, position }) => {
  return (
    <div className={`flex row ${position}`}>
      {position === "bottom" && <Key value="ENTER" />}
      {keys.map((key, index) => (
        <Key key={index} value={key} />
      ))}
      {position === "bottom" && <Key value="DEL" />}
    </div>
  );
};

type KeyProps = {
  value: string;
};

const Key: React.FC<KeyProps> = ({ value }) => {
  const [selectedKey] = useAtom(selectedKeyAtom);
  return (
    <div
      data-key={value.toLowerCase()}
      className={classNames({
        key: true,
        "half-key": value === " ", // spacers in row 2
        "one-and-a-half-key": value.length !== 1, // enter and delete in row 3
        selected: selectedKey?.toLowerCase() === value.toLowerCase(),
      })}
      onClick={() => {
        acceptLetterInput(value.toLowerCase());
      }}
    >
      <div className="key-content">{value}</div>
    </div>
  );
};

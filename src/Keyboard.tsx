import { selectedKeyAtom } from "./store";
import { useAtom } from "jotai";
import classNames from "classnames";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import { useCallback } from "react";

// _.debounce( function, wait, immediate )

const keysTopRow = "QWERTYUIOP".split("");
const keysMiddleRow = " ASDFGHJKL ".split("");
const keysBottomRow = "ZXCVBNM".split("");

type KeyboardProps = {
  handleKeyInput: (eventLike: { key: string }) => void;
};

// Option A: useCallback() stores the debounced callback
/*
  const debouncedChangeHandler = useCallback(
    debounce(changeHandler, 300)
  , []);

  // Option B: useMemo() stores the debounced callback
  const debouncedEventHandler = useMemo(
    () => debounce(eventHandler, 300)
  , []);
  
  // ...
}
  */

export const Keyboard: React.FC<KeyboardProps> = ({ handleKeyInput }) => {
  const [selectedKey, setSelectedKey] = useAtom(selectedKeyAtom);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const key = target.getAttribute("data-key");
    setSelectedKey(key);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    console.log("touchmove");
    // stops scrolling
    // e.preventDefault();

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
    console.log("touch ending", selectedKey);
    // using the selectedKey, which was last set by a mousemove, could possibly be different
    // than where the touch ended?
    if (selectedKey) {
      handleKeyInput({ key: selectedKey });
    }

    setSelectedKey(null);
  };

  const handleTouchCancel = () => {
    setSelectedKey(null);
  };

  return (
    <div
      className="keyboard flex"
      onTouchStart={handleTouchStart}
      onTouchMove={throttledTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <KeyboardRow
        keys={keysTopRow}
        position={"top"}
        handleKeyInput={handleKeyInput}
      />
      <KeyboardRow
        keys={keysMiddleRow}
        position={"middle"}
        handleKeyInput={handleKeyInput}
      />
      <KeyboardRow
        keys={keysBottomRow}
        position={"bottom"}
        handleKeyInput={handleKeyInput}
      />
    </div>
  );
};

type KeyboardRowProps = {
  keys: string[];
  position: string;
  handleKeyInput: (eventLike: { key: string }) => void;
};

const KeyboardRow: React.FC<KeyboardRowProps> = ({
  keys,
  position,
  handleKeyInput,
}) => {
  return (
    <div className={`flex row ${position}`}>
      {position === "bottom" && (
        <Key value="ENTER" handleKeyInput={handleKeyInput} />
      )}
      {keys.map((key, index) => (
        <Key key={index} value={key} handleKeyInput={handleKeyInput} />
      ))}
      {position === "bottom" && (
        <Key
          value="DEL"
          handleKeyInput={() => handleKeyInput({ key: "Backspace" })}
        />
      )}
    </div>
  );
};

type KeyProps = {
  value: string;
  handleKeyInput: (eventLike: { key: string }) => void;
};

const Key: React.FC<KeyProps> = ({ value, handleKeyInput }) => {
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
        handleKeyInput({ key: value.toLowerCase() });
      }}
    >
      <div className="key-content">{value}</div>
    </div>
  );
};

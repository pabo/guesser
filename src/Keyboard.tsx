const keysTopRow = "QWERTYUIOP".split("");
const keysMiddleRow = " ASDFGHJKL ".split("");
const keysBottomRow = "ZXCVBNM".split("");

type KeyboardProps = {
  handleKeyInput: (eventLike: { key: string }) => void;
};

export const Keyboard: React.FC<KeyboardProps> = ({ handleKeyInput }) => {
  return (
    <div className="keyboard flex">
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
  return (
    <div
      className={`key ${value === " " ? "half-key" : ""} ${
        value.length !== 1 ? "one-and-a-half-key" : ""
      }`}
      onClick={() => {
        handleKeyInput({ key: value.toLowerCase() });
      }}
    >
      <div className="key-content">{value}</div>
    </div>
  );
};

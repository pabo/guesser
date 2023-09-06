// https://www.datamuse.com/api/


// This would have been an enum but enums dont support reverse mapping for strings
const partsOfSpeech: Record<string, string> = {
  noun: "n",
  n: "noun",
  verb: "v",
  v: "verb",
  adjective: "adj",
  adj: "adjective",
  adverb: "adv",
  adv: "adverb",
  unknown: "u",
  u: "unknown",
};

export type DataMuseWord = {
  word: string;
  score: number;
  tags: string[];
  defs: string[];
};

export const getDataMuseWords = async (pattern: (string | undefined)[]) => {
  if (!pattern) {
    return;
  }

  const patternString = pattern.map((x) => x || "?").join("");

  const wordsMetadata: DataMuseWord[] =
    (await fetch(
      `https://api.datamuse.com/words?sp=${patternString}&md=dpf&max=200`
    ).then((res) => res.json())) || [];

  return normalizeDataMuseWords(wordsMetadata);
};

export type WordWithMetadata = {
  word: string;
  score: number;
  partsOfSpeech: string[];
  definitions: string[];
  frequency: number;
};

export const normalizeDataMuseWords = (
  words: DataMuseWord[]
): Map<string, WordWithMetadata> => {
  console.log(words);
  return new Map(
    words
      // .filter((word) => !word.word.includes(" ")) // no multiple words
      // .filter((word) => !word.word.includes("-")) // no prefix or suffix
      // need a good way to filter words whose -only- meanings are proper nouns...
      // .filter((word) => !word.tags.includes("prop")) // no proper nouns
      .map((word) => [
        word.word,
        {
          word: word.word,
          score: word.score,
          definitions: word.defs,
          partsOfSpeech: word.tags
            .map((t) => partsOfSpeech[t])
            .filter((t) => t),
          frequency: parseFloat(
            word.tags.filter((tag) => tag[0] === "f")[0].split(":")[1]
          ),
        },
      ])
  );
  // .sort((a, b) => b.frequency - a.frequency);
};

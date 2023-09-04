# guesser

This is a game where you are given some letters of a 5 or 7 letter word and have to guess as many words as you can that fit the pattern. Idea from my mom!

## Live

You can play here: https://pabo.github.io/guesser/

## TODOs

- daily vs random
- repeat bug
- score?
- hints or definitions?

## Ideas

- mouse over xxxxx to get crossword clues of missing words
- pare down list of words according to onelook commonness score

## Changelog

- jotai store ftw, cleaned up logic
- reset found words on new day so that "you win" works
- word length button
- loading the wordlist in the main bundle, with no async atoms
- added "You win!"
- fixed double-input bug due to mousemove and click
- implemented on-screen keyboard
- added mobile view
- number of letters revealed decreases until there are less than 40 words to guess

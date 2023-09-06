# guesser

This is a game where you are given some letters of a 5 or 7 letter word and have to guess as many words as you can that fit the pattern. Idea from my mom!

## Live

You can play here: https://pabo.github.io/guesser/

## TODOs

- repeat bug

## Ideas

- daily vs random
- score?
- backend to lessen API calls, collect stats

## Changelog

- stores cleanup
- "give up" / reveal
- definitions
- pare down words according to ngrams score
- CSS modules, so much clean
- more cleaning
- jotai store ftw, cleaned up logic
- reset found words on new day so that "you win" works
- word length button
- loading the wordlist in the main bundle, with no async atoms
- added "You win!"
- fixed double-input bug due to mousemove and click
- implemented on-screen keyboard
- added mobile view
- number of letters revealed decreases until there are less than 40 words to guess

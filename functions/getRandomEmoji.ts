/**
 * Random emoji selection utilities for the Single Letters game
 */

const HAPPY_EMOJIS = [
  "😊", "😃", "😄", "🎉", "🌟", "✨", "🎊", "👍", "🌈", "💫",
  "🤩", "😁", "😸", "🥳", "🙌", "⭐", "💯", "🏆", "🎯", "✅",
];

const ANIMAL_EMOJIS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
];

const FRUIT_EMOJIS = [
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥝",
  "🍍", "🥥", "🥭", "🍐", "🍏", "🫐", "🍈", "🥑", "🌽", "🥕",
];

const SAD_EMOJIS = [
  "😢", "😞", "😔", "😟", "😕", "🙁", "☹️", "😥", "😰", "😿",
];

/**
 * Gets a random happy emoji (includes smileys, animals, and fruits)
 */
export function getRandomHappyEmoji(): string {
  const allHappyEmojis = [...HAPPY_EMOJIS, ...ANIMAL_EMOJIS, ...FRUIT_EMOJIS];
  const randomIndex = Math.floor(Math.random() * allHappyEmojis.length);
  return allHappyEmojis[randomIndex];
}

/**
 * Gets a random sad emoji
 */
export function getRandomSadEmoji(): string {
  const randomIndex = Math.floor(Math.random() * SAD_EMOJIS.length);
  return SAD_EMOJIS[randomIndex];
}

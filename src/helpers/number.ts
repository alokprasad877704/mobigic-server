export const generalRandomNumber = (digit: number): number => {
  let min = Math.pow(10, digit - 1);
  let max = Math.pow(10, digit) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

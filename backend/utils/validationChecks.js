export const checkIfNumberAndPositive = (number) => {
  if (!Number.isInteger(number) || number <= 0) {
    return false;
  }
  return true;
};

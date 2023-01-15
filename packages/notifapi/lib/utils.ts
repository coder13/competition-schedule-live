export const genCode = () => {
  const code = [0, 0, 0, 0, 0, 0]
    .map(() => Math.floor(Math.random() * 10))
    .join('');
  return code;
};

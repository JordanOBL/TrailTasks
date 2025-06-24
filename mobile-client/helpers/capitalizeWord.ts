const CapitalizeWord = (str: string): string => {
  const capital = str[0].toUpperCase();
  return capital + str.slice(1, str.length);
};

export default CapitalizeWord
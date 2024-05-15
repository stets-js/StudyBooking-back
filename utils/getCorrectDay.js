const getCorrectDay = day => {
  // need this func because Date().getDay() return index of weekDay starting from
  // sunday as 0 and monday as 1

  return day === 0 ? 6 : day - 1;
};
exports = getCorrectDay;

const randomNumberGenerator = function (length) {
  let str = '';
  const possible = '0123456789';
  // Random number generator to create OTP
  for (var i = 0; i < length; i++) {
    str += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return str;
};

const setTimeFactory = function (timeStamp, extendTo, extendedBy) {
  switch (extendedBy) {
    case 'm':
      return new Date(timeStamp.setTime(timeStamp.getTime() + extendTo * 60 * 1000)).toISOString();
    case 'h':
      return new Date(timeStamp.setTime(timeStamp.getTime() + extendTo * 60 * 60 * 1000)).toISOString();
    case 'd':
      return new Date(timeStamp.setTime(timeStamp.getTime() + extendTo * 24 * 60 * 60 * 1000)).toISOString();
    default:
      return new Date(timeStamp.setTime(timeStamp.getTime() + 2 * 24 * 60 * 60 * 1000)).toISOString();
  }
};

module.exports = { randomNumberGenerator, setTimeFactory };

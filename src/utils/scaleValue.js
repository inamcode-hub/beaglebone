function scaleValue(reg, rawValue) {
  return reg ? reg.scale(rawValue) : undefined;
}

module.exports = scaleValue;

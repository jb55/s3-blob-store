// Source: https://gist.github.com/Ely-S/4191458
module.exports = function(obj) {
  var clone = {};
  for (var i in obj)
    clone[i] =
      obj[i] && typeof obj[i] == 'object'
        ? x(obj[i].constructor(), obj[i])
        : obj[i];
  return clone;
};

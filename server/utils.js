function isURL(str) {
  const regex = /^(?:http(s)?:\/\/)(([\w.-]+(?:\.[\w\.-]+)+)|(localhost))(:[\d]+)?$/;
  return !!str.match(regex);
}

function isGithubURL(str) {
  const regex = /^https:\/\/github.com\/[\w\/]+$/;
  return !!str.match(regex);
}

function isAddr(str) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return !!str.match(regex);
}

function shallowPick(obj, requiredProps, optionalProps) {
  // throws if a required prop is missing
  const ret = {};
  for (const prop of requiredProps) {
    if (obj[prop] === undefined) {
      throw new Error("required prop missing");
    }
    ret[prop] = obj[prop];
  }
  for (const prop of optionalProps) {
    if (obj[prop] !== undefined) {
      ret[prop] = obj[prop];
    }
  }
  return ret;
}

module.exports = { isURL, isGithubURL, isAddr, shallowPick };

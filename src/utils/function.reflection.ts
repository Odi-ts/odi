const COMMENTS_REG = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENTS_REG = /([^\s,]+)/g;

export function fnArgsList(fn: Function): any[]{
  let cleared = fn.toString().replace(COMMENTS_REG, '');

  return  cleared.substring(cleared.indexOf('(')+1, cleared.indexOf(')')).match(ARGUMENTS_REG) || [];
}
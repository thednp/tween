let _nowFunc = () => performance.now();

export const now = (): number => {
  return _nowFunc();
};

export function setNow(nowFunction: typeof _nowFunc) {
  _nowFunc = nowFunction;
}

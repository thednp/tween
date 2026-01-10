let _nowFunc = () => performance.now();

const now = (): number => {
  return _nowFunc();
};

export function setNow(nowFunction: typeof _nowFunc) {
  _nowFunc = nowFunction;
}

export default now;

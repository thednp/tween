// Tween.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tween, Easing, type EasingFunction } from '../src';

describe('Easing', () => {
  let target: { x: number; opacity: number };
  const EasingEntries = Object.entries(Easing).reduce((acc, [groupName, groupValue]) => {
    // Handle the special case of pow (function that returns a group)
    // if (typeof groupValue === 'function') {
    //   // You can either skip pow (since it's a factory), or generate examples
    //   // For simplicity, we'll skip it — add custom handling if needed
    //   return acc;
    // }
    
    // we skip pow, we do it separately
    if (groupName === 'pow') {
      // acc.push([groupName, groupValue as never]);
    // For regular groups (Linear, Quadratic, Cubic, etc.)
    } else if (groupValue && typeof groupValue === 'object') {
      Object.entries(groupValue).forEach(([variant, fn]) => {
        const fullName = variant === 'None' && groupName === 'Linear'
          ? 'Linear.None'                           // special case for Linear.None
          : `${groupName}.${variant}`;              // Quadratic.In, Bounce.Out, etc.
  
        acc.push([fullName, fn as never]);
      });
    }
  
    return acc;
  }, [] as [string, typeof Easing["Linear"]["None"]][]);

  beforeEach(() => {
    target = { x: 0, opacity: 1 };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

    // pow easing functions
    const powEasingFunctions: [string, EasingFunction][] = [
      ["pow(0).In", Easing.pow(0).In],
      ["pow(0).Out", Easing.pow(0).Out],
      ["pow(0).InOut", Easing.pow(0).InOut],

      ["pow(1).In", Easing.pow(1).In],
      ["pow(1).Out", Easing.pow(1).Out],
      ["pow(1).InOut", Easing.pow(1).InOut],

      ["pow(2).In", Easing.pow(2).In],
      ["pow(2).Out", Easing.pow(2).Out],
      ["pow(2).InOut", Easing.pow(2).InOut],

      ["pow(3).In", Easing.pow(3).In],
      ["pow(3).Out", Easing.pow(3).Out],
      ["pow(3).InOut", Easing.pow(3).InOut],

      ["default pow().In", Easing.pow().In],
      ["default pow().Out", Easing.pow().Out],
      ["default pow().InOut", Easing.pow().InOut],

      ["pow(10001).In", Easing.pow(10001).In], // outlier
      ["pow(10001).Out", Easing.pow(10001).Out], // outlier
      ["pow(10001).InOut", Easing.pow(10001).InOut], // outlier
    ]

  // all easing functions except pow
  for (const [easingName, easingFn] of EasingEntries.concat(powEasingFunctions)) {
    it('should work with Easing.' + easingName, () => {
      const tween = new Tween(target).to({ x: 100 }).easing(easingFn).duration(0.5).start();

      tween.update();
      vi.advanceTimersByTime(100);
      tween.update();
      // additional coverage
      vi.advanceTimersByTime(100);
      tween.update();
      vi.advanceTimersByTime(100);
      tween.update();
      vi.advanceTimersByTime(100);
      tween.update();
      vi.advanceTimersByTime(100);
      tween.update();
      vi.advanceTimersByTime(100);
      // console.log(target.x)
      expect(target.x).not.eq(0);
    });
  }




});

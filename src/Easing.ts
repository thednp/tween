// Easing.ts
import type { EasingFunction, EasingFunctionGroup } from "./types.ts";

/**
 * A frozen collection of preset easing functions, grouped by name
 * (`Linear`, `Quadratic`, `Cubic`, `Quartic`, `Quintic`, `Sinusoidal`,
 * `Exponential`, `Circular`, `Elastic`, `Back`, `Bounce`), each exposing
 * `In`, `Out` and `InOut` variants. Use with `.easing()`.
 *
 * @example
 * ```ts
 * const tween = new Tween({ x: 0 }).to({ x: 300 }).easing(Easing.Elastic.Out);
 * ```
 */
export const Easing: {
  Linear: EasingFunctionGroup & { None: EasingFunction };
  Quadratic: EasingFunctionGroup;
  Cubic: EasingFunctionGroup;
  Quartic: EasingFunctionGroup;
  Quintic: EasingFunctionGroup;
  Sinusoidal: EasingFunctionGroup;
  Exponential: EasingFunctionGroup;
  Circular: EasingFunctionGroup;
  Elastic: EasingFunctionGroup;
  Back: EasingFunctionGroup;
  Bounce: EasingFunctionGroup;
  pow(power?: number): EasingFunctionGroup;
} = Object.freeze({
  /**
   * Linear easing functions, including a `None` variant that returns the input unchanged.
   */
  Linear: Object.freeze<EasingFunctionGroup & { None: EasingFunction }>({
    None(amount: number): number {
      return amount;
    },
    In(amount: number): number {
      return amount;
    },
    Out(amount: number): number {
      return amount;
    },
    InOut(amount: number): number {
      return amount;
    },
  }),

  /**
   * Quadratic easing functions (power of 2).
   */
  Quadratic: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return amount * amount;
    },
    Out(amount: number): number {
      return amount * (2 - amount);
    },
    InOut(amount: number): number {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount;
      }

      return -0.5 * (--amount * (amount - 2) - 1);
    },
  }),

  /**
   * Cubic easing functions (power of 3).
   */
  Cubic: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return amount * amount * amount;
    },
    Out(amount: number): number {
      return --amount * amount * amount + 1;
    },
    InOut(amount: number): number {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount;
      }
      return 0.5 * ((amount -= 2) * amount * amount + 2);
    },
  }),

  /**
   * Quartic easing functions (power of 4).
   */
  Quartic: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return amount * amount * amount * amount;
    },
    Out(amount: number): number {
      return 1 - --amount * amount * amount * amount;
    },
    InOut(amount: number): number {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount * amount;
      }

      return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
    },
  }),

  /**
   * Quintic easing functions (power of 5).
   */
  Quintic: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return amount * amount * amount * amount * amount;
    },
    Out(amount: number): number {
      return --amount * amount * amount * amount * amount + 1;
    },
    InOut(amount: number): number {
      if ((amount *= 2) < 1) {
        return 0.5 * amount * amount * amount * amount * amount;
      }

      return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
    },
  }),

  /**
   * Sinusoidal easing functions based on the sine curve.
   */
  Sinusoidal: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return 1 - Math.sin(((1.0 - amount) * Math.PI) / 2);
    },
    Out(amount: number): number {
      return Math.sin((amount * Math.PI) / 2);
    },
    InOut(amount: number): number {
      return 0.5 * (1 - Math.sin(Math.PI * (0.5 - amount)));
    },
  }),

  /**
   * Exponential easing functions based on powers of 2.
   */
  Exponential: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return amount === 0 ? 0 : Math.pow(1024, amount - 1);
    },
    Out(amount: number): number {
      return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
    },
    InOut(amount: number): number {
      if (amount === 0) {
        return 0;
      }

      if (amount === 1) {
        return 1;
      }

      if ((amount *= 2) < 1) {
        return 0.5 * Math.pow(1024, amount - 1);
      }

      return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
    },
  }),

  /**
   * Circular easing functions based on the quarter circle.
   */
  Circular: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return 1 - Math.sqrt(1 - amount * amount);
    },
    Out(amount: number): number {
      return Math.sqrt(1 - --amount * amount);
    },
    InOut(amount: number): number {
      if ((amount *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
    },
  }),

  /**
   * Elastic easing functions with an oscillating spring-like effect.
   */
  Elastic: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      if (amount === 0) {
        return 0;
      }

      if (amount === 1) {
        return 1;
      }

      return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
    },
    Out(amount: number): number {
      if (amount === 0) {
        return 0;
      }

      if (amount === 1) {
        return 1;
      }
      return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
    },
    InOut(amount: number): number {
      if (amount === 0) {
        return 0;
      }

      if (amount === 1) {
        return 1;
      }

      amount *= 2;

      if (amount < 1) {
        return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
      }

      return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
    },
  }),

  /**
   * Back easing functions that overshoot the target before settling.
   */
  Back: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      const s = 1.70158;
      return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s);
    },
    Out(amount: number): number {
      const s = 1.70158;
      return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
    },
    InOut(amount: number): number {
      const s = 1.70158 * 1.525;
      if ((amount *= 2) < 1) {
        return 0.5 * (amount * amount * ((s + 1) * amount - s));
      }
      return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
    },
  }),

  /**
   * Bounce easing functions that simulate a bouncing ball.
   */
  Bounce: Object.freeze(<EasingFunctionGroup>{
    In(amount: number): number {
      return 1 - Easing.Bounce.Out(1 - amount);
    },
    Out(amount: number): number {
      if (amount < 1 / 2.75) {
        return 7.5625 * amount * amount;
      } else if (amount < 2 / 2.75) {
        return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
      } else if (amount < 2.5 / 2.75) {
        return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
      } else {
        return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
      }
    },
    InOut(amount: number): number {
      if (amount < 0.5) {
        return Easing.Bounce.In(amount * 2) * 0.5;
      }
      return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
    },
  }),

  /**
   * Creates a new group of easing functions with the given power.
   * @param power - The exponent used by the easing functions, clamped to `[Number.EPSILON, 10000]`
   * @returns An `EasingFunctionGroup` with `In`, `Out` and `InOut` variants
   */
  pow(power = 4): EasingFunctionGroup {
    power = power < Number.EPSILON ? Number.EPSILON : power;
    power = power > 10000 ? 10000 : power;
    return {
      In(amount: number): number {
        return amount ** power;
      },
      Out(amount: number): number {
        return 1 - (1 - amount) ** power;
      },
      InOut(amount: number): number {
        if (amount < 0.5) {
          return (amount * 2) ** power / 2;
        }
        return (1 - (2 - amount * 2) ** power) / 2 + 0.5;
      },
    };
  },
});

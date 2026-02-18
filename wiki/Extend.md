## Extend @thednp/tween

**@thednp/tween** supports only **number**s by default for maximum performance and simplicity, where the original [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js) goes to support unlimited nested objects.  

To interpolate other types (quaternions / tupples / arrays, SVG paths, transforms, objects, etc.), you **explicitly register** custom interpolation and validation functions for any property using `tween.use()` / `timeline.use()`.

**Why this is important**:
- we don't **guess** what kind of values we have, how to interpolate them, we explicitly specify
- this is the **only** way to provide predictability: if values aren't numbers, specify how to validate and interpolate and for which property
- this is the **best** way to make sure your app / page never breaks because animation update loops
- this is the **best** way to avoid leaks and keep performance in check

As a general rule, we can only use extensions for **root** properties of the target object, and never as nested object properties. While in theory this might work, we cannot guarantee a safe and consistent outcome.


### TypeScript Definitions

The definitions are fairly open in the sense that you can extend even further:

```ts
type BaseTweenProps = Record<string, number>;
type CubicValues = [number, number, number, number, number, number];
type QuadValues = [number, number, number, number];
type LineValues = [number, number];
type Vec3 = [number, number?, number?];
type ArrayVal = number[] | [string, ...number[]][];

// You have plenty of room to extend to your needs
type TweenProps = Record<
  string,                       // property name
  number                        // number value
  | ArrayVal                    // a generic array value
  | BaseTweenProps              // single level nested object
  | [                           // MorphPathArray | TransformArray
    string,
    ...(CubicValues | LineValues | QuadValues | Vec3), 
  ][]
>;


// how Tween / Timeline generics look like
class Tween<T extends TweenProps> {}
```
> **NOTE**: as you can see we're pretty biased towards tupples (arrays), since they're superior in terms of performance.


### Basic Example

Let's assume you want to support a specific structure:

1) First you specify the type:

```ts
type YourType = { x: number, y: number } // a plain one level nested object
```

2) Next you define and configure your tween object:
```ts
// initialize Tween, at this stage YourType is not supported
const tween = new Tween({ myProp: { x: 0, y: 0 } });

// the extension will validate the initial values once .use() is called
tween.use("myProp", {
  interpolate: (start: YourType, end: YourType, progress: number) => { /* lerp logic */ },
  validate: (propName: string, value: unknown, ref?: YourType) => [boolean, string?]
});

// other to() / from() calls will validate YourType and check compatibility with 
// validated initial values
tween.to({ myProp: { x: 150, y: 150 } });
```

3) At any point during or after configuration, you can check your tween validity:
```ts
// now all values are valid, we can check
tween.isValidState    // => true (initial values are validated by all validators)
tween.isValid         // => true (no errors remaining)
```

4) If you like what you see, all vallues are validated as compatible for interpolation, start whenever needed:

```ts
// we can start the tween
tween.start();
```

> **NOTE**: If initial validation fails, the validation function should usually provide feedback on how to solve the issues.

The package has a series [built-in extensions](#built-in-extensions) that follow the same pattern:
* *interpolate* function — computes the value at `progress` value (the eased value in 0-1 range)
* *validate* function — runs at config time (`constructor(initialValues)`, `.to(endValues)`, `.from(startValues)`) to catch errors early

The interpolator returns the exact same type of value:
```ts
const interpolate = (start: YourType, end: YourType, progress: number): YourType
```

The validator works like this:
```ts
const validate = (propName: string, value: unknown, reference?: YourType) => {
    // STEP 1 - make sure `value` is valid as YourType
    //  - numbers must be `number` in all YourType structure
    //  - strings / object keys must be correct according to YourType
    //  - if no `reference` provided return a tuple [result: boolean, reason?: "Why it failed"]
    // STEP 2 - make sure `value` is compatible with your `reference`
    //  - check array length / object keys length
    //  - check specific values within structure to make sure `value` - `reference` interpolatation compatibility
    //  - return a tuple [result: boolean, reason?: "Why values didn't match"]
}
```

> **Important**: Call `.use()` before `.to()` / `.from()` to validate initial values first. Validation happens only at configuration time — no cost during animation. Warnings (if any remain) appear only when calling `tween.start()` / `timeline.play()`.


## Built-in Extensions

The built-in extensions allow you to tween structured values. Let's say you may have a special need to validate numbers in a more specific or strict way like having a minimum of 0 and a maximum of 255 for RGB colors for instance.

### Array of Numbers

For properties like quaternions `[x,y,z,t]`, RGB `[r,g,b]`, vectors `[x,y,z]`, etc. For your reference, check the [extend/array.ts](https://github.com/thednp/tween/tree/master/src/extend/array.ts) extension source code.

> **NOTE**: not to be confused with [Array Interpolation](https://tweenjs.github.io/tween.js/examples/06_array_interpolation.html) from the original Tween.js.

The **arrayConfig** extension consists of:
- *interpolate*: linear interpolation (lerp) per array element
- *validate*: checks all values are numbers and array length matches reference

#### Example
```ts
import { Tween, arrayConfig } from "@thednp/tween";

// initialize and configure Tween
const tween = new Tween({ rgb: [255, 0, 0] }) // initial values aren't validated yet
    .use("rgb", arrayConfig)                  // now initial values are valid
    .to({ rgb: [255, 128, 0] });              // to()/from() are compared to the initial values reference

// consume the rgb value
tween.onUpdate(obj => {
  targetElement.style.setProperty("background-color", `rgb(${obj.rgb})`)
})
```


### SVG Paths

This extension is for morphing SVG paths and comes with an additional utility to convert `PathArray` values to string.

The **pathArrayConfig** extension consists of:
* *interpolate*: lerps segment coordinates (if not "Z" segment)
* *validate*: checks valid commands, parameter counts, structure match for interpolation compatibility

The included **pathToString** utility converts the `PathArray` value to a valid HTML `description` (d) attribute string.

#### What is PathArray

First let's look into what is a `PathArray`: it's an array of segments / tuples with the following specification:
* `M`/`m` - the *MoveTo* segment: `["M", number, number]`,
* `C`/`c` - the *CubicBezierTo* segment" `["C", number, number, number, number, number, number]`,
* `S`/`s` - the *CubicBezierTo* **shorthand** segment: `["S", number, number, number, number]`,
* `Q`/`q` - the *QuadraticBezierTo* segment: `["Q", number, number, number, number]`,
* `T`/`t` - the *QuadraticBezierTo* **shorthand** segment: `["T", number, number]`,
* `L`/`l` - the *LineTo* segment: `["L", number, number]`
* `Z`/`z` - the *ClosePath* segment: `["Z"]`.

Then `MorphPathArray` is comprised of only M, C, L, Z path segments, especially *CubicBezierTo* and *LineTo* segments are ideal for processing and interpolation.

```ts
export type LineValues = [number, number];
export type CubeValues = [number, number, number, number, number, number];

export type MorphPathSegment =
  | ["M" | "L", ...LineValues]
  | ["C", ...CubeValues]
  | ["Z"];

export type MorphPathArray = MorphPathSegment[];
```


#### Example
```ts
import { Tween, pathArrayConfig, pathToString } from "@thednp/tween";

const initialValue = {
  path: [
    ["M", 0, 0],
    ["L",50,50],
    ["L", 0,50],
    ["Z"]
  ]
}

const target = document.getElementById("my-target");
const tween = new Tween(initialValue);
tween.use("path", pathArrayConfig);
tween.to({
  path: [
    ["M",50, 0],
    ["L",50,50],
    ["L", 0,50],
    ["Z"]
  ]
});

// specify how to use the interpolated PathArray value
tween.onUpdate(obj =>
  // manipulate the DOM directly
  target.setAttribute("d", pathToString(obj.path))
)
```



> **NOTE**: Both paths must have identical structure (same number/order of segments and commands). Complex morphs may need preprocessing (e.g. Flubber).

**Notes**
* The example provides ready-made `PathArray` objects, they usually require prior preparation manually or using some script to [equalize segments](https://minus-ze.ro/posts/morphing-arbitrary-paths-in-svg/);
* Continuous `path` updates between multiple shapes requires that **all** path values are compatible, which means they all have same amount of segments and all segments are of the same type (ideal are `[[M, x, y], ...[L, x, y]], ` OR `[[M, x, y], ...[C, cx1, cy1, cx2, cy2, x, y]], `);
* Our [svg-path-commander](https://github.com/thednp/svg-path-commander/) provides all the tools necessary to process path strings, optimize and even equalize segments (work in progress).

Future versions will provide an easy to use `equalizeSegments` and `equalizePaths` utilities you can use to quickly process and prepare various path shapes for interpolation.


### Transform

This extension is for CSS3/WebGL transforms with complex and multiple steps 2D/3D transform functions.

```ts
import { Tween, transformConfig, transformToString } from "@thednp/tween";

const target = document.getElementById("my-target")
const tween = new Tween({
  transform: [
    ["translate", 0, 0],
    ["rotate", 0],
    ["scale", 1, 1],
    ["skewX", 0],
    ["translate", 0, 0] // SVG origin trick
  ]
})
tween.use("transform", transformConfig);
tween.to({
  transform: [
    ["translate", 300, 100],
    ["rotate", 45],
    ["scale", 1.5, 1.5],
    ["skewX", 30],
    ["translate", -150, -50] // SVG origin trick
  ]
});

tween.onUpdate(state => {
  Object.assign(
    target.style,
    transform: transformToString(state.transform) // helper included
  )
});
```

**transformConfig** consists of:
* `interpolate` — lerps each component in order
* `validate`: checks transform function names, lengths/parameters counts, structure match with reference

Interpolator returns same `TransformArray` structure — convert to string with `transformToString`.

**TIPS**
-  Supports multiple same commands (e.g. translate → rotate → translate-back), you can use only 2D transforms to apply to SVG elements `transform` property, but you must use `transformToString(state.transform, true)` (when second parameter is true, the returned string is a `matrix(...)` / `matrix3d(...)`).
- The included `transformToString` with or without the second parameter may differ in visual presentation when rotations are used, that is because the resulting transform string uses `rotateX(angle)`, `rotateY(angle)` and `rotateZ(angle)` (they are separate transform steps) while the resulting matrix string applies all rotations in a single `matrix.rotate(x,y,z)` operation; to solve this you can make use of the included `eulerToAxisAngle` utility to convert the `["rotate", x,y,z]` transform step to `["rotateAxisAngle", x,y,z,angle]`; with this conversion, your `transformToString(array)` and `transformToString(array, true)` will look visually identical and have the exact same computed style.

> **NOTE** - the `transformToString(array, true)` (returning a `matrix()` or `matrix3d()` string) is a little more expensive than a regular transform string as it uses the native `DOMMatrix` instance that multiplies with a new matrix for every transform step. The performance caracteristics are different in many ways (regular transform string involves dynamic string concatenation, DOMMatrix does all computation and string concatenation internally), however the impact is negligible for a small number of tweens.



### Single-Level Nested Objects

For simple nested properties like transforms (Eg. `{ translate: { x: 0, y: 0 } }`). We don't recommend using objects but if it's a must for your project, you can do that too. Example:

```ts
import { Tween, objectConfig } from "@thednp/tween";

const tween = new Tween({
  transform: {
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
  });

tween.use("transform", objectConfig);
tween.to({
  transform: {
    rotateX: 15,
    rotateY: 25,
    translateX: 100,
    translateY: 100,
  }
});
```

**objectConfig** consists of:
- *interpolate*: lerps inner numbers only
- *validate*: checks single-level nesting, inner values are numbers, object keys match

**NOTE**: Deeper nesting objects are blocked.

If initial validation fails, the validation function should provide feedback on how to solve the issues, for instance:

* On intialization, if extension is not registered via `use()`
  ```
  [Tween] failed validation:
  - Property "translate" of type "object" is not supported yet.
  ```

* If initial values are valid calling `to()` / `from()` with invalid values you should get this:
  ```
  [Tween] failed validation:
  - Property "x" from "translate" is not a number.
  - Property "z" from "translate" does not exist in the reference object.
  - Property "y" from "translate" is null/undefined.
  ```


#### Nested Objects & Flattening

**@thednp/tween** does **not** support deep nested objects.

**Why not?** Deep nested merging adds measurable overhead in the hot update path (every frame) and makes updating your application state more dificult. We prioritize raw speed and simplicity. Both the `Tween` and `Timeline` constructors will prevent you from using them.

Instead, why not flatten your objects:

```ts
// Helper to flatten nested objects (one-time cost)
// Ideal at a preparation phase
type FlatObject = Record<string, number>
type DeepObject = Record<
  string,
  number | FlatObject
>;

function flatten<T extends DeepObject>(obj: T, prefix = ""): FlatObject {
  if (!(obj !== undefined && typeof obj === "object" &&
  Object.getPrototypeOf(obj) === Object.prototype)) {
    console.warn("'obj' is not a plain object");
    return {};
  }
  const result = {};
  const keys = Object.keys(obj) as (keyof T)[];
  let i = 0;
  const len = keys.length;

  while (i < len) {
    const key = String(keys[i++]);
    const value = obj[key];
    const fullKey = (prefix ? `${prefix}.${key}` : String(key));

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result as FlatObject;
}

// Usage
const nested = { scale: { x: 0, y: 0 }, rotate: 0 };
const to = { scale: { x: 100, y: 150 }, rotate: 45 };

// this is your initialValues/state
const initialValues = flatten(nested); // → { "scale.x": 1, "scale.y": 1, "rotate": 0 }
// this is your end values
const endValues = flatten(to); // → { "scale.x": 100, "scale.y": 150, "rotate": 45 }

const tween = new Tween(initialValues)
  .to(endValues)
  .duration(1.5)
  .start();

// Or in hooks:
const [state, tween] = useTween(initialValues);

tween.to(endValues)
```

#### Extend Further
Want colors, quaternions, matrices, audio params, shaders? Just write your own interpolator + validator and register with `.use()`.

How about an optimized extension for RGB(a) tuples that:
* reuses the `arrayConfig` extension
* validates values properly (3 values in 0-255 range, alpha value in 0-1 range)

```ts
// app/src/animations/rgb.ts
import {
  isNumber
  interpolateArray,
  validateArray
  type InterpolatorFunction,
  type ValidationResultEntry, 
} from "@thednp/tween";

/**
 * RGB(A) Validation (extends array validation)
 */ 
export const validateRgb = <T extends number[]>(
  propName: string,
  target: unknown,
  ref?: T,
): ValidationResultEntry => {
  // 1. Reuse basic array checks
  const [isValid, reason] = validateArray(propName, target, ref);
  if (!isValid) return [false, reason];

  const arr = target as number[];

  // 2. Must have 3 or 4 values
  if (arr.length !== 3 && arr.length !== 4) {
    return [
      false,
      `Property "${propName}" must be an RGB [r,g,b] or RGBA [r,g,b,a] array (3 or 4 numbers).`,
    ];
  }

  // 3. RGB values: 0–255 (integers or floats allowed, but usually ints)
  for (let i = 0; i < 3; i++) {
    const v = arr[i];
    if (!isNumber(v) || v < 0 || v > 255) {
      return [
        false,
        `RGB component #${i + 1} in "${propName}" must be a number between 0 and 255.`,
      ];
    }
  }

  // 4. Optional alpha: 0–1
  if (arr.length === 4) {
    const a = arr[3];
    if (!isNumber(a) || a < 0 || a > 1) {
      return [
        false,
        `Alpha channel in "${propName}" must be a number between 0 and 1.`,
      ];
    }
  }

  return [true];
};

/**
 * Ready-to-use config for tween.use("rgb", rgbConfig)
 */ 
export const rgbConfig = {
  interpolate: interpolateArray,
  validate: validateRgb,
};
```

Use your extension right away:

```ts
// app/src/App.js
import { Tween, Easing } from "@thednp/tween";
import { rgbConfig } from "./animations/rgb.ts";

const tween = new Tween({ rgb: [0,156,0] })
  .use("rgb", rgbConfig)
  .easing(Easing.Quadratic.Out)
  .to({ rgb: [255,0,0]})
  .onUpdate(state =>
    Object.assign(target.style, { color: `rgb(${state.rgb})` })
  );

tween.start();
```

😊 Happy tweening!
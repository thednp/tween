## Ministore

Each supported UI framework (React, SolidJS, Preact, Svelte, Vue) make use of a highly specialized `miniStore` to hold tween values and update your UI. The `miniStore` makes it possible for both `Tween` and `Timeline` to mutate and trigger DOM updates/effects in most efficient way possible: no object/array re-allocation, no un-necessary object look-ups, just pure linear interpolation.

If we were to use the [SolidJS store](https://docs.solidjs.com/concepts/stores) for instance, this would lead to un-necessary memory usage for complex tween values (path, transform, quaternions) and an overload of effects to execute. The same goes for Svelte `$state` rune or other similar from signal based UI frameworks.

In most cases your UI framework will consume the store root properties, except for deeper objects, a case where your UI framework will consume the properties of the nested object.

### General Information

The usage of hooks/primitives/composables is similar for each framework, only React and Preact require that you wrap your tweeen/timeline configuration in `useEffect` (because their VDOM rendering engine).

Let's dig deeper in the SolidJS `miniStore` (all supported frameworks have a similar implementation):
```ts
import type { TransformStep, MorphPathSegment } from "@thednp/tween";
import { objectConfig, pathArrayConfig, arrayConfig, transformConfig } from "@thednp/tween";
import { createTween } from "@thednp/tween/solid";

type MyTweenProps = {
  x: number,
  deep: { r: number, g: number, b: number },
  rgb: [number, number, number],
  path: MorphPathSegment[],
  transform: TransformStep[]
}

const initialValues: MyTweenProps = {
  x: 0,
  deep: { r: 220, g: 0, b: 0 },
  rgb: [0, 0, 0],
  path: [["M", 0, 0], ["L", 150, 0]],
  transform: [["rotate", 15, 45], ["translate", 15, 20]]
}

// call the createTween primitive 
const [store, tween] = createTween(initialValues);

// configure tween
tween
  // add extensions
  .use("rgb", arrayConfig)
  .use("deep", objectConfig)
  .use("transform", transformConfig)
  .use("path", pathArrayConfig)
  // use to() and from() to add tween values
  // use start() anytime to start updating values

```
> **NOTE** - extensions are required to validate the `initialValues` object.


### Store Structure

Now let's break down the store structure for the given `initialValues`:

```
// number property
x: { get, set }     // interpolate function updates this value
```
* **store.x** property is a proxy that interpolation function updates and your UI consumes.


```
// one level nested object
deep: {
  r: { get, set }   // interpolate function updates these values
  g: { get, set }
  b: { get, set }
}
```
**store.deep** property is an object with each property as a proxy that interpolation function updates its values; your UI consumes the `store.deep.r`, `store.deep.g` and `store.deep.b`, without triggering an update for the parent `store.deep` object.


```
// array of numbers
rgb: [
  { get, set }      // interpolate function updates these values
  { get, set }
  { get, set }
]
```
**store.rgb** property is an array of proxy elements that interpolation function updates its values directly; your UI consumes the `store.rgb` property and for the entire array only a single update effect is executed, neat?


```
// array of path segments
path: [
  [
    { get, set }      // M/C/L/Z path command string remains unchanged
    { get, set }      // interpolate function updates only numeric values
    { get, set }
  ]
  // ..rest of the path segments
]
```
**store.path** property is an array proxy that interpolation function updates the numeric values of its elements (path segment parameters); your UI consumes the `store.path` and for the entire path array only a single update effect is executed.


```
// array of transform steps
transform: [
  [
    { get, set }      // "translate" | "rotate" | "scale" strings remain unchanged
    { get, set }      // interpolate function updates only numeric values
    { get, set }
  ] 
  // .. other transform steps
]
```
**store.transform** property is an array proxy that interpolation function updates the numeric values of its elements (transform step with translate lengths / rotation angles); your UI consumes the `store.transform` and for the entire array only a single update effect is executed.


### Framework Specifics

* React and Preact require that you wrap your tween/timeline configuration in `useEffect()`, this is to make sure we keep configuration in sync with the state of the VDOM.
* While Preact supports signals via the `@preact/signals` library, we still cannot commit to signals exclusivelly; that is because other state can trigger re-rendering and will mess with the configuration; (we do have a signals only implementation, on popular demand we can publish it as well).
* Our `miniStore` for Svelte makes use of `$state.raw` (a single piece of reactive state, without nesting), this is to make sure we eliminate GC presure and effects execution overload.
* In the same fashion, our `miniStore` for SolidJS uses `createSignal()` instead of `createStore()`.
* In the case of Vue, we make use of its signal based `ref()` which is equivalent to `signal()` from `@preact/signals`.

😊 Happy tweening!

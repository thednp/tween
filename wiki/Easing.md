## Easing

### Available `Easing` functions

There are a few existing easing functions provided with *@thednp/tween*. They are grouped by the type of equation they represent: Linear, Quadratic, Cubic, Quartic, Quintic, Sinusoidal, Exponential, Circular, Elastic, Back and Bounce, and then by the easing type: In, Out and InOut.

Here's a complete list:

* `Easing.Linear.None` (default)
* `Easing.Quadratic.In` / `Easing.Quadratic.Out` / `Easing.Quadratic.InOut`
* `Easing.Cubic.In` / `Easing.Cubic.Out` / `Easing.Cubic.InOut`
* `Easing.Quartic.In` / `Easing.Quartic.Out` / `Easing.Quartic.InOut`
* `Easing.Quintic.In` / `Easing.Quintic.Out` / `Easing.Quintic.InOut`
* `Easing.Sinusoidal.In` / `Easing.Sinusoidal.Out` / `Easing.Sinusoidal.InOut`
* `Easing.Exponential.In` / `Easing.Exponential.Out` / `Easing.Exponential.InOut`
* `Easing.Circular.In` / `Easing.Circular.Out` / `Easing.Circular.InOut`
* `Easing.Elastic.In` / `Easing.Elastic.Out` / `Easing.Elastic.InOut`
* `Easing.Back.In` / `Easing.Back.Out` / `Easing.Back.InOut`
* `Easing.Bounce.In` / `Easing.Bounce.Out` / `Easing.Bounce.InOut`
* `Easing.pow` - allows for creation of custom easing functions

Probably the names won't be saying anything to you unless you're familiar with these concepts already, so it is probably the time to check the [Graphs](https://github.com/tweenjs/tween.js/blob/main/examples/03_graphs.html) example, which graphs all the curves in one page so you can compare how they look at a glance.

`Easing` also has a function called `pow()`. This function generates easing functions for different curves depending on arguments. You can check the relevance of the arguments to curves in the [example of pow easing](https://github.com/tweenjs/tween.js/blob/main/examples/17_generate_pow.html) page.

_Credit where credit is due:_ these functions are derived from the original set of equations that Robert Penner graciously made available as free software a few years ago, but have been optimised to play nicely with JavaScript.



### Using a custom easing function

Not only can you use any of the existing functions, but you can also provide your own, as long as it follows a couple of conventions:

- it must accept one parameter:
  - `k`: the easing progress, or how far along the duration of the tween we are. Allowed values are in the range [0, 1].
- it must return a value based on the input parameters.

The easing function is only called _once per tween_ on each update, no matter how many properties are to be changed. The result is then used with the initial value and the difference (the _deltas_) between this and the final values, as in this pseudocode:

For the performance-obsessed people out there: the deltas are calculated only when `start()` is called on a tween.

So let's suppose you wanted to use a custom easing function that eased the values but applied a Math.floor to the output, so only the integer part would be returned, resulting in a sort of step-ladder output:

```ts
function tenStepEasing(k: number) {
	return Math.floor(k * 10) / 10
}
```

And you could use it in a tween by simply calling its easing method, as we've seen before:

```ts
tween.easing(tenStepEasing)
```

### External Easing Library

Other easing functions can be created and used, see [BezierEasing](https://github.com/thednp/bezier-easing).

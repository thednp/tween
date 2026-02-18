## Troubleshooting

### CSS Gotchas

Properties like `top`/`left` require `position`: `absolute`/`relative` on the element and its parent. `transform`/`translate` usually works best for animations.

Rotations and translations in 3D space require perspective and `transform-style: preserve-3d` (in some cases).

Some CSS properties might be marked as `!important` and your mutations may not affect your target elements.


### Updates Never Happen

This is due to one of the main factors:

1) **The missmatch of start and end values types**, if you're using vanilla JavaScript instead of TypeScript with active linting, you may experience this and not know what happens. Check your browser console for any warnings coming from validation or any critical errors that prevent the execution of the update runtime loop.

2) **Values are missing** due to the incorrect use of lifecycle hooks. If that is the case (probably React/Preact) you must wrap the configuration of your tween/timeline in `useEffect`.

3) **Values are not valid** due to some missing steps in your custom validation functions, resulting in incompatible values for interpolation. Check the code of the [built in extensions](https://github.com/thednp/tween/tree/master/src/extend) to get an idea on how validation works in those specific cases.

4) You never called `start()` / `play()`?

On a general note, refer to the [README](../README.md) for other tricks and quirks.

😊 Happy tweening!

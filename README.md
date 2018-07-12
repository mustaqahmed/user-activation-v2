# User Activation v2 (UAv2)
A frame-hierarchy-based model to track active user interaction.

## Overview
Browsers control access to "abusable" of APIs (e.g. opening popups or vibrating)
through user activation (or "user gestures").  However, major browsers today
exhibit widely divergent behavior because each of them has incrementally
developed its own unique implementation of the idea over a course of many years
covering many different APIs.  For example, [this
report](https://docs.google.com/document/d/1hYRTEkfWDl-KO4Y6cG469FBC3nyBy9_SYItZ1EEsXUA/edit?usp=sharing)
shows that the pop-blocking behavior is inconsistent among major browsers for
all non-trivial cases.

More importantly, the [current HTML
spec](https://html.spec.whatwg.org/#triggered-by-user-activation) can't really
fix the broken situation in the web today because it needs to add important
details and doesn't fully reflect any current implementation.

The UAv2 feature here introduces a new user activation model that is simple
enough for cross-browser implementation, and hence deserves a new spec from
scratch.

## Model details

### Two-bit state per frame

The new model maintains a two-bit user activation state at every `window` object
in the frame hierarchy:
- `HasSeenUserActivation`: This is a sticky bit for the APIs that only needs a
  signal on historical user activation.  The bit gets set on first user action,
  and is never reset during the frame’s lifetime.  For example, media autoplay
  and vibrate are potential users of this bit.

- `HasConsumableUserActivation`: This is a transient bit for the APIs that need
  limited invocation per user interaction.  The bit gets set on every user
  interaction, and is reset either after a certain time limit or through a call
  to an activation-consuming API (e.g. `window.open()`).

### State propagation across frames

- Any user interaction in a frame sets the activation bits in all ancestor
  frames (including the frame being interacted with).

- Any consumption of the transient bit resets the transient bits in the whole
  frame tree.

### Major functional changes

In Chromium, the main change introduced by this model is replacing
stack-allocated per-process [gesture
tokens](https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/dom/user_gesture_indicator.h?rcl=4b937d53836386e51532fbe870938b33ce0455ed&l=20)
with per-frame states as described above.  This effectively:
1. removes the need for token storing/passing/syncing for every user API,

2. changes activation visibility from stack-scoped to frame-scoped, and

3. fuses multiple user interactions within a small time interval into a single
   activation.

Design docs:
- [Main design](https://docs.google.com/document/d/1erpl1yqJlc1pH0QvVVmi1s3WzqQLsEXTLLh6VuYp228/edit?usp=sharing).
- [Enhancements for out-of-process iframes](https://docs.google.com/document/d/1XL3vCedkqL65ueaGVD-kfB5RnnrnTaxLc7kmU91oerg/edit?usp=sharing).

## Related proposals
- [JS API for querying User Activation
  states](https://github.com/dtapuska/useractivation): this is somewhat related
  to the UAv2 proposal.

## Demos
- [Activation propagation
  test](https://mustaqahmed.github.io/user-activation-v2/propagation/): Shows
  User Activation v2 state changes across the frame tree through user
  interaction and subsequent consumption through popups.
- [Determining activation-defining
  events](https://mustaqahmed.github.io/user-activation-v2/event-set/): Used for
  cataloging differences among major browsers in the set of events that define
  activation.

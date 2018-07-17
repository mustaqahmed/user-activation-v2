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

User Activation v2 (UAv2) introduces a new user activation model that is simple
enough for cross-browser implementation, and hence deserves a new spec from
scratch.  We prototyped the model in Chromium behind the flag
`--enable-features=UserActivationV2` in
[M67](https://www.chromestatus.com/features/5722065667620864).


## Details of the new model

### Two-bit state per frame

The new model maintains a two-bit user activation state at every `window` object
in the frame hierarchy:
- `HasSeenUserActivation`: This is a sticky bit for the APIs that only needs a
  signal on historical user activation.  The bit gets set on first user action,
  and is never reset during the frame’s lifetime.  For example, [`<video>
  autoplay`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
  and
  [`Navigator.vibrate()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
  are potential users of this bit.

- `HasConsumableUserActivation`: This is a transient bit for the APIs that need
  limited invocation per user interaction.  The bit gets set on every user
  interaction, and is reset either after a certain time limit defined by the
  browser or through a call to an activation-consuming API
  (e.g. [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)).


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


### Design docs

For further details on the model and Chromium implementation, see:
- [Main design](https://docs.google.com/document/d/1erpl1yqJlc1pH0QvVVmi1s3WzqQLsEXTLLh6VuYp228/edit?usp=sharing).
- [Enhancements for out-of-process iframes](https://docs.google.com/document/d/1XL3vCedkqL65ueaGVD-kfB5RnnrnTaxLc7kmU91oerg/edit?usp=sharing).


## Classifying user activation gated APIs

Browsers today already show different "levels of access control" for
activation-dependent APIs, and we are not aware of _any_ definition or even
documentation of these levels.  The UAv2 model induces a classification of user
APIs into four clearly defined classes, making it easy for any user API to spec
its dependence on user activation in a concise yet precise manner.  Our
prototype implementation in Chromium preserved all the APIs' past behavior after
a few (mostly minor) changes.

Below are the four classes, sorted by their "strength of dependence" on user
activation (from strongest to weakest):

- Transient activation consuming APIs: These APIs require the transient bit, and
  they consume the bit in each call to prevent multiple calls per user
  activation.  In most (all?)  browsers today,
  [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
  falls in this category.

- Transient activation gated APIs: These APIs require the transient bit but
  don't consume the bit, so multiple calls are allowed per user activation until
  the transient bit expires.
  [`Element.requestFullscreen()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen)
  falls in this category in many browsers (including Chromium).

- Sticky activation gated APIs: These APIs require the sticky activation bit, so
  they are blocked only until the very first user activation.  In Chromium,
  [`<video>
  autoplay`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) is
  one such API.

- Activation independent APIs: These are all the rest of the APIs, that are not
  blocked without a user activation in any way (e.g.,
  [`Document.write()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write)).


## Demos

For these demos, first enable UAv2 in the latest Chrome (M67+) through
`chrome://flags/#user-activation-v2` or the command-line flag
`--enable-features=UserActivationV2`.

- [Activation propagation
  test](https://mustaqahmed.github.io/user-activation-v2/propagation/): Shows
  User Activation v2 state changes across the frame tree through user
  interaction and subsequent consumption through popups.
- [Determining activation-defining
  events](https://mustaqahmed.github.io/user-activation-v2/event-set/): Used for
  cataloging differences among major browsers in the set of events that define
  activation.


## Related proposals
- [JS API for querying User Activation
  states](https://github.com/dtapuska/useractivation): this is independent but
  somewhat related to UAv2.

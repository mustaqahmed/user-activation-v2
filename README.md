# User Activation v2 (UAv2)
A frame-hierarchy based model to track active user interaction.


## Introduction

### What's a user activation?

The term _user activation_ means the state of a browsing session with respect to
user actions: an "active" state typically implies either the user is currently
interacting with the page through some input mechanism (typing, clicking with
mouse etc.), or the user has completed some interaction since the page got
loaded.  (_User gesture_ is a misleading term occasionally used to express the
same idea, e.g. "allowing something only with a user gesture", even though a
swipe gesture doesn't typically activate a page.)

Browsers control access to "abusable" of APIs through user activation.  The most
obvious example of such an API is opening popups through `window.open()`: when
rogue developers started to abuse the API to open popups arbitrarily, most
(all?) browsers began to block popups when the user is _not_ actively
interacting with the page.  Since then, browsers have gradually made many other
APIs dependent on activation (more precisely, made them _user activation
gated_), like making an element fullscreen, vibrating a mobile device,
autoplaying media etc.  To highlight the scope, [~30 different
APIs](https://docs.google.com/document/d/1mcxB5J_u370juJhSsmK0XQONG2CIE3mvu827O-Knw_Y/edit?usp=sharing)
in Chrome are user activation gated.

### What's the problem today?

The Web is in a terrible state today in terms of user activation behavior.
Because each browser has incrementally added user activation dependence to it's
own set of APIs a course of many years, we see widely divergent behavior among
major browsers.  For example, pop-blocking behavior is [inconsistent among major
browsers](https://docs.google.com/document/d/1hYRTEkfWDl-KO4Y6cG469FBC3nyBy9_SYItZ1EEsXUA/edit?usp=sharing)
for all non-trivial cases of user activation.

More importantly, the [current HTML
spec](https://html.spec.whatwg.org/#triggered-by-user-activation) can't really
fix the broken situation in the Web today because it needs to add important
details and doesn't fully reflect _any_ current implementation.

### How are we proposing to solve the problem?

User Activation v2 (UAv2) introduces a new user activation model that is simple
enough for cross-browser implementation, and hence calls for a new spec from
scratch as a long term fix for the Web.  We prototyped the model in Chromium
behind the flag `--enable-features=UserActivationV2` in
[M67](https://www.chromestatus.com/features/5722065667620864).


## Details of the new model

### Two-bit state per frame

The new model maintains a two-bit user activation state at every `window` object
in the frame hierarchy:
- `HasSeenUserActivation`: This is a sticky bit for the APIs that only needs a
  signal on historical user activation.  The bit gets set on first user action,
  and is never reset during the lifetime of the `window` object.  Example APIs:
  [`<video>
  autoplay`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
  and
  [`Navigator.vibrate()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate).

- `HasConsumableUserActivation`: This is a transient bit for the APIs that need
  limited invocation per user interaction.  The bit gets set on every user
  interaction, and is reset either after an expiry time defined by the browser
  or through a call to an activation-consuming API
  (e.g. [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)).


### State propagation across frames

- Any user interaction in a `window` object sets the activation bits in the
  `window` objects of all ancestor frames (including the `window` being
  interacted with).

- Any consumption of the transient bit resets the transient bits in the `window`
  objects of the whole frame tree.


### Major functional changes

In Chromium, the main change introduced by this model is replacing
stack-allocated per-process [gesture
tokens](https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/dom/user_gesture_indicator.h?rcl=4b937d53836386e51532fbe870938b33ce0455ed&l=20)
with per-frame states as described above.  This effectively:
1. removes the need for token storing/passing/syncing for every user API,

2. changes activation visibility from stack-scoped to frame-scoped, and

3. fuses multiple user interactions within the expiry time interval into a
   single activation.


### Design docs

For further details on the model and Chromium implementation, see:
- [Main design](https://docs.google.com/document/d/1erpl1yqJlc1pH0QvVVmi1s3WzqQLsEXTLLh6VuYp228/edit?usp=sharing).
- [Enhancements for out-of-process iframes](https://docs.google.com/document/d/1XL3vCedkqL65ueaGVD-kfB5RnnrnTaxLc7kmU91oerg/edit?usp=sharing).


## Classifying user activation gated APIs

Modern browsers already show different levels activation-dependence for
activation-aware APIs, and the Web needs a spec for this behavior.  The UAv2
model induces a classification of user APIs into three distinct levels, making
it easy for any user API to spec its activation-dependence in a concise yet
precise manner.  The levels are as follows, sorted by their "strength of
dependence" on user activation (from strongest to weakest):

- Transient activation consuming APIs: These APIs require the transient bit, and
  they consume the bit in each call to prevent multiple calls per user
  activation.
  E.g. [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
  is most (all?)  browsers today.

- Transient activation gated APIs: These APIs require the transient bit but
  don't consume it, so multiple calls are allowed per user activation until the
  transient bit expires.  E.g.
  [`Element.requestFullscreen()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen)
  in Chromium and other many browsers.

- Sticky activation gated APIs: These APIs require the sticky activation bit, so
  they are blocked until the very first user activation.  E.g. [`<video>
  autoplay`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
  and
  [`Navigator.vibrate()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)
  in Chromium.

Our prototype implementation preserved all the APIs' past behavior in
Chromium after a few (mostly minor) changes.


## Demo

For the demo, first enable UAv2 in the latest Chrome (M67+) through
`chrome://flags/#user-activation-v2` or the command-line flag
`--enable-features=UserActivationV2`.

- [Activation propagation
  demo](https://mustaqahmed.github.io/user-activation-v2/propagation/): Shows
  UAv2 state changes across the frame tree through user interaction and
  subsequent consumption through popups.

- [User Activation v2 with
  setTimeouts](https://mustaqahmed.github.io/user-activation-v2/api-consistency/setTimeout.html):
  Shows consistent availability of user activation through chaining of
  `setTimeout()` calls.

- [User Activation v2 with
  postMessages](https://mustaqahmed.github.io/user-activation-v2/api-consistency/postMessages.html):
  Shows consistent availability of user activation through `postMessage()` call
  order.

## Related links

- [JS API for querying User Activation
  states](https://github.com/dtapuska/useractivation): this is independent but
  somewhat related to UAv2.

- [Determining activation-defining
  events](https://mustaqahmed.github.io/user-activation-v2/event-set/): Used for
  [cataloging](https://docs.google.com/spreadsheets/d/1DGXjhQ6D3yZXIePOMo0dsd2agz0t5W7rYH1NwJ-QGJo/edit?usp=sharing)
  differences among major browsers in the set of events that define activation.

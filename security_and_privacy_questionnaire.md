# Answers to [Security and Privacy Questionnaire](https://www.w3.org/TR/security-privacy-questionnaire/)

### 3.1 Does this specification deal with personally-identifiable information?

No.


### 3.2 Does this specification deal with high-value data?

No.


### 3.3 Does this specification introduce new state for an origin that persists across browsing sessions?

No.


### 3.4 Does this specification expose persistent, cross-origin state to the web?

No.


### 3.5 Does this specification expose any other data to an origin that it doesn’t currently have access to?

Partially yes, only from a cross-origin child frame to its parent frame.  More
precisely, a parent frame would be able to determine if user interacted with a
child frame (true/false), but not the other way around.  This is not a concern
since the container frame is in control anyways.  E.g. the container (the parent
frame) can already lay a transparent div over the child and add event listeners
to the div to achieve the same today.


### 3.6 Does this specification enable new script execution/loading mechanisms?

No.


### 3.7 Does this specification allow an origin access to a user’s location?

No.


### 3.8 Does this specification allow an origin access to sensors on a user’s device?

No.


### 3.9 Does this specification allow an origin access to aspects of a user’s local computing environment?

No.


### 3.10 Does this specification allow an origin access to other devices?

No.


### 3.11 Does this specification allow an origin some measure of control over a user agent’s native UI?

No.


### 3.12 Does this specification expose temporary identifiers to the web?

No.


### 3.13 Does this specification distinguish between behavior in first-party and third-party contexts?

No.


### 3.14 How should this specification work in the context of a user agent’s "incognito" mode?

This would work in the "incognito" mode in the same way as in the "regular" mode.


### 3.15 Does this specification persist data to a user’s local device?

No.


### 3.16 Does this specification have a "Security Considerations" and "Privacy Considerations" section?

There is no privacy concerns here: only user info that gets exposed is a Boolean
on whether the user has interacted with a page.  This info is visible already
today through event listeners.  The only case that this spec defines (was
undefined before) is when a child frame is cross-origin.  Depending on
implementation, the info was either fully available or not available at all.
The "not available" case become relaxed through this spec, but it's not a
concern; see Q3.5 above.

We don't see any security risk here.


### 3.17 Does this specification allow downgrading default security characteristics?

No.


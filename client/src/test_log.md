## Tests

# Full cycle of ZKOPRU circuits

* Fast machine
* Slow machine
* CLI on medium/fast machine

Browsers:
* Edge
* Chrome
* Firefox
* Brave
* Safari

Things to check:
* All circuits completed
* No INVALIDATED circuits
* All circuits VERIFIED
* Gist(s) created and includes all circuits


## CLI/Browser interaction

* Browser cycle followed by CLI cycle
* CLI cycle followed by browser cycle
* CLI followed by CLI cycle
* browser cycle followed by browser cycle


## Edge cases

* WAITING contributor:
  + stay on page until prior contrib is VERIFIED. Should start
  + stay on page until prior is INVALIDATED. Should start
    ** Passes **
  + close page while WAITING. Return in < x minutes (x=3?). Should resume position.
    ** Passes **
  + Close page while WAITING. Stay away for > x minutes. Subsequent WAITING contributor appears. Record should be INVALIDATED and cancelled for re-use, else leave and allow re-use.
    ** Passes **
  + Close page while WAITING. Stay away for > x minutes. No subsequent WAITING contributor. Record should be left and allow re-use.
    ** Passes **
* RUNNING contributor:
  + Start RUNNING, then close page. Wait y minutes (y depends on cct size). Subsequent waiting contributor. Should be INVALIDATED.
  + Start RUNNING, then close page. Wait y minutes (y depends on cct size). No subsequent waiting contributor. Should be left RUNNING.
  + Start RUNNING, then close page. Return in < y minutes. Expect: Skip cct. Contrib should be INVALIDATED after y minutes. 
  + Start RUNNING on slow machine (expected to take longer than the max allowed). No subsequent waiting contributor. Should be allowed to complete.
  + Start RUNNING on slow machine. Subsequent waiting contributor. Expect: Set to INVALIDATED after max seconds; Status should not be updated to COMPLETE when it finally finishes.


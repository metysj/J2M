# Biggest heading

## Bigger heading

# Biggest heading
## Bigger heading
### Big heading
#### Normal heading
##### Small heading
###### Smallest heading

**strong**
*emphasis*
`monospaced`
*&mdash; citation*
~~deleted~~
<ins>inserted</ins>
<sup>superscript</sup>
<sub>subscript</sub>

```javascript
var hello = 'world';
```

<http://google.com>
[Google](http://google.com)

GitHub Flavor
~~deleted~~

```
  preformatted piece of text
  so _no_ further _formatting_ is done here
```

***Should be bold AND italic***

* First li
* Second li
  * Indented li
    * Three columns in li
* Back to first level li

1. First li
1. Second li
  1. Indented li
    1. Three columns in li
1. Back to first level li

* Here's *italic* inside li
* here's **bold** inside li
* Here's ***bold + italic*** inside li
  * Here they are in one line indented: *italic* **bold**

> Here's a long single-paragraph block quote. It should look pretty and stuff.


| A title |
| --- |
| Panel text |


|Heading 1|Heading 2|
| --- | --- |
|Col A1|Col A2|
|Col B1|Col B2|

```
Something
```

```
Something else
```

myDbgInfoPB = { _lastKeyTS: -1, _prevState: -1, _firstPtsAfterKey: false, PlayerState: { OPENING: 0, PLAYING: 1, PAUSED:  2, STOPPED: 3,CLOSED:  4 } };

```
myDbgInfoPB = { _lastKeyTS: -1, _prevState: -1, _firstPtsAfterKey: false, PlayerState: { OPENING: 0, PLAYING: 1, PAUSED:  2, STOPPED: 3,CLOSED:  4 } };


nrdp.gibbon.addEventListener("key", function(event) {if ( event.data.type == "press" ) { myDbgInfoPB._lastKeyTS=nrdp.mono(); myDbgInfoPB._firstPtsAfterKey = true; } });

if(typeof nrdp.media.addEventListener != "undefined") { nrdp.media.addEventListener("updatepts", function(event) { var ts = nrdp.mono(); if ( myDbgInfoPB._firstPtsAfterKey == true ) { nrdp.log.error("keyToUpdatePTS,keyToEventGen,EventGenToJS=" +  (ts - myDbgInfoPB._lastKeyTS) + "," + (event.time - myDbgInfoPB._lastKeyTS) + "," + (ts - event.time) + " ms" ); myDbgInfoPB._firstPtsAfterKey = false; } }); nrdp.media.addEventListener("statechanged", function(event) { switch (event.state) { case myDbgInfoPB.PlayerState.OPENING: break; case myDbgInfoPB.PlayerState.PLAYING: break; case myDbgInfoPB.PlayerState.PAUSED: nrdp.log.error("keyToPlaybackPause  = " + (nrdp.mono() - myDbgInfoPB._lastKeyTS) + " ms"); break; case myDbgInfoPB.PlayerState.STOPPED: break; case myDbgInfoPB.PlayerState.CLOSED: nrdp.log.error("keyToPlaybackClosed  = " + (nrdp.mono() - myDbgInfoPB._lastKeyTS) + " ms"); break; default: break; } myDbgInfoPB._prevState=event.state; }); }
```
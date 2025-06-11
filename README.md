# baziez / JACK – Jetting Audio Crow Kit 🖤🪶

[![License](https://img.shields.io/:license-mit-blue.svg)](https://github.com/baziez/JACK/blob/main/LICENSE)

**JACK** (Jetting Audio Crow Kit) is a minimalist, modular sound visualizer powered by [p5.js](https://p5js.org/). Designed for creators who want to explore the intersection of **audio and visual expression**, JACK listens to your sound and brings it to life on canvas.

> *“The crow does not sing. It watches. JACK listens and makes the silence dance.”*

Latest Version
----
Release 0.01 (Release Notes)

### Table of Contents
| No | Title                                     |
|----|-------------------------------------------|
| 1  | [Features](#features)                     |
| 2  | [Preview](#preview)	                     |
| 3  | [Prerequisites](#prerequisites)           |
| 4  | [How to use](#how-to-use)                 |
| 5  | [Customize It](#customize-it)             |
| 6  | [Known Issues](#known-issues)             |
| 7  | [Development](#development)               |
| 8  | [License](#license)				         |

Features
----
- 🎧 Real-time audio input via select file
- 🎨 Dynamic visuals rendered using `p5.js`
- ⚙️ Modular design – customize your visuals with ease
- 📂 No build tools needed – just a browser and a love of sound
- 🐦 Inspired by the observant, reactive spirit of the crow
[[back to top]](#table-of-contents)


Preview
----
[![Watch JACK in action](https://img.youtube.com/vi/jLbCVrcWL6A/0.jpg)](https://youtu.be/jLbCVrcWL6A)

[[back to top]](#table-of-contents)

Prerequisites
----
  - You need a web browser (like Firefox(tested with v. 139.0.4 (64-bit))) installed on your computer.
  - About 20MB disk space and own mp3 file to play.
  - Download the JACK repository 
  - Download Dependencies
1.: https://github.com/processing/p5.js/releases/tag/v1.4.0
2.: https://github.com/processing/p5.js-sound/releases/tag/v1.0.1
  Extract them in represented folders:

File structure:
```sh
JACK/
  ├─ index.html
  ├─ main.js
  lib/
    ├── p5.js
    └── addons/
      └── p5.sound.min.js
```

  
[[back to top]](#table-of-contents)


How to use
----
1. Click the 'Browse' button to select a audio file.
2. Click the 'Start' button.

[[back to top]](#table-of-contents)


Customize It
----
JACK is built to be modified:
Open main.js in a text or IDE editor. 
Find and modify this three values.
```sh
let Sen = 4; // Peak sensitivity value from 1.0 -
let limCol = 4; // Limiting colors value from 1.0 -
let limLine = 12; // Line limiter value from 1.0 -
```
Or any other values, code...

[[back to top]](#table-of-contents)


Known Issues
----
* (Warning) Might cause seizures for photosensitive epilepsy patients.
* Not compatible with updated dependencies
* If the background stops to animate: it's toasted, try reload page with "ctrl + F5", load file and try again.
* Performance issues: Many, some can be reduced using higher value of limLine in main.js.

[[back to top]](#table-of-contents)

Development
----

Want to contribute? Great! Please do not hesitate to contribute to the development.

[[back to top]](#table-of-contents)


License
----
MIT : You’re free to use, modify, and share.
[View the full MIT License](https://github.com/baziez/JACK/blob/main/LICENSE)

[[back to top]](#table-of-contents)

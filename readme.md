[![Build Status](https://travis-ci.org/Xesenix/xes-games.svg?branch=master)](https://travis-ci.org/Xesenix/xes-games)
[![Coverage Status](https://coveralls.io/repos/github/Xesenix/xes-games/badge.svg?branch=master)](https://coveralls.io/github/Xesenix/xes-games?branch=master)

## Babel 7 Typescipt

[Migration guide](https://babeljs.io/docs/en/next/v7-migration)

## Serving from localhost

For opening tunnel to localhost use [ngrok](https://dashboard.ngrok.com/get-started)

After setting up run first build than run application:

```
npm run game-01:build:prod
npm run game-01:start

```

And then open tunnel

```
ngrok http 8080
```


## FEATURES:

- [ ] use zone.js for async tests
- [ ] use react routing with guards checking if required services are ready
- [x] use web audio without phaser interface
- [x] create light dark theme
- [ ] persist data store in local storage
- [x] update store on exiting fullscreen without using of fullscreen button
- [x] create music cross fading helper
- [ ] create music layers
- [x] use phaser asset loader to wait for audio data
- [ ] randomize soundtracks loops (soundtrack theme)
- [x] played soundtracks debug visualization

## DOCS:

[Working with Phaser 3 scenes](https://phaser.io/phaser3/devlog/121)
[Phaser 3 dynamic tilemap](https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a)

![Screen Shot 2017-07-31 at 21.48.55 copy.png](///raw/88f/2/z/6d13.png)

## About
The concept of this game if fairly simple, there’s a map, you and your friend (represented by the diamond shaped element) are stuck in there and need to find the exit. You can move in 4 directions and to do so you'll have to use your devices.
For instance, to move to the right, it's super easy : You put your second device on the right of the first one
and you just pinch ! The second device become the new spot where you and your friend are (as seen on
the mini map in game) and you keep on going until you find the exit ! (before you run out of power and die a horrible death of course ^^)

## Dev process

For this LD, the theme being running out of power, we thought about an "escape before
it's too late" kind of game but with a interesting twist in the gameplay.
In this game, to move from one room to another you use 2 real life devices
to build your path !
We used a library called [Swip JS](https://github.com/paulsonnentag/swip) that let you connect several devices (smartphones, iphones, ipads,
or even a laptop with touch screen) with only one move, a pinch on the screens.

Since we had to go on the LD39 journey with a super small team, we decided to keep
all the other fancy elements, like graphics or music, super low key with room for future
improvements.

All assets have been made during the event.

## Screenshots
![begin.gif](///raw/88f/2/z/6c3a.gif)

![ezgif.com-optimize.gif](///raw/88f/2/z/6ca5.gif)

![first-screen.png](///raw/88f/2/z/6c97.png)

![second-screen.png](///raw/88f/2/z/6c9a.png)

![finish-screen.png](///raw/88f/2/z/6c9c.png)

### Controls
- Move : Your fingers

## Team
- Maxime Lambert: Concept / Game Design
- Guillaume Gomez: Programming

## Build from sources
```
npm install
npm run build
cd client
npm install
npm run build
cd ..
npm start
```

go to `localhost:3000` on your browser
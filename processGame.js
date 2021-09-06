const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const findNextCell = require('./findNextCell');
const randomApple = require('./apple');

const fetch = require('node-fetch');
// send to heroku fn...
const send_to_deta = (load) => {
    console.log('Sending payload to deta.')
    let options =  {
        method: 'POST',
        body: JSON.stringify(load), 
        headers: { 'Content-Type': 'application/json' } 
    };
    fetch("https://smx1zn.deta.dev/post_game", options)
        .then(res => {
            console.log(res);
            console.log('Cron job fiinished.');
        }).catch(e => console.log('Error reching heroku: ', e));
};

// global constands
const n = 6,
      s = n * 50,
      canvas = createCanvas(2*s, s),
      ctx = canvas.getContext('2d');

// drawing ...
module.exports = function processGame(snake = [], apple = [], rts, loves, score, h_score){
    // analyse game
    console.log('...analysis starting...');
    let dir = 0;
    if (rts > loves){
        dir = -1;
    } else if (loves > rts){
        dir = 1;
    } else if (loves == rts){
        dir = 0;
    };
    console.log('Direction taken: ', dir);
    let newSnake = [],
        newApple = [],
        ate = false,
        died = false,
        nextCell = findNextCell(dir, snake[0]);
    console.log('Next cell: ', nextCell)
    // collision with apple
    if ((nextCell[0] === apple[0]) && (nextCell[1] === apple[1])) ate = true;
    // apple gen
    let newScore, new_h_score;
    if (ate){
        newApple = randomApple(newSnake);
        newScore += 1;
        if (newScore > h_score){
            new_h_score = newScore;
        } else {
            new_h_score = h_score;
        };
    };
    if (!ate){
        snake.pop();
        newApple = apple;
        newScore = score;
        new_h_score = h_score;
    };
    // snake growing
    newSnake = [nextCell, ...snake];
    // collision with body
    newSnake.forEach(part => {
        if ((nextCell[0] === part[0]) && (nextCell[1] === part[1])){
            died = true;
        };
    });
    console.log('New snake: ', newSnake);
    console.log('Ate: ', ate);
    console.log('New apple: ', newApple);
    console.log('Dead: ', died);

    ////////////////////////////////////////
    // draw game
    console.log('...starts to draw...');
    // bg
    ctx.fillStyle = '#242424cc';
    ctx.fillRect(0, 0, 2*s, s);
    for (let j = 0; j < n; j++){
        for (let i = 0; i < n; i++){
            if (((i+j) % 2) === 0){
                ctx.fillStyle = '#8aa8a3';
            } else {
                ctx.fillStyle = '#5a6b68';
            };
            ctx.fillRect(i*50, j*50, 50, 50);
        };
    };
    // snake
    let lightness = 45;
    for (let i = 0; i < newSnake.length; i++){
        let x = newSnake[i][0] * 50,
            y = newSnake[i][1] * 50,
            hsl = `hsl(100, 100%, ${lightness}%)`;
        ctx.fillStyle = '#062400d5';
        ctx.fillRect(x, y, 50, 50);
        ctx.fillStyle = hsl;
        lightness += (25 / newSnake.length);
        ctx.fillRect(x + 2, y + 2, 46, 46);
    };
    let x = newSnake[0][0] * 50,
        y = newSnake[0][1] * 50,
        to = newSnake[0][2];
    ctx.fillStyle = "#000";
    if (to === 0){
        ctx.fillRect(x, y + 10, 10, 10);
        ctx.fillRect(x, y + 30, 10, 10);
    } else if (to === 1){
        ctx.fillRect(x + 10, y, 10, 10);
        ctx.fillRect(x + 30, y, 10, 10);
    } else if (to === 2){
        ctx.fillRect(x + 40, y + 10, 10, 10);
        ctx.fillRect(x + 40, y + 30, 10, 10);
    } else if (to === 3){
        ctx.fillRect(x + 10, y + 40, 10, 10);
        ctx.fillRect(x + 30, y + 40, 10, 10);
    };
    // apple
    ctx.fillStyle = '#000000cb';
    ctx.fillRect(newApple[0]*50, newApple[1]*50, 50, 50);
    ctx.fillStyle = "#ff0000cb";
    ctx.font = "35px monospace";
    ctx.fillText("🍎", newApple[0]*50 + 3, newApple[1]*50 + 38);
    // write tweets and love counts
    ctx.fillStyle = '#525252';
    ctx.fillRect(s, 0.66*s, s, 0.34*s);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("LAST  POST  GOT", s + 15, 0.7*s + 20);
    ctx.fillText(`${loves}  LIKES  AND`, s + 15, 0.7*s + 45);
    ctx.fillText(`${rts}  RETWEETS.`, s + 15, 0.7*s + 70);
    ctx.fillStyle = "#ffe600d7";
    ctx.font = "50px Arial";
    ctx.fillText("🐓", 2*s - 90, s - 35);
    // classifieds drawing
    let ad = new Image();
    ad.onload = () => ctx.drawImage(ad, s, 0, s, 0.66*s);
    ad.src = 'ad/tools.png'
    // save 
    fs.writeFileSync('./out.png', canvas.toBuffer());
    console.log('...drawing complete...');
    ////////////////////////////////////////

    // formulate text for tweet....


    // result obj
    let load = {
        "media_b64": canvas.toBuffer().toString('base64'),
        "text": "Dummy trials corporation.",
        "snake": newSnake,
        "apple": newApple,
        "dead": died,
        "h_score": new_h_score,
        "score": newScore
    };
    // make a POST req to deta server..
    send_to_deta(load);
};

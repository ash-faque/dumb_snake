// server modules
const express = require('express')
const app = express()
app.use(express.json())

// canvas modules
const { createCanvas } = require('canvas')
const canvas = createCanvas(300, 300)
const ctx = canvas.getContext('2d')

// drawing ...
const drawGame = (snake, apple, dead) => {
    // draw canvas bg
    ctx.fillStyle = '#166d00'
    ctx.fillRect(0, 0, 300, 300)
    ctx.fillStyle = '#2ad300'
    for (let i = 0; i < 6; i++){
        for (let j = 0; j < 6; j++){
            if ((i + j) % 2 === 0){
                ctx.fillRect(i*50, j*50, 50, 50)
            }
        }
    }
    // draw new snake
    ctx.fillStyle = '#b527d8'
    snake.forEach(cell => {
        let i = cell[0],
            j = cell[1],
            to = cell[2];
        ctx.fillRect(i*50, j*50, 50, 50)
    });
    // draw apple
    ctx.fillStyle = '#ee6a2d'
    ctx.fillRect(apple[0]*50, apple[1]*50, 50, 50)

    // save game
    return { "buffer": canvas.toBuffer() }
};


// app routs
app.post('/draw', function(req, res){
    let snake = req.body.snake,
        apple = req.body.apple,
        dead = req.body.dead,
        json = drawGame(snake, apple, dead);
    res.json(json);
});
app.listen((process.env.PORT || 8080), () => {
    console.log('listening ...')
});
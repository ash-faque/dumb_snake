const express = require('express')
const app = express()
const fs = require('fs')
var PORT = process.env.PORT || 5000;

// twitter
const Twitter = require('twitter');
const config = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
};
const twitter = new Twitter(config);
var params = { screen_name: 'nodejs'}


// just make the game and deploy to heroku
const { createCanvas } = require('canvas')
const canvas = createCanvas(500, 500)
const ctx = canvas.getContext('2d')

// draw canvas bg
ctx.fillStyle = '#166d00'
ctx.fillRect(0, 0, 500, 500)
ctx.fillStyle = '#2ad300'
for (let i = 0; i < 10; i++){
    for (let j = 0; j < 10; j++){
        if ((i + j) % 2 === 0) ctx.fillRect(i*50, j*50, 50, 50)
    }
}

// draw snake



// save game state
canvas.toBuffer((err, buff) => {
    if (err) console.log(err)
    try{
        fs.writeFileSync(__dirname + '/public/game.jpg', buff,)
    } catch {e => console.log(e)}
})





// app routs
app.use(express.static('public'))
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => console.log('listening on port: ' + PORT))
module.exports = app
// HEROKU SERVER //
const express = require('express');
const app = express();
app.use(express.json());

const processGame = require('./processGame');

// post draw rout
app.post('/draw', function(req, res){
    res.send('Drawing request reached heroku.');
    // extract the data from deta server
    let snake = req.body.snake,
        apple = req.body.apple,
        rts = req.body.rts,
        loves = req.body.loves,
        score = req.body.score,
        h_score = req.body.h_score;
    //console.log(snake, apple, rts, loves, score, h_score);
    processGame(snake, apple, rts, loves, score, h_score);
});

app.listen((process.env.PORT || 8080), () => {
    console.log('.......listening.......')
});
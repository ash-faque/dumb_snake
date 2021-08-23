// server modules
const express = require('express')
const app = express()
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()
var PORT = process.env.PORT || 5000;
// canvas modules
const { createCanvas } = require('canvas')
const canvas = createCanvas(300, 300)
const ctx = canvas.getContext('2d')


// twitter modules
const Twitter = require('twitter');
const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

    // vars for old posts statistics
    var rts = 0, loves = 0;
    // post tweet
    const postGame = (extra = false) => {
        let imageData = fs.readFileSync(__dirname + "/game.jpg")
        let base64image = Buffer.from(imageData).toString('base64')
        client.post("media/upload", {media_data: base64image}, (error, media, response) => {
            if (error){
                console.log("can't post image. | " + JSON.stringify(error))
            } else {
                console.log("media uploaded" /*+  JSON.stringify(response) */)
                let status_txt = ''
                if (extra){
                    status_txt = 'Starting new game...'
                } else {
                    status_txt = `Last post got... \n ${rts} retweets and \n ${loves} favourites.`
                };
                let status = {
                    status: status_txt,
                    media_ids: media.media_id_string
                };
                client.post("statuses/update", status, (error, tweet, response) => {
                    if (error){
                        console.log("error posting status. | " + JSON.stringify(error))
                    } else {
                        console.log("status upadated. | " /* + JSON.stringify(response) + JSON.stringify(tweet) */)
                        let data = JSON.stringify({ old_post_id: (tweet.id).toString() })
                        console.log(data)
                        fs.writeFileSync(__dirname + '/last_post_id.json', data)
                    };
                });
            };
        });
    };
    // get dir by tweet statics
    const getDirByStatics = () => {
        //console.log('calling getdir fn...')
        let post_id = JSON.parse(fs.readFileSync(__dirname + '/old_post.json')).old_post_id,
            params = { id: post_id };
        client.get('statuses/show', params, function(err, data, response) {
            if (err){
                console.log('error getting tweet: ' + JSON.stringify(err))
            } else {
                rts = data.retweet_count,
                loves = data.favorite_count;
                if (rts > loves){
                    return -1
                } else if (loves > rts){
                    return 1
                } else if (loves === rts){
                    return 0
                };
            };
        });
    };


    // json reader util fns
    // read game
    const readGame = () => {
        let game = JSON.parse(fs.readFileSync(__dirname + '/snake.json'))
        return { 'snake': game.snake, 'apple': game.apple }
    };
    // write game
    const writeGame = (rawSnake, rawApple) => {
        let data = JSON.stringify({ "snake": rawSnake, "apple": rawApple})
        fs.writeFileSync(__dirname + '/snake.json', data)
    };

    // random apple
    const randomApple = (newSnake) => {
        let x = Math.floor((Math.random() * 5) + 1),
            y = Math.floor((Math.random() * 5) + 1);
        newSnake.forEach(part => {
            if ((part[0] === x) && (part[1] === y)){
                randomApple(newSnake);
            };
        });
        return [x, y]
    };

    // drawing ...
    const drawGame = (newSnake, newApple) => {
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
        newSnake.forEach(cell => {
            let i = cell[0],
                j = cell[1],
                to = cell[2];
            ctx.fillRect(i*50, j*50, 50, 50)
        });
        // draw apple
        ctx.fillStyle = '#ee6a2d'
        ctx.fillRect(newApple[0]*50, newApple[1]*50, 50, 50)
        // save game
        canvas.toBuffer((err, buff) => {
            if (err) console.log(err)
            try{
                fs.writeFileSync(__dirname + '/game.jpg', buff)
            } catch {e => console.log(e)}
        });
    };

// game stepping
const stepGame = (justAfterDeath = false) => {
    if(!justAfterDeath){
        // logics
        let currentGame = readGame(), 
            currentSnake = currentGame.snake, 
            currentApple = currentGame.apple,
            newSnake,
            newApple,
            headCell = currentSnake[0],
            headsTo = headCell[2],
            nextCell,
            dir = getDirByStatics(),
            ate = false,
            died = false;
        // snake step
        if (dir === -1){
            // next move left
            if (headsTo === 0){
                // currently to left
                nextCell = [headCell[0], ((headCell[1] + 1) > 5) ? 0 : (headCell[1] + 1), 3]
            } else if (headsTo === 1){
                // currently to top
                nextCell = [((headCell[0] - 1) < 0) ? 5 : (headCell[0] - 1), headCell[1], 0]
            } else if (headsTo === 2){
                // currently to right
                nextCell = [headCell[0], ((headCell[1] - 1) < 0) ? 5 : (headCell[1] - 1), 1]
            } else if (headsTo === 3){
                // currently to bottom
                nextCell = [((headCell[0] + 1) > 5) ? 0 : (headCell[0] + 1), headCell[1], 2]
            }
            if ((nextCell[0] === currentApple[0]) && (nextCell[1] === currentApple[1])) ate = true
        } else if (dir === 1){
            // next move right
            if (headsTo === 0){
                // currently to left
                nextCell = [headCell[0] , ((headCell[1] - 1) < 0) ? 5 : (headCell[1] - 1), 1]
            } else if (headsTo === 1){
                // currently to top
                nextCell = [((headCell[0] + 1) > 5) ? 0 : (headCell[0] + 1), headCell[1] , 2]
            } else if (headsTo === 2){
                // currently to right
                nextCell = [headCell[0] , ((headCell[1] + 1) > 5) ? 0 : (headCell[1] + 1), 3]
            } else if (headsTo === 3){
                // currently to bottom
                nextCell = [((headCell[0] - 1) < 0) ? 5 : (headCell[0] - 1), headCell[1] , 0]
            }
            if ((nextCell[0] === currentApple[0]) && (nextCell[1] === currentApple[1])) ate = true
        } else if (dir === 0 ){
            // next move forward
            if (headsTo === 0){
                // currently to left
                nextCell = [((headCell[0] - 1) < 0) ? 5 : (headCell[0] - 1), headCell[1] , 0]
            } else if (headsTo === 1){
                // currently to top
                nextCell = [headCell[0] , ((headCell[1] - 1) < 0) ? 5 : (headCell[1] - 1), 1]
            } else if (headsTo === 2){
                // currently to right
                nextCell = [((headCell[0] + 1) > 5) ? 0 : (headCell[0] + 1), headCell[1] , 2]
            } else if (headsTo === 3){
                // currently to bottom
                nextCell = [headCell[0] , ((headCell[1] + 1) > 5) ? 0 : (headCell[1] + 1), 3]
            }
            // collision with apple
            if ((nextCell[0] === currentApple[0]) && (nextCell[1] === currentApple[1])) ate = true;
        };

        // snake growing
        if (!ate) currentSnake.pop()
        newSnake = [nextCell, ...currentSnake]

        // collision with body
        newSnake.forEach(part => {
            if ((nextCell[0] === part[0]) && (nextCell[1] === part[1])) died = true;
        });

        // apple gen
        if (ate){
            // make new random apple
            newApple = randomApple(newSnake)
        } else {
            newApple = currentApple
        };

        // write new game data
        writeGame(newSnake, newApple);

        // draw game
        drawGame(newSnake, newApple);
    };

    // draw game
    let currentGame = readGame(), 
        currentSnake = currentGame.snake,
        currentApple = currentGame.apple;
    drawGame(currentSnake, currentApple);
    
    // posting tweet
    if(!justAfterDeath){
        postGame()
    } else {
        postGame(true)
    };
    // restart proceedure
    if (died){
        // reset snake.json file
        let snake_file_data = JSON.stringify({
                                "snake":[[3,2,2],[2,2,2],[1,2,2]],
                                "apple": randomApple()
                            })
        fs.writeFileSync(__dirname + '/snake.json', snake_file_data);
        stepGame(true);
    };
};

// app routs
app.get('/status', function(req, res){
    res.status = 200
    res.send("healthy....");
});
app.listen(PORT, () => {
    console.log('listening on port: ' + PORT)
});

// crone job 
const CronJob = require('cron').CronJob;
const cronJob = new CronJob('0 * * * *', () => {
    if (JSON.parse(fs.readFileSync(__dirname + '/old_post.json')).old_post_id == ('' || undefined || null)){
        // set snake.json file
        let snake_file_data = JSON.stringify({
            "snake":[[3,2,2],[2,2,2],[1,2,2]],
            "apple": randomApple()
        })
        fs.writeFileSync(__dirname + '/snake.json', snake_file_data);
        stepGame(true);
    } else {
        stepGame()
    };
});
cronJob.start();

stepGame()
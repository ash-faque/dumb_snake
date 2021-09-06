module.exports = function randomApple(newSnake){
    console.log("calling random apple gen fn..")
    let x = Math.floor((Math.random() * 5) + 1),
        y = Math.floor((Math.random() * 5) + 1);
    newSnake.forEach(part => {
        if ((part[0] === x) && (part[1] === y)){
            randomApple(newSnake);
        };
    });
    return [x, y]
};
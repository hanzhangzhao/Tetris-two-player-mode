var local = function(socket) {
    // game object
    var games;
    // time interval
    var INTERVAL = 1000;
    // timer
    var timer = null;

    // var timeCount = 0;
    // game time
    var time = 0;

    // bind keyboard event
    var bindKeyEvent = function() {
        document.onkeydown = function(e){
            if (e.keyCode == 38) { // up
                games.rotate();
                socket.emit('rotate');
            }else if (e.keyCode == 39) { // right
                games.right();
                socket.emit('right');
            }else if (e.keyCode == 40) { // down
                games.down();
                socket.emit('down');
            }else if (e.keyCode == 37) { // left
                games.left();
                socket.emit('left');
            }else if (e.keyCode == 32) { // space
                games.fall();
                socket.emit('fall');
            }
        }
    }

    var move = function(){

        timeCounter();

        if (!games.down()) { // failed to go down
            games.fixed();
            socket.emit('fixed');

            var lines = games.checkClear();
            if (lines){
                games.addScore(lines);
                socket.emit('line', lines);

                if(lines > 1) {
                    var bottomLines = generateBottomLine(lines);
                    socket.emit('bottomLines', bottomLines);
                }
            }

            var gameOver = games.checkOver();
            if (gameOver) {
                games.gameResult(false);
                document.getElementById('remote_over').innerHTML = "You won!"
                document.getElementById('remote_over').style.color = "green"

                socket.emit('lose');

                stop();
            }else{
                // games.proceedNext(generateType(), generateDir());
                var nextType = generateType();
                var nextDir = generateDir();   
                games.proceedNext(nextType, nextDir);
                socket.emit('next', {type: nextType, dir: nextDir});
        
            }   
        } else { // still going down
            socket.emit('down');
        }
    }

    // generate random lines
    var generateBottomLine = function(lineNum) {
        var lines = [];
        for (var i = 0; i < lineNum; i++) {
            var line = [];
            for (var j = 0; j < 10; j++) {
                line.push(Math.ceil(Math.random() * 2) - 1); // 0 to 1
            }
            lines.push(line);
        }
        return lines;
    }

    // count game time
    var timeCounter = function () {

        time += 1;
        games.setTime(time);
        if (time % 10 == 0) {
            var tailLines = generateBottomLine(1);
            games.addTailLines(tailLines);
            socket.emit("addTailLines", tailLines);
        }
        socket.emit('time', time);
    }


    // generate a random type square 
    var generateType = function(){
        return Math.ceil(Math.random()*7) - 1; // 0 - 6
    }

    // randomly generate a rotate number
    var generateDir = function(){
        return Math.ceil(Math.random()*4) - 1; // 0 - 3
    }


    var start = function(){
        var doms = {
            currentDiv: document.getElementById('local_game'),
            nextDiv: document.getElementById('local_next'),
            timeDiv: document.getElementById('local_time'),
            scoreDiv: document.getElementById('local_score'),
            resultDiv: document.getElementById('local_over')
        }
        games = new game();

        // get type, dir and send to opponent 
        var type = generateType();
        var dir = generateDir();

        games.init(doms, type, dir);
        socket.emit('init', {type: type, dir: dir});

        bindKeyEvent();

        // get next square type, dir and send to opponent
        var nextType = generateType();
        var nextDir = generateDir();

        games.proceedNext(nextType, nextDir);
        socket.emit('next', {type: nextType, dir: nextDir});

        timer = setInterval(move, INTERVAL);
    }

    var stop = function() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        document.onkeydown = null;
    }

    // this.start = start;

    socket.on('start', function(){
        document.getElementById('waiting').innerHTML = '';
        start();
    })

    socket.on('lose', function() {
        games.gameResult(true);
        stop();
    })

    socket.on('leave', function() {
        document.getElementById('local_over').innerHTML = "Your opponent has left";
        document.getElementById('remote_over').innerHTML = "Disconnect";
        stop();
    })

    socket.on('bottomLines', function(data) {
        games.addTailLines(data);
        socket.emit('addTailLines', data);
    })

}
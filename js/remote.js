var remote = function (socket) {

    var games;

    var bindEvents = function () {
        socket.on('init', function(data) {
            start(data.type, data.dir);
        });

        socket.on('next', function(data) {
            games.proceedNext(data.type, data.dir);
        });

        socket.on('rotate', function(data) {
            games.rotate();
        });
        socket.on('right', function(data) {
            games.right();
        });
        socket.on('down', function(data) {
            games.down();
        });
        socket.on('left', function(data) {
            games.left();
        });
        socket.on('fall', function(data) {
            games.fall();
        });
        socket.on('fixed', function(data) {
            games.fixed();
        });
        socket.on('line', function(data) {
            games.checkClear();
            games.addScore(data);
        });
        socket.on('time', function(data) {
            games.setTime(data);
        });
        socket.on('lose', function(data) {
            games.gameResult(data);
        });
        socket.on('addTailLines', function(data) {
            games.addTailLines(data);
        });
    }

    var start = function (type, dir) {
        var doms = {
            currentDiv: document.getElementById('remote_game'),
            nextDiv: document.getElementById('remote_next'),
            timeDiv: document.getElementById('remote_time'),
            scoreDiv: document.getElementById('remote_score'),
            resultDiv: document.getElementById('remote_over')
        }
        games = new game();
        games.init(doms, type, dir);
    }

    bindEvents();
}
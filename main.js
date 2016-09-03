"use strict";
var PacmanWs = function(pacman) {
    // this.ws = new WebSocket("ws://172.22.118.161:8888/ws");
    this.ws = new WebSocket("ws://localhost:8888/ws");
    this.pacman = pacman;
    this.ws.onopen = this.wsOpenHandler.bind(this);
    this.ws.onmessage = this.wsMessageHandler.bind(this);
    window.onbeforeunload = function() {
        // http://stackoverflow.com/a/4818541/917957
        this.ws.onclose = function () {}; // disable onclose handler first
        this.ws.close();
    }.bind(this);
};
PacmanWs.prototype.wsOpenHandler = function(event) {
    console.log("Connection opened");
};
PacmanWs.prototype.wsMessageHandler = function(event) {
    var data = JSON.parse(event.data),
        type = data.type;
    console.log(data);
    if (type == 0) { // init msg
        this.pacman.state.user.name = "Kenrick";
        this.pacman.state.user.id = data.player_id;
        this.pacman.state.user.coordinate = [data.x, data.y];
        var msg = {
            type: 0,
            row: Math.floor(this.pacman.canvas.height / this.pacman.config.tile.size / 2),
            col: Math.floor(this.pacman.canvas.width / this.pacman.config.tile.size / 2),
            player_id: this.pacman.state.user.id,
            player_name: this.pacman.state.user.name
        };
        console.log(JSON.stringify(msg));
        this.ws.send(JSON.stringify(msg));
    } else if (type == 1) { // map update
        this.pacman.state.user.score = data.score;

        var newGhosts = [];
        for (var ghostId in data.ghost_pos) {
            if (data.ghost_pos.hasOwnProperty(ghostId)) {
                var ghost = data.ghost_pos[ghostId];
                newGhosts.push({
                    id: ghostId,
                    type: ["ghost_blinky", "ghost_pinky", "ghost_inky", "ghost_clyde"][ghost.ghost_type],
                    orientation: ghost.orientation,
                    coordinate: [ghost.x, ghost.y]
                });
            }
        }
        this.pacman.updateGhosts(newGhosts);
       
        var newPacmans = [];
        for (var pacmanId in data.pac_pos) {
            if (data.pac_pos.hasOwnProperty(pacmanId)) {
                var pacman = data.pac_pos[pacmanId];
                newPacmans.push({
                    id: pacmanId,
                    orientation: pacman.orientation,
                    coordinate: [pacman.x, pacman.y]
                });
            }
        }
        this.pacman.updatePacmans(newPacmans);

        // this.pacman.state.pills = data.food_pos; // ????
        this.pacman.updateMap(data.grids);

    } else if (type == 2) { // die
    }
};

var Pacman = function() {
    this.config = {
        tile: {
            size: 24,
            playerSize: 32,
            color: "#000",
            border: "#1B1BFF",
        },
        playerTypes: {}
    };
    ["ghost_blinky", "ghost_pinky", "ghost_inky", "ghost_clyde"].forEach(function(type) {
        var img = new Image(this.config.tile.playerSize, this.config.tile.playerSize);
        img.src = 'assets/' + type + '.png';
        this.config.playerTypes[type] = img;
    }, this);
    var img = new Image(this.config.tile.playerSize, this.config.tile.playerSize);
    img.src = 'assets/pacman.png';
    this.config.playerTypes['pacman'] = img;

    this.state = {
        map: {
            width: 0,
            height: 0,
            data: {},
        },
        user: {
            name: null,
            id: null,
            coordinate: [0, 0], // coord: (j, i)
            orientation: 0,
            minimum: [0, 0], // coord: (j, i)
            score: 0,
        },
        match: {
            start: false,
            end: false,
        },
        pills: [], // coord: (j, i)
        energizers: [], // coord: (j, i)
        pacmans: [], // coord: (j, i)
        ghosts: [], // (type, coord); type: ghost types (blinky, inky, pinky, or clyde); coord: (j, i)
        status: [],
    };

    // temp data
    this.state.map = JSON.parse('{"width":32,"height":20,"data":{"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1},"1":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":1},"2":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":1,"29":1,"30":0,"31":1},"3":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":1,"29":1,"30":0,"31":1},"4":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":1},"5":{"0":1,"1":1,"2":1,"3":0,"4":1,"5":1,"6":1,"7":1,"8":0,"9":1,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":1,"26":1,"27":1,"28":0,"29":0,"30":0,"31":1},"6":{"0":1,"1":1,"2":1,"3":0,"4":1,"5":1,"6":1,"7":1,"8":0,"9":1,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"7":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":0,"25":1,"26":1,"27":0,"28":0,"29":1,"30":1,"31":1},"8":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":1,"26":1,"27":0,"28":1,"29":1,"30":1,"31":1},"9":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":1,"19":0,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":0,"28":1,"29":1,"30":1,"31":1},"10":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":0,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":1,"19":0,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":0,"28":0,"29":1,"30":1,"31":1},"11":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":0,"30":0,"31":1},"12":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":0,"12":1,"13":1,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"13":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":0,"12":1,"13":1,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"14":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":1,"30":1,"31":1},"15":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"16":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"17":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":0,"15":0,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":0,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"18":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":1,"12":1,"13":1,"14":0,"15":1,"16":1,"17":1,"18":0,"19":0,"20":0,"21":0,"22":1,"23":1,"24":1,"25":0,"26":0,"27":0,"28":0,"29":1,"30":1,"31":1},"19":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1}}}');
    this.state.ghosts = [
        {
            id: 0,
            type: "ghost_blinky",
            coordinate: [2, 4],
            orientation: 0
        },
        {
            id: 1,
            type: "ghost_pinky",
            coordinate: [3, 1],
            orientation: 1
        },
        {
            id: 2,
            type: "ghost_inky",
            coordinate: [3, 4],
            orientation: 2
        },
        {
            id: 3,
            type: "ghost_clyde",
            coordinate: [5, 1],
            orientation: 3
        }
    ];
    this.state.pacmans = [
        {
            id: 4,
            coordinate: [7, 1],
            orientation: 0
        },
        {
            id: 5,
            coordinate: [7, 7],
            orientation: 1
        },
        {
            id: 6,
            coordinate: [9, 1],
            orientation: 2
        },
        {
            id: 7,
            coordinate: [9, 7],
            orientation: 3
        },
    ];

    this.canvas = document.getElementById("canvas");
    this.canvasContext = this.canvas.getContext('2d');
    this.handleWindowResize();
    
    
};
Pacman.prototype.handleWindowResize = function() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight - 50;
    this.drawMap();
};
Pacman.prototype.drawImage = function(i, j, img, offsetX, offsetY) {
    var x = j * this.config.tile.size - 4,
        y = i * this.config.tile.size - 4;
    if (typeof(offsetX) === "undefined") offsetX = 0;
    if (typeof(offsetY) === "undefined") offsetY = 0;
    this.canvasContext.save();
    this.canvasContext.clearRect(x, y, this.config.tile.playerSize, this.config.tile.playerSize);
    this.canvasContext.drawImage(img, offsetX, offsetY, this.config.tile.playerSize, this.config.tile.playerSize, x, y, this.config.tile.playerSize, this.config.tile.playerSize);
    this.canvasContext.restore();
};
Pacman.prototype.drawRect = function(i, j, fillStyle) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size,
        width = this.config.tile.size,
        height = this.config.tile.size,
        fill = fillStyle;
    if (fillStyle === undefined) {
        fill = this.config.tile.color;
    }
    this.canvasContext.save();
    this.canvasContext.fillStyle = fill;
    this.canvasContext.strokeStyle = this.config.tile.border;
    this.canvasContext.fillRect(x, y, width, height);
    this.canvasContext.strokeRect(x, y, width, height);
    this.canvasContext.restore();
}
Pacman.prototype.drawWall = function(i, j) {
    if (i < 0 || j < 0 || i >= this.state.map.height || j >= this.state.map.width || !this.isWall(i, j)) {
        return false;
    }
    var tileSize = this.config.tile.size,
        radius = Math.floor(tileSize / 2);
    this.canvasContext.save();
    this.canvasContext.lineWidth = 3;
    this.canvasContext.strokeStyle = this.config.tile.border;
    this.canvasContext.beginPath();
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0],
        x = adjusted_j * tileSize,
        y = adjusted_i * tileSize;
    
    switch (this.wallType(i, j)) {
        case 1:
            this.canvasContext.arc(x + tileSize, y + tileSize, radius, Math.PI,  3 * Math.PI / 2, false);
            break;
        case 2:
            this.canvasContext.arc(x + tileSize, y, radius, Math.PI, Math.PI / 2, true);
            break;
        case 3:
            this.canvasContext.arc(x, y + tileSize, radius, 3 * Math.PI / 2, 0, false);
            break;
        case 4:
            this.canvasContext.arc(x, y, radius, Math.PI / 2,  2 * Math.PI, true);
            break;
        case 5:
            this.canvasContext.moveTo(x + radius, y);
            this.canvasContext.lineTo(x + radius, y + tileSize);
            break;
        case 6:
            this.canvasContext.moveTo(x, y + Math.floor(tileSize / 2));
            this.canvasContext.lineTo(x + tileSize, y + Math.floor(tileSize / 2));
            break;
    }
    this.canvasContext.stroke();
    this.canvasContext.restore();
    
}
Pacman.prototype.wallType = function(i, j) {
    var neighbors = [
        this.isWall(i - 1, j - 1),
        this.isWall(i - 1, j),
        this.isWall(i - 1, j + 1),
        this.isWall(i, j - 1),
        this.isWall(i, j + 1),
        this.isWall(i + 1, j - 1),
        this.isWall(i + 1, j),
        this.isWall(i + 1, j + 1),
    ];
    var types = [
        false, // empty
        (!neighbors[0] && !neighbors[1] && !neighbors[3]) || (neighbors[4] && neighbors[6] && !neighbors[7]), // ┌
        (!neighbors[3] && !neighbors[5] && !neighbors[6]) || (neighbors[1] && neighbors[4] && !neighbors[2]), // └
        (!neighbors[1] && !neighbors[2] && !neighbors[4]) || (neighbors[3] && neighbors[6] && !neighbors[5]), // ┐
        (!neighbors[4] && !neighbors[6] && !neighbors[7]) || (neighbors[1] && neighbors[3] && !neighbors[0]), // ┘
        !neighbors[3] || !neighbors[4], // |
        !neighbors[1] || !neighbors[6], // -
    ];
    return types.indexOf(true);

}
Pacman.prototype.isWall = function(i, j) {
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0];
    if (adjusted_i < 0 || adjusted_j < 0 || adjusted_i >= this.state.map.height || adjusted_j >= this.state.map.width) {
        return true;
    }
    return (this.state.map.data[adjusted_i][adjusted_j] == 1);
};
Pacman.prototype.drawPacman = function(i, j, orientation) {
    this.animateEatingPacman(i, j, orientation, 0);
};
Pacman.prototype.drawGhost = function(i, j, type, orientation) {
    this.drawImage(i, j, this.config.playerTypes[type], this.config.tile.playerSize * orientation, 0);
};
Pacman.prototype.drawPlayers = function() {
    this.state.ghosts.forEach(function(player) {
        var i = player.coordinate[1] - this.state.user.minimum[1],
            j = player.coordinate[0] - this.state.user.minimum[0];
        this.drawGhost(i, j, player.type, player.orientation);
    }, this);

    this.state.pacmans.forEach(function(player) {
        var i = player.coordinate[1] - this.state.user.minimum[1],
            j = player.coordinate[0] - this.state.user.minimum[0];
        this.drawPacman(i, j, player.orientation);
    }, this);
};
Pacman.prototype.updateGhosts = function (newGhosts) {
    newGhosts.forEach(function (newGhost) {
        var oldGhost = this.state.ghosts.find((v) => { return v.id == newGhost.id });
        if (typeof(oldGhost) === "undefined" || true) {
            this.drawGhost(
                newGhost.coordinate[1] - this.state.user.minimum[1],
                newGhost.coordinate[0] - this.state.user.minimum[0],
                newGhost.type,
                newGhost.orientation
            );
        }
    }, this);
};
Pacman.prototype.updatePacmans = function (newPacmans) {
    newPacmans.forEach(function (newPacman) {
        var oldPacman = this.state.pacmans.find((v) => { return v.id == newPacman.id });
        if (typeof(oldPacman) === "undefined" || true) {
            this.drawPacman(
                newPacman.coordinate[1] - this.state.user.minimum[1],
                newPacman.coordinate[0] - this.state.user.minimum[0],
                newPacman.orientation
            );
        }
    }, this);
};


Pacman.prototype.animateEatingPacman = function(i, j, orientation, tick) {
    var o = Math.floor(tick / 3) % 6;
    if (o > 3) {
        o = 6 - o;
    }
    tick = tick % 1000;
    this.drawImage(i, j, this.config.playerTypes['pacman'], this.config.tile.playerSize * o, this.config.tile.playerSize * orientation);
    requestAnimationFrame(function () {
        this.animateEatingPacman(i, j, orientation, tick + 1);
    }.bind(this));
}
Pacman.prototype.clearMap = function () {
    this.canvasContext.save();
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasContext.restore();
}
Pacman.prototype.drawMap = function () {
    this.clearMap();
    for (var i = 0; i < this.state.map.height; i++) {
        for (var j = 0; j < this.state.map.width; j++) {
            this.drawWall(i, j);
        }
    }
    this.drawPlayers();
};


Pacman.prototype.updateMap = function(data) {
    console.log(data);
    this.state.map.height = data.length;
    this.state.map.width = data[0].length;

    for (var i = 0; i < this.state.map.height; i++) {
        for (var j = 0; j < this.state.map.width; j++) {
            this.state.map[i][j] = data[i][j];
        }
    }
    this.drawMap();
};

function setResizeHandler(callback, timeout) {
    // http://stackoverflow.com/questions/5825447/javascript-event-for-canvas-resize
    var timer_id = null;
    window.addEventListener("resize", function() {
        if (timer_id != null) {
            clearTimeout(timer_id);
            timer_id = null;
        }
        timer_id = setTimeout(function() {
            timer_id = null;
            callback();
        }, timeout);
    });
}
document.addEventListener("DOMContentLoaded", function () {
    var pacman = new Pacman();
    pacman.drawMap();
    var pacmanWs = new PacmanWs(pacman);
    console.log(pacmanWs);

    document.querySelector("#overlay").style.display = "none";
    document.querySelector("#cancel").style.display = "none";
    document.querySelector("#start").style.display = "none";
    document.querySelector("#prompt").style.display = "none";
    setResizeHandler(pacman.handleWindowResize.bind(pacman), 100);
}, false);

"use strict";
var PacmanWs = function(pacman) {
    this.ws = new WebSocket("ws://172.22.118.161:8888/ws");
    // this.ws = new WebSocket("ws://localhost:8888/ws");
    this.pacman = pacman;
    this.ws.onopen = this.wsOpenHandler.bind(this);
    this.ws.onmessage = this.wsMessageHandler.bind(this);
    window.onbeforeunload = function() {
        this.ws.send(JSON.stringify({type: 1, player_id: this.pacman.state.user.id}));
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
        this.pacman.state.user.minimum = [Math.max(0, data.x - 16), Math.max(0, data.y - 9)];
        var msg = {
            type: 0,
            player_id: this.pacman.state.user.id,
            player_name: this.pacman.state.user.name,
            arrow: 4
        };
        this.ws.send(JSON.stringify(msg));

        window.addEventListener("keypress", function(event) {
            var arrow = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].indexOf(event.key);
            if (arrow < 0)
                arrow = 4;
            var msg = {
                type: 0,
                player_id: this.pacman.state.user.id,
                player_name: this.pacman.state.user.name,
                arrow: arrow
            };
            this.ws.send(JSON.stringify(msg));
        }.bind(this), false);

    } else if (type == 1) { // map update
        this.pacman.state.user.score = data.score;
        document.querySelector("#score").textContent = data.score;

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
        var newPacmans = [], new_x = 0, new_y = 0;
        for (var pacmanId in data.pac_pos) {
            if (data.pac_pos.hasOwnProperty(pacmanId)) {
                var pacman = data.pac_pos[pacmanId];
                newPacmans.push({
                    id: pacmanId,
                    orientation: pacman.orientation,
                    coordinate: [pacman.x, pacman.y]
                });

                if (this.pacman.state.user.id == pacmanId) {
                    new_x = pacman.x;
                    new_y = pacman.y;
                }
            }
        }
        this.pacman.state.user.minimum = [Math.max(0, new_x - 16), Math.max(0, new_y - 9)];

        this.pacman.updateGhosts(newGhosts);
        this.pacman.updatePacmans(newPacmans);
        this.pacman.updatePill(data.food_pos);
        this.pacman.updateEnergizer(data.power_up_pos);
        this.pacman.updateMap(data.grids);

    } else if (type == 2) { // die
        window.alert("Game Over!");
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
        pill: {
            color: "#FFFF00",
            radius: 5,
        },
        energizer: {
            color: "#FFFF00",
            radius: 8,
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
        ghosts: [], // (type, coord); type: ghost types (blinky, pinky, inky, or clyde); coord: (j, i)
        status: [],
        animationList: []
    };

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
Pacman.prototype.drawTile = function(i, j) {
    if (i < 0 || j < 0 || i >= this.state.map.height || j >= this.state.map.width) {
        return false;
    }
    if (this.isWall(i, j)) {
        this.drawWall(i, j);
    } else if (this.isPill(i, j) || this.isEnergizer(i, j)) { // may be pill or energizers
        this.drawFood(i, j);
    }
}
Pacman.prototype.drawFood = function(i, j) {
    var tileSize = this.config.tile.size,
        radius = this.config.pill.radius,
        color = this.config.pill.color;
    if (this.isEnergizer(i, j)) {
        radius = this.config.energizer.radius;
        color = this.config.energizer.color;
    }
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0],
        x = j * tileSize,
        y = i * tileSize;
    this.canvasContext.save();
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(x + tileSize / 2, y + tileSize / 2, radius, 0,  2 * Math.PI, false);
    this.canvasContext.fill();
    this.canvasContext.restore();
};
Pacman.prototype.drawWall = function(i, j) {
    var tileSize = this.config.tile.size,
        radius = Math.floor(tileSize / 2);
    this.canvasContext.save();
    this.canvasContext.lineWidth = 3;
    this.canvasContext.strokeStyle = this.config.tile.border;
    this.canvasContext.beginPath();
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0],
        x = j * tileSize,
        y = i * tileSize;
    
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
    if (i < 0 || j < 0 || i >= this.state.map.height || j >= this.state.map.width) {
        return true;
    }
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0];
    return (this.state.map.data[adjusted_i][adjusted_j] == 1);
};
Pacman.prototype.isEnergizer = function(i, j) {
    if (i < 0 || j < 0 || i >= this.state.map.height || j >= this.state.map.width) {
        return false;
    }
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0];
    return (this.state.energizers.findIndex((v) => { return v[1] === adjusted_i && v[0] === adjusted_j; }) > 0);
}
Pacman.prototype.isPill = function(i, j) {
    if (i < 0 || j < 0 || i >= this.state.map.height || j >= this.state.map.width) {
        return false;
    }
    var adjusted_i = i + this.state.user.minimum[1],
        adjusted_j = j + this.state.user.minimum[0];
    return (this.state.pills.findIndex((v) => { return v[1] === adjusted_i && v[0] === adjusted_j; }) > 0);
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
    this.state.ghosts = [];
    newGhosts.forEach(function (newGhost) {
        this.state.ghosts.push(newGhost);
    }, this);
};
Pacman.prototype.updatePacmans = function (newPacmans) {
    this.state.pacmans = [];
    newPacmans.forEach(function (newPacman) {
        this.state.pacmans.push(newPacman);
    }, this);
};
Pacman.prototype.updatePill = function(data) {
    this.state.pills = [];
    data.forEach((v) => {
        this.state.pills.push([v.x, v.y]);
    }, this);
};
Pacman.prototype.updateEnergizer = function(data) {
    this.state.energizers = [];
    data.forEach((v) => {
        this.state.energizers.push([v.x, v.y]);
    }, this);
};

Pacman.prototype.animateEatingPacman = function(i, j, orientation, tick) {
    var o = Math.floor(tick / 3) % 6;
    if (o > 3) {
        o = 6 - o;
    }
    tick = tick % 1000;
    this.drawImage(i, j, this.config.playerTypes['pacman'], this.config.tile.playerSize * o, this.config.tile.playerSize * orientation);
    this.state.animationList.push(requestAnimationFrame(function () {
        this.animateEatingPacman(i, j, orientation, tick + 1);
    }.bind(this)));
}
Pacman.prototype.clearMap = function () {
    this.canvasContext.save();
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasContext.restore();
    this.state.animationList.forEach((v) => {
        cancelAnimationFrame(v);
    });
    this.state.animationList = [];
}
Pacman.prototype.drawMap = function () {
    this.clearMap();
    for (var i = 0; i < this.state.map.height; i++) {
        for (var j = 0; j < this.state.map.width; j++) {
            this.drawTile(i, j);
        }
    }
    this.drawPlayers();
};

Pacman.prototype.updateMap = function(data) {
    this.state.map.height = data.length;
    this.state.map.width = data[0].length;

    for (var i = 0; i < this.state.map.height; i++) {
        if (!((this.state.user.minimum[1] + i) in this.state.map.data)) {
            this.state.map.data[this.state.user.minimum[1] + i] = {};
        }
        for (var j = 0; j < this.state.map.width; j++) {
            this.state.map.data[this.state.user.minimum[1] + i][this.state.user.minimum[0] + j] = data[i][j];
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
    document.querySelector("#overlay").style.display = "none";
    document.querySelector("#cancel").style.display = "none";
    document.querySelector("#start").style.display = "none";
    document.querySelector("#prompt").style.display = "none";
    var pacman = new Pacman();
    pacman.drawMap();
    var pacmanWs = new PacmanWs(pacman);
    console.log(pacmanWs);

    setResizeHandler(pacman.handleWindowResize.bind(pacman), 100);
}, false);

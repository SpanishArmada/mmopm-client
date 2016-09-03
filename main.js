"use strict";
var Pacman = function() {
    this.config = {
        tile: {
            size: 32,
            color: "#000",
            border: "#1B1BFF",
        }, 
        online: false,
        playerTypes: {}
    };
    ["ghost_blinky", "ghost_pinky", "ghost_inky", "ghost_clyde"].forEach(function(type) {
        var img = new Image(this.config.tile.size, this.config.tile.size);
        img.src = 'assets/' + type + '.png';
        this.config.playerTypes[type] = img;
    }, this);
    var img = new Image(this.config.tile.size, this.config.tile.size);
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
            index: null,
            coordinate: [0, 0], // coord: (x, y)
            orientation: 0,
            minimum: [0, 0], // coord: (x, y)
        },
        match: {
            start: false,
            end: false,
        },
        pills: [], // coord: (x, y)
        energizers: [], // coord: (x, y)
        players: [], // (type, coord); type: pacman or ghost; coord: (x, y)
        status: [],
    };
    this.temp = {
        drawnTiles: []
    };

    // temp data
    this.state.map = JSON.parse('{"width":32,"height":20,"data":{"0":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1},"1":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":1},"2":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":1,"29":1,"30":0,"31":1},"3":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":1,"29":1,"30":0,"31":1},"4":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":1},"5":{"0":1,"1":1,"2":1,"3":0,"4":1,"5":1,"6":1,"7":1,"8":0,"9":1,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":1,"26":1,"27":1,"28":0,"29":0,"30":0,"31":1},"6":{"0":1,"1":1,"2":1,"3":0,"4":1,"5":1,"6":1,"7":1,"8":0,"9":1,"10":1,"11":1,"12":1,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"7":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":0,"25":1,"26":1,"27":0,"28":0,"29":1,"30":1,"31":1},"8":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":1,"26":1,"27":0,"28":1,"29":1,"30":1,"31":1},"9":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":1,"19":0,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":0,"28":1,"29":1,"30":1,"31":1},"10":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":0,"8":1,"9":1,"10":0,"11":1,"12":1,"13":0,"14":1,"15":1,"16":1,"17":1,"18":1,"19":0,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":0,"28":0,"29":1,"30":1,"31":1},"11":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":0,"30":0,"31":1},"12":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":0,"12":1,"13":1,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"13":{"0":1,"1":0,"2":1,"3":1,"4":0,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":0,"12":1,"13":1,"14":1,"15":1,"16":0,"17":1,"18":1,"19":1,"20":1,"21":1,"22":0,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"14":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":1,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":1,"30":1,"31":1},"15":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"16":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"17":{"0":1,"1":0,"2":1,"3":1,"4":1,"5":1,"6":0,"7":1,"8":1,"9":1,"10":0,"11":1,"12":1,"13":1,"14":0,"15":0,"16":0,"17":0,"18":0,"19":1,"20":1,"21":0,"22":0,"23":0,"24":0,"25":0,"26":1,"27":1,"28":0,"29":1,"30":1,"31":1},"18":{"0":1,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":1,"12":1,"13":1,"14":0,"15":1,"16":1,"17":1,"18":0,"19":0,"20":0,"21":0,"22":1,"23":1,"24":1,"25":0,"26":0,"27":0,"28":0,"29":1,"30":1,"31":1},"19":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1}}}');
    this.state.players = [
        {
            type: "ghost_blinky",
            coordinate: [2, 4],
            orientation: 0
        },
        {
            type: "ghost_pinky",
            coordinate: [3, 4],
            orientation: 1
        },
        {
            type: "ghost_inky",
            coordinate: [4, 4],
            orientation: 2
        },
        {
            type: "ghost_clyde",
            coordinate: [5, 4],
            orientation: 3
        },
        {
            type: "pacman",
            coordinate: [6, 4],
            orientation: 0
        },
        {
            type: "pacman",
            coordinate: [7, 4],
            orientation: 1
        },
        {
            type: "pacman",
            coordinate: [8, 4],
            orientation: 2
        },
        {
            type: "pacman",
            coordinate: [9, 4],
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
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    if (typeof(offsetX) === "undefined") offsetX = 0;
    if (typeof(offsetY) === "undefined") offsetY = 0;
    this.canvasContext.save();
    this.canvasContext.drawImage(img, offsetX, offsetY, this.config.tile.size, this.config.tile.size, x, y, this.config.tile.size, this.config.tile.size);
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
}
Pacman.prototype.drawPlayer = function(i, j, orientation, type) {
    if (type.search("ghost") === 0) {
        this.drawImage(i, j, this.config.playerTypes[type], this.config.tile.size * orientation, 0);
    } else { // pacman
        this.drawImage(i, j, this.config.playerTypes[type], this.config.tile.size * 3, this.config.tile.size * orientation);
    }
}

Pacman.prototype.drawMap = function () {
    for (var i = 0; i < this.state.map.height; i++) {
        for (var j = 0; j < this.state.map.width; j++) {
            this.drawWall(i, j);
        }
    }
    this.state.players.forEach(function(player) {
        var i = player.coordinate[1] - this.state.user.minimum[1],
            j = player.coordinate[0] - this.state.user.minimum[0];
        this.drawPlayer(i, j, player.orientation, player.type);
    }, this);
};


Pacman.prototype.updateMap = function(data) {
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
    document.querySelector("#overlay").style.display = "none";
    document.querySelector("#cancel").style.display = "none";
    document.querySelector("#start").style.display = "none";
    document.querySelector("#prompt").style.display = "none";
    setResizeHandler(pacman.handleWindowResize.bind(pacman), 100);
}, false);

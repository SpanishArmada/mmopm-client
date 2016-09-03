"use strict";
var Pacman = function() {
    this.config = {
        tile: {
            size: 32
        }, 
        online: false
    };

    this.state = {
        map: {
            width: 0,
            height: 0,
            data: {},
        },
        user: {
            name: null,
            index: null,
            coordinate: (0, 0),
            orientation: 0
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

    this.canvas = document.getElementById("canvas");
    this.handleWindowResize();
    
    this.canvasContext = this.canvas.getContext('2d');
    
};
Pacman.prototype.handleWindowResize = function() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight - 50;
    this.state.map.height = Math.ceil(this.canvas.height / this.config.tile.size);
    this.state.map.width = Math.ceil(this.canvas.width / this.config.tile.size);
};
Pacman.prototype.drawImage = function(i, j, img) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.drawImage(img, x, y);
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
    if (i < 0 || j < 0) {
        return false;
    }
};

Pacman.prototype.drawMap = function () {
    for (var i = 0; i < this.state.map.height; i++) {
        for (var j = 0; j < this.state.map.width; j++) {
            this.drawTile(i, j);
        }
    }
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
    document.querySelector("#cancel").style.display = "none";
    document.querySelector("#start").style.display = "none";
    document.querySelector("#prompt").style.display = "none";
    setResizeHandler(pacman.handleWindowResize.bind(pacman), 500);
}, false);

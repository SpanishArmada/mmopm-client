var x = [
    "11111111111111111111111111111111".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000000000001100000000001".split('').map((v) => { return parseInt(v, 10); }),
    "10111101101110111101101101111101".split('').map((v) => { return parseInt(v, 10); }),
    "10111101101110111101101101111101".split('').map((v) => { return parseInt(v, 10); }),
    "10000000001110110001101100000001".split('').map((v) => { return parseInt(v, 10); }),
    "11101111011110110111100001110001".split('').map((v) => { return parseInt(v, 10); }),
    "11101111011110110111111101110111".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000000110111111101100111".split('').map((v) => { return parseInt(v, 10); }),
    "10110111110110000000000001101111".split('').map((v) => { return parseInt(v, 10); }),
    "10110111110110111110110111101111".split('').map((v) => { return parseInt(v, 10); }),
    "10110110110110111110110111100111".split('').map((v) => { return parseInt(v, 10); }),
    "10110000000000000000000111110001".split('').map((v) => { return parseInt(v, 10); }),
    "10110111111011110111110111110111".split('').map((v) => { return parseInt(v, 10); }),
    "10110111111011110111110111110111".split('').map((v) => { return parseInt(v, 10); }),
    "10000011000000000000000000000111".split('').map((v) => { return parseInt(v, 10); }),
    "10111111110111111111101111110111".split('').map((v) => { return parseInt(v, 10); }),
    "10111111110111111111101111110111".split('').map((v) => { return parseInt(v, 10); }),
    "10111101110111000001100000110111".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000111011100001110000111".split('').map((v) => { return parseInt(v, 10); }),
    "11111111111111111111111111111111".split('').map((v) => { return parseInt(v, 10); }),
];
var y = {
    width: x[0].length,
    height: x.length,
    data: {}
};

for (var i = 0; i < x.length; i++) {
    y.data[i] = {};
    for (var j = 0; j < x[i].length; j++) {
        y.data[i][j] = x[i][j];
    }
}
console.log(JSON.stringify(y));

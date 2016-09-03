var x = [
    "11111111111111111111111111111111".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000000000001000000000001".split('').map((v) => { return parseInt(v, 10); }),
    "10111101011111111101011110111101".split('').map((v) => { return parseInt(v, 10); }),
    "10000001000000000001000000000001".split('').map((v) => { return parseInt(v, 10); }),
    "10111101011111101101011111111101".split('').map((v) => { return parseInt(v, 10); }),
    "10000001000000101101000000000001".split('').map((v) => { return parseInt(v, 10); }),
    "11101111011110100000010101010101".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000110111101110101000101".split('').map((v) => { return parseInt(v, 10); }),
    "10111001110110000000000101101101".split('').map((v) => { return parseInt(v, 10); }),
    "10110011100010111110110101100111".split('').map((v) => { return parseInt(v, 10); }),
    "10110110101010111110110101110111".split('').map((v) => { return parseInt(v, 10); }),
    "10110000001000000000000101100001".split('').map((v) => { return parseInt(v, 10); }),
    "10110111111101110111110100001011".split('').map((v) => { return parseInt(v, 10); }),
    "10110011111101110111100111011111".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000100000000000000000001".split('').map((v) => { return parseInt(v, 10); }),
    "10111111110001111111101111110101".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000100010000001111110101".split('').map((v) => { return parseInt(v, 10); }),
    "10111101110101010101100000110001".split('').map((v) => { return parseInt(v, 10); }),
    "10000000000101000100001110000101".split('').map((v) => { return parseInt(v, 10); }),
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

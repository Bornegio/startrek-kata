const Point = require('./point');

function cityBlockDistance(x1, y1, x2, y2)
{
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function randomUniques(min, max, length){
    let uniques = new Set();
    if (length > max - min)
        throw new RangeError('Providen length is bigger than range');
    while(uniques.size < length){
        let rnd = Math.floor(Math.random() * (max - min)) + min
        uniques.add(rnd);
    }
    return Array.from(uniques);
}

function hasSamePos(pos1, pos2){
    return (pos1.x == pos2.x && pos1.y == pos2.y);
}

function inRange(value, min, max){
    if (min > max)
        throw new RangeError('Min value cannot be biger than max');
    return value >= min && value <= max;
}

module.exports = {
    cityBlockDistance,
    randomUniques,
    hasSamePos,
    inRange
};

const SpaceShip = require("../core/spaceShip");
const Point = require("../utils/point");
const mathSupport = require("../utils/mathSupport");
const Galaxy = require("./galaxy");

class Game {
    constructor(config) {
        this.gameConfig = config;
        this.player = new SpaceShip(new Point(3, 3), new Point(3, 3), config.MAX_POWER);
        this.galaxy = new Galaxy(config.GALAXY);
        this.isOver = false;
        this.starDates = config.INITIAL_STARDATES;
        this.knownGalaxy = [];
        for (let i = 0; i < Math.sqrt(config.GALAXY.QUADRANTS); i++) {
            this.knownGalaxy.push([]);
            for (let j = 0; j < Math.sqrt(config.GALAXY.QUADRANTS); j++) {
                this.knownGalaxy[i].push(["?", "?", "?"]);
            }
        }
    }

    makeKlingonsTurn() {
        this.galaxy.removeDestroyed();
        this.galaxy.getQuadrantObjects(this.player.quadrant).forEach((so, i) => {
            if (so.type == "ship" ) {
                let distanceToPlayer = mathSupport.cityBlockDistance(
                    this.player.sector.x,
                    this.player.sector.y,
                    so.sector.x,
                    so.sector.y
                );
                let dmg = 30;
                so.reducePower(dmg);
                let hasHit = Math.random() < (5 / (distanceToPlayer + 4));
                if(hasHit){
                    console.log(`Klingons has attacked and hit you! You lose ${dmg} power.`);
                    this.player.reducePower(dmg);
                } else {
                    console.log('Klingons has attacked, but missed.');
                }
            }
        });
    }

    playerShoot(power){
        if(power >= this.player.power){
            console.log('You do not have enough power!');
            return;
        }
        let closestKlingons = this.galaxy.getQuadrantObjects(this.player.quadrant)
            .filter(so => so.type == 'ship')
            .sort((prev, cur) => {
                let prevDist = mathSupport.cityBlockDistance(this.player.sector.x, this.player.sector.y, prev.sector.x, prev.sector.y);
                let curDist = mathSupport.cityBlockDistance(this.player.sector.x, this.player.sector.y, cur.sector.x, cur.sector.y);
                return prevDist > curDist;
            });
        if(closestKlingons.length <= 0){
            console.log('There is no remaining klingons in your current quadrant');
        } else {
            this.player.reducePower(power);
            let distanceToPlayer = mathSupport.cityBlockDistance(
                this.player.sector.x,
                this.player.sector.y,
                closestKlingons[0].sector.x,
                closestKlingons[0].sector.y
            );
            let hasHit = Math.random() < (5 / (distanceToPlayer + 4));
            if (hasHit){
                closestKlingons[0].reducePower(power);
                if(closestKlingons[0].power <= 0){
                    closestKlingons[0].isDestroyed = true;
                    console.log('You have destroyed klingon!');
                } else {
                    console.log(`You have hit klingon, enemy has ${closestKlingons[0].power} more power.`);
                }
            } else {
                console.log('You missed!');
            }
        }
    }

    movePlayer(xOffset, yOffset) {
        const prevousSectorNumber = this.galaxy.getSectorNumberFromPosition(this.player.quadrant, this.player.sector);
        const prevousGlobalPos = this.galaxy.getGlobalPositionFromSectorNumber(prevousSectorNumber);
        const newSectorNumber = prevousSectorNumber + xOffset + yOffset * 64;
        const newQuadrant = this.galaxy.getQuadrantFromSectorNumber(newSectorNumber);
        const newSector = this.galaxy.getSectorFromSectorNumber(newSectorNumber);
        const currentGlobalPos = this.galaxy.getGlobalPositionFromSectorNumber(newSectorNumber);
        const quadrantDistance = mathSupport.cityBlockDistance(
            this.player.quadrant.x,
            this.player.quadrant.y,
            newQuadrant.x,
            newQuadrant.y
        );
        const distanceTraveled = mathSupport.cityBlockDistance(
            prevousGlobalPos.x,
            prevousGlobalPos.y,
            currentGlobalPos.x,
            currentGlobalPos.y
        );
        if (
            mathSupport.inRange(prevousGlobalPos.x + xOffset, 0, 63) &&
            mathSupport.inRange(prevousGlobalPos.y + yOffset, 0, 63) &&
            this.starDates - quadrantDistance >= 0 &&
            this.player.power - distanceTraveled > 0
        ) {
            if (!mathSupport.hasSamePos(this.player.quadrant, newQuadrant))
                this.galaxy.shuffleQuadrant(this.player.quadrant);

            this.starDates -= quadrantDistance;
            this.player.setPosition(newQuadrant, newSector);
            this.player.reducePower(distanceTraveled);
            this.detectPlayerCollisions();
        } else if (this.starDates - quadrantDistance < 0) {
            console.log("You do not have enough time to travel there!");
        } else if (this.player.power - distanceTraveled <= 0) {
            console.log("You do not have enough power to travel there!");
        } else {
            console.log("You cannot leave the galaxy!");
        }
    }

    detectPlayerCollisions() {
        this.galaxy.getQuadrantObjects(this.player.quadrant).forEach(so => {
            if (mathSupport.hasSamePos(so.sector, this.player.sector)) {
                this.player.isDestroyed = true;
                return;
            } else if (so.type == "starbase") {
                this.galaxy.getSurrouningSectors(so.sector).forEach(p => {
                    if (mathSupport.hasSamePos(p, this.player.sector)) this.player.power = this.gameConfig.MAX_POWER;
                });
            }
        });
    }

    longScan() {
        const types = {
            "ship": 0,
            "starbase": 1,
            "star": 2
        };
        let scanResult = [];
        for (let y = 0; y < 3; y++) {
            let qY = this.player.quadrant.y - 1 + y;
            if (mathSupport.inRange(qY, 0, 7)) {
                scanResult.push([]);
                for (let x = 0; x < 3; x++) {
                    let qX = this.player.quadrant.x - 1 + x;
                    if (mathSupport.inRange(qX, 0, 7)) {
                        let objectsCounter = [0, 0, 0];
                        this.galaxy
                            .getQuadrantObjects(new Point(qX, qY))
                            .forEach(so => objectsCounter[types[so.type]]++);
                        scanResult[scanResult.length - 1].push(objectsCounter);
                        this.knownGalaxy[qY][qX] = objectsCounter;
                    }
                }
            }
        }
        return scanResult;
    }

    checkIfOver() {
        const klingonsInCurrentQuadrant = this.galaxy
            .getQuadrantObjects(this.player.quadrant)
            .filter(so => so.type == "ship").length;

        if (this.player.isDestroyed) {
            this.isOver = true;
            console.log("You LOSE! Enterprise has been destroyed!");
        } else if (this.player.power <= 0) {
            this.isOver = true;
            console.log("You LOSE! Enterprise used all the power!");
        } else if (this.starDates <= 0 && klingonsInCurrentQuadrant == 0 && this.galaxy.getRemainingKlingons() > 0) {
            this.isOver = true;
            console.log(`You LOSE! You didn't destroy klingons in ${this.gameConfig.INITIAL_STARDATES} stardates!`);
        } else if (this.galaxy.getRemainingKlingons() <= 0) {
            this.isOver = true;
            console.log("You WIN! You destroyed all klingons in " + this.gameConfig.INITIAL_STARDATES - this.starDates);
        }
    }
}

module.exports = Game;

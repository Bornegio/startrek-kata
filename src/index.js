/**
 * The author is aware that the following code could be more elegant, especially when I use the library like 
 * `readline-sync` or `Inquirer.js`.
 * Yet, for simplicity, I've used a very clean and uncomplicated approach based on the variable `mode` and the set of 
 * constants.
 */
const inputReader = require('./utils/inputReader');
const renderer = require('./utils/renderer');
const Game = require('./core/game');
const config = require('./config');

const COMMANDS_MODE = 0, MANOEUVRE_MODE = 1, BATTLE_MODE = 2;

let mode = COMMANDS_MODE; // the current mode
const game = new Game(config);

while (true)
{
    if (mode === COMMANDS_MODE) { // the normal commands mode
        
        let command = inputReader.readCommand();
        switch (command) { // fill all commands here
            case inputReader.MANOEUVRE_COMMAND:
                console.log('ENTERING INTO THE MANOEUVRE MODE');
                mode = MANOEUVRE_MODE;
                break;
            case inputReader.BATTLE_COMMAND:
                console.log('ENTERING INTO THE BATTLE MODE');
                mode = BATTLE_MODE;
                break;
            case inputReader.SHORT_SCAN_COMMAND:
                console.log(renderer.renderQuadrant(game.player, game.galaxy.getQuadrant(game.player.quadrant)));
                break;
        }
        
    } else if (mode === MANOEUVRE_MODE) { // the movement of Enterprise
        
        let vector = inputReader.readVector();
        mode = COMMANDS_MODE;
        game.movePlayer(vector[0], vector[1]);
        
    } else if (mode === BATTLE_MODE) { // the battle protocol
        
        console.log('ENTERPRISE HAS ? ENERGY'); // please code the right thing here
        let amountOfEnergy = inputReader.readAmountOfEnergy();
        if (amountOfEnergy === 0) {
            console.log('ENTERING INTO THE COMMANDS MODE');
            mode = COMMANDS_MODE;
        }
        
    }
    console.log(renderer.displayPlayerRaport(game.player) + ', REMAINING STARDATES: ' + game.starDates);
}
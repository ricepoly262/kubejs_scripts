// configurable script to block players from specific dimensions

const BLACKLIST = ['minecraft:the_end'] // list of blacklisted dimensions

const SAFE_DIM = 'minecraft:overworld' // the dimension the player will be teleported to 
const SAFE_SPOT = [0,200,0] // the position the player will be teleported to

const ALLOW_OPS = true; // allow operators to enter blacklisted dimensions

const CHECK_INTERVAL = 5 // how often in seconds it checks player positions







const check_interval_ms = CHECK_INTERVAL * 1000;
var scheduled = 0;


function inBadDim(ply){ // check if players are in a bad dimension
    let y = ply.y;
    let dim = ply.level.dimension;

    var rtn = false; // weird thing since returning inside forEach breaks anonymous function but not the parent function

    if(ply.op && ALLOW_OPS){rtn = true;}

    BLACKLIST.forEach(dimension => {
        if( dim == dimension ){
            rtn = true;
       }

	})
    return rtn;
}



let schedule = (event) => event.server.schedule(check_interval_ms, () => { // main, checks player positions

    event.server.players.forEach(player => { // loop through every player  
        let x = inBadDim(player);

        if(x){
            event.server.runCommandSilent(`execute in ${SAFE_DIM} run tp ${player.name.string} ${SAFE_SPOT[0]} ${SAFE_SPOT[1]} ${SAFE_SPOT[2]}`);
            player.tell("You cannot go there!");
        }

    })

    schedule(event) // recursion

})


onEvent('server.tick', event => { // init
    if(scheduled == 0){
        schedule(event);
        scheduled = 1;
    }
})
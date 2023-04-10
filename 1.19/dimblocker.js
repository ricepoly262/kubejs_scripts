// DimBlocker
// Script to block players from specific dimensions
var DimBlocker = {};

DimBlocker.BLACKLIST = ['minecraft:the_end'] // List of blacklisted dimensions, ex: ['minecraft:the_end','mod:dimension_name']

DimBlocker.SAFE_DIM = 'minecraft:overworld' // the dimension the player will be teleported to 
DimBlocker.SAFE_SPOT = [0,200,0] // the position the player will be teleported to

DimBlocker.ALLOW_OPS = true; // allow operators to enter blacklisted dimensions

DimBlocker.CHECK_INTERVAL = 5 // how often in seconds it checks player positions







DimBlocker.check_interval_ms = DimBlocker.CHECK_INTERVAL * 1000;
DimBlocker.scheduled = 0;


DimBlocker.inBadDim = (ply) => { // check if players are in a bad dimension
    let dim = ply.level.dimension;

    var rtn = false; // returning inside forEach breaks anonymous function but not the parent function

    DimBlocker.BLACKLIST.forEach(dimension => {
        if( dim == dimension ){
            rtn = true;
       }
	})

    if(ply.op && DimBlocker.ALLOW_OPS){rtn = false;}
    return rtn;
}



DimBlocker.schedule = (event) => event.server.schedule(DimBlocker.check_interval_ms, () => { // Check player positions

    event.server.players.forEach(player => { // loop through every player  
        let x = DimBlocker.inBadDim(player);

        if(x){
            event.server.runCommandSilent(`execute in ${DimBlocker.SAFE_DIM} run tp ${player.name.string} ${DimBlocker.SAFE_SPOT[0]} ${DimBlocker.SAFE_SPOT[1]} ${DimBlocker.SAFE_SPOT[2]}`);
            player.tell("You cannot go there!");
        }

    })

    DimBlocker.schedule(event) // Repeat

})


ServerEvents.loaded(event => { // Initialize, pass event to scheduled function
    if(DimBlocker.scheduled == 0){
        DimBlocker.schedule(event);
        DimBlocker.scheduled = 1;
    }
})
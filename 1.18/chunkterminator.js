const unloader_filepath = 'kubejs/data/chunkterminator.json';
const TIME_LIMIT = 259200; // https://www.unixtimestamp.com/


var playerList = {};


onEvent("player.logged_in", event => { // update entry when player joins
    let time = new Date();
    let ply = event.player.name.string;

    if(unloader_checkPlayer(ply)){
        console.log(`[ChunkTerminator] Updating entry for ${ply}`);
        unloader_addPlayer(ply,time);
    }else{
        console.log(`[ChunkTerminator] Player ${ply} has no entry`)
        unloader_addPlayer(ply,time);
    }
});

onEvent("world.load", event => { // check for players to unload on world load 
    unloader_getPlayers();
    if(Object.keys(playerList).length>0){
        let currentTime = new Date();
        playerList.forEach( entry=> { 
            let entryTime = entry.time;

            if((currentTime-entryTime)>TIME_LIMIT){
                unloader_unload(event.server,entry);
            }
        });
    }
});

function unloader_getPlayers(){ // get all players
    console.log("[ChunkTerminator] Reading player list");
    playerList = JsonIO.read(unloader_filepath) || {};
    if(Object.keys(playerList).length==0){
        console.log("[ChunkTerminator] Error: No player list file found or file empty");
        JsonIO.write(unloader_filepath, {});
    }else{
        console.log("[ChunkTerminator] Successfully read player list");
    }

}

function unloader_checkPlayer(ply){ // checks if a player exists on the list
    unloader_getPlayers();

    if( (playerList[ply] == undefined) || (Object.keys(playerList[ply]).length==0) ){
        return false;
    }

    return true ;
}

function unloader_addPlayer(ply,time){ // adds a player to the list
    unloader_getPlayers();

    if( (playerList[ply] == undefined) || (Object.keys(playerList[ply]).length==0) ){
        playerList[ply] = {};
        playerList[ply].time = time;
    
        JsonIO.write(unloader_filepath, playerList);
    
        let check = unloader_checkPlayer(ply);

        if(check){
            console.log(`[ChunkTerminator] entry added for ${ply}`);
            return true;
        }
        return false;
    }else{
        let last = playerList[ply].time;
        playerList[ply].time = time;

        JsonIO.write(unloader_filepath, playerList);
    
        let check = unloader_checkPlayer(ply);

        if(check && (playerList[ply].time!==last) ){
            console.log(`[ChunkTerminator] entry updated for ${ply}`);
            return true;
        }
        return false;

    }
}


function unloader_unload(server,ply){ // unloads a player's chunks
    unloader_getPlayers();

    if( (playerList[ply] == undefined) || (Object.keys(playerList[ply]).length==0) ){
        console.log("[ChunkTerminator] Error: No player list file found or file empty");
        return false;
    }

    playerList[ply] = undefined;

    JsonIO.write(unloader_filepath, playerList);
    
    unloader_getPlayers();
    console.log(`[ChunkTerminator] Unloading ${ply}`);
    server.runCommand(`ftbchunks unload_all ${ply}`);
    return true;


}

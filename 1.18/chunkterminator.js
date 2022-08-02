// Script to automatically unload a player's chunks some time after leaving
// Works with FTBChunks and F.O.R.C.E.R.

const unloader_filepath = 'kubejs/data/chunkterminator.json'; // Where the data will be written to
const TIME_LIMIT = 259200; // Time limit before chunks get unloaded, https://www.unixtimestamp.com/

const FORCER_filepath = ''; // F.O.R.C.E.R. filepath 
const FORCER_Integration = false; // Enable F.O.R.C.E.R. Integration



var playerList = {};
var unloadQueue = [];

const DEBUG = 0;
const log = (str,DEBUG) => { if(DEBUG){console.log(`[ChunkTerminator] ${str}`)} } // lol

onEvent("player.logged_in", event => { // update entry when player joins
    let time = new Date();
    let ply = event.player.name.string;

    if(unloader_checkPlayer(ply)){
        log(`Updating entry for ${ply}`);
        unloader_addPlayer(ply,time);
    }else{
        log(`Player ${ply} has no entry`)
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
    log("Reading player list");
    playerList = JsonIO.read(unloader_filepath) || {};
    if(Object.keys(playerList).length==0){
        log("Error: No player list file found or file empty");
        JsonIO.write(unloader_filepath, {});
    }else{
        log("Successfully read player list");
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
            log(`entry added for ${ply}`);
            return true;
        }
        return false;
    }else{
        let last = playerList[ply].time;
        playerList[ply].time = time;

        JsonIO.write(unloader_filepath, playerList);
    
        let check = unloader_checkPlayer(ply);

        if(check && (playerList[ply].time!==last) ){
            log(`entry updated for ${ply}`);
            return true;
        }
        return false;

    }
}


function unloader_unload(server,ply){ // unloads a player's chunks
    unloader_getPlayers();

    if( (playerList[ply] == undefined) || (Object.keys(playerList[ply]).length==0) ){
        log("Error: No player list file found or file empty");
        return false;
    }

    playerList[ply] = undefined;

    JsonIO.write(unloader_filepath, playerList);
    
    unloader_getPlayers();
    log(`Unloading ${ply}`);
    if(FORCER_Integration){
        unloader_unloadAll_FORCER(ply);
    }else{
        server.runCommand(`ftbchunks unload_all ${ply}`);
    }
    return true;


}

function unloader_unloadAll_FORCER(ply){ // FORCER unloading 
    let allChunks = JsonIO.read(FORCER_filepath);

    allChunks.forEach(entry =>{
        if(entry.owner==ply){
            unloadQueue.push([entry.x,entry.y]);
            allChunks[ply] = undefined;
        }
    })

    JsonIO.write(FORCER_filepath,allChunks);
}

onEvent("level.tick", event => { // Actually unload FORCER chunks
    if(unloadQueue.length>0){
        let mclevel = event.level.minecraftLevel;
        unloadQueue.forEach(chunk =>{
            let x = chunk.x;
            let z = chunk.z;
            mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, false);
        })
        unloadQueue = [];
    }

});
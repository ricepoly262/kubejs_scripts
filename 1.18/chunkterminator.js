// Script to automatically unload a player's chunks some time after leaving
// Works with FTBChunks
var chunkterminator = {};

chunkterminator.unloader_filepath = 'kubejs/data/chunkterminator.json'; // Where the data will be written to
chunkterminator.TIME_LIMIT = 259200; // Time limit before chunks get unloaded, https://www.unixtimestamp.com/


// FORCER Integration Currently BROKEN - Not currently working on 1.18 scripts
//const FORCER_filepath = ''; // F.O.R.C.E.R. filepath 
//const FORCER_Integration = false; // Enable F.O.R.C.E.R. Integration



chunkterminator.playerList = {};
chunkterminator.unloadQueue = [];

chunkterminator.DEBUG = 0;
chunkterminator.log = (str, a) => { if (a || chunkterminator.DEBUG) { console.log(`[ChunkTerminator] ${str}`) } }

onEvent("player.logged_in", event => { // update entry when player joins
    let time = new Date();
    let ply = event.player.name.string;

    if (unloader_checkPlayer(ply)) {
        chunkterminator.log(`Updating entry for ${ply}`);
        chunkterminator.addPlayer(ply, time);
    } else {
        chunkterminator.log(`Player ${ply} has no entry`)
        chunkterminator.addPlayer(ply, time);
    }
});

onEvent("world.load", event => { // check for players to unload on world load 
    chunkterminator.getPlayers();
    if (Object.keys(chunkterminator.playerList).length > 0) {
        let currentTime = new Date();
        chunkterminator.playerList.forEach(entry => {
            let entryTime = entry.time;

            if ((currentTime - entryTime) > TIME_LIMIT) {
                chunkterminator.unload(event.server, entry);
            }
        });
    }
});

chunkterminator.getPlayers = () => { // get all players
    chunkterminator.log("Reading player list");

    chunkterminator.playerList = JsonIO.read(chunkterminator.unloader_filepath) || {};
    if (Object.keys(chunkterminator.playerList).length == 0) {
        chunkterminator.log("Error: No player list file found or file empty");
        JsonIO.write(chunkterminator.unloader_filepath, {});
    } else {
        chunkterminator.log("Successfully read player list");
    }

}

chunkterminator.checkPlayer = (ply) => { // checks if a player exists on the list
    chunkterminator.getPlayers();

    if ((chunkterminator.playerList[ply] == undefined) || (Object.keys(chunkterminator.playerList[ply]).length == 0)) {
        return false;
    }

    return true;
}

chunkterminator.addPlayer = (ply, time) => { // adds a player to the list
    chunkterminator.getPlayers();

    if ((chunkterminator.playerList[ply] == undefined) || (Object.keys(chunkterminator.playerList[ply]).length == 0)) {
        chunkterminator.playerList[ply] = {};
        chunkterminator.playerList[ply].time = time;

        JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

        let check = chunkterminator.checkPlayer(ply);

        if (check) {
            chunkterminator.log(`entry added for ${ply}`);
            return true;
        }
        return false;
    } else {
        let last = chunkterminator.playerList[ply].time;
        chunkterminator.playerList[ply].time = time;

        JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

        let check = chunkterminator.checkPlayer(ply);

        if (check && (chunkterminator.playerList[ply].time !== last)) {
            chunkterminator.log(`entry updated for ${ply}`);
            return true;
        }
        return false;

    }
}


chunkterminator.unload = (server, ply) => { // unloads a player's chunks
    chunkterminator.getPlayers();

    if ((chunkterminator.playerList[ply] == undefined) || (Object.keys(chunkterminator.playerList[ply]).length == 0)) {
        chunkterminator.log("Error: No player list file found or file empty");
        return false;
    }

    chunkterminator.playerList[ply] = undefined;

    JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

    chunkterminator.getPlayers();
    chunkterminator.log(`Unloading ${ply}`);
    //if(FORCER_Integration){
    //    unloader_unloadAll_FORCER(ply);
    //}else{
    server.runCommand(`ftbchunks unload_all ${ply}`);
    //}
    return true;


}
/* 
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

});*/
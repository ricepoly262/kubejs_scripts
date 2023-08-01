// Script to automatically unload a player's chunks some time after leaving
// Works with FTBChunks
var chunkterminator = {};

chunkterminator.unloader_filepath = 'kubejs/data/ricepoly/chunkterminator.json'; // Where the data will be written to
chunkterminator.TIME_LIMIT = 259200; // Time limit before chunks get unloaded, https://www.unixtimestamp.com/


chunkterminator.playerList = {};
chunkterminator.DEBUG = 0;
chunkterminator.log = (str, a) => { if (a || chunkterminator.DEBUG) { console.log(`[ChunkTerminator] ${str}`) } }

PlayerEvents.loggedIn(event => { // update entry when player joins
    let time = new Date();
    let ply = getCachedName(ply) //event.player.name.string;

    chunkterminator.log(`Updating/Adding entry for ${ply}`)
    chunkterminator.addPlayer(ply, time);
});

LevelEvents.loaded(event => { // check for players to unload on world load 

    chunkterminator.getPlayers();

    if (hasKeys(chunkterminator.playerList)) {
        let currentTime = new Date();

        chunkterminator.playerList.forEach(entry => {
            let entryTime = entry.time;

            if ((currentTime - entryTime) > chunkterminator.TIME_LIMIT) { // check if player has been offline for longer than threshhold
                chunkterminator.unload(event.server, entry);
            }
        });
    }
});

chunkterminator.getPlayers = () => { // get all players

    chunkterminator.log("Reading player list");
    chunkterminator.playerList = JsonIO.read(chunkterminator.unloader_filepath) || {};

    if (hasKeys(chunkterminator.playerList)) {
        chunkterminator.log("Created new player list file");
        JsonIO.write(chunkterminator.unloader_filepath, {});
        chunkterminator.playerList = {};
    } else {
        chunkterminator.log("Successfully read player list");
    }

}

chunkterminator.checkPlayer = (ply) => { // checks if a player exists on the list
    chunkterminator.getPlayers();

    if (isValid(chunkterminator.playerList[ply])) { return true; }

    return false;
}

chunkterminator.addPlayer = (ply, time) => { // adds/updates a player on the list
    chunkterminator.getPlayers();
    if (isValid(chunkterminator.playerList[ply])) {
        let last = chunkterminator.playerList[ply].time;
        chunkterminator.playerList[ply].time = time;

        JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

        let check = chunkterminator.checkPlayer(ply); // ensure it was updated properly

        if (check && (chunkterminator.playerList[ply].time !== last)) {
            chunkterminator.log(`Entry updated for ${ply}`);
            return true;
        }
        return false;
    }
    else {
        chunkterminator.playerList[ply] = {};
        chunkterminator.playerList[ply].time = time;

        JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

        let check = chunkterminator.checkPlayer(ply); // ensure it was added properly

        if (check) {
            chunkterminator.log(`Entry added for ${ply}`);
            return true;
        }
        return false;
    }
}


chunkterminator.unload = (server, ply) => { // unloads a player's chunks
    chunkterminator.getPlayers();

    if (isValid(chunkterminator.playerList[ply])) {
        chunkterminator.log("No player list file found or file empty");
        return false;
    }

    chunkterminator.playerList[ply] = undefined;

    JsonIO.write(chunkterminator.unloader_filepath, chunkterminator.playerList);

    chunkterminator.getPlayers();
    chunkterminator.log(`Unloading ${ply}`);
    server.runCommand(`ftbchunks unload_all ${ply}`);
    return true;


}
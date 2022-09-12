// Formal Overt Radical Chunk Existences Rememberer
// Script that adds in chunk loading via shrine-ritual
// Requires KubeJS Additions 2.0.2 -> https://www.curseforge.com/minecraft/mc-mods/kubejs-additions

const FORCER_filepath_chunks = 'kubejs/data/forcer_chunks.json';
const FORCER_filepath_players = 'kubejs/data/forcer_players.json';
const FORCER_Chunks = 9;


const DEBUG = 0;
const log = (str,a) => { if(a||DEBUG){console.log(`[F.O.R.C.E.R.] ${str}`)} } // lol
const chunkwand = Item.of('minecraft:blaze_rod', "{display:{Lore:['[{\"text\":\"Forcefully\",\"italic\":false,\"color\":\"dark_red\",\"underlined\":true},{\"text\":\" \",\"underlined\":false},{\"text\":\"unloads a chunk.\",\"underlined\":false,\"color\":\"aqua\"}]'],Name:'[{\"text\":\"Chunk Wand\",\"italic\":false,\"bold\":true,\"color\":\"light_purple\"}]'}}");

function isValid(obj){
    if(obj == false){ return false; }
    if(obj == undefined){return false; }
    if(obj == null){ return false; }
    return Object.keys(chunkList).length>0;
}
function getCachedName(ply){ 
    if(!isValid(ply.persistentData.CachedName)){
        ply.persistentData.CachedName = ply.name.string;
    } 
    return ply.persistentData.CachedName;
}


function FORCER_getChunks(ply){ // get all chunks (optionally specific player ones)
    log("Reading chunk list");
    let chunkList = JsonIO.read(FORCER_filepath_chunks) || {};
    if(!isValid(chunkList)){
        log("Error: No list file found or file empty");
        JsonIO.write(FORCER_filepath_chunks, {});
        return {};
    }else{
        log("Successfully read chunk list");

        if(ply){
            let playerChunks = [];
            chunkList.forEach(chunk=>{
                if(chunk.owner==ply){
                    playerChunks.push(chunk);
                }
            });
            return playerChunks;
        }else{
            return chunkList;
        }
    }
}

function FORCER_getPlayers(ply){ // get all player data (optionally specific players)
    log("Reading player list");
    let playerList = JsonIO.read(FORCER_filepath_players) || {};
    if(isValid(playerList)){
        log("Successfully read player list");

        if(ply){
            if(isValid(playerList[ply])){return playerList[ply]}
            else{return {}; }
        }else{
            return playerList;
        }
    }else{
        log("Error: No list file found or file empty");
        JsonIO.write(FORCER_filepath_players, {});
        return {};
    }
}

function FORCER_addPlayer(ply){ // add a player to the player list 
    let playerList = FORCER_getPlayers();
    if(isValid(playerList[ply])){
        return false; // player already has data 
    }else{
        playerList[ply] = {};
        playerList[ply].MaxChunks = FORCER_Chunks;
        playerList[ply].ChunksLeft = FORCER_Chunks;
        JsonIO.write(FORCER_filepath_players, playerList);
        return true;
    }

}

function FORCER_chunkBalance(ply,amt){ // gives or takes x chunks from a player
    let playerList = FORCER_getPlayers();
    if(isValid(playerList[ply])){
        playerList[ply].ChunksLeft = FORCER_Chunks+amt;      
        JsonIO.write(FORCER_filepath_players, playerList); 
    }else{
        return false; // player has no data
    }
}

function FORCER_addChunk(chunkx,chunkz,ply,dimension){ // adds a chunk to the list with a player owner 
    let chunkList = FORCER_getChunks();
    let key = dimension+"|"+chunkx+"-"+chunkz

    if( !isValid(chunkList[key]) ){
        chunkList[key] = {};
        chunkList[key].owner = ply;
        chunkList[key].dim = dimension;
        chunkList[key].pos = [chunkx*16,chunkz*16]
    
        JsonIO.write(FORCER_filepath_chunks, chunkList);
        log(`${ply} force loaded chunk ${key} in ${dimension}`)
        return true;
    }else{
        // in theory this shouldn't happen ever..
        log(`${ply} tried force loading chunk ${key} in ${dimension} which is already loaded and owned by ${chunkList[key].owner}`)
        return false;
    }
}

function FORCER_removeChunk(chunkx,chunkz,ply,dimension){ // removes a chunk from the list with a player owner 
    let chunkList = FORCER_getChunks();
    let key = dimension+"|"+chunkx+"-"+chunkz

    if(isValid(chunkList[key])){
        chunkList[key] = {};
        JsonIO.write(FORCER_filepath_chunks, chunkList);
        log(`${ply} unloaded chunk ${key} in ${dimension}`)
        return true;
    }else{
        // in theory this shouldn't happen ever
        log(`${ply} tried unloading chunk ${key} in in ${dimension} which is not loaded!`)
        return false;
    }
}

function FORCER_canForceLoad(ply,chunkx,chunkz,dimension,cl){
    let data = FORCER_getPlayers(ply)
    let chunksLeft = 0;

    if(cl){
        chunksLeft = cl;
    }
    else{
        if(isValid(data)){
            chunksLeft = data.ChunksLeft;
        }
        else{
            log("Error: Player data empty"); 
        }
    }

    if(!isValid(chunkx)){
        return (chunksLeft>0); 
    }
    else{
        let chunkList = FORCER_getChunks();
        let key = dimension+"|"+chunkx+"-"+chunkz;
        let chunkAt = chunkList[key];
        if(!isValid(chunkAt)){
            return (chunksLeft>0);
        }
        return false;
    }

}
function FORCER_canUnload(ply,chunkx,chunkz,dimension){
    if(!isValid(chunkx)){return false}
    else{
        let chunkList = FORCER_getChunks();
        let key = dimension+"|"+chunkx+"-"+chunkz;
        let chunkAt = chunkList[key];
        if(isValid(chunkAt)){return (chunkAt.owner==ply)}
        return false;
    }

}

function FORCER_setLoaded(mclevel,chunk,status){
    mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, status)
}


function checkCardinal4(block, test){
    let north = block.north.id==test;
    let south = block.south.id==test;
    let east = block.east.id==test;
    let west = block.west.id==test;

    return (north&&south&&east&&west);
}

function checkCardinal8(block, test){
    let northeast = block.north.east.id==test;
    let northwest = block.north.west.id==test;
    let southeast = block.south.east.id==test;
    let southwest = block.south.west.id==test;
    let cardinal = checkCardinal4(block,test);

    return (cardinal&&northeast&&northwest&&southeast&&southwest);
}

function testForMultiblock(block,test){
    let netherrack = block.down.id==test;
    if(netherrack){
        let mossycobble = block.down.down.id=='minecraft:mossy_cobblestone';
        if(mossycobble){
            if(checkCardinal4(block.down,'minecraft:redstone_torch')){
                return checkCardinal8(block.down.down,'minecraft:gold_block');
            }
        }
    }
}

function FORCER_loadChunkUsingBalance(mclevel, ply, chunk, dim){
    let chunkx = chunk.x;
    let chunkz = chunk.z;

    let canLoad = FORCER_canForceLoad(ply,chunkx,chunkz,dim);
    if(canLoad){
        FORCER_addChunk(chunkx,chunkz,ply,dimension);
        FORCER_setLoaded(mclevel,chunk,true);
        FORCER_chunkBalance(ply,-1);
    }
}
function FORCER_unloadChunkUsingBalance(ply, chunk, dim){
    let chunkx = chunk.x;
    let chunkz = chunk.z;

    let canLoad = FORCER_canUnload(ply,chunkx,chunkz,dim);
    if(canLoad){
        FORCER_addChunk(chunkx,chunkz,ply,dimension);
        FORCER_setLoaded(mclevel,chunk,false);
        FORCER_chunkBalance(ply,1);
    }
}
onEvent('block.place', e => {
    if(e.getEntity().isPlayer() && (!e.getEntity().isFake())){
        let block = e.block;
        let ply = e.getEntity();

        if(block.id=='minecraft:fire' || block.id=='minecraft:soul_fire'){
            let mclevel = e.level.minecraftLevel;
            let chunk = mclevel.getChunkAt(block.pos);
            let dimension = e.level.dimension.toString();
            let name = ply.name.string;
            let cname = getCachedName(ply);

            let valid_load = testForMultiblock(block,'minecraft:netherrack')
            if(valid_load){
                if(FORCER_canForceLoad(ply,chunk.pos.x,chunk.pos.z, dimension)){
                    let added = FORCER_addChunk(chunk.pos.x, chunk.pos.z, cname, dimension)
                    if(added){
                        mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, true)

                        ply.persistentData.ForcerChunks = Math.max(ply.persistentData.ForcerChunks-1,0)
                        ply.tell(`Chunk loaded! ${ply.persistentData.ForcerChunks} left.`)
                        log(`${ply.name.string} force loaded chunk ${chunk.pos} in ${dimension}`)
                    }else{
                        ply.tell("Error: Contact Administrator: FORCER_addChunk returned FALSE") // just in case
                    }
                }else{
                    //if(ply.persistentData.ForcerChunks==0){
                    //    ply.tell("You cannot load another chunk!")
                    //}else{
                    //    ply.tell("You cannot load this chunk!")
                    //}
                    e.cancel()
                }

            }
            else{
                let valid_unload = testForMultiblock(block,'minecraft:soul_soil')

                if(valid_unload){
                    if(FORCER_canUnload(getCachedName(ply),chunk.pos.x,chunk.pos.z, dimension)){


                        let removed = FORCER_removeChunk(chunk.pos.x, chunk.pos.z, getCachedName(ply), dimension)

                        if(removed){
                            mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, false)

                            ply.persistentData.ForcerChunks = Math.min(ply.persistentData.ForcerChunks+1,ply.persistentData.ForcerChunkMax)
                            ply.tell(`Chunk unloaded! ${ply.persistentData.ForcerChunks} left.`)
                            log(`${getCachedName(ply)} unloaded chunk ${chunk.pos} in ${dimension}`)
                            //voidMultiblock(block)
                        }else{
                            ply.tell("Error: Contact Administrator: FORCER_removeChunk returned FALSE") // just in case
                        }
                    }else{
                        ply.tell("You cannot unload a non loaded chunk!")
                        e.cancel()
                    }

                }
            }
        }
    }

});

onEvent("player.logged_in", (event) => { // Load chunks on player login
    let name = getCachedName(event.player);
    let chunks = FORCER_getChunks(name);
    let plydata = FORCER_getPlayers(name);

    if(!isValid(plydata)){
        FORCER_addPlayer(ply);
    }
    if(isValid(chunks)){
        let mclevel = e.level.minecraftLevel;
        chunks.forEach(chunk =>{
            FORCER_setLoaded(mclevel, chunk,  true);
        });
    }
});

onEvent("player.logged_out", (event) => { // Unload chunks on player logout 
    let name = getCachedName(event.player);
    let chunks = FORCER_getChunks(name);

    if(isValid(chunks)){
        let mclevel = e.level.minecraftLevel;
        chunks.forEach(chunk =>{
            FORCER_setLoaded(mclevel, chunk,  false);
        });
    }
});


onEvent('server.custom_command', event => { // commands
    if(event.player.op){
        if(event.id == 'forcer_chunkwand'){ // give chunkwand
            event.player.give(chunkwand);
        }     
         
    }else{
        event.player.tell("You are not opped.");
    }
})


onEvent('item.right_click', event => { // chunkwand
    if(event.item == chunkwand){

        let ply = event.player 
        let mclevel = event.level.minecraftLevel
        let chunk = mclevel.getChunkAt(ply.pos.x,ply.pos.z)
        let dimension = event.level.dimension.toString()

        if(ply.op){
            FORCER_removeChunk(chunk.pos.x, chunk.pos.z, getCachedName(ply), dimension)
            //mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, false)
            ply.tell("Force Unloaded")
        }else{
            ply.tell("You cannot do that!");
        }
    }
})
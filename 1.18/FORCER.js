// Formal Overt Radical Chunk Existences Rememberer
// Script that adds in chunk loading via shrine-ritual
// Requires KubeJS Additions 2.0.2 -> https://www.curseforge.com/minecraft/mc-mods/kubejs-additions

const FORCER_filepath = 'kubejs/data/forcer.json';
const FORCER_Chunks = 9;

let chunkList = {};

const DEBUG = 0;
const log = (str,DEBUG) => { if(DEBUG){console.log(`[F.O.R.C.E.R.] ${str}`)} } // lol

function FORCER_getChunks(ply){ // get all chunks (optionally specific player ones)
    log("Reading player list");
    chunkList = JsonIO.read(FORCER_filepath) || {};
    if(Object.keys(chunkList).length==0){
        log("Error: No list file found or file empty");
        JsonIO.write(FORCER_filepath, {});
    }else{
        log("Successfully read chunk list");

        if(ply){
            let playerChunks = [];
            chunkList.forEach(chunk=>{
                if(chunk.owner==ply){
                    playerChunks.push(chunk);
                }
            })
            return playerChunks;
        }
    }

}

function FORCER_addChunk(chunkx,chunkz,ply,dimension){ // adds a chunk to the list with a player owner 
    FORCER_getChunks();
    let key = dimension+"|"+chunkx+"-"+chunkz

    if( (chunkList[key] == undefined) || (Object.keys(chunkList[key]).length==0) ){
        chunkList[key] = {};
        chunkList[key].owner = ply;
        chunkList[key].dim = dimension;
        chunkList[key].pos = [chunkx*16,chunkz*16]
    
        JsonIO.write(FORCER_filepath, chunkList);
        log(`${ply} force loaded chunk ${key} in ${dimension}`)
        return true;
    }else{
        // in theory this shouldn't happen ever.. FORCER_canForceLoad has checks for this.
        log(`${ply} tried force loading chunk ${key} in ${dimension} which is already loaded and owned by ${chunkList[key].owner}`)
        return false;
    }
}

function FORCER_removeChunk(chunkx,chunkz,ply,dimension){ // removes a chunk to the list with a player owner 
    FORCER_getChunks();
    let key = dimension+"|"+chunkx+"-"+chunkz

    if( (chunkList[key] == undefined) || (Object.keys(chunkList[key]).length==0) ){
        // in theory this shouldn't happen ever.. FORCER_canUnload has checks for this.
        log(`${ply} tried unloading chunk ${key} in in ${dimension} which is not loaded!`)
        return false;
    }else{
        chunkList[key] = {};
        JsonIO.write(FORCER_filepath, chunkList);
        log(`${ply} unloaded chunk ${key} in ${dimension}`)
        return true;
       
    }
}

function FORCER_canForceLoad(ply,chunkx,chunkz,dimension){
    let chunksLeft = ply.persistentData.ForcerChunks;
    if(chunkx==undefined){
        return (chunksLeft>0);
    }
    else{
        FORCER_getChunks();
        let key = dimension+"|"+chunkx+"-"+chunkz;
        let chunkAt = chunkList[key];
        if(chunkAt == undefined || (Object.keys(chunkAt).length==0)){
            return (chunksLeft>0);
        };
        return false;
    }

}
function FORCER_canUnload(ply,chunkx,chunkz,dimension){
    if(chunkx==undefined){return false}
    else{
        FORCER_getChunks();
        let key = dimension+"|"+chunkx+"-"+chunkz 
        let chunkAt = chunkList[key]
        if(chunkAt==undefined){return false}
        else{return (chunkAt.owner==ply)}
    }

}

function checkCardinal4(block, test){
    let north = block.north.id==test
    let south = block.south.id==test
    let east = block.east.id==test
    let west = block.west.id==test

    return (north&&south&&east&&west)
}

function checkCardinal8(block, test){
    let northeast = block.north.east.id==test
    let northwest = block.north.west.id==test
    let southeast = block.south.east.id==test
    let southwest = block.south.west.id==test
    let cardinal = checkCardinal4(block,test)

    return (cardinal&&northeast&&northwest&&southeast&&southwest)
}


function testForMultiblock(block,test){
    let netherrack = block.down.id==test
    if(netherrack){
        let mossycobble = block.down.down.id=='minecraft:mossy_cobblestone'
        if(mossycobble){
            if(checkCardinal4(block.down,'minecraft:redstone_torch')){
                return checkCardinal8(block.down.down,'minecraft:gold_block')
            }
        }
    }
}

function voidMultiblock(block){
    return false;  // some removal function possibly (may make it configurable)

    let blocks = {}
    blocks.netherrack = block.down
    blocks.mossycobble = block.down.down
    blocks.torch1 = block.down.north
    blocks.torch2 = block.down.south
    blocks.torch3 = block.down.east
    blocks.torch4 = block.down.west
    blocks.gold1 = block.down.down.north
    blocks.gold2 = block.down.down.north.east
    blocks.gold3 = block.down.down.north.east   
    blocks.gold4 = block.down.down.south
    blocks.gold5 = block.down.down.south.east
    blocks.gold6 = block.down.down.south.east       
    blocks.gold7 = block.down.down.east  
    blocks.gold8 = block.down.down.west

   

    //blocks.forEach(b=>{
    //    b.id == "minecraft:air"
    //})
}

onEvent('block.place', e => {
    if(e.getEntity().isPlayer()){
        let block = e.block
        let ply = e.getEntity()

        if(block.id=='minecraft:fire' || block.id=='minecraft:soul_fire'){
            let mclevel = e.level.minecraftLevel
            let chunk = mclevel.getChunkAt(block.pos)
            let dimension = e.level.dimension.toString()

            let valid_load = testForMultiblock(block,'minecraft:netherrack')
            if(valid_load){
                ply.tell("VALID STRUCTURE!")
                if(FORCER_canForceLoad(ply,chunk.pos.x,chunk.pos.z, dimension)){
                    let added = FORCER_addChunk(chunk.pos.x, chunk.pos.z, ply.name.string, dimension)
                    if(added){
                        mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, true)

                        ply.persistentData.ForcerChunks = Math.max(ply.persistentData.ForcerChunks-1,0)
                        ply.tell(`Chunk loaded! ${ply.persistentData.ForcerChunks} left.`)
                        log(`${ply.name.string} force loaded chunk ${chunk.pos} in ${dimension}`)
                        voidMultiblock(block)
                    }else{
                        ply.tell("Error: Contact Administrator: LN180") // just in case
                    }
                }else{
                    if(ply.persistentData.ForcerChunks==0){
                        ply.tell("You cannot load another chunk!")
                    }else{
                        ply.tell("You cannot load this chunk!")
                    }
                    e.cancel()
                }

            }
            else{
                let valid_unload = testForMultiblock(block,'minecraft:soul_soil')

                if(valid_unload){
                    ply.tell("VALID STRUCTURE!")
                    if(FORCER_canUnload(ply.name.string,chunk.pos.x,chunk.pos.z, dimension)){


                        let removed = FORCER_removeChunk(chunk.pos.x, chunk.pos.z, ply.name.string, dimension)

                        if(removed){
                            mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, false)

                            ply.persistentData.ForcerChunks = Math.min(ply.persistentData.ForcerChunks+1,ply.persistentData.ForcerChunkMax)
                            ply.tell(`Chunk unloaded! ${ply.persistentData.ForcerChunks} left.`)
                            log(`${ply.name.string} unloaded chunk ${chunk.pos} in ${dimension}`)
                            voidMultiblock(block)
                        }else{
                            ply.tell("Error: Contact Administrator: LN210") // just in case
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

onEvent("player.logged_in", (event) => { // If you increase the limit, give them more, TODO: decreasing limtis
    p = event.player.persistentData;
    if(p.ForcerChunks == null || p.ForcerChunks == undefined){
        log(`${event.player.name.string} logged in without ForcerChunk data!`)
        event.player.persistentData.ForcerChunks = FORCER_Chunks;
        event.player.persistentData.ForcerChunkMax = FORCER_Chunks;
    }else{
        if(FORCER_Chunks > p.ForcerChunkMax){
            log(`${event.player.name.string} logged in with outdated Max ForcerChunkMax data!`)
            event.player.persistentData.ForcerChunks = FORCER_Chunks-p.ForcerChunks;
            event.player.persistentData.ForcerChunkMax = FORCER_Chunks;            
        }
    }
});

// todo: unload chunks if owner is offline
// todo: add admin tools
// event.level.dimension.toString()
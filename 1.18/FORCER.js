//F.O.R.C.E.R.
//Formal Overt Radical Chunk Existences Rememberer



const FORCER_filepath = 'kubejs/data/forcer.json';
const FORCER_Chunks = 9;
let chunkList = {};

function FORCER_getChunks(){ // get all chunks
    console.log("[F.O.R.C.E.R.] Reading player list");
    chunkList = JsonIO.read(FORCER_filepath) || {};
    if(Object.keys(chunkList).length==0){
        console.log("[F.O.R.C.E.R.] Error: No list file found or file empty");
        JsonIO.write(FORCER_filepath, {});
    }else{
        console.log("[F.O.R.C.E.R.] Successfully read chunk list");
    }

}

function FORCER_addChunk(chunkx,chunkz,ply){ // adds a chunk to the list with a player owner 
    FORCER_getChunks();
    let key = chunkx+"-"+chunkz

    if( (chunkList[key] == undefined) || (Object.keys(chunkList[key]).length==0) ){
        chunkList[key] = {};
        chunkList[key].owner = ply;
    
        JsonIO.write(FORCER_filepath, chunkList);
        console.log(`[F.O.R.C.E.R.] ${ply} force loaded chunk ${key}`)
        return true;
    }else{
         // in theory this shouldn't happen ever.. FORCER_canForceLoad has checks for this.
        console.log(`[F.O.R.C.E.R.] ${ply} tried force loading chunk ${key} which is already loaded and owned by ${chunkList[key].owner}`)
       
    }
}

function FORCER_canForceLoad(ply,chunkx,chunkz){
    let chunksLeft = ply.persistentData.FORCER_CHUNKS
    if(chunkx==undefined){return (chunksLeft>0)}
    else{
        FORCER_getChunks();
        let key = chunkx+"-"+chunkz 
        let chunkAt = chunkList[key]
        if(chunkAt == undefined || (Object.keys(chunkAt).length==0)){return (chunksLeft>0)}
        return false 
    }

}
function FORCER_canUnload(ply,chunkx,chunkz){
    if(chunkx==undefined){return false}
    else{
        FORCER_getChunks();
        let key = chunkx+"-"+chunkz 
        let chunkAt = chunkList[key]
        return (chunkAt.owner==ply)
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
onEvent('block.place', e => {
    if(e.getEntity().isPlayer()){
        let block = e.block
        let ply = e.getEntity()

        if(block.id=='minecraft:fire'){
            let valid_load = testForMultiblock(block,'minecraft:netherrack')
                if(valid_load){
                    ply.tell("VALID STRUCTURE!")
                    if(FORCER_canForceLoad(ply.name.string)){
                        let level = e.level
                        let mclevel = e.level.minecraftLevel
                        //global.functions.inspect(level.chunkForced)
                        //global.functions.inspect(block)
                        let blockPos = block.pos 
                        let chunk = mclevel.getChunkAt(blockPos)
                        //global.functions.inspect(chunk)
                        //global.functions.inspect(level)
                        //global.functions.inspect(chunk.pos)
                        mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, true)
                        console.log(level.getForceLoadedChunks()) // bruh 
                        //global.functions.inspect(level.forcedChunks)
                        ply.tell(`Chunk loaded! ${ply.persistentData.ForcerChunks} left.`)
                    }else{
                        if(ply.persistentData.ForcerChunks==0){
                            ply.tell("You cannot load another chunk!")
                        }else{
                            ply.tell("You cannot load this chunk!")
                        }
                        e.cancel()
                    }

                }else{
                    valid_unload = testForMultiblock(block,'minecraft:soul_soil')
                    if(valid_unload){
                        ply.tell("VALID STRUCTURE!")
                        if(FORCER_canUnload(ply.name.string)){
                            let level = e.level
                            let mclevel = e.level.minecraftLevel
                            //global.functions.inspect(level.chunkForced)
                            //global.functions.inspect(block)
                            let blockPos = block.pos 
                            let chunk = mclevel.getChunkAt(blockPos)
                            //global.functions.inspect(chunk)
                            //global.functions.inspect(level)
                            //global.functions.inspect(chunk.pos)
                            mclevel.setChunkForced(chunk.pos.x, chunk.pos.z, true)
                            console.log(level.getForceLoadedChunks()) // bruh 
                            //global.functions.inspect(level.forcedChunks)
                            ply.persistentData.ForcerChunks = Math.min(ply.persistentData.ForcerChunks+1,ply.persistentData.ForcerChunkMax)
                            ply.tell(`Chunk unloaded! ${ply.persistentData.ForcerChunks} left.`)
                        }else{
                            ply.tell("You cannot unload a non loaded chunk!")
                            e.cancel()
                        }
    
                    }
                }
        }
    }

})

onEvent("player.logged_in", (event) => {
    p = event.player.persistentData;
    if(p.ForcerChunks == null){
        console.log(`${event.player.name.string} logged in without ForcerChunk data!`)
        event.player.persistentData.ForcerChunks = FORCER_CHUNKS;
        event.player.persistentData.ForcerChunkMax = FORCER_CHUNKS;
    }else{
        if(FORCER_CHUNKS > p.ForcerChunkMax){
            console.log(`${event.player.name.string} logged in with outdated Max ForcerChunkMax data!`)
            event.player.persistentData.ForcerChunks = FORCER_CHUNKS-p.ForcerChunks;
            event.player.persistentData.ForcerChunkMax = FORCER_CHUNKS;            
        }
    }
});
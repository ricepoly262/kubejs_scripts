// initial spawn
// send players to a set position the first time they spawn in

const initialpos = {x:0, y:0, z:0};
const inirialdim = 'minecraft:overworld';


onEvent("player.logged_in", (event) => {
    let data = event.player.persistentData.initialSpawn;

    if(data == null || data == undefined || data == false){
        event.server.runCommandSilent(`execute in ${initialdim} run tp ${event.player.name.string} ${initialpos.x} ${initialpos.y} ${initialpos.z}`);
        event.player.persistentData.initialSpawn = true;
    }
});
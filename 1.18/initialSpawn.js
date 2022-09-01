// initial spawn
// send players to a set position the first time they spawn in

const pos = {x:0, y:0, z:0};
const dim = 'minecraft:overworld';


onEvent("player.logged_in", (event) => {
    let data = event.player.persistentData.initialSpawn;

    if(data == null || data == undefined || data == false){
        event.server.runCommandSilent(`execute in ${dim} run tp ${event.player.name.string} ${pos.x} ${pos.y} ${pos.z}`);
        event.player.persistentData.initialSpawn = true;
    }
});
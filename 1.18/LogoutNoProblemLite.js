// Logout, No Problem! Lite
// Ensures players log in at the correct position

const logout_filepath = 'kubejs/data/logoutnoproblem.json'

onEvent("player.logged_out", (event) => {
    let dimension = event.level.dimension.toString()
    let logInfo = {};
    logInfo.dim = dimension;
    logInfo.x = event.player.x
    logInfo.y = event.player.y 
    logInfo.z = event.player.z

    let data = JsonIO.read(logout_filepath);
    if(data == null){
        JsonIO.write({},logout_filepath) 
        data = {}
    }
    data[event.player.name.string] = logInfo;
    JsonIO.write(logout_filepath, data);
});

onEvent("player.logged_in", (event) => {
    let data = JsonIO.read(logout_filepath);

    if(data == null){
        JsonIO.write({},logout_filepath)
        data = {}
    }

    let logInfo = data[event.player.name.string]

    if(logInfo !== undefined){
        log(`Ensured ${event.player.name.string} login location: ${logInfo}`)
        event.server.runCommandSilent(`execute in ${logInfo.dim} run tp ${event.player.name.string} ${logInfo.x} ${logInfo.y} ${logInfo.z}`)
    }
});
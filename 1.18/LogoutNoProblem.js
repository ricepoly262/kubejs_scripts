// Logout, No Problem!
// Fixes some server hang caused by logging into a base

const logout_filepath = 'kubejs/data/logoutnoproblem.json'
const DEBUG = 0;
const log = (str,a) => { if(a||DEBUG){console.log(`[LogoutNoProblem] ${str}`)} } // lol

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

    log(`Sent ${event.player.name.string} to spawn! Original location: ${logInfo}`)
    event.server.runCommandSilent(`cu unstuck ${event.player.name.string}`);
});

onEvent("player.logged_in", (event) => {
    let data = JsonIO.read(logout_filepath);

    if(data == null){
        JsonIO.write({},logout_filepath)
        data = {}
    }

    let logInfo = data[event.player.name.string]

    if(logInfo !== undefined){
        log(`Sent ${event.player.name.string} back to original location: ${logInfo}`)
        event.server.runCommandSilent(`execute in ${logInfo.dim} run tp ${event.player.name.string} ${logInfo.x} ${logInfo.y} ${logInfo.z}`)
    }
});
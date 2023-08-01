// Logout, No Problem! Lite
// Ensures players log in at the correct position
var logoutNP = {}

logoutNP.logout_filepath = 'kubejs/data/logoutnoproblem.json'

PlayerEvents.loggedOut(event => {
    let dimension = event.level.dimension.toString()
    let logInfo = {};
    logInfo.dim = dimension;
    logInfo.x = event.player.x
    logInfo.y = event.player.y
    logInfo.z = event.player.z

    let data = JsonIO.read(logoutNP.logout_filepath);
    if (data == null) {
        JsonIO.write({}, logoutNP.logout_filepath)
        data = {}
    }
    data[getCachedName(event.player)] = logInfo;
    JsonIO.write(logoutNP.logout_filepath, data);
});

PlayerEvents.loggedIn(event => {
    let data = JsonIO.read(logoutNP.logout_filepath);

    if (data == null) {
        JsonIO.write({}, logoutNP.logout_filepath)
        data = {}
    }

    let logInfo = data[getCachedName(event.player)]

    if (logInfo !== undefined) {
        console.log(`Ensured ${event.player.name.string} login location: ${logInfo}`)
        event.server.runCommandSilent(`execute in ${logInfo.dim} run tp ${event.player.name.string} ${logInfo.x} ${logInfo.y} ${logInfo.z}`)
    }
});
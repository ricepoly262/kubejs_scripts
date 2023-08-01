// Logout, No Problem!
// Fixes some server hangs caused by entangled blocks when logging into a base
// Requires Crash Utilities
var logoutNP = {}

logoutNP.logout_filepath = 'kubejs/data/ricepoly/logoutnoproblem.json'
logoutNP.DEBUG = 0;
logoutNP.LNP_log = (str, a) => { if (a || logoutNP.DEBUG) { console.log(`[LogoutNoProblem] ${str}`) } }

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

    logoutNP.LNP_log(`Sent ${event.player.name.string} to spawn! Original location: ${logInfo}`)
    event.server.runCommandSilent(`cu unstuck ${event.player.name.string}`);
});

PlayerEvents.loggedIn(event => {
    let data = JsonIO.read(logoutNP.logout_filepath);

    if (data == null) {
        JsonIO.write({}, logoutNP.logout_filepath)
        data = {}
    }

    let logInfo = data[getCachedName(event.player)]

    if (logInfo !== undefined) {
        LNP_log(`Sent ${event.player.name.string} back to original location: ${logInfo}`)
        event.server.runCommandSilent(`execute in ${logInfo.dim} run tp ${event.player.name.string} ${logInfo.x} ${logInfo.y} ${logInfo.z}`)
    }
});
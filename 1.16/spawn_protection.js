// basic spawn protection script

onEvent("player.logged_in", (event) => {
    p = event.player
    event.server.runCommandSilent(`effect give ${p} minecraft:resistance 30 10`)
    event.server.runCommandSilent(`effect give ${p} minecraft:weakness 30 10`)
});
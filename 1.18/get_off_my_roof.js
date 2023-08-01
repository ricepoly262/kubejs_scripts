// Get Off My Roof!
// Script to block players from going ontop of the nether roof with a multi-warn and time based system.
let RoofCleaner = {}

RoofCleaner.SPAWN_PROTECTION = 5 * 60 // seconds of spawn protection
RoofCleaner.VOUCHER_PROTECTION = 5 * 60 // seconds of protection you get from vouchers
RoofCleaner.TELL_TIME = 10 // seconds of tell time (for the first warning message)
RoofCleaner.WARN_TIME = 2 * 60 // seconds of warn time (how long they have to leave)
RoofCleaner.CHECK_INTERVAL = 5 // how often in seconds it checks player positions
RoofCleaner.SAFE_DIM = 'minecraft:overworld' // the dimension the player will be teleported to 
RoofCleaner.SAFE_SPOT = [0, 200, 0] // the position the player will be teleported to 




RoofCleaner.voucher = Item.of('minecraft:paper', "{display:{Lore:['[{\"text\":\"Using this item will give you 5 minutes of time above the Nether roof.\",\"italic\":false,\"color\":\"aqua\"}]'],Name:'[{\"text\":\"5 Minute Nether Roof Bypass\",\"italic\":false,\"color\":\"light_purple\"}]'}}").enchant('', 0);
RoofCleaner.baton = Item.of('minecraft:stick', "{display:{Lore:['[{\"text\":\"Hitting players with this item will reset their nether roof data.\",\"italic\":false,\"color\":\"aqua\"}]'],Name:'[{\"text\":\"Baton\",\"italic\":false,\"color\":\"light_purple\"}]'}}").enchant('', 0);



RoofCleaner.tell_time_ticks = TELL_TIME * 20;
RoofCleaner.tell_time_ms = TELL_TIME * 1000;
RoofCleaner.warn_time_ticks = WARN_TIME * 20;
RoofCleaner.warn_time_ms = WARN_TIME * 1000;
RoofCleaner.spawn_protection_ms = SPAWN_PROTECTION * 1000;
RoofCleaner.check_interval_ms = CHECK_INTERVAL * 1000;
RoofCleaner.voucher_protection_ms = VOUCHER_PROTECTION * 1000;
RoofCleaner.DEBUG = 0;

RoofCleaner.ROOF_log = (str, a) => { if (a || DEBUG) { console.log(`[GetOffMyRoof] ${str}`) } }





RoofCleaner.run = 1;
RoofCleaner.nether_scheduled = 0;


RoofCleaner.above = (ply) => { // check if players are above the nether 
    let y = ply.y;
    let dim = ply.level.dimension;

    RoofCleaner.ROOF_log(`${ply.name}, Y ${Math.floor(y)} ${dim}`);
    if ((dim == 'minecraft:the_nether') && (y >= 128)) {
        RoofCleaner.ROOF_log("Player is above the nether");
        return !(ply.op);
    }
    RoofCleaner.ROOF_log("Player is not above the nether");
    return false;

}


RoofCleaner.title = (e, ply, a) => { // first warning title (tells the player the nether roof is off limits)
    RoofCleaner.ROOF_log("Showing first title");
    e.server.runCommand(`/title ${ply.name} times 20 ${RoofCleaner.tell_time_ticks} 20`);
    e.server.runCommand(`/title ${ply.name} subtitle ["",{"text":"The Nether Roof is ","color":"red"},{"text":"OFF LIMITS","underlined":true,"color":"red"},{"text":".","color":"red"}]`);
    e.server.runCommand(`/title ${ply.name} title {"text":"WARNING","bold":true,"color":"dark_red"}`);

    if (a) { RoofCleaner.nextTitle(e, ply); }

}

RoofCleaner.nextTitle = (event, ply) => event.server.schedule(RoofCleaner.tell_time_ms, () => { // second warning title (tells the player to leave)
    RoofCleaner.ROOF_log("Showing next title");
    event.server.runCommand(`/title ${ply.name} times 20 ${RoofCleaner.warn_time_ticks} 20`);
    event.server.runCommand(`/title ${ply.name} subtitle {"text":"Returning may result in loss of items.","color":"red"}`);
    event.server.runCommand(`/title ${ply.name} title {"text":"You have ${RoofCleaner.WARN_TIME / 60} minutes to leave.","bold":true,"color":"dark_red"}`);

    RoofCleaner.finalCheck(event, ply);

})

RoofCleaner.finalCheck = (event, ply) => event.server.schedule(RoofCleaner.warn_time_ms, () => { // final check to see if they are still ontop of the nether roof
    RoofCleaner.ROOF_log("Doing final check");
    if (player.persistentData.nether_kill == false) {
        if (RoofCleaner.above(ply) && (ply.persistentData.nether_warn == true)) {
            RoofCleaner.ROOF_log("Teleporting player");
            event.server.runCommand(`execute in ${RoofCleaner.SAFE_DIM} run tp ${ply.name} ${RoofCleaner.SAFE_SPOT[0]} ${RoofCleaner.SAFE_SPOT[1]} ${RoofCleaner.SAFE_SPOT[3]} `);
            event.server.runCommand(`/title ${ply.name} clear`);
            player.persistentData.nether_kill = true;
            player.tell("Returning to the Nether roof may result in loss of items.");
        } else if (!RoofCleaner.above(ply) && (ply.persistentData.nether_warn == true)) {
            RoofCleaner.ROOF_log("Player returned");
            event.server.runCommand(`/title ${ply.name} clear`);
            player.persistentData.nether_kill = true;
            player.tell("Thank you for staying below the nether roof. Returning may result in loss of items.");
        }
    } else {
        RoofCleaner.ROOF_log("Player kill is already true!");
    }
})

RoofCleaner.spawnProtection = (event, ply) => event.server.schedule(RoofCleaner.spawn_protection_ms, () => { // spawn protection
    RoofCleaner.ROOF_log("Removing voucher protection");
    ply.persistentData.nether_protected = false;
})

RoofCleaner.voucherProtection = (event, ply) => event.server.schedule(RoofCleaner.voucher_protection_ms, () => { // voucher protection
    RoofCleaner.ROOF_log("Removing voucher protection");
    ply.persistentData.nether_protected = false;
})

RoofCleaner.schedule = (event) => event.server.schedule(RoofCleaner.check_interval_ms, () => { // main, checks player positions

    RoofCleaner.ROOF_log("Tick!");

    event.server.players.forEach(player => { // loop through every player
        let x = RoofCleaner.above(player);
        let protect = player.persistentData.nether_protected;
        let warned = player.persistentData.nether_warn;
        let kill = player.persistentData.nether_kill;

        if (protect == false) {
            if (x && (warned == false)) {
                player.persistentData.nether_warn = true;
                RoofCleaner.title(event, player, true);
                RoofCleaner.ROOF_log("Warning player");
            } else if (x && (kill == true)) {
                player.kill()
                RoofCleaner.ROOF_log("Killing player");
            } else if (x) {
                RoofCleaner.ROOF_log("Player is warned but not killed");
            }

            if (!x && (warned == true) && (kill == false)) {
                RoofCleaner.ROOF_log("Player returned");
                event.server.runCommand(`/title ${player.name} clear`)
                player.persistentData.nether_kill = true;
                player.tell("Thank you for staying below the nether roof. Returning may result in loss of items.");
            }
        } else {
            RoofCleaner.ROOF_log("Player has nether protection");
            if (x) {
                RoofCleaner.title(event, player, false);
            }
        }

    })

    if (run) { RoofCleaner.schedule(event) }; // recursion

})

onEvent("player.logged_in", (event) => { // for spawn protections
    player = event.player;
    player.persistentData.nether_protected = false;

    if (RoofCleaner.above(player) && (player.persistentData.nether_warn == true) && (player.persistentData.nether_kill == false)) { // they logged out during the warning and are above the nether roof
        RoofCleaner.ROOF_log("Warning player");
        RoofCleaner.title(event, player, true);
        player.persistentData.nether_protected = false;
    } else if (!RoofCleaner.above(player) && (player.persistentData.nether_warn == true) && (player.persistentData.nether_kill == false)) { // they logged out during the warning but were below the nether roof
        RoofCleaner.ROOF_log("Letting player off");
        player.persistentData.nether_warn = false;
        player.persistentData.nether_protected = false;
    }

    if (RoofCleaner.above(player) && (player.persistentData.nether_kill == true)) {   // they logged out above the nether roof after being warned
        RoofCleaner.ROOF_log("Giving spawn protection");
        player.persistentData.nether_kill = false;
        player.persistentData.nether_protected = true;
        RoofCleaner.spawnProtection(event, player);
    }

});

onEvent('server.tick', event => {
    if (RoofCleaner.nether_scheduled == 0) {
        RoofCleaner.schedule(event);
        RoofCleaner.nether_scheduled = 1;
        RoofCleaner.ROOF_log("Initialized Script");
    }
})


onEvent('server.custom_command', event => { // commands
    if (event.player.op) {
        if (event.id == 'nether_reset') { // reset your own data
            event.player.tell("Resetting");
            event.player.persistentData.nether_kill = false;
            event.player.persistentData.nether_protected = false;
            event.player.persistentData.nether_warn = false;
        }

        if (event.id == 'data') { // show your persistent data
            event.player.tell("Data:");
            let data = event.player.persistentData;
            event.player.tell(data);
        }

        if (event.id == 'nether_voucher') { // spawn a voucher (right click for 5m protection)
            event.player.give(RoofCleaner.voucher);
        }

        if (event.id == 'nether_baton') { // spawn a baton (hit players to reset their data)
            event.player.give(RoofCleaner.voucher);
        }
    }

})

onEvent('item.right_click', event => { // voucher protection, not usable by operators
    if (event.item == RoofCleaner.voucher) {
        if (!event.player.op) {
            RoofCleaner.ROOF_log("Giving protection");
            event.player.tell("You are now protected for the next 5 minutes.")
            player.persistentData.nether_warn = true;
            event.player.persistentData.nether_kill = false;
            event.player.persistentData.nether_protected = true;
            RoofCleaner.voucherProtection(event, event.player);
            event.item.count = event.item.count - 1;
        } else {
            event.player.tell("Vouchers are not usable by operators.");
        }
    }
})


onEvent('entity.attack', event => { // baton

    if (event.getSource().getPlayer().isPlayer() && event.entity.isPlayer()) {
        let ply = event.getSource().getPlayer();
        let target = event.entity;
        let item = ply.getMainHandItem();

        if (ply.isPlayer() && !ply.isFake() && ply.op) {
            if (item == RoofCleaner.baton) {
                ply.tell(`Resetting data of ${target.name}`);
                target.tell(`Your nether roof data has been reset by ${ply.name}`);
                target.persistentData.nether_kill = false;
                target.persistentData.nether_protected = false;
                target.persistentData.nether_warn = false;
            }
        } else if (!ply.op) {
            ply.tell("Batons are not usable by non-operators");
        }
    }
})
const SPAWN_PROTECTION = 5*60 // seconds of spawn protection
const VOUCHER_PROTECTION = 5*60 // seconds of protection you get from vouchers
const TELL_TIME = 10 // seconds of tell time (for the first warning message)
const WARN_TIME = 2*60 // seconds of warn time (how long they have to leave)
const CHECK_INTERVAL = 5 // how often in seconds it checks player positions
const SAFE_DIM = 'minecraft:overworld' // the dimension the player will be teleported to 
const SAFE_SPOT = [0,200,0] // the position the player will be teleported to 




const voucher = Item.of('minecraft:paper', "{display:{Lore:['[{\"text\":\"Using this item will give you 5 minutes of time above the Nether roof.\",\"italic\":false,\"color\":\"aqua\"}]'],Name:'[{\"text\":\"5 Minute Nether Roof Bypass\",\"italic\":false,\"color\":\"light_purple\"}]'}}").enchant('', 0);
const baton = Item.of('minecraft:stick', "{display:{Lore:['[{\"text\":\"Hitting players with this item will reset their nether data.\",\"italic\":false,\"color\":\"aqua\"}]'],Name:'[{\"text\":\"Baton\",\"italic\":false,\"color\":\"light_purple\"}]'}}").enchant('', 0);



const tell_time_ticks = TELL_TIME * 20;
const tell_time_ms = TELL_TIME * 1000;
const warn_time_ticks = WARN_TIME * 20;
const warn_time_ms = WARN_TIME * 1000;
const spawn_protection_ms = SPAWN_PROTECTION * 1000;
const check_interval_ms = CHECK_INTERVAL * 1000;
const voucher_protection_ms = VOUCHER_PROTECTION * 1000;
const DEBUG = 0;

const log = (str,DEBUG) => { if(DEBUG){console.log(str)} } // lol





const run = 1;
var nether_scheduled = 0;


function above(ply){ // check if players are above the nether 
    let y = ply.y;
    let dim = ply.level.dimension;

    log(`${ply.name}, Y ${Math.floor(y)} ${dim}`);
    if( (dim == 'minecraft:the_nether') && (y>=128) ){
         log("Player is above the nether");
        return !(ply.op);
    }
    log("Player is not above the nether");
    return false;

}


function title(e,ply,a){ // first warning title (tells the player the nether roof is off limits)
    log("Showing first title");
    e.server.runCommand(`/title ${ply.name} times 20 ${tell_time_ticks} 20`);
    e.server.runCommand(`/title ${ply.name} subtitle ["",{"text":"The Nether Roof is ","color":"red"},{"text":"OFF LIMITS","underlined":true,"color":"red"},{"text":".","color":"red"}]`);
    e.server.runCommand(`/title ${ply.name} title {"text":"WARNING","bold":true,"color":"dark_red"}`);

    if(a){nextTitle(e,ply);}

}

let nextTitle = (event,ply) => event.server.schedule(tell_time_ms, () => { // second warning title (tells the player to leave)
    log("Showing next title");
    event.server.runCommand(`/title ${ply.name} times 20 ${warn_time_ticks} 20`);
    event.server.runCommand(`/title ${ply.name} subtitle {"text":"Returning may result in loss of items.","color":"red"}`);
    event.server.runCommand(`/title ${ply.name} title {"text":"You have ${WARN_TIME/60} minutes to leave.","bold":true,"color":"dark_red"}`);

    finalCheck(event,ply);

})

let finalCheck = (event,ply) => event.server.schedule(warn_time_ms, () => { // final check to see if they are still ontop of the nether roof
    log("Doing final check");
    if(player.persistentData.nether_kill == false){
        if(above(ply) && (ply.persistentData.nether_warn == true)){
            log("Teleporting player");
            event.server.runCommand(`execute in ${SAFE_DIM} run tp ${ply.name} ${SAFE_SPOT[0]} ${SAFE_SPOT[1]} ${SAFE_SPOT[3]} `);
            event.server.runCommand(`/title ${ply.name} clear`);
            player.persistentData.nether_kill = true;
            player.tell("Returning to the Nether roof may result in loss of items.");
        }else if(!above(ply) && (ply.persistentData.nether_warn == true)){
            log("Player returned");
            event.server.runCommand(`/title ${ply.name} clear`);
            player.persistentData.nether_kill = true;
            player.tell("Thank you for staying below the nether roof. Returning may result in loss of items.");
        }
    }else{
        log("Player kill is already true!");
    }
})

let spawnProtection = (event,ply) => event.server.schedule(spawn_protection_ms, () => { // spawn protection
    log("Removing voucher protection");
    ply.persistentData.nether_protected = false;
})

let voucherProtection = (event,ply) => event.server.schedule(voucher_protection_ms, () => { // voucher protection
    log("Removing voucher protection");
    ply.persistentData.nether_protected = false;
})

let schedule = (event) => event.server.schedule(check_interval_ms, () => { // main, checks player positions

    log("Tick!");

    event.server.players.forEach(player => { // loop through every player
        let x = above(player);
        let protect = player.persistentData.nether_protected;
        let warned = player.persistentData.nether_warn;
        let kill = player.persistentData.nether_kill;

        if(protect == false){
            if(x && (warned == false)){
                player.persistentData.nether_warn = true;
                title(event,player,true);
                log("Warning player");
            }else if(x && (kill == true)){
                player.kill()
                log("Killing player");
            }else if(x){
                log("Player is warned but not killed");
            }

            if(!x && (warned == true) && (kill == false)){
                log("Player returned");
                event.server.runCommand(`/title ${player.name} clear`)
                player.persistentData.nether_kill = true;
                player.tell("Thank you for staying below the nether roof. Returning may result in loss of items.");
            }
        }else{
            log("Player has nether protection");
            if(x){
                title(event,player,false);
            }
        }

    })

    if(run){schedule(event)}; // recursion

})

onEvent("player.logged_in", (event) => { // for spawn protections
    player = event.player;
    player.persistentData.nether_protected = false;

    if(above(player) && (player.persistentData.nether_warn == true) && (player.persistentData.nether_kill == false)){ // they logged out during the warning and are above the nether roof
        log("Warning player");
        title(event,player,true);
        player.persistentData.nether_protected = false;
    }else if(!above(player) && (player.persistentData.nether_warn == true) && (player.persistentData.nether_kill == false)){ // they logged out during the warning but were below the nether roof
        log("Letting player off");
        player.persistentData.nether_warn = false;
        player.persistentData.nether_protected = false;
    }

    if(above(player) && (player.persistentData.nether_kill == true)){   // they logged out above the nether roof after being warned
        log("Giving spawn protection");
        player.persistentData.nether_kill = false; 
        player.persistentData.nether_protected = true;
        spawnProtection(event,player);
    }

});

onEvent('server.tick', event => {
    if(nether_scheduled == 0){
        schedule(event);
        nether_scheduled = 1;
        log("Initialized Script");
    }
})


onEvent('server.custom_command', event => { // commands
    if(event.player.op){
        if(event.id == 'nether_reset'){ // reset your own data
            event.player.tell("Resetting");
            event.player.persistentData.nether_kill = false; 
            event.player.persistentData.nether_protected = false;
            event.player.persistentData.nether_warn = false;
        }   
        
        if (event.id == 'nether_data'){ // show your persistent data
            event.player.tell("Data:");
            let data = event.player.persistentData;
            event.player.tell(data);
        }  

        if(event.id == 'nether_voucher'){ // spawn a voucher (right click for 5m protection)
            event.player.give(voucher);
        }     
        
        if(event.id == 'nether_baton'){ // spawn a baton (hit players to reset their data)
            event.player.give(voucher);
        }   
    }

})

onEvent('item.right_click', event => { // voucher protection, not usable by operators
    if(event.item == voucher){
        if(!event.player.op){
            log("Giving protection");
            event.player.tell("You are now protected for the next 5 minutes.")
            player.persistentData.nether_warn = true;
            event.player.persistentData.nether_kill = false; 
            event.player.persistentData.nether_protected = true;
            voucherProtection(event,event.player);
            event.item.count=event.item.count-1;
        }else{
            event.player.tell("Vouchers are not usable by operators.");
        }
    }
})


onEvent('entity.attack', event =>{ // baton

    if(event.getSource().getPlayer().isPlayer() && event.entity.isPlayer()){
        let ply = event.getSource().getPlayer();
        let amt = event.getDamage();
        let target = event.entity;
        let item = ply.getMainHandItem();

        if( ply.isPlayer() && !ply.isFake() && ply.op){
            if(item == baton){
                ply.tell(`Resetting data of ${target.name}`);
                target.tell(`Your nether roof data has been reset by ${ply.name}`);
                target.persistentData.nether_kill = false; 
                target.persistentData.nether_protected = false;
                target.persistentData.nether_warn = false;
            }
        }else if(!ply.op){
            ply.tell("Batons are not usable by non-operators");
        }
    }
})
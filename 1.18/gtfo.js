// GTFO!
// Script to toggle auto kick on non-operator players

var gtfo = {};
gtfo.enabled = false;

onEvent("player.logged_in", event => {
    let player = event.player;

    if(gtfo.enabled == true) { if(!player.op){ player.kick("Come back another time") } };

});

onEvent('server.custom_command', event => {
    let p = event.player;
    let on = gtfo.enabled;
    if (p.op) {
        if (event.id == 'gtfo') {
            if(on){
                gtfo.enabled = false;
                p.tell("Disabled");
            }
            else{
                gtfo.enabled = true;
                p.tell("Enabled");
            }
        }       
    }

})
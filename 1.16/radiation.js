// jank radiation script to mimic old nuclearcraft
// todo: inventory radiation

onEvent("player.tick", e => {
    if(e.player.getMainHandItem() == 'alltheores:uranium_ingot'){
        let msvh = 1
        let full = e.player.fullNBT
        let rads = full.ForgeCaps["mekanism:radiation"].radiation+ msvh/60/60/20
        
        full.ForgeCaps["mekanism:radiation"].radiation = rads

        e.player.mergeFullNBT(full)
    }
});
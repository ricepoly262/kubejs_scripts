// require an item to teleport (tpa, rtp, sethome, etc)

onEvent('command.run', event => {
    if (event.getParseResults().context.getSource().func_197022_f()) {
        let fullcommand = results.reader.string
        let prefix = fullcommand

        if (fullcommand.length() > 5) {
            prefix = fullcommand.substring(0, 5) //  /tpa
        }

        let exception = results.exceptions.equals({})

        if (exception) {
            if (prefix.equals('/tpa ') || fullcommand.equals('/home') || fullcommand.equals('/rtp')) {

                let canTP = false;
                let player = source.func_197022_f().entity;
                let inventory = player.field_71071_by.field_70462_a;

                inventory.forEach(item => {
                    let a = item.asKJS()

                    if (!a.equals(Item.empty)) {
                        if (a.id == 'kubejs:teleporter') {
                            canTP = true
                        }
                    }
                })

                if (!canTP) {
                    player.asKJS().tell('You need a teleporter to do that.')
                    event.cancel()
                }
            }


        }
    }
})
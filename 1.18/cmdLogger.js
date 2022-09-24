onEvent('command.run', event => {

    if(event.getParseResults().context.getSource().entity){
        let fullcommand = event.getParseResults().reader.string
        let player = event.getParseResults().context.getSource().entity

        console.log(`[CMDLOG] ${player.name.string}: ${fullcommand}`)
    }
})
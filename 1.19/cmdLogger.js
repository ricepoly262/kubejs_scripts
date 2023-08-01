// very simple script to log all commands to console
ServerEvents.command(event => {

    if (event.getParseResults().context.getSource().entity) {
        let fullcommand = event.getParseResults().reader.string
        let player = event.getParseResults().context.getSource().entity

        console.log(`[CMDLOG] ${player.name.string}: ${fullcommand}`)
    }
})
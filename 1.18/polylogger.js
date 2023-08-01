var polylogger = {};


// deprecated 



polylogger.path = 'kubejs/data/polylogger/';
polylogger.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function fileNameFromDate(date, type) {
    let filename = `${date.getDate()}_${polylogger.monthNames[date.getMonth()]}_${date.getFullYear()}`;
    return `${polylogger.path}${type}/${filename}.json`;
}


function readJson(type) {
    let date = new Date();
    let file = fileNameFromDate(date, type);

    console.log(`Reading JSON file ${file}`);
    let read = JsonIO.read(file);


    if (read == null) {
        console.log(`JSON file ${file} does not exist!`);

        let data = {};
        console.log(`Writing JSON file ${file}`);
        JsonIO.write(file, data);

        let test = JsonIO.read(`${file}`);
        if (test == null) {
            console.log(`Failed to write JSON file ${file}`);
        } else {
            return test;
        }

    } else {
        return read;
    }

}

function writeJson(type, data, action) {
    let date = new Date();
    let time = `${date.getTime()} | ${date.getHours()}:00`;
    let file = fileNameFromDate(date, type);
    let log = readJson(type);

    log[time] = {};
    log[time].action = action;
    log[time].data = data;

    console.log(`Writing JSON file ${file}`);
    JsonIO.write(`${file}`, log);
}



onEvent('item.entity_interact', event => {
    let ply = event.player;
    let mob = event.getTarget();
    let item = event.getItem();
    if (ply.isPlayer()) {
        if (!ply.isFake()) {
            let data = {};
            data.ply = ply.name.string;
            data.target = target.name.string;
            data.item = item.id;
            data.playerpos = [Math.floor(ply.x), Math.floor(ply.y), Math.floor(ply.z), event.level.dimension];
            data.targetpos = [Math.floor(mob.x), Math.floor(mob.y), Math.floor(mob.z), event.level.dimension];

            writeJson('entity', data, "ENTITY INTERACTION")
        }
    }
})

onEvent('entity.death', event => {
    if (event.getSource().getPlayer()) {
        let ply = event.getSource().getPlayer();
        let target = event.entity;
        if (ply.isPlayer()) {
            if (!ply.isFake()) {
                let data = {};
                data.attacker = ply.name.string;
                data.target = target.name.string;
                data.playerpos = [Math.floor(ply.x), Math.floor(ply.y), Math.floor(ply.z), event.level.dimension];
                data.targetpos = [Math.floor(target.x), Math.floor(target.y), Math.floor(target.z), event.level.dimension];

                writeJson('entity', data, "ENTITY KILL");
            }
        }
    }
})

onEvent('entity.hurt', event => {
    if (event.getSource().getPlayer()) {
        let ply = event.getSource().getPlayer();
        let amt = Math.round(event.getDamage());
        let target = event.entity;
        if (ply.isPlayer()) {
            if (!ply.isFake()) {
                let data = {};
                data.attacker = ply.name.string;
                data.target = target.name.string;
                data.amount = amt;
                data.playerpos = [Math.floor(ply.x), Math.floor(ply.y), Math.floor(ply.z), event.level.dimension];
                data.targetpos = [Math.floor(target.x), Math.floor(target.y), Math.floor(target.z), event.level.dimension];

                writeJson('entity', data, "ENTITY ATTACK");
            }
        }
    }
})


onEvent('block.break', event => {
    let block = event.block;

    if (event.player.isPlayer()) {
        if (event.player + '' != 'rftools_builder') {
            if (!event.player.isFake()) {
                let ply = event.player;
                let data = {};
                data.ply = ply.name.string;
                data.block = block.id;
                data.playerpos = [Math.floor(ply.x), Math.floor(ply.y), Math.floor(ply.z), event.level.dimension];
                data.blockpos = [block.x, block.y, block.z, event.level.dimension];

                writeJson('block', data, 'BLOCK BREAK');
            }
        }
    }
})

onEvent('block.place', event => {
    let block = event.block;
    if (event.entity.isPlayer()) {
        if (event.entity + '' != 'rftools_builder') {
            if (!event.entity.isFake()) {
                let ply = event.entity;
                let data = {};
                data.ply = ply.name.string;
                data.block = block.id;
                data.playerpos = [Math.floor(ply.x), Math.floor(ply.y), Math.floor(ply.z), event.level.dimension];
                data.blockpos = [block.x, block.y, block.z, event.level.dimension];

                writeJson('block', data, 'BLOCK PLACE');
            }
        }
    }
})

// TODO
/**onEvent('world.explosion.post', event => {

    let bomb = event.getBlock()

    let blocks = event.getAffectedBlocks()
    let entities = event.getAffectedEntities()

    let blocks2 = {}

    blocks.forEach(block => {
        if(!block.equals('minecraft:air')){
            blocks2.push(block)
        }
    })
 
    let data = {}
    data.affected = blocks2;
    writeJson('block',data,'EXPLOSION')

    data.affected = entities;
    writeJson('entities',data,'EXPLOSION')

})**/
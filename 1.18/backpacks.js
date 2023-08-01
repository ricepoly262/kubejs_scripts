// BackpacksJS
// remove backpacks with duplicate IDs
var backpacksjs = {};

backpacksjs.useJSON = true; // log using JSON files?
backpacksjs.filepath = 'kubejs/data/backpacks.json'; // log filepath





backpacksjs.readJson = () => {
    let file = backpacksjs.filepath;
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

backpacksjs.writeJson = (id, ply) => {
    let date = new Date();
    let time = `${date.getHours()}:00 | ${date.getDate()}, ${polylogger.monthNames[date.getMonth()]}, ${date.getFullYear()}`;
    let t = date.getTime();
    let file = backpacksjs.filepath;
    let log = backpacksjs.readJson();

    log[t] = {};
    log[t].time = time;
    log[t].uuid = id.toString();
    log[t].player = ply.name.string;
    console.log("Writing JSON")
    JsonIO.write(`${file}`, log);
}



backpacksjs.backpacks = ['sophisticatedbackpacks:backpack'];
backpacksjs.tiers = ['iron', 'gold', 'diamond', 'netherite'];

backpacksjs.tiers.forEach(t => { backpacksjs.backpacks.push(`sophisticatedbackpacks:${t}_backpack`) });

// thanks stack overflow
backpacksjs.findDuplicates = items => items.reduce((acc, v, i, arr) => arr.indexOf(v) !== i && acc.indexOf(v) === -1 ? acc.concat(v) : acc, [])

// convert inventory object into a loopable array
backpacksjs.arrayFromInv = (inventoryObject) => {
    let returnarray = [];

    for (let i = 0; i < inventoryObject.size; i++) {
        returnarray.push(inventoryObject.get(i));
    }

    return returnarray;
}

// check for duplicates and remove them
backpacksjs.checkForDuplicates = (inventoryObject, ply) => {
    let items = [];
    let nbts = [];
    let inventory = backpacksjs.arrayFromInv(inventoryObject);

    inventory.forEach(item => { // sort inventory into just backpacks
        backpacksjs.backpacks.forEach(backpack => {
            if (item.id == backpack) {
                if (item.nbt) {
                    items.push(item);
                    nbts.push(item.nbt.contentsUuid.toString())
                }
            }
        })
    })

    if (items.length > 1) { // there is more than 1 backpack

        let duplicates = backpacksjs.findDuplicates(nbts); // find duplicates

        if (duplicates.length) { // there are duplicates

            var lastItem;
            var removed = false;
            items.forEach(item => { // loop through all the backpacks
                if (duplicates.includes(item.nbt.contentsUuid.toString())) { // the backpack has an id that is in the duplicate id list
                    inventoryObject.clear(item); // remove backpack
                    lastItem = item;
                    removed = true;
                }

            })
            if (removed) {
                ply.give(lastItem); // because ALL duplicates are removed, we want to give at least 1 back
                if (backpacksjs.useJSON) { backpacksjs.writeJson(lastItem.nbt.contentsUuid, ply); }
            }
        }

    }
}


onEvent('player.inventory.closed', event => {
    backpacksjs.checkForDuplicates(event.player.inventory, event.player);
})
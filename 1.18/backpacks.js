// remove backpacks with duplicate IDs


var backpacks = ['sophisticatedbackpacks:backpack'];
var tiers = ['iron','gold','diamond','netherite'];
tiers.forEach(t => {backpacks.push(`sophisticatedbackpacks:${t}_backpack`)});

// thanks stack overflow
const findDuplicates = items => items.reduce((acc, v, i, arr) => arr.indexOf(v) !== i && acc.indexOf(v) === -1 ? acc.concat(v) : acc, [])

// convert inventory object into a loopable array
function arrayFromInv(inventoryObject){
    let returnarray = [];

    for (let i = 0; i < inventoryObject.size; i++) {
        returnarray.push(inventoryObject.get(i));
    }

    return returnarray;
}

// check for duplicates and remove them
function checkForDuplicates(inventoryObject,ply){
    let items = [];
    let nbts = [];
    let inventory = arrayFromInv(inventoryObject);

    inventory.forEach(item => { // sort inventory into just backpacks
        backpacks.forEach(backpack => {
            if(item.id == backpack){
                if(item.nbt){
                    items.push(item);
                    nbts.push(item.nbt.contentsUuid.toString())
                }
            }
        })
    })

    if(items.length>1){ // there is more than 1 backpack
    
        let duplicates = findDuplicates(nbts); // find duplicates

        if(duplicates.length){ // there are duplicates

            var lastItem;
            items.forEach(item => { // loop through all the backpacks
                if(duplicates.includes(item.nbt.contentsUuid.toString())){ // the backpack has an id that is in the duplicate id list
                    inventoryObject.clear(item); // remove backpack
                    lastItem = item;
                }

            })
            ply.give(lastItem); // because ALL duplicates are removed, we want to give at least 1 back
        }

    }
}



onEvent('player.inventory.closed', event => {
	console.log("inventory closed");
    checkForDuplicates(event.player.inventory,event.player);
})
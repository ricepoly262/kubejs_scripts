// ricepoly262 library 
// used in most of my scripts as a dependency 
// TODO: make dependency optional

const POLYBOOK = true

function isValid(obj){
    if(obj == false){ return false; }
    if(obj == undefined){return false; }
    if(obj == null){ return false; }
    return Object.keys(obj).length>0;
}

function hasKeys(obj){
    return Object.keys(obj).length>0;
}

function jwrite(path,data){
    let oldData = JsonIO.read(path);
    if(data === oldData){ return false; }
    JsonIO.write(path, data);

    let newData = JsonIO.read(path);
    if(data === newData){ return true; }
    return false; 
    
}

function getCachedName(ply){ 
    if(!isValid(ply.persistentData.ricepoly.CachedName)){
        ply.persistentData.ricepoly.CachedName = ply.name.string;
    } 
    return ply.persistentData.ricepoly.CachedName;
}
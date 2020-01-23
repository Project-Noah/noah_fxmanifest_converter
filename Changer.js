/* Dependencies */
const fs = require("fs");
const glob = require("glob");
const async = require("async");

/* Helper */
const { logInfo, logWarn, logError } = require('./helpers/logger');

/* Class */
class Changer {
    constructor() {
        this.resourceDirectory = null;
        this.directories = [];
    }

    loadResource(directory, cb = null) {
        this.resourceDirectory = directory

        glob(this.resourceDirectory + '/**/__resource.lua', (err, resources) => {
            this.directories = resources;

            if(cb != null) { cb(); }
        });
    }

    convert(game_type, cb = null) {
        let directories = this.directories;

        if(!directories) {
            return logError('Resource directory not found!', 'Changer');
        }

        logInfo('Converting ' + directories.length + ' directories', 'Changer');
        async.eachLimit(directories, 1, function(directory, callback) {
            fs.readFile(directory, {encoding: 'utf-8'}, function(err, data) {
                if(err) {
                    return callback(err);
                }

                let dataArray = data.split('\n');
                const searchKeyword = 'resource_manifest_version';
                let lastIndex = -1;

                for (let index=0; index<dataArray.length; index++) {
                    if (dataArray[index].includes(searchKeyword)) { 
                        lastIndex = index;
                        break; 
                    }
                }

                dataArray.splice(lastIndex, 1);
                dataArray[0] = "fx_version 'adamant'\ngame " + game_type;
                
                const updatedData = dataArray.join('\n');
                fs.writeFile(directory, updatedData, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    let __resource = directory;
                    const regex = /__resource/gi;
                    let fxmanifest = __resource.replace(regex, 'fxmanifest')

                    fs.rename(directory, fxmanifest, function (err) {
                        if (err) throw err;
                        
                        logInfo('Converted : ' + directory + ' -> ' + fxmanifest, 'Changer');
                        return callback();
                    });
                });
            });
        }, function(err) {
            if(err) {
                logError('Error : ' + err, 'Changer');
                if(cb != null) { 
                    return cb(false); 
                }
            }

            return cb(true);
        });
    }
}

/* Exports */
module.exports = Changer;
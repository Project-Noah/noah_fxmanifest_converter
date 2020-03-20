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

        let glob_directory = "/**/__resource.lua";

        if (global.replace_non_selected) {
            glob_directory = "/**/+(__resource|fxmanifest).lua";
        }
        
        glob(this.resourceDirectory + glob_directory, (err, resources) => {
            this.directories = resources;

            if(cb != null) { cb(); }
        });
    }

    convert(cb = null) {
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
                let type = 0;
                let lastIndex = -1;

                for (let index=0; index<dataArray.length; index++) {
                    if (dataArray[index].includes('resource_manifest_version')) { 
                        lastIndex = index;
                        break; 
                    }

                    if (global.replace_non_selected && dataArray[index].includes('fx_version')) {
                        type = 1;
                        lastIndex = index;
                        break;
                    }
                }

                if ((lastIndex == -1 || lastIndex !== -1) && type == 0) {
                    if (lastIndex !== -1) {
                        dataArray.splice(lastIndex, 1);
                    }

                    let fx_version = "fx_version '" + global.version + "'\ngame " + game_type + (dataArray[0] === "\r" || dataArray[0] === "\n" || dataArray[0] === "\r\n" ? "" : "\n");
                    dataArray.unshift(fx_version);

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
                } else if (lastIndex !== -1 && type == 1) {
                    let fx_version = dataArray[lastIndex];
                    let match = fx_version.match(/[^' ]+/g);

                    if (!match[0] == "fx_version") {
                        logError('While match with regex, I can\'t find fx_version in first place on data array. Report this to holfz  (Data : ' + fx_version + ', Match : ' + match + ')', 'Changer');
                        return callback();
                    }
                    
                    if (match[1] == global.version) {
                        return callback();
                    }

                    let oldVersion = match[1];

                    match[1] = "'" + global.version + "'";
                    dataArray[lastIndex] = match.join(' ');

                    const updatedData = dataArray.join('\n');
                    fs.writeFile(directory, updatedData, (err) => {
                        if (err) {
                            return callback(err);
                        }
    
                        logInfo('Changed fx_version : ' + oldVersion + ' -> ' + global.version + ' (' + directory + ')', 'Changer');
                        return callback();
                    });
                } else {
                    logError('Mismatch type and index. Report this to holfz  (Type : ' + type + ', Index : ' + lastIndex + ')', 'Changer');
                    return callback();
                }
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
// I have take some logic/code style from https://github.com/indilo53/fxserver-resource-scrambler/. It's a cool resource event scrambler. Go and check it out!
/* Dependencies */
const cpr = require('cpr');

/* Components */
const Changer = require('./Changer.js');

/* Helper */
const { logInfo, logWarn, logError } = require('./helpers/logger');

/* Start */
const changer = new Changer();

/* Main */
logInfo('Copying resources. This may take a while to finish');
cpr('./resources', './converted_resource', {
    deleteFirst : true,
    overwrite   : true,
    confirm     : true,
}, (err, files) => {
    if (err) {
        return logError('CPR Error : ' + err);
    }

    logInfo('Loading scripts');
    changer.loadResource('./converted_resource', () => {
        logInfo('Resource Loaded. Converting to fxmanifest');

        changer.convert((success) => {
            if(success) { 
                logInfo('Successfully converted from __resource to fxmanifest!');
            } else {
                logError('Failed to convert from __resource to fxmanifest!');
            }
        })
    })
});

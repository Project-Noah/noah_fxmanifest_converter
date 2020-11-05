// I have take some logic/code style from https://github.com/indilo53/fxserver-resource-scrambler/. It's a cool resource event scrambler. Go and check it out!
/* Dependencies */
const cpr = require('cpr');
const prompts = require('prompts');

/* Components */
const Changer = require('./Changer.js');

/* Helper */
const { logInfo, logWarn, logError } = require('./helpers/logger');

/* Start */
const changer = new Changer();

/* Variable */
global.version;
global.game_type;
global.replace_non_selected;

const questions = [
    {
        type: 'select',
        name: 'version',
        message: 'FX Version ?',
        choices: [
            { title: 'adamant', value: "adamant" },
            { title: 'bodacious', value: "bodacious" },
            { title: 'cerulean', value: "cerulean" },
        ],
        initial: 0
    },
    {
        type: 'select',
        name: 'game',
        message: 'Game Type ?',
        choices: [
            { title: 'common', description: 'Runs on any game, but can\'t access game-specific APIs - only CitizenFX APIs.', value: "'common'" },
            { title: 'rdr3', description: 'Runs on RedM.', value: "'rdr3'" },
            { title: 'gta5', description: 'Runs on FiveM.', value: "'gta5'" }
        ],
        initial: 0
    },
    {
        type: 'confirm',
        name: 'replace_non_selected',
        message: 'If yes, Converter will check for fx_version that isn\'t selected version. And replace it with selected version',
        initial: false
    }
];

/* Main */
(async () => {
    const onCancel = prompt => {
        logError('Aborted by user.');
        process.exit();
    }

    const response = await prompts(questions, { onCancel });
    global.version = response.version;
    global.game_type = response.game;
    global.replace_non_selected = response.replace_non_selected;

    logInfo('FX Version set to : ' + version);
    logInfo('Game type set to : ' + game_type);

    if (replace_non_selected) {
        logInfo('Converter WILL check for fx_version that isn\'t selected version. And replace it with selected version');
    } else {
        logInfo('Converter WILL NOT check for fx_version that isn\'t selected version. And replace it with selected version');
    }

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
            logInfo('Resource Loaded. Converting...');
    
            changer.convert((success) => {
                if(success) { 
                    logInfo('Successfully converted from __resource to fxmanifest!');
                } else {
                    logError('Failed to convert from __resource to fxmanifest!');
                }
            });
        });
    });

})();

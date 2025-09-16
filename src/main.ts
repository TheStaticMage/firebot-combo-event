import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { registerEventSource } from './event';
import { twitchEventSubClient } from './eventsub';

export let firebot: RunRequest<any>;
export let logger: LogWrapper;

const scriptVersion = '0.0.1';

const script: Firebot.CustomScript<any> = {
    getScriptManifest: () => {
        return {
            name: 'Combo Event',
            description: 'A Firebot custom script for handling Twitch Combo Events.',
            author: 'The Static Mage',
            version: scriptVersion,
            startupOnly: true,
            firebotVersion: '5'
        };
    },
    getDefaultParameters: () => {
        return {};
    },
    parametersUpdated: () => {
        // No parameters to update
    },
    run: async (runRequest) => {
        firebot = runRequest;
        logger = new LogWrapper(runRequest.modules.logger);

        // Requires Firebot >= 5.65 because of https://github.com/crowbartools/Firebot/commit/55744f55095d6d6ca791adced534c5a6fad37119
        const firebotVersion = firebot.firebot.version;
        const [major, minor] = firebotVersion.split('.').map(num => parseInt(num, 10));
        if (major < 5 || (major === 5 && minor < 65)) {
            logger.error(`Firebot Combo Event script requires Firebot version 5.65 or higher. You are running version ${firebotVersion}. Please update Firebot to use this script.`);
            return;
        }

        // Register the event source
        registerEventSource();
        logger.info(`Firebot Combo Event script initialized (version ${scriptVersion}).`);

        // Start the eventsub subscription
        await twitchEventSubClient.createClient();
    },
    stop: async () => {
        // Clean up resources if needed
        twitchEventSubClient.disconnectEventSub();
        logger.info('Firebot Combo Event script stopped.');
    }
};

class LogWrapper {
    private _logger: Logger;

    constructor(inLogger: Logger) {
        this._logger = inLogger;
    }

    info(message: string) {
        this._logger.info(`[firebot-combo-event] ${message}`);
    }

    error(message: string) {
        this._logger.error(`[firebot-combo-event] ${message}`);
    }

    debug(message: string) {
        this._logger.debug(`[firebot-combo-event] ${message}`);
    }

    warn(message: string) {
        this._logger.warn(`[firebot-combo-event] ${message}`);
    }
}

export default script;

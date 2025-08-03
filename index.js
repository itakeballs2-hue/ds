// MADE BY ONYX

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const Discord = require('discord.js-selfbot-v13');
const chalk = require('chalk');
const figlet = require('figlet');
const moment = require('moment');

// Function to install missing modules
function installModules() {
    const requiredModules = [
        'discord.js-selfbot-v13',
        'chalk',
        'figlet',
        'moment'
    ];

    requiredModules.forEach(module => {
        try {
            require.resolve(module);
        } catch (err) {
            console.log(`Installing missing module: ${module}`);
            try {
                execSync(`npm install ${module}`, { stdio: 'inherit' });
            } catch (installError) {
                console.error(`Failed to install ${module}:`, installError);
            }
        }
    });
}

// Function to log messages with timestamp and type
function log(message, type = 'info') {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const colors = {
        info: chalk.blueBright,
        success: chalk.greenBright,
        error: chalk.redBright,
        warning: chalk.yellowBright
    };

    const logTypes = {
        info: 'Info',
        success: 'Success',
        error: 'Error',
        warning: 'Warning'
    };

    console.log(
        colors[type](
            `[${logTypes[type]}] ${timestamp} → ${message}`
        )
    );
}

// Function to set rich presence state
function setRichPresence(client, rpcState) {
    try {
        const activity = new Discord.RichPresence(client)
            .setType(rpcState.type)
            .setName(rpcState.name)
            .setDetails(rpcState.details)
            .setState(rpcState.state);

        if (rpcState.type === 'STREAMING' && rpcState.url) {
            activity.setURL(rpcState.url);
        }

        if (rpcState.timestamps) {
            activity.setStartTimestamp(rpcState.timestamps.start);
        }

        if (rpcState.assets) {
            activity
                .setAssetsLargeImage(rpcState.assets.largeImage)
                .setAssetsLargeText(rpcState.assets.largeText)
                .setAssetsSmallImage(rpcState.assets.smallImage)
                .setAssetsSmallText(rpcState.assets.smallText);
        }

        client.user.setActivity(activity);
        log(`Set RPC to ${rpcState.name}`, 'info');
    } catch (error) {
        log(`RPC Update Error: ${error.message}`, 'error');
    }
}

// Main function to initialize the bot
async function main() {
    installModules();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your Discord token: ', (token) => {
        const client = new Discord.Client({
            checkUpdate: false,
            autoRedeemNitro: true,
            captchaService: 'capmonster.cloud',
            syncStatus: true
        });

        const configPath = path.join(__dirname, 'config.json');
        if (!fs.existsSync(configPath)) {
            console.error('config.json file not found!');
            process.exit(1);
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        client.on('ready', async () => {
            console.clear();
            console.log(
                chalk.magentaBright(
                    figlet.textSync('Onyx RPC', { 
                        font: 'Slant', 
                        horizontalLayout: 'default', 
                        verticalLayout: 'default' 
                    })
                )
            );

            log(`Successfully Authenticated`, 'success');
            log(`Logged in as ${client.user.tag}`, 'info');
            log(`User ID: ${client.user.id}`, 'info');
            log(`Made by Onyx`, 'info');

            client.user.setStatus(config.status.type);
            setRichPresence(client, config.rpcState);
        });

        client.on('error', (error) => {
            log(`Client Connection Error: ${error.message}`, 'error');
        });

        process.on('unhandledRejection', (reason, promise) => {
            log(`Unhandled System Rejection: ${reason}`, 'warning');
        });

        process.on('SIGINT', () => {
            log('Selfbot shutting down gracefully', 'warning');
            client.destroy();
            process.exit(0);
        });

        client.login(token);
        rl.close();
    });
}

main();
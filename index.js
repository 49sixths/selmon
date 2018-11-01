// Config ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const CHECK_TIMER = 1000 * (parseInt(process.env.CHECK_TIMER) || 300); // Timer in seconds

// DISCORD_CLIENT_ID
// REDISLABS_PW
// REDISLABS_URL
// URL
// SELECTOR
// CHECK_TIMER

// Libraries /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const axios = require('axios');
const cheerio = require('cheerio');
const {DateTime} = require('luxon');
const Discord = require('discord.js');
const discClient = new Discord.Client();
const app = require('express')();

// Magic /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
	res.send('Listening');
});

app.listen(process.env.PORT || 8081, () => {
	console.log(`Webserver listening on port ${process.env.PORT || 8081}`);
})

function log(msg) {
	const timestamp = DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss');
	console.log(msg, timestamp)
}

discClient.on('ready', () => {
	discClient.channels.forEach(chan => {
		if (chan.name == 'test') {
			discChan = chan;
		}
	});

	checkNow();
});

discClient.login(process.env.DISCORD_CLIENT_ID);

let currentState = null;

function checkNow() {
	axios.get(process.env.URL).then(res => {
		const $ = cheerio.load(res.data);
		if ($(process.env.SELECTOR).length > 0) {
			log('POSITIVE');
			if (currentState === false) {
				discChan.send('Selector matched');
				log('Selector matched');
			}
			currentState = true;
		} else {
			log('NEGATIVE');
			if (currentState === true) {
				log('Selector no longer matches');
			}
			currentState = false;
		}
	});

	setTimeout(checkNow, CHECK_TIMER);
}
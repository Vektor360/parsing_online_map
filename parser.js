// parser.js
const minimist = require('minimist');
const googlePlacesModule = require('./googlePlacesModule');

const args = minimist(process.argv.slice(2), { string: ['c', 't'] });

console.log('Аргументы:', args);

if (args.c && args.t) {
    const [lat, lng] = args.c.split(',').map(parseFloat);

    if (!isNaN(lat) && !isNaN(lng)) {
        const center = [lat, lng];
        const tags = args.t.split(',');

        console.log('Центр:', center);
        console.log('Теги:', tags);

        const currentDirectory = process.cwd();
        googlePlacesModule.getPlaceCoordinates(center, tags, currentDirectory);
    } else {
        console.log('Пожалуйста, укажите корректные координаты центра с помощью аргумента -c.');
    }
} else {
    console.log('Пожалуйста, укажите и координаты центра (-c) и теги (-t).');
}


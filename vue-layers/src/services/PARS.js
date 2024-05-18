// parser.js
const minimist = require('minimist');
const googlePlacesModule = require('./googlePlacesModule');

const args = minimist(process.argv.slice(2), { string: ['c', 't', 'f'] });

console.log('Аргументы:', args);

if (args.c && args.t && args.f) {
    const [lat, lng] = args.c.split(',').map(parseFloat);

    if (!isNaN(lat) && !isNaN(lng)) {
        const center = [lat, lng];
        const center2 = [lat, lng+0.03];
        const center3 = [lat, lng-0.06];
        const tags = args.t.split(',');
        const fileName = args.f;

        console.log('Центр:', center);
        console.log('Теги:', tags);
        console.log('Имя файла:', fileName);

        googlePlacesModule.getPlaceCoordinates(center, tags, fileName);
        
        googlePlacesModule.getPlaceCoordinates(center2, tags, fileName);
        
        googlePlacesModule.getPlaceCoordinates(center3, tags, fileName);
    } else {
        console.log('Пожалуйста, укажите корректные координаты центра с помощью аргумента -c.');
    }
} else {
    console.log('Пожалуйста, укажите и координаты центра (-c),теги (-t) и имя файла (-f).');
}

// googlePlacesModule.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = 'insert_api_key';

function getPlaceCoordinates(center, tags, filePath) {
  const location = center.join(',');
  const radius = '50000';
  const geojsonFeatures = [];

  tags.forEach(async type => {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          key: apiKey,
          location,
          radius,
          type,
        },
      });

      if (response.data.status === 'OK') {
        const places = response.data.results;
        places.forEach(place => {
          const feature = {
            type: 'Feature',
            properties: {
              name: place.name,
              type: type,
            },
            geometry: {
              type: 'Point',
              coordinates: [place.geometry.location.lng, place.geometry.location.lat],
            },
          };
          geojsonFeatures.push(feature);
        });

        const geojson = {
          type: 'FeatureCollection',
          features: geojsonFeatures,
        };

        fs.writeFileSync(path.join(__dirname, 'places.geojson'), JSON.stringify(geojson, null, 2));
        console.log('GeoJSON сохранен в places.geojson');
    }
  });
}

module.exports = { getPlaceCoordinates };

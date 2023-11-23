const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = 'insert_api_key';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPlaceCoordinates(center, tags, filePath) {
  const location = center.join(',');
  const radius = '50000';
  const geojsonFeatures = [];

  for (const type of tags) {
    let nextPageToken = null;

    do {
      const params = {
        key: apiKey,
        location,
        radius,
        type,
        pagetoken: nextPageToken,
      };

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { params });

      if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
        const places = response.data.results;
        nextPageToken = response.data.next_page_token;

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

        // Добавим задержку между запросами, чтобы избежать проблем с nextPageToken
        await sleep(2000);
      } else {
        console.error(`Ошибка при выполнении запроса для типа ${type}:`, response.data.status);
        nextPageToken = null; // Прекратить получение дополнительных результатов в случае ошибки
      }

    } while (nextPageToken);

  }

  const geojson = {
    type: 'FeatureCollection',
    features: geojsonFeatures,
  };

  fs.writeFileSync(path.join(__dirname, 'places.geojson'), JSON.stringify(geojson, null, 2));
  console.log('GeoJSON сохранен в places.geojson');
}

module.exports = { getPlaceCoordinates };

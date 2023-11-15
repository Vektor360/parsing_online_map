const fs = require('fs');
const axios = require('axios');

// Замените на ваш API-ключ Google Places API
const apiKey = 'insert_api_key';

async function getPlaceCoordinates() {
  const location = '46.9541,142.736'; // Координаты центра
  const radius = '50000'; // Радиус поиска
  const types = ['restaurant', 'cafe', 'food']; // Типы заведений
  const geojsonFeatures = [];

  try {
    for (const type of types) {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
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
      } else {
        console.error(`Ошибка при выполнении запроса для типа ${type}:`, response.data.status);
      }
    }

    const geojson = {
      type: 'FeatureCollection',
      features: geojsonFeatures,
    };

    // Сохраните GeoJSON в файл
    fs.writeFileSync('places.geojson', JSON.stringify(geojson, null, 2));
    console.log('GeoJSON сохранен в places.geojson');
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

getPlaceCoordinates();


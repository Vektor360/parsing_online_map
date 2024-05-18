const axios = require('axios');

async function getPlaceCoordinates(center, tags) {
  const location = center.join(',');
  const radius = '50000';
  let geojsonFeatures = [];

  for (const type of tags) {
    let nextPageToken = null;

    do {
      const params = {
        key: 'AIzaSyD8hUY4LnkAAuHzziLC9epiSBxX6CQ1Myo', // Замените на свой API-ключ Google Places
        location,
        radius,
        type,
        pagetoken: nextPageToken,
      };

      const response = await axios.get('http://localhost:3000/places', { params });

      if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
        const places = response.data.results;
        nextPageToken = response.data.next_page_token;

        places.forEach(place => {
          // Проверяем, что такого места еще нет в geojsonFeatures
          const isDuplicate = geojsonFeatures.some(existingPlace => existingPlace.properties.name === place.name);

          if (!isDuplicate) {
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
          }
        });

        // Добавим задержку между запросами, чтобы избежать проблем с nextPageToken
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error(`Ошибка при выполнении запроса для типа ${type}:`, response.data.status);
        nextPageToken = null; // Прекратить получение дополнительных результатов в случае ошибки
      }

    } while (nextPageToken);

  }

  // Обработка полученных гео-данных
  console.log('GeoJSON Features:', geojsonFeatures);
}

module.exports = { getPlaceCoordinates };

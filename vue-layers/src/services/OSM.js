const axios = require('axios');

async function getResidentialBuildings(bbox) {
  try {
    const overpassQuery = `
      [out:json];
      (
        node["building"="house"](${bbox});
        node["building"="apartments"](${bbox});
        node["building"="semidetached_house"](${bbox});
        node["building"="residential"](${bbox});
        way["building"="house"](${bbox});
        way["building"="apartments"](${bbox});
        way["building"="semidetached_house"](${bbox});
        way["building"="residential"](${bbox});
        relation["building"="house"](${bbox});
        relation["building"="apartments"](${bbox});
        relation["building"="semidetached_house"](${bbox});
        relation["building"="residential"](${bbox});
      );
      out geom;
    `;

    const response = await axios.post('https://maps.mail.ru/osm/tools/overpass/api/interpreter', overpassQuery, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200) {
      const geojsonFeatures = response.data.elements.map(element => {
        if (!element.geometry) {
          console.error('Error: Element does not have geometry property', element);
          return null;
        }
        const geometryType = determineGeometryType(element);
        const coordinates = getCoordinates(element);
        //console.log(coordinates)
        return {
          type: 'Feature',
          properties: {
            id: element.id,
            type: element.type,
            tags: element.tags,
          },
          geometry: {
            type: geometryType,
            coordinates: coordinates,
          },
        };
      }).filter(feature => feature !== null);

      const geojson = {
        type: 'FeatureCollection',
        features: geojsonFeatures,
      };
      
      return geojson;
    } else {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

function determineGeometryType(element) {
  if (element.type === 'node') {
    return 'Point';
  } else if (element.type === 'way') {
    return element.geometry.type === 'Point' ? 'Point' : 'Polygon';
  } else if (element.type === 'relation') {
    return 'MultiPolygon';
  }
}

function getCoordinates(element) {
  let coordinates;
  if (element.type === 'node') {
    coordinates = [element.geometry[0].lon, element.geometry[0].lat];
  } else if (element.type === 'way') {
    coordinates = element.geometry.map(point => [point.lon, point.lat]);
  } else if (element.type === 'relation') {
    coordinates = element.geometry.map(polygon => polygon[0].map(point => [point.lon, point.lat]));
  } else {
    return null;
  }

  return [coordinates]; // Оборачиваем результат в квадратные скобки
}


function getSquareCoordinates(latitude, longitude, radius) {
  const bottomLeftLatitude = latitude + (radius / 111190);
  const bottomLeftLongitude = longitude - (radius / 111190);
  const topRightLatitude = latitude - (radius / 111190);
  const topRightLongitude = longitude + (radius / 111190);

  return `${topRightLatitude},${bottomLeftLongitude},${bottomLeftLatitude},${topRightLongitude}`;
}

module.exports = { getSquareCoordinates, getResidentialBuildings };

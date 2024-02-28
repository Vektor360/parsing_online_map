import osmtogeojson from 'osmtogeojson';
import proj4 from 'proj4';
import { http } from './http-client';

const epsg4326 = '+proj=longlat +datum=WGS84 +no_defs';
const epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
const convertFeatureCoordinates = (feature: any) => {
  const result = [];

  feature.geometry.coordinates[0].forEach(item => result.push(proj4(epsg4326, epsg3857, item)));

  feature.geometry.coordinates[0] = result;
};
const requestFeatures = async (area: []) => {
  // Здесь показан пример запроса к OSM. Тело этой функции можно подменить операциями по получению геометрии
  // с помощью существующих скриптов. Эти скрипты можно оформить по аналогии с имеющимися, поместив в соответствующие
  // файлы с расширением .ts и импортировав из них нужные объекты.

  // Стоит обратить внимание на то, что координаты, полученные с карты (они в СК 3857, метры), преобразуются в геодезические (4326, градусы)
  // с помощью библиотеки proj4, поскольку OSM работает именно в 4326.
  const areaPolygon = area[0]!;
  // Сначала преобразуем координаты прямоугольной области запроса из 3857 в 4326.
  const minLatLon = proj4(epsg3857, epsg4326, areaPolygon[0]);
  const maxLatLon = proj4(epsg3857, epsg4326, areaPolygon[2]);
  // Инвертируем координаты точек.
  const reversedMinLatLon = [minLatLon[1], minLatLon[0]];
  const reversedMaxLatLon = [maxLatLon[1], maxLatLon[0]];
  const requestBbox = `${reversedMinLatLon},${reversedMaxLatLon}`;
  const url = `http://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way["building"](${requestBbox}););out body geom;`;
  const result = await http.get(url);
  // Конвертируем данные из формата OSM в GeoJSON.
  const geojson = osmtogeojson(result.data);

  // Конвертируем геометрию каждого объекта из ответа OSM из 4326 в 3857.
  geojson.features.forEach(item => convertFeatureCoordinates(item));

  return geojson.features;
};

export { requestFeatures };

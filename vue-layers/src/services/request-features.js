import osmtogeojson from 'osmtogeojson';
import proj4 from 'proj4';
import axios from 'axios';

axios.defaults.headers.get['Accepts'] = 'application/json';
axios.defaults.headers.get['Content-Type'] = 'application/json, text/plain, */*';

const http = axios.create();

const epsg4326 = '+proj=longlat +datum=WGS84 +no_defs';
const epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
const convertFeatureCoordinates = (feature) => {
  const result = [];

  feature.geometry.coordinates[0].forEach(item => result.push(proj4(epsg4326, epsg3857, item)));

  feature.geometry.coordinates[0] = result;
};
const requestFeatures = async (area) => {
const areaPolygon = area?.[0];
  const minLatLon = proj4(epsg3857, epsg4326, areaPolygon[0]);
  const maxLatLon = proj4(epsg3857, epsg4326, areaPolygon[2]);
  const reversedMinLatLon = [minLatLon[1], minLatLon[0]];
  const reversedMaxLatLon = [maxLatLon[1], maxLatLon[0]];
  const requestBbox = `${reversedMinLatLon},${reversedMaxLatLon}`;
  const url = `http://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(way["building"](${requestBbox}););out body geom;`;
  const result = await http.get(url);
  const geojson = osmtogeojson(result.data);
  geojson.features.forEach(item => convertFeatureCoordinates(item));
  return geojson.features;
};

export { requestFeatures };

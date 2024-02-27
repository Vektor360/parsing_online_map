import { onMounted, ref } from 'vue';
import { View } from 'ol';
import { Projection, get as getProjection } from 'ol/proj';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useMapStyles } from './use-map-styles';

export const useMap = (
  projection: string,
  target: string,
  center: number[],
  mountedHandler: Function
) => {
  const map = ref();
  const tileLayer = new TileLayer({ source: new OSM() });
  const { styleFunction } = useMapStyles();
  const requestAreaVectorLayer = new VectorLayer({ source: new VectorSource({ wrapX: false }) });
  const mapFeaturesVectorLayer = new VectorLayer({
    source: new VectorSource({ wrapX: false }),
    style: styleFunction
  });
  const mapCenter = ref(center);
  const createMap = () => {
    map.value = new Map({
      view: new View({
        projection: getProjection(projection) as Projection,
        center: center,
        zoom: 14
      }),
      layers: [ tileLayer, requestAreaVectorLayer, mapFeaturesVectorLayer ],
      target: target,
      controls: []
    });

    map.value.on('moveend', (eventData: any) => mapCenter.value = eventData.map.getView().getCenter());
  };
  const addMapFeatures = (features: any[]) => {
    const openLayersGeoJson = new GeoJSON();
    const featureGeometries = features.map(item => openLayersGeoJson.readFeature(item));
    const layerSource = mapFeaturesVectorLayer.getSource();

    layerSource?.addFeatures(featureGeometries);
    map.value.getView().fit(layerSource?.getExtent(), { padding: [ 80, 80, 80, 80 ] });
  };
  const clearMapFeatures = () => mapFeaturesVectorLayer.getSource()?.clear();

  onMounted(() => {
    createMap();
    mountedHandler();
  });

  return { map, mapCenter, addMapFeatures, clearMapFeatures };
};

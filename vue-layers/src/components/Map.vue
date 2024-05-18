<template>
  <div id="map"></div>
</template>

<script>
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import Overlay from 'ol/Overlay';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { fromCircle } from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import Polygon from 'ol/geom/Polygon';
import GeoJSON from 'ol/format/GeoJSON'; // Импорт GeoJSON из OpenLayers

export default {
  name: 'CustomMap',
  props: {
    ellipseRadius: {
      type: Number,
      required: true
    },
    geojsonFeatures: {
      type: Object,
      default: null
    }
    
  },
  data() {
    return {
      map: null,
      marker: null,
      overlay: null,
      latitude: 0,
      longitude: 0,
      vectorLayer: null
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    styleFunction(features)
    {
      console.log(features)
      const image = new CircleStyle({
      radius: 5,
      stroke: new Stroke({ color: 'red', width: 1 }),
      });
        const styles = {
          'Point': new Style({
            image: image,
          }),
          'LineString': new Style({
            stroke: new Stroke({
              color: 'green',
              width: 1,
            }),
          }),
          'LinearRing': new Style({
            stroke: new Stroke({
              color: 'green',
              width: 1,
            }),
          }),
          'MultiLineString': new Style({
            stroke: new Stroke({
              color: 'green',
              width: 1,
            }),
          }),
          'MultiPoint': new Style({
            image: image,
          }),
          'MultiPolygon': new Style({
            stroke: new Stroke({
              color: 'yellow',
              width: 1,
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 0, 0.1)',
            }),
          }),
          'Polygon': new Style({
            stroke: new Stroke({
              color: 'blue',
              lineDash: [4],
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)',
            }),
          }),
          'GeometryCollection': new Style({
            stroke: new Stroke({
              color: 'magenta',
              width: 2,
            }),
            fill: new Fill({
              color: 'magenta',
            }),
            image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                color: 'magenta',
              }),
            }),
          }),
          'Circle': new Style({
            stroke: new Stroke({
              color: 'red',
              width: 2,
            }),
            fill: new Fill({
              color: 'rgba(255,0,0,0.2)',
            }),
          }),
        };
        return styles[features.getGeometry().getType()];
    },
    async initMap() {
      this.vectorLayer = new VectorLayer({
        source: new VectorSource({ wrapX: false }),
        style: this.styleFunction
      });
      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          this.vectorLayer
        ],
        view: new View({
          center: [0, 0],
          zoom: 2
        })
      });

      // Добавляем обработчик события клика на карту
      this.map.on('click', this.handleMapClick);

      // Создаем всплывающее окно для метки
      this.overlay = new Overlay({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        stopEvent: false
      });
      this.map.addOverlay(this.overlay);
    },

    addMapFeatures(features) {
    const openLayersGeoJson = new GeoJSON();
    const layerSource = this.vectorLayer.getSource();

    if (!layerSource) {
      return; // Вернуться, если источник слоя не найден
    }

    features.forEach(item => {
      try {
        const featureGeometry = openLayersGeoJson.readFeature(item);

        // Применяем стили в зависимости от типа геометрии объекта
        //let style;
        // switch (featureGeometry.getGeometry().getType()) {
        //   case 'Point':
        //     style = new Style({
        //       image: new CircleStyle({
        //         radius: 5,
        //         fill: new Fill({ color: 'red' }),
        //         stroke: new Stroke({ color: 'black', width: 1 }),
        //       }),
        //     });
        //     break;
        //   case 'Polygon':
        //     style = new Style({
        //       stroke: new Stroke({ color: 'blue', width: 1 }),
        //       fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
        //     });
        //     break;
        //   case 'LineString':
        //     style = new Style({
        //       stroke: new Stroke({ color: 'green', width: 2 }),
        //     });
        //     break;
        //   // Добавьте обработку других типов геометрии, если необходимо
        //   default:
        //     style = new Style();
        //     break;
        // }
        console.log(featureGeometry)
        //featureGeometry.setStyle(style);
        layerSource.addFeature(featureGeometry);
      } catch (error) {
        console.error('Ошибка при добавлении объекта:', error);
        console.log('Элемент, вызвавший ошибку:', item);
      }
    });
  },

    updateVectorLayer(geojsonFeatures) {
      this.addMapFeatures(geojsonFeatures);
    },
    handleMapClick(event) {
      // Получаем координаты места клика
      const coords = event.coordinate;

      // Преобразуем координаты в долготу и широту с 4 знаками после запятой
      const lonLat = toLonLat(coords).map(coord => parseFloat(coord.toFixed(4)));
      const [longitude, latitude] = lonLat;

      // Обновляем координаты в родительском компоненте
      this.$emit('update-coordinates', { latitude, longitude });

      // Удаляем старую метку, если она была
      if (this.marker) {
        this.map.removeOverlay(this.marker);
      }

      // Создаем новую метку
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.backgroundColor = 'black'; // Цвет метки
      markerElement.style.width = '5px'; // Ширина метки
      markerElement.style.height = '5px'; // Высота метки
      markerElement.style.borderRadius = '50%'; // Круглая метка

      this.marker = new Overlay({
        element: markerElement,
        position: coords,
        positioning: 'center-center',
        stopEvent: false
      });
      this.map.addOverlay(this.marker);

      this.map.getLayers().forEach(layer => {
        if (layer instanceof VectorLayer) {
          this.map.removeLayer(layer);
        }
      });

      // Создаем эллипс вокруг метки
      this.addEllipseFeature(coords, this.ellipseRadius);

      // Позиционируем всплывающее окно с координатами над меткой
      this.overlay.setPosition(coords);
      const element = this.overlay.getElement();
      element.innerHTML = `Долгота: ${longitude}, Широта: ${latitude}`;

      // Обновляем координаты в текстовом поле
      this.latitude = latitude;
      this.longitude = longitude;
    },
    addEllipseFeature(center, radius) {
      const circleGeom = new Circle(center, radius);
      const circleCoords = fromCircle(circleGeom, 64).getCoordinates()[0];
      const ellipseFeature = new Feature({
        geometry: new Polygon([circleCoords])
      });
      ellipseFeature.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 3
        })
      }));
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [ellipseFeature]
        })
      });
      this.map.addLayer(vectorLayer);
    }
  },
  watch: {
    ellipseRadius(newRadius) {
      this.map.getLayers().forEach(layer => {
        if (layer instanceof VectorLayer) {
          this.map.removeLayer(layer);
        }
      });
      // Получаем координаты места клика, которые уже имеются в this.marker.position
      if (this.marker) {
        const coords = this.marker.getPosition();
        this.addEllipseFeature(coords, newRadius);
      }
    },
    geojsonFeatures(newFeatures)
    {
      this.updateVectorLayer(newFeatures.features);
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>

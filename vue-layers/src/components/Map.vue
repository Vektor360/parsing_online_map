<template>
  <div id="map"></div>
</template>

<script>
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import Overlay from 'ol/Overlay';
import { Stroke, Style } from 'ol/style';
import { toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { fromCircle } from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import Polygon from 'ol/geom/Polygon';
//import { watch } from 'vue';

export default {
  name: 'CustomMap',
  props: {
    ellipseRadius: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      map: null,
      marker: null,
      overlay: null,
      coordinates: ''
    };
  },
  mounted() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
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
  methods: {
    handleMapClick(event) {
      //watch(this.props.ellipseRadius,()=>console.log(this.props.ellipseRadius));
      // Получаем координаты места клика
      const coords = event.coordinate;

      // Преобразуем координаты в долготу и широту с 4 знаками после запятой
      const lonLat = toLonLat(coords).map(coord => coord.toFixed(4));
      const lon = lonLat[0];
      const lat = lonLat[1];

      // Обновляем текстовое поле с координатами
      this.coordinates = `Долгота: ${lon}, Широта: ${lat}`;

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
      element.innerHTML = this.coordinates;
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
  }
};
</script>


<style scoped>
#map {
  width: 100%;
  height: 100%;
}

.marker {
  position: relative;
}
</style>

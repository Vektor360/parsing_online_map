<template>
  <div id="app">
    <Map :ellipseRadius="sliderValue" :geojson-features="geojsonFeatures" @update-coordinates="updateCoordinates"></Map>

    <div class="controls">
      <input type="text" v-model="latitude" placeholder="Широта">
      <input type="text" v-model="longitude" placeholder="Долгота">
      <button @click="toggleList">Выбрать элементы</button>
      <!-- Изменения в структуре блока options-container -->
      <div v-if="showList" class="options-container" ref="optionsContainer">
        <div class="options">
          <div class="search-bar">
            <input type="text" v-model="searchOption" placeholder="Поиск...">
            <button @click="applyOptions" class="apply-button">Применить</button>
          </div>
          <ul>
            <li v-for="(option, index) in filteredOptions" :key="index">
              <input type="checkbox" :id="option.value" :value="option.value" v-model="selectedOptions">
              <label :for="option.value">{{ option.label }}</label>
            </li>
          </ul>
        </div>
      </div>
      <!-- Конец изменений -->
      <div>
        <input type="range" v-model.number="sliderValue" min="1" max="50000" @input="updateTextbox">
        <input type="text" v-model.number="searchText2" @input="validateInput" @keyup.enter="updateSlider">
      </div>
    </div>
    <!--<button @click="">Загрузить данные и обработать</button>-->
    <button v-if="geojsonFeatures.features && geojsonFeatures.features.length > 0" @click="downloadGeoJSON">Скачать данные</button>
  </div>
  
</template>

<script>
import Map from './components/Map.vue';
//import GPM from './services/GPM.js';
import OSM from './services/OSM.js';

export default {
  name: 'App',
  components: {
  Map
  },
  data() {
    return {
      latitude: '',
      longitude: '',
      searchText: '',
      showList: false,
      showOptions: false,
      options: [
          { label: 'Бухгалтерский учет', value: 'accounting' },
          { label: 'Аэропорт', value: 'airport' },
          { label: 'Парк развлечений', value: 'amusement_park' },
          { label: 'Аквариум', value: 'aquarium' }
      ],
      selectedOptions: [],
      filteredOptions: [],
      sliderValue: 10000,
      searchText2: '10000',
      searchOption: '',
      geojsonFeatures: []
    };
  },
  methods: {
    toggleList() {
      this.showList = !this.showList;
      this.showOptions = false; // Скрываем опции при открытии списка
    },
    validateInput() {
      if (this.searchText2 === '' || isNaN(this.searchText2) || this.searchText2 <= 0) {
        this.searchText2 = '1';
      } else if (this.searchText2 > 10000) {
        this.searchText2 = '10000';
      }
    },
    updateTextbox() {
      this.searchText2 = String(this.sliderValue);
    },
    updateSlider() {
      this.sliderValue = parseInt(this.searchText2);
    },
    updateCoordinates({ latitude, longitude }) {
      this.latitude = latitude;
      this.longitude = longitude;
    },
    async applyOptions() {
      if (this.latitude) {
        const coordinates = OSM.getSquareCoordinates(this.latitude, this.longitude, this.sliderValue);
        try {
          this.geojsonFeatures = await OSM.getResidentialBuildings(coordinates, "Export.geojson");
        } catch (error) {
          console.error('Ошибка при получении данных:', error);
        }
      }
    },
    downloadGeoJSON() {
      const geojson = this.geojsonFeatures
      const json = JSON.stringify(geojson, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.geojson';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },
  watch: {
    searchOption(newValue) {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(newValue.toLowerCase())
      );
    }
  }
};
</script>

<style>
@import url('../node_modules/ol/ol.css');
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
 
html, body, #map, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.controls {
  position: absolute; /* Позиционирование элементов управления */
  top: 10px; /* Отступ от верха */
  left: 40%; /* Отступ от левого края */
  z-index: 1000; /* Отображение элементов поверх карты */
}

.controls input[type="text"] {
  width: 200px; /* Ширина текстового поля */
  margin-right: 10px; /* Отступ справа */
}

.controls button {
  padding: 5px 10px; /* Отступы внутри кнопки */
}

/* Стили для блока списка элементов */
.options-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px; /* фиксированная ширина */
  max-height: 200px; /* фиксированная высота */
  overflow-y: auto; /* включаем прокрутку по вертикали */
  background-color: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.options {
  margin-bottom: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.search-bar .apply-button {
  align-self: flex-end;
}

.options input[type="text"] {
  width: calc(100% - 70px); /* ширина инпута для поиска */
}

.options button {
  padding: 5px 10px;
}

.options ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.options li {
  margin-bottom: 5px;
}
</style>

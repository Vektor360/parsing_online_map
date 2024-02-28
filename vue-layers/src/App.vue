<template>
  <Map :ellipseRadius="sliderValue"></Map>

  <div class="controls"> <!-- Контейнер для элементов управления -->
      <input type="text" v-model="searchText" placeholder="Введите Координаты..."> <!-- Текстовое поле -->
      <button @click="toggleList">Выбрать элементы</button> <!-- Кнопка -->
      <ul v-if="showList"> <!-- Список элементов (появляется по нажатию на кнопку) -->
        <!-- Здесь должны быть элементы списка -->
      </ul>
        <div>
        <input type="range" v-model.number="sliderValue" min="1" max="50000" @input="updateTextbox">
        <input type="text" v-model.number="searchText2" @input="validateInput">
        </div>
    </div>

</template>
 
<script>
import Map from './components/Map.vue'
 
export default {
  name: 'App',
  components: {
    Map
  },
data() {
    return {
      searchText: '', // Для хранения введенного текста
      showList: false, // Флаг для отображения/скрытия списка
      sliderValue: 50000,
      searchText2: '50000'
    };
  },
  methods: {
    toggleList() {
      this.showList = !this.showList; // Инвертируем флаг при нажатии на кнопку
    },
    validateInput() {
      if (this.searchText2 === '' || isNaN(this.searchText2) || this.searchText2 <= 0) {
        this.searchText2 = '1';
      } else if (this.searchText2 > 50000) {
        this.searchText2 = '50000';
      }
    },
    updateTextbox() {
      this.searchText2 = String(this.sliderValue);
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
  left: 10px; /* Отступ от левого края */
  z-index: 1000; /* Отображение элементов поверх карты */
}

.controls input[type="text"] {
  width: 200px; /* Ширина текстового поля */
  margin-right: 10px; /* Отступ справа */
}

.controls button {
  padding: 5px 10px; /* Отступы внутри кнопки */
}

</style>
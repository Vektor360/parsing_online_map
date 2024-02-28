import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    map: {
      state: {
        projection: new Projection({
          code: 'EPSG:3857',
          units: 'm',
          axisOrientation: 'enu',
          global: false,
        }),
      },
    },
    // другие модули могут быть добавлены здесь
  },
});

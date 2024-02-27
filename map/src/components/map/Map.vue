<script setup lang="ts">
import { computed, watch } from 'vue';
import Draw, { createBox } from 'ol/interaction/Draw.js';
import VectorSource from 'ol/source/Vector';
import type { Polygon } from 'ol/geom';
import { useMap } from '@/components/map/hooks';

type Props = {
  projection?: string;
  target?: string;
	mapCenter: number[],
  width?: string;
  height?: string;
  features?: []
};

const props = withDefaults(defineProps<Props>(), {
  projection: 'EPSG:3857',
  target: 'map',
  width: '800px',
  height: '600px'
});
const emit = defineEmits([ 'requestAreaSelected' ]);

const source = new VectorSource({ wrapX: false });
const draw = new Draw({
  source: source,
  type: 'Circle',
  geometryFunction: createBox()
});
const { map, mapCenter, addMapFeatures, clearMapFeatures } = useMap(
	props.projection,
	props.target,
	props.mapCenter,
	() => {
		map.value.addInteraction(draw);
    draw.on('drawend', e => {
      emit('requestAreaSelected', (e.feature.getGeometry() as Polygon).getCoordinates());
      draw.setActive(false);
    });
	});
const mapCenterFormatted = computed(() => `${Math.round(mapCenter.value[0])}, ${Math.round(mapCenter.value[1])}`);
const onEnableRequestAreaDraw = () => {
  draw.setActive(true);
};

watch(
  () => props.features,
  () => {
    clearMapFeatures();

    if (props.features && props.features.length)
      addMapFeatures(props.features);
  },
  { deep: true });
draw.setActive(false);
</script>

<template>
	<div class="mapWrapper" :style="{ maxWidth: props.width }">
		<div id="map" class="mediumMap" :style="{ width: props.width, height: props.height }"/>
		<div>{{ mapCenterFormatted }}</div>
    <button @click="onEnableRequestAreaDraw">Отметить область</button>
	</div>
</template>

<style scoped lang="scss">
.mapWrapper {
  position: relative;
}
.mediumMap {
  border-radius: 6px;
  border: 1px solid lightgrey;
  overflow: hidden;
  &:active {
    cursor: grab;
  }
}
</style>

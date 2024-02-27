<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@/components/map';
import { requestFeatures } from '@/services';

const mapFeatures = ref([]);
const onRequestAreaSelected = async (e) => {
	mapFeatures.value.splice(0);

	const features = await requestFeatures(e);

	features.forEach(item => mapFeatures.value.push(item));
}
</script>

<template>
  <Map
		:map-center="[ 15868510.772403354, 5898974.183869144 ]"
		width="1000px"
		height="800px"
		:features="mapFeatures"
		@requestAreaSelected="onRequestAreaSelected" />
</template>

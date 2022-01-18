<script lang="ts">
import { defineComponent, PropType } from 'vue'
import CellState from '../models/CellState';

export default defineComponent({
  props: {
    cell: {
      type: Object as PropType<CellState>,
      required: true,
    },
    pencil: {
      type: Array as PropType<boolean[]>,
      required: true,
    },
    highlightedValue: {
      type: Number as PropType<number | null>,
    },
    isSelected: Boolean,
  },
  setup() {

  },
  computed: {
    showPencilValues() {
      return this.cell.cellValue === null && this.pencil.some(v => v);
    }
  },

})
</script>

<template>
  <div
    @click="$emit('onCellSelect')"
    :class="{
      cell: true,
      filled: cell.cellValue != null,
      highlighted: highlightedValue != null && cell.cellValue === highlightedValue,
      selected: isSelected,
      wrong: cell.isWrong,
      prefilled: cell.isPrefilled,
      'grid grid-cols-3 grid-rows-3': showPencilValues,
      'grid grid-cols-4 grid-rows-4': pencil.length === 15 && showPencilValues,
    }"
    class
  >
    <template v-if="showPencilValues">
      <span
        class="text-xs"
        :class="{ invisible: !v, highlighted: (n + 1 == highlightedValue) }"
        v-for="(v, n) in pencil"
      >{{ (n + 1) }}</span>
    </template>
    <template v-else>{{ cell.cellValue }}</template>
  </div>
</template>

<style lang="postcss">
.cell {
  @apply text-3xl;
  height: 50px;
  width: 50px;
  display: inline-block;

  @apply border border-slate-900;
  @apply font-medium;
  @apply cursor-pointer;
}

.cell.selected {
  @apply bg-yellow-300;
  @apply border-2 border-yellow-100;
}

.cell.filled {
  @apply text-indigo-600;
}

.cell.highlighted {
  @apply bg-blue-300;
}

.cell span.highlighted {
  @apply bg-blue-300;
}

.cell.prefilled {
  color: black;
}

.cell.wrong {
  @apply text-indigo-100;
  @apply bg-red-500;
}

.cell.wrong.highlighted {
  @apply text-black;
  @apply bg-red-500;
  @apply border-2 border-blue-300;
}
</style>
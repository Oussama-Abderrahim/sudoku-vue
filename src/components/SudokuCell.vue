<script lang="ts">
import { defineComponent, PropType } from 'vue'
import CellState from '../models/CellState';

export default defineComponent({
  props: {
    cell: {
      type: Object as PropType<CellState>,
      required: true,
    },
    isSelected: Boolean,
    isHighlighted: Boolean,
  },
  setup() {

  },

})
</script>

<template>
  <div
    @click="$emit('onCellSelect')"
    :class="{
      'cell': true,
      cell: true,
      filled: cell.cellValue != null,
      highlighted: isHighlighted,
      selected: isSelected,
      wrong: cell.isWrong,
      prefilled: cell.isPrefilled,
    }"
  >{{ cell.cellValue }}</div>
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
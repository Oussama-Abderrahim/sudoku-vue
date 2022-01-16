<script lang="ts">
import { defineComponent, PropType } from "vue";
import CellState from "../models/CellState";

export default defineComponent({
  props: {
    grid: {
      type: Object as PropType<CellState[][]>,
      required: true,
    },
    sudokuLevel: {
      type: Number,
      default: () => 3
    }
  }
})
</script>

<template>
  <div class="game-board mt-6">
    <template v-for="(_, block_i) in 3">
      <template v-for="(_, block_j) in 3">
        <!-- Each block is a 3x3 -->
        <div class="grid-square">
          <template v-for="(_, i) in 3">
            <template v-for="(_, j) in 3" :key="(i + '' + j)">
              <slot
                :i="block_i * 3 + i"
                :j="block_j * 3 + j"
                :cell="grid[block_i * 3 + i][block_j * 3 + j]"
              ></slot>
            </template>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="postcss">
.grid {
  margin: auto;
  display: grid;
  /* align-content: center;
  justify-items: center; */
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.game-board {
  @apply grid;
  @apply border-2 border-slate-500;
  padding: 1px;
  height: 462px;
  width: 462px;
}

.grid-square {
  @apply grid;
  /* row-gap: 1px;
  column-gap: 1px; */
  @apply border border-slate-500;
}
</style>
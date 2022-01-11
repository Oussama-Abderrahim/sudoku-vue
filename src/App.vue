<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

class CellState {
  cellValue: number | null;
  isWrong: boolean;
  isPrefilled: boolean;

  constructor() {
    this.cellValue = null;
    this.isPrefilled = false;
    this.isWrong = false;
  }
}

const gridSize = ref(9);

const grid: Ref<CellState[][]> = ref(Array(gridSize.value).fill(Array(gridSize.value).fill(new CellState())));

const selected = ref([-1, -1])

const selectCell = (i: number, j: number): void => {
  selected.value = [i, j]
}

const clearSelection = (): void => { selected.value = [-1, -1] }

const judgeCell = (i: number, j: number): void => {
  let hasError = false;
  if (grid.value[i][j].cellValue != null) {
    // Judge row and column
    for (let k = 0; k < gridSize.value; k++) {
      if (grid.value[i][j].cellValue === grid.value[i][k].cellValue && j != k) {
        hasError = true;
        setGridValue(i, k, {
          ...grid.value[i][k],
          isWrong: true,
        })

      }

      if (grid.value[i][j].cellValue === grid.value[k][j].cellValue && i != k) {
        hasError = true;
        setGridValue(k, j, {
          ...grid.value[k][j],
          isWrong: true,
        })
      }
    }
    // Judge current square
    let startI = i - i % 3;
    let startJ = j - j % 3;
    for (let k = startI; k < startI + 3; k++) {
      for (let m = startJ; m < startJ + 3; m++) {
        if (grid.value[i][j].cellValue === grid.value[k][m].cellValue && i != k && j != m) {
          hasError = true;
          setGridValue(k, m, {
            ...grid.value[k][m],
            isWrong: true,
          })
        }
      }
    }

  }


  setGridValue(i, j, {
    ...grid.value[i][j],
    isWrong: hasError,
  })
}

const clearAll = (): void => {
  let board = grid.value;

  for (let i = 0; i < gridSize.value; i++) {
    for (let j = 0; j < gridSize.value; j++) {
      if (!board[i][j].isPrefilled) {
        board[i][j] = new CellState();
      }
    }
  }

  grid.value = board;
}

const judgeBoard = (): void => {
  for (let i = 0; i < gridSize.value; i++) {
    for (let j = 0; j < gridSize.value; j++) {
      judgeCell(i, j);
    }
  }
}

const setGridValue = (i: number, j: number, cellState: CellState): void => {
  let modifiedRow = grid.value[i].slice(0);

  modifiedRow[j] = cellState;

  grid.value[i] = modifiedRow;
}

const assignCell = (n: number | null): void => {
  const i = selected.value[0]
  const j = selected.value[1]

  if (i < 0 || i >= gridSize.value || j < 0 && j >= gridSize.value) return;

  const cell = grid.value[i][j];

  if (cell.isPrefilled) return;

  setGridValue(i, j, {
    ...cell,
    cellValue: n,
  })

  judgeBoard();
  clearSelection();
}

const ALLOWED_KEYS: { [key: string]: number | null } = {
  'Delete': null,
  'Digit1': 1,
  'Digit2': 2,
  'Digit3': 3,
  'Digit4': 4,
  'Digit5': 5,
  'Digit6': 6,
  'Digit7': 7,
  'Digit8': 8,
  'Digit9': 9
};

window.addEventListener('keyup', (ev) => {
  if (ev.code in ALLOWED_KEYS) {
    assignCell(ALLOWED_KEYS[ev.code])
  }
});

</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold underline my-3">Sudoku {{ gridSize }} x {{ gridSize }}</h1>    
    <div class="flex flex-wrap flex-row">
      <div class="md:basis-1/6"></div>
      <div class="md:basis-3/6">
        <div class="grid" @keyup.space="assignCell(3)">
          <template v-for="(row, i) in grid">
            <template v-for="(cell, j) in row" :key="(i + '' + j)">
              <div
                @click="selectCell(i, j)"
                :class="{
                  cell: true,
                  filled: cell.cellValue != null,
                  selected: (i == selected[0] && j == selected[1]),
                  wrong: cell.isWrong,
                  prefilled: cell.isPrefilled,
                }"
              >{{ cell.cellValue }}</div>
            </template>
          </template>
        </div>
      </div>
      <div class="basis-1 md:basis-1/6">
        <div class="flex flex-row md:flex-col mt-5">
          <button @click="assignCell(i)" v-for="i in 9" class="number-cell">{{ i }}</button>
          <button @click="assignCell(null)" class="number-cell">X</button>
        </div>
      </div>
    </div>
    <button class="button-dark" @click="clearAll">Clear all</button>
  </div>
</template>

<style lang="postcss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.grid {
  border: 1px solid black;
  margin: auto;
  height: 400px;
  width: 400px;
  display: grid;
  align-content: center;
  justify-items: center;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
}

.number-cell {
  cursor: pointer;
  @apply text-3xl;
  @apply w-9;
  @apply border border-slate-600;
}

.cell {
  @apply text-3xl;
  /* font-size: 1.2em; */
  display: inline-block;
  width: 100%;
  height: 100%;

  @apply border border-slate-800;
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

.cell.wrong {
  @apply text-indigo-100;
  @apply bg-red-500;
}

.cell.prefilled {
  color: black;
}

.button {
  @apply h-10 px-6 font-semibold rounded-md bg-white text-black;
}

.button-dark {
  @apply button;
  @apply bg-black text-white;
}
</style>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue';
import type { Ref } from 'vue';
import CellState from './models/CellState';
import SudokuCell from './components/SudokuCell.vue';
import SudokuGrid from './components/SudokuGrid.vue';

export default defineComponent({
  components: {
    SudokuCell,
    SudokuGrid
  },
  setup() {
    const sudokuLevel = ref(3); // n
    const gridSize = computed(() => sudokuLevel.value ** 2); // n*n

    const grid: Ref<CellState[][]> = ref(Array(gridSize.value).fill(Array(gridSize.value).fill(new CellState())));

    const selected = ref([-1, -1])

    const isSelecting = computed(() => (selected.value[0] >= 0
      && selected.value[0] < gridSize.value
      && selected.value[1] >= 0
      && selected.value[1] < gridSize.value)
    )

    const selectedValue = computed(() => isSelecting.value ? grid.value[selected.value[0]][selected.value[1]].cellValue : null);

    const pencilMode = ref(false);

    return {
      sudokuLevel,
      grid,
      gridSize,
      selected,
      isSelecting,
      pencilMode,
      selectedValue,
    }
  },
  mounted() {
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
        this.assignCell(ALLOWED_KEYS[ev.code])
      }

      if (!this.isSelecting) return;

      const i = this.selected[0];
      const j = this.selected[1]
      if (ev.code == 'ArrowRight') {
        this.selected = [i, (j >= this.gridSize) ? j : j + 1];
      }

      if (ev.code == 'ArrowLeft') {
        this.selected = [i, j === 0 ? j : j - 1];
      }

      if (ev.code == 'ArrowUp') {
        this.selected = [i === 0 ? i : i - 1, j];
      }

      if (ev.code == 'ArrowDown') {
        this.selected = [i >= this.gridSize ? i : i + 1, j];
      }
    });
  },
  methods: {
    togglePencilMode(): void {
      this.pencilMode = !this.pencilMode;
    },

    selectCell(i: number, j: number): void {
      this.selected = [i, j];
    },

    clearSelection(): void { this.selected = [-1, -1]; },

    judgeCell(i: number, j: number): void {
      let hasError = false;

      if (this.grid[i][j].cellValue == null) {
        this.setGridWrongValue(i, j, false); // in case when a cell value is deleted
        return;
      }

      // Judge row and column
      for (let k = 0; k < this.gridSize; k++) {
        if (this.grid[i][j].cellValue === this.grid[i][k].cellValue && j != k) {
          hasError = true;

          this.setGridWrongValue(i, k);
        }

        if (this.grid[i][j].cellValue === this.grid[k][j].cellValue && i != k) {
          hasError = true;
          this.setGridWrongValue(k, j);
        }
      }
      // Judge current square
      const startI = i - i % this.sudokuLevel;
      const startJ = j - j % this.sudokuLevel;

      const endI = startI + this.sudokuLevel;
      const endJ = startJ + this.sudokuLevel;

      for (let k = startI; k < endI; k++) {
        for (let m = startJ; m < endJ; m++) {
          if (i == k && j == m) continue; // Skip the current cell

          if (this.grid[i][j].cellValue === this.grid[k][m].cellValue) {
            hasError = true;

            this.setGridWrongValue(k, m);
          }
        }
      }

      this.setGridWrongValue(i, j, hasError);
    },

    judgeBoard(): void {
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.judgeCell(i, j);
        }
      }
    },

    setGridValue(i: number, j: number, cellState: CellState): void {
      let modifiedRow = this.grid[i].slice(0);

      modifiedRow[j] = cellState;

      this.grid[i] = modifiedRow;
    },

    setGridWrongValue(i: number, j: number, wrong = true) {
      this.setGridValue(i, j, {
        ...this.grid[i][j],
        isWrong: wrong,
      })
    },

    assignCell(n: number | null): void {
      const i = this.selected[0]
      const j = this.selected[1]

      if (i < 0 || i >= this.gridSize || j < 0 && j >= this.gridSize) return;

      const cell = this.grid[i][j];

      if (cell.isPrefilled) return;

      this.setGridValue(i, j, {
        ...cell,
        cellValue: n,
      })

      this.judgeBoard();
      // clearSelection();
    },

    clearAll(): void {
      let board = this.grid;

      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (!board[i][j].isPrefilled) {
            board[i][j] = new CellState();
          }
        }
      }

      this.grid = board;
    }
  }
})
</script>

<template>
  <div class>
    <div class="flex flex-col md:flex-row">
      <div class="md:basis-1/4 md:border-r">
        <h1 class="text-2xl font-bold underline my-3">Sudoku {{ gridSize }} x {{ gridSize }}</h1>

        <button class="button-dark mt-5" @click="clearAll">Clear all</button>
        <br />
        <button
          class="mt-5"
          :class="{ 'button-dark': pencilMode, 'button': !pencilMode }"
          @click="togglePencilMode"
        >Pencil mode {{ pencilMode ? 'On' : 'Off' }}</button>
      </div>
      <div class="md:basis-3/4">
        <div class="container mx-auto mt-10">
          <div class="flex flex-wrap flex-row">
            <div class="md:basis-1/6"></div>
            <div class="md:basis-3/6">
              <sudoku-grid :grid="grid" :sudoku-level="sudokuLevel">
                <template v-slot.default="{ i, j, cell }">
                  <sudoku-cell
                    :cell="grid[i][j]"
                    :is-highlighted="cell.cellValue != null && cell.cellValue == selectedValue"
                    :is-selected="(i == selected[0] && j == selected[1])"
                    @onCellSelect="selectCell(i, j)"
                  />
                </template>
              </sudoku-grid>
            </div>
            <div class="basis-1 md:basis-1/6">
              <div class="flex flex-row md:flex-col mt-5">
                <button @click="assignCell(i)" v-for="i in 9" class="number-cell">{{ i }}</button>
                <button @click="assignCell(null)" class="number-cell">X</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

.number-cell {
  cursor: pointer;
  @apply text-3xl;
  @apply w-9;
  @apply border border-slate-600;
}

.button {
  @apply h-10 px-6 font-semibold rounded-md bg-white text-black;
}

.button-dark {
  @apply button;
  @apply bg-black text-white;
}
</style>

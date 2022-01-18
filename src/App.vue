<script lang="ts">
import { ref, computed, defineComponent } from 'vue';
import type { Ref } from 'vue';
import CellState from './models/CellState';
import SudokuCell from './components/SudokuCell.vue';
import SudokuGrid from './components/SudokuGrid.vue';

import PuzzleSet from './models/SudokuPuzzleSet.json';

export default defineComponent({
  components: {
    SudokuCell,
    SudokuGrid
  },
  /**
   * Will be using setup to define data and computed values
   * I am using this instead of Data so that I can more easily initialize the values along with ts-types
   */
  setup() {

    const sudokuLevel = ref(3); // n
    const gridSize = computed(() => sudokuLevel.value ** 2); // n*n
    const difficulty: Ref<("medium" | "extreme")> = ref("medium");

    const grid: Ref<CellState[][]> = ref(
      Array(gridSize.value)
        .fill(null).map((_, i) =>
          Array(gridSize.value).fill(null).map((_, j) =>
            new CellState()
          )
        )
    );

    const pencilGrid: Ref<boolean[][][]> = ref(Array(gridSize.value).fill(Array(gridSize.value).fill(Array(9).fill(false))))

    const selectedIndexes = ref([-1, -1])

    const pencilMode = ref(false);

    const isSelecting = computed(() => (selectedIndexes.value[0] >= 0
      && selectedIndexes.value[0] < gridSize.value
      && selectedIndexes.value[1] >= 0
      && selectedIndexes.value[1] < gridSize.value)
    )

    const selectedValue = computed(() => isSelecting.value ? grid.value[selectedIndexes.value[0]][selectedIndexes.value[1]].cellValue : null);


    return {
      sudokuLevel,
      pencilGrid,
      grid,
      gridSize,
      difficulty,
      selected: selectedIndexes,
      isSelecting,
      pencilMode,
      selectedValue,
    }
  },
  mounted() {
    this.registerKeyboardEvents();
    this.newGame();
  },
  methods: {
    registerKeyboardEvents() {
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
        'Digit9': 9,
        'KeyQ': 10,
        'KeyB': 11,
        'KeyC': 12,
        'KeyD': 13,
        'KeyE': 14,
        'KeyF': 15,
      };

      window.addEventListener('keydown', (ev) => {
        if (ev.code in ALLOWED_KEYS) {
          this.assignCell(ALLOWED_KEYS[ev.code])
          return;
        }

        if (!this.isSelecting) return;

        if (ev.code == 'Space') {
          this.togglePencilMode()
          return;
        }

        const i = this.selected[0];
        const j = this.selected[1]
        if (ev.code == 'ArrowRight') {
          this.selected = [i, (j >= this.gridSize - 1) ? j : j + 1];
          return;
        }

        if (ev.code == 'ArrowLeft') {
          this.selected = [i, j === 0 ? j : j - 1];
          return;
        }

        if (ev.code == 'ArrowUp') {
          this.selected = [i === 0 ? i : i - 1, j];
          return;
        }

        if (ev.code == 'ArrowDown') {
          this.selected = [i >= this.gridSize - 1 ? i : i + 1, j];
          return;
        }
      });
    },
    generateSudoku(difficulty: ("extreme" | "medium")): number[] {

      const puzzle = PuzzleSet[difficulty][Math.floor(Math.random() * PuzzleSet[difficulty].length)] as number[];

      return puzzle;
    },
    newGame(): void {
      this.clearAll();
      const puzzle: number[] = this.generateSudoku(this.difficulty);

      this.grid = Array(this.gridSize)
        .fill(null).map((_, i) =>
          Array(this.gridSize).fill(null).map((_, j) =>
            new CellState(puzzle[i * this.gridSize + j] || null)
          )
        );
    },
    togglePencilMode(): void {
      this.pencilMode = !this.pencilMode;
    },

    selectCell(i: number, j: number): void {
      this.selected = [i, j];
    },

    clearSelection(): void { this.selected = [-1, -1]; },

    judgeCell(i: number, j: number): void {
      let hasError = false;

      const value = this.grid[i][j].cellValue;

      if (value == null) {
        this.setGridWrongValue(i, j, false); // in case when a cell value is deleted
        return;
      }

      // Judge row and column
      for (let k = 0; k < this.gridSize; k++) {
        if (value === this.grid[i][k].cellValue && j != k) {
          hasError = true;

          this.setGridWrongValue(i, k);
        }

        if (value === this.grid[k][j].cellValue && i != k) {
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

          if (value === this.grid[k][m].cellValue) {
            hasError = true;

            this.setGridWrongValue(k, m);
          }
        }
      }

      this.setGridWrongValue(i, j, hasError);
    },

    checkCellValue(i: number, j: number, value: number | null): boolean {
      if (value == null) {
        return false;
      }

      // Judge row and column
      for (let k = 0; k < this.gridSize; k++) {
        if (value === this.grid[i][k].cellValue && j != k) {
          return true;
        }

        if (value === this.grid[k][j].cellValue && i != k) {
          return true;
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

          if (value === this.grid[k][m].cellValue) {
            return true;
          }
        }
      }

      return false;
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

    togglePencilGridValue(i: number, j: number, n: number): void {
      const row = this.pencilGrid[i].slice(0);

      const arr = row[j].slice(0);

      arr[n - 1] = !arr[n - 1];

      row[j] = arr;
      this.pencilGrid[i] = row;
    },

    clearPencilGridCell(i: number, j: number): void {
      const row = this.pencilGrid[i].slice(0);

      row[j] = new Array(this.gridSize).fill(false);
      this.pencilGrid[i] = row;
    },

    setGridWrongValue(i: number, j: number, wrong = true) {
      this.setGridValue(i, j, {
        ...this.grid[i][j],
        isWrong: wrong,
      })
    },

    quickPencilCell() {
      this.pencilMode = true;
      for (let i = 0; i < this.gridSize; i++) {
        this.assignCell(i + 1);
      }
    },
    quickPencilAll() {
      const savedMode = this.pencilMode;
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.selected = [i, j]
          this.clearPencilGridCell(i, j);
          this.quickPencilCell()
        }
      }
      this.clearSelection();

      this.pencilMode = savedMode;
    },
    updatePencilGridValues(i: number, j: number, n: number): void {

      for (let k = 0; k < this.gridSize; k++) {
        if (this.pencilGrid[i][k][n - 1]) {
          this.togglePencilGridValue(i, k, n);
        }

        if (this.pencilGrid[k][j][n - 1]) {
          this.togglePencilGridValue(k, j, n);
        }

      }
      // Judge current square
      const startI = i - i % this.sudokuLevel;
      const startJ = j - j % this.sudokuLevel;

      const endI = startI + this.sudokuLevel;
      const endJ = startJ + this.sudokuLevel;

      for (let k = startI; k < endI; k++) {
        for (let m = startJ; m < endJ; m++) {
          if (this.pencilGrid[k][m][n - 1]) {
            this.togglePencilGridValue(k, m, n);
          }
        }
      }

    },
    assignCell(n: number | null): void {
      const i = this.selected[0]
      const j = this.selected[1]

      if (i < 0 || i >= this.gridSize || j < 0 && j >= this.gridSize) return;

      const cell = this.grid[i][j];

      if (cell.isPrefilled) return;
      if (cell.cellValue === n) return; // avoid unnecessary operations
      if (n && n > this.gridSize) return; // For sudokus over 9*9

      if (n && this.pencilMode) {
        if (!this.checkCellValue(i, j, n)) {
          this.togglePencilGridValue(i, j, n)
        }
      } else {
        this.setGridValue(i, j, {
          ...cell,
          cellValue: n,
        })

        this.clearPencilGridCell(i, j);

        if (n != null) {
          this.updatePencilGridValues(i, j, n);
        }

        this.judgeBoard();
      }
      // clearSelection();
    },

    clearAll(): void {
      let board = this.grid;
      let pencilGrid = this.pencilGrid

      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          if (!board[i][j].isPrefilled) {
            board[i][j] = new CellState();
            pencilGrid[i][j] = new Array(this.gridSize).fill(false)
          }
        }
      }

      this.grid = board;
      this.pencilGrid = pencilGrid;
    }
  }
})
</script>

<template>
  <div class>
    <div class="flex flex-col md:flex-row">
      <div class="md:basis-1/4 md:border-r">
        <div class="flex flex-col px-10">
          <h1 class="text-2xl font-bold underline my-3">Sudoku {{ gridSize }} x {{ gridSize }}</h1>

          <select v-model="difficulty">
            <option value="medium">Medium</option>
            <option value="extreme">Extreme</option>
          </select>
          <button class="button-dark mt-5" @click="newGame">New Game</button>

          <button class="button-dark mt-5" @click="clearAll">Clear all</button>
          <button
            class="mt-5"
            :class="{ 'button-dark': pencilMode, 'button': !pencilMode }"
            @click="togglePencilMode"
          >Pencil mode {{ pencilMode ? 'On' : 'Off' }}</button>
          <button class="button-dark mt-5" @click="quickPencilAll">Quick Pencil</button>
        </div>
      </div>
      <div class="md:basis-3/4">
        <div class="container mx-auto mt-10">
          <div class="flex flex-wrap flex-row">
            <div class="md:basis-1/6"></div>
            <div class="md:basis-3/6">
              <sudoku-grid :grid="grid" :pencil-grid="pencilGrid" :sudoku-level="sudokuLevel">
                <template v-slot.default="{ i, j, cell, pencil }">
                  <sudoku-cell
                    :cell="grid[i][j]"
                    :pencil="pencil"
                    :highlighted-value="selectedValue"
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

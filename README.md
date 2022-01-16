# Sudoku made with Vue 3 + Typescript + Vite

A fun small project meant to practice Vue 3.  
You can find usage of :

- Vue 3 Composition and Options API Components
- [Tailwind](https://tailwindcss.com/) CSS.
- Use case for Vue3 slots and scoped slots.

## TODOs :
- [ ] Prefill using saved sudoku puzzles.
- [ ] Judge and mark cells on each assign.
- [X] Implement Pencil Mode.
- [ ] Implement Smart Pencil Mode (checks when assigning and auto-remove).
- [ ] Add game features (difficulty, time, score, ...).


## Running the project locally
```sh
git clone <insert-repo-link-here>
cd sudoku-vue
npm install
npm run dev
```
  App should be running on [localhost:5000](localhost:3000).

## Code examples 
Using scoped slots, you can transform a 4 nested v-for loop into a single slot :

```html
<sudoku-grid :grid="grid">
  <template v-slot.default="{ i, j, cell }">
    <sudoku-cell 
    :cell="cell" 
    :is-selected="(i == selected[0] && j == selected[1])" 
    @onCellSelect="selectCell(i, j)" />
  </template>
</sudoku-grid>
```


## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

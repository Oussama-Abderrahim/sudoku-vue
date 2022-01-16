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
export default CellState;

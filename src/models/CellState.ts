class CellState {
  cellValue: number | null;
  isWrong: boolean;
  isPrefilled: boolean;

  constructor(cellValue: number | null = null) {
    this.cellValue = cellValue;
    this.isPrefilled = cellValue != null;
    this.isWrong = false;
  }
}
export default CellState;

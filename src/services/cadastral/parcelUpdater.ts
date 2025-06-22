
// Re-export all parcel update functionality from focused modules
export { extractLotNumberFromParcelId } from './lotNumberExtractor';
export { calculateParcelArea } from './areaCalculator';
export { updateParcelWithLotNumberAndArea } from './parcelDatabaseOps';
export { removeDuplicateParcels } from './duplicateRemover';
export { batchUpdateAllParcels } from './batchProcessor';

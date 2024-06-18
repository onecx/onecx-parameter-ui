export * from './histories.service';
import { HistoriesAPIService } from './histories.service';
export * from './parameters.service';
import { ParametersAPIService } from './parameters.service';
export * from './products.service';
import { ProductsAPIService } from './products.service';
export const APIS = [HistoriesAPIService, ParametersAPIService, ProductsAPIService];

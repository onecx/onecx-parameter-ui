/**
 * onecx-parameters-bff
 * OneCx parameters Bff
 *
 * The version of the OpenAPI document: 2.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Product } from './product';


export interface ProductStorePageResult {
    map(arg0: (p: any) => number): unknown; 
    /**
     * The total elements in the resource.
     */
    totalElements?: number;
    number?: number;
    size?: number;
    totalPages?: number;
    stream?: Array<Product>;
}

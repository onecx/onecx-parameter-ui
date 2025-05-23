/**
 * onecx-parameter-bff
 * OneCX parameter Bff
 *
 * The version of the OpenAPI document: 2.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ParameterValue } from './parameterValue';


export interface History { 
    id: string;
    modificationCount?: number;
    creationDate?: string;
    creationUser?: string;
    modificationDate?: string;
    modificationUser?: string;
    applicationId: string;
    productName: string;
    name: string;
    usedValue?: ParameterValue;
    defaultValue?: ParameterValue;
    instanceId?: string;
    count?: number;
    start?: string;
    end?: string;
    parameterId?: string;
}


import { AbstractControl, FormArray, FormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

// This object encapsulates functions because ...
//  ...Jasmine has problems to spying direct imported functions
export const Utils = {
  mapping_error_status(status: number): number {
    return [400, 401, 403, 404, 500].includes(status) ? status : 0
  },

  limitText(text: string | undefined, limit: number): string {
    if (text) {
      return text.length < limit ? text : text.substring(0, limit) + '...'
    } else {
      return ''
    }
  },

  copyToClipboard(text?: string): void {
    if (text) navigator.clipboard.writeText(text)
  },

  /**
   *  DROPDOWN
   */
  dropDownSortItemsByLabel(a: SelectItem, b: SelectItem): number {
    return (a.label ? a.label.toUpperCase() : '').localeCompare(b.label ? b.label.toUpperCase() : '')
  },
  dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
    const a: any = ddArray.find((item: SelectItem) => {
      return item?.value == val
    })
    return a.label
  },

  /**
   *  SORTING
   */
  sortByLocale(a: any, b: any): number {
    return a.toUpperCase().localeCompare(b.toUpperCase())
  },
  sortByDisplayName(a: any, b: any): number {
    return (a.displayName ? a.displayName.toUpperCase() : '').localeCompare(
      b.displayName ? b.displayName.toUpperCase() : ''
    )
  },

  /****************************************************************************
   *  HELPER to manage fields wit various content type
   *    Important do not calculate such things in HTML!
   */
  displayValueType(val: any): string {
    if (val === undefined || val === null) return 'UNKNOWN'
    return (typeof val).toUpperCase()
  },
  displayValue(val: any): string {
    if (typeof val === 'boolean') return '' + val // true | false
    if (!val) return ''
    return typeof val === 'object' ? '{ ... }' : '' + val
  },
  displayValue2(val: any, impVal: any): string {
    if (typeof val === 'boolean') return '' + val // true | false
    const v = val ?? impVal
    if (typeof v === 'boolean') return '' + v
    if (!v) return ''
    return typeof v === 'object' ? '{ ... }' : '' + v
  },

  // value can be boolean
  displayEqualityState(val1: any, val2: any): string {
    if (typeof val1 !== typeof val2) return 'FALSE'
    if (typeof val1 === 'boolean') return (val1 === val2).toString().toLocaleUpperCase()
    if (!val1 && !val2) return 'UNDEFINED' // typeof null == object!
    if (typeof val1 === 'object') return (JSON.stringify(val1) === JSON.stringify(val2)).toString().toLocaleUpperCase()
    return (val1 === val2).toString().toLocaleUpperCase()
  }
}

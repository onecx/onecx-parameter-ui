import { AbstractControl, FormArray, FormGroup } from '@angular/forms'
import { SelectItem } from 'primeng/api'

export function limitText(text: string | undefined, limit: number): string {
  if (text) {
    return text.length < limit ? text : text.substring(0, limit) + '...'
  } else {
    return ''
  }
}

export function copyToClipboard(text?: string): void {
  if (text) navigator.clipboard.writeText(text)
}

/**
 *  FORM
 */
export function forceFormValidation(form: AbstractControl): void {
  if (form instanceof FormGroup || form instanceof FormArray) {
    for (const inner in form.controls) {
      const control = form.get(inner)
      control && forceFormValidation(control)
    }
  } else {
    form.markAsDirty()
    form.markAsTouched()
    form.updateValueAndValidity()
  }
}

/**
 *  DROPDOWN
 */
export type DropDownChangeEvent = MouseEvent & { value: any }

export function dropDownSortItemsByLabel(a: SelectItem, b: SelectItem): number {
  return (a.label ? (a.label as string).toUpperCase() : '').localeCompare(
    b.label ? (b.label as string).toUpperCase() : ''
  )
}
export function dropDownGetLabelByValue(ddArray: SelectItem[], val: string): string | undefined {
  const a: any = ddArray.find((item: SelectItem) => {
    return item?.value == val
  })
  return a.label
}

/**
 *  SORTING
 */
export function sortByLocale(a: any, b: any): number {
  return a.toUpperCase().localeCompare(b.toUpperCase())
}
export function sortByDisplayName(a: any, b: any): number {
  return (a.displayName ? a.displayName.toUpperCase() : '').localeCompare(
    b.displayName ? b.displayName.toUpperCase() : ''
  )
}

/****************************************************************************
 *  HELPER to manage fields wit various content type
 *    Important do not calculate such things in HTML!
 */
export function displayValueType(val: any): string {
  if (val === undefined || val === null) return 'UNKNOWN'
  return (typeof val).toUpperCase()
}
export function displayValue(val: any): string {
  if (typeof val === 'boolean') return '' + val // true | false
  if (!val) return ''
  return typeof val === 'object' ? '{ ... }' : '' + val
}
export function displayValue2(val: any, impVal: any): string {
  if (typeof val === 'boolean') return '' + val // true | false
  const v = val ?? impVal
  if (typeof v === 'boolean') return '' + v
  if (!v) return ''
  return typeof v === 'object' ? '{ ... }' : '' + v
}
// value can be boolean
export function displayEqualityState(val1: any, val2: any): string {
  if (typeof val1 !== typeof val2) return 'FALSE'
  if (typeof val1 === 'boolean') return (val1 === val2).toString().toLocaleUpperCase()
  if (!val1 && !val2) return 'UNDEFINED' // typeof null == object!
  if (typeof val1 === 'object') return (JSON.stringify(val1) === JSON.stringify(val2)).toString().toLocaleUpperCase()
  return (val1 === val2).toString().toLocaleUpperCase()
}

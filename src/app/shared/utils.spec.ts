import { FormGroup, FormControl } from '@angular/forms'
import { SelectItem } from 'primeng/api'

import {
  limitText,
  copyToClipboard,
  forceFormValidation,
  displayEqualityState,
  displayValue,
  displayValue2,
  displayValueType,
  dropDownSortItemsByLabel,
  dropDownGetLabelByValue,
  sortByLocale,
  sortByDisplayName
} from './utils'

describe('util functions', () => {
  describe('limitText', () => {
    it('should truncate text that exceeds the specified limit', () => {
      const result = limitText('hello', 4)

      expect(result).toEqual('hell...')
    })

    it('should return the original text if it does not exceed the limit', () => {
      const result = limitText('hello', 6)

      expect(result).toEqual('hello')
    })

    it('should return an empty string for undefined input', () => {
      const str: any = undefined
      const result = limitText(str, 5)

      expect(result).toEqual('')
    })
  })

  describe('copyToClipboard', () => {
    let writeTextSpy: jasmine.Spy

    beforeEach(() => {
      writeTextSpy = spyOn(navigator.clipboard, 'writeText')
    })

    it('should copy text to clipboard', () => {
      copyToClipboard('text')

      expect(writeTextSpy).toHaveBeenCalledWith('text')
    })
  })

  describe('forceFormValidation', () => {
    it('should mark controls as dirty and touched', () => {
      const group = new FormGroup({
        control1: new FormControl(''),
        control2: new FormControl('')
      })

      forceFormValidation(group)

      expect(group.dirty).toBeTrue()
      expect(group.touched).toBeTrue()
    })
  })

  describe('dropDownSortItemsByLabel', () => {
    it('should correctly sort items by label', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toEqual('label1')
    })
    it("should treat falsy values for SelectItem.label as ''", () => {
      const items: SelectItem[] = [
        { label: undefined, value: 1 },
        { label: undefined, value: 2 },
        { label: 'label1', value: 2 }
      ]

      const sortedItems = items.sort(dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toEqual(undefined)
    })
  })

  describe('dropDownGetLabelByValue', () => {
    it('should return the label corresponding to the value', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const result = dropDownGetLabelByValue(items, '1')

      expect(result).toEqual('label1')
    })
  })

  describe('sortByLocale', () => {
    it('should sort strings based on locale', () => {
      const strings: string[] = ['str2', 'str1']

      const sortedStrings = strings.sort(sortByLocale)

      expect(sortedStrings[0]).toEqual('str1')
    })
  })

  describe('sortByDisplayName', () => {
    it('should return negative value when first product name comes before second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'User' }
      expect(sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should return positive value when first product name comes after second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'User' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(sortByDisplayName(productA, productB)).toBeGreaterThan(0)
    })

    it('should return zero when product names are the same', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(sortByDisplayName(productA, productB)).toBe(0)
    })

    it('should be case-insensitive', () => {
      const productA = { id: 'a', name: 'name', displayName: 'admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(sortByDisplayName(productA, productB)).toBe(0)
    })

    it('should handle undefined names', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should handle empty string names', () => {
      const productA = { id: 'a', name: 'name', displayName: '' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should handle both names being undefined', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: undefined }
      expect(sortByDisplayName(productA, productB)).toBe(0)
    })
  })

  describe('display data with various types', () => {
    it('should identify value type', () => {
      let data: any = undefined
      expect(displayValueType(data)).toBe('UNKNOWN')
      data = null
      expect(displayValueType(data)).toBe('UNKNOWN')

      data = 'text'
      expect(displayValueType(data)).toBe('STRING')

      data = 123
      expect(displayValueType(data)).toBe('NUMBER')

      data = true
      expect(displayValueType(data)).toBe('BOOLEAN')

      data = { hallo: 'test' }
      expect(displayValueType(data)).toBe('OBJECT')
    })

    it('should display value as string', () => {
      let data: any = undefined
      expect(displayValue(data)).toBe('')
      data = null
      expect(displayValue(data)).toBe('')

      data = 'text'
      expect(displayValue(data)).toBe('text')

      data = 123
      expect(displayValue(data)).toBe('123')

      data = true
      expect(displayValue(data)).toBe('true')

      data = { hallo: 'test' }
      expect(displayValue(data)).toBe('{ ... }')
    })

    it('should display value as string', () => {
      let data1: any = undefined
      let data2: any = undefined
      expect(displayValue2(data1, data2)).toBe('')
      data2 = null
      expect(displayValue2(data1, data2)).toBe('')

      data2 = 'text2'
      expect(displayValue2(data1, data2)).toBe('text2')
      data1 = 'text1'
      expect(displayValue2(data1, data2)).toBe('text1')

      data1 = false
      data2 = true
      expect(displayValue2(data1, data2)).toBe('false')

      data1 = 123
      data2 = false
      expect(displayValue2(data1, data2)).toBe('123')

      data1 = { hallo: 'test' }
      data2 = { hallo: 'test' }
      expect(displayValue2(data1, data2)).toBe('{ ... }')
    })

    it('should identify equality state', () => {
      let data1: any = undefined
      let data2: any = undefined
      expect(displayEqualityState(data1, data2)).toBe('UNDEFINED')
      data1 = null
      expect(displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = '123'
      expect(displayEqualityState(data1, data2)).toBe('FALSE')
      data1 = 123
      expect(displayEqualityState(data1, data2)).toBe('FALSE')
      data1 = false
      expect(displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = 'text1'
      data2 = 'text1'
      expect(displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = 'text2'
      expect(displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = true
      data2 = true
      expect(displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = false
      expect(displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = 123
      data2 = 123
      expect(displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = 1234
      expect(displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = { hallo: 'test' }
      data2 = { hallo: 'test' }
      expect(displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = { hallo: 'test', hi: 'all' }
      expect(displayEqualityState(data1, data2)).toBe('FALSE')
    })
  })
})

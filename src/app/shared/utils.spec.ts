import { SelectItem } from 'primeng/api'

import { Utils } from './utils'

describe('util functions', () => {
  describe('mapping_error_status', () => {
    it('should map known status', () => {
      const status = Utils.mapping_error_status(404)

      expect(status).toEqual(404)
    })

    it('should map unknown status', () => {
      const status = Utils.mapping_error_status(405)

      expect(status).toEqual(0)
    })
  })

  describe('limitText', () => {
    it('should truncate text that exceeds the specified limit', () => {
      const result = Utils.limitText('hello', 4)

      expect(result).toEqual('hell...')
    })

    it('should return the original text if it does not exceed the limit', () => {
      const result = Utils.limitText('hello', 6)

      expect(result).toEqual('hello')
    })

    it('should return an empty string for undefined input', () => {
      const str: any = undefined
      const result = Utils.limitText(str, 5)

      expect(result).toEqual('')
    })
  })

  describe('copyToClipboard', () => {
    let writeTextSpy: jasmine.Spy

    beforeEach(() => {
      writeTextSpy = spyOn(navigator.clipboard, 'writeText')
    })

    it('should copy text to clipboard', () => {
      Utils.copyToClipboard('text')

      expect(writeTextSpy).toHaveBeenCalledWith('text')
    })
  })

  describe('dropDownSortItemsByLabel', () => {
    it('should correctly sort items by label', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const sortedItems = items.sort(Utils.dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toEqual('label1')
    })
    it("should treat falsy values for SelectItem.label as ''", () => {
      const items: SelectItem[] = [
        { label: undefined, value: 1 },
        { label: undefined, value: 2 },
        { label: 'label1', value: 2 }
      ]

      const sortedItems = items.sort(Utils.dropDownSortItemsByLabel)

      expect(sortedItems[0].label).toBeUndefined()
    })
  })

  describe('dropDownGetLabelByValue', () => {
    it('should return the label corresponding to the value', () => {
      const items: SelectItem[] = [
        { label: 'label2', value: 2 },
        { label: 'label1', value: 1 }
      ]

      const result = Utils.dropDownGetLabelByValue(items, '1')

      expect(result).toEqual('label1')
    })
  })

  describe('sortByLocale', () => {
    it('should sort strings based on locale', () => {
      const strings: string[] = ['str2', 'str1']

      const sortedStrings = strings.sort(Utils.sortByLocale)

      expect(sortedStrings[0]).toEqual('str1')
    })
  })

  describe('sortByDisplayName', () => {
    it('should return negative value when first product name comes before second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'User' }
      expect(Utils.sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should return positive value when first product name comes after second alphabetically', () => {
      const productA = { id: 'a', name: 'name', displayName: 'User' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(Utils.sortByDisplayName(productA, productB)).toBeGreaterThan(0)
    })

    it('should return zero when product names are the same', () => {
      const productA = { id: 'a', name: 'name', displayName: 'Admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(Utils.sortByDisplayName(productA, productB)).toBe(0)
    })

    it('should be case-insensitive', () => {
      const productA = { id: 'a', name: 'name', displayName: 'admin' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(Utils.sortByDisplayName(productA, productB)).toBe(0)
    })

    it('should handle undefined names', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(Utils.sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should handle empty string names', () => {
      const productA = { id: 'a', name: 'name', displayName: '' }
      const productB = { id: 'b', name: 'name', displayName: 'Admin' }
      expect(Utils.sortByDisplayName(productA, productB)).toBeLessThan(0)
    })

    it('should handle both names being undefined', () => {
      const productA = { id: 'a', name: 'name', displayName: undefined }
      const productB = { id: 'b', name: 'name', displayName: undefined }
      expect(Utils.sortByDisplayName(productA, productB)).toBe(0)
    })
  })

  describe('display data with various types', () => {
    it('should identify value type', () => {
      let data: any = undefined
      expect(Utils.displayValueType(data)).toBe('UNKNOWN')
      data = null
      expect(Utils.displayValueType(data)).toBe('UNKNOWN')

      data = 'text'
      expect(Utils.displayValueType(data)).toBe('STRING')

      data = 123
      expect(Utils.displayValueType(data)).toBe('NUMBER')

      data = true
      expect(Utils.displayValueType(data)).toBe('BOOLEAN')

      data = { hallo: 'test' }
      expect(Utils.displayValueType(data)).toBe('OBJECT')
    })

    it('should display value as string', () => {
      let data: any = undefined
      expect(Utils.displayValue(data)).toBe('')
      data = null
      expect(Utils.displayValue(data)).toBe('')

      data = 'text'
      expect(Utils.displayValue(data)).toBe('text')

      data = 123
      expect(Utils.displayValue(data)).toBe('123')

      data = true
      expect(Utils.displayValue(data)).toBe('true')

      data = { hallo: 'test' }
      expect(Utils.displayValue(data)).toBe('{ ... }')
    })

    it('should display value as string', () => {
      let data1: any = undefined
      let data2: any = undefined
      expect(Utils.displayValue2(data1, data2)).toBe('')
      data2 = null
      expect(Utils.displayValue2(data1, data2)).toBe('')

      data2 = 'text2'
      expect(Utils.displayValue2(data1, data2)).toBe('text2')
      data1 = 'text1'
      expect(Utils.displayValue2(data1, data2)).toBe('text1')

      data1 = false
      data2 = true
      expect(Utils.displayValue2(data1, data2)).toBe('false')

      data1 = 123
      data2 = false
      expect(Utils.displayValue2(data1, data2)).toBe('123')

      data1 = { hallo: 'test' }
      data2 = { hallo: 'test' }
      expect(Utils.displayValue2(data1, data2)).toBe('{ ... }')
    })

    it('should identify equality state', () => {
      let data1: any = undefined
      let data2: any = undefined
      expect(Utils.displayEqualityState(data1, data2)).toBe('UNDEFINED')
      data1 = null
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = '123'
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')
      data1 = 123
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')
      data1 = false
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = 'text1'
      data2 = 'text1'
      expect(Utils.displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = 'text2'
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = true
      data2 = true
      expect(Utils.displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = false
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = 123
      data2 = 123
      expect(Utils.displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = 1234
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')

      data1 = { hallo: 'test' }
      data2 = { hallo: 'test' }
      expect(Utils.displayEqualityState(data1, data2)).toBe('TRUE')
      data2 = { hallo: 'test', hi: 'all' }
      expect(Utils.displayEqualityState(data1, data2)).toBe('FALSE')
    })
  })
})

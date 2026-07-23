import { TestTranslateLoader, provideTestTranslateLoader } from './translate-loader-testing'
import { TranslateLoader } from '@ngx-translate/core'

describe('TestTranslateLoader', () => {
  it('should return translations for a known language', (done) => {
    const loader = new TestTranslateLoader({ en: { key: 'value' } })
    loader.getTranslation('en').subscribe((translations: object) => {
      expect(translations).toEqual({ key: 'value' })
      done()
    })
  })

  it('should return an empty object for an unknown language', (done) => {
    const loader = new TestTranslateLoader({ en: { key: 'value' } })
    loader.getTranslation('fr').subscribe((translations: object) => {
      expect(translations).toEqual({})
      done()
    })
  })
})

describe('provideTestTranslateLoader', () => {
  it('should provide a TranslateLoader using TestTranslateLoader', () => {
    const provider = provideTestTranslateLoader({ en: { key: 'value' } })
    expect(provider.provide).toBe(TranslateLoader)
    expect(provider.useValue instanceof TestTranslateLoader).toBeTrue()
  })
})

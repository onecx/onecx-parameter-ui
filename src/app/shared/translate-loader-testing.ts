import { TranslateLoader, TranslationObject } from '@ngx-translate/core'
import { Observable, of } from 'rxjs'

/**
 * Minimal in-memory TranslateLoader for unit tests.
 * Replaces `ngx-translate-testing`'s TranslateTestingModule, which is incompatible with
 * @ngx-translate/core v17 (it imports the removed TranslateFakeCompiler/FakeMissingTranslationHandler
 * exports and constructs TranslateService via its old positional-argument constructor).
 */
export class TestTranslateLoader extends TranslateLoader {
  constructor(private readonly translations: Record<string, TranslationObject>) {
    super()
  }

  override getTranslation(lang: string): Observable<TranslationObject> {
    return of(this.translations[lang] || {})
  }
}

export function provideTestTranslateLoader(translations: Record<string, TranslationObject>) {
  return { provide: TranslateLoader, useValue: new TestTranslateLoader(translations) }
}

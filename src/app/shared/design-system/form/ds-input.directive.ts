import { Directive } from '@angular/core';

/**
 * Applies the standard DutyCare input treatment to any <input>/<select>/<textarea>.
 * One source of truth for field styling so login, create, admin and the search
 * bar look identical. Use: <input dsInput ... />
 */
@Directive({
  selector: 'input[dsInput], select[dsInput], textarea[dsInput]',
  standalone: true,
  host: {
    class:
      'w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900 ' +
      'placeholder:text-neutral-400 shadow-xs transition-colors ' +
      'hover:border-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary-soft ' +
      'focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400',
  },
})
export class DsInputDirective {}

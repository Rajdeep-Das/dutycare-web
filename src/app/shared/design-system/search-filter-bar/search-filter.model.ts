/**
 * Config-driven search filter definitions (Plan §5, §11). A screen passes a list
 * of these; the bar renders the right input per type and emits a flat value map.
 * New filters (police station, village, …) are added as data here, not new code.
 *
 * Field types are limited to what the Doctor and Police searches actually need:
 *   - text        → single free-text param
 *   - date-range  → emits `${key}_from` and `${key}_to`
 *   - select      → enum dropdown, single param
 * Add a new type only when a real screen needs it.
 */
export type FilterFieldType = 'text' | 'date-range' | 'select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterFieldBase {
  /** Query-param key (date-range expands to key_from / key_to). */
  key: string;
  label: string;
  type: FilterFieldType;
}

export interface TextFilterField extends FilterFieldBase {
  type: 'text';
  placeholder?: string;
}

export interface DateRangeFilterField extends FilterFieldBase {
  type: 'date-range';
}

export interface SelectFilterField extends FilterFieldBase {
  type: 'select';
  options: SelectOption[];
}

export type FilterField = TextFilterField | DateRangeFilterField | SelectFilterField;

/** Flat map of query params emitted by the bar (empty values omitted). */
export type FilterValues = Record<string, string>;

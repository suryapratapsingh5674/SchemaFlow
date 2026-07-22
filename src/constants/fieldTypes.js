/**
 * MongoDB / Mongoose field types with associated display metadata.
 * Used by the schema node renderer and field inspector panel.
 */
export const FIELD_TYPES = [
  { value: 'String',   label: 'String',   color: '#4ea8f8', shorthand: 'STR' },
  { value: 'Number',   label: 'Number',   color: '#00d68f', shorthand: 'NUM' },
  { value: 'Boolean',  label: 'Boolean',  color: '#ffb347', shorthand: 'BOOL' },
  { value: 'Date',     label: 'Date',     color: '#c084fc', shorthand: 'DATE' },
  { value: 'ObjectId', label: 'ObjectId', color: '#ff5c7a', shorthand: 'OID' },
  { value: 'Mixed',    label: 'Mixed',    color: '#8b92a8', shorthand: 'MIX' },
  { value: 'Array',    label: 'Array',    color: '#6c63ff', shorthand: 'ARR' },
  { value: 'Map',      label: 'Map',      color: '#fb923c', shorthand: 'MAP' },
  { value: 'Buffer',   label: 'Buffer',   color: '#34d399', shorthand: 'BUF' },
  { value: 'Decimal128', label: 'Decimal128', color: '#a3e635', shorthand: 'DEC' },
]

export const FIELD_TYPE_MAP = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.value, t]),
)

/** Edge / relationship types between collections */
export const RELATION_TYPES = [
  { value: 'ref',      label: 'Reference (ref)',   description: 'ObjectId reference to another collection' },
  { value: 'embed',    label: 'Embedded Document', description: 'Nested schema document' },
  { value: 'virtual',  label: 'Virtual Populate',  description: 'Virtual relationship via populate' },
]

/** Default empty collection node data shape */
export const DEFAULT_COLLECTION = {
  label: 'NewCollection',
  fields: [],
  color: '#6c63ff',
}

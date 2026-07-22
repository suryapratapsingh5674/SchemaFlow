/**
 * generateModels.js
 * ─────────────────────────────────────────────────────────────────
 * Pure functions that take a nodes + edges array and produce
 * ready-to-paste code strings for multiple output formats.
 *
 * No React imports — fully testable in isolation.
 */

/* ═══════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */

/** Capitalise first character */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** Map field type to Mongoose SchemaType */
const toMongooseType = (type) => {
  const map = {
    String:     'String',
    Number:     'Number',
    Boolean:    'Boolean',
    Date:       'Date',
    ObjectId:   'Schema.Types.ObjectId',
    Array:      '[]',
    Mixed:      'Schema.Types.Mixed',
    Map:        'Map',
    Buffer:     'Buffer',
    Decimal128: 'Schema.Types.Decimal128',
  }
  return map[type] ?? 'Schema.Types.Mixed'
}

/** Map field type to TypeScript type */
const toTSType = (type) => {
  const map = {
    String:     'string',
    Number:     'number',
    Boolean:    'boolean',
    Date:       'Date',
    ObjectId:   'Types.ObjectId',
    Array:      'any[]',
    Mixed:      'any',
    Map:        'Map<string, any>',
    Buffer:     'Buffer',
    Decimal128: 'Types.Decimal128',
  }
  return map[type] ?? 'any'
}

/** Map field type to JSON Schema type */
const toJSONSchemaType = (type) => {
  const map = {
    String:     { type: 'string' },
    Number:     { type: 'number' },
    Boolean:    { type: 'boolean' },
    Date:       { type: 'string', format: 'date-time' },
    ObjectId:   { type: 'string', pattern: '^[a-f\\d]{24}$', description: 'ObjectId' },
    Array:      { type: 'array', items: {} },
    Mixed:      {},
    Map:        { type: 'object' },
    Buffer:     { type: 'string', contentEncoding: 'base64' },
    Decimal128: { type: 'number' },
  }
  return map[type] ?? {}
}

/** Map field type to Zod validator */
const toZodType = (type) => {
  const map = {
    String:     'z.string()',
    Number:     'z.number()',
    Boolean:    'z.boolean()',
    Date:       'z.date()',
    ObjectId:   'z.string().regex(/^[a-f\\d]{24}$/i)',
    Array:      'z.array(z.unknown())',
    Mixed:      'z.unknown()',
    Map:        'z.record(z.unknown())',
    Buffer:     'z.instanceof(Buffer)',
    Decimal128: 'z.number()',
  }
  return map[type] ?? 'z.unknown()'
}

/**
 * Build a ref map: sourceNodeId → [{ fieldName, targetLabel }]
 * Used to inject `ref` into ObjectId fields that have a drawn edge.
 */
function buildRefMap(edges, nodes) {
  const refMap = {}  // nodeId → Map<fieldId, targetLabel>

  for (const edge of edges) {
    const d = edge.data ?? {}
    if (!d.fromCollection || !d.toCollection) continue

    // Find source node
    const sourceNode = nodes.find(
      (n) => n.data?.label === d.fromCollection,
    )
    if (!sourceNode) continue

    if (!refMap[sourceNode.id]) refMap[sourceNode.id] = {}

    // Map the field name → target collection label
    if (d.fromField) {
      refMap[sourceNode.id][d.fromField] = d.toCollection
    }
  }

  return refMap
}

/* ═══════════════════════════════════════════════════════════════
   MONGOOSE GENERATOR
════════════════════════════════════════════════════════════════ */

/**
 * generateMongooseFile(node, refMap)
 * Produces a complete models/Xyz.js file string.
 */
function generateMongooseFile(node, refMap = {}) {
  const label  = node.data?.label ?? 'Unknown'
  const fields = (node.data?.fields ?? []).filter((f) => !f.isId) // skip _id
  const nodeRefs = refMap[node.id] ?? {}

  const indent = '  '

  // Build field definitions
  const fieldLines = fields.map((field) => {
    const mType = toMongooseType(field.type)
    const ref   = nodeRefs[field.name] ?? field.ref  // from edge or explicit ref

    const props = []

    if (field.type === 'Array') {
      // Array of ObjectId refs or plain array
      if (ref) {
        return `${indent}${field.name}: [{ type: Schema.Types.ObjectId, ref: '${ref}'${field.required ? ', required: true' : ''} }],`
      }
      return `${indent}${field.name}: { type: [Schema.Types.Mixed]${field.required ? ', required: true' : ''} },`
    }

    props.push(`type: ${mType}`)
    if (ref) props.push(`ref: '${ref}'`)
    if (field.required) props.push('required: true')
    if (field.unique)   props.push('unique: true')
    if (field.default !== undefined && field.default !== '')
      props.push(`default: ${JSON.stringify(field.default)}`)

    if (props.length === 1 && !ref && !field.required && !field.unique) {
      // Single-prop shorthand: fieldName: String
      return `${indent}${field.name}: ${mType},`
    }

    return `${indent}${field.name}: { ${props.join(', ')} },`
  })

  return [
    `const mongoose = require('mongoose')`,
    `const { Schema } = mongoose`,
    ``,
    `const ${label}Schema = new Schema(`,
    `  {`,
    ...fieldLines.map((l) => `  ${l}`),
    `  },`,
    `  { timestamps: true },`,
    `)`,
    ``,
    `const ${label} = mongoose.model('${label}', ${label}Schema)`,
    ``,
    `module.exports = ${label}`,
    ``,
  ].join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   TYPESCRIPT GENERATOR
════════════════════════════════════════════════════════════════ */

function generateTypeScriptFile(node, refMap = {}) {
  const label  = node.data?.label ?? 'Unknown'
  const fields = (node.data?.fields ?? []).filter((f) => !f.isId)
  const nodeRefs = refMap[node.id] ?? {}

  const fieldLines = fields.map((field) => {
    const ref     = nodeRefs[field.name] ?? field.ref
    const tsType  = ref ? 'Types.ObjectId' : toTSType(field.type)
    const optional = field.required ? '' : '?'
    return `  ${field.name}${optional}: ${tsType}`
  })

  return [
    `import { Document, Types } from 'mongoose'`,
    ``,
    `export interface I${label} extends Document {`,
    `  _id: Types.ObjectId`,
    ...fieldLines,
    `  createdAt: Date`,
    `  updatedAt: Date`,
    `}`,
    ``,
  ].join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   JSON SCHEMA GENERATOR
════════════════════════════════════════════════════════════════ */

function generateJSONSchemaFile(node) {
  const label  = node.data?.label ?? 'Unknown'
  const fields = node.data?.fields ?? []

  const properties = {}
  const required   = []

  for (const field of fields) {
    properties[field.name] = toJSONSchemaType(field.type)
    if (field.required) required.push(field.name)
  }

  const schema = {
    $schema:     'http://json-schema.org/draft-07/schema#',
    $id:         `#/definitions/${label}`,
    title:       label,
    type:        'object',
    properties,
    ...(required.length ? { required } : {}),
  }

  return JSON.stringify(schema, null, 2) + '\n'
}

/* ═══════════════════════════════════════════════════════════════
   ZOD GENERATOR
════════════════════════════════════════════════════════════════ */

function generateZodFile(node, refMap = {}) {
  const label  = node.data?.label ?? 'Unknown'
  const fields = (node.data?.fields ?? []).filter((f) => !f.isId)
  const nodeRefs = refMap[node.id] ?? {}

  const fieldLines = fields.map((field) => {
    const ref     = nodeRefs[field.name] ?? field.ref
    let zodType   = ref ? `z.string().regex(/^[a-f\\d]{24}$/i)` : toZodType(field.type)
    if (!field.required) zodType += '.optional()'
    return `  ${field.name}: ${zodType},`
  })

  return [
    `import { z } from 'zod'`,
    ``,
    `export const ${label}Schema = z.object({`,
    `  _id: z.string().regex(/^[a-f\\d]{24}$/i),`,
    ...fieldLines,
    `  createdAt: z.date().optional(),`,
    `  updatedAt: z.date().optional(),`,
    `})`,
    ``,
    `export type ${label} = z.infer<typeof ${label}Schema>`,
    ``,
  ].join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT  —  generateAllModels(nodes, edges)
   ─────────────────────────────────────────────────────────────
   Returns an object keyed by format:
   {
     mongoose:   { 'User.js': '...', 'Post.js': '...' },
     typescript: { 'User.ts': '...', 'Post.ts': '...' },
     json:       { 'User.json': '...', 'Post.json': '...' },
     zod:        { 'User.zod.ts': '...', 'Post.zod.ts': '...' },
   }
   Each value is a Map<filename, code> for one-file-per-collection.
════════════════════════════════════════════════════════════════ */
export function generateAllModels(nodes, edges = []) {
  const refMap = buildRefMap(edges, nodes)

  const result = {
    mongoose:   {},
    typescript: {},
    json:       {},
    zod:        {},
  }

  for (const node of nodes) {
    const label = node.data?.label ?? 'Unknown'

    result.mongoose[`${label}.js`]      = generateMongooseFile(node, refMap)
    result.typescript[`${label}.ts`]    = generateTypeScriptFile(node, refMap)
    result.json[`${label}.json`]        = generateJSONSchemaFile(node)
    result.zod[`${label}.zod.ts`]       = generateZodFile(node, refMap)
  }

  return result
}

import { useCallback } from 'react'
import { addEdge, MarkerType } from '@xyflow/react'

/* ─── Node color palette ─────────────────────────────────────── */
const NODE_COLORS = [
  '#7c6af7', '#3dd68c', '#4da6ff',
  '#f5a623', '#f25f5c', '#c084fc', '#2dd4bf',
]

/* ─── Cascade layout constants ──────────────────────────────── */
const COLS     = 3
const STEP_X   = 280
const STEP_Y   = 260
const ORIGIN_X = 120
const ORIGIN_Y = 120

/* ═══════════════════════════════════════════════════════════════
   useAddCollection
   Creates a new schema node with default "NewCollection" name
   and a single _id ObjectId field. Positions via cascade grid.
════════════════════════════════════════════════════════════════ */
export function useAddCollection(setNodes, setSelectedId) {
  return useCallback(() => {
    const id = `col-${Date.now()}`

    setNodes((currentNodes) => {
      const index = currentNodes.length
      const color = NODE_COLORS[index % NODE_COLORS.length]
      const col   = index % COLS
      const row   = Math.floor(index / COLS)

      const newNode = {
        id,
        type:     'schemaNode',
        position: {
          x: ORIGIN_X + col * STEP_X,
          y: ORIGIN_Y + row * STEP_Y,
        },
        data: {
          label:  'NewCollection',
          color,
          fields: [
            { id: '_id', name: '_id', type: 'ObjectId', required: true, isId: true },
          ],
        },
      }

      return [...currentNodes, newNode]
    })

    setSelectedId(id)
    return id
  }, [setNodes, setSelectedId])
}

/* ═══════════════════════════════════════════════════════════════
   useOnConnect
   ─────────────────────────────────────────────────────────────
   Called by React Flow when a user drags a handle to create
   a new edge.

   What we do here:
   1. Resolve source / target node labels from current nodes array
   2. Determine which field the handle belongs to (from handle id)
   3. Build a rich relationship data object:
      {
        relationType:    'ref',           // default; editable later
        fromCollection:  'Post',          // source node label
        toCollection:    'User',          // target node label
        fromField:       'author',        // source field name (if field handle)
        toField:         '_id',           // target field name (if field handle)
        fieldName:       'author',        // the ObjectId field that will hold the ref
      }
   4. Deduplicates edges on the same source+target+handle pair
   5. Colors the arrowhead to match the source node
════════════════════════════════════════════════════════════════ */
export function useOnConnect(setEdges, getNodes) {
  return useCallback(
    (connection) => {
      setEdges((eds) => {
        /* ── Deduplication ── */
        const exists = eds.some(
          (e) =>
            e.source       === connection.source &&
            e.target       === connection.target &&
            e.sourceHandle === connection.sourceHandle &&
            e.targetHandle === connection.targetHandle,
        )
        if (exists) return eds

        /* ── Resolve node labels ── */
        const allNodes      = getNodes()
        const sourceNode    = allNodes.find((n) => n.id === connection.source)
        const targetNode    = allNodes.find((n) => n.id === connection.target)
        const fromLabel     = sourceNode?.data?.label ?? connection.source
        const toLabel       = targetNode?.data?.label ?? connection.target
        const sourceColor   = sourceNode?.data?.color ?? '#7c6af7'

        /* ── Resolve field names from handle ids ──
         * Handle id format: "<fieldId>-s" or "<fieldId>-t" for field handles.
         * Node-level handles: "node-s" and "node-t".
         */
        const resolveField = (handleId, node) => {
          if (!handleId || handleId === 'node-s' || handleId === 'node-t') return null
          const fieldId = handleId.replace(/-[st]$/, '')
          const field   = node?.data?.fields?.find((f) => f.id === fieldId)
          return field?.name ?? fieldId
        }

        const fromField = resolveField(connection.sourceHandle, sourceNode)
        const toField   = resolveField(connection.targetHandle, targetNode)

        /* ── Determine the ObjectId reference field name ──
         * Use the source field name if available, otherwise derive
         * from the target collection name (e.g. "user" → "userId").
         */
        const fieldName = fromField ?? `${toLabel.charAt(0).toLowerCase()}${toLabel.slice(1)}Id`

        /* ── Build the relationship data object ── */
        const relationshipData = {
          relationType:   'ref',      // MongoDB ObjectId reference
          fromCollection: fromLabel,
          toCollection:   toLabel,
          fromField:      fromField,
          toField:        toField ?? '_id',
          fieldName,                  // name of the ObjectId field to generate
        }

        return addEdge(
          {
            ...connection,
            id:   `rel-${connection.source}-${connection.target}-${Date.now()}`,
            type: 'schemaEdge',
            markerEnd: {
              type:   MarkerType.ArrowClosed,
              color:  sourceColor,
              width:  14,
              height: 14,
            },
            data: relationshipData,
          },
          eds,
        )
      })
    },
    [setEdges, getNodes],
  )
}

/* ═══════════════════════════════════════════════════════════════
   useUpdateEdge
   Patches a single edge's data (e.g. change relationType).
════════════════════════════════════════════════════════════════ */
export function useUpdateEdge(setEdges) {
  return useCallback(
    (edgeId, patch) =>
      setEdges((eds) =>
        eds.map((e) =>
          e.id !== edgeId ? e : { ...e, data: { ...e.data, ...patch } },
        ),
      ),
    [setEdges],
  )
}

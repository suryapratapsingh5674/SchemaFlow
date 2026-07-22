import { createContext, useContext, useReducer, useCallback } from 'react'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'

/* ─── Initial State ────────────────────────────────────────── */
const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  sidebarCollapsed: false,
  inspectorCollapsed: false,
}

/* ─── Reducer ──────────────────────────────────────────────── */
function schemaReducer(state, action) {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload }
    case 'SET_EDGES':
      return { ...state, edges: action.payload }
    case 'ON_NODES_CHANGE':
      return { ...state, nodes: applyNodeChanges(action.payload, state.nodes) }
    case 'ON_EDGES_CHANGE':
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) }
    case 'ON_CONNECT':
      return { ...state, edges: addEdge(action.payload, state.edges) }
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload, selectedEdgeId: null }
    case 'SELECT_EDGE':
      return { ...state, selectedEdgeId: action.payload, selectedNodeId: null }
    case 'DESELECT_ALL':
      return { ...state, selectedNodeId: null, selectedEdgeId: null }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    case 'TOGGLE_INSPECTOR':
      return { ...state, inspectorCollapsed: !state.inspectorCollapsed }
    default:
      return state
  }
}

/* ─── Context ──────────────────────────────────────────────── */
const SchemaStoreContext = createContext(null)

export function SchemaStoreProvider({ children }) {
  const [state, dispatch] = useReducer(schemaReducer, initialState)

  const onNodesChange = useCallback(
    (changes) => dispatch({ type: 'ON_NODES_CHANGE', payload: changes }),
    [],
  )
  const onEdgesChange = useCallback(
    (changes) => dispatch({ type: 'ON_EDGES_CHANGE', payload: changes }),
    [],
  )
  const onConnect = useCallback(
    (connection) => dispatch({ type: 'ON_CONNECT', payload: connection }),
    [],
  )

  const value = { state, dispatch, onNodesChange, onEdgesChange, onConnect }

  return (
    <SchemaStoreContext.Provider value={value}>
      {children}
    </SchemaStoreContext.Provider>
  )
}

export function useSchemaStore() {
  const ctx = useContext(SchemaStoreContext)
  if (!ctx) throw new Error('useSchemaStore must be used inside SchemaStoreProvider')
  return ctx
}

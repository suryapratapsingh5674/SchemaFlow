import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Code2, FileCode, Copy, Check, ChevronUp, ChevronDown,
  Terminal, FileJson, Braces, Download,
  FileText, Folder, FolderOpen, ChevronRight, X as XIcon,
  Circle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   FORMAT TABS
════════════════════════════════════════════════════════════════ */
const FORMAT_TABS = [
  { id: 'mongoose',   label: 'Mongoose',    icon: FileCode },
  { id: 'typescript', label: 'TypeScript',  icon: Code2    },
  { id: 'json',       label: 'JSON Schema', icon: FileJson },
  { id: 'zod',        label: 'Zod',         icon: Braces   },
]

/* ── Extension metadata ──────────────────────────────────────── */
function fileColor(name = '') {
  if (name.endsWith('.zod.ts')) return '#c084fc'
  if (name.endsWith('.ts'))     return '#4da6ff'
  if (name.endsWith('.json'))   return '#3dd68c'
  if (name.endsWith('.js'))     return '#f5a623'
  return '#9da1af'
}
function fileLang(name = '') {
  if (name.endsWith('.json')) return 'JSON'
  if (name.endsWith('.ts') || name.endsWith('.zod.ts')) return 'TypeScript'
  return 'JavaScript'
}

/* ═══════════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTER  (line-aware, handles comments correctly)
════════════════════════════════════════════════════════════════ */
const C = {
  keyword:   '#c084fc', // const, import, export, type…
  string:    '#3dd68c', // 'strings' and "strings"
  comment:   '#546378', // // comments
  fn:        '#4da6ff', // Schema, mongoose, z…
  type:      '#f5a623', // String, Number, Boolean…
  num:       '#f25f5c', // 42
  bool:      '#fb923c', // true, false
  key:       '#e8e9ec', // object keys before colon
  punct:     '#636674', // : , { } ( )
  operator:  '#9da1af', // = => …
  plain:     '#abb2bf', // default
}

// Token rules applied left-to-right per remaining string
const RULES = [
  { re: /(\/\/[^\n]*)/, c: 'comment' },
  { re: /(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/, c: 'string' },
  { re: /\b(const|let|var|function|class|return|new|if|else|for|of|in|from|import|export|default|require|module|type|interface|extends|implements|async|await|throw|try|catch)\b/, c: 'keyword' },
  { re: /\b(true|false|null|undefined)\b/, c: 'bool' },
  { re: /\b(mongoose|Schema|Types|ObjectId|Mixed|Decimal128|Document|z|model)\b/, c: 'fn' },
  { re: /\b(String|Number|Boolean|Date|Buffer|Map|Array|Object)\b/, c: 'type' },
  { re: /\b(\d+(?:\.\d+)?)\b/, c: 'num' },
  { re: /([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/, c: 'key', group: 1, extra: { text: (m) => m[2], c: 'punct' } },
  { re: /(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|])/, c: 'operator' },
  { re: /([{}()[\],;])/, c: 'punct' },
]

function tokenizeLine(line) {
  const tokens = []
  let rem = line

  while (rem.length > 0) {
    let hit = false

    for (const rule of RULES) {
      const m = rule.re.exec(rem)
      if (!m) continue

      if (m.index > 0) {
        // Plain text before match
        tokens.push({ text: rem.slice(0, m.index), c: 'plain' })
        rem = rem.slice(m.index)
        hit = true
        break
      }

      // Matched at position 0
      if (rule.group !== undefined) {
        // Multi-group rule: group 1 = key, rest = extra
        tokens.push({ text: m[rule.group], c: rule.c })
        if (rule.extra) tokens.push({ text: rule.extra.text(m), c: rule.extra.c })
      } else {
        tokens.push({ text: m[0], c: rule.c })
      }
      rem = rem.slice(m[0].length)
      hit = true
      break
    }

    if (!hit) {
      tokens.push({ text: rem[0], c: 'plain' })
      rem = rem.slice(1)
    }
  }

  return tokens
}

function tokenize(code) {
  return code.split('\n').map(tokenizeLine)
}

/* ═══════════════════════════════════════════════════════════════
   LINE NUMBER GUTTER + CODE LINES
════════════════════════════════════════════════════════════════ */
function CodeEditor({ code }) {
  const lines = useMemo(() => tokenize(code), [code])
  const totalLines = lines.length

  return (
    <div style={{ display: 'flex', flex: 1, overflowX: 'auto', minWidth: 0 }}>
      {/* Line number gutter */}
      <div
        aria-hidden="true"
        style={{
          flexShrink:  0,
          userSelect:  'none',
          textAlign:   'right',
          padding:     '14px 12px 14px 16px',
          fontFamily:  "'JetBrains Mono','Fira Code','Consolas',monospace",
          fontSize:    12,
          lineHeight:  1.75,
          color:       '#3e4451',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          background:  '#0d0e10',
          minWidth:    44,
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code body */}
      <pre
        style={{
          flex:       1,
          margin:     0,
          padding:    '14px 20px',
          fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
          fontSize:   12,
          lineHeight: 1.75,
          background: '#0d0e10',
          whiteSpace: 'pre',
          tabSize:    2,
          overflowX:  'visible',
        }}
      >
        {lines.map((lineTokens, li) => (
          <div key={li} className="editor-line" style={{ minHeight: '1.75em' }}>
            {lineTokens.map((tok, ti) => (
              <span key={ti} style={{ color: C[tok.c] ?? C.plain }}>{tok.text}</span>
            ))}
          </div>
        ))}
      </pre>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COPY BUTTON
════════════════════════════════════════════════════════════════ */
function CopyBtn({ text, compact = false }) {
  const [copied, setCopied] = useState(false)
  const copy = () =>
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="flex items-center gap-1 px-2 h-6 rounded text-xs cursor-pointer transition-all"
      style={{
        color:      copied ? '#3dd68c' : '#636674',
        background: 'rgba(255,255,255,0.05)',
        border:     '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#abb2bf')}
      onMouseLeave={e => (e.currentTarget.style.color = copied ? '#3dd68c' : '#636674')}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {!compact && (copied ? 'Copied' : 'Copy')}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FILE TABS  (VS Code style — horizontal strip)
   Shows one tab per collection file. Active tab is underlined.
════════════════════════════════════════════════════════════════ */
function FileTabs({ fileNames, activeFile, onSelect, openTabs, onClose }) {
  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'stretch',
        height:     36,
        background: '#080a0c',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflowX:  'auto',
        overflowY:  'hidden',
        flexShrink: 0,
      }}
    >
      {openTabs.map(name => {
        const active = name === activeFile
        const color  = fileColor(name)
        return (
          <div
            key={name}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        8,
              padding:    '0 16px',
              cursor:     'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.05)',
              borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
              background: active ? '#0d0e10' : 'transparent',
              transition: 'background 0.1s',
            }}
            onClick={() => onSelect(name)}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <FileText size={12} style={{ color, flexShrink: 0 }} />
            <span style={{
              fontSize:   12,
              fontFamily: 'monospace',
              color:      active ? '#e8e9ec' : '#636674',
              fontWeight: active ? 500 : 400,
            }}>
              {name}
            </span>
            {/* Close button on hover */}
            <span
              style={{
                width: 16, height: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: '50%', flexShrink: 0,
                marginLeft: 4,
              }}
              onClick={e => { e.stopPropagation(); onClose(name) }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title="Close"
            >
              <XIcon size={10} style={{ color: '#636674' }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
function EmptyState({ formatId }) {
  const msg = {
    mongoose:   '// Click "Generate Models" in the toolbar to generate Mongoose schemas',
    typescript: '// TypeScript interfaces will appear here after generating',
    json:       '// JSON Schema output will appear here after generating',
    zod:        '// Zod validators will appear here after generating',
  }[formatId] ?? '// Generate models to see output'

  return (
    <div style={{ padding: '24px 20px' }}>
      <pre style={{
        fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
        fontSize: 12, lineHeight: 1.75, color: '#3e4451', fontStyle: 'italic', margin: 0,
      }}>
        {msg}
      </pre>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FOLDER TREE — VS Code Explorer
════════════════════════════════════════════════════════════════ */
function FolderRow({ name, open, onToggle, depth }) {
  const Icon = open ? FolderOpen : Folder
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 cursor-pointer select-none"
      style={{
        height: 28, paddingLeft: 8 + depth * 14, paddingRight: 10,
        background: 'transparent', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <ChevronRight size={11} style={{ flexShrink: 0, color: '#3e4451', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }} />
      <Icon size={14} style={{ flexShrink: 0, color: '#f5a623' }} />
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#636674', marginLeft: 2 }}>{name}</span>
    </button>
  )
}

function TreeFile({ name, active, onClick, depth }) {
  const color = fileColor(name)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 cursor-pointer"
      style={{
        height: 28, paddingLeft: 8 + depth * 14, paddingRight: 10,
        background: active ? 'rgba(124,106,247,0.14)' : 'transparent',
        borderLeft: active ? '2px solid #7c6af7' : '2px solid transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(124,106,247,0.14)' : 'transparent' }}
    >
      <FileText size={12} style={{ flexShrink: 0, color }} />
      <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: active ? 600 : 400, color: active ? '#e8e9ec' : '#636674' }}>
        {name}
      </span>
    </button>
  )
}

function FolderTree({ fileNames, activeFile, onSelect }) {
  const [backendOpen, setBackendOpen] = useState(true)
  const [modelsOpen,  setModelsOpen]  = useState(true)
  return (
    <div style={{ paddingTop: 4 }}>
      <FolderRow name="backend" open={backendOpen} onToggle={() => setBackendOpen(v => !v)} depth={0} />
      {backendOpen && (
        <>
          <FolderRow name="models" open={modelsOpen} onToggle={() => setModelsOpen(v => !v)} depth={1} />
          {modelsOpen && fileNames.map(name => (
            <TreeFile key={name} name={name} active={name === activeFile} onClick={() => onSelect(name)} depth={2} />
          ))}
        </>
      )}
    </div>
  )
}

function FolderTreePlaceholder() {
  return (
    <div style={{ paddingTop: 4, opacity: 0.2, pointerEvents: 'none' }}>
      <FolderRow name="backend" open onToggle={() => {}} depth={0} />
      <FolderRow name="models"  open onToggle={() => {}} depth={1} />
      {['User.js', 'Post.js'].map(n => <TreeFile key={n} name={n} active={false} onClick={() => {}} depth={2} />)}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BAR  (VS Code bottom bar)
════════════════════════════════════════════════════════════════ */
function StatusBar({ fileName, code }) {
  if (!fileName || !code) return null
  const lines = code.split('\n').length
  const chars = code.length
  const lang  = fileLang(fileName)
  return (
    <div style={{
      height:      22,
      flexShrink:  0,
      display:     'flex',
      alignItems:  'center',
      gap:         16,
      paddingLeft: 16,
      paddingRight: 16,
      background:  '#0a0b0d',
      borderTop:   '1px solid rgba(255,255,255,0.06)',
      fontSize:    11,
      color:       '#3e4451',
      fontFamily:  'monospace',
    }}>
      <span style={{ color: '#4da6ff' }}>{lang}</span>
      <span>Ln 1, Col 1</span>
      <span>{lines} lines</span>
      <span>{chars} chars</span>
      <span style={{ marginLeft: 'auto' }}>UTF-8</span>
      <span>LF</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EDITOR PANEL  (file tabs + code + status bar)
════════════════════════════════════════════════════════════════ */
function EditorPanel({ formatFiles, activeFile, openTabs, onSelectFile, onCloseTab, formatId }) {
  const hasCode = Object.keys(formatFiles).length > 0
  const code    = activeFile ? (formatFiles[activeFile] ?? '') : ''

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0e10' }}>
      {/* File tabs */}
      {hasCode && openTabs.length > 0 && (
        <FileTabs
          fileNames={Object.keys(formatFiles)}
          activeFile={activeFile}
          onSelect={onSelectFile}
          openTabs={openTabs}
          onClose={onCloseTab}
        />
      )}

      {/* Editor toolbar — breadcrumb + copy */}
      {hasCode && activeFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: '#0d0e10',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#50535e' }}>backend</span>
          <ChevronRight size={10} style={{ color: '#50535e' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#50535e' }}>models</span>
          <ChevronRight size={10} style={{ color: '#50535e' }} />
          <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: fileColor(activeFile), fontWeight: 600 }}>
            {activeFile}
          </span>
          <div style={{ flex: 1 }} />
          <CopyBtn text={code} />
        </div>
      )}

      {/* Code area with line numbers */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {hasCode
          ? <CodeEditor code={code} />
          : <EmptyState formatId={formatId} />
        }
      </div>

      {/* Status bar */}
      <StatusBar fileName={activeFile} code={code} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM PANEL  —  main export
════════════════════════════════════════════════════════════════ */
export default function BottomPanel({ generatedCode = null, collapsed, onToggle }) {
  const [formatId,   setFormatId]   = useState('mongoose')
  const [activeFile, setActiveFile] = useState(null)
  const [openTabs,   setOpenTabs]   = useState([])

  const formatFiles = generatedCode?.[formatId] ?? {}
  const fileNames   = Object.keys(formatFiles)
  const hasCode     = fileNames.length > 0

  // When generatedCode changes, open all tabs and select first
  const prevCode = useRef(null)
  if (generatedCode !== prevCode.current) {
    prevCode.current = generatedCode
    if (hasCode) {
      setOpenTabs(fileNames)
      setActiveFile(fileNames[0])
    }
  }

  // Clamp active file
  const resolvedFile = (activeFile && formatFiles[activeFile]) ? activeFile : fileNames[0] ?? null

  const switchFormat = (id) => {
    setFormatId(id)
    const newFiles = Object.keys(generatedCode?.[id] ?? {})
    setOpenTabs(newFiles)
    setActiveFile(newFiles[0] ?? null)
  }

  const handleCloseTab = (name) => {
    const next = openTabs.filter(t => t !== name)
    setOpenTabs(next)
    if (activeFile === name) setActiveFile(next[next.length - 1] ?? null)
  }

  const handleSelectFile = (name) => {
    setActiveFile(name)
    if (!openTabs.includes(name)) setOpenTabs(prev => [...prev, name])
  }

  const activeCode = resolvedFile ? (formatFiles[resolvedFile] ?? '') : ''

  const downloadFile = () => {
    if (!activeCode || !resolvedFile) return
    const url = URL.createObjectURL(new Blob([activeCode], { type: 'text/plain' }))
    Object.assign(document.createElement('a'), { href: url, download: resolvedFile }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        height:     collapsed ? 40 : 'var(--bottom-h)',
        borderTop:  '1px solid var(--border-base)',
        background: '#0a0b0d',
        transition: 'height 0.2s ease',
        overflow:   'hidden',
      }}
    >
      {/* ══ FORMAT TAB BAR ═══════════════════════════════════════ */}
      <div
        className="flex items-center gap-1 px-4 shrink-0"
        style={{
          height:       40,
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
          background:   '#080a0c',
        }}
      >
        <Terminal size={13} style={{ color: '#3e4451', marginRight: 6 }} />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#50535e', marginRight: 12,
        }}>
          Output
        </span>

        {!collapsed && FORMAT_TABS.map(tab => {
          const Icon   = tab.icon
          const active = formatId === tab.id
          const count  = Object.keys(generatedCode?.[tab.id] ?? {}).length
          return (
            <button
              key={tab.id}
              onClick={() => switchFormat(tab.id)}
              className="flex items-center gap-2 px-3.5 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color:      active ? '#e8e9ec' : '#636674',
                border:     active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              }}
            >
              <Icon size={12} />
              {tab.label}
              {count > 0 && (
                <span style={{
                  fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                  background: active ? '#7c6af7' : 'rgba(255,255,255,0.08)',
                  color:      active ? '#fff' : '#636674',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        <div style={{ flex: 1 }} />

        {!collapsed && hasCode && (
          <button
            onClick={downloadFile}
            title={`Download ${resolvedFile}`}
            className="flex items-center gap-1.5 px-3 h-7.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{ color: '#8b8d96', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e9ec')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8b8d96')}
          >
            <Download size={12} /> Download
          </button>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ml-1.5"
          style={{ color: '#50535e' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#abb2bf' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#50535e' }}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ══ CONTENT AREA ════════════════════════════════════════ */}
      {!collapsed && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Folder Tree Sidebar ── */}
          <div style={{
            width: 210, flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background:  '#0a0b0d',
            overflowY:   'auto',
          }}>
            <div style={{
              padding: '8px 14px 6px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#50535e',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              Explorer
            </div>
            {hasCode
              ? <FolderTree fileNames={fileNames} activeFile={resolvedFile} onSelect={handleSelectFile} />
              : <FolderTreePlaceholder />
            }
          </div>

          {/* ── Editor Panel ── */}
          <EditorPanel
            formatFiles={formatFiles}
            activeFile={resolvedFile}
            openTabs={openTabs}
            onSelectFile={handleSelectFile}
            onCloseTab={handleCloseTab}
            formatId={formatId}
          />
        </div>
      )}
    </div>
  )
}

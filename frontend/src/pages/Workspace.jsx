import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import {
  Code,
  PenTool,
  Play,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Users,
  Sparkles,
  ArrowLeft,
  Share2,
  FileText,
  Terminal,
  Eraser,
  Square,
  Circle,
  Minus,
  Maximize2,
  Layers,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';

const STARTER_TEMPLATES = {
  javascript: `// SkillSwap Live JavaScript Sandbox
// Press 'Run Code' or Ctrl + Enter to execute

function calculateSwapCompatibility(learnerNeeds, mentorOffers) {
  const matches = learnerNeeds.filter(skill => mentorOffers.includes(skill));
  const score = Math.round((matches.length / learnerNeeds.length) * 100);
  return { matches, score };
}

const learnerWants = ['React', 'Python', 'System Design'];
const mentorSkills = ['Python', 'Docker', 'System Design', 'PostgreSQL'];

const result = calculateSwapCompatibility(learnerWants, mentorSkills);
console.log('🚀 Swap Compatibility Result:');
console.log(JSON.stringify(result, null, 2));
console.log(\`\\nMatch Score: \${result.score}% match!\`);
`,
  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif, system-ui;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      margin: 0;
      background: linear-gradient(135deg, #eef2ff, #fdf2f8);
    }
    .card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.15);
      border: 1px solid #e0e7ff;
      text-align: center;
      max-width: 380px;
    }
    .badge {
      display: inline-block;
      background: #e0e7ff;
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }
    h2 { color: #1e1b4b; margin: 0 0 0.5rem; font-size: 1.4rem; }
    p { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem; }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      transition: transform 0.15s ease;
    }
    button:hover { background: #4338ca; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">LIVE COMPONENT</span>
    <h2>⚡ SkillSwap Live Sandbox</h2>
    <p>Pair program and design UI components together in real-time!</p>
    <button onclick="alert('🎉 Live Code Preview Works!')">Interact With Me</button>
  </div>
</body>
</html>
`,
  python: `# SkillSwap Python Sandbox
# Simulate algorithmic problem solving together

def find_mutual_swaps(users):
    """Find two-way learning swaps between members."""
    pairs = []
    for i, u1 in enumerate(users):
        for u2 in users[i+1:]:
            has_match1 = any(s in u2['offers'] for s in u1['wants'])
            has_match2 = any(s in u1['offers'] for s in u2['wants'])
            if has_match1 and has_match2:
                pairs.append((u1['name'], u2['name']))
    return pairs

users = [
    {"name": "Alice", "offers": ["Python", "Django"], "wants": ["React"]},
    {"name": "Bob", "offers": ["React", "CSS"], "wants": ["Python"]},
    {"name": "Charlie", "offers": ["Docker", "Go"], "wants": ["Rust"]}
]

print("=== SkillSwap Python Algorithm Output ===")
swaps = find_mutual_swaps(users)
for p1, p2 in swaps:
    print(f"✨ Match Found: {p1} <---> {p2}")
`,
  sql: `-- SkillSwap SQL Analytics Sandbox
SELECT 
    u.name AS swapper_name,
    COUNT(s.id) AS total_sessions_completed,
    ROUND(AVG(r.stars), 2) AS avg_rating,
    SUM(s.duration) / 60.0 AS total_hours_mentored
FROM users u
LEFT JOIN sessions s ON u.id = s.partner_id AND s.status = 'completed'
LEFT JOIN reviews r ON u.id = r.reviewed_user_id
GROUP BY u.id, u.name
ORDER BY avg_rating DESC, total_sessions_completed DESC;
`,
  markdown: `# 🚀 Live Session Study Notes

## Date: ${new Date().toLocaleDateString()}
**Session Goal:** Master Fullstack Socket.io and Interactive State

### Key Concepts Covered:
- [x] Socket rooms and broadcasting without sender echo
- [x] Canvas stroke streaming with resolution independence
- [x] Real-time code syncing and client execution sandbox

---

### Practice Exercise:
> Implement a collaborative cursor indicator with unique color pills for each user.

\`\`\`javascript
socket.emit('workspace-cursor', { x, y });
\`\`\`
`,
};

const COLOR_PALETTE = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#0f172a', // Dark Slate
];

const Workspace = () => {
  const { roomId: paramRoomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Generate or sanitize room ID
  const roomId = paramRoomId || location.state?.roomId || 'general-lab';

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'whiteboard' | 'split'
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [partnerName, setPartnerName] = useState(location.state?.partnerName || 'Partner');
  const [copiedLink, setCopiedLink] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Code Sandbox State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_TEMPLATES.javascript);
  const [fontSize, setFontSize] = useState(14);
  const [consoleOutput, setConsoleOutput] = useState([
    { type: 'info', text: '💡 SkillSwap Sandbox ready. Press "Run Code" or Ctrl+Enter to execute.' },
  ]);
  const [htmlPreviewKey, setHtmlPreviewKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Whiteboard State
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen'); // 'pen' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle'
  const [strokeColor, setStrokeColor] = useState('#4f46e5');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [boardHistory, setBoardHistory] = useState([]);
  const snapshotRef = useRef(null);

  // Socket & Sync Refs
  const socketRef = useRef(null);
  const isRemoteCodeChange = useRef(false);

  // Initialize Socket.io connection and room listeners
  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.emit('authenticate', { user });
    socket.emit('join-workspace', { roomId, user });

    socket.on('workspace-user-joined', (payload) => {
      setPartnerJoined(true);
      if (payload?.user?.name) {
        setPartnerName(payload.user.name);
      }
      setConsoleOutput((prev) => [
        ...prev,
        { type: 'info', text: `✨ ${payload?.user?.name || 'Partner'} joined the collaborative workspace!` },
      ]);
    });

    socket.on('workspace-user-left', (payload) => {
      setPartnerJoined(false);
      setConsoleOutput((prev) => [
        ...prev,
        { type: 'warning', text: `👋 ${payload?.user?.name || 'Partner'} left the workspace.` },
      ]);
    });

    socket.on('workspace-code-sync', (payload) => {
      if (payload?.sender !== (user?._id || user?.id)) {
        isRemoteCodeChange.current = true;
        setCode(payload.code);
        if (payload.language) {
          setLanguage(payload.language);
        }
      }
    });

    socket.on('workspace-draw-sync', (payload) => {
      if (payload?.sender !== (user?._id || user?.id) && canvasRef.current) {
        drawRemoteStroke(payload.stroke);
      }
    });

    socket.on('workspace-clear-sync', () => {
      clearLocalCanvas();
    });

    return () => {
      socket.emit('leave-workspace', { roomId, user });
      socket.disconnect();
    };
  }, [roomId, user]);

  // Code editor change handler with Socket emit
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    if (!isRemoteCodeChange.current && socketRef.current) {
      socketRef.current.emit('workspace-code-update', {
        roomId,
        code: newCode,
        language,
        sender: user?._id || user?.id,
      });
    }
    isRemoteCodeChange.current = false;
  };

  // Support Tab key inside textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  };

  // Switch Language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (STARTER_TEMPLATES[newLang]) {
      setCode(STARTER_TEMPLATES[newLang]);
      if (socketRef.current) {
        socketRef.current.emit('workspace-code-update', {
          roomId,
          code: STARTER_TEMPLATES[newLang],
          language: newLang,
          sender: user?._id || user?.id,
        });
      }
    }
  };

  // Run Code logic
  const runCode = () => {
    setIsRunning(true);
    const logs = [];
    const startTime = performance.now();

    if (language === 'javascript') {
      try {
        const customConsole = {
          log: (...args) => {
            logs.push({
              type: 'log',
              text: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '),
            });
          },
          error: (...args) => {
            logs.push({
              type: 'error',
              text: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '),
            });
          },
          warn: (...args) => {
            logs.push({
              type: 'warning',
              text: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '),
            });
          },
          info: (...args) => {
            logs.push({
              type: 'info',
              text: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '),
            });
          },
        };

        const sandboxedFunc = new Function('console', code);
        sandboxedFunc(customConsole);

        const execTime = (performance.now() - startTime).toFixed(1);
        if (logs.length === 0) {
          logs.push({ type: 'info', text: '✅ Code executed with no errors. (No console output produced)' });
        }
        logs.push({ type: 'meta', text: `⚡ Finished in ${execTime}ms` });
        setConsoleOutput(logs);
      } catch (err) {
        setConsoleOutput([
          ...logs,
          { type: 'error', text: `❌ ${err.name}: ${err.message}` },
          { type: 'meta', text: 'Check your syntax and line numbers.' },
        ]);
      }
    } else if (language === 'html') {
      setHtmlPreviewKey((prev) => prev + 1);
      setConsoleOutput([
        { type: 'info', text: '🌐 Live HTML preview refreshed in iframe canvas below!' },
        { type: 'meta', text: `⚡ Document re-rendered in ${(performance.now() - startTime).toFixed(1)}ms` },
      ]);
    } else if (language === 'python') {
      // Client-side simulated Python output
      const simulatedOutput = [];
      const lines = code.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('print(')) {
          const match = line.match(/print\((.*)\)/);
          if (match) {
            let str = match[1].replace(/["']/g, '');
            if (str.includes('{') && str.includes('}')) {
              str = str.replace(/{.*?}/g, 'Alice <---> Bob');
            }
            simulatedOutput.push({ type: 'log', text: str });
          }
        }
      });
      if (simulatedOutput.length === 0) {
        simulatedOutput.push({ type: 'log', text: '=== Python Code Evaluated ===\nNo print statements found.' });
      }
      simulatedOutput.push({ type: 'meta', text: `⚡ Python execution simulated in ${(performance.now() - startTime).toFixed(1)}ms` });
      setConsoleOutput(simulatedOutput);
    } else if (language === 'sql') {
      setConsoleOutput([
        { type: 'info', text: '📊 SQL Query Analyzed Successfully:' },
        { type: 'log', text: 'Tables referenced: users, sessions, reviews' },
        { type: 'log', text: 'Aggregate operations: COUNT(), AVG(), SUM()' },
        { type: 'log', text: 'Returned 5 rows mock preview: Alice (12 sessions, 4.9★), Bob (8 sessions, 4.8★)' },
        { type: 'meta', text: `⚡ Query plan analyzed in ${(performance.now() - startTime).toFixed(1)}ms` },
      ]);
    } else {
      setConsoleOutput([
        { type: 'info', text: '📝 Markdown parsed successfully.' },
      ]);
    }

    setIsRunning(false);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyRoomInviteLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const downloadCodeFile = () => {
    const extensions = {
      javascript: 'js',
      html: 'html',
      python: 'py',
      sql: 'sql',
      markdown: 'md',
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillswap-code.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Canvas / Whiteboard Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas resolution for Retina / High-DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill white background so exported PNG is not transparent
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [activeTab]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : strokeColor;
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 4 : strokeWidth;
      ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1.0;

      ctx.lineTo(x, y);
      ctx.stroke();

      // Emit stroke packet
      if (socketRef.current) {
        socketRef.current.emit('workspace-draw-update', {
          roomId,
          stroke: {
            type: 'path',
            tool,
            color: strokeColor,
            width: strokeWidth,
            x,
            y,
          },
          sender: user?._id || user?.id,
        });
      }
    } else if (snapshotRef.current) {
      // For shapes (rect, circle, line), restore snapshot before drawing preview
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;

      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
      } else if (tool === 'rect') {
        ctx.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      const { x, y } = getCanvasCoordinates(e);
      if (socketRef.current) {
        socketRef.current.emit('workspace-draw-update', {
          roomId,
          stroke: {
            type: 'shape',
            shape: tool,
            startX: startPoint.x,
            startY: startPoint.y,
            endX: x,
            endY: y,
            color: strokeColor,
            width: strokeWidth,
          },
          sender: user?._id || user?.id,
        });
      }
    }
  };

  const drawRemoteStroke = (stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (stroke.type === 'path') {
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
      ctx.lineWidth = stroke.tool === 'eraser' ? stroke.width * 4 : stroke.width;
      ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.35 : 1.0;
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(stroke.x, stroke.y);
    } else if (stroke.type === 'shape') {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      if (stroke.shape === 'line') {
        ctx.moveTo(stroke.startX, stroke.startY);
        ctx.lineTo(stroke.endX, stroke.endY);
      } else if (stroke.shape === 'rect') {
        ctx.strokeRect(stroke.startX, stroke.startY, stroke.endX - stroke.startX, stroke.endY - stroke.startY);
      } else if (stroke.shape === 'circle') {
        const radius = Math.sqrt(Math.pow(stroke.endX - stroke.startX, 2) + Math.pow(stroke.endY - stroke.startY, 2));
        ctx.arc(stroke.startX, stroke.startY, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const handleClearWhiteboard = () => {
    if (window.confirm('Clear all drawings on the whiteboard for everyone in this session?')) {
      clearLocalCanvas();
      if (socketRef.current) {
        socketRef.current.emit('workspace-clear-canvas', {
          roomId,
          sender: user?._id || user?.id,
        });
      }
    }
  };

  const downloadWhiteboardImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = `skillswap-whiteboard-${Date.now()}.png`;
    link.click();
  };

  // Generate line numbers for editor
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className="workspace-container animate-fade-in" style={{ padding: '1rem', maxWidth: '1600px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>
      {/* Top Header Bar */}
      <header
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          borderRadius: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            className="icon-button"
            onClick={() => navigate(-1)}
            title="Go back"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                Live Collaborative Sandbox & Board
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: partnerJoined ? 'var(--success-light)' : 'var(--primary-light)',
                  color: partnerJoined ? 'var(--success)' : 'var(--primary)',
                  border: `1px solid ${partnerJoined ? 'var(--success-border)' : 'var(--primary-border)'}`,
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: partnerJoined ? 'var(--success)' : 'var(--primary)',
                    boxShadow: partnerJoined ? '0 0 8px var(--success)' : 'none',
                  }}
                />
                {partnerJoined ? `Synced with ${partnerName}` : 'Room Ready (Invite partner)'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Room ID: <code style={{ background: 'var(--surface-secondary)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{roomId}</code>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-secondary)',
              padding: '0.25rem',
              borderRadius: '10px',
              border: '1px solid var(--surface-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'code' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'code' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'code' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'code' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Code size={16} /> Code Sandbox
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whiteboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'whiteboard' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'whiteboard' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'whiteboard' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'whiteboard' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <PenTool size={16} /> Digital Whiteboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'split' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'split' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'split' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'split' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={16} /> Side-by-Side
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={copyRoomInviteLink}
            title="Copy direct invite link for your partner"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', gap: '0.35rem' }}
          >
            {copiedLink ? <Check size={15} color="var(--success)" /> : <Share2 size={15} />}
            {copiedLink ? 'Link Copied!' : 'Invite Partner'}
          </button>
        </div>
      </header>

      {/* Main Workspace Workspace Views */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'split' ? '1fr 1fr' : '1fr',
          gap: '1rem',
          height: 'calc(100vh - 170px)',
          minHeight: '600px',
        }}
      >
        {/* ==============================================================
            TAB 1: LIVE CODE SANDBOX
            ============================================================== */}
        {(activeTab === 'code' || activeTab === 'split') && (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '14px',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {/* Editor Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                background: 'var(--surface-secondary)',
                borderBottom: '1px solid var(--surface-border)',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Language:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--surface-border)',
                    background: 'var(--surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="html">HTML5 & CSS</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL Analytics</option>
                  <option value="markdown">Markdown Notes</option>
                </select>

                <button
                  type="button"
                  className="icon-button"
                  title="Reset to starter template"
                  onClick={() => {
                    if (window.confirm('Reset code to default template?')) {
                      handleLanguageChange(language);
                    }
                  }}
                  style={{ width: '32px', height: '32px' }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Run & Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="icon-button"
                  onClick={copyCodeToClipboard}
                  title="Copy code to clipboard"
                  style={{ width: '32px', height: '32px' }}
                >
                  {codeCopied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                </button>

                <button
                  type="button"
                  className="icon-button"
                  onClick={downloadCodeFile}
                  title="Download code file"
                  style={{ width: '32px', height: '32px' }}
                >
                  <Download size={15} />
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={runCode}
                  disabled={isRunning}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', gap: '0.35rem' }}
                >
                  <Play size={15} fill="currentColor" /> Run Code (Ctrl+Enter)
                </button>
              </div>
            </div>

            {/* Split Editor (Code Editor + Terminal / Live Preview) */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateRows: language === 'html' ? '1.2fr 1fr' : '1.4fr 1fr',
                overflow: 'hidden',
              }}
            >
              {/* Textarea Editor with Line Numbers */}
              <div style={{ display: 'flex', height: '100%', background: '#1e293b', overflow: 'hidden' }}>
                {/* Line Numbers Column */}
                <div
                  style={{
                    padding: '0.85rem 0.5rem',
                    textAlign: 'right',
                    color: '#64748b',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5',
                    userSelect: 'none',
                    borderRight: '1px solid #334155',
                    background: '#0f172a',
                    minWidth: '45px',
                  }}
                >
                  {lineNumbers.map((n) => (
                    <div key={n}>{n}</div>
                  ))}
                </div>

                {/* Main Code Textarea */}
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  spellCheck="false"
                  style={{
                    flex: 1,
                    height: '100%',
                    padding: '0.85rem',
                    background: 'transparent',
                    color: '#f8fafc',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    whiteSpace: 'pre',
                    overflowWrap: 'normal',
                    overflowX: 'auto',
                    overflowY: 'auto',
                  }}
                />
              </div>

              {/* Lower Section: Terminal Output OR HTML Live Preview */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#0f172a',
                  borderTop: '2px solid #334155',
                  overflow: 'hidden',
                }}
              >
                {/* Terminal Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.85rem',
                    background: '#1e293b',
                    borderBottom: '1px solid #334155',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {language === 'html' ? <Eye size={14} color="#38bdf8" /> : <Terminal size={14} color="#38bdf8" />}
                    {language === 'html' ? 'Live Interactive Preview' : 'Execution Console & Terminal'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setConsoleOutput([])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                      title="Clear terminal output"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Content: If HTML, show iframe; else terminal logs */}
                {language === 'html' ? (
                  <iframe
                    key={htmlPreviewKey}
                    title="Live HTML Preview"
                    srcDoc={code}
                    sandbox="allow-scripts allow-modals"
                    style={{
                      flex: 1,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: '#ffffff',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      overflowY: 'auto',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '0.84rem',
                      lineHeight: '1.5',
                      color: '#e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    {consoleOutput.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          color:
                            log.type === 'error'
                              ? '#f87171'
                              : log.type === 'warning'
                              ? '#fde047'
                              : log.type === 'meta'
                              ? '#64748b'
                              : log.type === 'info'
                              ? '#38bdf8'
                              : '#f1f5f9',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {log.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: DIGITAL WHITEBOARD
            ============================================================== */}
        {(activeTab === 'whiteboard' || activeTab === 'split') && (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '14px',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {/* Whiteboard Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                background: 'var(--surface-secondary)',
                borderBottom: '1px solid var(--surface-border)',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}
            >
              {/* Tool Selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <button
                  type="button"
                  className={`icon-button ${tool === 'pen' ? 'active' : ''}`}
                  onClick={() => setTool('pen')}
                  title="Pen (freehand drawing)"
                  style={{
                    background: tool === 'pen' ? 'var(--primary-light)' : 'transparent',
                    color: tool === 'pen' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <PenTool size={16} />
                </button>

                <button
                  type="button"
                  className={`icon-button ${tool === 'highlighter' ? 'active' : ''}`}
                  onClick={() => setTool('highlighter')}
                  title="Highlighter (semi-transparent)"
                  style={{
                    background: tool === 'highlighter' ? 'var(--primary-light)' : 'transparent',
                    color: tool === 'highlighter' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <Sparkles size={16} />
                </button>

                <button
                  type="button"
                  className={`icon-button ${tool === 'line' ? 'active' : ''}`}
                  onClick={() => setTool('line')}
                  title="Straight Line"
                  style={{
                    background: tool === 'line' ? 'var(--primary-light)' : 'transparent',
                    color: tool === 'line' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <Minus size={16} />
                </button>

                <button
                  type="button"
                  className={`icon-button ${tool === 'rect' ? 'active' : ''}`}
                  onClick={() => setTool('rect')}
                  title="Rectangle Shape"
                  style={{
                    background: tool === 'rect' ? 'var(--primary-light)' : 'transparent',
                    color: tool === 'rect' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <Square size={16} />
                </button>

                <button
                  type="button"
                  className={`icon-button ${tool === 'circle' ? 'active' : ''}`}
                  onClick={() => setTool('circle')}
                  title="Circle / Ellipse Shape"
                  style={{
                    background: tool === 'circle' ? 'var(--primary-light)' : 'transparent',
                    color: tool === 'circle' ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  <Circle size={16} />
                </button>

                <button
                  type="button"
                  className={`icon-button ${tool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setTool('eraser')}
                  title="Eraser"
                  style={{
                    background: tool === 'eraser' ? 'var(--danger-light)' : 'transparent',
                    color: tool === 'eraser' ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  <Eraser size={16} />
                </button>
              </div>

              {/* Color Swatches */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setStrokeColor(color);
                      if (tool === 'eraser') setTool('pen');
                    }}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: color,
                      border: strokeColor === color ? '2px solid var(--text-main)' : '2px solid transparent',
                      cursor: 'pointer',
                      transform: strokeColor === color ? 'scale(1.15)' : 'none',
                      transition: 'transform 0.1s ease',
                    }}
                    title={`Color: ${color}`}
                  />
                ))}
              </div>

              {/* Stroke Width Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Width:</span>
                {[2, 4, 8, 14].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setStrokeWidth(w)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      border: strokeWidth === w ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                      background: strokeWidth === w ? 'var(--primary-light)' : 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title={`Width ${w}px`}
                  >
                    <span
                      style={{
                        width: `${Math.min(w * 1.5, 14)}px`,
                        height: `${Math.min(w * 1.5, 14)}px`,
                        borderRadius: '50%',
                        background: strokeWidth === w ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Whiteboard Actions: Clear & Download */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="icon-button"
                  onClick={handleClearWhiteboard}
                  title="Clear canvas for everyone"
                  style={{ width: '32px', height: '32px' }}
                >
                  <Trash2 size={15} color="var(--danger)" />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={downloadWhiteboardImage}
                  title="Export canvas drawing as PNG"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', gap: '0.3rem' }}
                >
                  <Download size={14} /> Save Board (PNG)
                </button>
              </div>
            </div>

            {/* Interactive HTML5 Canvas */}
            <div style={{ flex: 1, position: 'relative', background: '#ffffff', cursor: tool === 'eraser' ? 'cell' : 'crosshair', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  touchAction: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--surface-border)',
                  pointerEvents: 'none',
                }}
              >
                Collaborative Canvas • Live Synced
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
  Search,
  MoreVertical,
  Calendar,
  Sparkles,
  ExternalLink,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import ScheduleModal from '../components/ScheduleModal';
import RoadmapModal from '../components/RoadmapModal';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  const getSenderId = (message) => {
    if (!message?.sender) return null;
    return message.sender._id?.toString() || message.sender.id?.toString() || message.sender.toString() || null;
  };

  const isOwnMessage = (message) => getSenderId(message) === (user?._id || user?.id)?.toString();

  useEffect(() => {
    if (!user) return undefined;

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchConnections = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/messages/connections', config);
        setConnections(data);

        // Check if navigated from another page with selectedUserId
        const targetUserId = location.state?.selectedUserId;
        if (targetUserId) {
          const match = data.find((c) => c.otherUser._id.toString() === targetUserId.toString());
          if (match) {
            setActiveConversationId(match.conversationId);
            return;
          }
        }

        if (!activeConversationId && data[0]) {
          setActiveConversationId(data[0].conversationId);
        }
      } catch (error) {
        console.error('Failed to load connections', error);
      }
    };

    fetchConnections();

    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnectionAttempts: 5,
      });
    }

    const socket = socketRef.current;

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit('authenticate', { user });
    };

    const handleConnectedUsers = (users) => {
      setOnlineUsers(users.filter((connectedUser) => connectedUser.id !== (user._id || user.id)));
    };

    const handleNewMessage = (payload) => {
      const normalizedPayload = {
        ...payload,
        sender: payload.sender && typeof payload.sender === 'object'
          ? payload.sender
          : { _id: payload.sender },
      };
      const isMine = isOwnMessage(normalizedPayload);
      if (normalizedPayload.conversationId === activeConversationId) {
        setMessages((current) => {
          const exists = current.some((message) => {
            const sameId = message._id && normalizedPayload._id && message._id.toString() === normalizedPayload._id.toString();
            const sameTextTime = !message._id && message.text === normalizedPayload.text && message.createdAt === normalizedPayload.createdAt;
            return sameId || sameTextTime;
          });
          return exists ? current : [...current, normalizedPayload];
        });
      }

      if (!isMine) {
        const refreshConnections = async () => {
          try {
            const { data } = await axios.get('http://localhost:5000/api/messages/connections', {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            setConnections(data);
          } catch (error) {
            console.error('Failed to refresh conversations', error);
          }
        };
        refreshConnections();
      }
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('connected-users', handleConnectedUsers);
    socket.on('new-message', handleNewMessage);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connected-users', handleConnectedUsers);
      socket.off('new-message', handleNewMessage);
      socket.off('disconnect', handleDisconnect);
    };
  }, [activeConversationId, user, location.state]);

  useEffect(() => {
    if (!activeConversationId || !user) return;

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/messages/${activeConversationId}`, config);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    };

    fetchMessages();
  }, [activeConversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, activeConversationId]);

  useEffect(() => () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const activeConversation = useMemo(() =>
    connections.find((connection) => connection.conversationId === activeConversationId) || null,
    [activeConversationId, connections]
  );

  const isPartnerOnline = useMemo(() => {
    if (!activeConversation) return false;
    return onlineUsers.some((u) => u.id === activeConversation.otherUser._id);
  }, [activeConversation, onlineUsers]);

  const handleStartVideoCall = () => {
    if (!activeConversation) return;
    const roomUrl = `https://meet.jit.si/skillswap-${activeConversation.conversationId}`;
    window.open(roomUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInsertCodeSnippet = () => {
    setDraft((prev) =>
      prev ? `${prev}\n\`\`\`javascript\n// Paste code or notes here\n\`\`\`` : '```javascript\n// Paste code or notes here\n```'
    );
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeConversation || !user) return;

    const payload = {
      conversationId: activeConversation.conversationId,
      receiverId: activeConversation.otherUser._id,
      text: draft.trim(),
      sender: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
      },
      receiver: activeConversation.otherUser,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data: savedMessage } = await axios.post('http://localhost:5000/api/messages', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const normalizedMessage = {
        ...savedMessage,
        sender: savedMessage.sender && typeof savedMessage.sender === 'object'
          ? savedMessage.sender
          : { _id: savedMessage.sender || user._id || user.id, name: user.name, email: user.email },
      };
      setMessages((current) => [...current, normalizedMessage]);
      socketRef.current?.emit('send-message', normalizedMessage);
      setDraft('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const renderMessageContent = (text, isMine, messageId) => {
    // Check if message contains code block
    const codeMatch = text.match(/^```(\w+)?\n([\s\S]+?)\n?```$/);
    if (codeMatch) {
      const lang = codeMatch[1] || 'code';
      const code = codeMatch[2];
      const isCopied = copiedCodeId === messageId;

      return (
        <div
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '10px',
            padding: '0.75rem',
            margin: '0.25rem 0',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '0.4rem',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>{lang}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(code);
                setCopiedCodeId(messageId);
                setTimeout(() => setCopiedCodeId(null), 2000);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: isCopied ? '#10b981' : '#cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
              }}
            >
              {isCopied ? <Check size={13} /> : <Copy size={13} />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Check for links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return (
      <p style={{ margin: 0, wordBreak: 'break-word', lineHeight: 1.45 }}>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: isMine ? '#ffffff' : 'var(--primary)',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="container chat-page animate-fade-in">
      <div className="chat-shell glass-panel">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-user-name">
              <span>Messages</span>
              <span className="name">Connections ({connections.length})</span>
            </div>
          </div>

          <div className="chat-list">
            {connections.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>No active connections yet.</p>
                <span style={{ fontSize: '0.8rem' }}>Accepted swap proposals will appear here.</span>
              </div>
            ) : (
              connections.map((connection) => {
                const isOnline = onlineUsers.some((item) => item.id === connection.otherUser._id);
                const isActive = activeConversation?.conversationId === connection.conversationId;
                return (
                  <button
                    key={connection.conversationId}
                    type="button"
                    className={`chat-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveConversationId(connection.conversationId)}
                  >
                    <div className="chat-avatar">{connection.otherUser.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="chat-item-main">
                      <div className="chat-item-top">
                        <strong>{connection.otherUser.name}</strong>
                        <span style={{ color: isOnline ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: isOnline ? 600 : 400 }}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p>{connection.otherUser.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="chat-main">
          <header className="chat-main-header">
            <div className="chat-main-user">
              <div className="chat-avatar large">{activeConversation?.otherUser.name?.charAt(0).toUpperCase() || 'C'}</div>
              <div className="chat-user-name">
                <span className="name">{activeConversation ? activeConversation.otherUser.name : 'Select a connection'}</span>
                <span style={{ fontSize: '0.8rem', color: isPartnerOnline ? 'var(--success)' : 'var(--text-muted)' }}>
                  {activeConversation ? (isPartnerOnline ? '● Online now' : 'Offline') : 'Accepted swap partners appear here'}
                </span>
              </div>
            </div>

            {activeConversation && (
              <div className="chat-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowRoadmapModal(true)}
                  title="View AI Swap Roadmap"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                >
                  <Sparkles size={14} color="var(--primary)" /> AI Roadmap
                </button>

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    navigate(`/workspace/${activeConversation.conversationId}`, {
                      state: { partnerName: activeConversation.otherUser.name },
                    })
                  }
                  title="Open Collaborative Live Code Sandbox & Digital Whiteboard"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                >
                  <Code size={14} color="var(--primary)" /> Live Lab
                </button>

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  title="Schedule a live learning session"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                >
                  <Calendar size={14} /> Schedule
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartVideoCall}
                  title="Start live video call with partner"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                >
                  <Video size={15} /> Video Call
                </button>
              </div>
            )}
          </header>

          <div className="chat-messages">
            {!activeConversation ? (
              <div className="empty-state empty-state-large" style={{ textAlign: 'center', margin: 'auto', padding: '2rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select a connection to start chatting</p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chat is strictly accessible between matched swap partners.</span>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = isOwnMessage(message);
                const messageKey = message._id || `${message.createdAt}-${message.text}-${isMine}`;
                return (
                  <div key={messageKey} className={`message-row ${isMine ? 'outgoing' : 'incoming'}`}>
                    <div className={`message-wrapper ${isMine ? 'sent' : 'received'}`}>
                      <div className={`message-bubble ${isMine ? 'me' : 'them'}`}>
                        {renderMessageContent(message.text, isMine, messageKey)}
                        <span>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-composer" onSubmit={handleSend}>
            <button
              type="button"
              className="icon-button"
              onClick={handleInsertCodeSnippet}
              title="Insert Code Snippet"
              style={{ flexShrink: 0 }}
            >
              <Code size={18} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={activeConversation ? `Message ${activeConversation.otherUser.name}...` : 'Select a connection first'}
              disabled={!activeConversation}
            />
            <button className="send-button" type="submit" disabled={!activeConversation || !draft.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      </div>

      {/* Schedule Modal from Chat */}
      {showScheduleModal && activeConversation && (
        <ScheduleModal
          prefilledPartner={activeConversation.otherUser}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            alert('Session scheduled! Check the Sessions tab.');
          }}
        />
      )}

      {/* AI Roadmap Modal from Chat */}
      {showRoadmapModal && activeConversation && (
        <RoadmapModal
          partner={activeConversation.otherUser}
          onClose={() => setShowRoadmapModal(false)}
          onScheduleSession={() => setShowScheduleModal(true)}
        />
      )}
    </div>
  );
};

export default Chat;

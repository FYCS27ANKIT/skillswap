import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, Sparkles, Loader2 } from 'lucide-react';

const ENDPOINT = "http://localhost:5000";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [workspaceContent, setWorkspaceContent] = useState('');
  const saveTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    if (user) {
      socketRef.current = io(ENDPOINT);
      socketRef.current.emit("setup", user._id);
      socketRef.current.on("connected", () => setSocketConnected(true));
      
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  // Handle receiving messages
  useEffect(() => {
    if (!socketRef.current) return;
    
    const handleMessageReceived = (newMessageReceived) => {
      // If we are currently chatting with the sender, add to messages array
      if (selectedUser && selectedUser._id === newMessageReceived.sender) {
        setMessages((prev) => [...prev, newMessageReceived]);
        scrollToBottom();
      } else {
        // Here we could implement a notification badge update
        console.log("Message received from", newMessageReceived.sender);
      }
    };

    socketRef.current.on("message received", handleMessageReceived);

    return () => {
        socketRef.current.off("message received", handleMessageReceived);
    };
  }, [selectedUser]);

  // Fetch Conversations List
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/messages/conversations/list', config);
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, [user.token]);

  // Fetch specific conversation messages and setup workspace room
  const fetchMessages = async (chatUser) => {
    if (!chatUser) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/messages/${chatUser._id}`, config);
      setMessages(data);
      setSelectedUser(chatUser);
      setShowWorkspace(false); // Reset workspace view on user change
    } catch (err) {
      console.error(err);
    }
  };

  // Setup Workspace syncing when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !socketRef.current) return;

    const roomId = [user._id, selectedUser._id].sort().join('-');
    
    // Fetch current workspace content
    const fetchWorkspace = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/workspace/${roomId}`, config);
        setWorkspaceContent(data.content);
      } catch (err) {
        console.error("Error fetching workspace content:", err);
      }
    };
    fetchWorkspace();

    // Join room
    socketRef.current.emit('workspace:join', roomId);

    // Setup socket listener
    const handleWorkspaceUpdate = (updatedContent) => {
      setWorkspaceContent(updatedContent);
    };

    socketRef.current.on('workspace:updated', handleWorkspaceUpdate);

    return () => {
      socketRef.current.off('workspace:updated', handleWorkspaceUpdate);
    };
  }, [selectedUser, socketConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newMessage.trim() || !selectedUser) return;

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        const payload = {
          receiverId: selectedUser._id,
          content: newMessage
        };
        const { data } = await axios.post('http://localhost:5000/api/messages', payload, config);
        
        setNewMessage("");
        setMessages([...messages, data]);
        socketRef.current.emit("new message", data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const generateSyllabus = async () => {
    if (!selectedUser) return;
    setAiLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const offeredByMe = user.skillsOffered[0] || "my skills";
      const offeredByThem = selectedUser.skillsOffered?.[0] || "their skills";

      const { data } = await axios.post('http://localhost:5000/api/ai/syllabus', {
        offeredSkill: offeredByMe,
        wantedSkill: offeredByThem,
        otherUserName: selectedUser.name
      }, config);

      const messagePayload = {
        receiverId: selectedUser._id,
        content: `🤖 **AI Generated Learning Path:**\n\n${data.syllabus}`
      };
      
      const { data: savedMsg } = await axios.post('http://localhost:5000/api/messages', messagePayload, config);
      
      setMessages([...messages, savedMsg]);
      socketRef.current.emit("new message", savedMsg);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to generate AI syllabus. Please make sure GEMINI_API_KEY is set.");
    } finally {
      setAiLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    if (content.startsWith('🤖 **AI Generated Learning Path:**')) {
      const parts = content.split('\n');
      return (
        <div className="ai-syllabus-card animate-fade-in" style={{ width: '100%' }}>
          <div className="ai-badge"><Sparkles size={12} /> AI Suggested</div>
          {parts.map((part, index) => {
            const cleanPart = part.replace('🤖 **AI Generated Learning Path:**', '').trim();
            if (!cleanPart && index === 0) return null;
            
            if (part.startsWith('##')) return <h2 key={index}>{part.replace('##', '').trim()}</h2>;
            if (part.startsWith('###')) return <h3 key={index}>{part.replace('###', '').trim()}</h3>;
            if (part.startsWith('-')) return <li key={index}>{part.replace('-', '').trim()}</li>;
            if (part.trim() === '') return <div key={index} style={{ height: '0.5rem' }} />;
            return <p key={index} style={{ margin: '0.5rem 0' }}>{part.replace(/\*\*/g, '')}</p>;
          })}
        </div>
      );
    }
    return content;
  };

  const handleWorkspaceChange = (e) => {
    const content = e.target.value;
    setWorkspaceContent(content);

    if (!selectedUser || !socketRef.current) return;
    const roomId = [user._id, selectedUser._id].sort().join('-');

    // Emit real-time update via Socket.io
    socketRef.current.emit('workspace:change', { roomId, content });

    // Debounced database save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`http://localhost:5000/api/workspace/${roomId}`, { content }, config);
        console.log("Workspace autosaved to MongoDB.");
      } catch (err) {
        console.error("Autosave error:", err);
      }
    }, 1000); // 1-second debounce
  };

  return (
    <div className="container animate-fade-in" style={{ height: '80vh', display: 'flex', gap: '1.5rem', paddingTop: '1.5rem' }}>
      {/* Conversations List Sidebar */}
      <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Conversations</h3>
        {conversations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No conversations yet.</p>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((c) => (
              <div 
                key={c._id} 
                onClick={() => fetchMessages(c)}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  marginBottom: '0.5rem',
                  background: selectedUser?._id === c._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: selectedUser?._id === c._id ? 'white' : 'var(--text-main)',
                  transition: 'background 0.2s'
                }}>
                <strong>{c.name}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {!selectedUser ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <p>Select a user to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>{selectedUser.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn ${showWorkspace ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  onClick={() => setShowWorkspace(!showWorkspace)}
                >
                  📝 Shared Notes
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={generateSyllabus}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  Generate Learning Path
                </button>
              </div>
            </div>
            
            {/* Messages container */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m) => (
                <div key={m._id} style={{
                  maxWidth: '70%',
                  padding: m.content.startsWith('🤖') ? '0' : '0.8rem 1.2rem',
                  borderRadius: '16px',
                  alignSelf: m.sender === user._id ? 'flex-end' : 'flex-start',
                  background: m.content.startsWith('🤖') ? 'transparent' : (m.sender === user._id ? 'var(--primary)' : 'var(--surface-border)'),
                  color: m.sender === user._id ? 'white' : 'var(--text-main)',
                  boxShadow: m.content.startsWith('🤖') ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  {renderMessageContent(m.content)}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                className="form-control" 
                style={{ flex: 1, borderRadius: '9999px', padding: '0.8rem 1.5rem' }} 
                placeholder="Type your message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={sendMessage}
              />
              <button className="btn btn-primary" style={{ borderRadius: '50%', padding: '0.8rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={sendMessage}>
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Workspace Panel */}
      {selectedUser && showWorkspace && (
        <div className="glass-panel animate-slide-in" style={{ width: '380px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📝 Collaborative Workspace</h3>
            <button className="btn" style={{ background: 'transparent', padding: '0.2rem', color: 'var(--text-muted)' }} onClick={() => setShowWorkspace(false)}>✕</button>
          </div>
          <textarea
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              padding: '1rem',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
            }}
            value={workspaceContent}
            onChange={handleWorkspaceChange}
            placeholder="Start typing collaborative notes here... Syncs in real-time with the other user!"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
            Autosaved to MongoDB
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

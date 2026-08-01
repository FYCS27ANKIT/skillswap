import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { Paperclip, Phone, Send, Smile, Video, Search, MoreVertical } from 'lucide-react';



const Chat = () => {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
  }, [activeConversationId, user]);

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
    if (!activeConversationId || !connections.length) return;
    const matching = connections.find((connection) => connection.conversationId === activeConversationId);
    if (!matching) {
      setActiveConversationId(connections[0]?.conversationId || null);
    }
  }, [activeConversationId, connections]);

  useEffect(() => {
    if (!user) return;

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const loadInitialConversation = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/messages/connections', config);
        setConnections(data);
        if (data[0]) {
          setActiveConversationId(data[0].conversationId);
        }
      } catch (error) {
        console.error('Failed to initialize conversation list', error);
      }
    };

    loadInitialConversation();
  }, [user]);

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

  return (
    <div className="container chat-page">
      <div className="chat-shell glass-panel">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div>
              <p className="eyebrow">Messages</p>
              <h2>Connections</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Search conversations">
              <Search size={18} />
            </button>
          </div>

          <div className="chat-list">
            {connections.length === 0 ? (
              <div className="empty-state">
                <p>No accepted swap connections yet.</p>
                <span>Start a swap request to begin chatting.</span>
              </div>
            ) : (
              connections.map((connection) => {
                const isOnline = onlineUsers.some((item) => item.id === connection.otherUser._id);
                return (
                  <button
                    key={connection.conversationId}
                    type="button"
                    className={`chat-item ${activeConversation?.conversationId === connection.conversationId ? 'active' : ''}`}
                    onClick={() => setActiveConversationId(connection.conversationId)}
                  >
                    <div className="chat-avatar">{connection.otherUser.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="chat-item-main">
                      <div className="chat-item-top">
                        <strong>{connection.otherUser.name}</strong>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
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
              <div>
                <h3>{activeConversation ? activeConversation.otherUser.name : 'Select a connection'}</h3>
                <p>{activeConversation ? 'Swap chat ready' : 'Accepted swap partners appear here'}</p>
              </div>
            </div>
            <div className="chat-actions">
              <button className="icon-button" type="button" aria-label="Call">
                <Phone size={18} />
              </button>
              <button className="icon-button" type="button" aria-label="Video call">
                <Video size={18} />
              </button>
              <button className="icon-button" type="button" aria-label="More options">
                <MoreVertical size={18} />
              </button>
            </div>
          </header>

          <div className="chat-messages">
            {!activeConversation ? (
              <div className="empty-state empty-state-large">
                <p>Select a matched user to open the conversation.</p>
                <span>Only accepted swap requests are shown here.</span>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = isOwnMessage(message);
                const messageKey = message._id || `${message.createdAt}-${message.text}-${isMine}`;
                return (
                  <div key={messageKey} className={`message-row ${isMine ? 'outgoing' : 'incoming'}`}>
                    <div className={`message-wrapper ${isMine ? 'sent' : 'received'}`}>
                      <div className={`message-bubble ${isMine ? 'me' : 'them'}`}>
                        <p>{message.text}</p>
                        <span>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}            <div ref={messagesEndRef} />          </div>

          <form className="chat-composer" onSubmit={handleSend}>
            <button className="icon-button" type="button" aria-label="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={activeConversation ? 'Write a message...' : 'Select a connection first'}
              disabled={!activeConversation}
            />
            <button className="icon-button" type="button" aria-label="Add emoji">
              <Smile size={18} />
            </button>
            <button className="send-button" type="submit" disabled={!activeConversation || !draft.trim()}>
              <Send size={18} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Chat;


import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { type AdminSupportInboxRow } from '../../../services/admin.service';
import { messageService, type MessageDto } from '../../../services/message.service';
import AdminSidebar from '../components/AdminSidebar';
import './adminDashboard.css';
import './AdminSupportInbox.css';

const AdminSupportInbox = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<AdminSupportInboxRow[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [sort, setSort] = useState<'oldest' | 'newest'>('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    const adminUser = (() => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return null;
            return JSON.parse(raw) as { id?: string; role?: string };
        } catch {
            return null;
        }
    })();
    const adminId = adminUser?.id;

    const hasValidAdminSession = () => {
        const token = localStorage.getItem('accessToken');
        const rawUser = localStorage.getItem('user');
        if (!token || !rawUser) return false;
        try {
            const parsed = JSON.parse(rawUser) as { role?: string };
            return parsed.role === 'ADMIN';
        } catch {
            return false;
        }
    };

    const loadInbox = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!hasValidAdminSession()) {
                navigate('/admin/auth/login', { replace: true });
                return;
            }
            const silent = opts?.silent === true;
            if (!silent) {
                setLoading(true);
                setError(null);
            }
            try {
                const data = await adminService.getSupportInbox({ filter, sort });
                setRows(data);
            } catch {
                if (!silent) {
                    setError('Failed to load support inbox');
                }
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [filter, sort, navigate]
    );

    useEffect(() => {
        void loadInbox();
    }, [loadInbox]);

    const openThread = async (conversationId: string) => {
        setSelectedId(conversationId);
        setMessagesLoading(true);
        try {
            const res = await messageService.getConversationMessages(conversationId, { page: 1, limit: 100 });
            setMessages(res.data);
            await messageService.markConversationRead(conversationId);
            await loadInbox({ silent: true });
        } catch {
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    const sendReply = async () => {
        const text = reply.trim();
        if (!text || !selectedId || sending) return;
        setSending(true);
        try {
            const res = await messageService.sendMessage(selectedId, text);
            setReply('');
            setMessages((prev) => [...prev, res.data]);
            await loadInbox({ silent: true });
        } finally {
            setSending(false);
        }
    };

    const selectedRow = rows.find((r) => r.conversationId === selectedId);

    return (
        <div className="admin-shell admin-support-shell">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Help Center inbox</h1>
                        <p>Conversations from landlords and tenants who contacted support.</p>
                    </div>
                </header>

                <div className="admin-support-toolbar">
                    <label>
                        <span>Status</span>
                        <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}>
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                        </select>
                    </label>
                    <label>
                        <span>Sort by date</span>
                        <select value={sort} onChange={(e) => setSort(e.target.value as 'oldest' | 'newest')}>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                        </select>
                    </label>
                </div>

                {loading ? (
                    <div className="admin-state">Loading conversations…</div>
                ) : error ? (
                    <div className="admin-state">{error}</div>
                ) : (
                    <div className="admin-support-grid">
                        <section className="admin-support-list panel">
                            <div className="panel-head">
                                <h3>Users ({rows.length})</h3>
                            </div>
                            <ul className="admin-support-thread-list">
                                {rows.length === 0 ? (
                                    <li className="admin-support-empty">No conversations yet.</li>
                                ) : (
                                    rows.map((row) => (
                                        <li key={row.conversationId}>
                                            <button
                                                type="button"
                                                className={`admin-support-thread-btn ${selectedId === row.conversationId ? 'active' : ''}`}
                                                onClick={() => void openThread(row.conversationId)}
                                            >
                                                <span className="admin-support-thread-name">
                                                    {row.user.firstName} {row.user.lastName}
                                                    {row.unreadFromUser > 0 ? (
                                                        <em className="admin-support-unread-badge">{row.unreadFromUser}</em>
                                                    ) : null}
                                                </span>
                                                <span className="admin-support-thread-meta">
                                                    {row.user.role} · {row.user.email}
                                                </span>
                                                {row.lastMessagePreview ? (
                                                    <span className="admin-support-thread-preview">{row.lastMessagePreview}</span>
                                                ) : null}
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>

                        <section className="admin-support-detail panel">
                            <div className="panel-head">
                                <h3>
                                    {selectedRow
                                        ? `${selectedRow.user.firstName} ${selectedRow.user.lastName}`
                                        : 'Select a conversation'}
                                </h3>
                            </div>
                            {!selectedId ? (
                                <div className="admin-support-placeholder">Choose a user on the left to view messages.</div>
                            ) : messagesLoading ? (
                                <div className="admin-support-placeholder">Loading messages…</div>
                            ) : (
                                <>
                                    <div className="admin-support-msg-scroll">
                                        {messages.map((m) => {
                                            const mine = adminId && m.senderId === adminId;
                                            return (
                                                <div key={m.id} className={`admin-support-msg ${mine ? 'admin-support-msg--admin' : 'admin-support-msg--user'}`}>
                                                    <p>{m.body}</p>
                                                    <time dateTime={m.createdAt}>
                                                        {new Date(m.createdAt).toLocaleString()}
                                                    </time>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="admin-support-reply">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Reply as HOMi Support…"
                                            rows={3}
                                            disabled={sending}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    void sendReply();
                                                }
                                            }}
                                        />
                                        <button type="button" className="admin-support-send-btn" disabled={sending || !reply.trim()} onClick={() => void sendReply()}>
                                            {sending ? 'Sending…' : 'Send reply'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminSupportInbox;

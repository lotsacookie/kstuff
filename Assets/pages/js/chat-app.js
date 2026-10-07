const BACKEND_URL = "https://cdn.jsdelivr.net/gh/lotsacookie/Dnekcabtset@latest/chat-backend.svg";
let currentUser = null, backendReady = false, currentActiveRawId = null;
let backendPort = null, activeConversations = [], activeGroups = [], userProfileMap = {}, cachedUsersList = [];
let lastMessageDataString = "", lastSidebarState = "", lastRenderedChatId = null;
let currentSearchQuery = "", isGroupMode = false, isAddMemberMode = false, selectedUsersForGroup = new Set();
let groupNames = {}, groupMembers = {}, leftGroups = {};
let messageQueue = [];
let isSendingMessage = false;
let unreadChats = [];
let currentRenderToken = null;
let justOpened = false;
let mediaWatcher = { token: null, timeoutId: null, remaining: 0, listeners: [] };
let pendingDeletions = new Set();
let backendConversationList = [];

const MAX_STAGGER_MS = 80;
const STAGGER_STEP = 12;
const FALLBACK_SCROLL_THRESHOLD = 150;
const CLUSTER_GAP_MS = 600000;
const fallbackAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%23888' d='M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-61.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,133.52,0Z'/%3E%3C/svg%3E";
const groupFallbackAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M23 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E";

const escapeHtml = text => text ? String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])) : "";

function xorEncode(str, key = 42) {
    if (!str || typeof str !== 'string') return '';
    let hexStr = '';
    for (let i = 0; i < str.length; i++) { 
        let hex = (str.charCodeAt(i) ^ key).toString(16); 
        hexStr += (hex.length === 1 ? '0' + hex : hex); 
    }
    return hexStr;
}

function xorDecode(hexStr, key = 42) {
    if (!hexStr || typeof hexStr !== 'string' || !/^[0-9a-fA-F]+$/.test(hexStr) || hexStr.length % 2 !== 0) return hexStr || '';
    let str = '';
    for (let i = 0; i < hexStr.length; i += 2) str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16) ^ key);
    return str;
}

const isMediaURL = (str) => {
    if (typeof str !== 'string') return { type: 'none' };
    const clean = str.trim();
    if (/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$|^data:image\//i.test(clean)) return { type: 'image' };
    if (/^https?:\/\/.*\.(mp3|wav|ogg|m4a)(\?.*)?$|^data:audio\//i.test(clean)) return { type: 'audio' };
    if (/^https?:\/\/.*\.(mp4|webm|ogg|mov)(\?.*)?$|^data:video\//i.test(clean)) return { type: 'video' };
    return { type: 'none' };
};

function deduplicateMessages(msgArray) {
    if (!Array.isArray(msgArray)) return [];
    const result = [];
    for (const m of msgArray) {
        if (!m || !m.sender || !m.message) continue;
        const msgText = xorDecode(m.message);
        const isDuplicate = result.some(existing => {
            const existingText = xorDecode(existing.message);
            return existing.sender.toLowerCase() === m.sender.toLowerCase() && 
                   existingText === msgText && 
                   Math.abs(new Date(m.timestamp).getTime() - new Date(existing.timestamp).getTime()) < 5000;
        });
        if (!isDuplicate) result.push(m);
    }
    return result;
}

function cleanupOrphanedCaches() {
    if (!currentUser) return;
    const allKeys = Object.keys(localStorage);
    const validConversationIds = new Set([...activeConversations, ...activeGroups]);
    
    for (const key of allKeys) {
        if (key.startsWith('chat_msgs_')) {
            const convId = key.replace('chat_msgs_', '');
            if (!validConversationIds.has(convId)) {
                localStorage.removeItem(key);
            }
        }
    }
    
    for (const gId of Object.keys(groupNames)) {
        if (!validConversationIds.has(gId)) delete groupNames[gId];
    }
    for (const gId of Object.keys(groupMembers)) {
        if (!validConversationIds.has(gId)) delete groupMembers[gId];
    }
    
    localStorage.setItem('chat_group_names', JSON.stringify(groupNames));
    localStorage.setItem('chat_group_members', JSON.stringify(groupMembers));
}

function loadLocalData() {
    try {
        const unreadData = localStorage.getItem('chat_unread');
        if (unreadData) unreadChats = JSON.parse(unreadData);
        
        const localUsers = JSON.parse(localStorage.getItem('chat_users_list'));
        if (localUsers && Array.isArray(localUsers)) {
            cachedUsersList = localUsers;
            cachedUsersList.forEach(u => { 
                if (u && u.username) userProfileMap[u.username.toLowerCase()] = u.profilePicture || fallbackAvatar; 
            });
        }
        
        groupNames = JSON.parse(localStorage.getItem('chat_group_names')) || {};
        groupMembers = JSON.parse(localStorage.getItem('chat_group_members')) || {};
        leftGroups = JSON.parse(localStorage.getItem('chat_left_groups')) || {};
        
        if (currentUser) {
            const localConvs = JSON.parse(localStorage.getItem(`chat_convs_${currentUser}`));
            if (localConvs && Array.isArray(localConvs)) activeConversations = localConvs.map(encoded => xorDecode(encoded)).filter(Boolean);
            
            const localGroups = JSON.parse(localStorage.getItem(`chat_groups_${currentUser}`));
            if (localGroups && Array.isArray(localGroups)) {
                activeGroups = localGroups.filter(gId => !leftGroups[gId]);
            }
            
            cleanupOrphanedCaches();
            renderSidebarList();
        }
    } catch (e) {}
}

async function initBackendIframe() {
    const iframe = document.getElementById('backend-frame');
    try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const html = await res.text();
        iframe.onload = () => {
            const channel = new MessageChannel();
            backendPort = channel.port1;
            backendPort.onmessage = e => handleBackendMessage(e.data);
            iframe.contentWindow.postMessage({ type: 'init_cable' }, '*', [channel.port2]);
        };
        iframe.srcdoc = html;
    } catch (err) {}
}

initBackendIframe();

window.addEventListener("message", e => {
    if (e.data?.type === 'set_user' && e.data.username) {
        currentUser = e.data.username.trim().toLowerCase();
        loadLocalData();
        if (backendReady) { 
            backendPort.postMessage({ type: 'get-users' }); 
            backendPort.postMessage({ type: 'get-convs', currentUser: currentUser }); 
        }
    }
});

window.addEventListener('storage', (e) => {
    if (!currentUser) return;
    
    if (e.key === `chat_convs_${currentUser}`) {
        try {
            const stored = JSON.parse(e.newValue || '[]');
            activeConversations = stored.map(enc => xorDecode(enc)).filter(Boolean);
        } catch (err) {}
    }
    if (e.key === `chat_groups_${currentUser}`) {
        try {
            const stored = JSON.parse(e.newValue || '[]');
            activeGroups = stored.filter(gId => !leftGroups[gId]);
        } catch (err) {}
    }
    if (e.key === 'chat_group_names') {
        try { groupNames = JSON.parse(e.newValue || '{}'); } catch (err) {}
    }
    if (e.key === 'chat_group_members') {
        try { groupMembers = JSON.parse(e.newValue || '{}'); } catch (err) {}
    }
    if (e.key === 'chat_left_groups') {
        try {
            leftGroups = JSON.parse(e.newValue || '{}');
            activeGroups = activeGroups.filter(gId => !leftGroups[gId]);
        } catch (err) {}
    }
    if (e.key === 'chat_unread') {
        try { unreadChats = JSON.parse(e.newValue || '[]'); } catch (err) {}
    }
    
    renderSidebarList();
});

function processMessageQueue() {
    if (isSendingMessage || messageQueue.length === 0 || !backendReady) return;
    isSendingMessage = true;
    backendPort.postMessage(messageQueue.shift());
}

function cleanupDeletedChat(deletedRawId) {
    localStorage.removeItem(`chat_msgs_${deletedRawId}`);
    
    activeConversations = activeConversations.filter(id => id !== deletedRawId);
    activeGroups = activeGroups.filter(id => id !== deletedRawId);
    unreadChats = unreadChats.filter(id => id !== deletedRawId);
    
    localStorage.setItem('chat_unread', JSON.stringify(unreadChats));
    if (currentUser) {
        localStorage.setItem(`chat_convs_${currentUser}`, JSON.stringify(activeConversations.map(c => xorEncode(c))));
        localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
    }
    
    if (currentActiveRawId === deletedRawId) {
        currentActiveRawId = null; 
        lastRenderedChatId = null; 
        lastMessageDataString = "";
        document.getElementById('header-username').innerText = 'Select a chat';
        const headerAvatar = document.getElementById('header-avatar-icon');
        headerAvatar.style.display = 'none';
        document.getElementById('delete-chat-btn').style.display = 'none';
        document.getElementById('leave-group-btn').style.display = 'none';
        const addBtn = document.getElementById('add-member-btn');
        if (addBtn) addBtn.style.display = 'none';
        document.getElementById('chat-container').innerHTML = '';
        document.getElementById('user-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
    }
    
    renderSidebarList();
}

function handleBackendMessage(data) {
    if (data.type === 'ready') {
        backendReady = true;
        backendPort.postMessage({ type: 'get-users' });
        if (currentUser) backendPort.postMessage({ type: 'get-convs', currentUser: currentUser });
        processMessageQueue();
    } 
    else if (data.type === 'get-users' && data.success) {
        cachedUsersList = Array.isArray(data.payload) ? data.payload : [];
        localStorage.setItem('chat_users_list', JSON.stringify(cachedUsersList));
        cachedUsersList.forEach(u => { 
            if (u && u.username) userProfileMap[u.username.toLowerCase()] = u.profilePicture || fallbackAvatar; 
        });
        renderSidebarList();
        if (document.getElementById('modal-overlay').classList.contains('active')) populateUserDirectoryModal(cachedUsersList);
    } 
    else if (data.type === 'get-convs' && data.success) {
        const safeConvs = Array.isArray(data.payload) ? data.payload : [];
        backendConversationList = safeConvs;
        
        const backendGroups = [];
        const filteredConvs = [];
        
        safeConvs.forEach(encoded => {
            const decoded = xorDecode(encoded);
            const isGroup = encoded.startsWith('grp-') || decoded.startsWith('grp-');
            const groupId = isGroup ? (encoded.startsWith('grp-') ? encoded : decoded) : null;
            
            if (groupId) {
                if (!leftGroups[groupId] && !pendingDeletions.has(groupId)) {
                    backendGroups.push(groupId);
                }
            } else {
                filteredConvs.push(decoded);
            }
        });
        
        activeGroups = [...new Set([...activeGroups, ...backendGroups])].filter(gId => !leftGroups[gId]);
        activeConversations = filteredConvs.filter(Boolean);
        
        if (currentUser) {
            localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
            localStorage.setItem(`chat_convs_${currentUser}`, JSON.stringify(activeConversations.map(c => xorEncode(c))));
        }
        
        if (currentActiveRawId && !currentActiveRawId.startsWith('grp-') && !activeConversations.includes(currentActiveRawId)) {
            cleanupDeletedChat(currentActiveRawId);
        }
        
        renderSidebarList();
    } 
    else if (data.type === 'create-conv' && data.success) {
        const convId = data.payload?.rawId;
        if (convId && !activeConversations.includes(convId)) {
            activeConversations.push(convId);
            if (currentUser) {
                localStorage.setItem(`chat_convs_${currentUser}`, JSON.stringify(activeConversations.map(c => xorEncode(c))));
            }
        }
        renderSidebarList();
        if (currentActiveRawId) fetchMessages(currentActiveRawId);
    } 
    else if (data.type === 'delete-convs' && data.success) {
        const deletedId = xorDecode(data.encodedKey);
        pendingDeletions.delete(deletedId);
        cleanupDeletedChat(deletedId);
    } 
    else if ((data.type === 'get-messages' || data.type === 'get-group-chat') && data.success) {
        document.getElementById('section-loader').classList.add('hidden');
        let chatId = data.id || data.groupId || data.chatId;
        const remoteMessages = deduplicateMessages(data.payload || []);
        
        if (data.type === 'get-group-chat') {
            if (!data.success && data.reason === 'not_member') {
                activeGroups = activeGroups.filter(id => id !== chatId);
                leftGroups[chatId] = true;
                if (currentUser) {
                    localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
                    localStorage.setItem('chat_left_groups', JSON.stringify(leftGroups));
                }
                cleanupDeletedChat(chatId);
                return;
            }
            if (data.members && Array.isArray(data.members) && chatId) {
                groupMembers[chatId] = data.members.map(m => m.toLowerCase());
                localStorage.setItem('chat_group_members', JSON.stringify(groupMembers));
            }
            if (data.groupName && chatId) {
                groupNames[chatId] = data.groupName;
                localStorage.setItem('chat_group_names', JSON.stringify(groupNames));
                renderSidebarList();
            }
        }
        
        if (!chatId) {
            if (remoteMessages.length === 0) return;
            if (data.type === 'get-group-chat') {
                if (currentActiveRawId && currentActiveRawId.startsWith('grp-')) chatId = currentActiveRawId;
                else return;
            } else {
                const senders = [...new Set(remoteMessages.map(m => m.sender.toLowerCase()))];
                const otherUser = senders.find(s => s !== currentUser) || currentUser;
                chatId = [currentUser, otherUser].sort().join('-');
            }
        }
        
        let cached = [];
        try { cached = JSON.parse(localStorage.getItem(`chat_msgs_${chatId}`)) || []; } catch(e) {}
        const combined = deduplicateMessages([...cached, ...remoteMessages]).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        localStorage.setItem(`chat_msgs_${chatId}`, JSON.stringify(combined));
        renderMessages(combined, chatId);
    } 
    else if ((data.type === 'send-message' || data.type === 'send-group-message') && data.success) {
        isSendingMessage = false;
        processMessageQueue();
        if (currentActiveRawId) fetchMessages(currentActiveRawId);
    } 
    else if (data.type === 'add-to-group' && data.success) {
        if (!activeGroups.includes(data.groupId)) {
            activeGroups.push(data.groupId);
            if (currentUser) localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
        }
        if (data.members && Array.isArray(data.members)) {
            groupMembers[data.groupId] = data.members.map(m => m.toLowerCase());
            localStorage.setItem('chat_group_members', JSON.stringify(groupMembers));
        }
        renderSidebarList();
        if (currentActiveRawId === data.groupId) fetchMessages(currentActiveRawId);
    } 
    else if (data.type === 'leave-group' && data.success) {
        leftGroups[data.groupId] = true;
        localStorage.setItem('chat_left_groups', JSON.stringify(leftGroups));
        activeGroups = activeGroups.filter(id => id !== data.groupId);
        if (currentUser) localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
        delete groupMembers[data.groupId];
        localStorage.setItem('chat_group_members', JSON.stringify(groupMembers));
        cleanupDeletedChat(data.groupId);
    }
    else if (data.type === 'create-group' && data.success) {
        if (!activeGroups.includes(data.groupId)) {
            activeGroups.push(data.groupId);
            if (currentUser) localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
        }
        if (data.groupName) {
            groupNames[data.groupId] = data.groupName;
            localStorage.setItem('chat_group_names', JSON.stringify(groupNames));
        }
        renderSidebarList();
    }
    else if (data.type === 'delete-group' && data.success) {
        cleanupDeletedChat(data.groupId);
    }
}

function createAvatarElement(src, alt, sizeClass = "chat-avatar") {
    const img = document.createElement('img');
    img.className = sizeClass;
    img.src = src || fallbackAvatar;
    img.alt = alt || "Avatar";
    img.onerror = function() { this.onerror = null; this.src = fallbackAvatar; };
    return img;
}

function openChat(rawId, peerName, peerAvatar, chatItemEl = null) {
    currentActiveRawId = rawId;
    document.getElementById('header-username').innerText = peerName;
    const headerAvatar = document.getElementById('header-avatar-icon');
    headerAvatar.src = peerAvatar || fallbackAvatar;
    headerAvatar.style.display = 'block';
    headerAvatar.onerror = function() { this.onerror = null; this.src = fallbackAvatar; };
    
    let isGroup = rawId.startsWith('grp-');
    document.getElementById('delete-chat-btn').style.display = isGroup ? 'none' : 'block';
    document.getElementById('leave-group-btn').style.display = isGroup ? 'block' : 'none';
    let addBtn = document.getElementById('add-member-btn');
    if (addBtn) addBtn.style.display = isGroup ? 'block' : 'none';
    
    document.getElementById('user-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    
    const chatContainer = document.getElementById('chat-container');
    
    if (unreadChats.includes(rawId)) {
        unreadChats = unreadChats.filter(id => id !== rawId);
        localStorage.setItem('chat_unread', JSON.stringify(unreadChats));
        renderSidebarList();
    } else {
        document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
        if (chatItemEl) chatItemEl.classList.add('active');
    }
    
    lastRenderedChatId = rawId;
    lastMessageDataString = "";
    const token = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    currentRenderToken = token;
    chatContainer.dataset.renderToken = token;
    chatContainer.classList.remove('visible');
    document.getElementById('section-loader').classList.remove('hidden');
    chatContainer.innerHTML = '';
    justOpened = true;
    stopMediaWatcher();
    
    try {
        const cachedMsgs = JSON.parse(localStorage.getItem(`chat_msgs_${rawId}`));
        if (cachedMsgs && cachedMsgs.length > 0) {
            renderMessages(cachedMsgs, rawId);
        }
    } catch (e) {}
    
    fetchMessages(rawId);
}

function renderSidebarList() {
    const chatList = document.getElementById('chat-list');
    if (!currentUser) {
        chatList.innerHTML = '<div style="padding: 15px; font-size: 0.85rem; opacity: 0.6;">Waiting for user data...</div>';
        return;
    }
    
    const myConvs = activeConversations.filter(rawId => rawId && rawId.toLowerCase().split('-').includes(currentUser));
    const validGroups = activeGroups.filter(groupId => !leftGroups[groupId]);
    
    const currentState = JSON.stringify({ myConvs, validGroups, unreadChats, currentActiveRawId, groupNames });
    if (currentState === lastSidebarState) return;
    lastSidebarState = currentState;
    
    chatList.innerHTML = '';
    
    if (myConvs.length === 0 && validGroups.length === 0) {
        chatList.innerHTML = '<div style="padding: 15px; font-size: 0.85rem; opacity: 0.6;">No conversations yet.</div>';
        return;
    }
    
    validGroups.forEach(groupId => {
        const members = groupMembers[groupId];
        if (members && Array.isArray(members) && !members.includes(currentUser)) return;
        
        let isUnread = unreadChats.includes(groupId);
        let gName = groupNames[groupId] || "Group Chat";
        let item = document.createElement('div');
        item.className = 'chat-item' + (currentActiveRawId === groupId ? ' active' : '') + (isUnread ? ' unread' : '');
        item.tabIndex = 0;
        
        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'avatar-wrapper';
        avatarWrap.appendChild(createAvatarElement(groupFallbackAvatar, 'Group', 'chat-avatar'));
        
        const unreadDot = document.createElement('div');
        unreadDot.className = 'unread-indicator';
        avatarWrap.appendChild(unreadDot);
        
        const info = document.createElement('div');
        info.className = 'chat-info';
        const title = document.createElement('span');
        title.className = 'chat-title';
        title.textContent = gName;
        const preview = document.createElement('span');
        preview.className = 'chat-preview';
        preview.textContent = 'Group chat';
        info.appendChild(title);
        info.appendChild(preview);
        
        item.appendChild(avatarWrap);
        item.appendChild(info);
        item.addEventListener('click', () => openChat(groupId, gName, groupFallbackAvatar, item));
        item.addEventListener('keydown', e => { if (e.key === 'Enter') openChat(groupId, gName, groupFallbackAvatar, item); });
        chatList.appendChild(item);
    });
    
    myConvs.forEach(rawId => {
        let parts = rawId.split('-');
        let peer = parts.find(p => p.toLowerCase() !== currentUser) || parts[0];
        let peerAvatar = userProfileMap[peer.toLowerCase()] || fallbackAvatar;
        let isUnread = unreadChats.includes(rawId);
        let item = document.createElement('div');
        item.className = 'chat-item' + (currentActiveRawId === rawId ? ' active' : '') + (isUnread ? ' unread' : '');
        item.tabIndex = 0;
        
        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'avatar-wrapper';
        avatarWrap.appendChild(createAvatarElement(peerAvatar, peer, 'chat-avatar'));
        
        const unreadDot = document.createElement('div');
        unreadDot.className = 'unread-indicator';
        avatarWrap.appendChild(unreadDot);
        
        const info = document.createElement('div');
        info.className = 'chat-info';
        const title = document.createElement('span');
        title.className = 'chat-title';
        title.textContent = peer;
        const preview = document.createElement('span');
        preview.className = 'chat-preview';
        preview.textContent = 'Open chat';
        info.appendChild(title);
        info.appendChild(preview);
        
        item.appendChild(avatarWrap);
        item.appendChild(info);
        item.addEventListener('click', () => openChat(rawId, peer, peerAvatar, item));
        item.addEventListener('keydown', e => { if (e.key === 'Enter') openChat(rawId, peer, peerAvatar, item); });
        chatList.appendChild(item);
    });
}

function fetchMessages(rawId) {
    if (backendPort && rawId) {
        if (rawId.startsWith('grp-')) backendPort.postMessage({ type: 'get-group-chat', groupId: rawId, requestUser: currentUser });
        else backendPort.postMessage({ type: 'get-messages', id: rawId });
    }
}

function buildMessageRow(tokenSnapshot, sender, text, timestamp, animateDelay, showTimestamp, isGroup, contPrev, contNext) {
    const container = document.getElementById('chat-container');
    if (container.dataset.renderToken !== tokenSnapshot) return null;
    
    const isMe = sender.toLowerCase() === currentUser;
    const rowDiv = document.createElement('div');
    rowDiv.className = `message-row ${isMe ? 'user-row' : 'friend-row'}`;
    if (contPrev) rowDiv.classList.add('cont-prev');
    if (contNext) rowDiv.classList.add('cont-next');
    
    if (animateDelay !== false) {
        rowDiv.classList.add('slide-in');
        rowDiv.style.animationDelay = `${animateDelay}ms`;
    }
    
    const avatarImg = createAvatarElement(userProfileMap[sender.toLowerCase()] || fallbackAvatar, sender, 'msg-avatar');
    const msgWrapper = document.createElement('div');
    msgWrapper.className = 'message-wrapper';
    
    if (isGroup && !isMe && !contPrev) {
        const senderName = document.createElement('span');
        senderName.className = 'sender-name';
        senderName.innerText = sender;
        msgWrapper.appendChild(senderName);
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'user-message' : 'friend-message'}`;
    
    const decodedText = xorDecode(text);
    const mediaType = isMediaURL(decodedText).type;
    const mediaElems = [];
    
    if (mediaType === 'image') {
        const img = document.createElement('img');
        img.src = decodedText;
        img.alt = 'Attached image';
        img.loading = 'eager';
        img.decoding = 'async';
        img.onerror = function() { this.outerHTML = '<span style="opacity:0.6;font-style:italic;padding:5px 11px;display:inline-block;">[Invalid Image]</span>'; };
        msgDiv.classList.add('media-msg');
        msgDiv.appendChild(img);
        mediaElems.push(img);
    } else if (mediaType === 'video') {
        const vid = document.createElement('video');
        vid.controls = true;
        vid.src = decodedText;
        vid.preload = 'metadata';
        msgDiv.classList.add('media-msg');
        msgDiv.appendChild(vid);
        mediaElems.push(vid);
    } else if (mediaType === 'audio') {
        const aud = document.createElement('audio');
        aud.controls = true;
        aud.src = decodedText;
        aud.preload = 'metadata';
        msgDiv.classList.add('media-msg');
        msgDiv.appendChild(aud);
        mediaElems.push(aud);
    } else {
        msgDiv.textContent = decodedText;
    }
    
    msgWrapper.appendChild(msgDiv);
    
    if (timestamp && showTimestamp) {
        const timeDiv = document.createElement('span');
        timeDiv.className = 'timestamp';
        timeDiv.innerText = new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
        msgWrapper.appendChild(timeDiv);
    }
    
    rowDiv.appendChild(avatarImg);
    rowDiv.appendChild(msgWrapper);
    return { row: rowDiv, mediaElems };
}

function renderMessages(messages, chatId) {
    const container = document.getElementById('chat-container');
    if (chatId !== currentActiveRawId || container.dataset.renderToken !== currentRenderToken) return;
    
    document.getElementById('section-loader').classList.add('hidden');
    
    const cleanMsgs = deduplicateMessages(messages).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const switched = chatId !== lastRenderedChatId;
    
    if (switched) {
        lastRenderedChatId = chatId;
        lastMessageDataString = "";
        container.innerHTML = '';
    }
    
    const newMessageString = JSON.stringify(cleanMsgs);
    if (newMessageString === lastMessageDataString) {
        maybeShowContainer(container);
        return;
    }
    
    let oldMsgs = [];
    if (lastMessageDataString) {
        try { oldMsgs = JSON.parse(lastMessageDataString); } catch(e) {}
    }
    lastMessageDataString = newMessageString;
    container.innerHTML = '';
    
    if (cleanMsgs.length === 0) {
        container.innerHTML = '<div class="empty-state">No messages yet. Say hi to start the conversation.</div>';
        maybeShowContainer(container);
        justOpened = false;
        return;
    }
    
    const animateAll = justOpened || switched;
    const frag = document.createDocumentFragment();
    const tokenSnapshot = currentRenderToken;
    const mediaElements = [];
    
    for (let index = 0; index < cleanMsgs.length; index++) {
        const m = cleanMsgs[index];
        const prev = cleanMsgs[index - 1];
        const next = cleanMsgs[index + 1];
        const contPrev = !!(prev && prev.sender === m.sender && (new Date(m.timestamp) - new Date(prev.timestamp)) < CLUSTER_GAP_MS);
        const contNext = !!(next && next.sender === m.sender && (new Date(next.timestamp) - new Date(m.timestamp)) < CLUSTER_GAP_MS);
        const isNewMessage = oldMsgs.length > 0 && index >= oldMsgs.length;
        let animateDelay = false;
        
        if (animateAll) {
            animateDelay = Math.min(index * STAGGER_STEP, MAX_STAGGER_MS);
        } else if (isNewMessage) {
            animateDelay = 0;
        }
        
        const built = buildMessageRow(tokenSnapshot, m.sender, m.message, m.timestamp, animateDelay, !contNext, chatId.startsWith('grp-'), contPrev, contNext);
        if (built) {
            frag.appendChild(built.row);
            if (built.mediaElems && built.mediaElems.length) mediaElements.push(...built.mediaElems);
        }
    }
    
    stopMediaWatcher();
    container.appendChild(frag);
    scrollToBottomIfShould(container, true);
    if (mediaElements.length > 0) startMediaWatcher(mediaElements, container);
    maybeShowContainer(container);
    justOpened = false;
}

function maybeShowContainer(container) {
    container.classList.remove('visible');
    void container.offsetWidth;
    container.classList.add('visible');
}

function scrollToBottomImmediate(container) {
    if (!container) return;
    container.scrollTop = container.scrollHeight;
}

function scrollToBottomIfShould(container, isOpenScroll = false) {
    if (!container) return;
    if (isOpenScroll) {
        scrollToBottomImmediate(container);
        return;
    }
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    if (distanceFromBottom <= FALLBACK_SCROLL_THRESHOLD) scrollToBottomImmediate(container);
}

function startMediaWatcher(mediaElems, container) {
    stopMediaWatcher();
    const token = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    mediaWatcher.token = token;
    mediaWatcher.remaining = mediaElems.length;
    mediaWatcher.listeners = [];
    
    const onFinish = () => {
        if (mediaWatcher.token !== token) return;
        scrollToBottomIfShould(container, false);
        clearTimeout(mediaWatcher.timeoutId);
        mediaWatcher.token = null;
        mediaWatcher.remaining = 0;
        mediaWatcher.listeners.forEach(l => l.el.removeEventListener(l.ev, l.fn));
        mediaWatcher.listeners = [];
    };
    
    const decrement = () => {
        if (mediaWatcher.token !== token) return;
        mediaWatcher.remaining -= 1;
        if (mediaWatcher.remaining <= 0) onFinish();
    };
    
    mediaElems.forEach(el => {
        const evLoad = el.tagName.toLowerCase() === 'img' ? 'load' : 'loadeddata';
        const fnLoad = () => decrement();
        const fnErr = () => decrement();
        el.addEventListener(evLoad, fnLoad, { passive: true });
        el.addEventListener('error', fnErr, { passive: true });
        mediaWatcher.listeners.push({ el, ev: evLoad, fn: fnLoad }, { el, ev: 'error', fn: fnErr });
    });
    
    mediaWatcher.timeoutId = setTimeout(() => {
        if (mediaWatcher.token !== token) return;
        scrollToBottomIfShould(container, false);
        mediaWatcher.token = null;
        mediaWatcher.listeners.forEach(l => l.el.removeEventListener(l.ev, l.fn));
        mediaWatcher.listeners = [];
    }, 900);
}

function stopMediaWatcher() {
    if (!mediaWatcher.token) return;
    clearTimeout(mediaWatcher.timeoutId);
    mediaWatcher.listeners.forEach(l => l.el.removeEventListener(l.ev, l.fn));
    mediaWatcher.token = null;
    mediaWatcher.remaining = 0;
    mediaWatcher.listeners = [];
}

setInterval(() => {
    if (backendReady && currentUser) {
        backendPort.postMessage({ type: 'get-convs', currentUser: currentUser });
        if (currentActiveRawId) fetchMessages(currentActiveRawId);
    }
}, 800);

function sendMessage() {
    let input = document.getElementById('user-input');
    let text = input.value.trim();
    if (!text || !currentActiveRawId || !backendPort || !currentUser) return;
    
    input.value = '';
    let currentTimestamp = new Date().toISOString();
    let encodedText = xorEncode(text);
    
    let cached = [];
    try { cached = JSON.parse(localStorage.getItem(`chat_msgs_${currentActiveRawId}`)) || []; } catch(e) {}
    cached.push({ sender: currentUser, message: encodedText, timestamp: currentTimestamp });
    const uniqueCached = deduplicateMessages(cached);
    localStorage.setItem(`chat_msgs_${currentActiveRawId}`, JSON.stringify(uniqueCached));
    renderMessages(uniqueCached, currentActiveRawId);
    
    if (currentActiveRawId.startsWith('grp-')) {
        messageQueue.push({ type: 'send-group-message', groupId: currentActiveRawId, sender: currentUser, message: encodedText });
    } else {
        messageQueue.push({ type: 'send-message', id: currentActiveRawId, sender: currentUser, message: encodedText, timestamp: currentTimestamp });
    }
    processMessageQueue();
}

document.getElementById('send-btn').onclick = sendMessage;
document.getElementById('user-input').onkeydown = e => { if (e.key === 'Enter') sendMessage(); };

document.getElementById('delete-chat-btn').onclick = () => {
    if (!currentActiveRawId || !backendPort) return;
    if (confirm("Are you sure you want to delete this conversation?")) {
        pendingDeletions.add(currentActiveRawId);
        backendPort.postMessage({ type: 'delete-convs', id: currentActiveRawId });
    }
};

document.getElementById('leave-group-btn').onclick = () => {
    if (!currentActiveRawId || !backendPort) return;
    if (confirm("Are you sure you want to leave this group?")) {
        pendingDeletions.add(currentActiveRawId);
        backendPort.postMessage({ type: 'leave-group', groupId: currentActiveRawId, user: currentUser });
    }
};

const modal = document.getElementById('modal-overlay');
const userContainer = document.getElementById('user-list-container');
const searchInput = document.getElementById('user-search-input');
const groupNameInput = document.getElementById('group-name-input');
const createGroupBtn = document.getElementById('modal-create-group');

function openModal(groupMode, addMemberMode = false) {
    if (!currentUser) return alert("Waiting for username authorization...");
    isGroupMode = groupMode;
    isAddMemberMode = addMemberMode;
    selectedUsersForGroup.clear();
    currentSearchQuery = ""; 
    searchInput.value = ""; 
    groupNameInput.value = "";
    
    if (isAddMemberMode) {
        document.getElementById('modal-title').innerText = "Add Members to Group";
        groupNameInput.style.display = "none";
        createGroupBtn.style.display = "block";
        createGroupBtn.innerText = "Add Members";
    } else {
        document.getElementById('modal-title').innerText = isGroupMode ? "Create Group Chat" : "Start Conversation";
        groupNameInput.style.display = isGroupMode ? "block" : "none";
        createGroupBtn.style.display = isGroupMode ? "block" : "none";
        createGroupBtn.innerText = "Create Group";
    }
    
    modal.classList.remove('closing');
    void modal.offsetWidth;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    if (cachedUsersList.length > 0) populateUserDirectoryModal(cachedUsersList);
    else {
        userContainer.innerHTML = '<div style="text-align:center; opacity:0.6; padding: 20px;">Loading users...</div>';
        if (backendPort) backendPort.postMessage({ type: 'get-users' });
    }
}

document.getElementById('new-chat-btn').onclick = () => openModal(false);
document.getElementById('new-group-btn').onclick = () => openModal(true);

const btnAddMember = document.getElementById('add-member-btn');
if (btnAddMember) btnAddMember.onclick = () => openModal(true, true);

function closeModal() {
    if (!modal.classList.contains('active')) return;
    modal.classList.add('closing');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.classList.remove('active', 'closing');
        userContainer.innerHTML = '';
    }, 280);
}

modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
document.getElementById('modal-cancel').onclick = () => closeModal();

createGroupBtn.onclick = () => {
    if (selectedUsersForGroup.size === 0) return alert("Select at least one user.");
    
    if (isAddMemberMode) {
        if (!currentActiveRawId || !currentActiveRawId.startsWith('grp-')) return alert("No active group selected.");
        const usersArray = Array.from(selectedUsersForGroup);
        usersArray.forEach(u => {
            if (backendPort) backendPort.postMessage({ type: 'add-to-group', groupId: currentActiveRawId, user: u });
        });
        alert("Members added successfully!");
        closeModal();
        return;
    }
    
    if (!isGroupMode) return;
    
    const gName = groupNameInput.value.trim() || "New Group";
    const newGroupId = "grp-" + Date.now() + "-" + Math.random().toString(36).substr(2,6);
    
    if (backendPort) backendPort.postMessage({ type: 'create-group', groupId: newGroupId, creator: currentUser, name: gName });
    selectedUsersForGroup.forEach(u => { 
        if (backendPort) backendPort.postMessage({ type: 'add-to-group', groupId: newGroupId, user: u }); 
    });
    
    groupNames[newGroupId] = gName;
    localStorage.setItem('chat_group_names', JSON.stringify(groupNames));
    
    if (!activeGroups.includes(newGroupId)) activeGroups.push(newGroupId);
    localStorage.setItem(`chat_groups_${currentUser}`, JSON.stringify(activeGroups));
    
    closeModal();
    openChat(newGroupId, gName, groupFallbackAvatar);
    renderSidebarList();
};

searchInput.oninput = (e) => { 
    currentSearchQuery = e.target.value.toLowerCase().trim(); 
    populateUserDirectoryModal(cachedUsersList); 
};

function populateUserDirectoryModal(users) {
    userContainer.innerHTML = '';
    const filteredUsers = (users || []).filter(u => {
        if (!u || !u.username || u.username.toLowerCase() === currentUser) return false;
        if (currentSearchQuery && !u.username.toLowerCase().includes(currentSearchQuery)) return false;
        return true;
    });
    
    if (filteredUsers.length === 0) {
        userContainer.innerHTML = '<div style="text-align:center; opacity:0.6; padding: 20px;">No users found.</div>';
        return;
    }
    
    filteredUsers.forEach(u => {
        let item = document.createElement('div');
        item.className = 'user-list-item';
        let avatar = u.profilePicture || fallbackAvatar;
        let lowerName = u.username.toLowerCase();
        
        if (isGroupMode || isAddMemberMode) {
            const avatarEl = createAvatarElement(avatar, u.username, 'user-list-avatar');
            const info = document.createElement('div');
            info.className = 'user-list-info';
            const name = document.createElement('span');
            name.className = 'user-list-name';
            name.textContent = u.username;
            info.appendChild(name);
            item.appendChild(avatarEl);
            item.appendChild(info);
            
            if (selectedUsersForGroup.has(lowerName)) item.classList.add('selected');
            
            item.onclick = () => {
                if (selectedUsersForGroup.has(lowerName)) {
                    selectedUsersForGroup.delete(lowerName);
                    item.classList.remove('selected');
                } else {
                    if (selectedUsersForGroup.size >= 10) {
                        alert("You can only select up to 10 users.");
                        return;
                    }
                    selectedUsersForGroup.add(lowerName);
                    item.classList.add('selected');
                }
            };
            item.style.cursor = 'pointer';
        } else {
            const avatarEl = createAvatarElement(avatar, u.username, 'user-list-avatar');
            const info = document.createElement('div');
            info.className = 'user-list-info';
            const name = document.createElement('span');
            name.className = 'user-list-name';
            name.textContent = u.username;
            const desc = document.createElement('span');
            desc.className = 'user-list-desc';
            desc.textContent = u.description || "No bio provided.";
            info.appendChild(name);
            info.appendChild(desc);
            
            const btn = document.createElement('button');
            btn.className = 'modal-btn primary';
            btn.textContent = 'Chat';
            btn.onclick = () => {
                closeModal();
                let rawId = [currentUser, lowerName].sort().join('-');
                if (backendPort) backendPort.postMessage({ type: 'create-conv', u1: currentUser, u2: lowerName });
                openChat(rawId, u.username, avatar);
                if (backendPort) backendPort.postMessage({ type: 'get-convs', currentUser: currentUser });
            };
            
            item.appendChild(avatarEl);
            item.appendChild(info);
            item.appendChild(btn);
        }
        userContainer.appendChild(item);
    });
    }

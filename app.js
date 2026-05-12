import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp, 
    where, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbBGXa6yQteE6KL7GtNGZ6N8AtUJdQhZw",
    authDomain: "slam-app-dfb86.firebaseapp.com",
    projectId: "slam-app-dfb86",
    storageBucket: "slam-app-dfb86.firebasestorage.app",
    messagingSenderId: "515400888906",
    appId: "1:515400888906:web:eba8cbe4b7ac84e088acb3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🌟 المتغيرات العامة
let currentUser = null;
let currentChat = null;
let randomUsers = [];

// 🎯 التنقل بين الأقسام
window.showSection = (sectionId) => {
    document.querySelectorAll('.app-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    document.getElementById(sectionId + '-section').style.display = 'block';
    document.getElementById(sectionId + '-section').classList.add('active');
    
    // تحديث القائمة الجانبية
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    event?.target?.closest('.menu-item')?.classList.add('active');
};

// 🔐 نظام تسجيل الدخول
document.getElementById('login-btn').onclick = () => {
    if (auth.currentUser) {
        signOut(auth);
    } else {
        signInWithPopup(auth, provider);
    }
};

// 👤 مراقبة حالة المستخدم
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        await loadUserData(user);
        document.getElementById('login-btn').innerHTML = '<i class="fas fa-sign-out-alt"></i> خروج';
        document.querySelector('.sidebar').style.display = 'block';
        loadAllData();
    } else {
        resetUIForGuest();
        document.getElementById('login-btn').innerHTML = '<i class="fab fa-google"></i> دخول بجوجل';
    }
});

// 💾 تحميل بيانات المستخدم
async function loadUserData(user) {
    document.getElementById('user-name').textContent = user.displayName || 'مستخدم جديد';
    document.getElementById('user-img').src = user.photoURL || 'https://via.placeholder.com/80/ff69b4/fff?text=💕';
    document.getElementById('big-profile-img').src = user.photoURL || 'https://via.placeholder.com/160/ff69b4/fff?text=💕';
    document.getElementById('profile-full-name').textContent = user.displayName || 'اكمل ملفك الشخصي';
    
    // تحميل البايو والإحصائيات
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById('user-bio').textContent = data.bio || '💕 جاهز للحب';
        document.getElementById('bio-input').value = data.bio || '';
        document.getElementById('profile-status').textContent = data.status || '💕 جاهز للحب الجديد';
    }
    
    // تحديث حالة الاتصال
    document.querySelector('.online-status').style.display = 'block';
    document.querySelector('.status').textContent = 'متصل';
    
    // تحميل الإحصائيات
    await loadUserStats(user.uid);
}

// 📊 تحميل إحصائيات المستخدم
async function loadUserStats(uid) {
    const postsQuery = query(collection(db, "posts"), where("authorId", "==", uid));
    const postsSnap = await getDocs(postsQuery);
    document.getElementById('posts-count').textContent = postsSnap.size;
    
    // محاكاة الأصدقاء والمجموعات
    document.getElementById('friends-count').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('groups-count').textContent = Math.floor(Math.random() * 15) + 2;
}

// 🔄 إعادة تعيين الواجهة للزوار
function resetUIForGuest() {
    document.getElementById('user-name').textContent = 'زائر';
    document.getElementById('user-bio').textContent = '💕 سجل الدخول لبدء الرحلة';
    document.querySelector('.online-status').style.display = 'none';
    document.querySelector('.status').textContent = 'غير متصل';
    document.querySelector('.sidebar').style.display = 'none';
}

// 📤 النشر
document.getElementById('publish-btn').onclick = async () => {
    const text = document.getElementById('post-input').value.trim();
    if (!text || !currentUser) {
        alert('💕 يجب تسجيل الدخول والكتابة أولاً!');
        return;
    }
    
    try {
        await addDoc(collection(db, "posts"), {
            text,
            author: currentUser.displayName,
            authorId: currentUser.uid,
            photo: currentUser.photoURL,
            likes: [],
            comments: [],
            views: 1,
            createdAt: serverTimestamp()
        });
        document.getElementById('post-input').value = '';
        showNotification('تم النشر بنجاح! 💕', 'success');
    } catch (error) {
        console.error('خطأ في النشر:', error);
    }
};

// 📱 تحميل جميع البيانات
function loadAllData() {
    loadPosts();
    loadStories();
    loadGroups();
    loadChats();
    loadDiscover();
}

// 📰 تحميل المنشورات
function loadPosts() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('posts-container');
        container.innerHTML = '';
        snapshot.forEach(doc => {
            renderPost(doc.data(), container);
        });
    });
}

// 🎬 تحميل القصص
function loadStories() {
    const stories = [
        { name: 'سارة 💕', img: 'https://via.placeholder.com/70/ff69b4/fff?text=س' },
        { name: 'أحمد ♥️', img: 'https://via.placeholder.com/70/4169e1/fff?text=أ' },
        { name: 'فاطمة 🌹', img: 'https://via.placeholder.com/70/ff1493/fff?text=ف' },
        { name: 'محمد ⚡', img: 'https://via.placeholder.com/70/32cd32/fff?text=م' }
    ];
    
    const container = document.getElementById('stories-container');
    container.innerHTML = '';
    stories.forEach(story => {
        container.innerHTML += `
            <div class="story-item">
                <img src="${story.img}" alt="${story.name}">
                <div>${story.name}</div>
            </div>
        `;
    });
}

// 👥 تحميل المجموعات
function loadGroups() {
    const groups = [
        { name: '💕 مواقع جدية', desc: 'للباحثين عن الزواج', img: 'https://via.placeholder.com/60/ff69b4/fff?text=💕', members: 1245 },
        { name: '🌹 الحب الأول', desc: 'قصص حب جميلة', img: 'https://via.placeholder.com/60/ff1493/fff?text=🌹', members: 892 },
        { name: '💍 خطوبات سعيدة', desc: 'احتفال بخطوبتك', img: 'https://via.placeholder.com/60/f4a460/fff?text=💍', members: 567 }
    ];
    
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    groups.forEach(group => {
        container.innerHTML += renderGroupCard(group);
    });
}

// 💬 تحميل المحادثات
function loadChats() {
    const chats = [
        { name: 'سارة الجميلة', img: 'https://via.placeholder.com/55/ff69b4/fff?text=س', lastMsg: 'متى نتقابل؟ 💕', time: 'الآن' },
        { name: 'أحمد', img: 'https://via.placeholder.com/55/4169e1/fff?text=أ', lastMsg: 'شكراً لك', time: '2د' },
        { name: 'فاطمة', img: 'https://via.placeholder.com/55/ff1493/fff?text=ف', lastMsg: 'أحببت ملفك', time: '5د' }
    ];
    
    const container = document.getElementById('chats-list');
    container.innerHTML = '';
    chats.forEach(chat => {
        container.innerHTML += renderChatItem(chat);
        container.querySelectorAll('.chat-item')[chats.indexOf(chat)].onclick = () => openChat(chat);
    });
}

// 🎲 البحث العشوائي
window.randomMatch = () => {
    showSection('random');
};

window.startRandomMatch = () => {
    const result = document.getElementById('random-result');
    const randomUsersSample = [
        { name: 'ليلى الرومانسية', bio: '💕 أبحث عن شريك حياتي', img: 'https://via.placeholder.com/120/ff69b4/fff?text=ل' },
        { name: 'يوسف الحنون', bio: '♥️ قلب طيب يبحث عن حب', img: 'https://via.placeholder.com/120/4169e1/fff?text=ي' },
        { name: 'نور الجميلة', bio: '🌹 جاهزة للزواج', img: 'https://via.placeholder.com/120/ff1493/fff?text=ن' }
    ];
    
    const randomUser = randomUsersSample[Math.floor(Math.random() * randomUsersSample.length)];
    document.getElementById('random-user-img').src = randomUser.img;
    document.getElementById('random-user-name').textContent = randomUser.name;
    document.getElementById('random-user-bio').textContent = randomUser.bio;
    result.style.display = 'block';
};

window.sendLike = () => {
    showNotification('تم إرسال الإعجاب! 💕', 'success');
};

window.startChatWithRandom = () => {
    showNotification('بدء المحادثة...', 'info');
    showSection('messages');
};

window.nextRandom = () => {
    document.getElementById('random-result').style.display = 'none';
    setTimeout(startRandomMatch, 500);
};

// 👥 اكتشاف الأشخاص
function loadDiscover() {
    const people = [
        { name: 'ريم', age: 25, bio: '💕 أحب السفر', img: 'https://via.placeholder.com/300x400/ff69b4/fff?text=ر' },
        { name: 'علي', age: 28, bio: '⚽ عشاق كرة القدم', img: 'https://via.placeholder.com/300x400/4169e1/fff?text=ع' },
        { name: 'مريم', age: 24, bio: '🎨 فنانة تشكيلية', img: 'https://via.placeholder.com/300x400/ff1493/fff?text=م' }
    ];
    
    const container = document.getElementById('discover-container');
    container.innerHTML = '';
    people.forEach(person => {
        container.innerHTML += renderDiscoverCard(person);
    });
}

// 👥 فتح المحادثة
function openChat(chat) {
    currentChat = chat;
    document.getElementById('chat-avatar').src = chat.img;
    document.getElementById('chat-name').textContent = chat.name;
    document.getElementById('chat-status').textContent = 'متصل';
    document.getElementById('chat-window').style.display = 'flex';
    document.getElementById('chats-list').style.display = 'none';
    
    // محاكاة الرسائل
    setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = `
            <div class="message received">
                <div class="message-bubble">مرحباً! كيف حالك؟ 💕</div>
                <div class="message-time">2دقيقة</div>
            </div>
            <div class="message sent">
                <div class="message-bubble">الحمدلله، وأنتِ؟</div>
                <div class="message-time">دقيقة</div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// 💬 إرسال رسالة
document.getElementById('send-message-btn').onclick = sendMessage;
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;
    
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML += `
        <div class="message sent">
            <div class="message-bubble">${text}</div>
            <div class="message-time">الآن</div>
        </div>
    `;
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 👥 إنشاء مجموعة جديدة
window.createGroup = () => {
    document.getElementById('group-modal').style.display = 'block';
};

window.saveGroup = async () => {
    const name = document.getElementById('group-name').value;
    const desc = document.getElementById('group-desc').value;
    
    if (!name) {
        alert('أدخل اسم المجموعة');
        return;
    }
    
    // إضافة المجموعة للقائمة المحلية
    const groupsContainer = document.getElementById('groups-container');
    const newGroup = {
        name,
        desc,
        img: 'https://via.placeholder.com/60/ff69b4/fff?' + Date.now(),
        members: 1
    };
    groupsContainer.innerHTML = renderGroupCard(newGroup) + groupsContainer.innerHTML;
    
    closeModal();
    showNotification('تم إنشاء المجموعة بنجاح! 🎉', 'success');
};

window.closeModal = () => {
    document.getElementById('group-modal').style.display = 'none';
};

// 📱 تبويبات الملف الشخصي
window.showProfileTab = (tab) => {
    document.querySelectorAll('#profile-section > div[id*="container"]').forEach(c => {
        c.style.display = 'none';
    });
    document.getElementById(`profile-${tab}-container`).style.display = 'block';
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
};

// 💾 حفظ البايو
window.saveBio = async () => {
    if (!currentUser) return;
    
    const bio = document.getElementById('bio-input').value;
    await setDoc(doc(db, "users", currentUser.uid), { 
        bio, 
        status: document.getElementById('profile-status').textContent,
        updatedAt: serverTimestamp()
    }, { merge: true });
    
    showNotification('تم حفظ البيانات بنجاح! 💾', 'success');
};

// 📸 تعديل الصورة
window.editProfilePhoto = () => {
    alert('قريباً: رفع صورة جديدة 💕');
};

// 💫 وظائف العرض
function renderPost(post, container) {
    const timeAgo = post.createdAt ? 'منذ لحظات' : 'الآن';
    const likes = post.likes?.length || 0;
    const comments = post.comments?.length || 0;
    
    container.innerHTML += `
        <div class="post-card">
            <div class="post-header-card">
                <img src="${post.photo}" class="post-avatar" alt="${post.author}">
                <div>
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${timeAgo}</div>
                </div>
            </div>
            <div class="post-text">${post.text}</div>
            <div class="post-actions-bar">
                <div class="post-stats">
                    <span>👁️ ${post.views || 1} مشاهدة</span>
                    <span>❤️ ${likes} إعجاب</span>
                    <span>💬 ${comments} تعليق</span>
                </div>
                <div class="action-buttons">
                    <button class="action-btn-small">
                        <i class="fas fa-heart"></i> إعجاب
                    </button>
                    <button class="action-btn-small">
                        <i class="fas fa-comment"></i> تعليق
                    </button>
                    <button class="action-btn-small">
                        <i class="fas fa-share"></i> مشاركة
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderGroupCard(group) {
    return `
        <div class="group-card">
            <img src="${group.img}" class="group-avatar" alt="${group.name}">
            <div class="group-info">
                <h3>${group.name}</h3>
                <p>${group.desc}</p>
                <div class="group-members">
                    <span>👥 ${group.members} عضو</span>
                </div>
            </div>
            <button class="post-btn" style="margin-top: auto; padding: 10px;">انضمام 💕</button>
        </div>
    `;
}

function renderChatItem(chat) {
    return `
        <div class="chat-item">
            <img src="${chat.img}" alt="${chat.name}">
            <div class="chat-preview">
                <h4>${chat.name}</h4>
                <p>${chat.lastMsg}</p>
            </div>
            <div class="chat-time">${chat.time}</div>
        </div>
    `;
}

function renderDiscoverCard(person) {
    return `
        <div class="discover-card">
            <img src="${person.img}" class="group-avatar" style="width: 100%; height: 200px; border-radius: 15px; margin-bottom: 15px; object-fit: cover;">
            <h3>${person.name}, ${person.age}</h3>
            <p>${person.bio}</p>
            <div style="display: flex; gap: 10px; margin-top: auto;">
                <button class="like-btn" style="flex: 1; padding: 10px;">إعجاب ❤️</button>
                <button class="chat-btn" style="flex: 1; padding: 10px;">دردشة 💬</button>
            </div>
        </div>
    `;
}

// 🔔 الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.4s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// 🔍 البحث
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    // تنفيذ البحث هنا
    console.log('البحث عن:', query);
});

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    showSection('feed');
    loadStories();
});

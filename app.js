import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 1. تبديل الأقسام (Navigation)
window.showSection = (sectionId) => {
    document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId + '-section').style.display = 'block';
};

// 2. الدخول والخروج
document.getElementById('login-btn').onclick = () => {
    if (auth.currentUser) signOut(auth);
    else signInWithPopup(auth, provider);
};

// 3. مراقبة المستخدم وتحميل بياناته (البايو والبروفايل)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-img').src = user.photoURL;
        document.getElementById('big-profile-img').src = user.photoURL;
        document.getElementById('profile-full-name').innerText = user.displayName;
        document.getElementById('login-btn').innerText = "خروج";
        
        // جلب البايو من الداتابيز
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            document.getElementById('user-bio').innerText = userDoc.data().bio;
            document.getElementById('bio-input').value = userDoc.data().bio;
        }
        loadMyPosts(user.displayName);
    } else {
        document.getElementById('login-btn').innerText = "دخول بجوجل";
    }
});

// 4. حفظ البايو في الداتابيز
window.saveBio = async () => {
    const bioText = document.getElementById('bio-input').value;
    await setDoc(doc(db, "users", auth.currentUser.uid), { bio: bioText }, { merge: true });
    alert("تم حفظ البايو بنجاح يا إمبراطور!");
    location.reload();
};

// 5. النشر (العام)
document.getElementById('publish-btn').onclick = async () => {
    const text = document.getElementById('post-input').value;
    if (!text || !auth.currentUser) return;
    await addDoc(collection(db, "posts"), {
        text: text,
        author: auth.currentUser.displayName,
        photo: auth.currentUser.photoURL,
        views: Math.floor(Math.random() * 5) + 1,
        createdAt: serverTimestamp()
    });
    document.getElementById('post-input').value = "";
};

// 6. عرض منشورات العام
const qAll = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(qAll, (snapshot) => {
    const container = document.getElementById('posts-container');
    container.innerHTML = "";
    snapshot.forEach(doc => renderPost(doc.data(), container));
});

// 7. عرض منشوراتي أنا فقط (لتحقيق مبدأ الذاكرة الشخصية)
function loadMyPosts(name) {
    const qMine = query(collection(db, "posts"), where("author", "==", name));
    onSnapshot(qMine, (snapshot) => {
        const container = document.getElementById('my-posts-container');
        container.innerHTML = "<h3>منشوراتي الشخصية</h3>";
        snapshot.forEach(doc => renderPost(doc.data(), container));
    });
}

// وظيفة رسم البوست المشتركة
function renderPost(post, container) {
    const fakeViews = (post.views || 1) * 10;
    container.innerHTML += `
        <div class="post-card">
            <img src="${post.photo}" style="width:30px; border-radius:50%; vertical-align:middle;">
            <strong>${post.author}</strong>
            <p>${post.text}</p>
            <div style="color:#ff4b91; font-size:12px;">👁️ ${fakeViews} | 🖤 لايك | 💬 تعليق | 🚫 حظر</div>
        </div>`;
}

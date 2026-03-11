import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// تسجيل الدخول
document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

// مراقبة المستخدم
onAuthStateChanged(auth, (user) => {
    const publishArea = document.getElementById('publish-area');
    if (user) {
        publishArea.style.display = "block";
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-img').src = user.photoURL;
        document.getElementById('login-btn').innerText = "خروج";
    } else {
        publishArea.style.display = "none";
        document.getElementById('login-btn').innerText = "دخول بجوجل";
    }
});

// النشر
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

// عرض المنشورات
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    const container = document.getElementById('posts-container');
    container.innerHTML = "";
    snapshot.forEach((doc) => {
        const post = doc.data();
        const fakeViews = (post.views || 1) * 10;
        container.innerHTML += `
            <div style="background:white; padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid #ffdae9; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <img src="${post.photo}" style="width:30px; border-radius:50%; vertical-align:middle; margin-left:10px;">
                <strong>${post.author}</strong>
                <p style="margin-top:10px; color:#444;">${post.text}</p>
                <div style="font-size:12px; color:#ff4b91; font-weight:bold;">👁️ ${fakeViews} مشاهدة | #SLAM</div>
            </div>`;
    });
});
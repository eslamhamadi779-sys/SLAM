import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

// تسجيل دخول/خروج
document.getElementById('login-btn').onclick = () => {
    if (auth.currentUser) { signOut(auth); location.reload(); } 
    else { signInWithPopup(auth, provider); }
};

// حالة المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('publish-area').style.display = "block";
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-img').src = user.photoURL;
        document.getElementById('login-btn').innerText = "خروج";
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

// محرك البحث والهاشتاج
const searchBar = document.querySelector('.search-bar');
searchBar.oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const allPosts = document.querySelectorAll('.post-card');
    allPosts.forEach(post => {
        const text = post.innerText.toLowerCase();
        post.style.display = text.includes(term) ? "block" : "none";
    });
};

// عرض المنشورات
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    const container = document.getElementById('posts-container');
    container.innerHTML = "";
    snapshot.forEach((doc) => {
        const post = doc.data();
        const fakeViews = (post.views || 1) * 10;
        // تلوين الهاشتاج تلقائياً
        let displayText = post.text.replace(/#(\w+)/g, '<span style="color:#ff4b91; font-weight:bold;">#$1</span>');
        
        container.innerHTML += `
            <div class="post-card" style="background:white; padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid #ffdae9;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <img src="${post.photo}" style="width:35px; border-radius:50%;">
                    <strong>${post.author}</strong>
                </div>
                <p>${displayText}</p>
                <div style="color:#ff4b91; font-size:12px;">👁️ ${fakeViews} مشاهدة | ❤️ 🤍🖤 SLAM#</div>
                <button onclick="this.parentElement.style.display='none'; alert('تم الحظر')" style="border:none; background:none; color:red; cursor:pointer; font-size:10px;">🚫 حظر</button>
            </div>`;
    });
});

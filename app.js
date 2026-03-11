import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// تسجيل الدخول والخروج
document.getElementById('login-btn').onclick = () => {
    if (auth.currentUser) { signOut(auth); } 
    else { signInWithPopup(auth, provider).catch(err => alert("تأكد من تفعيل Google في Firebase!")); }
};

// مراقبة حالة المستخدم وتحديث البايو
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('publish-area').style.display = "block";
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-img').src = user.photoURL;
        document.getElementById('user-bio').innerText = "عضو في إمبراطورية SLAM 🖤🤍";
        document.getElementById('login-btn').innerText = "خروج";
    } else {
        document.getElementById('publish-area').style.display = "none";
        document.getElementById('login-btn').innerText = "دخول بجوجل";
    }
});

// وظيفة النشر مع الهاشتاج
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

// عرض المنشورات حية (المشاهدات x10)
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    const container = document.getElementById('posts-container');
    container.innerHTML = "";
    snapshot.forEach((doc) => {
        const post = doc.data();
        const fakeViews = (post.views || 1) * 10;
        container.innerHTML += `
            <div class="post-card">
                <img src="${post.photo}" style="width:35px; border-radius:50%; vertical-align:middle;">
                <strong>${post.author}</strong>
                <p>${post.text}</p>
                <div class="post-stats">👁️ ${fakeViews} مشاهدة | #SLAM 🖤🤍</div>
                <button onclick="alert('تم الحظر بنجاح')" style="font-size:10px; color:red; border:none; background:none; cursor:pointer;">🚫 حظر</button>
            </div>`;
    });
});

// وظائف القائمة الجانبية (تبديل الأقسام)
window.showSection = (section) => {
    alert("قسم " + section + " سيتم تفعيله بالكامل بعد ربط الـ Realtime Database للدردشة!");
};

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SLAM | إمبراطورية القصص</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <nav class="navbar">
        <div class="logo">SLAM</div>
        <input type="text" class="search-bar" placeholder="بحث عن #هاشتاج...">
        <button id="login-btn" style="background:white; color:#ff4b91; border:none; padding:5px 15px; border-radius:15px; cursor:pointer; font-weight:bold;">دخول بجوجل</button>
    </nav>

    <div class="main-layout">
        <aside class="sidebar">
            <div class="mini-profile">
                <img src="https://via.placeholder.com/80" id="user-img" class="profile-img">
                <h3 id="user-name">زائر</h3>
                <p id="user-bio">سجل دخولك لتبدأ القصة</p>
            </div>
            <nav class="menu">
                <button onclick="location.reload()">🏠 الرئيسية</button>
            </nav>
        </aside>

        <main class="feed">
            <div class="publish-box" id="publish-area" style="display:none;">
                <textarea id="post-input" placeholder="اكتب قصتك.. لا تنسَ #SLAM"></textarea>
                <div class="actions">
                    <button class="post-btn" id="publish-btn">نشر الآن 🚀</button>
                </div>
            </div>

            <div id="posts-container">
                </div>
        </main>
    </div>

    <script type="module" src="app.js"></script>
</body>
</html>
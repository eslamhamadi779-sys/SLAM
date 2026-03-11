:root {
    --pink: #ff4b91;
    --light-pink: #fff0f5;
    --bg: #f8f9fa;
}

body {
    background-color: var(--bg);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
}

.navbar {
    background-color: var(--pink);
    color: white;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-bar {
    padding: 8px 15px;
    border-radius: 20px;
    border: none;
    width: 40%;
}

.main-layout {
    display: flex;
    max-width: 1000px;
    margin: 20px auto;
    gap: 20px;
    padding: 0 15px;
}

.sidebar {
    flex: 1;
    background: white;
    padding: 20px;
    border-radius: 15px;
    height: fit-content;
    border: 1px solid #ffdae9;
    text-align: center;
}

.profile-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid var(--pink);
    object-fit: cover;
}

.menu button {
    display: block;
    width: 100%;
    margin-top: 15px;
    padding: 10px;
    border: none;
    background: var(--light-pink);
    color: var(--pink);
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
}

.feed {
    flex: 2;
}

.publish-box {
    background: white;
    padding: 20px;
    border-radius: 15px;
    border: 1px solid #ffdae9;
    margin-bottom: 20px;
}

textarea {
    width: 100%;
    height: 100px;
    border: none;
    outline: none;
    font-size: 16px;
    resize: none;
}

.post-btn {
    background: var(--pink);
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    float: left;
}

/* تصحيح للموبايل */
@media (max-width: 768px) {
    .main-layout {
        flex-direction: column;
    }
    .search-bar {
        display: none;
    }
}

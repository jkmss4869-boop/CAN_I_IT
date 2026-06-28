// DATA CẤU TRÚC GAME CHO PLAYER 1 VÀ PLAYER 2
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzT6xj7tZ_wP6TT3b4TLCFSIvld9JhGl-QLPMfBGnah_WI4DUKN7ijoy-MeD4_1-B1TAg/exec";

let GAME_CONFIG = {}; // <-- 1. Để rỗng hoàn toàn như thế này
let isDataLoaded = false;

let currentPlayer = 1;
let currentCardIndex = 0;
const THEME_STORAGE_KEY = "guess-noun-theme";

function setTheme(themeName) {
    document.body.dataset.theme = themeName;
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
        button.classList.toggle('active', button.dataset.themeChoice === themeName);
    });
}

function initTheme() {
    setTheme(localStorage.getItem(THEME_STORAGE_KEY) || "classic");
}

initTheme();

async function loadGameConfig() {
    try {
        // TỪ KHÓA 'await' NẰM TRONG HÀM ASYNC
        const res = await fetch(SHEET_API_URL);
        GAME_CONFIG = await res.json();
        isDataLoaded = true;
        console.log("Đã tải xong Config từ Google Sheet:", GAME_CONFIG);
        
        // Khi tải xong thì tự động chuyển sang màn hình Menu chính
        switchScreen('main-menu'); 
    } catch (err) {
        alert("Lỗi tải dữ liệu từ Google Sheet!");
        console.error(err);
    }
}

// Gọi hàm này ngay lập tức khi vừa mở trang web để nó đi lấy dữ liệu từ Sheet luôn
loadGameConfig();

function renderVerbList(containerId, verbs) {
    document.getElementById(containerId).innerHTML = verbs.map((v, i) => `
        <div class="v-box verb-highlight">
            <span>V${i + 1}</span>
            <div><strong>${v}</strong></div>
        </div>
    `).join('');
}

// Chuyển màn hình
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goToMenu() {
    switchScreen('main-menu');
}

// Khởi tạo game theo Player được chọn
function initGame(playerNum) {
    if (!isDataLoaded) {
        alert("Dữ liệu game đang được tải từ Sheet, vui lòng đợi 2 giây...");
        return;
    }
    currentPlayer = playerNum;
    currentCardIndex = 0;
    const config = GAME_CONFIG[currentPlayer];

    // Header
    document.getElementById('screen-header').innerText = config.headerTitle;
    const roleBadge = document.getElementById('player-role-badge');
    roleBadge.innerText = config.roleBadge;
    roleBadge.style.backgroundColor = config.roleColor;

    // Thiết lập tính chất Ngược Cột (Mirrored Columns) theo phác thảo của bạn
    const otherPlayer = currentPlayer === 1 ? 2 : 1;
    const otherConfig = GAME_CONFIG[otherPlayer];

    if (config.mirrored) {
        // P2 Screen: Cột trái là Verbs, Cột phải là Mystery
        document.getElementById('board-layout').style.flexDirection = 'row';
    } else {
        // P1 Screen: Cột trái là Mystery, Cột phải là Verbs
        document.getElementById('board-layout').style.flexDirection = 'row';
    }

    // Tiêu đề cột
    document.getElementById('verbs-header1').innerText = `P${currentPlayer} Verbs (Bên kia hỏi bạn)`;
    document.getElementById('verbs-header2').innerText = `P${otherPlayer} Verbs (Bạn hỏi bên kia)`;

    // Render danh sách Động từ
    renderVerbList('verb-boxes-left', config.myVerbs);
    renderVerbList('verb-boxes-right', otherConfig.myVerbs);

    // Populate Dropdown Answers
    [1, 2, 3].forEach(num => {
        const selectEl = document.getElementById(`ans-${num}`);
        selectEl.innerHTML = `<option value="">-- Đoán Item ${num} --</option>` +
            config.opponentOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    });

    document.getElementById('error-msg').innerText = '';

    // Render Carousel thẻ đầu tiên
    renderCarousel();
    switchScreen('game-screen');
}

// Cập nhật hiển thị Tranh (Carousel)
function renderCarousel() {
    const config = GAME_CONFIG[currentPlayer];
    const cardData = config.secretNouns[currentCardIndex];

    document.getElementById('card-tag').innerText = `Item #${currentCardIndex + 1}`;
    document.getElementById('card-img').src = cardData.image;
    document.getElementById('card-noun').innerText = cardData.name;

    // Dots
    const dotsContainer = document.getElementById('carousel-dots');
    dotsContainer.innerHTML = [0, 1, 2].map(i => `
        <div class="dot ${i === currentCardIndex ? 'active' : ''}"></div>
    `).join('');
}

function changeCard(dir) {
    currentCardIndex += dir;
    if (currentCardIndex < 0) currentCardIndex = 2;
    if (currentCardIndex > 2) currentCardIndex = 0;
    renderCarousel();
}

// Kiểm tra đáp án
function verifyAnswers() {
    const config = GAME_CONFIG[currentPlayer];
    const guess1 = document.getElementById('ans-1').value;
    const guess2 = document.getElementById('ans-2').value;
    const guess3 = document.getElementById('ans-3').value;
    const errEl = document.getElementById('error-msg');

    if (!guess1 || !guess2 || !guess3) {
        errEl.innerText = "⚠️ Bạn vui lòng chọn đầy đủ đáp án cho cả 3 từ nhé!";
        return;
    }

    const guesses = [guess1, guess2, guess3];
    const correct = config.correctAnswer;

    let isMatch = true;
    for (let i = 0; i < 3; i++) {
        if (guesses[i] !== correct[i]) {
            isMatch = false;
            break;
        }
    }

    if (isMatch) {
        document.getElementById('win-subtitle').innerText =
            `Chúc mừng ${config.roleBadge} đã suy luận chính xác bộ từ: ${correct.join(', ')}!`;
        switchScreen('victory-screen');
    } else {
        errEl.innerText = "❌ Sai rồi! Có từ chưa đúng vị trí. Hai bên hãy hỏi kỹ lại nhau nhé!";
    }
}
// ================= XỬ LÝ NHẠC NỀN =================
const bgMusic = new Audio('music/music.mp3'); 
bgMusic.loop = true;  // Tự động lặp lại bài hát khi hết
bgMusic.volume = 0.5; // Đặt âm lượng 50% cho đỡ chói tai (từ 0.0 đến 1.0)

const musicBtn = document.getElementById('musicBtn');

musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.textContent = '🔊 Tắt nhạc';
    } else {
        bgMusic.pause();
        musicBtn.textContent = '🔇 Bật nhạc';
    }
});
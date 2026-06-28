// DATA CẤU TRÚC GAME CHO PLAYER 1 VÀ PLAYER 2
const GAME_CONFIG = {
    1: {
        headerTitle: "PLAYER 1 SCREEN",
        roleBadge: "Teacher (Vỹ)",
        roleColor: "#4361ee",
        myVerbsHeader: "P1 Verbs (Bên kia hỏi bạn)",
        opponentMysteryHeader: "P2 Mystery (Đoán bên kia)",
        secretNouns: [
            { name: "A cake", image: "images/easy_chocolate_cake_31070_16x9.jpg" },
            { name: "Coffee", image: "images/easy_chocolate_cake_31070_16x9.jpg" },
            { name: "A coconut", image: "images/easy_chocolate_cake_31070_16x9.jpg" }
        ],
        myVerbs: ["CUT", "MAKE", "DRINK"],
        opponentOptions: ["A paper plane", "A drone", "A sandwich"],
        correctAnswer: ["A paper plane", "A drone", "A sandwich"],
        mirrored: false // Cột trái: Mystery | Cột phải: Verbs
    },
    2: {
        headerTitle: "PLAYER 2 SCREEN",
        roleBadge: "Student",
        roleColor: "#2ec4b6",
        myVerbsHeader: "P2 Verbs (Bên kia hỏi bạn)",
        opponentMysteryHeader: "P1 Mystery (Đoán bên kia)",
        // Cấu trúc mới trong GAME_CONFIG (thay thuộc tính icon bằng image)
        secretNouns: [
            { name: "A paper plane", image: "images/easy_chocolate_cake_31070_16x9.jpg" },
            { name: "A drone", image: "images/easy_chocolate_cake_31070_16x9.jpg" },
            { name: "A sandwich", image: "images/easy_chocolate_cake_31070_16x9.jpg" }
        ],
        myVerbs: ["FLY", "MAKE", "BUY"],
        opponentOptions: ["A cake", "Coffee", "A coconut"],
        correctAnswer: ["A cake", "Coffee", "A coconut"],
        mirrored: true // Đảo cột: Cột trái: Verbs | Cột phải: Mystery
    }
};

let currentPlayer = 1;
let currentCardIndex = 0;

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
    document.getElementById('verbs-header1').innerText = `P${currentPlayer} Verbs (Ben kia hoi ban)`;
    document.getElementById('verbs-header2').innerText = `P${otherPlayer} Verbs (Ban hoi ben kia)`;

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

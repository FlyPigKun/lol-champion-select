// ===== 分路定义 =====
const lanes = [
    { id: 'top', name: '上单', icon: '&#9650;', roles: ['fighter','tank'] },
    { id: 'jungle', name: '打野', icon: '&#9733;', roles: ['fighter','assassin','tank'] },
    { id: 'mid', name: '中单', icon: '&#9830;', roles: ['mage','assassin'] },
    { id: 'adc', name: '下路', icon: '&#9654;', roles: ['marksman'] },
    { id: 'support', name: '辅助', icon: '&#9829;', roles: ['support','tank'] },
];

// ===== 状态 =====
let players = [];
let currentFilter = 'all';
let nextId = 1;

// ===== 开场动画 =====
function playIntro() {
    const intro = document.getElementById('intro');
    setTimeout(() => intro.classList.add('fade-out'), 2000);
    setTimeout(() => intro.style.display = 'none', 2800);
}

// ===== 队伍管理 =====
function addPlayer() {
    if (players.length >= 5) return;
    players.push({ id: nextId++, name: '', lane: '' });
    renderTeam();
    updateAddBtn();
}

function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    renderTeam();
    updateAddBtn();
}

function updatePlayerName(id, name) {
    const p = players.find(p => p.id === id);
    if (p) p.name = name;
}

function selectLane(playerId, laneId) {
    const p = players.find(p => p.id === playerId);
    if (p) p.lane = laneId;
    renderTeam();
}

function updateAddBtn() {
    const btn = document.getElementById('add-player-btn');
    if (players.length >= 5) {
        btn.style.display = 'none';
    } else {
        btn.style.display = '';
    }
}

function renderTeam() {
    const container = document.getElementById('team-slots');
    container.innerHTML = players.map((p, idx) => {
        const laneOptions = lanes.map(l => {
            const taken = players.some(other => other.id !== p.id && other.lane === l.id);
            const selected = p.lane === l.id;
            const cls = `lane-btn ${selected ? 'selected' : ''} ${taken ? 'taken' : ''}`;
            return `<button class="${cls}" onclick="selectLane(${p.id},'${l.id}')" ${taken ? 'disabled' : ''} title="${l.name}">
                <span class="lane-icon">${l.icon}</span>
                <span class="lane-name">${l.name}</span>
            </button>`;
        }).join('');

        return `<div class="player-slot" style="animation-delay:${idx * 0.08}s">
            <div class="slot-header">
                <span class="slot-num">${idx + 1}</span>
                <input type="text" class="player-name-input" placeholder="玩家${idx + 1}"
                    value="${escapeAttr(p.name)}"
                    oninput="updatePlayerName(${p.id}, this.value)" maxlength="12">
                <button class="remove-btn" onclick="removePlayer(${p.id})" title="移除">&times;</button>
            </div>
            <div class="lane-select">
                ${laneOptions}
            </div>
        </div>`;
    }).join('');
}

// ===== 抽选 =====
function rollTeam() {
    if (players.length === 0) return;

    // 没有名字的填默认
    players.forEach((p, i) => {
        if (!p.name.trim()) p.name = '玩家' + (i + 1);
    });

    // 没选分路的随机分配未被选的分路
    const takenLanes = players.filter(p => p.lane).map(p => p.lane);
    const freeLanes = lanes.map(l => l.id).filter(l => !takenLanes.includes(l));
    players.forEach(p => {
        if (!p.lane && freeLanes.length > 0) {
            const idx = Math.floor(Math.random() * freeLanes.length);
            p.lane = freeLanes.splice(idx, 1)[0];
        }
        if (!p.lane) {
            p.lane = lanes[Math.floor(Math.random() * lanes.length)].id;
        }
    });

    // 为每个玩家根据分路抽英雄
    const usedChampions = new Set();
    const results = players.map(p => {
        const lane = lanes.find(l => l.id === p.lane);
        // 找匹配分路的英雄
        let pool = champions.filter(c =>
            c.roles.some(r => lane.roles.includes(r)) && !usedChampions.has(c.id)
        );
        // 如果池子空了就用全部未选的
        if (pool.length === 0) {
            pool = champions.filter(c => !usedChampions.has(c.id));
        }
        const champ = pool[Math.floor(Math.random() * pool.length)];
        usedChampions.add(champ.id);
        return { player: p, lane, champion: champ };
    });

    showResults(results);
    renderTeam();
}

function showResults(results) {
    const section = document.getElementById('result-section');
    const container = document.getElementById('result-cards');
    section.style.display = '';

    // 先清空并触发动画
    container.innerHTML = '';

    // 抽卡动画：逐个翻转出现
    results.forEach((r, i) => {
        setTimeout(() => {
            const card = createResultCard(r, i);
            container.appendChild(card);
            // 触发动画
            requestAnimationFrame(() => card.classList.add('revealed'));
        }, i * 400);
    });

    // 滚动到结果
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function createResultCard(r, index) {
    const div = document.createElement('div');
    div.className = 'result-card';
    div.style.animationDelay = index * 0.1 + 's';

    const rolesHtml = r.champion.roles.map(role =>
        `<span class="role-tag" style="background:${roleColors[role]}">${roleNames[role]}</span>`
    ).join('');

    div.innerHTML = `
        <div class="rcard-inner">
            <div class="rcard-lane">
                <span class="rcard-lane-icon">${r.lane.icon}</span>
                <span>${r.lane.name}</span>
            </div>
            <div class="rcard-splash">
                <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}"
                    onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22><rect fill=%22%230a1628%22 width=%22120%22 height=%22120%22/><text x=%2260%22 y=%2268%22 text-anchor=%22middle%22 fill=%22%23c8aa6e%22 font-size=%2240%22>?</text></svg>'">
            </div>
            <div class="rcard-info">
                <div class="rcard-champion">${r.champion.title}</div>
                <div class="rcard-subtitle">${r.champion.name}</div>
                <div class="rcard-roles">${rolesHtml}</div>
            </div>
            <div class="rcard-player">
                <span class="rcard-player-label">玩家</span>
                <span class="rcard-player-name">${escapeHtml(r.player.name)}</span>
            </div>
        </div>
    `;
    return div;
}

// ===== 英雄图鉴 =====
function filterRole(role) {
    currentFilter = role;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    renderRoster();
}

function renderRoster() {
    const search = document.getElementById('search-input').value.trim().toLowerCase();
    let filtered = champions;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(c => c.roles.includes(currentFilter));
    }
    if (search) {
        filtered = filtered.filter(c =>
            c.name.includes(search) || c.title.includes(search) ||
            c.en.toLowerCase().includes(search) || c.id.toLowerCase().includes(search)
        );
    }

    document.getElementById('roster-count').textContent = filtered.length;

    const grid = document.getElementById('roster-grid');
    grid.innerHTML = filtered.map(c => {
        const rolesHtml = c.roles.map(r =>
            `<span class="mini-role" style="background:${roleColors[r]}">${roleNames[r]}</span>`
        ).join('');
        return `<div class="champ-card">
            <div class="champ-img-wrap">
                <img src="${getChampionImg(c.id)}" alt="${c.en}" loading="lazy"
                    onerror="this.parentElement.innerHTML='<div class=\\'champ-placeholder\\'>${c.title.charAt(0)}</div>'">
            </div>
            <div class="champ-meta">
                <div class="champ-name">${c.title}</div>
                <div class="champ-sub">${c.name}</div>
                <div class="champ-roles">${rolesHtml}</div>
            </div>
        </div>`;
    }).join('');
}

// ===== 工具 =====
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}
function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ===== 初始化 =====
playIntro();
// 默认添加一个玩家
addPlayer();
renderRoster();

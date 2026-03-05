// ===== BP 助手逻辑 =====

const bpLanes = [
    { id: 'top', name: '上单', icon: '&#9650;' },
    { id: 'jungle', name: '打野', icon: '&#9733;' },
    { id: 'mid', name: '中单', icon: '&#9830;' },
    { id: 'adc', name: '下路', icon: '&#9654;' },
    { id: 'support', name: '辅助', icon: '&#9829;' },
];

// 状态
let selectedLane = 'mid';
let allyPicks = [null, null, null, null, null]; // 5个己方位置
let enemyPicks = [null, null, null, null, null];
let bannedChamps = [];
const MAX_BANS = 10;

let pickerMode = null; // 'ally', 'enemy', 'ban'
let pickerIndex = 0;
let pickerLaneFilter = 'all';

// ===== 初始化 =====
function initBP() {
    renderLaneBar();
    renderBans();
    renderAllyPicks();
    renderEnemyPicks();
    updateRecommendations();
}

// ===== 分路选择 =====
function renderLaneBar() {
    const bar = document.getElementById('bp-lane-bar');
    bar.innerHTML = bpLanes.map(l => {
        const active = l.id === selectedLane ? 'active' : '';
        return `<button class="bp-lane-btn ${active}" onclick="selectBPLane('${l.id}')">
            <span class="bp-lane-icon">${l.icon}</span>
            <span class="bp-lane-name">${l.name}</span>
        </button>`;
    }).join('');
}

function selectBPLane(laneId) {
    selectedLane = laneId;
    renderLaneBar();
    updateRecommendations();
}

// ===== Ban 区 =====
function renderBans() {
    const container = document.getElementById('bp-bans');
    let html = '';
    for (let i = 0; i < MAX_BANS; i++) {
        const champ = bannedChamps[i];
        if (champ) {
            html += `<div class="bp-ban-slot filled" onclick="removeBan(${i})" title="点击移除">
                <img src="${getChampionImg(champ.id)}" alt="${champ.en}"
                    onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23300%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22%23e84057%22 font-size=%2216%22>X</text></svg>'">
                <div class="ban-x">X</div>
                <div class="ban-name">${champ.title}</div>
            </div>`;
        } else {
            html += `<div class="bp-ban-slot empty" onclick="openPicker('ban',${i})">
                <span class="ban-plus">+</span>
            </div>`;
        }
    }
    container.innerHTML = html;
}

function removeBan(index) {
    bannedChamps.splice(index, 1);
    renderBans();
    updateRecommendations();
    renderBanRecs();
}

// ===== 己方/敌方选择 =====
function renderAllyPicks() {
    const container = document.getElementById('ally-picks');
    container.innerHTML = allyPicks.map((champ, i) => {
        const lane = bpLanes[i];
        if (champ) {
            const tier = getChampTier(champ.id, lane.id);
            const tierLabel = getTierLabel(tier);
            const tierColor = getTierColor(tier);
            return `<div class="bp-pick-slot filled ally-filled" onclick="clearPick('ally',${i})">
                <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
                <img src="${getChampionImg(champ.id)}" alt="${champ.en}"
                    onerror="this.parentElement.querySelector('.pick-champ-name').textContent='${champ.title}'">
                <div class="pick-champ-name">${champ.title}</div>
                <div class="pick-tier" style="color:${tierColor}">${tierLabel}</div>
            </div>`;
        }
        return `<div class="bp-pick-slot empty" onclick="openPicker('ally',${i})">
            <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
            <span class="pick-plus">+</span>
        </div>`;
    }).join('');
}

function renderEnemyPicks() {
    const container = document.getElementById('enemy-picks');
    container.innerHTML = enemyPicks.map((champ, i) => {
        const lane = bpLanes[i];
        if (champ) {
            const tier = getChampTier(champ.id, lane.id);
            const tierLabel = getTierLabel(tier);
            const tierColor = getTierColor(tier);
            return `<div class="bp-pick-slot filled enemy-filled" onclick="clearPick('enemy',${i})">
                <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
                <img src="${getChampionImg(champ.id)}" alt="${champ.en}"
                    onerror="this.parentElement.querySelector('.pick-champ-name').textContent='${champ.title}'">
                <div class="pick-champ-name">${champ.title}</div>
                <div class="pick-tier" style="color:${tierColor}">${tierLabel}</div>
            </div>`;
        }
        return `<div class="bp-pick-slot empty" onclick="openPicker('enemy',${i})">
            <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
            <span class="pick-plus">+</span>
        </div>`;
    }).join('');
}

function clearPick(side, index) {
    if (side === 'ally') {
        allyPicks[index] = null;
        renderAllyPicks();
    } else {
        enemyPicks[index] = null;
        renderEnemyPicks();
    }
    updateRecommendations();
}

// ===== 英雄选择器 =====
function openPicker(mode, index) {
    pickerMode = mode;
    pickerIndex = index;
    pickerLaneFilter = 'all';

    const title = document.getElementById('picker-title');
    if (mode === 'ban') {
        title.textContent = 'Ban 英雄';
    } else if (mode === 'ally') {
        title.textContent = '选择己方英雄 - ' + bpLanes[index].name;
        pickerLaneFilter = bpLanes[index].id;
    } else {
        title.textContent = '选择敌方英雄 - ' + bpLanes[index].name;
        pickerLaneFilter = bpLanes[index].id;
    }

    document.getElementById('picker-search').value = '';
    renderPickerLaneFilter();
    renderPickerGrid();
    document.getElementById('champ-picker').style.display = 'flex';
}

function closePicker() {
    document.getElementById('champ-picker').style.display = 'none';
}

function renderPickerLaneFilter() {
    const container = document.getElementById('picker-lane-filter');
    const allLanes = [{ id: 'all', name: '全部' }, ...bpLanes];
    container.innerHTML = allLanes.map(l => {
        const active = l.id === pickerLaneFilter ? 'active' : '';
        return `<button class="picker-filter-btn ${active}" onclick="setPickerLane('${l.id}')">${l.name}</button>`;
    }).join('');
}

function setPickerLane(laneId) {
    pickerLaneFilter = laneId;
    renderPickerLaneFilter();
    renderPickerGrid();
}

function filterPicker() {
    renderPickerGrid();
}

function getUsedIds() {
    const ids = new Set();
    allyPicks.forEach(c => { if (c) ids.add(c.id); });
    enemyPicks.forEach(c => { if (c) ids.add(c.id); });
    bannedChamps.forEach(c => ids.add(c.id));
    return ids;
}

function renderPickerGrid() {
    const search = document.getElementById('picker-search').value.trim().toLowerCase();
    const used = getUsedIds();

    let filtered = champions;

    if (pickerLaneFilter !== 'all') {
        filtered = filtered.filter(c => c.lanes.includes(pickerLaneFilter));
    }
    if (search) {
        filtered = filtered.filter(c =>
            c.name.includes(search) || c.title.includes(search) ||
            c.en.toLowerCase().includes(search) || c.id.toLowerCase().includes(search)
        );
    }

    // 按 Tier 排序（当前选择分路）
    const sortLane = pickerLaneFilter !== 'all' ? pickerLaneFilter : selectedLane;
    filtered.sort((a, b) => getChampTier(b.id, sortLane) - getChampTier(a.id, sortLane));

    const grid = document.getElementById('picker-grid');
    grid.innerHTML = filtered.map(c => {
        const isUsed = used.has(c.id);
        const tier = getChampTier(c.id, sortLane);
        const tierLabel = getTierLabel(tier);
        const tierColor = getTierColor(tier);
        return `<div class="picker-champ ${isUsed ? 'used' : ''}" onclick="${isUsed ? '' : `pickChampion('${c.id}')`}">
            <img src="${getChampionImg(c.id)}" alt="${c.en}"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%230a1628%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2238%22 text-anchor=%22middle%22 fill=%22%23c8aa6e%22 font-size=%2220%22>?</text></svg>'">
            <div class="picker-champ-name">${c.title}</div>
            <div class="picker-champ-tier" style="color:${tierColor}">${tierLabel}</div>
        </div>`;
    }).join('');
}

function pickChampion(champId) {
    const champ = champions.find(c => c.id === champId);
    if (!champ) return;

    if (pickerMode === 'ban') {
        if (bannedChamps.length < MAX_BANS) {
            bannedChamps.push(champ);
        }
        renderBans();
        renderBanRecs();
    } else if (pickerMode === 'ally') {
        allyPicks[pickerIndex] = champ;
        renderAllyPicks();
    } else if (pickerMode === 'enemy') {
        enemyPicks[pickerIndex] = champ;
        renderEnemyPicks();
    }

    closePicker();
    updateRecommendations();
}

// ===== 推荐系统 =====
function updateRecommendations() {
    const section = document.getElementById('bp-recommendations');
    const container = document.getElementById('bp-rec-cards');
    const label = document.getElementById('rec-lane-label');

    const enemyList = enemyPicks.filter(c => c !== null).map(c => ({ id: c.id }));
    const bannedIds = bannedChamps.map(c => c.id);
    const allyIds = allyPicks.filter(c => c !== null).map(c => c.id);

    const laneInfo = bpLanes.find(l => l.id === selectedLane);
    label.innerHTML = `<span style="color:var(--gold)">${laneInfo.icon} ${laneInfo.name}</span>`;

    if (enemyList.length === 0 && allyIds.length === 0) {
        // 没有任何选择时，显示该分路 Tier 列表
        section.style.display = '';
        const data = tierData[selectedLane];
        if (!data) { container.innerHTML = ''; return; }

        const allIds = [...(data.S || []), ...(data.A || [])];
        const available = allIds.filter(id => !bannedIds.includes(id));
        container.innerHTML = available.slice(0, 8).map(id => {
            const c = champions.find(ch => ch.id === id);
            if (!c) return '';
            const tier = getChampTier(id, selectedLane);
            return createRecCard(c, tier, 0, []);
        }).join('');
        return;
    }

    section.style.display = '';
    const recs = getRecommendations(selectedLane, enemyList, bannedIds, allyIds);

    container.innerHTML = recs.map(r => {
        const counterInfo = getCounterInfo(r.champion.id, enemyList);
        return createRecCard(r.champion, r.tier, r.score, counterInfo);
    }).join('');

    renderBanRecs();
}

function getCounterInfo(champId, enemyList) {
    const info = [];
    const cd = counters[champId];
    if (!cd) return info;

    enemyList.forEach(e => {
        if (cd.strong && cd.strong.includes(e.id)) {
            const ec = champions.find(c => c.id === e.id);
            if (ec) info.push({ type: 'strong', target: ec.title });
        }
        if (cd.weak && cd.weak.includes(e.id)) {
            const ec = champions.find(c => c.id === e.id);
            if (ec) info.push({ type: 'weak', target: ec.title });
        }
    });
    return info;
}

function createRecCard(champ, tier, score, counterInfo) {
    const tierLabel = getTierLabel(tier);
    const tierColor = getTierColor(tier);

    let counterHtml = '';
    if (counterInfo.length > 0) {
        counterHtml = counterInfo.map(ci => {
            if (ci.type === 'strong') {
                return `<span class="counter-tag strong">克制 ${ci.target}</span>`;
            }
            return `<span class="counter-tag weak">被克制 ${ci.target}</span>`;
        }).join('');
    }

    return `<div class="bp-rec-card" onclick="quickPickRec('${champ.id}')">
        <div class="rec-img-wrap">
            <img src="${getChampionImg(champ.id)}" alt="${champ.en}"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect fill=%22%230a1628%22 width=%2280%22 height=%2280%22/><text x=%2240%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%23c8aa6e%22 font-size=%2224%22>?</text></svg>'">
            <div class="rec-tier-badge" style="background:${tierColor}">${tierLabel}</div>
        </div>
        <div class="rec-info">
            <div class="rec-champ-name">${champ.title}</div>
            <div class="rec-champ-sub">${champ.name}</div>
            ${score > 0 ? `<div class="rec-score">评分 ${score}</div>` : ''}
            <div class="rec-counters">${counterHtml}</div>
        </div>
    </div>`;
}

function quickPickRec(champId) {
    // 找到己方对应分路的空位
    const laneIndex = bpLanes.findIndex(l => l.id === selectedLane);
    if (laneIndex >= 0 && !allyPicks[laneIndex]) {
        const champ = champions.find(c => c.id === champId);
        if (champ) {
            allyPicks[laneIndex] = champ;
            renderAllyPicks();
            updateRecommendations();
        }
    }
}

function renderBanRecs() {
    const container = document.getElementById('bp-ban-recs');
    const bannedIds = bannedChamps.map(c => c.id);
    const recs = getBanRecommendations(selectedLane, bannedIds);

    container.innerHTML = recs.map(r => {
        const tierColor = getTierColor(r.tier);
        const tierLabel = getTierLabel(r.tier);
        return `<div class="bp-ban-rec" onclick="quickBan('${r.champion.id}')">
            <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}"
                onerror="this.style.display='none'">
            <span class="ban-rec-name">${r.champion.title}</span>
            <span class="ban-rec-tier" style="color:${tierColor}">${tierLabel}</span>
        </div>`;
    }).join('');
}

function quickBan(champId) {
    if (bannedChamps.length >= MAX_BANS) return;
    const used = getUsedIds();
    if (used.has(champId)) return;
    const champ = champions.find(c => c.id === champId);
    if (champ) {
        bannedChamps.push(champ);
        renderBans();
        renderBanRecs();
        updateRecommendations();
    }
}

// ===== 初始化 =====
initBP();

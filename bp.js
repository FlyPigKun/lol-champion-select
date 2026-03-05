// ===== BP 模拟助手 =====

// LOL 标准 BP 顺序（20步）
// B=蓝色方, R=红色方, ban=禁用, pick=选择
const BP_SEQUENCE = [
    // Ban Phase 1 (6 bans)
    { side: 'blue', action: 'ban', label: '蓝色方 Ban 1' },
    { side: 'red',  action: 'ban', label: '红色方 Ban 1' },
    { side: 'blue', action: 'ban', label: '蓝色方 Ban 2' },
    { side: 'red',  action: 'ban', label: '红色方 Ban 2' },
    { side: 'blue', action: 'ban', label: '蓝色方 Ban 3' },
    { side: 'red',  action: 'ban', label: '红色方 Ban 3' },
    // Pick Phase 1
    { side: 'blue', action: 'pick', label: '蓝色方 Pick 1' },
    { side: 'red',  action: 'pick', label: '红色方 Pick 1' },
    { side: 'red',  action: 'pick', label: '红色方 Pick 2' },
    { side: 'blue', action: 'pick', label: '蓝色方 Pick 2' },
    { side: 'blue', action: 'pick', label: '蓝色方 Pick 3' },
    { side: 'red',  action: 'pick', label: '红色方 Pick 3' },
    // Ban Phase 2 (4 bans)
    { side: 'red',  action: 'ban', label: '红色方 Ban 4' },
    { side: 'blue', action: 'ban', label: '蓝色方 Ban 4' },
    { side: 'red',  action: 'ban', label: '红色方 Ban 5' },
    { side: 'blue', action: 'ban', label: '蓝色方 Ban 5' },
    // Pick Phase 2
    { side: 'red',  action: 'pick', label: '红色方 Pick 4' },
    { side: 'blue', action: 'pick', label: '蓝色方 Pick 4' },
    { side: 'blue', action: 'pick', label: '蓝色方 Pick 5' },
    { side: 'red',  action: 'pick', label: '红色方 Pick 5' },
];

const LANES = [
    { id: 'top', name: '上单', icon: '&#9650;' },
    { id: 'jungle', name: '打野', icon: '&#9733;' },
    { id: 'mid', name: '中单', icon: '&#9830;' },
    { id: 'adc', name: '下路', icon: '&#9654;' },
    { id: 'support', name: '辅助', icon: '&#9829;' },
];

// 状态
let mySide = 'blue';
let myLane = 'mid';
let currentStep = 0;
let history = []; // 每步记录 { champId, step }

let blueBans = [];
let redBans = [];
let bluePicks = [];
let redPicks = [];

let pickerLaneFilter = 'all';

// ===== 设置页 =====
function initSetup() {
    renderSetupLanes();
}

function renderSetupLanes() {
    const container = document.getElementById('setup-lanes');
    container.innerHTML = LANES.map(l => {
        const active = l.id === myLane ? 'active' : '';
        return `<button class="setup-lane-btn ${active}" onclick="setMyLane('${l.id}')">
            <span>${l.icon}</span> ${l.name}
        </button>`;
    }).join('');
}

function setSide(side) {
    mySide = side;
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.classList.toggle('active', btn.classList.contains(side + '-side'));
    });
}

function setMyLane(laneId) {
    myLane = laneId;
    renderSetupLanes();
}

function startBP() {
    document.getElementById('bp-setup').style.display = 'none';
    document.getElementById('bp-flow').style.display = '';
    resetState();
    renderAll();
}

// ===== 状态管理 =====
function resetState() {
    currentStep = 0;
    history = [];
    blueBans = [];
    redBans = [];
    bluePicks = [];
    redPicks = [];
}

function resetBP() {
    resetState();
    renderAll();
}

function getAllUsedIds() {
    const ids = new Set();
    blueBans.forEach(c => ids.add(c.id));
    redBans.forEach(c => ids.add(c.id));
    bluePicks.forEach(c => ids.add(c.id));
    redPicks.forEach(c => ids.add(c.id));
    return ids;
}

function getEnemyPicks() {
    return mySide === 'blue' ? redPicks : bluePicks;
}
function getAllyPicks() {
    return mySide === 'blue' ? bluePicks : redPicks;
}
function getAllBannedIds() {
    return [...blueBans, ...redBans].map(c => c.id);
}

// ===== 当前步骤判断 =====
function getCurrentStep() {
    if (currentStep >= BP_SEQUENCE.length) return null;
    return BP_SEQUENCE[currentStep];
}

function isMyTurn() {
    const step = getCurrentStep();
    return step && step.side === mySide;
}

// ===== 渲染 =====
function renderAll() {
    renderBans();
    renderPicks();
    renderStepInfo();
    renderRecommendations();
}

function renderBans() {
    document.getElementById('blue-bans').innerHTML = renderBanSlots(blueBans, 5, 'blue');
    document.getElementById('red-bans').innerHTML = renderBanSlots(redBans, 5, 'red');
}

function renderBanSlots(bans, max, side) {
    let html = '';
    for (let i = 0; i < max; i++) {
        const c = bans[i];
        if (c) {
            html += `<div class="ban-slot filled">
                <img src="${getChampionImg(c.id)}" alt="${c.en}"
                    onerror="this.style.display='none'">
                <div class="ban-x">X</div>
                <div class="ban-label">${c.title}</div>
            </div>`;
        } else {
            // 判断是否是当前步骤要填的
            const isActive = isNextBanSlot(side, i);
            html += `<div class="ban-slot empty ${isActive ? 'active-slot' : ''}">
                <span class="ban-placeholder">${isActive ? '?' : ''}</span>
            </div>`;
        }
    }
    return html;
}

function isNextBanSlot(side, index) {
    const step = getCurrentStep();
    if (!step || step.action !== 'ban' || step.side !== side) return false;
    const bans = side === 'blue' ? blueBans : redBans;
    return index === bans.length;
}

function renderPicks() {
    document.getElementById('blue-picks').innerHTML = renderPickSlots(bluePicks, 5, 'blue');
    document.getElementById('red-picks').innerHTML = renderPickSlots(redPicks, 5, 'red');
}

function renderPickSlots(picks, max, side) {
    let html = '';
    for (let i = 0; i < max; i++) {
        const c = picks[i];
        if (c) {
            const tierLane = guessTierLane(c, i);
            const tier = getChampTier(c.id, tierLane);
            const tierLabel = getTierLabel(tier);
            const tierColor = getTierColor(tier);
            html += `<div class="pick-slot filled ${side}-pick-filled">
                <img src="${getChampionImg(c.id)}" alt="${c.en}"
                    onerror="this.style.display='none'">
                <div class="pick-info">
                    <span class="pick-name">${c.title}</span>
                    <span class="pick-sub">${c.name}</span>
                </div>
                <span class="pick-tier" style="color:${tierColor}">${tierLabel}</span>
            </div>`;
        } else {
            const isActive = isNextPickSlot(side, i);
            html += `<div class="pick-slot empty ${isActive ? 'active-slot' : ''}">
                <span class="pick-placeholder">${isActive ? '等待选择...' : ''}</span>
            </div>`;
        }
    }
    return html;
}

function guessTierLane(champ, index) {
    // 根据位置索引猜测分路
    const laneOrder = ['top', 'jungle', 'mid', 'adc', 'support'];
    if (champ.lanes && champ.lanes[0]) return champ.lanes[0];
    return laneOrder[index] || 'mid';
}

function isNextPickSlot(side, index) {
    const step = getCurrentStep();
    if (!step || step.action !== 'pick' || step.side !== side) return false;
    const picks = side === 'blue' ? bluePicks : redPicks;
    return index === picks.length;
}

function renderStepInfo() {
    const phaseInfo = document.getElementById('phase-info');
    const stepInfo = document.getElementById('step-info');
    const actions = document.getElementById('step-actions');

    const step = getCurrentStep();

    if (!step) {
        phaseInfo.textContent = 'BP 完成';
        phaseInfo.className = 'phase-info done';
        stepInfo.textContent = '阵容确定！';
        actions.innerHTML = '';
        renderFinalAnalysis();
        return;
    }

    // 阶段标识
    if (step.action === 'ban') {
        phaseInfo.textContent = 'BAN 阶段';
        phaseInfo.className = 'phase-info ban-phase';
    } else {
        phaseInfo.textContent = 'PICK 阶段';
        phaseInfo.className = 'phase-info pick-phase';
    }

    const isMine = step.side === mySide;
    const sideLabel = isMine ? '己方' : '敌方';
    const actionLabel = step.action === 'ban' ? '禁用' : '选择';

    stepInfo.innerHTML = `<span class="${isMine ? 'my-turn' : 'enemy-turn'}">${sideLabel}${actionLabel}</span> ${step.label}`;

    if (isMine) {
        actions.innerHTML = `<button class="select-champ-btn" onclick="openPicker()">选择英雄</button>`;
    } else {
        actions.innerHTML = `<button class="select-champ-btn enemy-select-btn" onclick="openPicker()">输入敌方${actionLabel}</button>`;
    }
}

// ===== 推荐 =====
function renderRecommendations() {
    const recSection = document.getElementById('rec-section');
    const banRecSection = document.getElementById('ban-rec-section');
    const step = getCurrentStep();

    recSection.style.display = 'none';
    banRecSection.style.display = 'none';

    if (!step) return;

    const isMine = step.side === mySide;

    if (step.action === 'ban') {
        // Ban 阶段推荐
        banRecSection.style.display = '';
        const bannedIds = getAllBannedIds();
        const recs = getBanRecommendations(myLane, bannedIds);
        const list = document.getElementById('ban-rec-list');
        list.innerHTML = recs.map(r => {
            const tierColor = getTierColor(r.tier);
            const tierLabel = getTierLabel(r.tier);
            const reason = buildBanReason(r.champion, r.tier);
            return `<div class="rec-item" onclick="confirmPick('${r.champion.id}')">
                <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}"
                    onerror="this.style.display='none'">
                <div class="rec-detail">
                    <span class="rec-name">${r.champion.title}</span>
                    <div class="rec-reason">${reason}</div>
                </div>
                <span class="rec-tier" style="color:${tierColor}">${tierLabel}</span>
            </div>`;
        }).join('');
    }

    if (step.action === 'pick' && isMine) {
        // Pick 阶段己方推荐
        recSection.style.display = '';
        const enemyPicks = getEnemyPicks().map(c => ({ id: c.id }));
        const bannedIds = getAllBannedIds();
        const allyIds = getAllyPicks().map(c => c.id);
        const recs = getRecommendations(myLane, enemyPicks, bannedIds, allyIds);

        const list = document.getElementById('rec-list');
        list.innerHTML = recs.map(r => {
            const tierColor = getTierColor(r.tier);
            const tierLabel = getTierLabel(r.tier);
            const counterInfo = getCounterInfo(r.champion.id, enemyPicks);
            let tags = counterInfo.map(ci => {
                if (ci.type === 'strong') return `<span class="ctag strong">克制 ${ci.target}</span>`;
                return `<span class="ctag weak">被克制 ${ci.target}</span>`;
            }).join('');
            const reason = buildPickReason(r.champion, r.tier, r.score, counterInfo, enemyPicks);
            return `<div class="rec-item rec-pick-item" onclick="confirmPick('${r.champion.id}')">
                <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}"
                    onerror="this.style.display='none'">
                <div class="rec-detail">
                    <span class="rec-name">${r.champion.title}</span>
                    <span class="rec-score">评分 ${r.score}</span>
                    <div class="rec-reason">${reason}</div>
                    <div class="rec-tags">${tags}</div>
                </div>
                <span class="rec-tier" style="color:${tierColor}">${tierLabel}</span>
            </div>`;
        }).join('');
    }

    if (step.action === 'pick' && !isMine) {
        // 敌方 Pick 时也显示推荐 Ban 提示
        recSection.style.display = '';
        const list = document.getElementById('rec-list');
        list.innerHTML = `<div class="rec-hint">请输入敌方选择的英雄</div>`;
    }
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

function renderFinalAnalysis() {
    const recSection = document.getElementById('rec-section');
    recSection.style.display = '';
    const list = document.getElementById('rec-list');

    const allyPicks = getAllyPicks();
    const enemyPicks = getEnemyPicks();

    let html = '<div class="final-analysis"><h4 class="final-title">对局分析</h4>';

    allyPicks.forEach(c => {
        const cd = counters[c.id];
        if (!cd) return;
        let matchups = [];
        enemyPicks.forEach(e => {
            if (cd.strong && cd.strong.includes(e.id)) {
                const ec = champions.find(ch => ch.id === e.id);
                if (ec) matchups.push(`<span class="ctag strong">克制 ${ec.title}</span>`);
            }
            if (cd.weak && cd.weak.includes(e.id)) {
                const ec = champions.find(ch => ch.id === e.id);
                if (ec) matchups.push(`<span class="ctag weak">被克制 ${ec.title}</span>`);
            }
        });
        if (matchups.length > 0) {
            html += `<div class="final-row">
                <span class="final-champ">${c.title}</span>
                <div class="final-tags">${matchups.join('')}</div>
            </div>`;
        }
    });

    html += '</div>';
    list.innerHTML = html;
}

// ===== 英雄选择器 =====
function openPicker() {
    const step = getCurrentStep();
    if (!step) return;

    pickerLaneFilter = 'all';

    const title = document.getElementById('picker-title');
    const isMine = step.side === mySide;
    if (step.action === 'ban') {
        title.textContent = (isMine ? '己方' : '敌方') + ' Ban';
    } else {
        title.textContent = (isMine ? '己方' : '敌方') + ' Pick';
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
    const allLanes = [{ id: 'all', name: '全部' }, ...LANES];
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

function renderPickerGrid() {
    const search = document.getElementById('picker-search').value.trim().toLowerCase();
    const used = getAllUsedIds();

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

    const sortLane = pickerLaneFilter !== 'all' ? pickerLaneFilter : myLane;
    filtered.sort((a, b) => getChampTier(b.id, sortLane) - getChampTier(a.id, sortLane));

    const grid = document.getElementById('picker-grid');
    grid.innerHTML = filtered.map(c => {
        const isUsed = used.has(c.id);
        const tier = getChampTier(c.id, sortLane);
        const tierLabel = getTierLabel(tier);
        const tierColor = getTierColor(tier);
        return `<div class="picker-champ ${isUsed ? 'used' : ''}" onclick="${isUsed ? '' : `confirmPick('${c.id}')`}">
            <img src="${getChampionImg(c.id)}" alt="${c.en}"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%230a1628%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2238%22 text-anchor=%22middle%22 fill=%22%23c8aa6e%22 font-size=%2220%22>?</text></svg>'">
            <div class="picker-champ-name">${c.title}</div>
            <div class="picker-champ-tier" style="color:${tierColor}">${tierLabel}</div>
        </div>`;
    }).join('');
}

// ===== 确认选择 =====
function confirmPick(champId) {
    const step = getCurrentStep();
    if (!step) return;

    const champ = champions.find(c => c.id === champId);
    if (!champ) return;

    // 检查是否已被使用
    if (getAllUsedIds().has(champId)) return;

    // 记录到对应位置
    if (step.action === 'ban') {
        if (step.side === 'blue') blueBans.push(champ);
        else redBans.push(champ);
    } else {
        if (step.side === 'blue') bluePicks.push(champ);
        else redPicks.push(champ);
    }

    history.push({ champId, step: currentStep });
    currentStep++;

    closePicker();
    renderAll();
}

// ===== 撤销 =====
function undoStep() {
    if (history.length === 0) return;

    const last = history.pop();
    currentStep = last.step;

    const step = BP_SEQUENCE[last.step];
    if (step.action === 'ban') {
        if (step.side === 'blue') blueBans.pop();
        else redBans.pop();
    } else {
        if (step.side === 'blue') bluePicks.pop();
        else redPicks.pop();
    }

    renderAll();
}

// ===== 推荐理由生成 =====
function buildBanReason(champ, tier) {
    const parts = [];
    const tierLabel = getTierLabel(tier);
    parts.push(`当前版本${myLane === champ.lanes[0] ? '该分路' : ''}${tierLabel}级强度`);

    const cd = counters[champ.id];
    if (cd && cd.strong && cd.strong.length > 0) {
        const targets = cd.strong.slice(0, 2).map(id => {
            const c = champions.find(ch => ch.id === id);
            return c ? c.title : id;
        });
        parts.push('克制 ' + targets.join('、'));
    }
    if (tier >= 5) parts.push('版本T0热门，不Ban必抢');
    return parts.join(' | ');
}

function buildPickReason(champ, tier, score, counterInfo, enemyList) {
    const parts = [];
    const tierLabel = getTierLabel(tier);
    parts.push(`${tierLabel}级 (Tier +${tier * 20})`);

    const strongs = counterInfo.filter(ci => ci.type === 'strong');
    const weaks = counterInfo.filter(ci => ci.type === 'weak');

    if (strongs.length > 0) {
        parts.push('克制敌方 ' + strongs.map(s => s.target).join('、') + ` (+${strongs.length * 30})`);
    }
    if (weaks.length > 0) {
        parts.push('注意被 ' + weaks.map(w => w.target).join('、') + ` 克制 (-${weaks.length * 20})`);
    }

    // 反向克制提示
    let reverseStrong = 0, reverseWeak = 0;
    enemyList.forEach(e => {
        const ecd = counters[e.id];
        if (ecd) {
            if (ecd.strong && ecd.strong.includes(champ.id)) reverseWeak++;
            if (ecd.weak && ecd.weak.includes(champ.id)) reverseStrong++;
        }
    });
    if (reverseStrong > 0) parts.push(`敌方${reverseStrong}人怕你 (+${reverseStrong * 15})`);
    if (reverseWeak > 0) parts.push(`敌方${reverseWeak}人打你舒服 (-${reverseWeak * 15})`);

    return parts.join(' | ');
}

// ===== 初始化 =====
initSetup();

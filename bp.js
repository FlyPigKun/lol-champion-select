// ===== BP 模拟助手 =====

const BP_SEQUENCE = [
    // Ban Phase 1
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
    // Ban Phase 2
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

// ===== 状态 =====
let mySide = 'blue';
let myLane = 'mid';
let currentStep = 0;
let history = []; // { champId, lane, step }

let blueBans = [];
let redBans = [];
// picks 按分路存：{ top: champ, jungle: champ, ... }
let bluePicks = {};
let redPicks = {};

// Pick 阶段的子状态：先选分路，再选英雄
let pickLane = null; // 当前 pick 步骤选择的分路
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
    bluePicks = {};
    redPicks = {};
    pickLane = null;
}

function resetBP() {
    resetState();
    renderAll();
}

function getAllUsedIds() {
    const ids = new Set();
    blueBans.forEach(c => ids.add(c.id));
    redBans.forEach(c => ids.add(c.id));
    Object.values(bluePicks).forEach(c => ids.add(c.id));
    Object.values(redPicks).forEach(c => ids.add(c.id));
    return ids;
}

function getEnemyPicksArr() {
    const picks = mySide === 'blue' ? redPicks : bluePicks;
    return Object.entries(picks).map(([lane, champ]) => ({ id: champ.id, lane }));
}
function getAllyPicksArr() {
    const picks = mySide === 'blue' ? bluePicks : redPicks;
    return Object.entries(picks).map(([lane, champ]) => ({ id: champ.id, lane }));
}
function getAllBannedIds() {
    return [...blueBans, ...redBans].map(c => c.id);
}
function getMyPicks() {
    return mySide === 'blue' ? bluePicks : redPicks;
}
function getEnemyPicks() {
    return mySide === 'blue' ? redPicks : bluePicks;
}
function getFilledLanes(picksObj) {
    return Object.keys(picksObj);
}
function getOpenLanes(picksObj) {
    const filled = getFilledLanes(picksObj);
    return LANES.filter(l => !filled.includes(l.id));
}

// ===== 当前步骤 =====
function getCurrentStep() {
    if (currentStep >= BP_SEQUENCE.length) return null;
    return BP_SEQUENCE[currentStep];
}

function isMyTurn() {
    const step = getCurrentStep();
    return step && step.side === mySide;
}

// ===== 渲染总控 =====
function renderAll() {
    renderBans();
    renderPicks();
    renderStepInfo();
    renderRecommendations();
}

// ===== Ban 区 =====
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
                <img src="${getChampionImg(c.id)}" alt="${c.en}" onerror="this.style.display='none'">
                <div class="ban-x">X</div>
                <div class="ban-label">${c.title}</div>
            </div>`;
        } else {
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

// ===== Pick 区（按分路显示） =====
function renderPicks() {
    document.getElementById('blue-picks').innerHTML = renderPickByLane(bluePicks, 'blue');
    document.getElementById('red-picks').innerHTML = renderPickByLane(redPicks, 'red');
}

function renderPickByLane(picksObj, side) {
    return LANES.map(lane => {
        const c = picksObj[lane.id];
        // 判断这个槽位是否是当前正在选的
        const step = getCurrentStep();
        const isActive = step && step.action === 'pick' && step.side === side && pickLane === lane.id;

        if (c) {
            const tier = getChampTier(c.id, lane.id);
            const tierLabel = getTierLabel(tier);
            const tierColor = getTierColor(tier);
            return `<div class="pick-slot filled ${side}-pick-filled">
                <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
                <img src="${getChampionImg(c.id)}" alt="${c.en}" onerror="this.style.display='none'">
                <div class="pick-info">
                    <span class="pick-name">${c.title}</span>
                    <span class="pick-sub">${c.name}</span>
                </div>
                <span class="pick-tier" style="color:${tierColor}">${tierLabel}</span>
            </div>`;
        }
        return `<div class="pick-slot empty ${isActive ? 'active-slot' : ''}">
            <div class="pick-lane-tag">${lane.icon} ${lane.name}</div>
            <span class="pick-placeholder">${isActive ? '选择中...' : ''}</span>
        </div>`;
    }).join('');
}

// ===== 步骤信息 + 分路选择 =====
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

    const isMine = step.side === mySide;
    const sideLabel = isMine ? '己方' : '敌方';

    if (step.action === 'ban') {
        phaseInfo.textContent = 'BAN 阶段';
        phaseInfo.className = 'phase-info ban-phase';
        stepInfo.innerHTML = `<span class="${isMine ? 'my-turn' : 'enemy-turn'}">${sideLabel}禁用</span> ${step.label}`;
        actions.innerHTML = `<button class="select-champ-btn ${isMine ? '' : 'enemy-select-btn'}" onclick="openPicker()">
            ${isMine ? '选择要 Ban 的英雄' : '输入敌方 Ban'}
        </button>`;
    } else {
        phaseInfo.textContent = 'PICK 阶段';
        phaseInfo.className = 'phase-info pick-phase';

        if (!pickLane) {
            // 还没选分路 → 显示分路选择
            stepInfo.innerHTML = `<span class="${isMine ? 'my-turn' : 'enemy-turn'}">${sideLabel}选人</span> ${step.label}`;
            const targetPicks = step.side === 'blue' ? bluePicks : redPicks;
            const openLanes = getOpenLanes(targetPicks);

            let hint = isMine ? '你要选哪个分路？' : '敌方选了哪个分路？';
            actions.innerHTML = `<div class="lane-choose-hint">${hint}</div>
                <div class="lane-choose-bar">
                    ${openLanes.map(l => `<button class="lane-choose-btn" onclick="chooseLane('${l.id}')">
                        <span>${l.icon}</span> ${l.name}
                    </button>`).join('')}
                </div>`;
        } else {
            // 已选分路 → 显示选英雄按钮
            const laneInfo = LANES.find(l => l.id === pickLane);
            stepInfo.innerHTML = `<span class="${isMine ? 'my-turn' : 'enemy-turn'}">${sideLabel}选人</span> ${step.label} <span class="step-lane-tag">${laneInfo.icon} ${laneInfo.name}</span>`;
            actions.innerHTML = `<button class="select-champ-btn ${isMine ? '' : 'enemy-select-btn'}" onclick="openPicker()">
                ${isMine ? '选择英雄' : '输入敌方选择'}
            </button>
            <button class="change-lane-btn" onclick="changeLane()">换分路</button>`;
        }
    }
}

function chooseLane(laneId) {
    pickLane = laneId;
    renderAll();
}

function changeLane() {
    pickLane = null;
    renderAll();
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
        banRecSection.style.display = '';
        const bannedIds = getAllBannedIds();
        // Ban 推荐：对面可能对你分路威胁最大的英雄
        const recs = getBanRecommendations(myLane, bannedIds);
        const list = document.getElementById('ban-rec-list');
        list.innerHTML = recs.map(r => {
            const tierColor = getTierColor(r.tier);
            const tierLabel = getTierLabel(r.tier);
            const reasonRows = buildBanReason(r.champion, r.tier);
            return `<div class="rec-item" onclick="confirmPick('${r.champion.id}')">
                <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}" onerror="this.style.display='none'">
                <span class="rec-name">${r.champion.title}</span>
                <span class="rec-tier" style="color:${tierColor}">${tierLabel}</span>
                <div class="rec-tooltip">${reasonRows}</div>
            </div>`;
        }).join('');
    }

    if (step.action === 'pick') {
        if (!pickLane) {
            // 还没选分路，不显示推荐
            return;
        }

        if (isMine) {
            // 己方 Pick → 根据选定分路推荐
            recSection.style.display = '';
            const enemyArr = getEnemyPicksArr();
            const bannedIds = getAllBannedIds();
            const allyIds = getAllyPicksArr().map(p => p.id);
            const recs = getRecommendations(pickLane, enemyArr, bannedIds, allyIds);

            const list = document.getElementById('rec-list');
            list.innerHTML = recs.map(r => {
                const tierColor = getTierColor(r.tier);
                const tierLabel = getTierLabel(r.tier);
                const counterInfo = getCounterInfoByLane(r.champion.id, enemyArr);
                let tags = counterInfo.map(ci => {
                    if (ci.type === 'strong') return `<span class="ctag strong">克制 ${ci.target}</span>`;
                    return `<span class="ctag weak">被克制 ${ci.target}</span>`;
                }).join('');
                const reasonRows = buildPickReason(r.champion, r.tier, r.score, counterInfo, enemyArr, pickLane);
                return `<div class="rec-item" onclick="confirmPick('${r.champion.id}')">
                    <img src="${getChampionImg(r.champion.id)}" alt="${r.champion.en}" onerror="this.style.display='none'">
                    <div class="rec-detail">
                        <span class="rec-name">${r.champion.title}</span>
                        <span class="rec-score">评分 ${r.score}</span>
                        <div class="rec-tags">${tags}</div>
                    </div>
                    <span class="rec-tier" style="color:${tierColor}">${tierLabel}</span>
                    <div class="rec-tooltip">${reasonRows}</div>
                </div>`;
            }).join('');
        } else {
            // 敌方 Pick → 提示输入
            recSection.style.display = '';
            const laneInfo = LANES.find(l => l.id === pickLane);
            const list = document.getElementById('rec-list');
            list.innerHTML = `<div class="rec-hint">请输入敌方 ${laneInfo.name} 位置选择的英雄</div>`;
        }
    }
}

function getCounterInfoByLane(champId, enemyArr) {
    const info = [];
    const cd = counters[champId];
    if (!cd) return info;
    enemyArr.forEach(e => {
        if (cd.strong && cd.strong.includes(e.id)) {
            const ec = champions.find(c => c.id === e.id);
            const lane = LANES.find(l => l.id === e.lane);
            if (ec) info.push({ type: 'strong', target: ec.title, lane: lane ? lane.name : '' });
        }
        if (cd.weak && cd.weak.includes(e.id)) {
            const ec = champions.find(c => c.id === e.id);
            const lane = LANES.find(l => l.id === e.lane);
            if (ec) info.push({ type: 'weak', target: ec.title, lane: lane ? lane.name : '' });
        }
    });
    return info;
}

function renderFinalAnalysis() {
    const recSection = document.getElementById('rec-section');
    recSection.style.display = '';
    const list = document.getElementById('rec-list');

    const allyPicks = mySide === 'blue' ? bluePicks : redPicks;
    const enemyPicks = mySide === 'blue' ? redPicks : bluePicks;

    let html = '<div class="final-analysis"><h4 class="final-title">对局分析</h4>';

    LANES.forEach(lane => {
        const ally = allyPicks[lane.id];
        const enemy = enemyPicks[lane.id];
        if (!ally) return;

        let matchups = [];
        // 对位分析（同分路）
        if (enemy) {
            const cd = counters[ally.id];
            if (cd) {
                if (cd.strong && cd.strong.includes(enemy.id)) {
                    matchups.push(`<span class="ctag strong">对线克制 ${enemy.title}</span>`);
                }
                if (cd.weak && cd.weak.includes(enemy.id)) {
                    matchups.push(`<span class="ctag weak">对线被克 ${enemy.title}</span>`);
                }
            }
            const ecd = counters[enemy.id];
            if (ecd) {
                if (ecd.strong && ecd.strong.includes(ally.id)) {
                    matchups.push(`<span class="ctag weak">${enemy.title} 克制你</span>`);
                }
                if (ecd.weak && ecd.weak.includes(ally.id)) {
                    matchups.push(`<span class="ctag strong">${enemy.title} 怕你</span>`);
                }
            }
        }

        // 团战层面（其他路对手）
        Object.entries(enemyPicks).forEach(([eLane, eChamp]) => {
            if (eLane === lane.id) return; // 跳过同路
            const cd = counters[ally.id];
            if (cd) {
                if (cd.strong && cd.strong.includes(eChamp.id))
                    matchups.push(`<span class="ctag strong">团战克制 ${eChamp.title}(${LANES.find(l=>l.id===eLane).name})</span>`);
                if (cd.weak && cd.weak.includes(eChamp.id))
                    matchups.push(`<span class="ctag weak">团战怕 ${eChamp.title}(${LANES.find(l=>l.id===eLane).name})</span>`);
            }
        });

        const tier = getChampTier(ally.id, lane.id);
        const tierColor = getTierColor(tier);
        const tierLabel = getTierLabel(tier);

        html += `<div class="final-row">
            <span class="final-lane">${lane.icon} ${lane.name}</span>
            <span class="final-champ">${ally.title}</span>
            <span class="final-tier" style="color:${tierColor}">${tierLabel}</span>
            ${enemy ? `<span class="final-vs">vs</span><span class="final-enemy">${enemy.title}</span>` : ''}
            <div class="final-tags">${matchups.join('')}</div>
        </div>`;
    });

    html += '</div>';
    list.innerHTML = html;
}

// ===== 英雄选择器 =====
function openPicker() {
    const step = getCurrentStep();
    if (!step) return;

    const isMine = step.side === mySide;

    if (step.action === 'pick') {
        // Pick 阶段默认筛选到选定分路
        pickerLaneFilter = pickLane || 'all';
    } else {
        pickerLaneFilter = 'all';
    }

    const title = document.getElementById('picker-title');
    if (step.action === 'ban') {
        title.textContent = (isMine ? '己方' : '敌方') + ' Ban';
    } else {
        const laneInfo = LANES.find(l => l.id === pickLane);
        title.textContent = (isMine ? '己方' : '敌方') + ' Pick - ' + (laneInfo ? laneInfo.name : '');
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
    if (getAllUsedIds().has(champId)) return;

    if (step.action === 'ban') {
        if (step.side === 'blue') blueBans.push(champ);
        else redBans.push(champ);
        history.push({ champId, lane: null, step: currentStep });
    } else {
        if (!pickLane) return; // 必须先选分路
        const targetPicks = step.side === 'blue' ? bluePicks : redPicks;
        targetPicks[pickLane] = champ;
        history.push({ champId, lane: pickLane, step: currentStep });
    }

    currentStep++;
    pickLane = null;

    closePicker();
    renderAll();
}

// ===== 撤销 =====
function undoStep() {
    if (history.length === 0) return;

    const last = history.pop();
    currentStep = last.step;
    pickLane = null;

    const step = BP_SEQUENCE[last.step];
    if (step.action === 'ban') {
        if (step.side === 'blue') blueBans.pop();
        else redBans.pop();
    } else {
        const targetPicks = step.side === 'blue' ? bluePicks : redPicks;
        delete targetPicks[last.lane];
    }

    renderAll();
}

// ===== 推荐理由 =====
function tipRow(icon, cls, text) {
    return `<div class="tooltip-row"><span class="tooltip-icon ${cls}">${icon}</span>${text}</div>`;
}

function buildBanReason(champ, tier) {
    let html = '';
    const tierLabel = getTierLabel(tier);
    const tierColor = getTierColor(tier);
    const isMyLane = champ.lanes && champ.lanes[0] === myLane;

    html += tipRow('&#9733;', 'info', `<b style="color:${tierColor}">${tierLabel}</b> 级强度${isMyLane ? '（你的对位分路）' : ''}`);

    if (tier >= 5) {
        html += tipRow('&#9888;', 'down', '版本 T0 热门，不 Ban 必抢');
    }

    const cd = counters[champ.id];
    if (cd && cd.strong && cd.strong.length > 0) {
        const targets = cd.strong.map(id => {
            const c = champions.find(ch => ch.id === id);
            return c ? c.title : id;
        });
        html += tipRow('&#9876;', 'down', '擅长克制：' + targets.join('、'));
    }
    if (cd && cd.weak && cd.weak.length > 0) {
        const targets = cd.weak.map(id => {
            const c = champions.find(ch => ch.id === id);
            return c ? c.title : id;
        });
        html += tipRow('&#9711;', 'up', '弱点：怕 ' + targets.join('、'));
    }
    return html;
}

function buildPickReason(champ, tier, score, counterInfo, enemyArr, lane) {
    let html = '';
    const tierLabel = getTierLabel(tier);
    const tierColor = getTierColor(tier);
    const laneInfo = LANES.find(l => l.id === lane);

    html += tipRow('&#9733;', 'info', `${laneInfo.name} <b style="color:${tierColor}">${tierLabel}</b> 级（Tier 加分 +${tier * 20}）`);

    // 对位克制
    const sameLaneEnemy = enemyArr.find(e => e.lane === lane);
    if (sameLaneEnemy) {
        const ec = champions.find(c => c.id === sameLaneEnemy.id);
        const eName = ec ? ec.title : sameLaneEnemy.id;
        const cd = counters[champ.id];
        if (cd && cd.strong && cd.strong.includes(sameLaneEnemy.id)) {
            html += tipRow('&#10003;', 'up', `对线克制 ${eName}（+30）`);
        }
        if (cd && cd.weak && cd.weak.includes(sameLaneEnemy.id)) {
            html += tipRow('&#10007;', 'down', `对线被克制 ${eName}（-20）`);
        }
    }

    // 其他敌方的克制关系
    const strongs = counterInfo.filter(ci => ci.type === 'strong');
    const weaks = counterInfo.filter(ci => ci.type === 'weak');
    if (strongs.length > 0) {
        html += tipRow('&#9876;', 'up', '克制敌方 ' + strongs.map(s => `${s.target}(${s.lane})`).join('、') + `（+${strongs.length * 30}）`);
    }
    if (weaks.length > 0) {
        html += tipRow('&#9888;', 'down', '被敌方克制 ' + weaks.map(w => `${w.target}(${w.lane})`).join('、') + `（-${weaks.length * 20}）`);
    }

    // 反向克制
    let rUp = 0, rDown = 0;
    enemyArr.forEach(e => {
        const ecd = counters[e.id];
        if (ecd) {
            if (ecd.strong && ecd.strong.includes(champ.id)) rDown++;
            if (ecd.weak && ecd.weak.includes(champ.id)) rUp++;
        }
    });
    if (rUp > 0) html += tipRow('&#10003;', 'up', `敌方 ${rUp} 人怕你（+${rUp * 15}）`);
    if (rDown > 0) html += tipRow('&#10007;', 'down', `敌方 ${rDown} 人打你舒服（-${rDown * 15}）`);

    html += tipRow('&#9654;', 'info', `综合评分：<b>${score}</b>`);

    return html;
}

// ===== 初始化 =====
initSetup();

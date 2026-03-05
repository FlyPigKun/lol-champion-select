// ===== OPGG/U.GG Meta 数据 (2025 S1 赛季) =====
// Tier: S=5, A=4, B=3, C=2, D=1
// 每个分路的 Tier List + 克制关系

const tierData = {
  top: {
    S: ['Aatrox','Ambessa','Camille','Darius','Fiora','Gwen','Irelia','Jax','KSante','Riven','Yone'],
    A: ['Akali','Aurora','Chogath','Gangplank','Garen','Gnar','Gragas','Illaoi','Jayce','Kennen','Malphite','Mordekaiser','Nasus','Ornn','Renekton','Rumble','Sett','Shen','Sion','Tryndamere','Urgot','Vladimir','Volibear','Yorick'],
    B: ['DrMundo','Kayle','Kled','Olaf','Poppy','Quinn','Rengar','Ryze','Singed','TahmKench','Teemo','Trundle','Udyr','Vayne','Warwick','Wukong','Zac'],
    C: ['Akshan','Heimerdinger']
  },
  jungle: {
    S: ['BelVeth','Briar','Diana','Ekko','Graves','Hecarim','Kayn','Khazix','LeeSin','Lillia','Viego','Vi','XinZhao'],
    A: ['Amumu','Elise','Evelynn','Fiddlesticks','Ivern','JarvanIV','Karthus','Kindred','MasterYi','Nidalee','Nocturne','Nunu','RekSai','Sejuani','Shaco','Shyvana','Skarner','Sylas','Taliyah','Udyr','Volibear','Warwick','Wukong','Zac'],
    B: ['DrMundo','Gragas','Jax','Olaf','Poppy','Rammus','Rengar','Talon','Trundle','Varus'],
    C: ['Mordekaiser','Pantheon']
  },
  mid: {
    S: ['Ahri','Akali','Aurora','Azir','Cassiopeia','Hwei','Katarina','Leblanc','Orianna','Syndra','Viktor','Yone','Zed'],
    A: ['Anivia','Annie','AurelionSol','Corki','Ekko','Fizz','Galio','Gangplank','Irelia','Kassadin','Lissandra','Lucian','Malzahar','Naafiri','Qiyana','Ryze','Smolder','Sylas','TwistedFate','Veigar','Vex','Vladimir','Xerath','Yasuo','Zoe'],
    B: ['Akshan','Brand','Diana','Heimerdinger','Jayce','Neeko','Pantheon','Rumble','Talon','Tristana','Ziggs','Zilean'],
    C: ['Lux','Vel\'koz']
  },
  adc: {
    S: ['Aphelios','Caitlyn','Draven','Ezreal','Jhin','Jinx','Kaisa','KogMaw','Samira','Vayne','Xayah','Zeri'],
    A: ['Ashe','Kalista','Lucian','MissFortune','Nilah','Sivir','Smolder','Tristana','Twitch','Varus'],
    B: ['Corki','Seraphine','Swain','Veigar','Yasuo','Ziggs'],
    C: ['Heimerdinger','Senna']
  },
  support: {
    S: ['Blitzcrank','Leona','Lulu','Nami','Nautilus','Pyke','Rell','Thresh'],
    A: ['Alistar','Bard','Braum','Janna','Karma','Lux','Milio','Morgana','Rakan','Renata','Senna','Seraphine','Sona','Soraka','Yuumi','Zyra'],
    B: ['Amumu','Annie','Ashe','Brand','Fiddlesticks','Galio','Heimerdinger','Hwei','Maokai','Neeko','Pantheon','Poppy','Sett','Shaco','Shen','Swain','TahmKench','Taric','Velkoz','Xerath','Zilean'],
    C: ['Malphite','Twitch']
  }
};

// 克制关系：counters[英雄ID] = [被该英雄克制的英雄列表]
// 基于 OPGG 对位胜率数据
const counters = {
  // TOP
  Aatrox: { weak: ['Fiora','Irelia','Riven'], strong: ['Malphite','Ornn','Sion'] },
  Camille: { weak: ['Jax','Darius','Renekton'], strong: ['Gangplank','Vladimir','Kayle'] },
  Darius: { weak: ['Vayne','Quinn','Kayle'], strong: ['Garen','Nasus','Malphite'] },
  Fiora: { weak: ['Malphite','Kennen','Quinn'], strong: ['Aatrox','Camille','Jax'] },
  Garen: { weak: ['Darius','Vayne','Quinn'], strong: ['Nasus','Singed','Sion'] },
  Gnar: { weak: ['Irelia','Camille','Yasuo'], strong: ['Malphite','Ornn','Chogath'] },
  Gwen: { weak: ['Akali','Irelia','Riven'], strong: ['Ornn','Sion','Malphite'] },
  Irelia: { weak: ['Tryndamere','Volibear','Sett'], strong: ['Gnar','Kennen','Vladimir'] },
  Jax: { weak: ['Malphite','Kennen','Akali'], strong: ['Fiora','Nasus','Tryndamere'] },
  KSante: { weak: ['Fiora','Vayne','Gwen'], strong: ['Ornn','Sion','Malphite'] },
  Mordekaiser: { weak: ['Fiora','Vayne','Gangplank'], strong: ['Garen','Nasus','Sion'] },
  Nasus: { weak: ['Darius','Illaoi','Vayne'], strong: ['Kayle','Singed','Vladimir'] },
  Ornn: { weak: ['Fiora','Vayne','Mordekaiser'], strong: ['Malphite','Sion','Chogath'] },
  Renekton: { weak: ['Vayne','Quinn','Illaoi'], strong: ['Riven','Yasuo','Yone'] },
  Riven: { weak: ['Renekton','Malphite','Sett'], strong: ['Gangplank','Kayle','Vladimir'] },
  Sett: { weak: ['Gangplank','Kennen','Vayne'], strong: ['Aatrox','Irelia','Riven'] },
  Shen: { weak: ['Mordekaiser','Darius','Fiora'], strong: ['Gnar','Kennen','Vayne'] },
  Yone: { weak: ['Renekton','Sett','Malphite'], strong: ['Kayle','Vladimir','Gangplank'] },
  Volibear: { weak: ['Fiora','Vayne','Kayle'], strong: ['Irelia','Riven','Yasuo'] },
  Vladimir: { weak: ['Aatrox','Irelia','Camille'], strong: ['Malphite','Ornn','Chogath'] },

  // JUNGLE
  BelVeth: { weak: ['Graves','LeeSin','Elise'], strong: ['MasterYi','Shyvana','Amumu'] },
  Briar: { weak: ['Rammus','Amumu','Sejuani'], strong: ['Evelynn','Nidalee','Kindred'] },
  Diana: { weak: ['Graves','LeeSin','Elise'], strong: ['Evelynn','MasterYi','Shyvana'] },
  Ekko: { weak: ['LeeSin','Khazix','Graves'], strong: ['Amumu','Sejuani','Nunu'] },
  Graves: { weak: ['Rammus','Sejuani','Vi'], strong: ['Evelynn','Nidalee','Kindred'] },
  Hecarim: { weak: ['Rammus','Amumu','Warwick'], strong: ['Evelynn','Nidalee','Kindred'] },
  Kayn: { weak: ['LeeSin','Elise','Nidalee'], strong: ['Amumu','Sejuani','Nunu'] },
  Khazix: { weak: ['Rammus','LeeSin','Elise'], strong: ['Evelynn','MasterYi','Kindred'] },
  LeeSin: { weak: ['Rammus','Amumu','Volibear'], strong: ['Evelynn','Nidalee','Kayn'] },
  Lillia: { weak: ['LeeSin','Khazix','Vi'], strong: ['Amumu','Sejuani','Nunu'] },
  Viego: { weak: ['LeeSin','Elise','Rammus'], strong: ['MasterYi','Shyvana','Amumu'] },
  Vi: { weak: ['Graves','Ekko','Kayn'], strong: ['Evelynn','MasterYi','Kindred'] },

  // MID
  Ahri: { weak: ['Kassadin','Fizz','Yasuo'], strong: ['Veigar','Lux','Xerath'] },
  Akali: { weak: ['Galio','Annie','Malzahar'], strong: ['Kassadin','Katarina','Zed'] },
  Azir: { weak: ['Kassadin','Fizz','Irelia'], strong: ['Orianna','Viktor','Syndra'] },
  Cassiopeia: { weak: ['Fizz','Kassadin','Zed'], strong: ['Orianna','Viktor','Azir'] },
  Hwei: { weak: ['Fizz','Zed','Katarina'], strong: ['Veigar','Lux','Xerath'] },
  Katarina: { weak: ['Galio','Kassadin','Annie'], strong: ['Veigar','Lux','Xerath'] },
  Leblanc: { weak: ['Galio','Kassadin','Malzahar'], strong: ['Veigar','Orianna','Viktor'] },
  Orianna: { weak: ['Fizz','Kassadin','Zed'], strong: ['Malzahar','Veigar','Annie'] },
  Syndra: { weak: ['Fizz','Kassadin','Zed'], strong: ['Malzahar','Veigar','Annie'] },
  Viktor: { weak: ['Fizz','Kassadin','Irelia'], strong: ['Malzahar','Veigar','Lux'] },
  Yasuo: { weak: ['Renekton','Pantheon','Annie'], strong: ['Veigar','Lux','Orianna'] },
  Zed: { weak: ['Galio','Malzahar','Lissandra'], strong: ['Lux','Xerath','Veigar'] },
  Yone: { weak: ['Renekton','Sett','Annie'], strong: ['Kayle','Vladimir','Kassadin'] },

  // ADC
  Aphelios: { weak: ['Draven','Lucian','Caitlyn'], strong: ['Ezreal','Sivir','Ashe'] },
  Caitlyn: { weak: ['Vayne','Kaisa','Draven'], strong: ['Aphelios','Ashe','MissFortune'] },
  Draven: { weak: ['Vayne','Ezreal','Kaisa'], strong: ['Aphelios','Ashe','Jinx'] },
  Ezreal: { weak: ['Draven','Caitlyn','MissFortune'], strong: ['Vayne','Kaisa','Jinx'] },
  Jhin: { weak: ['Vayne','Kaisa','Samira'], strong: ['Ashe','Sivir','MissFortune'] },
  Jinx: { weak: ['Draven','Lucian','Caitlyn'], strong: ['Ashe','Sivir','KogMaw'] },
  Kaisa: { weak: ['Draven','Caitlyn','MissFortune'], strong: ['Ezreal','Jhin','Ashe'] },
  KogMaw: { weak: ['Draven','Lucian','Caitlyn'], strong: ['Ezreal','Sivir','Ashe'] },
  Samira: { weak: ['Caitlyn','Ashe','Jhin'], strong: ['Vayne','Ezreal','Kaisa'] },
  Vayne: { weak: ['Draven','Caitlyn','MissFortune'], strong: ['Jhin','Ashe','Sivir'] },
  Xayah: { weak: ['Caitlyn','Draven','MissFortune'], strong: ['Vayne','Ezreal','Kaisa'] },

  // SUPPORT
  Blitzcrank: { weak: ['Morgana','Sivir','Leona'], strong: ['Sona','Soraka','Yuumi'] },
  Leona: { weak: ['Morgana','Janna','Braum'], strong: ['Sona','Soraka','Lulu'] },
  Lulu: { weak: ['Blitzcrank','Nautilus','Zyra'], strong: ['Vayne','KogMaw','Jinx'] },
  Nami: { weak: ['Blitzcrank','Nautilus','Leona'], strong: ['Sona','Soraka','Janna'] },
  Nautilus: { weak: ['Morgana','Janna','Braum'], strong: ['Sona','Soraka','Yuumi'] },
  Pyke: { weak: ['Morgana','Leona','Braum'], strong: ['Sona','Soraka','Yuumi'] },
  Thresh: { weak: ['Morgana','Janna','Lulu'], strong: ['Sona','Soraka','Yuumi'] },
  Rell: { weak: ['Janna','Morgana','Lulu'], strong: ['Sona','Soraka','Yuumi'] },
  Morgana: { weak: ['Zyra','Brand','Xerath'], strong: ['Blitzcrank','Nautilus','Leona'] },
  Lux: { weak: ['Blitzcrank','Nautilus','Leona'], strong: ['Sona','Soraka','Janna'] },
};

// 获取英雄在某分路的 Tier
function getChampTier(champId, lane) {
  const data = tierData[lane];
  if (!data) return 0;
  if (data.S && data.S.includes(champId)) return 5;
  if (data.A && data.A.includes(champId)) return 4;
  if (data.B && data.B.includes(champId)) return 3;
  if (data.C && data.C.includes(champId)) return 2;
  return 1;
}

function getTierLabel(tier) {
  return ['?','D','C','B','A','S'][tier] || '?';
}

function getTierColor(tier) {
  return ['#555','#888','#4fc3f7','#66bb6a','#ffd740','#e84057'][tier] || '#555';
}

// 推荐算法：根据对面已选英雄，推荐克制英雄
function getRecommendations(lane, enemyPicks, bannedIds, allyPickIds) {
  const excluded = new Set([...bannedIds, ...allyPickIds, ...enemyPicks.map(p => p.id)]);

  // 找该分路所有可用英雄
  const pool = champions.filter(c => c.lanes.includes(lane) && !excluded.has(c.id));

  // 计算每个英雄的推荐分
  const scored = pool.map(c => {
    let score = 0;
    const tier = getChampTier(c.id, lane);
    score += tier * 20; // Tier 权重

    // 克制加分：如果能克制对面已选的英雄
    const counterData = counters[c.id];
    if (counterData && counterData.strong) {
      enemyPicks.forEach(enemy => {
        if (counterData.strong.includes(enemy.id)) {
          score += 30;
        }
      });
    }

    // 被克制减分
    if (counterData && counterData.weak) {
      enemyPicks.forEach(enemy => {
        if (counterData.weak.includes(enemy.id)) {
          score -= 20;
        }
      });
    }

    // 反向检查：对面英雄是否克制我
    enemyPicks.forEach(enemy => {
      const enemyCounter = counters[enemy.id];
      if (enemyCounter) {
        if (enemyCounter.strong && enemyCounter.strong.includes(c.id)) {
          score -= 15;
        }
        if (enemyCounter.weak && enemyCounter.weak.includes(c.id)) {
          score += 15;
        }
      }
    });

    return { champion: c, score, tier };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8);
}

// 推荐 Ban
function getBanRecommendations(lane, bannedIds) {
  const excluded = new Set(bannedIds);
  const data = tierData[lane];
  if (!data) return [];

  // 优先 Ban S 级英雄
  const sTier = (data.S || []).filter(id => !excluded.has(id));
  const aTier = (data.A || []).filter(id => !excluded.has(id));
  const combined = [...sTier, ...aTier];

  return combined.slice(0, 6).map(id => {
    const c = champions.find(ch => ch.id === id);
    return { champion: c, tier: getChampTier(id, lane) };
  }).filter(r => r.champion);
}

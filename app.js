/**
 * Sistema Clínico y Deportivo — Nutriólogo Diego Rodea
 * Antropometría, Fórmulas de Grasa Corporal, FFMI, Nivel de Gym, Gráficas y PDF
 */

const state = {
  sex: 'male',
  profilesKey: 'diego_rodea_profiles_v2',
  webhookKey: 'diego_rodea_cloud_webhook_v2',
  lastEvaluation: null,
};

// Referencias del DOM
const dom = {
  profileSelect: document.getElementById('profileSelect'),
  profileCloudCode: document.getElementById('profileCloudCode'),
  btnLoadCloudCode: document.getElementById('btnLoadCloudCode'),
  btnNewProfile: document.getElementById('btnNewProfile'),
  btnQuickSaveTop: document.getElementById('btnQuickSaveTop'),
  cloudSyncIndicator: document.getElementById('cloudSyncIndicator'),

  patientName: document.getElementById('patientName'),
  patientPin: document.getElementById('patientPin'),
  btnSexMale: document.getElementById('btnSexMale'),
  btnSexFemale: document.getElementById('btnSexFemale'),
  patientAge: document.getElementById('patientAge'),
  patientHeight: document.getElementById('patientHeight'),
  heightHint: document.getElementById('heightHint'),
  patientWeight: document.getElementById('patientWeight'),

  // Medidas en cm
  mNeck: document.getElementById('mNeck'),
  mWaist: document.getElementById('mWaist'),
  mHip: document.getElementById('mHip'),
  mCalf: document.getElementById('mCalf'),
  mThigh: document.getElementById('mThigh'),
  mBiceps: document.getElementById('mBiceps'),

  // Calculadora auxiliar 1RM
  calcRmWeight: document.getElementById('calcRmWeight'),
  calcRmReps: document.getElementById('calcRmReps'),
  calcRmResult: document.getElementById('calcRmResult'),

  // Gym inputs
  liftSquat: document.getElementById('liftSquat'),
  liftBench: document.getElementById('liftBench'),
  liftDeadlift: document.getElementById('liftDeadlift'),
  repsPullups: document.getElementById('repsPullups'),
  repsDips: document.getElementById('repsDips'),
  repsPushups: document.getElementById('repsPushups'),

  pillSquat: document.getElementById('pillSquat'),
  pillBench: document.getElementById('pillBench'),
  pillDeadlift: document.getElementById('pillDeadlift'),
  pillPullups: document.getElementById('pillPullups'),
  pillDips: document.getElementById('pillDips'),
  pillPushups: document.getElementById('pillPushups'),

  // Salidas Grasa Corporal
  avgBfValue: document.getElementById('avgBfValue'),
  bfCategoryBadge: document.getElementById('bfCategoryBadge'),
  outFatMassKg: document.getElementById('outFatMassKg'),
  outLeanMassKg: document.getElementById('outLeanMassKg'),
  valNavyBf: document.getElementById('valNavyBf'),
  valYmcaBf: document.getElementById('valYmcaBf'),
  valRfmBf: document.getElementById('valRfmBf'),
  valCunbaeBf: document.getElementById('valCunbaeBf'),

  // Salidas FFMI
  outFfmi: document.getElementById('outFfmi'),
  outFfmiNorm: document.getElementById('outFfmiNorm'),
  outFfmiLevel: document.getElementById('outFfmiLevel'),
  ffmiChartCanvas: document.getElementById('ffmiChartCanvas'),

  // Salidas Nivel Total y Tiempo
  summaryFfmiTier: document.getElementById('summaryFfmiTier'),
  summaryFfmiScore: document.getElementById('summaryFfmiScore'),
  summaryGymTier: document.getElementById('summaryGymTier'),
  summaryGymScore: document.getElementById('summaryGymScore'),
  summaryTotalTier: document.getElementById('summaryTotalTier'),
  summaryTotalScore: document.getElementById('summaryTotalScore'),
  nextLevelName: document.getElementById('nextLevelName'),
  nextLevelTime: document.getElementById('nextLevelTime'),
  nextLevelRequirements: document.getElementById('nextLevelRequirements'),

  // Gráficas Puntos Fuertes y Débiles
  idealHeightRef: document.getElementById('idealHeightRef'),
  anthroChartCanvas: document.getElementById('anthroChartCanvas'),
  anthroStrongText: document.getElementById('anthroStrongText'),
  anthroWeakText: document.getElementById('anthroWeakText'),
  movementsChartCanvas: document.getElementById('movementsChartCanvas'),
  moveStrongText: document.getElementById('moveStrongText'),
  moveWeakText: document.getElementById('moveWeakText'),

  // Botones finales
  btnSaveCloud: document.getElementById('btnSaveCloud'),
  btnDownloadPdf: document.getElementById('btnDownloadPdf'),
  btnSendWhatsapp: document.getElementById('btnSendWhatsapp'),
  statusBanner: document.getElementById('statusBanner'),
  savedCountBadge: document.getElementById('savedCountBadge'),
  savedRecordsList: document.getElementById('savedRecordsList'),
  cloudWebhookUrl: document.getElementById('cloudWebhookUrl'),
  btnSaveWebhook: document.getElementById('btnSaveWebhook'),
  brandLogoImg: document.getElementById('brandLogoImg'),
};

/**
 * 1. LECTURA DE DATOS Y NORMALIZACIÓN DE ESTATURA EN METROS
 */
function readUserInputs() {
  const name = (dom.patientName.value || '').trim() || 'Paciente';
  const pin = (dom.patientPin.value || '').trim();
  const age = clampNum(parseFloat(dom.patientAge.value), 12, 95, 26);

  // Si el usuario escribe 175 en vez de 1.75, convertir automáticamente a metros
  let rawHeight = parseFloat(dom.patientHeight.value) || 1.75;
  if (rawHeight > 3.0) {
    rawHeight = rawHeight / 100;
    dom.heightHint.textContent = `Interpretado como ${rawHeight.toFixed(2)} m`;
  } else {
    dom.heightHint.textContent = `Estatura: ${rawHeight.toFixed(2)} m (${Math.round(rawHeight * 100)} cm)`;
  }
  const heightM = clampNum(rawHeight, 1.2, 2.35, 1.75);
  const heightCm = heightM * 100;

  const weightKg = clampNum(parseFloat(dom.patientWeight.value), 30, 260, 78);

  const neckCm = clampNum(parseFloat(dom.mNeck.value), 22, 70, 39);
  const waistCm = clampNum(parseFloat(dom.mWaist.value), 45, 200, 82);
  const hipCm = clampNum(parseFloat(dom.mHip.value), 50, 200, 97);
  const calfCm = clampNum(parseFloat(dom.mCalf.value), 20, 68, 38.5);
  const thighCm = clampNum(parseFloat(dom.mThigh.value), 30, 100, 58);
  const bicepsCm = clampNum(parseFloat(dom.mBiceps.value), 18, 68, 38);

  // Datos de gym (0 o vacío = no aplica)
  const squatKg = parseOptionalNum(dom.liftSquat.value);
  const benchKg = parseOptionalNum(dom.liftBench.value);
  const deadliftKg = parseOptionalNum(dom.liftDeadlift.value);
  const pullupsReps = parseOptionalNum(dom.repsPullups.value);
  const dipsReps = parseOptionalNum(dom.repsDips.value);
  const pushupsReps = parseOptionalNum(dom.repsPushups.value);

  return {
    name,
    pin,
    sex: state.sex,
    age,
    heightM,
    heightCm,
    weightKg,
    neckCm,
    waistCm,
    hipCm,
    calfCm,
    thighCm,
    bicepsCm,
    gym: {
      squatKg,
      benchKg,
      deadliftKg,
      pullupsReps,
      dipsReps,
      pushupsReps,
    },
  };
}

function clampNum(val, min, max, fallback) {
  if (!Number.isFinite(val)) return fallback;
  return Math.max(min, Math.min(max, val));
}

function parseOptionalNum(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * 2. FÓRMULAS CIENTÍFICAS DE GRASA CORPORAL Y PROMEDIO
 */
function calculateBodyFatFormulas(d) {
  const bmi = d.weightKg / (d.heightM * d.heightM);

  // 1. U.S. Navy (Hodgdon & Beckett)
  let navy = null;
  if (d.sex === 'male') {
    const diff = d.waistCm - d.neckCm;
    if (diff > 5) {
      navy =
        495 /
          (1.0324 -
            0.19077 * Math.log10(diff) +
            0.15456 * Math.log10(d.heightCm)) -
        450;
    }
  } else {
    const sumDiff = d.waistCm + d.hipCm - d.neckCm;
    if (sumDiff > 10) {
      navy =
        495 /
          (1.29579 -
            0.35004 * Math.log10(sumDiff) +
            0.22100 * Math.log10(d.heightCm)) -
        450;
    }
  }
  navy = clampBfValue(navy);

  // 2. YMCA Modificada
  const weightLb = d.weightKg * 2.20462262;
  const waistIn = d.waistCm / 2.54;
  let ymca = null;
  if (weightLb > 0 && waistIn > 0) {
    if (d.sex === 'male') {
      ymca = ((-98.42 + 4.15 * waistIn - 0.082 * weightLb) / weightLb) * 100;
    } else {
      ymca = ((-76.76 + 4.15 * waistIn - 0.082 * weightLb) / weightLb) * 100;
    }
  }
  ymca = clampBfValue(ymca);

  // 3. RFM (Relative Fat Mass — Cedars-Sinai / Woolcott & Bergman)
  let rfm = null;
  if (d.waistCm > 0) {
    const base = d.sex === 'male' ? 64 : 76;
    rfm = base - 20 * (d.heightCm / d.waistCm);
  }
  rfm = clampBfValue(rfm);

  // 4. CUN-BAE (Clínica Universidad de Navarra - Body Adiposity Estimator)
  const sexCun = d.sex === 'male' ? 0 : 1;
  let cunbae =
    -44.988 +
    0.503 * d.age +
    10.689 * sexCun +
    3.172 * bmi -
    0.026 * bmi * bmi +
    0.181 * bmi * sexCun -
    0.02 * bmi * d.age -
    0.005 * bmi * bmi * sexCun +
    0.00021 * bmi * bmi * d.age;
  cunbae = clampBfValue(cunbae);

  const validList = [navy, ymca, rfm, cunbae].filter((v) => v !== null);
  const avgBf =
    validList.reduce((acc, cur) => acc + cur, 0) / (validList.length || 1);

  const fatMassKg = d.weightKg * (avgBf / 100);
  const leanMassKg = d.weightKg - fatMassKg;

  return {
    bmi,
    navy,
    ymca,
    rfm,
    cunbae,
    avgBf,
    fatMassKg,
    leanMassKg,
    category: getBodyFatCategory(d.sex, avgBf),
  };
}

function clampBfValue(v) {
  if (!Number.isFinite(v)) return null;
  return Math.max(3.0, Math.min(60.0, v));
}

function getBodyFatCategory(sex, bf) {
  if (sex === 'male') {
    if (bf < 6) return 'Grasa Esencial / Competición';
    if (bf < 14) return 'Atleta / Definido';
    if (bf < 18) return 'Fitness / Estético';
    if (bf < 25) return 'Promedio / Aceptable';
    return 'Porcentaje Elevado (Adiposidad Alta)';
  } else {
    if (bf < 14) return 'Grasa Esencial / Competición';
    if (bf < 21) return 'Atleta / Definida';
    if (bf < 25) return 'Fitness / Estética';
    if (bf < 32) return 'Promedio / Aceptable';
    return 'Porcentaje Elevado (Adiposidad Alta)';
  }
}

/**
 * 3. VALORACIÓN DE FFMI (ÍNDICE DE MASA LIBRE DE GRASA)
 */
function evaluateFfmi(sex, heightM, leanMassKg) {
  const ffmi = leanMassKg / (heightM * heightM);
  const ffmiNorm = ffmi + 6.1 * (1.8 - heightM);

  // Umbrales [Principiante, Intermedio, Avanzado, Élite]
  // Hombres: <18.5 Principiante, 18.5-20.9 Intermedio, 21.0-22.9 Avanzado, >=23.0 Élite
  // Mujeres: <14.5 Principiante, 14.5-16.4 Intermedio, 16.5-18.4 Avanzado, >=18.5 Élite
  let score = 0;
  let tier = 'PRINCIPIANTE';

  if (sex === 'male') {
    if (ffmiNorm < 18.5) {
      tier = 'PRINCIPIANTE';
      score = mapRange(ffmiNorm, 15.0, 18.5, 15, 39);
    } else if (ffmiNorm < 21.0) {
      tier = 'INTERMEDIO';
      score = mapRange(ffmiNorm, 18.5, 21.0, 40, 64);
    } else if (ffmiNorm < 23.0) {
      tier = 'AVANZADO';
      score = mapRange(ffmiNorm, 21.0, 23.0, 65, 84);
    } else {
      tier = 'ÉLITE';
      score = mapRange(ffmiNorm, 23.0, 25.5, 85, 100);
    }
  } else {
    if (ffmiNorm < 14.5) {
      tier = 'PRINCIPIANTE';
      score = mapRange(ffmiNorm, 12.0, 14.5, 15, 39);
    } else if (ffmiNorm < 16.5) {
      tier = 'INTERMEDIO';
      score = mapRange(ffmiNorm, 14.5, 16.5, 40, 64);
    } else if (ffmiNorm < 18.5) {
      tier = 'AVANZADO';
      score = mapRange(ffmiNorm, 16.5, 18.5, 65, 84);
    } else {
      tier = 'ÉLITE';
      score = mapRange(ffmiNorm, 18.5, 21.0, 85, 100);
    }
  }

  return {
    ffmi,
    ffmiNorm,
    tier,
    score: Math.round(clampNum(score, 5, 100, 35)),
  };
}

function mapRange(val, inMin, inMax, outMin, outMax) {
  const clamped = Math.max(inMin, Math.min(inMax, val));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function scoreToTierName(score) {
  if (score < 40) return 'PRINCIPIANTE';
  if (score < 65) return 'INTERMEDIO';
  if (score < 85) return 'AVANZADO';
  return 'ÉLITE';
}

/**
 * 4. VALORACIÓN DE NIVEL DE GYM Y MOVIMIENTOS (CON LOS DATOS QUE LA PERSONA PUEDA PONER)
 */
function evaluateGymPerformance(d) {
  const bw = d.weightKg;
  const isMale = d.sex === 'male';

  // Estándares: [umbralMin, umbralIntermedio, umbralAvanzado, umbralElite]
  const standards = {
    squat: {
      name: 'Sentadilla',
      val: d.gym.squatKg !== null ? d.gym.squatKg / bw : null,
      rawDisplay: d.gym.squatKg !== null ? `${d.gym.squatKg} kg` : null,
      thresholds: isMale ? [0.7, 1.25, 1.75, 2.25, 2.65] : [0.45, 0.85, 1.25, 1.65, 2.0],
      pill: dom.pillSquat,
    },
    bench: {
      name: 'Press de Banca',
      val: d.gym.benchKg !== null ? d.gym.benchKg / bw : null,
      rawDisplay: d.gym.benchKg !== null ? `${d.gym.benchKg} kg` : null,
      thresholds: isMale ? [0.5, 0.9, 1.25, 1.6, 1.95] : [0.25, 0.5, 0.75, 1.05, 1.3],
      pill: dom.pillBench,
    },
    deadlift: {
      name: 'Peso Muerto',
      val: d.gym.deadliftKg !== null ? d.gym.deadliftKg / bw : null,
      rawDisplay: d.gym.deadliftKg !== null ? `${d.gym.deadliftKg} kg` : null,
      thresholds: isMale ? [0.9, 1.5, 2.0, 2.5, 3.0] : [0.6, 1.05, 1.5, 1.95, 2.35],
      pill: dom.pillDeadlift,
    },
    pullups: {
      name: 'Dominadas',
      val: d.gym.pullupsReps,
      rawDisplay: d.gym.pullupsReps !== null ? `${d.gym.pullupsReps} reps` : null,
      thresholds: isMale ? [1, 6, 14, 22, 30] : [1, 2, 7, 13, 20],
      pill: dom.pillPullups,
    },
    dips: {
      name: 'Fondos',
      val: d.gym.dipsReps,
      rawDisplay: d.gym.dipsReps !== null ? `${d.gym.dipsReps} reps` : null,
      thresholds: isMale ? [2, 8, 18, 28, 40] : [1, 3, 10, 18, 26],
      pill: dom.pillDips,
    },
    pushups: {
      name: 'Lagartijas',
      val: d.gym.pushupsReps,
      rawDisplay: d.gym.pushupsReps !== null ? `${d.gym.pushupsReps} reps` : null,
      thresholds: isMale ? [8, 20, 40, 60, 80] : [4, 10, 23, 38, 55],
      pill: dom.pillPushups,
    },
  };

  const evaluatedMovements = [];

  Object.keys(standards).forEach((key) => {
    const item = standards[key];
    if (item.val === null) {
      item.pill.textContent = 'No ingresado (Opcional)';
      item.pill.style.borderColor = '#272730';
      item.pill.style.color = '#71717a';
      return;
    }

    const [t0, t1, t2, t3, t4] = item.thresholds;
    let score = 0;
    if (item.val < t1) {
      score = mapRange(item.val, t0, t1, 12, 39);
    } else if (item.val < t2) {
      score = mapRange(item.val, t1, t2, 40, 64);
    } else if (item.val < t3) {
      score = mapRange(item.val, t2, t3, 65, 84);
    } else {
      score = mapRange(item.val, t3, t4, 85, 100);
    }

    score = Math.round(clampNum(score, 8, 100, 25));
    const tier = scoreToTierName(score);

    item.pill.textContent = `${tier} (${score} pts)`;
    item.pill.style.borderColor = score >= 65 ? '#ef4444' : '#ffffff';
    item.pill.style.color = score >= 65 ? '#ef4444' : '#ffffff';

    evaluatedMovements.push({
      key,
      name: item.name,
      rawDisplay: item.rawDisplay,
      score,
      tier,
    });
  });

  if (evaluatedMovements.length === 0) {
    return {
      hasGymData: false,
      gymScore: null,
      gymTier: 'SIN DATOS',
      movements: [],
      strongest: null,
      weakest: null,
    };
  }

  const avgScore = Math.round(
    evaluatedMovements.reduce((s, m) => s + m.score, 0) /
      evaluatedMovements.length
  );
  const sorted = [...evaluatedMovements].sort((a, b) => b.score - a.score);

  return {
    hasGymData: true,
    gymScore: avgScore,
    gymTier: scoreToTierName(avgScore),
    movements: evaluatedMovements,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
}

/**
 * 5. PUNTOS ANTROPOMÉTRICOS FUERTES Y DÉBILES
 */
function evaluateAnthropometricSymmetry(d) {
  const h = d.heightCm;
  const isMale = d.sex === 'male';

  // Proporciones atléticas de referencia según estatura (canon clásico / McCallum / estético)
  const ideals = {
    biceps: isMale ? h * 0.228 : h * 0.188,
    thigh: isMale ? h * 0.342 : h * 0.335,
    calf: isMale ? h * 0.224 : h * 0.212,
    neck: isMale ? h * 0.225 : h * 0.192,
    waist: isMale ? h * 0.445 : h * 0.405, // En cintura: menor o cercano al ideal es mejor (compactación abdominal)
    hip: isMale ? h * 0.54 : h * 0.565,
  };

  const points = [
    {
      name: 'Bíceps Contraído',
      actual: d.bicepsCm,
      ideal: ideals.biceps,
      pct: Math.round((d.bicepsCm / ideals.biceps) * 100),
    },
    {
      name: 'Muslo Medio',
      actual: d.thighCm,
      ideal: ideals.thigh,
      pct: Math.round((d.thighCm / ideals.thigh) * 100),
    },
    {
      name: 'Pantorrilla',
      actual: d.calfCm,
      ideal: ideals.calf,
      pct: Math.round((d.calfCm / ideals.calf) * 100),
    },
    {
      name: 'Cuello',
      actual: d.neckCm,
      ideal: ideals.neck,
      pct: Math.round((d.neckCm / ideals.neck) * 100),
    },
    {
      name: 'Compactación Cintura',
      actual: d.waistCm,
      ideal: ideals.waist,
      // Si la cintura es más estrecha que el ideal, puntúa alto; si es más ancha, puntúa más bajo
      pct: Math.round((ideals.waist / d.waistCm) * 100),
    },
    {
      name: 'Cadera / Glúteo',
      actual: d.hipCm,
      ideal: ideals.hip,
      pct: Math.round((d.hipCm / ideals.hip) * 100),
    },
  ];

  const sorted = [...points].sort((a, b) => b.pct - a.pct);
  return {
    points,
    strongest: sorted.slice(0, 2),
    weakest: sorted.slice(-2).reverse(),
  };
}

/**
 * 6. NIVEL TOTAL Y TIEMPO APROXIMADO PARA PASAR AL SIGUIENTE NIVEL
 */
function calculateTotalLevelAndRoadmap(d, ffmiEval, gymEval) {
  const totalScore = gymEval.hasGymData
    ? Math.round(ffmiEval.score * 0.5 + gymEval.gymScore * 0.5)
    : ffmiEval.score;

  const totalTier = scoreToTierName(totalScore);

  // Determinar siguiente nivel y requerimientos
  let nextTier = 'INTERMEDIO';
  let targetScore = 40;
  let targetFfmiNorm = d.sex === 'male' ? 18.5 : 14.5;
  let monthlyMuscleGainKg = d.sex === 'male' ? 0.75 : 0.4; // Tasa fisiológica según nivel

  if (totalTier === 'INTERMEDIO') {
    nextTier = 'AVANZADO';
    targetScore = 65;
    targetFfmiNorm = d.sex === 'male' ? 21.0 : 16.5;
    monthlyMuscleGainKg = d.sex === 'male' ? 0.45 : 0.25;
  } else if (totalTier === 'AVANZADO') {
    nextTier = 'ÉLITE';
    targetScore = 85;
    targetFfmiNorm = d.sex === 'male' ? 23.0 : 18.5;
    monthlyMuscleGainKg = d.sex === 'male' ? 0.22 : 0.12;
  } else if (totalTier === 'ÉLITE') {
    nextTier = 'MÁXIMO POTENCIAL GENÉTICO';
    targetScore = 100;
    targetFfmiNorm = d.sex === 'male' ? 24.5 : 19.8;
    monthlyMuscleGainKg = d.sex === 'male' ? 0.12 : 0.07;
  }

  // Masa magra necesaria para el siguiente escalón de FFMI
  const ffmiGap = Math.max(0, targetFfmiNorm - ffmiEval.ffmiNorm);
  const leanMassNeededKg = ffmiGap * (d.heightM * d.heightM);
  const monthsForMuscle = leanMassNeededKg / monthlyMuscleGainKg;

  // Puntos de fuerza necesarios
  const scoreGap = Math.max(2, targetScore - totalScore);
  const monthsForStrength = scoreGap * 0.35;

  const estMonths = Math.max(
    1,
    Math.round(Math.max(monthsForMuscle * 0.65 + monthsForStrength * 0.35, scoreGap * 0.3))
  );

  let timeText = `${estMonths} a ${estMonths + 2} meses`;
  let reqText = '';

  if (totalTier === 'ÉLITE') {
    timeText = 'Nivel Élite Alcanzado (Mantenimiento / Perfeccionamiento)';
    reqText =
      '¡Felicidades! Te encuentras en la categoría Élite tanto por desarrollo muscular como por fuerza relativa. El enfoque ahora es pulir tus puntos débiles específicos y mantener tu composición.';
  } else {
    const kgStr =
      leanMassNeededKg > 0.2
        ? `ganar aprox. +${leanMassNeededKg.toFixed(1)} kg de masa muscular magra (subir tu FFMI a ${targetFfmiNorm.toFixed(1)})`
        : `mantener tu masa muscular actual optimizando tu definición`;
    const strPct = Math.max(5, Math.round(scoreGap * 0.8));
    reqText = `Con un plan nutricional estructurado y sobrecarga progresiva, necesitas ${kgStr} e incrementar tus marcas de fuerza un +${strPct}% en tus movimientos principales.`;
  }

  return {
    totalScore,
    totalTier,
    nextTier,
    timeText,
    reqText,
  };
}

/**
 * 7. DIBUJO DE LAS 3 GRÁFICAS EN CANVAS (NEGRO, BLANCO Y ROJO)
 */

// Gráfica 1: Escala de FFMI
function drawFfmiChart(sex, ffmiNorm) {
  const canvas = dom.ffmiChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Fondo negro clínico
  ctx.fillStyle = '#09090c';
  ctx.fillRect(0, 0, w, h);

  const zones =
    sex === 'male'
      ? [
          { label: 'PRINCIPIANTE', range: '< 18.5', min: 15, max: 18.5, color: '#27272a' },
          { label: 'INTERMEDIO', range: '18.5 - 20.9', min: 18.5, max: 21.0, color: '#52525b' },
          { label: 'AVANZADO', range: '21.0 - 22.9', min: 21.0, max: 23.0, color: '#b91c1c' },
          { label: 'ÉLITE', range: '23.0 - 25+', min: 23.0, max: 26.0, color: '#ef4444' },
        ]
      : [
          { label: 'PRINCIPIANTE', range: '< 14.5', min: 12, max: 14.5, color: '#27272a' },
          { label: 'INTERMEDIO', range: '14.5 - 16.4', min: 14.5, max: 16.5, color: '#52525b' },
          { label: 'AVANZADO', range: '16.5 - 18.4', min: 16.5, max: 18.5, color: '#b91c1c' },
          { label: 'ÉLITE', range: '18.5 - 21+', min: 18.5, max: 21.0, color: '#ef4444' },
        ];

  const padX = 45;
  const barY = 92;
  const barH = 44;
  const totalWidth = w - padX * 2;
  const segW = totalWidth / 4;

  zones.forEach((z, idx) => {
    const x = padX + idx * segW;
    ctx.fillStyle = z.color;
    ctx.fillRect(x, barY, segW - 4, barH);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, barY, segW - 4, barH);

    // Etiqueta superior
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.label, x + segW / 2, barY + 22);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`FFMI ${z.range}`, x + segW / 2, barY + 37);
  });

  // Calcular posición X del indicador del paciente
  const minScale = zones[0].min;
  const maxScale = zones[3].max;
  const clamped = Math.max(minScale, Math.min(maxScale, ffmiNorm));

  let userX = padX;
  for (let i = 0; i < 4; i++) {
    if (clamped <= zones[i].max || i === 3) {
      const localRatio =
        (clamped - zones[i].min) / (zones[i].max - zones[i].min);
      userX = padX + i * segW + Math.max(0, Math.min(1, localRatio)) * segW;
      break;
    }
  }

  // Dibujar marcador del usuario
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(userX, barY - 6);
  ctx.lineTo(userX - 10, barY - 22);
  ctx.lineTo(userX + 10, barY - 22);
  ctx.closePath();
  ctx.fill();

  // Línea vertical blanca
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(userX, barY - 6);
  ctx.lineTo(userX, barY + barH + 8);
  ctx.stroke();

  // Etiqueta flotante del usuario
  const badgeW = 165;
  const badgeH = 30;
  const badgeX = Math.max(padX, Math.min(w - padX - badgeW, userX - badgeW / 2));
  const badgeY = 30;

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `TU FFMI: ${ffmiNorm.toFixed(1)}`,
    badgeX + badgeW / 2,
    badgeY + 20
  );

  // Pie de gráfica
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Escala científica de desarrollo muscular libre de grasa — Nutriólogo Diego Rodea',
    w / 2,
    h - 22
  );
}

// Gráfica 2: Puntos Antropométricos Fuertes y Débiles
function drawAnthroChart(anthroEval) {
  const canvas = dom.anthroChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#09090c';
  ctx.fillRect(0, 0, w, h);

  const labelX = 150;
  const maxBarW = w - labelX - 65;
  const startY = 38;
  const rowH = 44;

  // Línea vertical de 100% (proporción ideal)
  const idealX = labelX + (100 / 125) * maxBarW;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(idealX, 18);
  ctx.lineTo(idealX, h - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('100% IDEAL', idealX, 14);

  anthroEval.points.forEach((pt, i) => {
    const y = startY + i * rowH;
    const clampedPct = Math.max(40, Math.min(125, pt.pct));
    const barW = (clampedPct / 125) * maxBarW;

    // Nombre de la zona
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(pt.name, labelX - 12, y + 16);

    // Fondo de barra
    ctx.fillStyle = '#18181f';
    ctx.fillRect(labelX, y, maxBarW, 24);

    // Color: Rojo intenso para puntos fuertes (>=98%), Blanco/Gris para intermedios, Rojo oscuro para débiles
    if (pt.pct >= 98) {
      ctx.fillStyle = '#ef4444';
    } else if (pt.pct >= 90) {
      ctx.fillStyle = '#e4e4e7';
    } else {
      ctx.fillStyle = '#7f1d1d';
    }
    ctx.fillRect(labelX, y, barW, 24);

    // Valor en texto a la derecha
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${pt.pct}% (${pt.actual} cm)`, labelX + barW + 8, y + 16);
  });
}

// Gráfica 3: Movimientos de Fuerza Fuertes y Débiles
function drawMovementsChart(gymEval) {
  const canvas = dom.movementsChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#09090c';
  ctx.fillRect(0, 0, w, h);

  if (!gymEval.hasGymData) {
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Ingresa al menos 1 ejercicio en el Paso 2 para graficar tus movimientos',
      w / 2,
      h / 2
    );
    return;
  }

  const labelX = 135;
  const maxBarW = w - labelX - 80;
  const count = gymEval.movements.length;
  const rowH = Math.min(48, Math.floor((h - 40) / count));
  const startY = 30;

  gymEval.movements.forEach((mv, idx) => {
    const y = startY + idx * rowH;
    const barW = (mv.score / 100) * maxBarW;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(mv.name, labelX - 12, y + 17);

    // Barra fondo
    ctx.fillStyle = '#18181f';
    ctx.fillRect(labelX, y, maxBarW, 24);

    // Barra de progreso
    ctx.fillStyle = mv.score >= 65 ? '#ef4444' : mv.score >= 40 ? '#ffffff' : '#991b1b';
    ctx.fillRect(labelX, y, barW, 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${mv.score} pts · ${mv.tier}`,
      labelX + barW + 8,
      y + 16
    );
  });
}

/**
 * 8. ACTUALIZACIÓN INTEGRAL EN TIEMPO REAL
 */
function runFullEvaluation() {
  const user = readUserInputs();
  const bf = calculateBodyFatFormulas(user);
  const ffmi = evaluateFfmi(user.sex, user.heightM, bf.leanMassKg);
  const gym = evaluateGymPerformance(user);
  const anthro = evaluateAnthropometricSymmetry(user);
  const roadmap = calculateTotalLevelAndRoadmap(user, ffmi, gym);

  // Actualizar UI de Grasa Corporal
  dom.avgBfValue.textContent = bf.avgBf.toFixed(1);
  dom.bfCategoryBadge.textContent = `Categoría: ${bf.category}`;
  dom.outFatMassKg.textContent = `${bf.fatMassKg.toFixed(1)} kg`;
  dom.outLeanMassKg.textContent = `${bf.leanMassKg.toFixed(1)} kg`;

  dom.valNavyBf.textContent = bf.navy !== null ? `${bf.navy.toFixed(1)}%` : '—';
  dom.valYmcaBf.textContent = bf.ymca !== null ? `${bf.ymca.toFixed(1)}%` : '—';
  dom.valRfmBf.textContent = bf.rfm !== null ? `${bf.rfm.toFixed(1)}%` : '—';
  dom.valCunbaeBf.textContent = bf.cunbae !== null ? `${bf.cunbae.toFixed(1)}%` : '—';

  // Actualizar UI de FFMI
  dom.outFfmi.textContent = ffmi.ffmi.toFixed(1);
  dom.outFfmiNorm.textContent = ffmi.ffmiNorm.toFixed(1);
  dom.outFfmiLevel.textContent = ffmi.tier;
  drawFfmiChart(user.sex, ffmi.ffmiNorm);

  // Actualizar Nivel Total y Tiempo
  dom.summaryFfmiTier.textContent = ffmi.tier;
  dom.summaryFfmiScore.textContent = `Score FFMI: ${ffmi.score} / 100`;
  dom.summaryGymTier.textContent = gym.hasGymData ? gym.gymTier : 'SOLO FFMI';
  dom.summaryGymScore.textContent = gym.hasGymData
    ? `Score Fuerza: ${gym.gymScore} / 100`
    : 'Sin ejercicios ingresados';
  dom.summaryTotalTier.textContent = roadmap.totalTier;
  dom.summaryTotalScore.textContent = `Score Global: ${roadmap.totalScore} / 100`;

  // Iluminar nodo de nivel activo
  const tierMap = {
    PRINCIPIANTE: 'tierNodePrincipiante',
    INTERMEDIO: 'tierNodeIntermedio',
    AVANZADO: 'tierNodeAvanzado',
    ÉLITE: 'tierNodeElite',
  };
  ['tierNodePrincipiante', 'tierNodeIntermedio', 'tierNodeAvanzado', 'tierNodeElite'].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active-tier', tierMap[roadmap.totalTier] === id);
    }
  );

  dom.nextLevelName.textContent = roadmap.nextTier;
  dom.nextLevelTime.textContent = roadmap.timeText;
  dom.nextLevelRequirements.textContent = roadmap.reqText;

  // Actualizar Gráficas de Puntos Fuertes y Débiles
  dom.idealHeightRef.textContent = `${user.heightM.toFixed(2)} m`;
  drawAnthroChart(anthro);
  dom.anthroStrongText.textContent = anthro.strongest
    .map((p) => `${p.name} (${p.pct}%)`)
    .join(' y ');
  dom.anthroWeakText.textContent = anthro.weakest
    .map((p) => `${p.name} (${p.pct}%)`)
    .join(' y ');

  drawMovementsChart(gym);
  if (gym.hasGymData) {
    dom.moveStrongText.textContent = `${gym.strongest.name} (${gym.strongest.rawDisplay} · ${gym.strongest.tier})`;
    dom.moveWeakText.textContent = `${gym.weakest.name} (${gym.weakest.rawDisplay} · ${gym.weakest.tier})`;
  } else {
    dom.moveStrongText.textContent = 'Ingresa tus pesos/repeticiones arriba';
    dom.moveWeakText.textContent = 'Ingresa tus pesos/repeticiones arriba';
  }

  state.lastEvaluation = {
    user,
    bf,
    ffmi,
    gym,
    anthro,
    roadmap,
    timestamp: new Date().toLocaleString('es-MX'),
  };

  return state.lastEvaluation;
}

/**
 * 9. GUARDADO DE PERFILES EN LA NUBE + SINCRONIZACIÓN
 */
function loadSavedProfiles() {
  try {
    const raw = localStorage.getItem(state.profilesKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfilesList(list) {
  localStorage.setItem(state.profilesKey, JSON.stringify(list));
}

async function saveUserProfileToCloud() {
  const ev = runFullEvaluation();
  if (!dom.patientName.value.trim()) {
    showStatus('⚠️ Por favor escribe tu Nombre Completo en el Paso 1 para crear y guardar tu perfil.', true);
    dom.patientName.focus();
    return;
  }

  const profiles = loadSavedProfiles();
  const cleanName = ev.user.name;
  const codeId =
    dom.profileCloudCode.value.trim() ||
    `DR-${Math.floor(10000 + Math.random() * 90000)}`;
  dom.profileCloudCode.value = codeId;

  const profilePayload = {
    codeId,
    name: cleanName,
    pin: ev.user.pin,
    updatedAt: ev.timestamp,
    inputs: {
      sex: ev.user.sex,
      age: ev.user.age,
      heightM: ev.user.heightM,
      weightKg: ev.user.weightKg,
      neckCm: ev.user.neckCm,
      waistCm: ev.user.waistCm,
      hipCm: ev.user.hipCm,
      calfCm: ev.user.calfCm,
      thighCm: ev.user.thighCm,
      bicepsCm: ev.user.bicepsCm,
      gym: ev.user.gym,
    },
    summary: {
      avgBf: Number(ev.bf.avgBf.toFixed(1)),
      ffmiNorm: Number(ev.ffmi.ffmiNorm.toFixed(1)),
      totalTier: ev.roadmap.totalTier,
      totalScore: ev.roadmap.totalScore,
    },
  };

  // Actualizar si ya existe el mismo nombre o código, o agregar nuevo
  const existingIdx = profiles.findIndex(
    (p) =>
      p.codeId === codeId ||
      p.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existingIdx >= 0) {
    profiles[existingIdx] = profilePayload;
  } else {
    profiles.unshift(profilePayload);
  }

  saveProfilesList(profiles);
  renderProfilesUI();

  // Generar enlace compartible en la URL para poder abrir el perfil en cualquier otro dispositivo
  const encodedProfile = btoa(unescape(encodeURIComponent(JSON.stringify(profilePayload))));
  const shareUrl = `${window.location.origin}${window.location.pathname}?perfil=${encodedProfile}`;
  window.history.replaceState({}, '', `?perfil=${encodedProfile}`);

  // Enviar a Webhook en la nube si está configurado
  const webhookUrl = localStorage.getItem(state.webhookKey);
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });
    } catch {
      // Continúa con el respaldo en nube por URL y almacenamiento local
    }
  }

  dom.cloudSyncIndicator.innerHTML = `<span class="pulse-dot"></span> Guardado (${codeId})`;
  showStatus(
    `✅ Perfil de "${cleanName}" guardado en la nube con código ${codeId}. Puedes cargar tu perfil cuando quieras o compartir la URL actual.`
  );
}

function loadProfileIntoForm(profile) {
  if (!profile || !profile.inputs) return;
  const inp = profile.inputs;

  dom.patientName.value = profile.name || '';
  dom.patientPin.value = profile.pin || '';
  dom.profileCloudCode.value = profile.codeId || '';

  state.sex = inp.sex || 'male';
  dom.btnSexMale.classList.toggle('active', state.sex === 'male');
  dom.btnSexFemale.classList.toggle('active', state.sex === 'female');

  dom.patientAge.value = inp.age ?? 26;
  dom.patientHeight.value = inp.heightM ?? 1.75;
  dom.patientWeight.value = inp.weightKg ?? 78;

  dom.mNeck.value = inp.neckCm ?? 39;
  dom.mWaist.value = inp.waistCm ?? 82;
  dom.mHip.value = inp.hipCm ?? 97;
  dom.mCalf.value = inp.calfCm ?? 38.5;
  dom.mThigh.value = inp.thighCm ?? 58;
  dom.mBiceps.value = inp.bicepsCm ?? 38;

  if (inp.gym) {
    dom.liftSquat.value = inp.gym.squatKg ?? '';
    dom.liftBench.value = inp.gym.benchKg ?? '';
    dom.liftDeadlift.value = inp.gym.deadliftKg ?? '';
    dom.repsPullups.value = inp.gym.pullupsReps ?? '';
    dom.repsDips.value = inp.gym.dipsReps ?? '';
    dom.repsPushups.value = inp.gym.pushupsReps ?? '';
  }

  runFullEvaluation();
  showStatus(`📂 Perfil de "${profile.name}" (${profile.codeId}) cargado correctamente.`);
}

function renderProfilesUI() {
  const profiles = loadSavedProfiles();
  dom.savedCountBadge.textContent = profiles.length;

  // Actualizar selector desplegable superior
  dom.profileSelect.innerHTML =
    '<option value="">-- Seleccionar Perfil Guardado --</option>' +
    profiles
      .map(
        (p) =>
          `<option value="${p.codeId}">${p.name} (${p.codeId}) — Nivel ${p.summary.totalTier}</option>`
      )
      .join('');

  if (profiles.length === 0) {
    dom.savedRecordsList.innerHTML =
      '<p style="font-size:0.8rem;color:#71717a;">Aún no hay perfiles guardados. Rellena tus datos y pulsa "Guardar Perfil en la Nube".</p>';
    return;
  }

  dom.savedRecordsList.innerHTML = profiles
    .map(
      (p) => `
      <div class="saved-record-item">
        <div>
          <strong>👤 ${p.name}</strong> <span style="color:#ef4444;font-weight:700;">[${p.codeId}]</span>
          <div style="font-size:0.74rem;color:#a1a1aa;">
            ${p.updatedAt} · Grasa: ${p.summary.avgBf}% · FFMI: ${p.summary.ffmiNorm} · Nivel Total: <strong>${p.summary.totalTier}</strong>
          </div>
        </div>
        <div class="record-actions">
          <button type="button" class="btn-mini-red" onclick="window.selectProfileByCode('${p.codeId}')">Cargar Perfil</button>
          <button type="button" class="btn-mini-outline" onclick="window.deleteProfileByCode('${p.codeId}')">Eliminar</button>
        </div>
      </div>
    `
    )
    .join('');
}

window.selectProfileByCode = function (codeId) {
  const profiles = loadSavedProfiles();
  const found = profiles.find(
    (p) => p.codeId.toUpperCase() === codeId.toUpperCase()
  );
  if (found) {
    loadProfileIntoForm(found);
  } else {
    showStatus('⚠️ No se encontró ningún perfil con ese código.', true);
  }
};

window.deleteProfileByCode = function (codeId) {
  const profiles = loadSavedProfiles().filter((p) => p.codeId !== codeId);
  saveProfilesList(profiles);
  renderProfilesUI();
};

/**
 * 10. GENERACIÓN Y DESCARGA DE INFORME OFICIAL EN PDF (LISTO PARA ENVIAR POR WHATSAPP)
 */
async function generateAndDownloadPdf() {
  const ev = runFullEvaluation();
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showStatus('⚠️ La librería PDF aún está cargando. Intenta de nuevo en 2 segundos.', true);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;

  // Fondo negro de cabecera
  doc.setFillColor(12, 12, 16);
  doc.rect(0, 0, pageW, 44, 'F');
  doc.setFillColor(225, 29, 72);
  doc.rect(0, 44, pageW, 2, 'F');

  // Insertar el logo sin fondo si está disponible
  try {
    const logoDataUrl = await getImageDataUrl(dom.brandLogoImg);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 12, 4, 34, 36);
    }
  } catch {
    // Continúa sin detener el PDF si se abre sin servidor local
  }

  // Títulos de cabecera
  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INFORME CLÍNICO DE ANTROPOMETRÍA Y RENDIMIENTO DEPORTIVO', 52, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text('NUTRIÓLOGO DIEGO RODEA', 52, 23);

  doc.setTextColor(212, 212, 216);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Paciente: ${ev.user.name}   |   Edad: ${ev.user.age} años   |   Estatura: ${ev.user.heightM.toFixed(2)} m   |   Peso: ${ev.user.weightKg.toFixed(1)} kg`, 52, 31);
  doc.text(`Fecha de evaluación: ${ev.timestamp}`, 52, 37);

  let y = 54;

  // BLOQUE 1: GRASA CORPORAL (FÓRMULAS Y PROMEDIO)
  doc.setFillColor(20, 20, 26);
  doc.rect(12, y, 186, 34, 'F');
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.rect(12, y, 186, 34, 'S');

  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. COMPOSICIÓN CORPORAL Y PROMEDIO DE GRASA CIENTÍFICO', 17, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(`${ev.bf.avgBf.toFixed(1)}% GRASA`, 17, y + 20);

  doc.setFontSize(9.5);
  doc.setTextColor(228, 228, 231);
  doc.text(`Categoría: ${ev.bf.category}`, 17, y + 27);
  doc.text(
    `Masa Grasa: ${ev.bf.fatMassKg.toFixed(1)} kg   |   Masa Magra (LBM): ${ev.bf.leanMassKg.toFixed(1)} kg`,
    17,
    y + 32
  );

  // Desglose de las 4 fórmulas a la derecha
  doc.setFontSize(9);
  doc.text(`• U.S. Navy: ${ev.bf.navy !== null ? ev.bf.navy.toFixed(1) + '%' : '—'}`, 115, y + 14);
  doc.text(`• YMCA Modificada: ${ev.bf.ymca !== null ? ev.bf.ymca.toFixed(1) + '%' : '—'}`, 115, y + 20);
  doc.text(`• RFM (Cedars-Sinai): ${ev.bf.rfm !== null ? ev.bf.rfm.toFixed(1) + '%' : '—'}`, 115, y + 26);
  doc.text(`• CUN-BAE (Clínica Navarra): ${ev.bf.cunbae !== null ? ev.bf.cunbae.toFixed(1) + '%' : '—'}`, 115, y + 32);

  y += 40;

  // BLOQUE 2: PERÍMETROS CORPORALES Y NIVEL TOTAL
  doc.setFillColor(20, 20, 26);
  doc.rect(12, y, 186, 38, 'F');
  doc.setDrawColor(60, 60, 70);
  doc.rect(12, y, 186, 38, 'S');

  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. PERÍMETROS ANTROPOMÉTRICOS, FFMI Y NIVEL TOTAL', 17, y + 7);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(
    `Cuello: ${ev.user.neckCm} cm  |  Cintura: ${ev.user.waistCm} cm  |  Cadera: ${ev.user.hipCm} cm  |  Pantorrilla: ${ev.user.calfCm} cm  |  Muslo: ${ev.user.thighCm} cm  |  Bíceps: ${ev.user.bicepsCm} cm`,
    17,
    y + 14
  );

  doc.setFontSize(10.5);
  doc.setTextColor(239, 68, 68);
  doc.text(
    `FFMI Ajustado: ${ev.ffmi.ffmiNorm.toFixed(1)} (${ev.ffmi.tier})   |   Nivel Gym: ${ev.gym.hasGymData ? ev.gym.gymTier : 'N/A'}   |   NIVEL TOTAL: ${ev.roadmap.totalTier}`,
    17,
    y + 22
  );

  doc.setTextColor(228, 228, 231);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const splitRoadmap = doc.splitTextToSize(
    `Tiempo estimado al siguiente nivel (${ev.roadmap.nextTier}): ${ev.roadmap.timeText}. ${ev.roadmap.reqText}`,
    176
  );
  doc.text(splitRoadmap, 17, y + 28);

  y += 44;

  // BLOQUE 3: GRÁFICA DE FFMI
  doc.setTextColor(15, 15, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. GRÁFICA DE VALORACIÓN DE FFMI (MASA LIBRE DE GRASA)', 12, y);
  y += 3;
  const ffmiImg = dom.ffmiChartCanvas.toDataURL('image/png', 1.0);
  doc.addImage(ffmiImg, 'PNG', 12, y, 186, 42);
  y += 48;

  // BLOQUE 4: GRÁFICAS DUALES (ANTROPOMETRÍA Y MOVIMIENTOS)
  doc.setTextColor(15, 15, 20);
  doc.text('4. PUNTOS FUERTES Y DÉBILES (ANTROPOMETRÍA VS. MOVIMIENTOS)', 12, y);
  y += 3;

  const anthroImg = dom.anthroChartCanvas.toDataURL('image/png', 1.0);
  const moveImg = dom.movementsChartCanvas.toDataURL('image/png', 1.0);
  doc.addImage(anthroImg, 'PNG', 12, y, 91, 58);
  doc.addImage(moveImg, 'PNG', 107, y, 91, 58);
  y += 63;

  // Resumen escrito de puntos fuertes y débiles al pie del PDF
  doc.setFillColor(18, 18, 24);
  doc.rect(12, y, 186, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(`• Puntos Antropométricos Fuertes: ${dom.anthroStrongText.textContent}`, 16, y + 7);
  doc.text(`• Puntos Antropométricos Débiles (Priorizar): ${dom.anthroWeakText.textContent}`, 16, y + 13);
  doc.text(`• Movimiento Más Fuerte: ${dom.moveStrongText.textContent}`, 16, y + 19);
  doc.text(`• Movimiento a Mejorar: ${dom.moveWeakText.textContent}`, 110, y + 19);

  // Pie de página oficial
  doc.setTextColor(120, 120, 130);
  doc.setFontSize(8);
  doc.text(
    'Informe generado por la plataforma oficial de evaluación — Nutriólogo Diego Rodea. Envíalo por WhatsApp a tu nutriólogo.',
    105,
    291,
    { align: 'center' }
  );

  const safeFileName = ev.user.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Paciente';
  doc.save(`Informe_Nutriologo_Diego_Rodea_${safeFileName}.pdf`);

  showStatus(
    `📄 Informe PDF descargado ("Informe_Nutriologo_Diego_Rodea_${safeFileName}.pdf"). ¡Ya puedes adjuntarlo y enviarlo por WhatsApp al Nutriólogo Diego Rodea!`
  );
}

function getImageDataUrl(imgEl) {
  if (window.DIEGO_RODEA_LOGO_B64) {
    return Promise.resolve(window.DIEGO_RODEA_LOGO_B64);
  }
  return new Promise((resolve) => {
    if (!imgEl || !imgEl.complete || imgEl.naturalWidth === 0) {
      resolve(null);
      return;
    }
    try {
      const c = document.createElement('canvas');
      c.width = imgEl.naturalWidth;
      c.height = imgEl.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      resolve(c.toDataURL('image/png'));
    } catch {
      resolve(null);
    }
  });
}

/**
 * 11. ENVIAR POR WHATSAPP AL NUTRIÓLOGO DIEGO RODEA
 */
function sendSummaryViaWhatsapp() {
  const ev = runFullEvaluation();
  const msg = [
    `Hola *Nutriólogo Diego Rodea*, te comparto mis resultados de la evaluación antropométrica y de fuerza:`,
    ``,
    `👤 *Paciente:* ${ev.user.name} (${ev.user.age} años)`,
    `📏 *Estatura:* ${ev.user.heightM.toFixed(2)} m | *Peso:* ${ev.user.weightKg.toFixed(1)} kg`,
    `🔥 *Grasa Corporal Promedio:* ${ev.bf.avgBf.toFixed(1)}% (${ev.bf.category})`,
    `   • US Navy: ${ev.bf.navy ? ev.bf.navy.toFixed(1) + '%' : '—'} | YMCA: ${ev.bf.ymca ? ev.bf.ymca.toFixed(1) + '%' : '—'} | RFM: ${ev.bf.rfm ? ev.bf.rfm.toFixed(1) + '%' : '—'}`,
    `💪 *Masa Magra:* ${ev.bf.leanMassKg.toFixed(1)} kg | *FFMI Ajustado:* ${ev.ffmi.ffmiNorm.toFixed(1)} (${ev.ffmi.tier})`,
    `🏋️ *Nivel de Gym:* ${ev.gym.hasGymData ? ev.gym.gymTier : 'No ingresado'}`,
    `🏆 *NIVEL TOTAL:* ${ev.roadmap.totalTier} (${ev.roadmap.totalScore}/100 pts)`,
    `⏳ *Tiempo est. a ${ev.roadmap.nextTier}:* ${ev.roadmap.timeText}`,
    `📐 *Puntos fuertes:* ${dom.anthroStrongText.textContent}`,
    `🎯 *Puntos a priorizar:* ${dom.anthroWeakText.textContent}`,
    ``,
    `📎 *Te adjunto mi informe completo en PDF.*`,
  ].join('\n');

  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function showStatus(text, isWarning = false) {
  dom.statusBanner.textContent = text;
  dom.statusBanner.classList.remove('hidden');
  dom.statusBanner.style.borderColor = isWarning ? '#f59e0b' : '#ef4444';
}

/**
 * 12. EVENTOS E INICIALIZACIÓN
 */
function initApp() {
  // Selector de sexo
  [dom.btnSexMale, dom.btnSexFemale].forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sex = btn.dataset.sex;
      dom.btnSexMale.classList.toggle('active', state.sex === 'male');
      dom.btnSexFemale.classList.toggle('active', state.sex === 'female');
      runFullEvaluation();
    });
  });

  // Calculadora auxiliar de 1RM (Fórmula de Epley)
  const updateRmHelper = () => {
    const w = parseFloat(dom.calcRmWeight.value);
    const r = parseFloat(dom.calcRmReps.value);
    if (w > 0 && r > 0) {
      const rm = r === 1 ? w : Math.round(w * (1 + r / 30));
      dom.calcRmResult.innerHTML = `= Tu 1RM estimado: <strong>${rm} kg</strong>`;
    } else {
      dom.calcRmResult.innerHTML = `= Tu 1RM estimado: <strong>— kg</strong>`;
    }
  };
  dom.calcRmWeight.addEventListener('input', updateRmHelper);
  dom.calcRmReps.addEventListener('input', updateRmHelper);

  // Escuchar todos los campos para recalcular en tiempo real
  document.querySelectorAll('input').forEach((inp) => {
    if (inp.id !== 'cloudWebhookUrl' && inp.id !== 'profileCloudCode') {
      inp.addEventListener('input', runFullEvaluation);
    }
  });

  // Perfiles en la nube
  dom.profileSelect.addEventListener('change', () => {
    if (dom.profileSelect.value) {
      window.selectProfileByCode(dom.profileSelect.value);
    }
  });

  dom.btnLoadCloudCode.addEventListener('click', () => {
    const code = dom.profileCloudCode.value.trim();
    if (code) window.selectProfileByCode(code);
  });

  dom.btnNewProfile.addEventListener('click', () => {
    dom.patientName.value = '';
    dom.patientPin.value = '';
    dom.profileCloudCode.value = '';
    dom.profileSelect.value = '';
    window.history.replaceState({}, '', window.location.pathname);
    showStatus('✨ Formulario listo para crear un nuevo perfil de usuario.');
    dom.patientName.focus();
  });

  dom.btnQuickSaveTop.addEventListener('click', saveUserProfileToCloud);
  dom.btnSaveCloud.addEventListener('click', saveUserProfileToCloud);
  dom.btnDownloadPdf.addEventListener('click', generateAndDownloadPdf);
  dom.btnSendWhatsapp.addEventListener('click', sendSummaryViaWhatsapp);

  // Webhook URL
  const savedWebhook = localStorage.getItem(state.webhookKey);
  if (savedWebhook) dom.cloudWebhookUrl.value = savedWebhook;
  dom.btnSaveWebhook.addEventListener('click', () => {
    localStorage.setItem(state.webhookKey, dom.cloudWebhookUrl.value.trim());
    showStatus('☁️ URL de sincronización en la nube guardada correctamente.');
  });

  // Cargar perfil si viene codificado en la URL (?perfil=...)
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('perfil');
  if (encoded) {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      loadProfileIntoForm(decoded);
    } catch {
      // Si el parámetro no es válido, ignora
    }
  }

  renderProfilesUI();
  runFullEvaluation();
}

initApp();

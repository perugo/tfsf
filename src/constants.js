export const DEFAULT = {


  SETTING: {
    fieldX: 0.48, fieldY: 0.38,
    totalPointsX: 125, totalPointsY: 110,
    scatteredPointsX: 100,
    freq: 13e9, theta:0
  },

  MEDIUM: [
    { "DielectricConstant": 1, "DielectricLoss": 0, "MagneticConstant": 1, "MagneticLoss": 0 },
    { "DielectricConstant": 1.5, "DielectricLoss": 0, "MagneticConstant": 1, "MagneticLoss": 0 },
    { "DielectricConstant": 4, "DielectricLoss": 0, "MagneticConstant": 1, "MagneticLoss": 0 },

    { "DielectricConstant": 1, "DielectricLoss": 100000000, "MagneticConstant": 1, "MagneticLoss": 0 }
  ],
  BITMAP: [],
  AMPLITUDESCALER: {
    "Select": "SineWave", "simulationNum": 1000,
    "SineWave": { "slope": -0.11, "shift": 60 },
    "Pulse": { "peakPosition": 100, "widthFactor": 2.5 }
  },
  COLOR: {
    colorThreshold: 1.1,
    colorTransitionIndex: 0
  }
}

export const BREAD = {
  HOME: [{ title: "平面波入力 (Total Field/ Scattered Field)", link: "home" }],
  SETTING: {
    MEDIUM: [
      { title: "平面波入力 (Total Field/ Scattered Field)", link: "home" },
      { title: "媒質を追加", link: "settingMedium" }
    ],
    DOMAINGRID: [
      { title: "平面波入力 (Total Field/ Scattered Field)", link: "home" },
      { title: "解析領域の設定", link: "settingDomainGrid" }
    ],
    INPUTWAVE: [
      { title: "平面波入力 (Total Field/ Scattered Field)", link: "home" },
      { title: "波形の設定", link: "settingInputWave" }
    ]
  }
}
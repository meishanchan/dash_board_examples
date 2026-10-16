(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CrystalDemoData = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return {
    brand: { mark: 'Eb', name: '個人儀表板' },
    eyebrow: '個人儀表板', title: '本週儀表板',
    subtitle: '先看今日＆上週回顧，再依序推進本週目標。',
    demoLabel: '示意資料', baseWeekStart: '2026-10-12', baseFocusDate: '2026-10-13',
    nav: [
      { id: 'daily', label: '日常筆記', icon: 'folder', detail: '在這裡回看每天的思考、工作與生活。本頁展示的是示意筆記，尚未連接你的筆記庫。' },
      { id: 'projects', label: '專案筆記', icon: 'calendar', detail: '本週主專案：知識庫升級計畫、產品研究筆記、生活系統優化。可以先在下方本週目標區試著勾選小目標。' },
      { id: 'knowledge', label: '知識庫', icon: 'book', detail: '知識庫的統計與總覽會在後續階段處理。這一版先確認首頁的閱讀與操作。' },
      { id: 'tags', label: '標籤', icon: 'tag', detail: '示意標籤：工作方法、產品研究、生活系統、知識整理。' },
      { id: 'search', label: '搜尋', icon: 'search', detail: '示意索引：知識庫升級計畫、產品研究筆記、生活系統優化。真實筆記搜尋尚未接入。' },
      { id: 'quick', label: '快速日訊', icon: 'plus', dividerBefore: true, detail: '把剛出現的想法先留住。這個入口目前是示意，尚未建立真實筆記。' },
      { id: 'today', label: '今日筆記', icon: 'calendar', detail: '10/13 的示意日記：完成訪談紀錄，整理會議問題，再留一點時間回顧。' },
      { id: 'tasks', label: '待辦事項', icon: 'check', detail: '待辦與小目標各有自己的計算口徑。這一版可試著操作今日聚焦和本週目標。' },
      { id: 'assets', label: '素材專項', icon: 'file', detail: '示意素材：訪談摘要、研究連結、工作流程草稿。' }
    ],
    sourceStatus: [
      { label: '資料備註', value: '08:10', icon: 'check', status: 'sample' },
      { label: '最後筆記', value: '10/12', icon: 'file', status: 'sample' }
    ],
    quote: {
      label: '後設認知', text: '真正的進步，往往來自於願意停下來檢視自己，而不是一直向前衝。',
      linkLabel: '查看講文',
      detail: '真正的進步，往往來自於願意停下來檢視自己，而不是一直向前衝。\n\n忙碌之前，先問問自己：這件事正在推進什麼？如果停下來看一眼，就能少走一段彎路，那也算是進步。\n\n這是供頁面預覽使用的示意反思。'
    },
    summaries: [
      { id: 'review', kind: 'static', label: '上週回顧', icon: 'clock', value: '5.5', prefix: '約 ', suffix: ' 小時', detail: '示意工作回顧：研究與整理 2.0 小時、訪談與紀錄 1.5 小時、工作流程試驗 2.0 小時，共約 5.5 小時。' },
      { id: 'completed', kind: 'completed', label: '本週已完成', icon: 'check', suffix: ' 項', detail: '這張摘要計算本週交付項目，與今日聚焦的待辦及小目標進度分開。以下五項中有兩項完成。' },
      { id: 'goals', kind: 'goals', label: '本週目標進度', icon: 'trophy', suffix: ' 小目標已完成', detail: '按本週所有小目標加總已完成／全部項目。可以在下方勾選，查看這張摘要與各進度條一起更新。' },
      { id: 'inbox', kind: 'inbox', label: '未整理收件匣 (Inbox)', icon: 'inbox', suffix: ' 則 暫存/加急筆記', detail: '這些是等待整理的示意收件內容。' }
    ],
    weeklyItems: [
      { id: 'w1', text: '完成訪談摘要初稿', done: true },
      { id: 'w2', text: '完成研究資料盤點', done: true },
      { id: 'w3', text: '整理知識索引', done: false },
      { id: 'w4', text: '完成工作流程試跑', done: false },
      { id: 'w5', text: '寫下本週回顧', done: false }
    ],
    inbox: [
      { id: 'n1', text: '訪談後想到的三個問題' }, { id: 'n2', text: '想試試看的知識整理方法' },
      { id: 'n3', text: '還沒歸檔的研究連結' }, { id: 'n4', text: '工作流程改善草稿' },
      { id: 'n5', text: '週末閱讀摘錄' }, { id: 'n6', text: '一個想保留的提示詞' }, { id: 'n7', text: '下週再看看的靈感' }
    ],
    focus: {
      title: "今日聚焦（Today's Focus）", icon: 'clock', totalLabel: '合計：',
      carryLabel: '延後任務已匯入今日待辦（來自上週回顧）',
      items: [
        { id: 't1', text: '關鍵專案 A 訪談紀錄', category: '專案', hours: 2, done: true, carry: false },
        { id: 't2', text: '回覆合作方問題', category: '專案', hours: 1.5, done: false, carry: false },
        { id: 't3', text: '確認會議結論並同步', category: '生活', hours: 1, done: false, carry: false },
        { id: 't4', text: '延後任務已匯入今日待辦（來自上週回顧）', category: '', hours: 0.5, done: true, carry: true }
      ]
    },
    reminders: [
      { id: 'calendar', title: '行事曆提醒', icon: 'calendar', addLabel: '新增', items: [
        { id: 'c1', text: '例行週會前準備簡報', dayOffset: 2, time: '10:00', done: false },
        { id: 'c2', text: '產品討論會議', dayOffset: 3, time: '14:00', done: false },
        { id: 'c3', text: '與合作方的進度會', dayOffset: 4, time: '11:00', done: false },
        { id: 'c4', text: '下週行程規劃與預約', dayOffset: 5, time: '17:00', done: false }
      ] },
      { id: 'project', title: '專案提醒', icon: 'clipboard', addLabel: '新增', items: [
        { id: 'p1', text: '專案 B 已超過兩週未更新', done: false },
        { id: 'p2', text: '專案 C 困難度較高，需重新評估', done: false },
        { id: 'p3', text: '專案 D 目前進度未達預期', done: false },
        { id: 'p4', text: '專案 E 花費時間過多，需檢討優化', done: false }
      ] }
    ],
    goals: { title: '本週目標（本週目標）', icon: 'target', addLabel: '新增目標', items: [
      { id: 'g1', title: '知識庫升級計畫', description: '整理學習筆記個人知識系統', result: '完成索引結構改版', color: 'violet', steps: [
        { id: 's1', text: '繪製既有索引', done: true }, { id: 's2', text: '定義新版欄位', done: true },
        { id: 's3', text: '完成資料對照', done: true }, { id: 's4', text: '完成一致性測試', done: false }
      ] },
      { id: 'g2', title: '產品研究筆記', description: '完成研究統整筆記', result: '完成研究統稿整理', color: 'green', steps: [
        { id: 's1', text: '整理訪談材料', done: true }, { id: 's2', text: '歸納結論撰寫', done: true }, { id: 's3', text: '完成研究整理', done: false }
      ] },
      { id: 'g3', title: '生活系統優化', description: '建立專注工作流程', result: '建立專注工作流程', color: 'blue', steps: [
        { id: 's1', text: '設定專注時段', done: true }, { id: 's2', text: '完成兩次實測', done: true }, { id: 's3', text: '記錄成果與回顧', done: false }
      ] }
    ] },
    experiments: { title: '系統實驗室', icon: 'gear', addLabel: '新增實驗', countLabel: '進行中', items: [
      { id: 'e1', title: 'Canvas 視覺化整理', description: '建立個人知識地圖與架構', status: '啟用中', color: 'blue', criterion: '整理一個主題並確認能回到來源。', steps: [
        { id: 's1', text: '繪製主題地圖', done: true }, { id: 's2', text: '測試頁面跳轉', done: false }, { id: 's3', text: '整理範本', done: false }
      ] },
      { id: 'e2', title: 'AI 摘要輔助', description: '課堂逐字稿轉卡片筆記', status: '待體驗', color: 'amber', criterion: '摘要能保留原文的重要內容。', steps: [
        { id: 's1', text: '建立轉換流程', done: true }, { id: 's2', text: '測試範例資料', done: false }, { id: 's3', text: '調整提示詞', done: false }
      ] },
      { id: 'e3', title: '每日檢視清單 v2', description: '建立每日／每週回顧流程', status: '已驗過/隔離追蹤', color: 'green', criterion: '連續試用三天，保留有效與不適用的觀察。', steps: [
        { id: 's1', text: '建立每日清單', done: true }, { id: 's2', text: '串接週末深思', done: false }, { id: 's3', text: '優化自動更新', done: false }
      ] }
    ] },
    ideas: [{ id: 'i1', title: '比較兩種筆記整理方式' }, { id: 'i2', title: '調整每日開工順序' }],
    ui: {
      weekLabel: '本週', viewWeekLabel: '檢視週', previousWeek: '上一週', nextWeek: '下一週',
      close: '關閉', more: '更多操作', add: '新增', save: '儲存', cancel: '取消', details: '查看詳情',
      sampleNote: '示意資料，僅供頁面預覽。這裡的操作不會寫入筆記或日曆。',
      hoursUnit: '小時', titleLabel: '名稱', descriptionLabel: '簡短說明', stepsLabel: '小目標（每行一項）',
      ideaLabel: '選取想法', criterionLabel: '如何判斷結果', trialLabel: '這次要試什麼', emptyLabel: '這個期間尚無示意項目。',
      newGoalTitle: '新增本週目標', newExperimentTitle: '新增實驗', newExperimentStatus: '待體驗',
      focusDatePrefix: '', activeExperimentsSuffix: '項'
    }
  };
});

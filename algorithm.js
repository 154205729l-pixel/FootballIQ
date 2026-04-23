/**
 * 足球智商测试 — 计分算法
 */
var Algorithm = (function () {

  function run(selections) {
    var total = QUESTIONS.length;
    var correct = 0;
    var categoryScores = {};

    CATEGORY_KEYS.forEach(function (k) {
      categoryScores[k] = { total: 0, correct: 0, pct: 0 };
    });

    QUESTIONS.forEach(function (q, i) {
      var cat = q.category;
      categoryScores[cat].total++;
      if (selections[i] !== undefined) {
        var opt = q.options[selections[i]];
        if (opt && opt.correct) {
          correct++;
          categoryScores[cat].correct++;
        }
      }
    });

    CATEGORY_KEYS.forEach(function (k) {
      var s = categoryScores[k];
      s.pct = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
    });

    var rank = RANKS[RANKS.length - 1];
    for (var i = 0; i < RANKS.length; i++) {
      if (correct >= RANKS[i].minScore) {
        rank = RANKS[i];
        break;
      }
    }

    var pct = Math.round(correct / total * 100);

    return {
      correct: correct,
      total: total,
      pct: pct,
      rank: rank,
      categoryScores: categoryScores
    };
  }

  return { run: run };
})();

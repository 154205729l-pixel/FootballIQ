(function () {

  var TOTAL = QUESTIONS.length;
  var selections = {};
  var cheatedQuestions = {};
  var reviewUsed = false;
  var cheatHintTimer = null;
  var LETTERS = ['A', 'B', 'C', 'D'];

  var pageQuiz = document.getElementById('page-quiz');
  var pageResult = document.getElementById('page-result');
  var progressFill = document.getElementById('progress-fill');
  var questionsContainer = document.getElementById('questions-container');
  var answerGrid = document.getElementById('answer-grid');
  var btnSubmit = document.getElementById('btn-submit');
  var submitBar = document.getElementById('submit-bar');
  var toastEl = document.getElementById('toast');

  var cheatModal = document.getElementById('cheat-modal');
  var cheatModalTitle = document.getElementById('cheat-modal-title');
  var cheatModalDesc = document.getElementById('cheat-modal-desc');
  var cheatModalBtn = document.getElementById('cheat-modal-btn');
  var cheatModalClose = document.getElementById('cheat-modal-close');

  document.getElementById('exam-id').textContent = '2026' + Math.floor(10000000 + Math.random() * 90000000);
  document.getElementById('seat-id').textContent = Math.floor(1 + Math.random() * 30);

  init();

  function init() {
    renderQuestions();
    renderAnswerGrid();
    updateProgress();
  }

  // ── 激励视频（委托给 reward-sdk.js） ──
  function showRewardAd(callback) {
    RewardAd.show(callback);
  }

  // ── 填充抄的答案（绿色） ──
  function cheatFillAnswer(qi) {
    var q = QUESTIONS[qi];
    var correctIdx = q.options.findIndex(function (o) { return o.correct; });
    selections[qi] = correctIdx;
    cheatedQuestions[qi] = true;

    var card = questionsContainer.querySelector('[data-qi="' + qi + '"].question-item');
    card.classList.add('answered');
    card.querySelectorAll('.option-item').forEach(function (el) {
      var oi = parseInt(el.getAttribute('data-oi'));
      el.classList.remove('selected', 'cheated');
      if (oi === correctIdx) el.classList.add('cheated');
    });

    // 移除提示条
    var hint = card.querySelector('.cheat-hint');
    if (hint) hint.remove();

    updateProgress();
    updateAnswerGrid();
  }

  // ── 抄答案/复查弹窗逻辑 ──
  var pendingCheatCallback = null;
  var pendingCloseCallback = null;

  function showCheatModal(title, desc, btnText, callback, closeText, closeCallback) {
    cheatModalTitle.textContent = title;
    cheatModalDesc.textContent = desc;
    cheatModalBtn.textContent = btnText;
    cheatModalClose.textContent = closeText || '算了，自己答';
    pendingCheatCallback = callback;
    pendingCloseCallback = closeCallback || null;
    cheatModal.classList.add('show');
  }

  function hideCheatModal() {
    cheatModal.classList.remove('show');
    pendingCheatCallback = null;
    pendingCloseCallback = null;
  }

  cheatModalBtn.addEventListener('click', function () {
    var cb = pendingCheatCallback;
    hideCheatModal();
    if (cb) {
      showRewardAd(cb);
    }
  });

  cheatModalClose.addEventListener('click', function () {
    var cb = pendingCloseCallback;
    hideCheatModal();
    if (cb) cb();
  });

  // ── 渲染题目 ──
  function renderQuestions() {
    var html = '';
    var currentCat = '';
    var sectionNames = {
      rules: '一、规则认知题', history: '二、历史知识题',
      data: '三、数据记忆题', tactics: '四、战术理解题', trivia: '五、冷知识题'
    };
    var sectionScores = {
      rules: '（本大题共4小题，每小题5分，共20分）',
      history: '（本大题共4小题，每小题5分，共20分）',
      data: '（本大题共4小题，每小题5分，共20分）',
      tactics: '（本大题共4小题，每小题5分，共20分）',
      trivia: '（本大题共4小题，每小题5分，共20分）'
    };

    QUESTIONS.forEach(function (q, i) {
      if (q.category !== currentCat) {
        currentCat = q.category;
        html += '<div class="section-header">' + sectionNames[currentCat] +
          ' <span class="section-score">' + sectionScores[currentCat] + '</span></div>';
      }

      var hasFig = (q.figure !== undefined && FIGURES[q.figure]);
      html += '<div class="question-item' + (hasFig ? ' has-figure' : '') + '" data-qi="' + i + '" style="position:relative">';
      html += '<div class="question-body">';
      html += '<div class="question-num">' + (i + 1) + '.</div>';
      html += '<div class="question-text">' + escapeHtml(q.text) + '</div>';
      html += '<ul class="options-list">';
      q.options.forEach(function (opt, oi) {
        html += '<li class="option-item" data-qi="' + i + '" data-oi="' + oi + '">';
        html += '<span class="option-letter">' + LETTERS[oi] + '</span>';
        html += '<span class="option-text">' + escapeHtml(opt.text) + '</span>';
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
      if (hasFig) {
        html += '<div class="question-figure">' + FIGURES[q.figure] + '<div class="figure-label">（图' + (i + 1) + '）</div></div>';
      }
      html += '</div>';
    });

    questionsContainer.innerHTML = html;

    questionsContainer.addEventListener('click', function (e) {
      // 抄学霸提示点击
      var hint = e.target.closest('.cheat-hint');
      if (hint) {
        var qi = parseInt(hint.getAttribute('data-qi'));
        hint.remove();
        showCheatModal(
          '抄学霸的答案',
          '看一段视频，获取第' + (qi + 1) + '题的正确答案',
          '看视频，抄答案',
          function () { cheatFillAnswer(qi); }
        );
        return;
      }

      var item = e.target.closest('.option-item');
      if (!item) return;
      var qi = parseInt(item.getAttribute('data-qi'));
      var oi = parseInt(item.getAttribute('data-oi'));

      // 如果之前是抄的，用户重新选择则清除抄的标记
      if (cheatedQuestions[qi]) {
        delete cheatedQuestions[qi];
        var card = item.closest('.question-item');
        card.querySelectorAll('.option-item.cheated').forEach(function (el) {
          el.classList.remove('cheated');
        });
      }

      selections[qi] = oi;

      var card = item.closest('.question-item');
      card.querySelectorAll('.option-item').forEach(function (el) {
        el.classList.toggle('selected', parseInt(el.getAttribute('data-oi')) === oi);
      });
      card.classList.add('answered');

      // 移除提示条
      var existingHint = card.querySelector('.cheat-hint');
      if (existingHint) existingHint.remove();

      updateProgress();
      updateAnswerGrid();

      setTimeout(function () {
        var next = findNextUnanswered(qi);
        if (next !== -1) {
          var nextEl = questionsContainer.querySelector('[data-qi="' + next + '"].question-item');
          if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
    });
  }

  function findNextUnanswered(fromIdx) {
    for (var i = fromIdx + 1; i < TOTAL; i++) {
      if (selections[i] === undefined) return i;
    }
    for (var j = 0; j < fromIdx; j++) {
      if (selections[j] === undefined) return j;
    }
    return -1;
  }

  // ── 答题卡 ──
  function renderAnswerGrid() {
    var html = '';
    for (var i = 0; i < TOTAL; i++) {
      html += '<div class="answer-dot" data-qi="' + i + '">' + (i + 1) + '</div>';
    }
    answerGrid.innerHTML = html;

    answerGrid.addEventListener('click', function (e) {
      var dot = e.target.closest('.answer-dot');
      if (!dot) return;
      var qi = parseInt(dot.getAttribute('data-qi'));
      var el = questionsContainer.querySelector('[data-qi="' + qi + '"].question-item');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 未答题显示"抄学霸的"提示
        if (selections[qi] === undefined) {
          showCheatHint(qi, el);
        }
      }
    });
  }

  function showCheatHint(qi, questionEl) {
    // 清除之前的提示
    document.querySelectorAll('.cheat-hint').forEach(function (h) { h.remove(); });
    if (cheatHintTimer) { clearTimeout(cheatHintTimer); cheatHintTimer = null; }

    var hint = document.createElement('div');
    hint.className = 'cheat-hint';
    hint.setAttribute('data-qi', qi);
    hint.innerHTML = '📝 抄学霸第' + (qi + 1) + '题的答案';
    questionEl.appendChild(hint);

    cheatHintTimer = setTimeout(function () {
      if (hint.parentNode) hint.remove();
    }, 4000);
  }

  function updateAnswerGrid() {
    var dots = answerGrid.querySelectorAll('.answer-dot');
    dots.forEach(function (dot) {
      var qi = parseInt(dot.getAttribute('data-qi'));
      dot.classList.remove('filled', 'cheated');
      if (selections[qi] !== undefined) {
        dot.textContent = LETTERS[selections[qi]];
        if (cheatedQuestions[qi]) {
          dot.classList.add('cheated');
        } else {
          dot.classList.add('filled');
        }
      } else {
        dot.textContent = (qi + 1);
      }
    });
  }

  function updateProgress() {
    var answered = Object.keys(selections).length;
    progressFill.style.width = (answered / TOTAL * 100) + '%';
    btnSubmit.disabled = false;
    if (answered >= TOTAL) {
      btnSubmit.textContent = '交 卷（' + answered + '/' + TOTAL + '）';
    } else {
      btnSubmit.textContent = '交 卷（还剩' + (TOTAL - answered) + '题）';
    }
  }

  // ── 交卷逻辑 ──
  btnSubmit.addEventListener('click', function () {
    var answered = Object.keys(selections).length;

    // 未答完 → 抄答案弹窗
    if (answered < TOTAL) {
      var firstUnanswered = findNextUnanswered(-1);
      if (firstUnanswered === -1) return;
      showCheatModal(
        '还有题没答完！',
        '看一段视频，抄同学第' + (firstUnanswered + 1) + '题的答案',
        '看视频，抄答案',
        function () {
          cheatFillAnswer(firstUnanswered);
          var el = questionsContainer.querySelector('[data-qi="' + firstUnanswered + '"].question-item');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      );
      return;
    }

    // 全部答完 → 检查是否需要复查
    var wrongCount = getWrongCount();
    if (wrongCount > 0 && !reviewUsed) {
      showCheatModal(
        '监考老师偷偷提醒你',
        '你有' + wrongCount + '道题可能答错了，看视频获得一次复查机会',
        '看视频，获得复查机会',
        function () {
          reviewUsed = true;
          highlightWrongQuestions();
          showToast('答错的题已标红，快去改答案！');
        },
        '不用了，直接交卷',
        function () { showResult(); }
      );
      return;
    }

    showResult();
  });

  function getWrongCount() {
    var count = 0;
    QUESTIONS.forEach(function (q, i) {
      if (selections[i] !== undefined) {
        if (!q.options[selections[i]].correct) count++;
      }
    });
    return count;
  }

  function highlightWrongQuestions() {
    QUESTIONS.forEach(function (q, i) {
      var card = questionsContainer.querySelector('[data-qi="' + i + '"].question-item');
      if (!card) return;
      card.classList.remove('review-wrong');
      if (selections[i] !== undefined && !q.options[selections[i]].correct) {
        card.classList.add('review-wrong');
      }
    });
    // 滚动到第一个错题
    var firstWrong = questionsContainer.querySelector('.review-wrong');
    if (firstWrong) {
      firstWrong.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showResult() {
    var data = Algorithm.run(selections);
    var r = data.rank;
    var score = data.correct * 5;

    pageQuiz.classList.remove('active');
    pageResult.classList.add('active');
    document.querySelector('.answer-sheet').style.display = 'none';
    submitBar.style.display = 'none';
    window.scrollTo(0, 0);

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-rank').textContent = r.name;
    document.getElementById('result-tagline').textContent = '「' + r.tagline + '」';
    document.getElementById('result-desc').textContent = r.description;

    var stamp = document.getElementById('result-stamp');
    stamp.classList.remove('animate');
    void stamp.offsetWidth;
    stamp.classList.add('animate');

    renderScoreTable(data);
    renderDetail(data);
  }

  function renderScoreTable(data) {
    var tbody = document.getElementById('score-tbody');
    var html = '';
    CATEGORY_KEYS.forEach(function (k) {
      var cat = CATEGORIES[k];
      var s = data.categoryScores[k];
      var got = s.correct * 5;
      var full = s.total * 5;
      var perfect = s.correct === s.total;
      html += '<tr>';
      html += '<td>' + cat.name + '</td>';
      html += '<td class="score-value ' + (perfect ? 'score-perfect' : '') + '">' + got + '</td>';
      html += '<td>' + full + '</td>';
      html += '<td>' + s.pct + '%</td>';
      html += '</tr>';
    });
    var totalScore = data.correct * 5;
    html += '<tr style="font-weight:700">';
    html += '<td>总 分</td>';
    html += '<td class="score-value" style="font-size:18px">' + totalScore + '</td>';
    html += '<td>100</td>';
    html += '<td>' + data.pct + '%</td>';
    html += '</tr>';
    tbody.innerHTML = html;
  }

  function renderDetail(data) {
    var container = document.getElementById('detail-container');
    var html = '';
    var currentCat = '';
    var catNames = { rules: '规则认知', history: '历史知识', data: '数据记忆', tactics: '战术理解', trivia: '冷知识' };

    QUESTIONS.forEach(function (q, i) {
      if (q.category !== currentCat) {
        if (currentCat) html += '</div>';
        currentCat = q.category;
        html += '<div class="detail-section"><div class="detail-title">' + catNames[currentCat] + '</div>';
      }
      var userPick = selections[i];
      var isCorrect = q.options[userPick] && q.options[userPick].correct;
      var correctIdx = q.options.findIndex(function (o) { return o.correct; });
      var wasCheated = cheatedQuestions[i];
      var icon = wasCheated ? '📝' : (isCorrect ? '✓' : '✗');
      var cls = wasCheated ? 'detail-correct' : (isCorrect ? 'detail-correct' : 'detail-wrong');

      html += '<div class="detail-item">';
      html += '<span class="' + cls + '">' + icon + '</span> ';
      html += (i + 1) + '. ' + escapeHtml(q.text);
      html += ' <span class="' + cls + '">（你选' + LETTERS[userPick];
      if (wasCheated) html += '·抄的';
      html += '）</span>';
      if (!isCorrect) {
        html += '<div class="detail-answer">正确答案：' + LETTERS[correctIdx] + '. ' + escapeHtml(q.options[correctIdx].text) + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── 重考 ──
  document.getElementById('btn-retry').addEventListener('click', function () {
    selections = {};
    cheatedQuestions = {};
    reviewUsed = false;
    pageResult.classList.remove('active');
    pageQuiz.classList.add('active');
    document.querySelector('.answer-sheet').style.display = '';
    submitBar.style.display = '';
    window.scrollTo(0, 0);
    document.getElementById('exam-id').textContent = '2026' + Math.floor(10000000 + Math.random() * 90000000);
    document.getElementById('seat-id').textContent = Math.floor(1 + Math.random() * 30);
    questionsContainer.querySelectorAll('.option-item.selected').forEach(function (el) { el.classList.remove('selected'); });
    questionsContainer.querySelectorAll('.option-item.cheated').forEach(function (el) { el.classList.remove('cheated'); });
    questionsContainer.querySelectorAll('.question-item.answered').forEach(function (el) { el.classList.remove('answered'); });
    questionsContainer.querySelectorAll('.question-item.review-wrong').forEach(function (el) { el.classList.remove('review-wrong'); });
    document.querySelectorAll('.cheat-hint').forEach(function (h) { h.remove(); });
    updateAnswerGrid();
    updateProgress();
  });

  // ── 分享 ──
  document.getElementById('btn-share').addEventListener('click', function () {
    generateShareCard();
  });

  function generateShareCard() {
    var canvas = document.getElementById('share-canvas');
    var ctx = canvas.getContext('2d');
    var W = 640, H = 900;
    canvas.width = W;
    canvas.height = H;

    var data = Algorithm.run(selections);
    var r = data.rank;
    var score = data.correct * 5;

    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (var y = 0; y < H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, 0, W, 4);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#666';
    ctx.font = '20px "Songti SC", serif';
    ctx.fillText('2026年全国足球统一考试', W / 2, 50);

    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 28px "Songti SC", serif';
    ctx.fillText('成 绩 报 告 单', W / 2, 90);

    ctx.save();
    ctx.translate(W / 2, 210);
    ctx.rotate(-0.14);
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 78, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(204,0,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 52px "Songti SC", serif';
    ctx.fillText(score, 0, 16);
    ctx.font = '14px "Songti SC", serif';
    ctx.fillText('分', 0, 40);
    ctx.restore();

    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 26px "Songti SC", serif';
    ctx.fillText('【' + r.name + '】', W / 2, 330);

    ctx.fillStyle = '#333';
    ctx.font = 'italic 20px "Songti SC", serif';
    ctx.fillText('「' + r.tagline + '」', W / 2, 365);

    var tableY = 410;
    var colX = [100, 260, 380, 520];
    var headers = ['题型', '得分', '满分', '正确率'];

    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(60, tableY - 20, W - 120, 32);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px "Songti SC", serif';
    ctx.textAlign = 'center';
    headers.forEach(function (h, i) { ctx.fillText(h, colX[i], tableY); });

    ctx.font = '15px "Songti SC", serif';
    CATEGORY_KEYS.forEach(function (k, i) {
      var cat = CATEGORIES[k];
      var s = data.categoryScores[k];
      var y = tableY + 36 + i * 32;
      ctx.fillStyle = '#333';
      ctx.fillText(cat.name, colX[0], y);
      ctx.fillStyle = s.correct === s.total ? '#cc0000' : '#333';
      ctx.font = 'bold 16px "Songti SC", serif';
      ctx.fillText(s.correct * 5 + '', colX[1], y);
      ctx.fillStyle = '#999';
      ctx.font = '15px "Songti SC", serif';
      ctx.fillText(s.total * 5 + '', colX[2], y);
      ctx.fillText(s.pct + '%', colX[3], y);
    });

    var totalY = tableY + 36 + 5 * 32;
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(60, totalY - 18, W - 120, 30);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px "Songti SC", serif';
    ctx.fillText('总分', colX[0], totalY);
    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 20px "Songti SC", serif';
    ctx.fillText(score + '', colX[1], totalY);
    ctx.fillStyle = '#999';
    ctx.font = '15px "Songti SC", serif';
    ctx.fillText('100', colX[2], totalY);
    ctx.fillText(data.pct + '%', colX[3], totalY);

    var cheatedCount = Object.keys(cheatedQuestions).length;
    if (cheatedCount > 0) {
      ctx.fillStyle = '#2e7d32';
      ctx.font = '14px "Songti SC", serif';
      ctx.fillText('（其中' + cheatedCount + '题为抄学霸答案）', W / 2, totalY + 30);
    }

    ctx.fillStyle = '#bbb';
    ctx.font = '14px "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('全国足球统一考试委员会（盖章）', W / 2, H - 60);
    ctx.fillText('懂球帝出品', W / 2, H - 35);

    document.getElementById('share-modal').classList.add('show');
  }

  document.getElementById('btn-save-card').addEventListener('click', function () {
    var canvas = document.getElementById('share-canvas');
    var link = document.createElement('a');
    link.download = '足球高考成绩单.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('btn-close-modal').addEventListener('click', function () {
    document.getElementById('share-modal').classList.remove('show');
  });

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

})();

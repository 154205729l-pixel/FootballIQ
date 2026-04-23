/**
 * 激励视频统一接入层
 * 真实SDK可用时走UnifiedRewardSDK，否则降级mock倒计时
 */
(function (root) {
  'use strict';

  var sdkInstance = null;
  var sdkReady = false;

  function initSdk() {
    if (!root.UnifiedRewardSDK) {
      console.warn('[RewardAd] UnifiedRewardSDK not found, will use mock');
      return;
    }

    root.__UNIFIED_REWARD_CONFIG = {
      platform: 'auto',
      sceneId: 'footballIQ_gaokao',
      behavior: {
        callbackTimeout: 8000,
        preloadCallbackTimeout: 12000,
        showCallbackTimeout: 10000,
        preloadAllowTimeout: true,
        showAllowTimeoutAsSuccess: true,
        bridgeDetectTimeout: 5000,
        readyRetryTimeout: 8000,
        readyRetryInterval: 300
      },
      reward: {
        reward_name: 'cheat_answer',
        reward_amount: '1',
        data: JSON.stringify({ entry: 'footballIQ_gaokao', play_trigger: 'cheat_or_review' })
      }
    };

    sdkInstance = root.UnifiedRewardSDK.create({
      onLog: function (title, data) {
        console.log('[RewardAd]', title, data);
      }
    });

    sdkInstance.ensureReady(function (readyErr) {
      if (readyErr) {
        console.warn('[RewardAd] bridge not ready, will use mock:', readyErr.message);
        return;
      }
      sdkReady = true;
      console.log('[RewardAd] bridge ready, preloading...');
      sdkInstance.requestAndPreload(function (preErr) {
        if (preErr) console.warn('[RewardAd] preload fail:', preErr.message);
        else console.log('[RewardAd] preload done');
      });
    });
  }

  function showRewardVideo(onSuccess, onFail) {
    if (sdkReady && sdkInstance) {
      sdkInstance.showWithPreloadedOrRequest(function (err, detail) {
        if (err) {
          console.warn('[RewardAd] show fail:', err.message);
          if (onFail) onFail(err);
          else if (onSuccess) onSuccess();
          return;
        }
        console.log('[RewardAd] show success', detail);
        if (onSuccess) onSuccess();
        sdkInstance.requestAndPreload(function () {});
      });
    } else {
      showMockAd(onSuccess);
    }
  }

  function showMockAd(callback) {
    var modal = document.getElementById('reward-ad-modal');
    var countdown = document.getElementById('reward-countdown');
    var progressFill = document.getElementById('reward-progress-fill');

    modal.classList.add('show');
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    var count = 3;
    countdown.textContent = count;

    void progressFill.offsetWidth;
    progressFill.style.transition = 'width 1s linear';

    var timer = setInterval(function () {
      count--;
      progressFill.style.width = ((3 - count) / 3 * 100) + '%';
      if (count > 0) {
        countdown.textContent = count;
      } else {
        clearInterval(timer);
        countdown.textContent = '✓';
        setTimeout(function () {
          modal.classList.remove('show');
          progressFill.style.width = '0%';
          if (callback) callback();
        }, 400);
      }
    }, 1000);
  }

  initSdk();

  root.RewardAd = {
    show: showRewardVideo,
    isReady: function () { return sdkReady; }
  };

})(window);

/*
 * UnifiedRewardSDK
 *
 * One SDK for both iOS and Android WebView rewarded video flow.
 * - iOS   -> dongdianqiu (Taku style adRequest params)
 * - Android -> dongqiudi (ToBid style adRequest params)
 */
(function (root) {
  'use strict';

  // 业务只需要改这里：统一内置配置（不再需要额外 params 文件）
  var EMBEDDED_CONFIG = {
    platform: 'auto', // auto | ios | android
    sceneId: 'leagueCollect_14',
    adRequest: {
      ios: {
        method: 'get',
        urlMap: {
          'test1-n.dongdianqiu.com': 'https://test-ap.dongdianqiu.com/plat/v3',
          'beta-n.dongdianqiu.com': 'https://beta-ap.dongdianqiu.com/plat/v3',
          'n.dongdianqiu.com': 'https://ap.dongdianqiu.com/plat/v3'
        },
        fallbackUrl: 'https://ap.dongdianqiu.com/plat/v3',
        param: {
          apname: 'DProApp',
          apvc: '8.5.2',
          os: 'ios',
          platform: '1',
          position: '0',
          pgid: '1.15.2'
        }
      },
      android: {
        method: 'get',
        urlMap: {
          'test1-n.dongqiudi.com': 'https://test-ap.dongqiudi.com/plat/v3',
          'beta-n.dongqiudi.com': 'https://beta-ap.dongqiudi.com/plat/v3',
          'n.dongqiudi.com': 'https://ap.dongqiudi.com/plat/v3',
          '10.18.7.0': 'https://beta-ap.dongqiudi.com/plat/v3'
        },
        fallbackUrl: 'https://ap.dongqiudi.com/plat/v3',
        param: {
          pgid: '1.15.2'
        }
      }
    },
    reward: {
      reward_name: 'coin',
      reward_amount: '1',
      data: '',
      pgid: '1.15.2'
    },
    behavior: {
      callbackTimeout: 8000,
      preloadCallbackTimeout: 12000,
      showCallbackTimeout: 10000,
      preloadAllowTimeout: false,
      showAllowTimeoutAsSuccess: false,
      bridgeDetectTimeout: 5000,
      readyRetryTimeout: 8000,
      readyRetryInterval: 300,
      preloadMaxAge: 180000
    }
  };

  var DEFAULTS = null;

  function extend(target) {
    var i;
    var key;
    var source;
    target = target || {};
    for (i = 1; i < arguments.length; i += 1) {
      source = arguments[i] || {};
      for (key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  function clone(value) {
    if (!value || typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
  }

  function isPositiveNumber(value) {
    return typeof value === 'number' && isFinite(value) && value > 0;
  }

  function normalizeConfig(config) {
    var input = config || {};
    var merged = clone(EMBEDDED_CONFIG);

    if (typeof input.platform === 'string' && input.platform) {
      merged.platform = input.platform;
    }
    if (typeof input.sceneId === 'string' && input.sceneId) {
      merged.sceneId = input.sceneId;
    }
    if (input.reward) {
      merged.reward = extend({}, merged.reward, input.reward);
    }
    if (input.behavior) {
      merged.behavior = extend({}, merged.behavior, input.behavior);
    }
    if (input.adRequest && input.adRequest.ios) {
      merged.adRequest.ios = extend({}, merged.adRequest.ios, input.adRequest.ios);
      merged.adRequest.ios.param = extend({}, EMBEDDED_CONFIG.adRequest.ios.param, input.adRequest.ios.param || {});
      merged.adRequest.ios.urlMap = extend({}, EMBEDDED_CONFIG.adRequest.ios.urlMap, input.adRequest.ios.urlMap || {});
    }
    if (input.adRequest && input.adRequest.android) {
      merged.adRequest.android = extend({}, merged.adRequest.android, input.adRequest.android);
      merged.adRequest.android.param = extend({}, EMBEDDED_CONFIG.adRequest.android.param, input.adRequest.android.param || {});
      merged.adRequest.android.urlMap = extend({}, EMBEDDED_CONFIG.adRequest.android.urlMap, input.adRequest.android.urlMap || {});
    }

    return merged;
  }

  function buildDefaultsFromConfig(config) {
    var normalized = normalizeConfig(config);
    return {
      platform: normalized.platform || 'auto',
      bridgeDetectTimeout: Number(normalized.behavior && normalized.behavior.bridgeDetectTimeout) || 5000,
      callbackTimeout: Number(normalized.behavior && normalized.behavior.callbackTimeout) || 8000,
      preloadCallbackTimeout: Number(normalized.behavior && normalized.behavior.preloadCallbackTimeout) || Number(normalized.behavior && normalized.behavior.callbackTimeout) || 12000,
      showCallbackTimeout: Number(normalized.behavior && normalized.behavior.showCallbackTimeout) || Number(normalized.behavior && normalized.behavior.callbackTimeout) || 10000,
      preloadAllowTimeout: !!(normalized.behavior && normalized.behavior.preloadAllowTimeout),
      showAllowTimeoutAsSuccess: !!(normalized.behavior && normalized.behavior.showAllowTimeoutAsSuccess),
      readyRetryTimeout: Number(normalized.behavior && normalized.behavior.readyRetryTimeout) || 8000,
      readyRetryInterval: Number(normalized.behavior && normalized.behavior.readyRetryInterval) || 300,
      preloadMaxAge: Number(normalized.behavior && normalized.behavior.preloadMaxAge) || 180000,
      sceneId: normalized.sceneId || 'leagueCollect_14',
      adRequest: {
        ios: clone(normalized.adRequest.ios),
        android: clone(normalized.adRequest.android)
      },
      reward: clone(normalized.reward),
      onLog: null
    };
  }

  if (!root.__UNIFIED_REWARD_CONFIG) {
    root.__UNIFIED_REWARD_CONFIG = clone(EMBEDDED_CONFIG);
  }
  DEFAULTS = buildDefaultsFromConfig(root.__UNIFIED_REWARD_CONFIG);

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function createSdkError(code, message, detail) {
    var error = new Error(message || code || 'unknown_error');
    error.code = code || 'REWARD_UNKNOWN_ERROR';
    if (typeof detail !== 'undefined') {
      error.detail = detail;
    }
    return error;
  }

  function wrapSdkError(error, code, message, detail) {
    var nextError;
    if (error && error.code) {
      if (typeof detail !== 'undefined' && typeof error.detail === 'undefined') {
        error.detail = detail;
      }
      return error;
    }

    nextError = createSdkError(
      code,
      (error && error.message) ? error.message : (message || 'unknown_error'),
      detail
    );

    if (error && error.stack) {
      nextError.stack = error.stack;
    }

    return nextError;
  }

  function parseOptionsAndCallback(options, callback) {
    var result = {
      options: {},
      callback: isFunction(callback) ? callback : function () {}
    };

    if (isFunction(options)) {
      result.callback = options;
      return result;
    }

    if (options && typeof options === 'object') {
      result.options = options;
      return result;
    }

    if (typeof options !== 'undefined' && options !== null) {
      result.options = { timeout: options };
    }

    return result;
  }

  function safeJsonParse(value) {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  function normalizeOrigin(origin) {
    var normalized = (origin || 'topon').toString().trim().toLowerCase();
    if (normalized === 'csj') normalized = 'jrtt';
    if (['topon', 'gdt', 'jrtt', 'dqd', 'tobid'].indexOf(normalized) < 0) {
      normalized = 'topon';
    }
    return normalized;
  }

  function unwrapResponse(response) {
    var wrapped = response && response._responseWrapedByNative ? response._responseWrapedByNative : response;
    return safeJsonParse(wrapped);
  }

  function findRewardedAdItem(body) {
    var list = body && body.data;
    var i;

    if (Object.prototype.toString.call(list) !== '[object Array]') {
      return null;
    }

    for (i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].ad_type === 'sdk_rewarded_video') {
        return list[i];
      }
    }

    return null;
  }

  function ensureBridgeConnector() {
    if (root.connectWebViewJavascriptBridge) return;

    root.connectWebViewJavascriptBridge = function (callback) {
      var iframe;

      if (root.WebViewJavascriptBridge) {
        if (!root.WebViewJavascriptBridge._messageHandler && root.WebViewJavascriptBridge.init) {
          root.WebViewJavascriptBridge.init(function () {});
        }
        callback(root.WebViewJavascriptBridge);
        return;
      }

      if (root.$bridge && root.$bridge.callHandler) {
        callback(root.$bridge);
        return;
      }

      document.addEventListener('WebViewJavascriptBridgeReady', function () {
        if (root.WebViewJavascriptBridge && !root.WebViewJavascriptBridge._messageHandler && root.WebViewJavascriptBridge.init) {
          root.WebViewJavascriptBridge.init(function () {});
        }
        callback(root.WebViewJavascriptBridge || root.$bridge || null);
      }, false);

      if (root.WVJBCallbacks) {
        root.WVJBCallbacks.push(callback);
        return;
      }

      root.WVJBCallbacks = [callback];
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'https://__bridge_loaded__';
      document.documentElement.appendChild(iframe);
      setTimeout(function () {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 0);
    };
  }

  function detectPlatformByUA() {
    var ua = (root.navigator && root.navigator.userAgent ? root.navigator.userAgent : '').toLowerCase();
    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod|ios/.test(ua)) return 'ios';
    return 'android';
  }

  function UnifiedRewardBridge(options, baseDefaults) {
    var opts = options || {};
    var defaults = baseDefaults || DEFAULTS;
    this.options = extend({}, defaults, opts);
    this.options.adRequest = {
      ios: extend({}, clone(defaults.adRequest.ios), clone(opts.adRequest && opts.adRequest.ios || {})),
      android: extend({}, clone(defaults.adRequest.android), clone(opts.adRequest && opts.adRequest.android || {}))
    };
    this.options.reward = extend({}, clone(defaults.reward), clone(opts.reward || {}));
    this.currentPayload = null;
    this.currentPlatform = null;
    this.preloadedRecord = null;
    this._disconnectRegistered = false;
    this._disconnectListeners = [];
  }

  UnifiedRewardBridge.prototype.log = function (title, data) {
    if (isFunction(this.options.onLog)) {
      this.options.onLog(title, data);
    }
    if (root.console && root.console.log) {
      root.console.log('[UnifiedRewardSDK] ' + title, data || '');
    }
  };

  UnifiedRewardBridge.prototype.getPlatform = function (overridePlatform) {
    var platform = overridePlatform || this.options.platform || 'auto';
    if (platform === 'ios' || platform === 'android') {
      return platform;
    }
    return detectPlatformByUA();
  };

  UnifiedRewardBridge.prototype.getBridge = function (options, callback) {
    var parsed = parseOptionsAndCallback(options, callback);
    var opts = parsed.options;
    var cb = parsed.callback;
    var done = false;
    var timeout;
    var timeoutMs = Number(opts.timeout);

    if (!isPositiveNumber(timeoutMs)) {
      timeoutMs = this.options.bridgeDetectTimeout;
    }

    ensureBridgeConnector();

    timeout = setTimeout(function () {
      if (done) return;
      done = true;
      cb(createSdkError('REWARD_BRIDGE_NOT_READY', '未检测到可用的 WebView bridge', {
        timeout: timeoutMs
      }));
    }, timeoutMs);

    root.connectWebViewJavascriptBridge(function (bridge) {
      if (done) return;
      done = true;
      clearTimeout(timeout);

      if (bridge && bridge.callHandler) {
        cb(null, bridge);
        return;
      }

      cb(createSdkError('REWARD_BRIDGE_NO_CALL_HANDLER', 'bridge 已就绪，但没有 callHandler'));
    });
  };

  UnifiedRewardBridge.prototype.callHandler = function (name, data, callback, callOptions) {
    var self = this;
    var cb = isFunction(callback) ? callback : function () {};
    var options = callOptions || {};
    var timeoutMs = Number(options.timeout);
    var allowTimeout = !!options.allowTimeout;

    if (!isPositiveNumber(timeoutMs)) {
      timeoutMs = self.options.callbackTimeout;
    }

    this.log('call ' + name, data);

    this.getBridge(function (bridgeErr, bridge) {
      var done = false;
      var timer;

      if (bridgeErr) {
        cb(bridgeErr);
        return;
      }

      timer = setTimeout(function () {
        if (done) return;
        done = true;
        cb(null, null, {
          timeout: true,
          timeoutMs: timeoutMs,
          allowTimeout: allowTimeout
        });
      }, timeoutMs);

      try {
        bridge.callHandler(name, data || {}, function (response) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          self.log(name + ' callback', response);
          cb(null, response, { timeout: false, timeoutMs: timeoutMs, allowTimeout: allowTimeout });
        });
      } catch (error) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cb(error);
      }
    });
  };

  UnifiedRewardBridge.prototype.detectBridge = function (options, callback) {
    var parsed = parseOptionsAndCallback(options, callback);
    this.getBridge(parsed.options, function (error) {
      parsed.callback(error || null);
    });
  };

  UnifiedRewardBridge.prototype.ensureReady = function (options, callback) {
    var self = this;
    var parsed = parseOptionsAndCallback(options, callback);
    var opts = parsed.options;
    var cb = parsed.callback;
    var totalTimeout = Number(opts.timeout);
    var retryInterval = Number(opts.interval);
    var singleTimeout = Number(opts.singleTimeout);
    var startedAt = Date.now();
    var attempts = 0;
    var done = false;

    if (!isPositiveNumber(totalTimeout)) {
      totalTimeout = this.options.readyRetryTimeout;
    }
    if (!isPositiveNumber(retryInterval)) {
      retryInterval = this.options.readyRetryInterval;
    }
    if (!isPositiveNumber(singleTimeout)) {
      singleTimeout = Math.min(this.options.bridgeDetectTimeout, Math.max(300, retryInterval));
    }

    function finish(error, detail) {
      if (done) return;
      done = true;
      cb(error || null, detail || null);
    }

    function tryOnce(lastError) {
      var elapsed = Date.now() - startedAt;
      var remaining = totalTimeout - elapsed;
      var nextTimeout;

      if (remaining <= 0) {
        finish(createSdkError('REWARD_BRIDGE_NOT_READY', 'bridge 在重试窗口内未就绪', {
          timeout: totalTimeout,
          interval: retryInterval,
          attempts: attempts,
          lastError: lastError ? lastError.message : ''
        }), {
          attempts: attempts,
          elapsed: elapsed
        });
        return;
      }

      attempts += 1;
      nextTimeout = Math.min(singleTimeout, remaining);

      self.getBridge({ timeout: nextTimeout }, function (error) {
        if (!error) {
          finish(null, {
            attempts: attempts,
            elapsed: Date.now() - startedAt
          });
          return;
        }

        setTimeout(function () {
          tryOnce(error);
        }, retryInterval);
      });
    }

    tryOnce(null);
  };

  UnifiedRewardBridge.prototype.resolveAdRequest = function (platform, options) {
    var cfg = this.options.adRequest[platform] || {};
    var reqOpts = options && options.adRequest ? options.adRequest : {};
    var hostname = root.location && root.location.hostname ? root.location.hostname : '';
    var finalParam = extend({}, cfg.param || {}, reqOpts.param || {});
    var finalUrl = reqOpts.url || (cfg.urlMap && cfg.urlMap[hostname]) || cfg.fallbackUrl;
    var pgid = (options && options.reward && options.reward.pgid) || this.options.reward.pgid || finalParam.pgid || '1.15.2';

    finalParam.pgid = pgid;

    if (platform === 'ios') {
      finalParam.os = 'ios';
      if (!finalParam.platform) finalParam.platform = '1';
      if (!finalParam.position) finalParam.position = '0';
    }

    return {
      method: (reqOpts.method || cfg.method || 'get').toLowerCase(),
      url: finalUrl,
      param: finalParam,
      callback: reqOpts.callback || 'onUnifiedAdRequestDone'
    };
  };

  UnifiedRewardBridge.prototype.buildPayloadFromAd = function (platform, adItem, options, adRequest) {
    var rewardCfg = extend({}, this.options.reward, options && options.reward || {});
    var adSource = adItem && adItem.ad_source ? adItem.ad_source : {};
    var sdkId = adSource.sdk_position_id || adItem.sdk_id || rewardCfg.sdk_id || rewardCfg.sdkId;
    var origin = normalizeOrigin(adItem.origin || adSource.sdk_origin || adSource.sdk_name || rewardCfg.origin || (platform === 'android' ? 'tobid' : 'topon'));
    var sceneId = (options && options.sceneId) || rewardCfg.id || rewardCfg.relate_id || this.options.sceneId;
    var pgid = rewardCfg.pgid || adItem.pgid || (adRequest && adRequest.param && adRequest.param.pgid) || '1.15.2';

    if (!sdkId) {
      throw createSdkError('REWARD_PAYLOAD_BUILD_FAILED', '广告配置缺少 sdk_id(ad_source.sdk_position_id)');
    }

    if (platform === 'ios') {
      return {
        id: sceneId,
        relate_id: sceneId,
        sdk_id: sdkId,
        sdkId: sdkId,
        origin: origin,
        platform: origin,
        reward_name: rewardCfg.reward_name || '',
        reward_amount: rewardCfg.reward_amount || '',
        data: typeof rewardCfg.data === 'undefined' ? '' : rewardCfg.data,
        imp_mon_arr: Array.isArray(adItem.imp_mon_arr) ? adItem.imp_mon_arr : [],
        click_mon_arr: Array.isArray(adItem.click_mon_arr) ? adItem.click_mon_arr : [],
        pgid: pgid
      };
    }

    return {
      origin: origin,
      sdk_id: sdkId,
      sdkId: sdkId,
      imp_mon_arr: Array.isArray(adItem.imp_mon_arr) ? adItem.imp_mon_arr : [],
      click_mon_arr: Array.isArray(adItem.click_mon_arr) ? adItem.click_mon_arr : [],
      ct: '',
      pgid: pgid
    };
  };

  UnifiedRewardBridge.prototype.setPayload = function (payload) {
    this.currentPayload = extend({}, payload || {});
    return this.currentPayload;
  };

  UnifiedRewardBridge.prototype.getPayload = function () {
    return this.currentPayload;
  };

  UnifiedRewardBridge.prototype.setPreloadedPayload = function (payload, platform) {
    var savedPayload;

    if (!payload) {
      return null;
    }

    savedPayload = extend({}, payload);
    this.setPayload(savedPayload);
    this.preloadedRecord = {
      payload: savedPayload,
      platform: platform || this.currentPlatform || this.getPlatform(),
      createdAt: Date.now()
    };

    if (this.preloadedRecord.platform) {
      this.currentPlatform = this.preloadedRecord.platform;
    }

    return {
      payload: extend({}, this.preloadedRecord.payload),
      platform: this.preloadedRecord.platform,
      createdAt: this.preloadedRecord.createdAt
    };
  };

  UnifiedRewardBridge.prototype.clearPreloadedPayload = function () {
    this.preloadedRecord = null;
  };

  UnifiedRewardBridge.prototype.hasFreshPreloadedPayload = function (maxAge) {
    var record = this.preloadedRecord;
    var finalMaxAge = Number(maxAge);

    if (!record || !record.payload) {
      return false;
    }

    if (!isPositiveNumber(finalMaxAge)) {
      finalMaxAge = this.options.preloadMaxAge;
    }

    if (!isPositiveNumber(finalMaxAge)) {
      return true;
    }

    return Date.now() - record.createdAt <= finalMaxAge;
  };

  UnifiedRewardBridge.prototype.consumePreloadedPayload = function (options) {
    var opts = options || {};
    var keep = !!opts.keep;
    var finalMaxAge = typeof opts.maxAge === 'undefined' ? undefined : Number(opts.maxAge);
    var payload;

    if (!this.hasFreshPreloadedPayload(finalMaxAge)) {
      this.clearPreloadedPayload();
      return null;
    }

    payload = extend({}, this.preloadedRecord.payload);
    this.setPayload(payload);
    if (this.preloadedRecord.platform) {
      this.currentPlatform = this.preloadedRecord.platform;
    }

    if (!keep) {
      this.clearPreloadedPayload();
    }

    return payload;
  };

  UnifiedRewardBridge.prototype.requestAd = function (options, callback) {
    var self = this;
    var cb = callback;
    var opts = options || {};
    var platform;
    var requestData;

    if (isFunction(options)) {
      cb = options;
      opts = {};
    }

    platform = this.getPlatform(opts.platform);
    this.currentPlatform = platform;
    requestData = this.resolveAdRequest(platform, opts);

    this.callHandler('adRequest', requestData, function (err, response, meta) {
      var body;
      var adItem;
      var payload;

      if (err) {
        if (isFunction(cb)) cb(wrapSdkError(err, 'REWARD_AD_REQUEST_CALL_FAILED', err.message, {
          requestData: requestData
        }));
        return;
      }
      if (meta && meta.timeout) {
        if (isFunction(cb)) cb(createSdkError('REWARD_AD_REQUEST_TIMEOUT', 'adRequest 回调超时', {
          requestData: requestData
        }));
        return;
      }

      body = unwrapResponse(response);
      self.log('adRequest body', body);

      if (!body || typeof body !== 'object') {
        if (isFunction(cb)) cb(createSdkError('REWARD_AD_REQUEST_BAD_BODY', 'adRequest 返回体为空或格式错误', {
          response: response
        }));
        return;
      }

      if (typeof body.code !== 'undefined' && Number(body.code) !== 0) {
        if (isFunction(cb)) cb(createSdkError('REWARD_AD_REQUEST_CODE_ERROR', 'adRequest code=' + body.code, {
          code: body.code,
          body: body
        }));
        return;
      }

      adItem = findRewardedAdItem(body);
      if (!adItem) {
        if (isFunction(cb)) cb(createSdkError('REWARD_AD_ITEM_NOT_FOUND', 'adRequest 未返回 sdk_rewarded_video 广告位', {
          body: body
        }));
        return;
      }

      try {
        payload = self.buildPayloadFromAd(platform, adItem, opts, requestData);
      } catch (buildErr) {
        if (isFunction(cb)) cb(wrapSdkError(buildErr, 'REWARD_PAYLOAD_BUILD_FAILED', buildErr.message, {
          body: body,
          adItem: adItem
        }));
        return;
      }

      self.setPayload(payload);
      if (isFunction(cb)) cb(null, payload, {
        platform: platform,
        adRequestResponse: response,
        adRequestBody: body,
        adRequestData: requestData
      });
    });
  };

  UnifiedRewardBridge.prototype.preload = function (payloadOrOptions, callback) {
    var self = this;
    var cb = callback;
    var payload = payloadOrOptions;

    if (isFunction(payloadOrOptions)) {
      cb = payloadOrOptions;
      payload = null;
    }

    if (!payload) {
      payload = this.currentPayload;
    }

    if (!payload) {
      if (isFunction(cb)) cb(createSdkError('REWARD_PAYLOAD_MISSING', '缺少可用 payload，请先 requestAd'));
      return;
    }

    this.setPayload(payload);
    this.callHandler('preLoadVideo', payload, function (err, response, meta) {
      if (err) {
        if (isFunction(cb)) cb(wrapSdkError(err, 'REWARD_PRELOAD_FAILED', err.message, {
          payload: payload
        }));
        return;
      }

      if (meta && meta.timeout && !self.options.preloadAllowTimeout) {
        if (isFunction(cb)) cb(createSdkError('REWARD_PRELOAD_TIMEOUT', 'preLoadVideo 回调超时', {
          payload: payload,
          timeoutMs: meta.timeoutMs
        }));
        return;
      }

      self.setPreloadedPayload(payload);
      if (isFunction(cb)) cb(null, response, extend({}, meta, {
        timeoutHandled: !!(meta && meta.timeout),
        timeoutAsSuccess: !!(meta && meta.timeout && self.options.preloadAllowTimeout)
      }));
    }, {
      timeout: self.options.preloadCallbackTimeout,
      allowTimeout: !!self.options.preloadAllowTimeout
    });
  };

  UnifiedRewardBridge.prototype.buildShowPayload = function (payload, options) {
    var platform = this.getPlatform(options && options.platform || this.currentPlatform);
    var sceneId = (options && options.sceneId) || this.options.sceneId;

    if (platform === 'ios') {
      return extend({}, payload, {
        id: payload.id || sceneId,
        relate_id: payload.relate_id || payload.id || sceneId
      });
    }

    return extend({
      id: sceneId,
      data: {}
    }, payload);
  };

  UnifiedRewardBridge.prototype.show = function (payloadOrOptions, callback) {
    var cb = callback;
    var payload = payloadOrOptions;

    if (isFunction(payloadOrOptions)) {
      cb = payloadOrOptions;
      payload = null;
    }

    if (!payload || (payload && !payload.sdk_id && !payload.sdkId)) {
      payload = this.currentPayload;
    }

    if (!payload) {
      if (isFunction(cb)) cb(createSdkError('REWARD_PAYLOAD_MISSING', '缺少可用 payload，请先 requestAd/preload'));
      return;
    }

    payload = this.buildShowPayload(payload, {});
    this.setPayload(payload);
    this.callHandler('connectVideo', payload, function (err, response, meta) {
      if (err) {
        if (isFunction(cb)) cb(wrapSdkError(err, 'REWARD_SHOW_FAILED', err.message, {
          payload: payload
        }));
        return;
      }

      if (meta && meta.timeout && !this.options.showAllowTimeoutAsSuccess) {
        if (isFunction(cb)) cb(createSdkError('REWARD_SHOW_TIMEOUT', 'connectVideo 回调超时', {
          payload: payload,
          timeoutMs: meta.timeoutMs
        }));
        return;
      }

      if (isFunction(cb)) cb(null, response, extend({}, meta, {
        timeoutHandled: !!(meta && meta.timeout),
        timeoutAsSuccess: !!(meta && meta.timeout && this.options.showAllowTimeoutAsSuccess)
      }));
    }.bind(this), {
      timeout: this.options.showCallbackTimeout,
      allowTimeout: !!this.options.showAllowTimeoutAsSuccess
    });
  };

  UnifiedRewardBridge.prototype.requestAndPreload = function (options, callback) {
    var self = this;
    var cb = callback;
    var opts = options || {};

    if (isFunction(options)) {
      cb = options;
      opts = {};
    }

    this.requestAd(opts, function (err, payload, detail) {
      if (err) {
        if (isFunction(cb)) cb(err);
        return;
      }

      self.preload(payload, function (preErr, preResp, preMeta) {
        if (preErr) {
          if (isFunction(cb)) cb(preErr);
          return;
        }

        self.setPreloadedPayload(payload, detail && detail.platform);
        if (isFunction(cb)) {
          cb(null, payload, {
            platform: detail.platform,
            adRequest: detail,
            preloadResponse: preResp,
            preloadMeta: preMeta
          });
        }
      });
    });
  };

  UnifiedRewardBridge.prototype.requestPreloadAndShow = function (options, callback) {
    var self = this;
    var cb = callback;
    var opts = options || {};

    if (isFunction(options)) {
      cb = options;
      opts = {};
    }

    this.requestAndPreload(opts, function (err, payload, detail) {
      if (err) {
        if (isFunction(cb)) cb(err);
        return;
      }

      self.show(payload, function (showErr, showResp, showMeta) {
        if (isFunction(cb)) {
          cb(showErr || null, {
            platform: detail.platform,
            payload: payload,
            adRequest: detail.adRequest,
            preloadResponse: detail.preloadResponse,
            preloadMeta: detail.preloadMeta,
            showResponse: showResp,
            showMeta: showMeta
          });
        }
      });
    });
  };

  UnifiedRewardBridge.prototype.showWithPreloadedOrRequest = function (options, callback) {
    var self = this;
    var cb = callback;
    var opts = options || {};
    var cachedPayload;

    if (isFunction(options)) {
      cb = options;
      opts = {};
    }

    cachedPayload = this.consumePreloadedPayload({
      maxAge: opts.maxAge,
      keep: !!opts.keepPreloaded
    });

    if (cachedPayload) {
      this.show(cachedPayload, function (showErr, showResp, showMeta) {
        if (isFunction(cb)) {
          cb(showErr || null, {
            fromCache: true,
            payload: cachedPayload,
            showResponse: showResp,
            showMeta: showMeta
          });
        }
      });
      return;
    }

    this.requestAndPreload(opts, function (err, payload, detail) {
      if (err) {
        if (isFunction(cb)) cb(err);
        return;
      }

      self.show(payload, function (showErr, showResp, showMeta) {
        if (isFunction(cb)) {
          cb(showErr || null, {
            fromCache: false,
            platform: detail.platform,
            payload: payload,
            adRequest: detail.adRequest,
            preloadResponse: detail.preloadResponse,
            preloadMeta: detail.preloadMeta,
            showResponse: showResp,
            showMeta: showMeta
          });
        }
      });
    });
  };

  UnifiedRewardBridge.prototype.onDisconnectVideo = function (listener, callback) {
    var self = this;

    if (isFunction(listener)) {
      this._disconnectListeners.push(listener);
    }

    if (this._disconnectRegistered) {
      if (isFunction(callback)) callback(null);
      return;
    }

    this.getBridge(function (error, bridge) {
      if (error) {
        if (isFunction(callback)) callback(error);
        return;
      }

      if (!bridge.registerHandler) {
        if (isFunction(callback)) {
          callback(createSdkError('REWARD_DISCONNECT_HANDLER_UNSUPPORTED', 'bridge 不支持 registerHandler，无法监听 disConnectVideo'));
        }
        return;
      }

      bridge.registerHandler('disConnectVideo', function (cbData, responseCallback) {
        var i;
        self.log('receive disConnectVideo', cbData);

        for (i = 0; i < self._disconnectListeners.length; i += 1) {
          try {
            self._disconnectListeners[i](cbData || {});
          } catch (listenerError) {
            self.log('disConnectVideo listener error', { message: listenerError.message });
          }
        }

        if (isFunction(responseCallback)) {
          responseCallback({ ok: true });
        }
      });

      self._disconnectRegistered = true;
      if (isFunction(callback)) callback(null);
    });
  };

  root.UnifiedRewardSDK = {
    create: function (options) {
      var runtimeConfig = normalizeConfig(root.__UNIFIED_REWARD_CONFIG || EMBEDDED_CONFIG);
      var runtimeDefaults = buildDefaultsFromConfig(runtimeConfig);
      return new UnifiedRewardBridge(options, runtimeDefaults);
    },
    Constructor: UnifiedRewardBridge,
    utils: {
      detectPlatformByUA: detectPlatformByUA,
      normalizeOrigin: normalizeOrigin,
      createSdkError: createSdkError,
      getEmbeddedConfig: function () {
        return clone(EMBEDDED_CONFIG);
      }
    }
  };
})(window);

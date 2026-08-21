/**
 * SGEN Dashboard — Support Ticket Embed Widget
 * Auto-generated. Do not edit directly.
 * Built: 2026-03-24T10:27:18.604Z
 */

// ─── STATE.JS ─────────────────────────────────────
/**
 * ticket_support_embed — Lightweight State Manager
 * Simple pub/sub state store (replaces Zustand for vanilla JS).
 */
var TicketSupportState = (function () {
  'use strict';

  // Schema-versioned key — bump to invalidate prior draft shape (v2: wizard reorder + URL list + dates)
  var STORAGE_KEY = '__ts_widget_state_v2';

  // Keys that should persist across page navigations
  var PERSIST_KEYS = [
    'view', 'widgetOpen',
    'userName', 'userEmail',
    'draftTicketId', 'draftWorkType', 'draftProduct', 'draftDepartment', 'draftTaskType',
    'draftSubject', 'draftCategory', 'draftPriority',
    'draftDescription', 'draftRelatedUrls',
    'draftStartDate', 'draftEndDate',
    'draftRecurring', 'draftRecurFrequency', 'draftRecurInterval',
    'draftRecurWeekday', 'draftRecurMonthDay', 'draftRecurTime',
    'draftWizardStep', 'draftClientConfirmed', 'draftClient', 'draftClientName', 'draftClientCompanyId', 'draftRequestType',
    'draftLocation', 'draftLocationName',
    'pendingRecordings',
    'isRecordingDrawerOpen', 'recordingDrawerMode',
    'recordingDrawerContext', 'recordingDrawerMinimized',
    'recordingExpanded',
    'recordingMode',
  ];

  var _state = {
    // View state
    view: 'create',      // 'create' | 'detail'
    widgetOpen: false,
    loading: false,
    error: null,

    // Position (set from data-position attribute)
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'middle-right' | 'middle-left'
    offsetX: 0,
    offsetY: 0,

    // User identity (set from config)
    userName: '',
    userEmail: '',

    // Ticket list
    tickets: [],
    ticketsTotal: 0,
    ticketsPage: 1,
    ticketsPageSize: 20,
    ticketsTotalPages: 0,
    ticketsStatusFilter: 'all',

    // Active ticket detail
    activeTicket: null,

    // Create form drafts
    draftTicketId: _generateUUID(),
    draftWorkType: '',
    draftProduct: '',
    draftDepartment: '',
    draftTaskType: '',
    draftSubject: '',
    draftCategory: '',
    draftPriority: 'normal',
    draftDescription: '',
    draftRelatedUrls: [],   // string[] — multi-URL list
    draftStartDate: '',     // YYYY-MM-DD (optional)
    draftEndDate: '',       // YYYY-MM-DD (optional)
    // Recurring schedule (optional) — when draftRecurring is true the backend
    // creates a RecurringTask instead of a one-off ticket.
    draftRecurring: false,
    draftRecurFrequency: 'weekly', // 'daily' | 'weekly' | 'monthly'
    draftRecurInterval: '1',       // every N units
    draftRecurWeekday: '1',        // 0-6 (Sun-Sat) — weekly only
    draftRecurMonthDay: '1',       // 1-31 — monthly only
    draftRecurTime: '09:00',       // HH:mm UTC
    draftWizardStep: 1,   // 1=WorkType 2=Client 3=Details 4=Describe 5=Evidence/Recording
    draftClientConfirmed: null, // null | true | false
    draftClient: '',
    draftClientName: '',
    draftClientCompanyId: '',
    draftLocation: '',
    draftLocationName: '',
    draftRequestType: '',

    // Pending uploads
    pendingAttachments: [],
    pendingRecordings: [],

    // Recording
    isRecording: false,
    recordingType: null,   // 'screen_audio' | 'audio_only'
    recordingSeconds: 0,
    recordingMode: null,   // 'popup' | 'inpage' — which recorder owns the stream

    // Recording drawer (floating panel)
    isRecordingDrawerOpen: false,
    recordingDrawerMode: null,    // 'screen' | 'audio'
    recordingDrawerContext: null, // 'create' | 'reply'
    recordingDrawerMinimized: false,
    recordingExpanded: false,
    recordingUploading: false,
    recordingUploadProgress: 0,

    // Reply form
    replyBody: '',
    replyAttachments: [],
    replyRecordings: [],
  };

  var _listeners = [];

  // ─── Persistence helpers ──────────────────────────

  function _saveToSession() {
    try {
      var data = {};
      for (var i = 0; i < PERSIST_KEYS.length; i++) {
        var k = PERSIST_KEYS[i];
        data[k] = _state[k];
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  function _loadFromSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      for (var k in data) {
        if (data.hasOwnProperty(k) && _state.hasOwnProperty(k)) {
          _state[k] = data[k];
        }
      }
    } catch (e) { /* parse error or storage unavailable, ignore */ }
  }

  // Restore on load
  _loadFromSession();

  function _generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function get(key) {
    if (key) return _state[key];
    return Object.assign({}, _state);
  }

  function set(updates) {
    var changed = false;
    for (var k in updates) {
      if (updates.hasOwnProperty(k) && _state[k] !== updates[k]) {
        _state[k] = updates[k];
        changed = true;
      }
    }
    if (changed) {
      _saveToSession();
      _notify();
    }
  }

  /** Update state WITHOUT triggering re-render (for form inputs during typing). */
  function setSilent(updates) {
    for (var k in updates) {
      if (updates.hasOwnProperty(k)) {
        _state[k] = updates[k];
      }
    }
    _saveToSession();
  }

  function subscribe(fn) {
    _listeners.push(fn);
    return function unsubscribe() {
      _listeners = _listeners.filter(function (l) { return l !== fn; });
    };
  }

  function _notify() {
    var snapshot = Object.assign({}, _state);
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](snapshot); } catch (e) { console.error('[TicketSupport] listener error', e); }
    }
  }

  function resetCreateForm() {
    set({
      draftTicketId: _generateUUID(),
      draftWorkType: '',
      draftProduct: '',
      draftDepartment: '',
      draftTaskType: '',
      draftSubject: '',
      draftCategory: '',
      draftPriority: 'normal',
      draftDescription: '',
      draftRelatedUrls: [],
      draftStartDate: '',
      draftEndDate: '',
      draftRecurring: false,
      draftRecurFrequency: 'weekly',
      draftRecurInterval: '1',
      draftRecurWeekday: '1',
      draftRecurMonthDay: '1',
      draftRecurTime: '09:00',
      draftWizardStep: 1,
      draftClientConfirmed: null,
      draftClient: '',
      draftClientName: '',
      draftClientCompanyId: '',
      draftRequestType: '',
      draftLocation: '',
      draftLocationName: '',
      pendingAttachments: [],
      pendingRecordings: [],
      error: null,
      isRecordingDrawerOpen: false,
      recordingDrawerMode: null,
      recordingDrawerContext: null,
      recordingDrawerMinimized: false,
      recordingExpanded: false,
      recordingUploading: false,
      recordingUploadProgress: 0,
      recordingMode: null,
    });
  }

  function resetReplyForm() {
    set({
      replyBody: '',
      replyAttachments: [],
      replyRecordings: [],
    });
  }

  return {
    get: get,
    set: set,
    setSilent: setSilent,
    subscribe: subscribe,
    resetCreateForm: resetCreateForm,
    resetReplyForm: resetReplyForm,
    generateUUID: _generateUUID,
  };
})();


// ─── API.JS ─────────────────────────────────────
/**
 * ticket_support_embed — API Client
 * Communicates with /api/support/external/* endpoints.
 *
 * Auth model:
 *   - On boot the widget exchanges its embedded site key for a short-lived
 *     widget session via POST /widget/session. The server returns an httpOnly
 *     Set-Cookie (third-party with Partitioned/CHIPS) AND, because we always
 *     opt into the bearer fallback, the same token in the JSON body so we can
 *     also send it as `Authorization: Bearer ...` for browsers that block
 *     third-party cookies (Safari ITP, Firefox total cookie protection).
 *   - Mutating requests carry a per-request X-Nonce + X-Ts pair so the server
 *     can reject replays via Redis SETNX.
 *   - Sessions silently re-mint on 401, then the original request retries once.
 */
var TicketSupportAPI = (function () {
  'use strict';

  var _apiUrl = '';
  var _siteKey = '';

  // Session state — populated by _ensureSession()
  var _sessionToken = '';        // bearer fallback (also stored as cookie)
  var _sessionExpiresAt = 0;     // unix seconds
  var _sessionDraftTicketId = '';
  var _sessionTtlSec = 900;
  var _sessionPromise = null;    // in-flight mint
  var _onSessionReady = [];

  // Refresh the session a minute before it expires so an in-flight submission
  // never trips the 401 retry path.
  var REFRESH_LEAD_SEC = 60;

  function init(apiUrl, siteKey) {
    _apiUrl = (apiUrl || '').replace(/\/+$/, '');
    _siteKey = siteKey || '';
  }

  // Hint the next session mint to reuse a draftTicketId already present in
  // persisted state — keeps any in-flight GCS uploads addressable after a
  // page refresh.
  var _preferredDraftTicketId = '';
  function preferDraftTicketId(id) {
    if (typeof id === 'string' && id) _preferredDraftTicketId = id;
  }

  function _nowSec() { return Math.floor(Date.now() / 1000); }

  function _randomNonce() {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint8Array(24);
      window.crypto.getRandomValues(buf);
      var s = '';
      for (var i = 0; i < buf.length; i++) {
        s += ('0' + buf[i].toString(16)).slice(-2);
      }
      return s;
    }
    return Date.now().toString(16) + Math.random().toString(16).slice(2);
  }

  function _sessionStillValid() {
    // A session is only usable if it carries a non-empty bearer token. An
    // unexpired-but-tokenless session (e.g. a background refresh/invalidate
    // race) must NOT short-circuit ensureSession, or the recorder popup gets
    // launched without a token fragment and trips "Missing required recorder
    // parameters".
    if (!_sessionToken) return false;
    return _sessionExpiresAt - _nowSec() > 5;
  }

  function _flushReady() {
    var subs = _onSessionReady;
    _onSessionReady = [];
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](_sessionDraftTicketId); } catch (e) {}
    }
  }

  function _mintSession() {
    if (!_siteKey) return Promise.reject(new Error('Missing widget site key'));
    var url = _apiUrl + '/api/support/external/widget/session';
    var body = { siteKey: _siteKey };
    if (_preferredDraftTicketId) body.draftTicketId = _preferredDraftTicketId;
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Cookie-Fallback': '1' },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || !data || !data.success) {
          var err = new Error((data && data.error) || 'Failed to start widget session');
          err.status = res.status;
          throw err;
        }
        _sessionToken = data.token || '';
        _sessionExpiresAt = data.expiresAt || (_nowSec() + (data.ttlSec || 900));
        _sessionDraftTicketId = data.draftTicketId || '';
        _sessionTtlSec = data.ttlSec || 900;
        _flushReady();
        _scheduleRefresh();
        return data;
      });
    });
  }

  function _ensureSession() {
    if (_sessionStillValid()) return Promise.resolve({
      token: _sessionToken,
      expiresAt: _sessionExpiresAt,
      draftTicketId: _sessionDraftTicketId,
    });
    if (_sessionPromise) return _sessionPromise;
    _sessionPromise = _mintSession().then(function (v) {
      _sessionPromise = null;
      return v;
    }).catch(function (err) {
      _sessionPromise = null;
      throw err;
    });
    return _sessionPromise;
  }

  var _refreshTimer = null;
  function _scheduleRefresh() {
    if (_refreshTimer) { clearTimeout(_refreshTimer); _refreshTimer = null; }
    var leadMs = Math.max(15, _sessionTtlSec - REFRESH_LEAD_SEC) * 1000;
    _refreshTimer = setTimeout(function () {
      _refreshTimer = null;
      _mintSession().catch(function () {/* next call will retry */});
    }, leadMs);
  }

  function onSessionReady(fn) {
    if (_sessionDraftTicketId) {
      try { fn(_sessionDraftTicketId); } catch (e) {}
    } else {
      _onSessionReady.push(fn);
    }
  }

  function getDraftTicketId() { return _sessionDraftTicketId; }
  function getSessionToken() { return _sessionToken; }

  // Drop the current session so the next request mints a fresh one with a
  // brand-new draft ticket id. Called after a successful submission so any
  // pendingAttachments left over from one ticket do not bleed into the next.
  function invalidateSession() {
    _sessionToken = '';
    _sessionExpiresAt = 0;
    _sessionDraftTicketId = '';
    _preferredDraftTicketId = '';
    if (_refreshTimer) { clearTimeout(_refreshTimer); _refreshTimer = null; }
  }

  function _authHeaders(extra) {
    var h = { 'Content-Type': 'application/json' };
    if (_sessionToken) h.Authorization = 'Bearer ' + _sessionToken;
    if (extra) {
      for (var k in extra) { h[k] = extra[k]; }
    }
    return h;
  }

  function _doFetch(method, path, body, opts) {
    opts = opts || {};
    var url = _apiUrl + '/api/support/external' + (path || '');
    var headers = _authHeaders(opts.headers || {});
    var init = {
      method: method,
      credentials: 'include',
      headers: headers,
    };
    if (body !== undefined && body !== null) {
      init.body = JSON.stringify(body);
    }
    return fetch(url, init).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || 'Request failed');
          err.status = res.status;
          err.code = data && data.code;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  /**
   * Wrap mutating + authenticated requests so they auto-retry once after
   * silently re-minting the session when the server returns 401.
   */
  function _request(method, path, body, opts) {
    opts = opts || {};
    var requireSession = opts.requireSession !== false;
    var attempt = function (mintFirst) {
      var pre = mintFirst ? _ensureSession() : Promise.resolve();
      return pre.then(function () {
        return _doFetch(method, path, body, opts);
      });
    };
    var retryOn401 = function (err) {
      // Retry only when we actually have a site key — without one, we
      // cannot mint a fresh session, so 401 is terminal.
      if (!_siteKey) throw err;
      if (!err || (err.status !== 401 && err.code !== 'session_expired')) throw err;
      _sessionToken = '';
      _sessionExpiresAt = 0;
      return _ensureSession().then(function () {
        return _doFetch(method, path, body, opts);
      });
    };
    if (!requireSession) return attempt(false).catch(retryOn401);
    return attempt(true).catch(retryOn401);
  }

  // ─── Tickets ─────────────────────────────────────────────
  function createTicket(payload) {
    var nonce = _randomNonce();
    var ts = String(Date.now());
    var safePayload = Object.assign({}, payload || {});
    safePayload.draftTicketId = _sessionDraftTicketId || safePayload.draftTicketId;
    delete safePayload.token;
    return _request('POST', '', safePayload, {
      headers: { 'X-Nonce': nonce, 'X-Ts': ts },
    });
  }

  function listTickets(email, opts) {
    opts = opts || {};
    var qs = '?email=' + encodeURIComponent(email);
    if (opts.status && opts.status !== 'all') qs += '&status=' + opts.status;
    if (opts.page) qs += '&page=' + opts.page;
    if (opts.pageSize) qs += '&pageSize=' + opts.pageSize;
    return _request('GET', qs, null, { requireSession: false });
  }

  function getTicket(id, email) {
    var qs = email ? '?email=' + encodeURIComponent(email) : '';
    return _request('GET', '/' + id + qs, null, { requireSession: false });
  }

  function updateTicketStatus(id, status, email) {
    return _request('PATCH', '/' + id, { status: status, email: email }, { requireSession: false });
  }

  // ─── Messages ────────────────────────────────────────────
  function createMessage(ticketId, payload) {
    return _request('POST', '/' + ticketId + '/messages', payload, { requireSession: false });
  }

  // ─── Upload URL ──────────────────────────────────────────
  // The session pins the draftTicketId server-side. We pass it for clarity but
  // the server ignores any value other than the session's.
  function getUploadUrl(draftTicketId, fileName, contentType) {
    return _request('POST', '/upload-url', {
      draftTicketId: draftTicketId || _sessionDraftTicketId,
      fileName: fileName,
      contentType: contentType,
    });
  }

  function listBusinesses(search) {
    var qs = '';
    if (search) qs = '?search=' + encodeURIComponent(search);
    return _request('GET', '/list-websites' + qs);
  }

  function listLocations(companyId, search) {
    var qs = '?company_id=' + encodeURIComponent(companyId);
    if (search) qs += '&search=' + encodeURIComponent(search);
    return _request('GET', '/list-locations' + qs);
  }

  return {
    init: init,
    preferDraftTicketId: preferDraftTicketId,
    invalidateSession: invalidateSession,
    ensureSession: _ensureSession,
    onSessionReady: onSessionReady,
    getDraftTicketId: getDraftTicketId,
    getSessionToken: getSessionToken,
    createTicket: createTicket,
    listTickets: listTickets,
    getTicket: getTicket,
    updateTicketStatus: updateTicketStatus,
    createMessage: createMessage,
    getUploadUrl: getUploadUrl,
    listBusinesses: listBusinesses,
    listLocations: listLocations,
  };
})();


// ─── UPLOADER.JS ─────────────────────────────────────
/**
 * ticket_support_embed — File Uploader
 * Handles signed-URL uploads for attachments and recordings.
 */
var TicketSupportUploader = (function () {
  'use strict';

  var ALLOWED_FILE_TYPES = [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
  ];

  var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  /**
   * Upload a single file via signed URL.
   * @param {File} file
   * @param {string} draftTicketId
   * @param {function} onProgress - optional (percent 0-100)
   * @returns {Promise<{gcsPath, fileName, mimeType, fileSize}>}
   */
  function uploadFile(file, draftTicketId, onProgress) {
    if (ALLOWED_FILE_TYPES.indexOf(file.type) === -1) {
      return Promise.reject(new Error('File type "' + file.type + '" is not allowed.'));
    }
    if (file.size > MAX_FILE_SIZE) {
      return Promise.reject(new Error('File exceeds 10 MB limit.'));
    }

    return TicketSupportAPI.getUploadUrl(draftTicketId, file.name, file.type).then(function (res) {
      return _putToGCS(res.uploadUrl, file, file.type, onProgress).then(function () {
        return {
          gcsPath: res.gcsPath,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        };
      });
    });
  }

  /**
   * Upload a recording blob via signed URL.
   * @param {Blob} blob
   * @param {string} draftTicketId
   * @param {string} type - 'screen_audio' | 'audio_only'
   * @param {number} durationSeconds
   * @param {function} onProgress
   * @returns {Promise<RecordingMeta>}
   */
  function uploadRecording(blob, draftTicketId, type, durationSeconds, onProgress) {
    var mimeType = blob.type || 'video/webm';
    var ext = mimeType.indexOf('audio') >= 0 ? 'webm' : 'webm';
    var fileName = type + '_' + Date.now() + '.' + ext;

    return TicketSupportAPI.getUploadUrl(draftTicketId, fileName, mimeType).then(function (res) {
      return _putToGCS(res.uploadUrl, blob, mimeType, onProgress).then(function () {
        return {
          type: type,
          gcsPath: res.gcsPath,
          fileName: fileName,
          mimeType: mimeType,
          fileSize: blob.size,
          durationSeconds: durationSeconds,
        };
      });
    });
  }

  /**
   * PUT file/blob directly to GCS signed URL with progress tracking.
   */
  function _putToGCS(uploadUrl, body, contentType, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', contentType);

      if (onProgress) {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('Upload failed with status ' + xhr.status));
        }
      };

      xhr.onerror = function () {
        reject(new Error('Upload network error'));
      };

      xhr.send(body);
    });
  }

  /**
   * Upload mouse tracking data as a JSON sidecar file.
   * @param {object} trackData - { viewportWidth, viewportHeight, samples: [{x,y,t}] }
   * @param {string} draftTicketId
   * @returns {Promise<string>} - returns the gcsPath of the uploaded file
   */
  function uploadMouseTrack(trackData, draftTicketId) {
    var blob = new Blob([JSON.stringify(trackData)], { type: 'application/json' });
    var fileName = 'mousetrack-' + Date.now() + '.json';

    return TicketSupportAPI.getUploadUrl(draftTicketId, fileName, 'application/json').then(function (res) {
      return _putToGCS(res.uploadUrl, blob, 'application/json', null).then(function () {
        return res.gcsPath;
      });
    });
  }

  return {
    uploadFile: uploadFile,
    uploadRecording: uploadRecording,
    uploadMouseTrack: uploadMouseTrack,
    ALLOWED_FILE_TYPES: ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE: MAX_FILE_SIZE,
  };
})();


// ─── RECORDER.JS ─────────────────────────────────────
/**
 * ticket_support_embed — Media Recorder
 * Screen+Audio and Audio-Only recording using MediaRecorder API.
 * Mirrors src/components/support/audio-recorder.tsx and screen-recorder.tsx.
 */
var TicketSupportRecorder = (function () {
  'use strict';

  var MAX_DURATION = 900; // 15 minutes — keep in sync with recorder.js

  var _mediaRecorder = null;
  var _chunks = [];
  var _stream = null;
  var _timerInterval = null;
  var _seconds = 0;
  var _analyserNode = null;
  var _audioContext = null;
  var _animFrameId = null;

  // Mouse tracking for spotlight
  var _mouseSamples = [];
  var _recordingStartTime = 0;
  var _spotlightOverlay = null;
  var _spotlightActive = false;
  var _mouseMoveHandler = null;
  var _mouseRafId = null;
  var _lastSampleTime = 0;

  // Callbacks
  var _onTick = null;      // (seconds) => void
  var _onComplete = null;  // (blob, durationSeconds, type, mouseSamples?) => void
  var _onError = null;     // (error) => void

  function isSupported() {
    return typeof MediaRecorder !== 'undefined';
  }

  function _getMimeType(preferVideo) {
    var candidates = preferVideo
      ? ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported(candidates[i])) {
        return candidates[i];
      }
    }
    return preferVideo ? 'video/webm' : 'audio/webm';
  }

  /**
   * Start an audio-only recording.
   * @param {object} opts - { onTick, onComplete, onError, canvasEl }
   */
  function startAudio(opts) {
    _onTick = opts.onTick || null;
    _onComplete = opts.onComplete || null;
    _onError = opts.onError || null;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      _stream = stream;
      var mimeType = _getMimeType(false);
      _mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
      _chunks = [];
      _seconds = 0;

      _mediaRecorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) _chunks.push(e.data);
      };

      _mediaRecorder.onstop = function () {
        var blob = new Blob(_chunks, { type: mimeType.split(';')[0] });
        _cleanup();
        if (_onComplete) _onComplete(blob, _seconds, 'audio_only');
      };

      _mediaRecorder.onerror = function (e) {
        _cleanup();
        if (_onError) _onError(e.error || new Error('Recording error'));
      };

      _mediaRecorder.start(1000);
      _startTimer();
      TicketSupportState.set({ isRecording: true, recordingType: 'audio_only', recordingSeconds: 0 });

      // Waveform visualization
      if (opts.canvasEl) {
        _startWaveform(stream, opts.canvasEl);
      }
    }).catch(function (err) {
      if (_onError) _onError(err);
    });
  }

  /**
   * Start a screen + audio recording.
   * @param {object} opts - { onTick, onComplete, onError, previewEl, spotlightEnabled }
   */
  function startScreenAudio(opts) {
    _onTick = opts.onTick || null;
    _onComplete = opts.onComplete || null;
    _onError = opts.onError || null;
    var wantSpotlight = opts.spotlightEnabled || false;

    var screenPromise = navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    var micPromise = navigator.mediaDevices.getUserMedia({ audio: true }).catch(function () { return null; });

    Promise.all([screenPromise, micPromise]).then(function (streams) {
      var screenStream = streams[0];
      var micStream = streams[1];

      var tracks = screenStream.getTracks().slice();
      if (micStream) {
        micStream.getAudioTracks().forEach(function (t) { tracks.push(t); });
      }

      _stream = new MediaStream(tracks);
      var mimeType = _getMimeType(true);
      _mediaRecorder = new MediaRecorder(_stream, { mimeType: mimeType });
      _chunks = [];
      _seconds = 0;

      // Check if tab capture for spotlight
      var videoTrack = screenStream.getVideoTracks()[0];
      var settings = videoTrack ? videoTrack.getSettings() : {};
      var isTabCapture = settings.displaySurface === 'browser';
      var shouldSpotlight = wantSpotlight && isTabCapture;

      // Initialize mouse tracking
      _mouseSamples = [];
      _recordingStartTime = Date.now();
      _spotlightActive = shouldSpotlight;

      if (shouldSpotlight) {
        _createSpotlightOverlay();
      }

      _mediaRecorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) _chunks.push(e.data);
      };

      _mediaRecorder.onstop = function () {
        var blob = new Blob(_chunks, { type: mimeType.split(';')[0] });
        var samples = _mouseSamples.slice();
        var hadSpotlight = _spotlightActive;
        _cleanup();
        if (_onComplete) _onComplete(blob, _seconds, 'screen_audio', hadSpotlight ? samples : null);
      };

      _mediaRecorder.onerror = function (e) {
        _cleanup();
        if (_onError) _onError(e.error || new Error('Recording error'));
      };

      // Auto-stop when user ends screen sharing
      if (videoTrack) {
        videoTrack.onended = function () { stop(); };
      }

      _mediaRecorder.start(1000);
      _startTimer();
      TicketSupportState.set({ isRecording: true, recordingType: 'screen_audio', recordingSeconds: 0 });

      // Preview
      if (opts.previewEl && opts.previewEl.tagName === 'VIDEO') {
        opts.previewEl.srcObject = screenStream;
        opts.previewEl.play().catch(function () {});
      }
    }).catch(function (err) {
      if (_onError) _onError(err);
    });
  }

  function stop() {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
      _mediaRecorder.stop();
    }
  }

  function cancel() {
    _chunks = [];
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
      _mediaRecorder.onstop = function () { _cleanup(); };
      _mediaRecorder.stop();
    } else {
      _cleanup();
    }
  }

  function _startTimer() {
    _timerInterval = setInterval(function () {
      _seconds++;
      TicketSupportState.set({ recordingSeconds: _seconds });
      if (_onTick) _onTick(_seconds);
      if (_seconds >= MAX_DURATION) {
        stop();
      }
    }, 1000);
  }

  function _cleanup() {
    clearInterval(_timerInterval);
    _timerInterval = null;
    cancelAnimationFrame(_animFrameId);
    _animFrameId = null;

    // Remove spotlight overlay
    _removeSpotlightOverlay();

    if (_stream) {
      _stream.getTracks().forEach(function (t) { t.stop(); });
      _stream = null;
    }
    if (_audioContext) {
      _audioContext.close().catch(function () {});
      _audioContext = null;
    }
    _analyserNode = null;
    _mediaRecorder = null;
    _chunks = [];
    _mouseSamples = [];
    _spotlightActive = false;
    TicketSupportState.set({ isRecording: false, recordingType: null, recordingSeconds: 0 });
  }

  function _createSpotlightOverlay() {
    if (_spotlightOverlay) return;
    _spotlightOverlay = document.createElement('div');
    _spotlightOverlay.style.cssText =
      'position:fixed;inset:0;z-index:99998;pointer-events:none;' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'mask-image:radial-gradient(circle 200px at -9999px -9999px, transparent 0%, transparent 40%, black 100%);' +
      '-webkit-mask-image:radial-gradient(circle 200px at -9999px -9999px, transparent 0%, transparent 40%, black 100%);' +
      'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;';
    document.body.appendChild(_spotlightOverlay);

    var curX = -9999, curY = -9999;
    _lastSampleTime = 0;

    _mouseMoveHandler = function (e) {
      curX = e.clientX;
      curY = e.clientY;
      // Sample at ~30fps
      var now = performance.now();
      if (now - _lastSampleTime >= 33) {
        _lastSampleTime = now;
        _mouseSamples.push({ x: curX, y: curY, t: Date.now() - _recordingStartTime });
      }
    };
    document.addEventListener('mousemove', _mouseMoveHandler, { passive: true });

    function spotlightLoop() {
      if (_spotlightOverlay) {
        var grad = 'radial-gradient(circle 200px at ' + curX + 'px ' + curY + 'px, transparent 0%, transparent 40%, black 100%)';
        _spotlightOverlay.style.maskImage = grad;
        _spotlightOverlay.style.webkitMaskImage = grad;
      }
      _mouseRafId = requestAnimationFrame(spotlightLoop);
    }
    _mouseRafId = requestAnimationFrame(spotlightLoop);
  }

  function _removeSpotlightOverlay() {
    if (_mouseMoveHandler) {
      document.removeEventListener('mousemove', _mouseMoveHandler);
      _mouseMoveHandler = null;
    }
    if (_mouseRafId) {
      cancelAnimationFrame(_mouseRafId);
      _mouseRafId = null;
    }
    if (_spotlightOverlay && _spotlightOverlay.parentNode) {
      _spotlightOverlay.parentNode.removeChild(_spotlightOverlay);
    }
    _spotlightOverlay = null;
  }

  function _startWaveform(stream, canvas) {
    try {
      _audioContext = new (window.AudioContext || window.webkitAudioContext)();
      var source = _audioContext.createMediaStreamSource(stream);
      _analyserNode = _audioContext.createAnalyser();
      _analyserNode.fftSize = 256;
      source.connect(_analyserNode);

      var bufferLength = _analyserNode.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      var ctx = canvas.getContext('2d');

      function draw() {
        _animFrameId = requestAnimationFrame(draw);
        _analyserNode.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();

        var sliceWidth = canvas.width / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
          var v = dataArray[i] / 128.0;
          var y = v * canvas.height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
      draw();
    } catch (e) {
      console.warn('[TicketSupport] Waveform not available:', e);
    }
  }

  function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  return {
    isSupported: isSupported,
    startAudio: startAudio,
    startScreenAudio: startScreenAudio,
    stop: stop,
    cancel: cancel,
    formatTime: formatTime,
    MAX_DURATION: MAX_DURATION,
  };
})();


// ─── POPUP_RECORDER.JS ─────────────────────────────
/**
 * ticket_support_embed — Popup Recorder Proxy
 *
 * Opens a popup window on the dashboard origin that owns the MediaStream and
 * MediaRecorder. The popup survives host-page refreshes, so the capture keeps
 * running even if the user reloads the page that embeds the widget.
 *
 * The widget and popup communicate via postMessage. Completed recordings are
 * uploaded from the popup directly to GCS and then delivered back to the
 * widget as metadata (pushed into `pendingRecordings` / `replyRecordings`).
 *
 * Falls back to the in-page recorder when popups are blocked or on devices
 * where popup UX is poor (mobile Safari/Chrome open popups as full tabs).
 */
var TicketSupportPopupRecorder = (function () {
  'use strict';

  var POPUP_NAME = 'ts-recorder-popup';
  // Opened big enough to house the browser's native "Choose what to share"
  // picker comfortably. The popup shrinks itself to a corner badge after the
  // user grants the permission (see recorder.js#minimizeSelf).
  var POPUP_W = 760;
  var POPUP_H = 620;

  var _apiUrl = '';
  var _popup = null;
  var _popupOrigin = '*';
  var _active = false;
  var _handlers = {};
  var _onMessage = null;

  function _isMobile() {
    var ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod|Android.*Mobile/i.test(ua) ||
      (window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
  }

  function isSupported() {
    if (_isMobile()) return false;
    if (typeof window.postMessage !== 'function') return false;
    return true;
  }

  function _computeTargetOrigin() {
    try { return new URL(_apiUrl).origin; } catch (e) { return '*'; }
  }

  function _buildUrl(opts) {
    var qs = [];
    function add(k, v) { qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); }
    // Prefer the live, freshly-minted session draft id so the popup param
    // matches the dt the bearer is pinned to. Fall back to the captured opts
    // value only if the session has not surfaced one yet.
    var liveDraftId = (typeof TicketSupportAPI !== 'undefined' && TicketSupportAPI.getDraftTicketId)
      ? TicketSupportAPI.getDraftTicketId()
      : '';
    add('apiUrl', _apiUrl);
    add('draftTicketId', liveDraftId || opts.draftTicketId);
    add('type', opts.recordingType);
    add('spotlight', opts.spotlight ? '1' : '0');
    add('context', opts.context || 'create');
    add('origin', window.location.origin);
    // The session bearer goes in the URL fragment so it is not logged in
    // server access logs or sent as Referer. The popup reads it from
    // location.hash and uses it as `Authorization: Bearer ...`.
    var token = (typeof TicketSupportAPI !== 'undefined' && TicketSupportAPI.getSessionToken)
      ? TicketSupportAPI.getSessionToken()
      : '';
    var hash = token ? '#token=' + encodeURIComponent(token) : '';
    // v=2 busts any cached older recorder.html/recorder.js that read the
    // bearer from the query string only. Bump on future breaking changes.
    return _apiUrl.replace(/\/$/, '') + '/ticket_support_embed/recorder.html?v=2&' + qs.join('&') + hash;
  }

  function _dispatch(msg) {
    if (!msg || typeof msg !== 'object' || !msg.type) return;
    switch (msg.type) {
      case 'popup-ready':
        if (_handlers.onReady) _handlers.onReady(msg);
        break;
      case 'started':
        _active = true;
        if (_handlers.onStarted) _handlers.onStarted(msg);
        break;
      case 'tick':
        if (_handlers.onTick) _handlers.onTick(msg.seconds);
        break;
      case 'stopping':
        if (_handlers.onStopping) _handlers.onStopping();
        break;
      case 'upload-started':
        if (_handlers.onUploadStarted) _handlers.onUploadStarted();
        break;
      case 'upload-progress':
        if (_handlers.onUploadProgress) _handlers.onUploadProgress(msg.percent);
        break;
      case 'recording-complete':
        if (_handlers.onComplete) _handlers.onComplete(msg.meta);
        break;
      case 'error':
        _active = false;
        if (_handlers.onError) _handlers.onError(msg.message);
        break;
      case 'cancelled':
        _active = false;
        if (_handlers.onCancelled) _handlers.onCancelled();
        break;
      case 'abandoned':
        _active = false;
        if (_handlers.onAbandoned) _handlers.onAbandoned();
        break;
      case 'paused':
        if (_handlers.onPaused) _handlers.onPaused(msg);
        break;
      case 'resumed':
        if (_handlers.onResumed) _handlers.onResumed(msg);
        break;
      case 'status':
        if (_handlers.onStatus) _handlers.onStatus(msg);
        break;
    }
  }

  function init(apiUrl, _siteKeyUnused, handlers) {
    _apiUrl = apiUrl || '';
    _handlers = handlers || {};
    _popupOrigin = _computeTargetOrigin();

    if (_onMessage) return;
    _onMessage = function (ev) {
      // Only accept messages from our recorder origin.
      if (!ev || !ev.data || typeof ev.data !== 'object') return;
      if (_popupOrigin !== '*' && ev.origin !== _popupOrigin) return;
      // After a host-page refresh we lose the `_popup` reference we held
      // from window.open(). Every inbound message carries `event.source` —
      // a live handle to the popup — so adopt it so stop/cancel/ack can
      // still reach the popup.
      if (ev.source && ev.source !== window) {
        _popup = ev.source;
        _active = true;
      }
      _dispatch(ev.data);
    };
    window.addEventListener('message', _onMessage);
  }

  function start(opts) {
    if (!isSupported()) return false;
    if (!_apiUrl) return false;
    var sw = (window.screen && window.screen.availWidth) || 1280;
    var sh = (window.screen && window.screen.availHeight) || 800;
    var left = Math.max(0, Math.floor((sw - POPUP_W) / 2));
    var top = Math.max(0, Math.floor((sh - POPUP_H) / 2));
    var features = 'width=' + POPUP_W + ',height=' + POPUP_H +
      ',left=' + left + ',top=' + top +
      ',resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no';

    // Open about:blank synchronously so we keep the user-gesture popup
    // allowance, then navigate to the recorder once the widget session is
    // ready. Avoids the race where the user clicks record before the boot
    // mint completes, which would have built the recorder URL without a
    // token fragment and tripped "Missing required recorder parameters".
    var popup;
    try {
      popup = window.open('about:blank', POPUP_NAME, features);
    } catch (e) {
      popup = null;
    }
    if (!popup || popup.closed) return false;
    _popup = popup;
    _active = true;
    try { popup.focus(); } catch (e) {}

    var ensure = (typeof TicketSupportAPI !== 'undefined' && TicketSupportAPI.ensureSession)
      ? TicketSupportAPI.ensureSession()
      : Promise.resolve();
    Promise.resolve(ensure).then(function () {
      // Hard-require a non-empty bearer before navigating. ensureSession now
      // mints whenever the token is empty (see _sessionStillValid), so an
      // empty token here means the mint itself returned none — fail closed
      // with a clear message instead of launching a popup that would trip the
      // opaque "Missing required recorder parameters" error.
      var token = (typeof TicketSupportAPI !== 'undefined' && TicketSupportAPI.getSessionToken)
        ? TicketSupportAPI.getSessionToken()
        : '';
      if (!token) {
        try { popup.close(); } catch (e) {}
        if (_handlers.onError) {
          _handlers.onError('Could not start a recording session — please try again.');
        }
        return;
      }
      try {
        if (popup && !popup.closed) {
          popup.location.replace(_buildUrl(opts));
        }
      } catch (e) {
        // Cross-origin nav of a new about:blank should not throw, but if
        // it does close the popup and surface the error to the caller.
        try { popup.close(); } catch (_) {}
        if (_handlers.onError) _handlers.onError('Failed to launch recorder');
      }
    }).catch(function (err) {
      try { popup.close(); } catch (e) {}
      if (_handlers.onError) {
        _handlers.onError((err && err.message) || 'Failed to start widget session');
      }
    });

    return true;
  }

  function stop() {
    if (_popup && !_popup.closed) {
      try { _popup.postMessage({ type: 'stop' }, _popupOrigin); } catch (e) {}
    }
  }

  function cancel() {
    if (_popup && !_popup.closed) {
      try { _popup.postMessage({ type: 'cancel' }, _popupOrigin); } catch (e) {}
    }
    _active = false;
  }

  function ack(gcsPath) {
    if (_popup && !_popup.closed) {
      try { _popup.postMessage({ type: 'ack', gcsPath: gcsPath }, _popupOrigin); } catch (e) {}
    }
  }

  // Called on widget boot to wake any popup that was mid-recording during a
  // host-page refresh. We don't hold a reference anymore, but `window.open`
  // with the same name returns the existing popup handle without navigating
  // (when URL is empty). Browsers may require a user gesture for this; if it
  // fails the popup's own retry sweep will still deliver results.
  function reacquire(draftTicketId) {
    try {
      var popup = window.open('', POPUP_NAME);
      if (!popup) return false;
      // If we got back our own origin or a blank window we accidentally made,
      // close it. Cross-origin access throws — which is the signal that this
      // really is our recorder popup on the dashboard origin.
      var isOurs = false;
      try {
        var href = popup.location.href;
        if (!href || href === 'about:blank') {
          popup.close();
          return false;
        }
      } catch (e) {
        isOurs = true;
      }
      if (!isOurs) return false;
      _popup = popup;
      _active = true;
      try { popup.postMessage({ type: 'widget-hello', draftTicketId: draftTicketId }, _popupOrigin); } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  function isActive() { return _active && _popup && !_popup.closed; }

  return {
    isSupported: isSupported,
    init: init,
    start: start,
    stop: stop,
    cancel: cancel,
    ack: ack,
    reacquire: reacquire,
    isActive: isActive,
  };
})();


// ─── STYLES.JS ─────────────────────────────────────
/**
 * ticket_support_embed — Styles (CSS-in-JS)
 * Injected inside Shadow DOM to avoid host-site style collisions.
 * Mirrors the SGEN Dashboard shadcn/ui design system exactly.
 */
var TicketSupportStyles = (function () {
  'use strict';

  var CSS = `
/* === RESET === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px; color: hsl(40, 5%, 72%); line-height: 1.5;
}

/* === ANIMATIONS === */
@keyframes ts-slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes ts-slideOutRight {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}
@keyframes ts-slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
@keyframes ts-slideOutLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}
@keyframes ts-spin { to { transform: rotate(360deg); } }
@keyframes ts-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes ts-fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ─── BACKDROP (dark overlay behind panel) ─────────── */
.ts-backdrop {
  position: fixed; inset: 0; z-index: 99997;
  background: rgba(0,0,0,.45);
  animation: ts-fadeIn .2s ease;
  pointer-events: auto;
}

/* ─── FAB ──────────────────────────────────────────── */
.ts-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 99999;
  width: 56px; height: 56px; border-radius: 50%; border: none;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 14px rgba(220,38,38,.4);
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s, box-shadow .2s;
  pointer-events: auto;
}
.ts-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(220,38,38,.55); }
.ts-fab svg {
  width: 24px; height: 24px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}

/* ─── FAB position variants (base positions, offsets applied via inline style) */
[data-position="bottom-left"] .ts-fab { right: auto; left: 24px; }
[data-position="top-right"] .ts-fab { bottom: auto; top: 24px; }
[data-position="top-left"] .ts-fab { bottom: auto; top: 24px; right: auto; left: 24px; }
[data-position="middle-right"] .ts-fab { bottom: auto; top: calc(50% - 28px); }
[data-position="middle-left"] .ts-fab { bottom: auto; top: calc(50% - 28px); right: auto; left: 24px; }

/* ─── PANEL (full-height slide-in drawer from right) ─ */
.ts-panel {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 99998;
  width: 440px; max-width: 100vw;
  background: hsl(30, 5%, 10%); border-radius: 0;
  border-left: 1px solid hsl(30, 5%, 13%);
  box-shadow: -8px 0 30px rgba(0,0,0,.35);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: ts-slideInRight .3s cubic-bezier(.4,0,.2,1);
  pointer-events: auto;
}
.ts-panel.ts-closing {
  animation: ts-slideOutRight .25s cubic-bezier(.4,0,.2,1) forwards;
}

/* ─── PANEL position variants ──────────────────────── */
[data-position="bottom-left"] .ts-panel,
[data-position="top-left"] .ts-panel,
[data-position="middle-left"] .ts-panel {
  right: auto; left: 0;
  border-left: none; border-right: 1px solid hsl(30, 5%, 13%);
  box-shadow: 8px 0 30px rgba(0,0,0,.35);
  animation: ts-slideInLeft .3s cubic-bezier(.4,0,.2,1);
}
[data-position="bottom-left"] .ts-panel.ts-closing,
[data-position="top-left"] .ts-panel.ts-closing,
[data-position="middle-left"] .ts-panel.ts-closing {
  animation: ts-slideOutLeft .25s cubic-bezier(.4,0,.2,1) forwards;
}
.ts-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid hsl(30, 5%, 13%);
  background: hsl(30, 5%, 7%); flex-shrink: 0;
}
.ts-panel-title {
  font-weight: 600; font-size: 16px; color: hsl(40, 5%, 85%); line-height: 1.3;
}
.ts-panel-desc {
  font-size: 13px; color: hsl(40, 5%, 55%); margin-top: 2px; font-weight: 400;
}
.ts-panel-close {
  background: none; border: none; color: hsl(40, 5%, 55%); cursor: pointer;
  padding: 4px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center; transition: background .15s, color .15s;
  flex-shrink: 0;
}
.ts-panel-close:hover { background: hsl(30, 5%, 13%); color: hsl(40, 5%, 85%); }
.ts-panel-close svg { width: 18px; height: 18px; }
.ts-panel-body { flex: 1; overflow-y: auto; padding: 20px; background: hsl(30, 5%, 10%); }
.ts-panel-footer {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px 20px; border-top: 1px solid hsl(30, 5%, 13%);
  background: hsl(30, 5%, 7%); flex-shrink: 0;
}

/* ─── WIZARD STEP DOTS ────────────────────────────────── */
.ts-wizard-dots-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.ts-wizard-nav {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
}
.ts-wizard-dots-label { font-size: 14px; font-weight: 500; color: hsl(40, 5%, 85%); }
.ts-wizard-dots {
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ts-wizard-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: hsl(30, 5%, 18%); transition: all .2s;
}
.ts-wizard-dot.ts-dot-current {
  width: 10px; height: 10px; background: #dc2626;
}
.ts-wizard-hint { font-size: 13px; color: hsl(40, 5%, 55%); margin-bottom: 8px; }
.ts-drop-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 32px 16px; border: 2px dashed hsl(30, 5%, 22%); border-radius: 8px;
  cursor: pointer; transition: border-color .15s, background .15s;
  color: hsl(40, 5%, 55%); text-align: center;
}
.ts-drop-zone:hover { border-color: hsl(30, 5%, 30%); }
.ts-drop-zone svg { width: 32px; height: 32px; opacity: .6; }
.ts-drop-zone-text { font-size: 13px; font-weight: 500; }
.ts-drop-zone-hint { font-size: 11px; color: hsl(40, 5%, 40%); }
.ts-summary { border: 1px solid hsl(30, 5%, 18%); border-radius: 8px; padding: 14px; background: hsl(30, 5%, 8%); }
.ts-summary-section { margin-bottom: 10px; }
.ts-summary-section:last-child { margin-bottom: 0; }
.ts-summary-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: hsl(40, 5%, 45%); margin-bottom: 4px; }
.ts-summary-value { font-size: 13px; color: hsl(40, 5%, 78%); }
.ts-summary-value-truncate { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; }
.ts-panel-footer.ts-wizard-footer { }

/* ─── BUTTONS ──────────────────────────────────────── */
.ts-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 36px; padding: 0 16px; border-radius: 6px; border: 1px solid hsl(30, 5%, 20%);
  background: hsl(30, 5%, 15%); color: hsl(40, 5%, 72%); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
  font-family: inherit; line-height: 1;
}
.ts-btn:hover { background: hsl(30, 5%, 18%); border-color: hsl(30, 5%, 25%); }
.ts-btn:disabled { opacity: .5; cursor: not-allowed; }
.ts-btn svg {
  width: 14px; height: 14px; flex-shrink: 0; fill: none;
  stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.ts-btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: #fff; border-color: transparent;
  box-shadow: 0 2px 10px rgba(220,38,38,.35);
}
.ts-btn-primary:hover {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 4px 16px rgba(220,38,38,.45);
}
.ts-btn-primary:disabled {
  opacity: 0.5; cursor: not-allowed;
  box-shadow: none;
}
.ts-btn-sm { height: 32px; padding: 0 12px; font-size: 12px; }
.ts-btn-danger { color: #ef4444; border-color: hsl(0, 30%, 20%); }
.ts-btn-danger:hover { background: hsl(0, 10%, 12%); }
.ts-btn-destructive { background: #ef4444; color: #fff; border-color: #ef4444; }
.ts-btn-destructive:hover { background: #dc2626; }
.ts-btn-success { color: #4ade80; border-color: hsl(140, 20%, 18%); }
.ts-btn-success:hover { background: hsl(140, 10%, 12%); }
.ts-btn-ghost { border-color: transparent; background: transparent; }
.ts-btn-ghost:hover { background: hsl(30, 5%, 15%); }
.ts-btn-block { width: 100%; }
.ts-btn-icon { width: 32px; height: 32px; padding: 0; }

/* ─── FORM ELEMENTS (dark theme) ──────────────────── */
.ts-form-group { margin-bottom: 16px; }
.ts-label {
  display: flex; align-items: center; gap: 2px;
  font-size: 14px; font-weight: 500; color: hsl(40, 5%, 72%);
  margin-bottom: 6px; line-height: 1;
}
.ts-required { color: #ef4444; }
.ts-optional { font-weight: 400; color: hsl(40, 5%, 45%); font-size: 13px; }
.ts-input, .ts-select, .ts-textarea {
  width: 100%; height: 40px; padding: 8px 12px;
  border: 1px solid hsl(30, 5%, 20%); border-radius: 6px;
  font-size: 14px; font-family: inherit; color: hsl(40, 5%, 72%); background: hsl(30, 5%, 15%);
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.ts-input::placeholder, .ts-textarea::placeholder { color: hsl(40, 5%, 45%); }
.ts-input:focus, .ts-select:focus, .ts-textarea:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,.15);
}
.ts-textarea { min-height: 100px; resize: vertical; height: auto; }
.ts-select {
  cursor: pointer; -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23868078' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 32px;
}
.ts-select option { background: hsl(30, 5%, 15%); color: hsl(40, 5%, 72%); font-size: 14px; padding: 8px 12px; }
.ts-input-wrapper { position: relative; }
.ts-input-wrapper .ts-input { padding-right: 36px; }
.ts-input-wrapper .ts-input-icon {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: hsl(40, 5%, 45%); pointer-events: none; display: flex;
}
.ts-input-wrapper .ts-input-icon svg { width: 16px; height: 16px; }
.ts-error-text { color: #ef4444; font-size: 12px; margin-top: 4px; }

/* Markdown editor */
.ts-md-editor {
  border: 1px solid hsl(30, 5%, 20%); border-radius: 6px;
  background: hsl(30, 5%, 15%); overflow: hidden;
}
.ts-md-editor:focus-within { border-color: hsl(40, 5%, 50%); }
.ts-md-toolbar {
  display: flex; gap: 4px; padding: 6px;
  border-bottom: 1px solid hsl(30, 5%, 20%);
  background: hsl(30, 5%, 12%);
}
.ts-md-btn {
  padding: 4px 10px; font-size: 12px; font-weight: 600;
  border: 1px solid hsl(30, 5%, 22%); border-radius: 4px;
  background: hsl(30, 5%, 18%); color: hsl(40, 5%, 78%);
  cursor: pointer; transition: background .12s, border-color .12s;
}
.ts-md-btn:hover { background: hsl(30, 5%, 24%); border-color: hsl(30, 5%, 32%); }
.ts-md-btn:active { background: hsl(30, 5%, 28%); }
.ts-md-textarea { border: none; border-radius: 0; min-height: 140px; }
.ts-md-textarea:focus { box-shadow: none; }

/* Link modal (replaces window.prompt for Insert Link) — centered overlay */
.ts-md-modal-backdrop {
  position: fixed; inset: 0; z-index: 999999;
  background: rgba(0, 0, 0, .55);
  display: flex; align-items: center; justify-content: center;
  animation: ts-fadeIn .12s ease-out;
  pointer-events: auto;
  padding: 16px;
}
.ts-md-modal-dialog {
  width: 100%; max-width: 420px;
  padding: 20px;
  background: hsl(30, 5%, 12%);
  border: 1px solid hsl(30, 5%, 22%); border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, .5);
  display: flex; flex-direction: column; gap: 12px;
}
.ts-md-modal-title {
  font-size: 15px; font-weight: 600; color: hsl(40, 5%, 90%);
}
.ts-md-modal-row {
  display: flex; flex-direction: column; gap: 6px;
}
.ts-md-modal-row .ts-input { width: 100%; }
.ts-md-modal-actions {
  display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;
}
.ts-md-modal-actions .ts-btn { padding: 8px 16px; font-size: 13px; }

/* URL list */
.ts-url-list { display: flex; flex-direction: column; gap: 6px; }
.ts-url-row { display: flex; gap: 6px; align-items: center; }
.ts-url-row .ts-input { flex: 1; }
.ts-url-remove {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid hsl(30, 5%, 22%); background: hsl(30, 5%, 15%);
  color: hsl(40, 5%, 65%); font-size: 16px; line-height: 1; cursor: pointer;
}
.ts-url-remove:hover { color: #ef4444; border-color: hsl(30, 5%, 32%); }
.ts-url-add {
  align-self: flex-start; padding: 6px 12px; font-size: 12px;
  margin-top: 2px;
}

.ts-radio-group { display: flex; gap: 8px; }
.ts-radio-label {
  flex: 1; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: 1px solid hsl(30, 5%, 20%); border-radius: 6px;
  font-size: 14px; color: hsl(40, 5%, 72%); background: hsl(30, 5%, 15%);
  cursor: pointer; transition: border-color .15s, background .15s;
}
.ts-radio-label:hover { border-color: hsl(30, 5%, 30%); }
.ts-radio-label.ts-radio-selected {
  border-color: #dc2626; background: rgba(220,38,38,.1); color: #fca5a5;
}
.ts-radio-label input[type="radio"] {
  accent-color: #dc2626; width: 16px; height: 16px; margin: 0; cursor: pointer;
}
.ts-worktype-cards { display: flex; gap: 12px; }
.ts-worktype-card {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 24px 16px; border: 2px solid hsl(30, 5%, 20%); border-radius: 10px;
  background: hsl(30, 5%, 15%); color: hsl(40, 5%, 55%); cursor: pointer;
  transition: all .15s; font-family: inherit;
}
.ts-worktype-card:hover { border-color: hsl(30, 5%, 30%); }
.ts-worktype-card.ts-worktype-active {
  border-color: #dc2626; background: rgba(220,38,38,.08); color: hsl(40, 5%, 85%);
}
.ts-worktype-card-icon { font-size: 28px; }
.ts-worktype-card-label { font-size: 15px; font-weight: 600; }
.ts-worktype-card-hint { font-size: 11px; color: hsl(40, 5%, 45%); text-align: center; }
.ts-client-btns { display: flex; gap: 10px; }
.ts-client-btn {
  flex: 1; height: 44px; display: flex; align-items: center; justify-content: center;
  border: 2px solid hsl(30, 5%, 20%); border-radius: 6px;
  background: hsl(30, 5%, 15%); color: hsl(40, 5%, 55%);
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit;
}
.ts-client-btn:hover { border-color: hsl(30, 5%, 30%); }
.ts-client-btn.ts-client-active {
  border-color: #dc2626; background: rgba(220,38,38,.08); color: hsl(40, 5%, 85%);
}

/* ─── FILE UPLOAD ──────────────────────────────────── */
.ts-file-upload-label {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 8px;
  border: 2px dashed hsla(30, 5%, 30%, 0.5);
  background: hsla(30, 5%, 15%, 0.5); color: hsl(40, 5%, 55%);
  font-size: 14px; cursor: pointer; width: 100%;
  transition: border-color .15s, background .15s, color .15s;
}
.ts-file-upload-label:hover {
  border-color: rgba(220,38,38,0.4);
  background: hsla(30, 5%, 15%, 0.8); color: hsl(40, 5%, 72%);
}
.ts-file-upload-label svg {
  width: 16px; height: 16px; flex-shrink: 0;
  fill: none; stroke: currentColor; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}
.ts-file-upload-label input[type="file"] { display: none; }

/* ─── FILE CHIPS ───────────────────────────────────── */
.ts-file-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.ts-file-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 6px; background: hsl(30, 5%, 15%);
  font-size: 12px; color: hsl(40, 5%, 65%); border: 1px solid hsl(30, 5%, 20%);
}
.ts-file-chip button {
  background: none; border: none; color: #ef4444; cursor: pointer;
  font-size: 14px; padding: 0 2px; line-height: 1;
}

/* ─── ATTACHMENT THUMBNAILS ────────────────────────── */
.ts-att-info { font-size: 11px; color: hsl(40, 5%, 55%); margin-top: 8px; }
.ts-att-grid { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 8px; }
.ts-att-thumb {
  position: relative; width: 80px; height: 80px; border-radius: 8px;
  overflow: hidden; border: 1px solid hsl(30, 5%, 20%);
}
.ts-att-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ts-att-thumb-name {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,.65); color: #fff; font-size: 9px;
  padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ts-att-remove {
  position: absolute; top: 2px; right: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0,0,0,.6); color: #fff; border: none;
  font-size: 12px; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ts-att-remove:hover { background: rgba(220,38,38,.8); }

/* ─── COLLAPSIBLE RECORDING SECTION ────────────────── */
.ts-collapsible {
  margin-top: 16px; border-top: 1px solid hsl(30, 5%, 13%); padding-top: 16px;
}
.ts-collapsible-trigger {
  display: flex; align-items: center; gap: 8px; width: 100%;
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 14px; font-weight: 500; color: hsl(40, 5%, 72%);
  font-family: inherit; text-align: left;
}
.ts-collapsible-trigger svg {
  width: 16px; height: 16px; flex-shrink: 0;
  fill: none; stroke: currentColor; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}
.ts-collapsible-trigger .ts-chevron {
  margin-left: auto; transition: transform .2s ease; color: hsl(40, 5%, 45%);
}
.ts-collapsible-trigger .ts-chevron.ts-rotated { transform: rotate(180deg); }
.ts-collapsible-body {
  overflow: hidden; max-height: 0;
  transition: max-height .3s ease, opacity .2s ease;
  opacity: 0;
}
.ts-collapsible-body.ts-expanded { max-height: 600px; opacity: 1; }
.ts-collapsible-content { padding-top: 12px; }

/* ─── RECORDING BUTTONS (inside collapsible) ──────── */
.ts-rec-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.ts-rec-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 6px;
  border: 1px solid hsl(30, 5%, 20%); background: hsl(30, 5%, 15%);
  font-size: 13px; font-weight: 500; color: hsl(40, 5%, 72%);
  cursor: pointer; transition: all .15s; font-family: inherit;
}
.ts-rec-btn:hover { background: hsl(30, 5%, 18%); border-color: hsl(30, 5%, 25%); }
.ts-rec-btn svg {
  width: 14px; height: 14px; flex-shrink: 0;
  fill: none; stroke: currentColor; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}
.ts-rec-btn .ts-ext-icon { color: hsl(40, 5%, 45%); }

/* ─── RECORDING ACTIVE INDICATOR (in form) ─────────── */
.ts-rec-active-indicator {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px;
  background: rgba(220,38,38,.15); border: 1px solid rgba(220,38,38,.3);
  font-size: 13px; color: #fca5a5; margin-top: 8px;
}
.ts-pulse-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #ef4444; animation: ts-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

/* ─── RECORDING LIST ITEMS ─────────────────────────── */
.ts-rec-list { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.ts-rec-list-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px;
  border: 1px solid hsl(30, 5%, 20%); background: hsl(30, 5%, 15%);
  font-size: 12px;
}
.ts-rec-list-item .ts-rec-icon {
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ts-rec-list-item .ts-rec-icon svg {
  width: 14px; height: 14px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.ts-rec-list-item .ts-rec-icon.ts-screen { background: rgba(37,99,235,.2); color: #60a5fa; }
.ts-rec-list-item .ts-rec-icon.ts-audio { background: rgba(124,58,237,.2); color: #a78bfa; }
.ts-rec-list-item .ts-rec-info { flex: 1; min-width: 0; }
.ts-rec-list-item .ts-rec-name {
  font-weight: 500; color: hsl(40, 5%, 72%);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ts-rec-list-item .ts-rec-meta { color: hsl(40, 5%, 45%); font-size: 11px; }
.ts-rec-list-item .ts-rec-actions { display: flex; gap: 2px; }
.ts-rec-list-item .ts-rec-actions button {
  background: none; border: none; cursor: pointer; padding: 4px;
  border-radius: 4px; color: hsl(40, 5%, 45%); transition: all .15s;
  display: flex; align-items: center;
}
.ts-rec-list-item .ts-rec-actions button svg {
  width: 14px; height: 14px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.ts-rec-list-item .ts-rec-actions button:hover { background: hsl(30, 5%, 18%); color: hsl(40, 5%, 72%); }
.ts-rec-list-item .ts-rec-actions .ts-remove-btn:hover { color: #ef4444; background: rgba(220,38,38,.15); }

/* ─── RECORDING DRAWER (FLOATING DRAGGABLE) ───────── */
/* Recording bar — compact fixed bottom bar */
.ts-rec-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: hsl(30, 5%, 7%);
  border-top: 1px solid hsl(30, 5%, 15%);
  box-shadow: 0 -4px 20px rgba(0,0,0,.3);
  /* Never block clicks on the page being recorded; only the stop button captures pointer events. */
  pointer-events: none;
}
.ts-rec-bar .ts-rec-bar-stop,
.ts-rec-bar [data-clickable] { pointer-events: auto; }
.ts-rec-bar-info { display: flex; align-items: center; gap: 8px; flex: 1; }
.ts-rec-bar-label { font-size: 13px; font-weight: 500; color: #fca5a5; }
.ts-rec-bar-timer { font-size: 13px; color: hsl(40, 5%, 55%); font-variant-numeric: tabular-nums; }
.ts-rec-bar-success { font-size: 13px; font-weight: 500; color: #4ade80; }
.ts-rec-bar-muted { font-size: 12px; color: hsl(40, 5%, 55%); }
.ts-rec-bar-stop {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 6px; border: none;
  background: #dc2626; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer;
}
.ts-rec-bar-stop:hover { background: #ef4444; }
.ts-rec-bar-stop svg {
  width: 12px; height: 12px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}

/* Lift the side panel above the bottom recording bar so wizard nav stays
 * reachable while a recording is in progress. Bar is ~44px + 12px gap.
 * Class lives on the shadow-root wrapper (not body) — Shadow DOM CSS
 * can't traverse out to document.body. */
.ts-recording-active .ts-panel,
.ts-recording-active .ts-panel.ts-closing { bottom: 56px; }

/* ─── RECORDING STATES (inside drawer) ─────────────── */
.ts-rec-recording-box {
  padding: 12px; border-radius: 8px;
  background: rgba(220,38,38,.1); border: 1px solid rgba(220,38,38,.25);
}
.ts-rec-recording-header {
  display: flex; align-items: center; justify-content: space-between;
}
.ts-rec-recording-info { display: flex; align-items: center; gap: 8px; }
.ts-rec-timer {
  font-size: 13px; font-weight: 500; color: #fca5a5;
  font-variant-numeric: tabular-nums;
}
.ts-rec-timer-secondary { color: hsl(40, 5%, 45%); font-weight: 400; }
.ts-rec-canvas {
  width: 100%; height: 48px; border-radius: 4px;
  margin-top: 8px; display: block;
}
.ts-rec-preview {
  width: 100%; border-radius: 6px; margin-top: 8px;
  max-height: 200px; display: block; background: #000;
}

.ts-rec-uploading-box {
  padding: 12px; border-radius: 8px; border: 1px solid hsl(30, 5%, 20%);
}
.ts-rec-uploading-info {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: hsl(40, 5%, 55%); margin-bottom: 8px;
}
.ts-progress {
  width: 100%; height: 6px; border-radius: 3px;
  background: hsl(30, 5%, 13%); overflow: hidden;
}
.ts-progress-bar {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #dc2626, #ef4444);
  transition: width .3s ease;
}

/* ─── TICKET LIST ──────────────────────────────────── */
.ts-stats { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.ts-stat-card {
  flex: 1; min-width: 80px; padding: 10px 12px; border-radius: 8px;
  background: hsl(30, 5%, 15%); border: 1px solid hsl(30, 5%, 20%); text-align: center;
}
.ts-stat-card .ts-stat-value { font-size: 20px; font-weight: 700; color: hsl(40, 5%, 85%); }
.ts-stat-card .ts-stat-label { font-size: 11px; color: hsl(40, 5%, 45%); margin-top: 2px; }
.ts-ticket-item {
  padding: 12px 0; border-bottom: 1px solid hsl(30, 5%, 13%); cursor: pointer;
  transition: background .1s;
}
.ts-ticket-item:hover { background: hsl(30, 5%, 15%); margin: 0 -20px; padding: 12px 20px; border-radius: 8px; }
.ts-ticket-item:last-child { border-bottom: none; }
.ts-ticket-subject { font-weight: 500; color: hsl(40, 5%, 72%); font-size: 13px; }
.ts-ticket-meta {
  font-size: 11px; color: hsl(40, 5%, 45%); margin-top: 3px;
  display: flex; gap: 8px; align-items: center;
}

/* ─── STATUS BADGES ────────────────────────────────── */
.ts-badge {
  display: inline-block; padding: 2px 8px; border-radius: 9999px;
  font-size: 11px; font-weight: 500; white-space: nowrap;
}
.ts-badge-open { background: rgba(37,99,235,.2); color: #60a5fa; }
.ts-badge-awaiting_reply { background: rgba(180,83,9,.2); color: #fbbf24; }
.ts-badge-in_progress { background: rgba(67,56,202,.2); color: #818cf8; }
.ts-badge-resolved { background: rgba(21,128,61,.2); color: #4ade80; }
.ts-badge-closed { background: rgba(100,116,139,.2); color: hsl(40, 5%, 55%); }

/* ─── TICKET DETAIL ────────────────────────────────── */
.ts-detail-header { margin-bottom: 16px; }
.ts-detail-subject { font-size: 16px; font-weight: 600; color: hsl(40, 5%, 85%); }
.ts-detail-info {
  font-size: 12px; color: hsl(40, 5%, 45%); margin-top: 4px;
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}
.ts-messages { margin-bottom: 16px; }
.ts-message {
  padding: 12px; margin-bottom: 8px; border-radius: 8px;
  border: 1px solid hsl(30, 5%, 20%); background: hsl(30, 5%, 15%);
}
.ts-message-admin { background: rgba(37,99,235,.1); border-color: rgba(37,99,235,.25); }
.ts-message-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
}
.ts-message-sender {
  font-weight: 600; font-size: 12px; color: hsl(40, 5%, 72%);
  display: inline-flex; align-items: center; gap: 4px;
}
.ts-message-sender svg {
  width: 14px; height: 14px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
.ts-message-time { font-size: 11px; color: hsl(40, 5%, 45%); }
.ts-message-body {
  white-space: pre-wrap; word-wrap: break-word; font-size: 13px; color: hsl(40, 5%, 65%);
}

/* ─── ATTACHMENTS ──────────────────────────────────── */
.ts-attachments { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.ts-attachment-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 6px; background: hsl(30, 5%, 15%);
  font-size: 11px; color: #60a5fa; text-decoration: none; cursor: pointer;
  border: 1px solid hsl(30, 5%, 20%);
}
.ts-attachment-chip:hover { background: hsl(30, 5%, 18%); }
.ts-attachment-chip svg {
  width: 14px; height: 14px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}

/* ─── MEDIA PLAYER ─────────────────────────────────── */
.ts-player { margin-top: 6px; border-radius: 6px; overflow: hidden; background: hsl(30, 5%, 5%); }
.ts-player video, .ts-player audio { width: 100%; display: block; }
.ts-player-controls {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: hsl(30, 5%, 7%); color: hsl(40, 5%, 72%); font-size: 11px;
}
.ts-player-controls button {
  background: none; border: none; color: hsl(40, 5%, 72%); cursor: pointer; padding: 2px;
}
.ts-player-controls input[type="range"] {
  flex: 1; -webkit-appearance: none; appearance: none; height: 4px;
  background: hsl(30, 5%, 20%); border-radius: 2px; outline: none;
}
.ts-player-controls input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
  background: #dc2626; cursor: pointer;
}
.ts-player-controls select {
  background: hsl(30, 5%, 15%); border: none; color: hsl(40, 5%, 72%);
  font-size: 11px; border-radius: 4px; padding: 2px 4px;
}

/* ─── FILTER TABS ──────────────────────────────────── */
.ts-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
.ts-tab {
  padding: 4px 12px; border-radius: 6px; border: 1px solid hsl(30, 5%, 20%);
  background: hsl(30, 5%, 15%); color: hsl(40, 5%, 55%); font-size: 12px; cursor: pointer;
  font-family: inherit;
}
.ts-tab:hover { background: hsl(30, 5%, 18%); }
.ts-tab-active {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: #fff; border-color: transparent;
}

/* ─── EMPTY / LOADING ──────────────────────────────── */
.ts-empty { text-align: center; padding: 32px 16px; color: hsl(40, 5%, 45%); font-size: 13px; }
.ts-loading { text-align: center; padding: 32px 16px; color: hsl(40, 5%, 55%); font-size: 13px; }
.ts-spinner {
  width: 28px; height: 28px; border: 3px solid hsl(30, 5%, 13%); border-top-color: #dc2626;
  border-radius: 50%; animation: ts-spin .7s linear infinite; margin: 0 auto 8px;
}
.ts-spin-inline {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid hsl(30, 5%, 20%); border-top-color: #dc2626;
  border-radius: 50%; animation: ts-spin .7s linear infinite;
}

/* ─── PAGINATION ───────────────────────────────────── */
.ts-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }

/* ─── BACK BUTTON ──────────────────────────────────── */
.ts-back-btn {
  background: none; border: none; color: #ef4444; cursor: pointer;
  font-size: 13px; padding: 0; margin-bottom: 12px;
  display: inline-flex; align-items: center; gap: 4px;
  font-family: inherit;
}
.ts-back-btn:hover { text-decoration: underline; }
.ts-back-btn svg {
  width: 14px; height: 14px; fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}

/* ─── TOAST ────────────────────────────────────────── */
.ts-toast {
  position: fixed; top: 20px; right: 20px; z-index: 100000;
  padding: 12px 20px; border-radius: 8px; color: #fff; font-size: 13px;
  box-shadow: 0 4px 16px rgba(0,0,0,.4); animation: ts-fadeIn .3s ease;
  pointer-events: auto;
}
.ts-toast-success { background: #16a34a; }
.ts-toast-error { background: #ef4444; }

/* ─── TOAST position variants ──────────────────────── */
[data-position="bottom-left"] .ts-toast,
[data-position="top-left"] .ts-toast,
[data-position="middle-left"] .ts-toast { right: auto; left: 20px; }

/* ─── SCROLLBAR (dark) ─────────────────────────────── */
.ts-panel-body::-webkit-scrollbar { width: 6px; }
.ts-panel-body::-webkit-scrollbar-track { background: transparent; }
.ts-panel-body::-webkit-scrollbar-thumb { background: hsl(30, 5%, 20%); border-radius: 3px; }
.ts-panel-body::-webkit-scrollbar-thumb:hover { background: hsl(30, 5%, 25%); }

/* ─── RESPONSIVE ───────────────────────────────────── */
@media (max-width: 480px) {
  .ts-panel { width: 100vw; max-width: 100vw; }
  .ts-fab { width: 48px; height: 48px; }
  [data-position="bottom-left"] .ts-fab { right: auto; }
  [data-position="top-right"] .ts-fab { bottom: auto; }
  [data-position="top-left"] .ts-fab { bottom: auto; right: auto; }
  [data-position="middle-right"] .ts-fab { bottom: auto; }
  [data-position="middle-left"] .ts-fab { bottom: auto; right: auto; }
  .ts-input, .ts-select, .ts-textarea { font-size: 16px; }
}
`;

  function inject(shadowRoot) {
    var style = document.createElement('style');
    style.textContent = CSS;
    shadowRoot.appendChild(style);
  }

  return { inject: inject, CSS: CSS };
})();


// ─── UI.JS ─────────────────────────────────────
/**
 * ticket_support_embed — UI Module
 * Pure vanilla JS DOM construction matching the SGEN Dashboard exactly.
 * Renders inside a Shadow DOM container.
 */
var TicketSupportUI = (function () {
  'use strict';

  var _root = null;       // shadow root
  var _panelBody = null;  // panel body element
  var _panelFooter = null; // panel footer element

  // ─── Recording drawer persistent refs ───────────────
  var _drawer = {
    el: null,          // drawer root element
    bodyEl: null,      // drawer body element
    warningEl: null,   // warning strip
    minimizedEl: null, // minimized indicator
    timerEl: null,     // timer text
    progressEl: null,  // progress bar fill
    canvasEl: null,    // waveform canvas
    previewEl: null,   // video preview
    lastSubState: null // 'idle' | 'recording' | 'uploading'
  };

  // ─── SVG Icons (Lucide style) ───────────────────────
  var ICONS = {
    support: '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    headphones: '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    send: '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    paperclip: '<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    video: '<svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    externalLink: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
    gripHorizontal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="15" r="1" fill="currentColor" stroke="none"/></svg>',
    minimize2: '<svg viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    maximize2: '<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    alertTriangle: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    square: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" stroke="none"/></svg>',
    monitor: '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
    trash2: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    fileText: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    building2: '<svg viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    cog: '<svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    messageSquare: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    clipboardList: '<svg viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
  };

  var STATUS_LABELS = {
    open: 'Open', awaiting_reply: 'Awaiting Reply', in_progress: 'In Progress',
    resolved: 'Resolved', closed: 'Closed',
  };

  // ─── Helpers ────────────────────────────────────────

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] === null || attrs[k] === undefined) continue;
        if (k === 'className') e.className = attrs[k];
        else if (k === 'innerHTML') e.innerHTML = attrs[k];
        else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      if (typeof children === 'string') e.textContent = children;
      else if (Array.isArray(children)) children.forEach(function (c) { if (c) e.appendChild(c); });
      else e.appendChild(children);
    }
    return e;
  }

  function icon(name, w, h) {
    var svg = ICONS[name] || '';
    var width = w || 16;
    var height = h || 16;
    // Add default attributes to SVG if not already present
    svg = svg.replace('<svg ', '<svg width="' + width + '" height="' + height + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ');
    return svg;
  }

  function formatDate(d) {
    var date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function toast(msg, type) {
    var t = el('div', { className: 'ts-toast ts-toast-' + (type || 'success') }, msg);
    _root.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  /**
   * Apply FAB position + offset via inline styles.
   * CSS classes handle the base position (bottom-right, top-left, etc.)
   * but offsets must be applied inline since CSS variables don't reliably
   * inherit to fixed-position elements inside Shadow DOM.
   */
  function _applyFabPosition(fabEl) {
    var pos = TicketSupportState.get('position') || 'bottom-right';
    var ox = TicketSupportState.get('offsetX') || 0;
    var oy = TicketSupportState.get('offsetY') || 0;

    // Determine which edges to offset based on position
    var isLeft = pos === 'bottom-left' || pos === 'top-left' || pos === 'middle-left';
    var isTop = pos === 'top-right' || pos === 'top-left';
    var isMiddle = pos === 'middle-right' || pos === 'middle-left';

    if (isLeft) {
      fabEl.style.left = (24 + ox) + 'px';
    } else {
      fabEl.style.right = (24 + ox) + 'px';
    }

    if (isMiddle) {
      fabEl.style.top = 'calc(50% - 28px + ' + oy + 'px)';
    } else if (isTop) {
      fabEl.style.top = (24 + oy) + 'px';
    } else {
      fabEl.style.bottom = (24 + oy) + 'px';
    }
  }

  // ─── Init ───────────────────────────────────────────

  var _lastViewState = { widgetOpen: false, view: null };
  var _prevPartialState = {};
  var _manualBackSteps = {}; // tracks steps user manually navigated back to

  function init(shadowRoot) {
    _root = shadowRoot;

    TicketSupportState.subscribe(function (state) {
      // Sync FAB visibility on every state change
      var existFab = _root.querySelector('.ts-fab');
      if (existFab) existFab.style.display = state.widgetOpen ? 'none' : 'flex';

      // Toggle a class on the shadow-root wrapper while recording so CSS can
      // lift the side panel above the fixed bottom recording bar — keeps
      // wizard Back/Next/Submit reachable for description walkthroughs.
      // Must live on _root (inside the shadow tree); selectors against
      // document.body don't reach into shadow DOM.
      try {
        if (_root && _root.classList) {
          _root.classList.toggle('ts-recording-active', !!state.isRecording);
        }
      } catch (e) { /* defensive — _root may not be ready in odd init paths */ }

      // Full panel build/teardown only when open-state or view changes
      var needsRebuild = (
        state.widgetOpen !== _lastViewState.widgetOpen ||
        (state.widgetOpen && state.view !== _lastViewState.view)
      );

      if (needsRebuild) {
        _renderPanel(state);
        _prevPartialState = Object.assign({}, state);
      } else if (state.widgetOpen) {
        _partialUpdate(state);
      }

      // Drawer manages its own diffing
      _handleDrawer(state);
      _lastViewState = { widgetOpen: state.widgetOpen, view: state.view };
    });

    var initialState = TicketSupportState.get();
    _lastViewState = { widgetOpen: initialState.widgetOpen, view: initialState.view };
    _prevPartialState = Object.assign({}, initialState);
    _renderPanel(initialState);
    _handleDrawer(initialState);
  }

  // ─── Auto-advance wizard steps ─────────────────────
  var _autoAdvanceTimer = null;

  function _tryAutoAdvance(state) {
    var step = state.draftWizardStep || 1;
    if (_manualBackSteps[step]) return; // user manually went back here — don't auto-advance
    if (step >= 4) return; // never auto-advance Describe (4) or Evidence (5)

    var isClientWork = state.draftWorkType === 'client_work';
    var canProceed = false;

    if (step === 1) {
      canProceed = (state.draftWorkType || '') !== '';
    } else if (step === 2) {
      canProceed = (state.draftClient || '') !== '';
    } else if (step === 3) {
      canProceed = isClientWork
        ? (state.draftDepartment || '').length > 0 && (state.draftRequestType || '').length > 0
          && (state.draftDepartment === 'graphics' ? (state.draftTaskType || '').length > 0 : (state.draftCategory || '').length > 0)
          && (state.draftDepartment === 'gmb_location' ? (state.draftLocation || '').length > 0 : true)
        : (state.draftProduct || '').length > 0 && (state.draftCategory || '').length > 0;
    }

    if (canProceed) {
      if (_autoAdvanceTimer) clearTimeout(_autoAdvanceTimer);
      _autoAdvanceTimer = setTimeout(function () {
        _autoAdvanceTimer = null;
        var nextStep;
        if (step === 1 && !isClientWork) {
          nextStep = 3; // skip Assign Client (step 2) for internal
        } else {
          nextStep = step + 1;
        }
        TicketSupportState.set({ draftWizardStep: nextStep, error: null });
      }, 300);
    }
  }

  // ─── Partial DOM updates (skip full rebuild) ────────

  function _partialUpdate(state) {
    if (!_panelBody) { _prevPartialState = Object.assign({}, state); return; }

    if (state.view === 'create') {
      // Wizard step changed — full re-render
      if (state.draftWizardStep !== _prevPartialState.draftWizardStep) {
        _renderCreateView(state, _panelBody.closest('.ts-panel'));
        _prevPartialState = Object.assign({}, state);
        return;
      }

      // Re-render form when key fields change (to show/hide conditional fields + auto-advance)
      if (state.draftWorkType !== _prevPartialState.draftWorkType ||
          state.draftClient !== _prevPartialState.draftClient ||
          state.draftCategory !== _prevPartialState.draftCategory ||
          state.draftProduct !== _prevPartialState.draftProduct ||
          state.draftDepartment !== _prevPartialState.draftDepartment ||
          state.draftRequestType !== _prevPartialState.draftRequestType ||
          state.draftTaskType !== _prevPartialState.draftTaskType ||
          state.draftRecurring !== _prevPartialState.draftRecurring ||
          state.draftRecurFrequency !== _prevPartialState.draftRecurFrequency ||
          state.draftLocation !== _prevPartialState.draftLocation) {
        if (state.view === 'create') {
          _renderCreateView(state, _panelBody.closest('.ts-panel'));
          _prevPartialState = Object.assign({}, state);
          _tryAutoAdvance(state);
          return;
        }
      }

      // isRecording flipped — re-render the wizard so step-5 Submit reflects
      // the recording-disabled state (and any future per-step recording UI).
      if (state.isRecording !== _prevPartialState.isRecording) {
        _renderCreateView(state, _panelBody.closest('.ts-panel'));
        _prevPartialState = Object.assign({}, state);
        return;
      }

      // File chips / recording list — on Evidence step (5), full re-render to update Submit button state
      var attachChanged = state.pendingAttachments !== _prevPartialState.pendingAttachments;
      var recChanged = state.pendingRecordings !== _prevPartialState.pendingRecordings;
      if ((attachChanged || recChanged) && (state.draftWizardStep || 1) === 5) {
        _renderCreateView(state, _panelBody.closest('.ts-panel'));
        _prevPartialState = Object.assign({}, state);
        return;
      }
      if (attachChanged) {
        _rebuildFileChips(state.pendingAttachments, 'pendingAttachments');
      }
      if (recChanged) {
        _rebuildRecList(state.pendingRecordings, 'pendingRecordings');
      }

      // Error text
      if (state.error !== _prevPartialState.error) {
        var existingErr = _panelBody.querySelector('.ts-error-text');
        if (existingErr) existingErr.remove();
        if (state.error) {
          var form = _panelBody.querySelector('form');
          if (form) {
            var hp = form.querySelector('input[name="_hp"]');
            form.insertBefore(
              el('div', { className: 'ts-error-text', style: 'margin-bottom:8px;' }, state.error),
              hp
            );
          }
        }
      }

      // Submit button loading state
      if (state.loading !== _prevPartialState.loading && _panelFooter) {
        var submitBtn = _panelFooter.querySelector('.ts-btn-primary');
        if (submitBtn) {
          submitBtn.disabled = !!state.loading;
          var spans = submitBtn.querySelectorAll('span');
          if (spans.length >= 2) {
            spans[spans.length - 1].textContent = state.loading ? 'Submitting...' : 'Submit Ticket';
          }
        }
      }

      // Recording active indicator
      var recIndChanged = (
        state.isRecording !== _prevPartialState.isRecording ||
        state.recordingUploading !== _prevPartialState.recordingUploading ||
        state.isRecordingDrawerOpen !== _prevPartialState.isRecordingDrawerOpen
      );
      if (recIndChanged) {
        var existingInd = _panelBody.querySelector('.ts-rec-active-indicator');
        if (existingInd) existingInd.remove();
        if (state.isRecordingDrawerOpen && (state.isRecording || state.recordingUploading)) {
          var cContent = _panelBody.querySelector('.ts-collapsible-content');
          if (cContent) {
            var rBtns = cContent.querySelector('.ts-rec-buttons');
            var indicator = el('div', { className: 'ts-rec-active-indicator' }, [
              el('span', { className: 'ts-pulse-dot' }),
              el('span', {}, state.recordingUploading ? 'Uploading recording...' :
                (state.recordingDrawerMode === 'screen' ? 'Screen + Audio' : 'Audio') +
                ' recording in progress'),
            ]);
            if (rBtns && rBtns.nextSibling) cContent.insertBefore(indicator, rBtns.nextSibling);
            else if (rBtns) cContent.appendChild(indicator);
          }
        }
      }
    } else if (state.view === 'detail') {
      if (state.loading !== _prevPartialState.loading ||
          state.activeTicket !== _prevPartialState.activeTicket) {
        _renderDetailView(state);
      }
    }

    _prevPartialState = Object.assign({}, state);
  }

  function _rebuildFileChips(attachments, stateKey) {
    if (!_panelBody) return;
    var existing = _panelBody.querySelector('.ts-file-list');
    if (existing) existing.remove();
    if (attachments && attachments.length) {
      var uploadLabel = _panelBody.querySelector('.ts-file-upload-label');
      if (uploadLabel) {
        var group = uploadLabel.closest('.ts-form-group');
        if (group) {
          var fileList = el('div', { className: 'ts-file-list' });
          attachments.forEach(function (att, idx) {
            fileList.appendChild(el('span', { className: 'ts-file-chip' }, [
              el('span', {}, att.fileName),
              el('button', {
                type: 'button',
                onClick: function (e) {
                  e.stopPropagation();
                  var a = TicketSupportState.get(stateKey).slice();
                  a.splice(idx, 1);
                  var u = {}; u[stateKey] = a;
                  TicketSupportState.set(u);
                },
              }, '\u00d7'),
            ]));
          });
          group.appendChild(fileList);
        }
      }
    }
  }

  function _rebuildRecList(recordings, stateKey) {
    if (!_panelBody) return;
    var existing = _panelBody.querySelector('.ts-rec-list');
    if (existing) existing.remove();
    if (recordings && recordings.length) {
      var cContent = _panelBody.querySelector('.ts-collapsible-content');
      if (cContent) {
        var recList = el('div', { className: 'ts-rec-list' });
        recordings.forEach(function (rec, idx) {
          var isScreen = rec.type === 'screen_audio';
          recList.appendChild(el('div', { className: 'ts-rec-list-item' }, [
            el('div', { className: 'ts-rec-icon ' + (isScreen ? 'ts-screen' : 'ts-audio'), innerHTML: icon(isScreen ? 'video' : 'mic') }),
            el('div', { className: 'ts-rec-info' }, [
              el('div', { className: 'ts-rec-name' }, rec.fileName),
              el('div', { className: 'ts-rec-meta' },
                TicketSupportRecorder.formatTime(rec.durationSeconds) + ' \u00b7 ' + formatSize(rec.fileSize)),
            ]),
            el('div', { className: 'ts-rec-actions' }, [
              el('button', {
                className: 'ts-remove-btn',
                type: 'button',
                title: 'Remove',
                innerHTML: icon('trash2'),
                onClick: function () {
                  var arr = TicketSupportState.get(stateKey).slice();
                  arr.splice(idx, 1);
                  var u = {}; u[stateKey] = arr;
                  TicketSupportState.set(u);
                },
              }),
            ]),
          ]));
        });
        cContent.appendChild(recList);
      }
    }
  }

  // ─── Panel Render ───────────────────────────────────

  function _renderPanel(state) {
    // FAB
    var existingFab = _root.querySelector('.ts-fab');
    if (!existingFab) {
      var fab = el('button', {
        className: 'ts-fab',
        title: 'Support',
        innerHTML: icon('support', 24, 24),
        onClick: function () {
          var open = !TicketSupportState.get('widgetOpen');
          if (open) {
            var updates = { widgetOpen: true, view: 'create' };
            if (!TicketSupportState.get('draftRelatedUrl')) {
              updates.draftRelatedUrl = window.location.href;
            }
            TicketSupportState.set(updates);
          } else {
            TicketSupportState.set({ widgetOpen: false });
          }
        },
      });
      // Apply position offsets via inline style for reliability
      _applyFabPosition(fab);
      _root.appendChild(fab);
      existingFab = fab;
    }

    // Hide FAB when panel is open, show when closed
    existingFab.style.display = state.widgetOpen ? 'none' : 'flex';

    // Panel
    var existingPanel = _root.querySelector('.ts-panel');
    var existingBackdrop = _root.querySelector('.ts-backdrop');
    if (state.widgetOpen) {
      if (existingPanel) existingPanel.remove();
      if (existingBackdrop) existingBackdrop.remove();
      // Add backdrop
      var backdrop = el('div', {
        className: 'ts-backdrop',
        onClick: function () { _closePanel(); },
      });
      _root.appendChild(backdrop);
      _root.appendChild(_buildPanel(state));
    } else {
      if (existingPanel) existingPanel.remove();
      if (existingBackdrop) existingBackdrop.remove();
    }
  }

  /** Animated close: slide out then update state */
  function _closePanel() {
    var panel = _root.querySelector('.ts-panel');
    var backdrop = _root.querySelector('.ts-backdrop');
    if (panel) {
      panel.classList.add('ts-closing');
      if (backdrop) backdrop.style.opacity = '0';
      setTimeout(function () {
        TicketSupportState.set({ widgetOpen: false });
      }, 240);
    } else {
      TicketSupportState.set({ widgetOpen: false });
    }
  }

  function _buildPanel(state) {
    var titleText = 'Support';
    var descText = '';
    if (state.view === 'create') {
      titleText = 'Submit a Support Ticket';
      descText = 'Fill out the form below and we\'ll get back to you soon.';
    } else if (state.view === 'detail') {
      titleText = 'Ticket Details';
    }

    // Header
    var titleCol = el('div', {}, [
      el('div', { className: 'ts-panel-title' }, titleText),
    ]);
    if (descText) {
      titleCol.appendChild(el('div', { className: 'ts-panel-desc' }, descText));
    }

    var header = el('div', { className: 'ts-panel-header' }, [
      titleCol,
      el('button', {
        className: 'ts-panel-close',
        innerHTML: icon('x', 18, 18),
        onClick: function () { _closePanel(); },
      }),
    ]);

    _panelBody = el('div', { className: 'ts-panel-body' });
    _panelFooter = null;

    var panel = el('div', { className: 'ts-panel' }, [header, _panelBody]);

    // Render view
    if (state.view === 'create') _renderCreateView(state, panel);
    else if (state.view === 'detail') _renderDetailView(state);

    // Append footer if created
    if (_panelFooter) panel.appendChild(_panelFooter);

    return panel;
  }

  // ─── LIST VIEW ──────────────────────────────────────

  function _renderListView(state) {
    _panelBody.innerHTML = '';

    var tickets = state.tickets || [];
    var openCount = tickets.filter(function (t) { return t.status === 'open'; }).length;
    var awaitingCount = tickets.filter(function (t) { return t.status === 'awaiting_reply'; }).length;
    var resolvedCount = tickets.filter(function (t) { return t.status === 'resolved'; }).length;

    _panelBody.appendChild(el('div', { className: 'ts-stats' }, [
      _statCard(openCount, 'Open'),
      _statCard(awaitingCount, 'Awaiting'),
      _statCard(resolvedCount, 'Resolved'),
    ]));

    // New ticket button
    _panelBody.appendChild(el('button', {
      className: 'ts-btn ts-btn-primary ts-btn-block',
      style: 'margin-bottom:14px;',
      onClick: function () {
        TicketSupportState.resetCreateForm();
        _manualBackSteps = {};
        TicketSupportState.set({ view: 'create' });
      },
    }, [
      el('span', { innerHTML: icon('plus') }),
      el('span', {}, 'Submit a Ticket'),
    ]));

    // Filter tabs
    var filters = ['all', 'open', 'awaiting_reply', 'in_progress', 'resolved', 'closed'];
    var tabsDiv = el('div', { className: 'ts-tabs' });
    filters.forEach(function (f) {
      var label = f === 'all' ? 'All' : STATUS_LABELS[f];
      tabsDiv.appendChild(el('button', {
        className: 'ts-tab' + (state.ticketsStatusFilter === f ? ' ts-tab-active' : ''),
        onClick: function () {
          TicketSupportState.set({ ticketsStatusFilter: f, ticketsPage: 1 });
          _loadTicketList();
        },
      }, label));
    });
    _panelBody.appendChild(tabsDiv);

    if (state.loading) { _panelBody.appendChild(_spinner()); return; }

    if (!tickets.length) {
      _panelBody.appendChild(el('div', { className: 'ts-empty' }, 'No tickets found. Submit one above!'));
      return;
    }

    var filteredTickets = tickets;
    if (state.ticketsStatusFilter && state.ticketsStatusFilter !== 'all') {
      filteredTickets = tickets.filter(function (t) { return t.status === state.ticketsStatusFilter; });
    }

    filteredTickets.forEach(function (ticket) {
      _panelBody.appendChild(el('div', {
        className: 'ts-ticket-item',
        onClick: function () {
          TicketSupportState.set({ view: 'detail', loading: true });
          _loadTicketDetail(ticket.id);
        },
      }, [
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center;' }, [
          el('span', { className: 'ts-ticket-subject' }, '#' + ticket.ticketNumber + ' ' + ticket.subject),
          el('span', { className: 'ts-badge ts-badge-' + ticket.status }, STATUS_LABELS[ticket.status] || ticket.status),
        ]),
        el('div', { className: 'ts-ticket-meta' }, [
          el('span', {}, ticket.category),
          el('span', {}, formatDate(ticket.createdAt)),
          ticket.messagesCount > 1 ? el('span', {}, ticket.messagesCount + ' messages') : null,
        ]),
      ]));
    });

    // Pagination
    if (state.ticketsTotalPages > 1) {
      var pag = el('div', { className: 'ts-pagination' });
      for (var p = 1; p <= state.ticketsTotalPages; p++) {
        (function (page) {
          pag.appendChild(el('button', {
            className: 'ts-btn ts-btn-sm' + (state.ticketsPage === page ? ' ts-btn-primary' : ''),
            onClick: function () {
              TicketSupportState.set({ ticketsPage: page });
              _loadTicketList();
            },
          }, String(page)));
        })(p);
      }
      _panelBody.appendChild(pag);
    }
  }

  function _statCard(value, label) {
    return el('div', { className: 'ts-stat-card' }, [
      el('div', { className: 'ts-stat-value' }, String(value)),
      el('div', { className: 'ts-stat-label' }, label),
    ]);
  }

  function _spinner() {
    return el('div', { className: 'ts-loading' }, [
      el('div', { className: 'ts-spinner' }),
      el('span', {}, 'Loading...'),
    ]);
  }

  // ─── CREATE VIEW ────────────────────────────────────
  // Matches dashboard submit-ticket-form.tsx exactly

  function _renderCreateView(state, panel) {
    _panelBody.innerHTML = '';
    var step = state.draftWizardStep || 1;

    var form = el('form', {
      onSubmit: function (e) { e.preventDefault(); if (step === 5) _submitTicket(); },
      onPaste: function (e) {
        var items = (e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {}).items;
        if (!items) return;
        var files = [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            var f = items[i].getAsFile();
            if (f) {
              var ext = (f.type || '').split('/')[1] || 'png';
              files.push(new File([f], 'screenshot-' + Date.now() + '.' + ext, { type: f.type }));
            }
          }
        }
        if (files.length) {
          e.preventDefault();
          _handleFiles(files, 'create');
        }
      },
    });

    var ALL_WIZARD_STEPS = [
      { id: 1, label: 'Type of Work' },
      { id: 2, label: 'Assign Client' },
      { id: 3, label: 'Details' },
      { id: 4, label: 'Describe Issue' },
      { id: 5, label: 'Attach Evidence' },
    ];
    var isClientWork = state.draftWorkType === 'client_work';
    var WIZARD_STEPS = isClientWork
      ? ALL_WIZARD_STEPS
      : ALL_WIZARD_STEPS.filter(function (s) { return s.id !== 2; });

    // Error
    if (state.error) {
      form.appendChild(el('div', { className: 'ts-error-text', style: 'margin-bottom:8px;' }, state.error));
    }

    // ── Step 5: Attach Evidence (final step before submit) ──
    if (step === 5) {
      form.appendChild(el('div', { className: 'ts-wizard-hint' }, 'Record your screen or audio, then submit. You can also paste or attach screenshots.'));

      // Drop zone / file upload
      var fileInput = el('input', {
        type: 'file', multiple: 'multiple',
        accept: TicketSupportUploader.ALLOWED_FILE_TYPES.join(','),
        style: 'display:none;',
        onChange: function (e) { _handleFiles(e.target.files, 'create'); },
      });
      var dropZone = el('label', { className: 'ts-drop-zone' }, [
        el('span', { innerHTML: icon('upload', 32, 32) }),
        el('span', { className: 'ts-drop-zone-text' }, 'Click to attach or drag & drop files'),
        el('span', { className: 'ts-drop-zone-hint' }, 'Images, PDF, text files. Max 10MB each, 5 files.'),
        fileInput,
      ]);
      form.appendChild(dropZone);

      // Pending attachments — info line + thumbnail grid
      if (state.pendingAttachments.length) {
        var totalSize = 0;
        state.pendingAttachments.forEach(function (a) { totalSize += (a.fileSize || 0); });
        var sizeLabel = totalSize < 1024 ? totalSize + ' B' : totalSize < 1048576 ? Math.round(totalSize / 1024) + ' KB' : (totalSize / 1048576).toFixed(1) + ' MB';
        form.appendChild(el('div', { className: 'ts-att-info' }, state.pendingAttachments.length + '/5 attached (' + sizeLabel + ')'));

        var grid = el('div', { className: 'ts-att-grid' });
        state.pendingAttachments.forEach(function (att, idx) {
          var removeBtn = el('button', {
            type: 'button', className: 'ts-att-remove',
            onClick: function (e) {
              e.stopPropagation();
              if (att.previewUrl) { try { URL.revokeObjectURL(att.previewUrl); } catch(e2) {} }
              var a = TicketSupportState.get('pendingAttachments').slice();
              a.splice(idx, 1);
              TicketSupportState.set({ pendingAttachments: a });
            },
          }, '\u00d7');

          if (att.previewUrl) {
            var thumb = el('div', { className: 'ts-att-thumb' }, [
              el('img', { src: att.previewUrl, alt: att.fileName }),
              el('div', { className: 'ts-att-thumb-name' }, att.fileName),
              removeBtn,
            ]);
            grid.appendChild(thumb);
          } else {
            grid.appendChild(el('span', { className: 'ts-file-chip' }, [
              el('span', {}, att.fileName),
              removeBtn,
            ]));
          }
        });
        form.appendChild(grid);
      }

      // Recording Controls (Collapsible)
      if (TicketSupportRecorder.isSupported()) {
        form.appendChild(_buildRecordingSection('create', state));
      }
    }

    // ── Step 1: Type of Work ──
    if (step === 1) {
      form.appendChild(el('div', { className: 'ts-wizard-hint' }, 'What type of work is this ticket for?'));

      var cardsWrap = el('div', { className: 'ts-worktype-cards' });
      var workTypes = [
        { value: 'client_work', label: 'Client Work', hint: 'Work for a client site or project', iconName: 'building2' },
        { value: 'sgen_internal', label: 'SGEN Internal', hint: 'Internal tools and products', iconName: 'cog' },
      ];
      workTypes.forEach(function (wt) {
        var card = el('button', {
          type: 'button',
          className: 'ts-worktype-card' + (state.draftWorkType === wt.value ? ' ts-worktype-active' : ''),
          onClick: function () {
            TicketSupportState.set({
              draftWorkType: wt.value,
              draftProduct: '',
              draftDepartment: '',
              draftTaskType: '',
              draftCategory: '',
              draftRequestType: '',
              draftClientConfirmed: null,
              draftClient: '',
              draftClientName: '',
            });
          },
        }, [
          el('span', { className: 'ts-worktype-card-icon', innerHTML: icon(wt.iconName, 32, 32) }),
          el('span', { className: 'ts-worktype-card-label' }, wt.label),
          el('span', { className: 'ts-worktype-card-hint' }, wt.hint),
        ]);
        cardsWrap.appendChild(card);
      });
      form.appendChild(cardsWrap);
    }

    // ── Step 2: Assign Client (client_work only) ──
    if (step === 2 && isClientWork) {
      form.appendChild(el('div', { style: 'font-size:14px;font-weight:500;color:hsl(40,5%,85%);margin-bottom:12px;' }, 'Select the client for this work'));

      {
        var clientWrapper = el('div', { style: 'display:flex;flex-direction:column;gap:8px;' });

        // ── Searchable dropdown (single component) ──
        var _bizItems = [];
        var _bizDropdownOpen = false;

        var bizContainer = el('div', { style: 'position:relative;' });

        // Trigger button
        var bizTrigger = el('button', {
          type: 'button',
          style: 'display:flex;align-items:center;justify-content:space-between;width:100%;height:44px;padding:0 12px;border-radius:8px;border:1px solid hsl(40,5%,25%);background:hsl(40,3%,12%);color:' + (state.draftClientName ? 'hsl(40,5%,85%)' : 'hsl(40,5%,45%)') + ';font-size:14px;cursor:pointer;text-align:left;',
          onClick: function () {
            _bizDropdownOpen = !_bizDropdownOpen;
            bizPanel.style.display = _bizDropdownOpen ? '' : 'none';
            if (_bizDropdownOpen) {
              bizSearchInput.value = '';
              _fetchBizOptions('');
              setTimeout(function () { bizSearchInput.focus(); }, 0);
            }
          },
        });

        var bizTriggerLabel = el('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;' }, state.draftClientName || 'Select a client');
        bizTrigger.appendChild(bizTriggerLabel);

        var bizTriggerIcons = el('div', { style: 'display:flex;align-items:center;gap:4px;margin-left:8px;flex-shrink:0;' });

        // Clear button (only shown when value selected)
        var bizClearBtn = el('span', {
          role: 'button',
          tabIndex: -1,
          style: 'padding:2px;border-radius:4px;cursor:pointer;display:' + (state.draftClient ? 'flex' : 'none') + ';',
          onClick: function (e) {
            e.stopPropagation();
            TicketSupportState.setSilent({ draftClient: '', draftClientName: '' });
            bizTriggerLabel.textContent = 'Select a client';
            bizTrigger.style.color = 'hsl(40,5%,45%)';
            bizClearBtn.style.display = 'none';
            // Update Next button
            var panel = _panelBody ? _panelBody.closest('.ts-panel') : null;
            if (panel) {
              var nextBtn = panel.querySelector('.ts-panel-footer .ts-btn-primary');
              if (nextBtn) nextBtn.disabled = true;
            }
          },
        });
        bizClearBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        bizTriggerIcons.appendChild(bizClearBtn);

        // Chevron
        var bizChevron = el('span', { style: 'display:flex;transition:transform 0.2s;' });
        bizChevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';
        bizTriggerIcons.appendChild(bizChevron);
        bizTrigger.appendChild(bizTriggerIcons);

        bizContainer.appendChild(bizTrigger);

        // Dropdown panel
        var bizPanel = el('div', {
          style: 'display:none;position:absolute;z-index:50;margin-top:4px;width:100%;border-radius:8px;border:1px solid hsl(40,5%,25%);background:hsl(40,3%,10%);box-shadow:0 8px 24px rgba(0,0,0,.4);overflow:hidden;',
        });

        // Search input inside dropdown
        var bizSearchWrap = el('div', { style: 'padding:8px;border-bottom:1px solid hsl(40,5%,20%);' });
        var bizSearchInner = el('div', { style: 'position:relative;' });
        var bizSearchIcon = el('span', { style: 'position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;' });
        bizSearchIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        bizSearchInner.appendChild(bizSearchIcon);

        var bizSearchInput = el('input', {
          type: 'text',
          className: 'ts-input',
          placeholder: 'Search clients...',
          style: 'padding-left:32px;height:36px;font-size:13px;',
          onInput: function (e) {
            var val = e.target.value;
            if (bizSearchInput._debounce) clearTimeout(bizSearchInput._debounce);
            bizSearchInput._debounce = setTimeout(function () {
              _fetchBizOptions(val);
            }, 300);
          },
        });
        bizSearchInner.appendChild(bizSearchInput);
        bizSearchWrap.appendChild(bizSearchInner);
        bizPanel.appendChild(bizSearchWrap);

        // Options list
        var bizOptionsList = el('div', { style: 'max-height:200px;overflow-y:auto;padding:4px;' });
        bizPanel.appendChild(bizOptionsList);

        bizContainer.appendChild(bizPanel);

        // Close on outside click (use composedPath for Shadow DOM compatibility)
        document.addEventListener('mousedown', function (e) {
          var path = e.composedPath ? e.composedPath() : [];
          if (bizContainer.contains(e.target) || path.indexOf(bizContainer) !== -1) return;
          if (_bizDropdownOpen) {
            _bizDropdownOpen = false;
            bizPanel.style.display = 'none';
            bizChevron.style.transform = '';
          }
        });

        // Fetch businesses from API and render options
        function _fetchBizOptions(search) {
          bizOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:hsl(40,5%,55%);">Loading...</div>';
          TicketSupportAPI.listBusinesses(search || '').then(function (res) {
            _bizItems = res.data || [];
            _renderBizOptions();
          }).catch(function (err) {
            _bizItems = [];
            if (err && err.status === 403) {
              bizOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:#ef4444;">Authentication error \u2013 widget token may be missing or expired.</div>';
            } else {
              _renderBizOptions();
            }
          });
        }

        function _renderBizOptions() {
          bizOptionsList.innerHTML = '';
          var currentVal = TicketSupportState.get('draftClient');
          if (_bizItems.length === 0) {
            bizOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:hsl(40,5%,55%);">No results found</div>';
            return;
          }
          _bizItems.forEach(function (b) {
            var isSelected = String(b.id) === currentVal;
            var optBtn = el('button', {
              type: 'button',
              style: 'display:block;width:100%;text-align:left;padding:8px 12px;border-radius:6px;font-size:13px;border:none;cursor:pointer;'
                + 'color:' + (isSelected ? '#dc2626' : 'hsl(40,5%,85%)') + ';'
                + 'background:' + (isSelected ? 'rgba(220,38,38,.08)' : 'transparent') + ';'
                + 'font-weight:' + (isSelected ? '600' : '400') + ';',
              onClick: function () {
                _bizDropdownOpen = false;
                bizPanel.style.display = 'none';
                TicketSupportState.set({ draftClient: String(b.id), draftClientName: b.business_name, draftClientCompanyId: b.company_id ? String(b.company_id) : '' });
              },
              onMouseEnter: function (e) { if (!isSelected) e.currentTarget.style.background = 'hsl(40,3%,15%)'; },
              onMouseLeave: function (e) { if (!isSelected) e.currentTarget.style.background = 'transparent'; },
            }, b.business_name);
            bizOptionsList.appendChild(optBtn);
          });
        }

        // Initial load
        _fetchBizOptions('');

        clientWrapper.appendChild(bizContainer);
        form.appendChild(_formGroup('Select Client', true, false, clientWrapper));
      }
    }

    // ── Step 3: Details (Department/Product + Category) ──
    if (step === 3) {
      form.appendChild(el('div', { className: 'ts-wizard-hint' }, isClientWork
        ? 'Select a department, category, and request type to continue.'
        : 'Select a product to continue.'));
      if (isClientWork) {
        // Request Type buttons (card-style, like Step 2)
        form.appendChild(el('div', { className: 'ts-wizard-hint', style: 'margin-top:8px;' }, 'What type of request is this? *'));
        var reqCardsWrap = el('div', { className: 'ts-worktype-cards' });
        [
          { value: 'client_request', label: 'New request from client', iconName: 'messageSquare' },
          { value: 'account_manager_task', label: 'New Task from account manager', iconName: 'clipboardList' },
        ].forEach(function (rt) {
          reqCardsWrap.appendChild(el('button', {
            type: 'button',
            className: 'ts-worktype-card' + (state.draftRequestType === rt.value ? ' ts-worktype-active' : ''),
            onClick: function () {
              TicketSupportState.set({ draftRequestType: rt.value });
            },
          }, [
            el('span', { className: 'ts-worktype-card-icon', innerHTML: icon(rt.iconName, 32, 32) }),
            el('span', { className: 'ts-worktype-card-label' }, rt.label),
          ]));
        });
        form.appendChild(reqCardsWrap);

        // Department
        var deptSelect = el('select', {
          className: 'ts-select',
          onChange: function (e) {
            TicketSupportState.set({ draftDepartment: e.target.value, draftTaskType: '', draftCategory: '', draftLocation: '', draftLocationName: '' });
          },
        });
        [{ value: '', label: 'Select a department' }, { value: 'webdev', label: 'WebDev' }, { value: 'graphics', label: 'Graphics' }, { value: 'ads', label: 'Ads' }, { value: 'outreach', label: 'Outreach' }, { value: 'gmb_location', label: 'GMB / Location' }].forEach(function (d) {
          var opt = el('option', { value: d.value }, d.label);
          if (d.value === state.draftDepartment) opt.selected = true;
          deptSelect.appendChild(opt);
        });
        form.appendChild(_formGroup('Department', true, false, deptSelect));

        // Per-department conditional fields
        if (state.draftDepartment === 'graphics') {
          var taskTypeSelect = el('select', {
            className: 'ts-select',
            onChange: function (e) {
              TicketSupportState.set({ draftTaskType: e.target.value });
            },
          });
          [{ value: '', label: 'Select a task type' },
           { value: 'brand', label: 'Brand' },
           { value: 'website', label: 'Website' },
           { value: 'outreach', label: 'Outreach' }].forEach(function (t) {
            var opt = el('option', { value: t.value }, t.label);
            if (t.value === state.draftTaskType) opt.selected = true;
            taskTypeSelect.appendChild(opt);
          });
          form.appendChild(_formGroup('Task Type', true, false, taskTypeSelect));
        }

        if (state.draftDepartment === 'webdev' || state.draftDepartment === 'ads') {
          var catSelect = el('select', {
            className: 'ts-select',
            onChange: function (e) {
              TicketSupportState.set({ draftCategory: e.target.value });
            },
          });
          [{ value: '', label: 'Select a category' },
           { value: 'bug', label: 'Bug / Glitch' },
           { value: 'improvement', label: 'Improvement' },
           { value: 'idea', label: 'Idea / Suggestion' },
           { value: 'on_page', label: 'On Page' },
           { value: 'emergency', label: 'Emergency' }].forEach(function (c) {
            var opt = el('option', { value: c.value }, c.label);
            if (c.value === state.draftCategory) opt.selected = true;
            catSelect.appendChild(opt);
          });
          form.appendChild(_formGroup('Category', true, false, catSelect));
        }

        if (state.draftDepartment === 'outreach') {
          var catSelectOR = el('select', {
            className: 'ts-select',
            onChange: function (e) {
              TicketSupportState.set({ draftCategory: e.target.value });
            },
          });
          [{ value: '', label: 'Select a category' },
           { value: 'campaign', label: 'Campaign' },
           { value: 'idea', label: 'Idea / Suggestion' },
           { value: 'on_page', label: 'On Page' },
           { value: 'emergency', label: 'Emergency' }].forEach(function (c) {
            var opt = el('option', { value: c.value }, c.label);
            if (c.value === state.draftCategory) opt.selected = true;
            catSelectOR.appendChild(opt);
          });
          form.appendChild(_formGroup('Category', true, false, catSelectOR));
        }

        if (state.draftDepartment === 'gmb_location') {
          // Category
          var catSelectGMB = el('select', {
            className: 'ts-select',
            onChange: function (e) {
              TicketSupportState.set({ draftCategory: e.target.value });
            },
          });
          [{ value: '', label: 'Select a category' },
           { value: 'on_page', label: 'On Page' },
           { value: 'idea', label: 'Idea / Suggestion' },
           { value: 'emergency', label: 'Emergency' }].forEach(function (c) {
            var opt = el('option', { value: c.value }, c.label);
            if (c.value === state.draftCategory) opt.selected = true;
            catSelectGMB.appendChild(opt);
          });
          form.appendChild(_formGroup('Category', true, false, catSelectGMB));

          // Location searchable dropdown
          var _locItems = [];
          var _locDropdownOpen = false;

          var locContainer = el('div', { style: 'position:relative;' });

          // Trigger button
          var locTrigger = el('button', {
            type: 'button',
            style: 'display:flex;align-items:center;justify-content:space-between;width:100%;height:44px;padding:0 12px;border-radius:8px;border:1px solid hsl(40,5%,25%);background:hsl(40,3%,12%);color:' + (state.draftLocationName ? 'hsl(40,5%,85%)' : 'hsl(40,5%,45%)') + ';font-size:14px;cursor:pointer;text-align:left;',
            onClick: function () {
              _locDropdownOpen = !_locDropdownOpen;
              locPanel.style.display = _locDropdownOpen ? '' : 'none';
              if (_locDropdownOpen) {
                locSearchInput.value = '';
                _fetchLocOptions('');
                setTimeout(function () { locSearchInput.focus(); }, 0);
              }
            },
          });

          var locTriggerLabel = el('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;' }, state.draftLocationName || 'Select a location');
          locTrigger.appendChild(locTriggerLabel);

          var locTriggerIcons = el('div', { style: 'display:flex;align-items:center;gap:4px;margin-left:8px;flex-shrink:0;' });

          // Clear button
          var locClearBtn = el('span', {
            role: 'button',
            tabIndex: -1,
            style: 'padding:2px;border-radius:4px;cursor:pointer;display:' + (state.draftLocation ? 'flex' : 'none') + ';',
            onClick: function (e) {
              e.stopPropagation();
              TicketSupportState.set({ draftLocation: '', draftLocationName: '' });
            },
          });
          locClearBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          locTriggerIcons.appendChild(locClearBtn);

          var locChevron = el('span', { style: 'display:flex;transition:transform 0.2s;' });
          locChevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';
          locTriggerIcons.appendChild(locChevron);
          locTrigger.appendChild(locTriggerIcons);

          locContainer.appendChild(locTrigger);

          // Dropdown panel
          var locPanel = el('div', {
            style: 'display:none;position:absolute;z-index:50;margin-top:4px;width:100%;border-radius:8px;border:1px solid hsl(40,5%,25%);background:hsl(40,3%,10%);box-shadow:0 8px 24px rgba(0,0,0,.4);overflow:hidden;',
          });

          // Search input
          var locSearchWrap = el('div', { style: 'padding:8px;border-bottom:1px solid hsl(40,5%,20%);' });
          var locSearchInner = el('div', { style: 'position:relative;' });
          var locSearchIconEl = el('span', { style: 'position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;' });
          locSearchIconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(40,5%,55%)" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
          locSearchInner.appendChild(locSearchIconEl);

          var locSearchInput = el('input', {
            type: 'text',
            className: 'ts-input',
            placeholder: 'Search locations...',
            style: 'padding-left:32px;height:36px;font-size:13px;',
            onInput: function (e) {
              var val = e.target.value;
              if (locSearchInput._debounce) clearTimeout(locSearchInput._debounce);
              locSearchInput._debounce = setTimeout(function () {
                _fetchLocOptions(val);
              }, 300);
            },
          });
          locSearchInner.appendChild(locSearchInput);
          locSearchWrap.appendChild(locSearchInner);
          locPanel.appendChild(locSearchWrap);

          // Options list
          var locOptionsList = el('div', { style: 'max-height:200px;overflow-y:auto;padding:4px;' });
          locPanel.appendChild(locOptionsList);

          locContainer.appendChild(locPanel);

          // Close on outside click
          document.addEventListener('mousedown', function (e) {
            var path = e.composedPath ? e.composedPath() : [];
            if (locContainer.contains(e.target) || path.indexOf(locContainer) !== -1) return;
            if (_locDropdownOpen) {
              _locDropdownOpen = false;
              locPanel.style.display = 'none';
            }
          });

          var _locCompanyId = state.draftClientCompanyId || '';

          function _fetchLocOptions(search) {
            locOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:hsl(40,5%,55%);">Loading...</div>';
            if (!_locCompanyId) {
              locOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:hsl(40,5%,55%);">Select a client first</div>';
              return;
            }
            TicketSupportAPI.listLocations(_locCompanyId, search || '').then(function (json) {
              _locItems = json.data || [];
              _renderLocOptions();
            }).catch(function () {
              _locItems = [];
              _renderLocOptions();
            });
          }

          function _renderLocOptions() {
            locOptionsList.innerHTML = '';
            var currentVal = TicketSupportState.get('draftLocation');
            if (_locItems.length === 0) {
              locOptionsList.innerHTML = '<div style="padding:16px 12px;text-align:center;font-size:13px;color:hsl(40,5%,55%);">No locations found</div>';
              return;
            }
            _locItems.forEach(function (loc) {
              var isSelected = String(loc.id) === currentVal;
              var optBtn = el('button', {
                type: 'button',
                style: 'display:flex;flex-direction:column;align-items:flex-start;width:100%;text-align:left;padding:8px 12px;border-radius:6px;font-size:13px;border:none;cursor:pointer;'
                  + 'color:' + (isSelected ? '#dc2626' : 'hsl(40,5%,85%)') + ';'
                  + 'background:' + (isSelected ? 'rgba(220,38,38,.08)' : 'transparent') + ';'
                  + 'font-weight:' + (isSelected ? '600' : '400') + ';',
                onClick: function () {
                  _locDropdownOpen = false;
                  locPanel.style.display = 'none';
                  TicketSupportState.set({ draftLocation: String(loc.id), draftLocationName: loc.name });
                },
                onMouseEnter: function (e) { if (!isSelected) e.currentTarget.style.background = 'hsl(40,3%,15%)'; },
                onMouseLeave: function (e) { if (!isSelected) e.currentTarget.style.background = 'transparent'; },
              }, [
                el('span', {}, loc.name),
                loc.address ? el('span', { style: 'font-size:11px;color:hsl(40,5%,55%);font-weight:400;' }, loc.address) : null,
              ]);
              locOptionsList.appendChild(optBtn);
            });
          }

          _fetchLocOptions('');

          form.appendChild(_formGroup('Location', true, false, locContainer));
        }
      } else {
        // Product (SGEN Internal)
        var prodSelect = el('select', {
          className: 'ts-select',
          onChange: function (e) {
            TicketSupportState.set({ draftProduct: e.target.value });
          },
        });
        [{ value: '', label: 'Select a product' }, { value: 'sg-admin', label: 'SG-Admin' },
         { value: 'sg-builder', label: 'SG-Builder' }, { value: 'sg-dashboard', label: 'SG-Dashboard' },
         { value: 'sg-support', label: 'SG-Support' }, { value: 'automation', label: 'Automation' }].forEach(function (p) {
          var opt = el('option', { value: p.value }, p.label);
          if (p.value === state.draftProduct) opt.selected = true;
          prodSelect.appendChild(opt);
        });
        form.appendChild(_formGroup('Product', true, false, prodSelect));

        // Category (no Emergency for internal)
        var catSelect2 = el('select', {
          className: 'ts-select',
          onChange: function (e) { TicketSupportState.set({ draftCategory: e.target.value }); },
        });
        [{ slug: '', name: 'Select a category' }, { slug: 'bug', name: 'Bug / Glitch' }, { slug: 'improvement', name: 'Improvement' },
         { slug: 'idea', name: 'Idea / Suggestion' }].forEach(function (c) {
          var opt = el('option', { value: c.slug }, c.name);
          if (c.slug === state.draftCategory) opt.selected = true;
          catSelect2.appendChild(opt);
        });
        form.appendChild(_formGroup('Category', true, false, catSelect2));
      }
    }

    // ── Step 4: Describe Issue (Subject + Priority + Description + URLs + Dates) ──
    if (step === 4) {
      form.appendChild(el('div', { className: 'ts-wizard-hint' }, 'Describe your issue. Bold, italic, links, and ordered lists are supported.'));
      // Helper: update Next button disabled state based on current input values
      function _updateDescribeNext() {
        var subj = (TicketSupportState.get('draftSubject') || '').trim();
        var desc = (TicketSupportState.get('draftDescription') || '').trim();
        var sd = TicketSupportState.get('draftStartDate') || '';
        var ed = TicketSupportState.get('draftEndDate') || '';
        var datesOk = !(sd && ed) || (sd <= ed);
        var canProceed = subj.length > 0 && desc.length >= 10 && datesOk;
        var panel = _panelBody ? _panelBody.closest('.ts-panel') : null;
        if (panel) {
          var nextBtn = panel.querySelector('.ts-panel-footer .ts-btn-primary');
          if (nextBtn) nextBtn.disabled = !canProceed;
        }
      }

      // Subject
      form.appendChild(_formGroup(
        'Subject', true, false,
        el('input', {
          className: 'ts-input', type: 'text',
          placeholder: 'Brief summary of your issue',
          maxLength: '200', required: 'required',
          value: state.draftSubject || '',
          onInput: function (e) {
            TicketSupportState.setSilent({ draftSubject: e.target.value });
            _updateDescribeNext();
          },
        })
      ));

      // Priority
      var priSelect = el('select', {
        className: 'ts-select',
        onChange: function (e) { TicketSupportState.setSilent({ draftPriority: e.target.value }); },
      });
      [{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' },
       { value: 'expedited', label: 'Expedited' }, { value: 'red_alert', label: 'RED ALERT' }].forEach(function (p) {
        var opt = el('option', { value: p.value }, p.label);
        if (p.value === state.draftPriority) opt.selected = true;
        priSelect.appendChild(opt);
      });
      form.appendChild(_formGroup('Priority', true, false, priSelect));

      // Description (markdown editor: toolbar + textarea + smart Enter for ordered lists)
      form.appendChild(_formGroup(
        'Description', true, false,
        _buildMarkdownEditor(state, _updateDescribeNext)
      ));

      // Related URLs (multi)
      form.appendChild(_formGroup(
        'Related URLs', false, true,
        _buildUrlList(state)
      ));

      // Dates (start + end, both optional)
      var dateRow = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px;' }, [
        _formGroup(
          'Start Date', false, true,
          el('input', {
            className: 'ts-input', type: 'date',
            value: state.draftStartDate || '',
            onInput: function (e) {
              TicketSupportState.setSilent({ draftStartDate: e.target.value });
              _updateDescribeNext();
            },
          })
        ),
        _formGroup(
          'End Date', false, true,
          el('input', {
            className: 'ts-input', type: 'date',
            value: state.draftEndDate || '',
            onInput: function (e) {
              TicketSupportState.setSilent({ draftEndDate: e.target.value });
              _updateDescribeNext();
            },
          })
        ),
      ]);
      form.appendChild(dateRow);

      // ── Recurring schedule (optional) ──
      // When ticked, the backend persists a RecurringTask instead of a one-off
      // ticket; a cron sweep (plus an immediate first fire) spawns the ClickUp
      // tasks. Start / End dates above bound the recurrence window.
      var recurWrap = el('div', { style: 'margin-top:4px;' });
      var recurToggleRow = el('label', {
        style: 'display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;margin-bottom:4px;',
      }, [
        el('input', {
          type: 'checkbox',
          checked: state.draftRecurring ? 'checked' : undefined,
          onChange: function (e) { TicketSupportState.set({ draftRecurring: e.target.checked }); },
        }),
        el('span', {}, 'Make this a recurring task'),
      ]);
      recurWrap.appendChild(recurToggleRow);

      if (state.draftRecurring) {
        var freqSelect = el('select', {
          className: 'ts-select',
          onChange: function (e) { TicketSupportState.set({ draftRecurFrequency: e.target.value }); },
        });
        [{ v: 'daily', l: 'Daily' }, { v: 'weekly', l: 'Weekly' }, { v: 'monthly', l: 'Monthly' }].forEach(function (o) {
          var opt = el('option', { value: o.v }, o.l);
          if (o.v === state.draftRecurFrequency) opt.selected = true;
          freqSelect.appendChild(opt);
        });

        var intervalInput = el('input', {
          className: 'ts-input', type: 'number', min: '1', max: '365',
          value: state.draftRecurInterval || '1',
          onInput: function (e) { TicketSupportState.setSilent({ draftRecurInterval: e.target.value }); },
        });

        recurWrap.appendChild(el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px;' }, [
          _formGroup('Frequency', true, false, freqSelect),
          _formGroup('Every (N)', true, false, intervalInput),
        ]));

        if (state.draftRecurFrequency === 'weekly') {
          var wdSelect = el('select', {
            className: 'ts-select',
            onChange: function (e) { TicketSupportState.setSilent({ draftRecurWeekday: e.target.value }); },
          });
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(function (name, i) {
            var opt = el('option', { value: String(i) }, name);
            if (String(i) === String(state.draftRecurWeekday)) opt.selected = true;
            wdSelect.appendChild(opt);
          });
          recurWrap.appendChild(_formGroup('On weekday', true, false, wdSelect));
        }
        if (state.draftRecurFrequency === 'monthly') {
          recurWrap.appendChild(_formGroup(
            'On day of month (1-31, clamped to month length)', true, false,
            el('input', {
              className: 'ts-input', type: 'number', min: '1', max: '31',
              value: state.draftRecurMonthDay || '1',
              onInput: function (e) { TicketSupportState.setSilent({ draftRecurMonthDay: e.target.value }); },
            })
          ));
        }
        recurWrap.appendChild(_formGroup(
          'Time of day (UTC)', true, false,
          el('input', {
            className: 'ts-input', type: 'time',
            value: state.draftRecurTime || '09:00',
            onInput: function (e) { TicketSupportState.setSilent({ draftRecurTime: e.target.value }); },
          })
        ));
        recurWrap.appendChild(el('div', { className: 'ts-wizard-hint' },
          'The first task is created immediately; the rest follow the schedule. Start / End dates above bound the recurrence.'));
      }
      form.appendChild(recurWrap);
    }

    // Honeypot
    form.appendChild(el('input', {
      type: 'text', name: '_hp', style: 'display:none;', tabindex: '-1', autocomplete: 'off',
    }));

    _panelBody.appendChild(form);

    // ── Footer (dots + wizard navigation) ──
    var currentLabel = '';
    WIZARD_STEPS.forEach(function (ws) { if (ws.id === step) currentLabel = ws.label; });
    var dotsRow = el('div', { className: 'ts-wizard-dots' });
    WIZARD_STEPS.forEach(function (ws) {
      dotsRow.appendChild(el('div', { className: 'ts-wizard-dot' + (ws.id === step ? ' ts-dot-current' : '') }));
    });
    var dotsWrap = el('div', { className: 'ts-wizard-dots-wrap' }, [
      el('div', { className: 'ts-wizard-dots-label' }, currentLabel),
      dotsRow,
    ]);
    // ── Validation ──
    var canProceedStep1 = (state.draftWorkType || '') !== '';
    var canProceedStep2 = (state.draftClient || '') !== '';
    var canProceedStep3 = isClientWork
      ? (state.draftDepartment || '').length > 0 && (state.draftRequestType || '').length > 0
        && (state.draftDepartment === 'graphics' ? (state.draftTaskType || '').length > 0 : (state.draftCategory || '').length > 0)
      : (state.draftProduct || '').length > 0 && (state.draftCategory || '').length > 0;
    var subj = (state.draftSubject || '').trim();
    var desc = (state.draftDescription || '').trim();
    var sd = state.draftStartDate || '';
    var ed = state.draftEndDate || '';
    var datesOk = !(sd && ed) || (sd <= ed);
    var canProceedStep4 = subj.length > 0 && desc.length >= 10 && datesOk;
    var canProceedStep5 = (state.pendingRecordings || []).length > 0;

    var canProceed =
      step === 1 ? canProceedStep1 :
      step === 2 ? canProceedStep2 :
      step === 3 ? canProceedStep3 :
      step === 4 ? canProceedStep4 :
      step === 5 ? canProceedStep5 : false;

    // Navigation helpers
    function _goNext() {
      if (step === 1 && !isClientWork) {
        TicketSupportState.set({ draftWizardStep: 3, error: null });
      } else if (step < 5) {
        TicketSupportState.set({ draftWizardStep: step + 1, error: null });
      }
    }
    function _goBack() {
      var targetStep;
      if (step === 3 && !isClientWork) {
        targetStep = 1;
      } else if (step > 1) {
        targetStep = step - 1;
      }
      if (targetStep != null) {
        _manualBackSteps[targetStep] = true;
        TicketSupportState.set({ draftWizardStep: targetStep, error: null });
      }
    }

    var leftBtn, rightBtn;

    if (step === 1) {
      leftBtn = el('button', {
        className: 'ts-btn', type: 'button',
        onClick: function () { TicketSupportState.resetCreateForm(); _manualBackSteps = {}; _closePanel(); },
      }, 'Cancel');
      rightBtn = el('button', {
        className: 'ts-btn ts-btn-primary', type: 'button',
        disabled: !canProceed ? 'disabled' : null,
        onClick: _goNext,
      }, [
        el('span', {}, 'Next'),
        el('span', { innerHTML: icon('arrowRight', 14, 14) }),
      ]);
    } else if (step === 5) {
      leftBtn = el('button', {
        className: 'ts-btn', type: 'button',
        onClick: _goBack,
      }, [
        el('span', { innerHTML: icon('arrowLeft', 14, 14) }),
        el('span', {}, 'Back'),
      ]);
      // Submit is locked while a recording is in progress — the user must
      // stop the recording before submitting so the saved file is finalized.
      var submitDisabled = !canProceed || state.loading || state.isRecording;
      var submitLabel = state.loading
        ? 'Submitting...'
        : state.isRecording
          ? 'Stop recording to submit'
          : 'Submit Ticket';
      rightBtn = el('button', {
        className: 'ts-btn ts-btn-primary', type: 'button',
        disabled: submitDisabled ? 'disabled' : null,
        onClick: function () { _submitTicket(); },
      }, [
        el('span', { innerHTML: icon('send') }),
        el('span', {}, submitLabel),
      ]);
    } else {
      leftBtn = el('button', {
        className: 'ts-btn', type: 'button',
        onClick: _goBack,
      }, [
        el('span', { innerHTML: icon('arrowLeft', 14, 14) }),
        el('span', {}, 'Back'),
      ]);
      rightBtn = el('button', {
        className: 'ts-btn ts-btn-primary', type: 'button',
        disabled: !canProceed ? 'disabled' : null,
        onClick: _goNext,
      }, [
        el('span', {}, 'Next'),
        el('span', { innerHTML: icon('arrowRight', 14, 14) }),
      ]);
    }

    var navRow = el('div', { className: 'ts-wizard-nav' }, [leftBtn, rightBtn]);
    var newFooter = el('div', { className: 'ts-panel-footer ts-wizard-footer' }, [dotsWrap, navRow]);

    // If panel already exists in DOM (partial update), swap the footer in-place
    var panelEl = _panelBody ? _panelBody.closest('.ts-panel') : null;
    if (panelEl && _panelFooter && _panelFooter.parentNode) {
      _panelFooter.parentNode.replaceChild(newFooter, _panelFooter);
    } else if (panelEl) {
      // Footer didn't exist yet in DOM — append it
      panelEl.appendChild(newFooter);
    }
    _panelFooter = newFooter;
  }

  function _formGroup(labelText, required, optional, inputEl) {
    var grp = el('div', { className: 'ts-form-group' });
    var lbl = el('label', { className: 'ts-label' });
    lbl.appendChild(document.createTextNode(labelText));
    if (required) lbl.appendChild(el('span', { className: 'ts-required' }, ' *'));
    if (optional) lbl.appendChild(el('span', { className: 'ts-optional' }, ' (optional)'));
    grp.appendChild(lbl);
    grp.appendChild(inputEl);
    return grp;
  }

  // ─── MARKDOWN EDITOR (toolbar + textarea, emits markdown) ──────────────
  // Lightweight editor: wraps selection with markdown syntax + smart Enter
  // for ordered lists with auto-renumber on insert.
  function _buildMarkdownEditor(state, onChange) {
    var wrapper = el('div', { className: 'ts-md-editor' });

    // Toolbar
    var toolbar = el('div', { className: 'ts-md-toolbar' });
    function _btn(label, title, handler) {
      return el('button', {
        type: 'button', className: 'ts-md-btn', title: title,
        onMouseDown: function (e) { e.preventDefault(); }, // keep textarea focus
        onClick: function (e) { e.preventDefault(); handler(); },
      }, label);
    }

    var textarea = el('textarea', {
      className: 'ts-textarea ts-md-textarea',
      placeholder: 'Describe your issue in detail (minimum 10 characters)...\n\nUse the toolbar for **bold**, *italic*, [links](url), and lists.',
      required: 'required',
      onInput: function () {
        TicketSupportState.setSilent({ draftDescription: textarea.value });
        if (onChange) onChange();
      },
    }, state.draftDescription || '');

    function _commit(newValue, cursorStart, cursorEnd) {
      textarea.value = newValue;
      TicketSupportState.setSilent({ draftDescription: newValue });
      if (typeof cursorStart === 'number') {
        var cs = cursorStart;
        var ce = typeof cursorEnd === 'number' ? cursorEnd : cs;
        textarea.setSelectionRange(cs, ce);
      }
      textarea.focus();
      if (onChange) onChange();
    }

    function _wrapSelection(prefix, suffix, placeholder) {
      var v = textarea.value;
      var s = textarea.selectionStart;
      var e = textarea.selectionEnd;
      var selected = v.slice(s, e);
      var inner = selected || (placeholder || '');
      var newVal = v.slice(0, s) + prefix + inner + suffix + v.slice(e);
      var ns = s + prefix.length;
      var ne = ns + inner.length;
      _commit(newVal, ns, ne);
    }

    function _prefixSelectedLines(prefixFn) {
      var v = textarea.value;
      var s = textarea.selectionStart;
      var e = textarea.selectionEnd;
      // Expand to full lines
      var lineStart = v.lastIndexOf('\n', s - 1) + 1;
      var lineEnd = v.indexOf('\n', e);
      if (lineEnd === -1) lineEnd = v.length;
      var block = v.slice(lineStart, lineEnd);
      var lines = block.split('\n');
      var i = 0;
      var newBlock = lines.map(function (ln) { i += 1; return prefixFn(ln, i); }).join('\n');
      var newVal = v.slice(0, lineStart) + newBlock + v.slice(lineEnd);
      _commit(newVal, lineStart, lineStart + newBlock.length);
    }

    var _linkModal = null;
    function _closeLinkModal() {
      if (_linkModal && _linkModal.parentNode) _linkModal.parentNode.removeChild(_linkModal);
      _linkModal = null;
    }
    function _openLinkModal() {
      _closeLinkModal();
      // Snapshot current selection so we can restore on Apply
      var s = textarea.selectionStart;
      var e = textarea.selectionEnd;
      var selected = textarea.value.slice(s, e);

      var dialog = el('div', { className: 'ts-md-modal-dialog' });
      var title = el('div', { className: 'ts-md-modal-title' }, 'Insert Link');
      var textLbl = el('label', { className: 'ts-label' }, 'Link Text');
      var textInput = el('input', {
        className: 'ts-input', type: 'text',
        placeholder: 'Display text',
        value: selected || '',
      });
      var urlLbl = el('label', { className: 'ts-label' }, 'URL');
      var urlInput = el('input', {
        className: 'ts-input', type: 'url',
        placeholder: 'https://example.com',
        value: '',
      });

      function _apply() {
        var url = (urlInput.value || '').trim();
        if (!url) { urlInput.focus(); return; }
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url) && !url.startsWith('mailto:')) {
          url = 'https://' + url;
        }
        var text = (textInput.value || '').trim() || url;
        var insert = '[' + text + '](' + url + ')';
        var v2 = textarea.value;
        var newVal = v2.slice(0, s) + insert + v2.slice(e);
        var ns = s + 1;
        var ne = ns + text.length;
        _closeLinkModal();
        _commit(newVal, ns, ne);
      }
      function _onKey(ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); _apply(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); _closeLinkModal(); textarea.focus(); }
      }
      textInput.addEventListener('keydown', _onKey);
      urlInput.addEventListener('keydown', _onKey);

      var applyBtn = el('button', {
        type: 'button', className: 'ts-btn ts-btn-primary',
        onClick: function (ev) { ev.preventDefault(); ev.stopPropagation(); _apply(); },
      }, 'Apply');
      var cancelBtn = el('button', {
        type: 'button', className: 'ts-btn',
        onClick: function (ev) { ev.preventDefault(); ev.stopPropagation(); _closeLinkModal(); textarea.focus(); },
      }, 'Cancel');

      dialog.appendChild(title);
      dialog.appendChild(el('div', { className: 'ts-md-modal-row' }, [textLbl, textInput]));
      dialog.appendChild(el('div', { className: 'ts-md-modal-row' }, [urlLbl, urlInput]));
      dialog.appendChild(el('div', { className: 'ts-md-modal-actions' }, [cancelBtn, applyBtn]));

      // Backdrop captures outside clicks; dialog stops propagation so inner buttons work
      var backdrop = el('div', {
        className: 'ts-md-modal-backdrop',
        onMouseDown: function (ev) {
          if (ev.target === backdrop) { _closeLinkModal(); textarea.focus(); }
        },
      }, [dialog]);
      // Stop the backdrop's mousedown from reaching the dialog when clicking inside it
      dialog.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });

      // Append to wrapper so it stays inside shadow DOM (and survives panel re-renders)
      wrapper.appendChild(backdrop);
      _linkModal = backdrop;

      setTimeout(function () { urlInput.focus(); urlInput.select(); }, 0);
    }
    function _insertLink() { _openLinkModal(); }

    toolbar.appendChild(_btn('B', 'Bold (Ctrl/Cmd+B)', function () { _wrapSelection('**', '**', 'bold text'); }));
    toolbar.appendChild(_btn('I', 'Italic (Ctrl/Cmd+I)', function () { _wrapSelection('*', '*', 'italic text'); }));
    var linkBtn = el('button', {
      type: 'button', className: 'ts-md-btn', title: 'Insert link (Ctrl/Cmd+K)',
      'data-md-link': '1',
      onMouseDown: function (ev) { ev.preventDefault(); },
      onClick: function (ev) { ev.preventDefault(); _insertLink(linkBtn); },
    }, 'Link');
    toolbar.appendChild(linkBtn);
    toolbar.appendChild(_btn('• List', 'Bullet list', function () {
      _prefixSelectedLines(function (ln) { return ln.match(/^\s*[-*]\s/) ? ln : '- ' + ln; });
    }));
    toolbar.appendChild(_btn('1. List', 'Ordered list', function () {
      _prefixSelectedLines(function (ln, i) { return ln.match(/^\s*\d+\.\s/) ? ln : i + '. ' + ln; });
    }));

    // Smart Enter — on ordered list line, insert next number and renumber
    // subsequent consecutive ordered-list lines.
    textarea.addEventListener('keydown', function (ev) {
      // Shortcut keys
      var meta = ev.metaKey || ev.ctrlKey;
      if (meta && !ev.shiftKey && !ev.altKey) {
        var k = (ev.key || '').toLowerCase();
        if (k === 'b') { ev.preventDefault(); _wrapSelection('**', '**', 'bold text'); return; }
        if (k === 'i') { ev.preventDefault(); _wrapSelection('*', '*', 'italic text'); return; }
        if (k === 'k') { ev.preventDefault(); _insertLink(linkBtn); return; }
      }

      if (ev.key !== 'Enter' || ev.shiftKey || ev.metaKey || ev.ctrlKey || ev.altKey) return;

      var v = textarea.value;
      var s = textarea.selectionStart;
      var e = textarea.selectionEnd;
      if (s !== e) return; // don't mess with multi-char selection

      var lineStart = v.lastIndexOf('\n', s - 1) + 1;
      var lineEnd = v.indexOf('\n', s);
      if (lineEnd === -1) lineEnd = v.length;
      var line = v.slice(lineStart, lineEnd);
      var m = line.match(/^(\s*)(\d+)\.\s(.*)$/);
      if (!m) return;
      var indent = m[1];
      var n = parseInt(m[2], 10);
      var rest = m[3];

      // Empty list item — exit list (replace with blank line)
      if (rest.length === 0 && s === lineEnd) {
        ev.preventDefault();
        var nv = v.slice(0, lineStart) + indent + v.slice(lineEnd);
        _commit(nv, lineStart + indent.length, lineStart + indent.length);
        return;
      }

      ev.preventDefault();
      // Insert a new ordered-list line after the cursor, with number n+1.
      var insertion = '\n' + indent + (n + 1) + '. ';
      // Renumber consecutive ordered-list lines that follow (matching same indent).
      var rest1 = v.slice(lineEnd); // begins with '\n' or is empty
      var startsWithNl = rest1.charAt(0) === '\n';
      var lines = rest1.split('\n');
      var startIdx = startsWithNl ? 1 : 0; // first element is '' when rest1 starts with '\n'
      var k = n + 2;
      for (var i = startIdx; i < lines.length; i++) {
        var lm = lines[i].match(/^(\s*)(\d+)\.\s(.*)$/);
        if (!lm || lm[1] !== indent) break;
        lines[i] = lm[1] + k + '. ' + lm[3];
        k += 1;
      }
      var renumbered = lines.join('\n');
      var newVal = v.slice(0, lineEnd) + insertion + renumbered;
      var newPos = lineEnd + insertion.length;
      _commit(newVal, newPos, newPos);
    });

    wrapper.appendChild(toolbar);
    wrapper.appendChild(textarea);
    return wrapper;
  }

  // ─── URL LIST BUILDER ──────────────────────────────
  function _buildUrlList(state) {
    var container = el('div', { className: 'ts-url-list' });
    var urls = Array.isArray(state.draftRelatedUrls) ? state.draftRelatedUrls.slice() : [];
    if (urls.length === 0) urls = [window.location.href || ''];

    function _commitUrls(arr) {
      TicketSupportState.setSilent({ draftRelatedUrls: arr.slice() });
    }

    function _renderRows() {
      container.innerHTML = '';
      urls.forEach(function (u, idx) {
        var row = el('div', { className: 'ts-url-row' });
        var input = el('input', {
          className: 'ts-input', type: 'url',
          placeholder: 'https://example.com/page',
          value: u || '',
          onInput: function (ev) { urls[idx] = ev.target.value; _commitUrls(urls); },
        });
        var removeBtn = el('button', {
          type: 'button', className: 'ts-url-remove', title: 'Remove URL',
          onClick: function () {
            urls.splice(idx, 1);
            if (urls.length === 0) urls.push('');
            _commitUrls(urls);
            _renderRows();
          },
        }, '×');
        row.appendChild(input);
        row.appendChild(removeBtn);
        container.appendChild(row);
      });
      var addBtn = el('button', {
        type: 'button', className: 'ts-btn ts-url-add',
        onClick: function () {
          if (urls.length >= 10) return;
          urls.push('');
          _commitUrls(urls);
          _renderRows();
        },
      }, '+ Add URL');
      container.appendChild(addBtn);
    }

    _renderRows();
    _commitUrls(urls); // ensure state mirrors initial render
    return container;
  }

  // ─── COLLAPSIBLE RECORDING SECTION ──────────────────
  // Matches dashboard recording-controls.tsx

  function _buildRecordingSection(context, state) {
    var section = el('div', { className: 'ts-recording-section' });

    // Section label
    section.appendChild(el('div', { style: 'display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;font-weight:500;color:hsl(40,5%,65%);' }, [
      el('span', { innerHTML: icon('video') }),
      el('span', {}, 'Recording'),
      el('span', { className: 'ts-optional' }, '(optional)'),
    ]));

    var content = el('div', { className: 'ts-collapsible-content' });

    // Recording buttons
    var btns = el('div', { className: 'ts-rec-buttons' });
    btns.appendChild(el('button', {
      className: 'ts-rec-btn', type: 'button',
      onClick: function () { _openRecordingDrawer('screen', context); },
    }, [
      el('span', { innerHTML: icon('video') }),
      el('span', {}, 'Screen + Audio'),
      el('span', { className: 'ts-ext-icon', innerHTML: icon('externalLink', 12, 12) }),
    ]));
    btns.appendChild(el('button', {
      className: 'ts-rec-btn', type: 'button',
      onClick: function () { _openRecordingDrawer('audio', context); },
    }, [
      el('span', { innerHTML: icon('mic') }),
      el('span', {}, 'Audio Only'),
      el('span', { className: 'ts-ext-icon', innerHTML: icon('externalLink', 12, 12) }),
    ]));
    content.appendChild(btns);

    // Spotlight mode toggle (for screen recordings)
    var spotlightLabel = el('label', {
      className: 'ts-spotlight-toggle',
      style: 'display:flex;align-items:center;gap:6px;cursor:pointer;margin-top:6px;font-size:11px;color:#64748b;',
    });
    var spotlightCheckbox = el('input', {
      type: 'checkbox',
      style: 'width:14px;height:14px;cursor:pointer;accent-color:#3b82f6;',
    });
    spotlightCheckbox.checked = state.spotlightEnabled || false;
    spotlightCheckbox.addEventListener('change', function () {
      TicketSupportState.set({ spotlightEnabled: spotlightCheckbox.checked });
    });
    spotlightLabel.appendChild(spotlightCheckbox);
    spotlightLabel.appendChild(el('span', {}, 'Spotlight Mode'));
    spotlightLabel.appendChild(el('span', { style: 'font-size:10px;color:#94a3b8;' }, '(blurs around cursor)'));
    content.appendChild(spotlightLabel);

    // Active recording indicator
    if (state.isRecordingDrawerOpen && (state.isRecording || state.recordingUploading)) {
      var indicator = el('div', { className: 'ts-rec-active-indicator' }, [
        el('span', { className: 'ts-pulse-dot' }),
        el('span', {}, state.recordingUploading ? 'Uploading recording...' :
          (state.recordingDrawerMode === 'screen' ? 'Screen + Audio' : 'Audio') +
          ' recording in progress — ' + TicketSupportRecorder.formatTime(state.recordingSeconds)),
      ]);
      content.appendChild(indicator);
    }

    // Completed recordings list
    var pendingKey = context === 'create' ? 'pendingRecordings' : 'replyRecordings';
    var pending = state[pendingKey] || [];
    if (pending.length) {
      var recList = el('div', { className: 'ts-rec-list' });
      pending.forEach(function (rec, idx) {
        var isScreen = rec.type === 'screen_audio';
        var item = el('div', { className: 'ts-rec-list-item' }, [
          el('div', { className: 'ts-rec-icon ' + (isScreen ? 'ts-screen' : 'ts-audio'), innerHTML: icon(isScreen ? 'video' : 'mic') }),
          el('div', { className: 'ts-rec-info' }, [
            el('div', { className: 'ts-rec-name' }, rec.fileName),
            el('div', { className: 'ts-rec-meta' },
              TicketSupportRecorder.formatTime(rec.durationSeconds) + ' · ' + formatSize(rec.fileSize)),
          ]),
          el('div', { className: 'ts-rec-actions' }, [
            el('button', {
              className: 'ts-remove-btn',
              type: 'button',
              title: 'Remove',
              innerHTML: icon('trash2'),
              onClick: function () {
                var arr = TicketSupportState.get(pendingKey).slice();
                arr.splice(idx, 1);
                var u = {}; u[pendingKey] = arr;
                TicketSupportState.set(u);
              },
            }),
          ]),
        ]);
        recList.appendChild(item);
      });
      content.appendChild(recList);
    }

    section.appendChild(content);
    return section;
  }

  // ─── DETAIL VIEW ────────────────────────────────────

  function _renderDetailView(state) {
    _panelBody.innerHTML = '';

    _panelBody.appendChild(el('button', {
      className: 'ts-back-btn',
      onClick: function () { TicketSupportState.set({ view: 'list', activeTicket: null }); _loadTicketList(); },
    }, [el('span', { innerHTML: icon('arrowLeft', 14, 14) }), el('span', {}, 'Back to tickets')]));

    if (state.loading) { _panelBody.appendChild(_spinner()); return; }

    var ticket = state.activeTicket;
    if (!ticket) { _panelBody.appendChild(el('div', { className: 'ts-empty' }, 'Ticket not found.')); return; }

    // Header
    _panelBody.appendChild(el('div', { className: 'ts-detail-header' }, [
      el('div', { className: 'ts-detail-subject' }, '#' + ticket.ticketNumber + ' ' + ticket.subject),
      el('div', { className: 'ts-detail-info' }, [
        el('span', { className: 'ts-badge ts-badge-' + ticket.status }, STATUS_LABELS[ticket.status] || ticket.status),
        el('span', {}, ticket.category),
        el('span', {}, formatDate(ticket.createdAt)),
      ]),
    ]));

    // Status action
    var canResolve = ['open', 'in_progress', 'awaiting_reply'].indexOf(ticket.status) >= 0;
    var canReopen = ticket.status === 'resolved' || ticket.status === 'closed';
    if (canResolve || canReopen) {
      _panelBody.appendChild(el('button', {
        className: 'ts-btn ts-btn-sm ' + (canResolve ? 'ts-btn-success' : ''),
        style: 'margin-bottom:12px;',
        onClick: function () { _updateTicketStatus(ticket.id, canResolve ? 'resolved' : 'open'); },
      }, canResolve ? 'Mark Resolved' : 'Reopen Ticket'));
    }

    // Messages
    var msgsContainer = el('div', { className: 'ts-messages' });
    (ticket.messages || []).forEach(function (msg) {
      msgsContainer.appendChild(_buildMessage(msg));
    });
    _panelBody.appendChild(msgsContainer);

    // Reply form
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      _panelBody.appendChild(_buildReplyForm(ticket, state));
    } else {
      _panelBody.appendChild(el('div', { className: 'ts-empty', style: 'padding:12px;' }, [
        el('span', {}, 'This ticket is ' + ticket.status + '. '),
        el('a', {
          href: '#', style: 'color:#3b82f6;',
          onClick: function (e) { e.preventDefault(); _updateTicketStatus(ticket.id, 'open'); },
        }, 'Reopen it to reply.'),
      ]));
    }

    setTimeout(function () { if (_panelBody) _panelBody.scrollTop = _panelBody.scrollHeight; }, 100);
  }

  function _buildMessage(msg) {
    var isAdmin = msg.senderRole === 'admin';
    var msgEl = el('div', { className: 'ts-message' + (isAdmin ? ' ts-message-admin' : '') }, [
      el('div', { className: 'ts-message-header' }, [
        el('span', { className: 'ts-message-sender' }, [
          el('span', { innerHTML: icon(isAdmin ? 'headphones' : 'user', 14, 14) }),
          el('span', {}, isAdmin ? 'Support Team' : (msg.senderName || 'You')),
        ]),
        el('span', { className: 'ts-message-time' }, formatDate(msg.createdAt)),
      ]),
      el('div', { className: 'ts-message-body' }, msg.body),
    ]);

    // Recordings
    if (msg.recordings && msg.recordings.length) {
      var recContainer = el('div', { className: 'ts-attachments' });
      msg.recordings.forEach(function (rec) {
        if (rec.playbackUrl) recContainer.appendChild(_buildMediaPlayer(rec));
      });
      msgEl.appendChild(recContainer);
    }

    // Attachments
    if (msg.attachments && msg.attachments.length) {
      var attContainer = el('div', { className: 'ts-attachments' });
      msg.attachments.forEach(function (att) {
        if (att.downloadUrl) {
          attContainer.appendChild(el('a', {
            className: 'ts-attachment-chip',
            href: att.downloadUrl, target: '_blank', rel: 'noopener noreferrer',
          }, [el('span', { innerHTML: icon('download', 14, 14) }), el('span', {}, att.fileName)]));
        }
      });
      msgEl.appendChild(attContainer);
    }

    return msgEl;
  }

  // ─── MEDIA PLAYER ──────────────────────────────────

  function _buildMediaPlayer(rec) {
    var isVideo = rec.type === 'screen_audio' || (rec.mimeType && rec.mimeType.indexOf('video') >= 0);
    var container = el('div', { className: 'ts-player' });
    var hasMouseTrack = isVideo && rec.mouseTrackPath;

    var videoWrapper = el('div', { style: 'position:relative;' });

    var mediaEl = isVideo
      ? el('video', { src: rec.playbackUrl, preload: 'metadata' })
      : el('audio', { src: rec.playbackUrl, preload: 'metadata' });
    videoWrapper.appendChild(mediaEl);

    // Playback spotlight overlay
    var spotlightOverlayEl = null;
    var spotlightTrackData = null;
    var spotlightEnabled = false;

    if (hasMouseTrack) {
      spotlightOverlayEl = document.createElement('div');
      spotlightOverlayEl.style.cssText =
        'position:absolute;inset:0;pointer-events:none;display:none;' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'mask-image:radial-gradient(circle 200px at -9999px -9999px, transparent 0%, transparent 40%, black 100%);' +
        '-webkit-mask-image:radial-gradient(circle 200px at -9999px -9999px, transparent 0%, transparent 40%, black 100%);' +
        'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;border-radius:inherit;z-index:1;';
      videoWrapper.appendChild(spotlightOverlayEl);

      // Load mouse track data via the same media proxy approach as playback URLs
      var apiUrl = (TicketSupportState.get('apiUrl') || '').replace(/\/+$/, '');
      // The mouseTrackPath from the API is already a proxy URL like /api/support/media?path=...
      // or it could be a raw GCS path. Construct the fetch URL accordingly.
      var trackUrl = rec.mouseTrackPath.indexOf('/api/') === 0
        ? apiUrl + rec.mouseTrackPath
        : apiUrl + '/api/support/media?path=' + encodeURIComponent(rec.mouseTrackPath);
      fetch(trackUrl)
        .then(function (res) { return res.json(); })
        .then(function (data) { spotlightTrackData = data; })
        .catch(function () { /* ignore */ });
    }

    container.appendChild(videoWrapper);

    var isPlaying = false;
    var playBtn = el('button', {
      innerHTML: icon('play', 14, 14),
      onClick: function () {
        if (isPlaying) { mediaEl.pause(); playBtn.innerHTML = icon('play', 14, 14); }
        else { mediaEl.play(); playBtn.innerHTML = icon('pause', 14, 14); }
        isPlaying = !isPlaying;
      },
    });

    var seekBar = el('input', { type: 'range', min: '0', max: '100', value: '0' });
    var timeLabel = el('span', {}, '0:00');

    mediaEl.addEventListener('timeupdate', function () {
      seekBar.value = String((mediaEl.currentTime / (mediaEl.duration || 1)) * 100);
      var m = Math.floor(mediaEl.currentTime / 60);
      var s = Math.floor(mediaEl.currentTime % 60);
      timeLabel.textContent = m + ':' + (s < 10 ? '0' : '') + s;

      // Update playback spotlight position
      if (spotlightEnabled && spotlightTrackData && spotlightOverlayEl) {
        var timeMs = mediaEl.currentTime * 1000;
        var samples = spotlightTrackData.samples;
        if (samples && samples.length > 0) {
          // Binary search for closest sample
          var lo = 0, hi = samples.length - 1;
          if (timeMs <= samples[0].t) { var sp = samples[0]; }
          else if (timeMs >= samples[hi].t) { var sp = samples[hi]; }
          else {
            while (lo <= hi) {
              var mid = (lo + hi) >>> 1;
              if (samples[mid].t < timeMs) lo = mid + 1;
              else hi = mid - 1;
            }
            // Interpolate
            if (lo > 0 && lo < samples.length) {
              var a = samples[lo - 1], b = samples[lo];
              var ratio = (timeMs - a.t) / (b.t - a.t);
              var sp = { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
            } else {
              var sp = samples[Math.min(lo, samples.length - 1)];
            }
          }
          if (sp) {
            var cw = videoWrapper.clientWidth || 1;
            var ch = videoWrapper.clientHeight || 1;
            var sx = cw / (spotlightTrackData.viewportWidth || cw);
            var sy = ch / (spotlightTrackData.viewportHeight || ch);
            var px = sp.x * sx, py = sp.y * sy;
            var avgScale = (sx + sy) / 2;
            var r = Math.round(200 * avgScale);
            var grad = 'radial-gradient(circle ' + r + 'px at ' + px + 'px ' + py + 'px, transparent 0%, transparent 40%, black 100%)';
            spotlightOverlayEl.style.maskImage = grad;
            spotlightOverlayEl.style.webkitMaskImage = grad;
          }
        }
      }
    });
    mediaEl.addEventListener('ended', function () { isPlaying = false; playBtn.innerHTML = icon('play', 14, 14); });
    seekBar.addEventListener('input', function () {
      mediaEl.currentTime = (parseFloat(seekBar.value) / 100) * (mediaEl.duration || 0);
    });

    var speedSelect = el('select', {
      onChange: function (e) { mediaEl.playbackRate = parseFloat(e.target.value); },
    });
    [0.5, 1, 1.5, 2].forEach(function (s) {
      var opt = el('option', { value: String(s) }, s + 'x');
      if (s === 1) opt.selected = true;
      speedSelect.appendChild(opt);
    });

    var controlsArr = [playBtn, seekBar, timeLabel, speedSelect];

    // Add spotlight toggle if mouse track data is available
    if (hasMouseTrack) {
      var spotlightBtn = el('button', {
        title: 'Toggle cursor spotlight',
        style: 'background:none;border:1px solid #e2e8f0;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:10px;color:#64748b;',
        onClick: function () {
          spotlightEnabled = !spotlightEnabled;
          if (spotlightOverlayEl) {
            spotlightOverlayEl.style.display = spotlightEnabled ? 'block' : 'none';
          }
          spotlightBtn.style.color = spotlightEnabled ? '#3b82f6' : '#64748b';
          spotlightBtn.style.borderColor = spotlightEnabled ? '#3b82f6' : '#e2e8f0';
        },
      }, '\u25CE'); // ◎ target/spotlight icon
      controlsArr.push(spotlightBtn);
    }

    container.appendChild(el('div', { className: 'ts-player-controls' }, controlsArr));
    return container;
  }

  // ─── REPLY FORM ─────────────────────────────────────

  function _buildReplyForm(ticket, state) {
    var form = el('form', {
      style: 'border-top:1px solid #e2e8f0;padding-top:12px;margin-top:8px;',
      onSubmit: function (e) { e.preventDefault(); _submitReply(ticket.id); },
    });

    form.appendChild(_formGroup('Reply', false, false, el('textarea', {
      className: 'ts-textarea', placeholder: 'Type your reply...',
      style: 'min-height:70px;',
      onInput: function (e) { TicketSupportState.setSilent({ replyBody: e.target.value }); },
    }, state.replyBody || '')));

    // Attach button
    var replyFileInput = el('input', {
      type: 'file', multiple: 'multiple',
      accept: TicketSupportUploader.ALLOWED_FILE_TYPES.join(','),
      onChange: function (e) { _handleFiles(e.target.files, 'reply'); },
    });
    form.appendChild(el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;' }, [
      el('button', {
        className: 'ts-btn ts-btn-sm', type: 'button',
        onClick: function () { replyFileInput.click(); },
      }, [el('span', { innerHTML: icon('paperclip') }), el('span', {}, 'Attach')]),
      replyFileInput,
    ]));

    // Reply attachments
    if (state.replyAttachments && state.replyAttachments.length) {
      var ra = el('div', { className: 'ts-file-list' });
      state.replyAttachments.forEach(function (att, idx) {
        ra.appendChild(el('span', { className: 'ts-file-chip' }, [
          el('span', {}, att.fileName),
          el('button', {
            type: 'button',
            onClick: function () {
              var arr = TicketSupportState.get('replyAttachments').slice();
              arr.splice(idx, 1);
              TicketSupportState.set({ replyAttachments: arr });
            },
          }, '\u00d7'),
        ]));
      });
      form.appendChild(ra);
    }

    // Recording controls for reply
    if (TicketSupportRecorder.isSupported()) {
      form.appendChild(_buildRecordingSection('reply', state));
    }

    // Submit
    form.appendChild(el('button', {
      className: 'ts-btn ts-btn-primary ts-btn-sm',
      style: 'margin-top:8px;',
      type: 'submit',
      disabled: state.loading ? 'disabled' : null,
    }, [el('span', { innerHTML: icon('send') }), el('span', {}, state.loading ? 'Sending...' : 'Send Reply')]));

    return form;
  }

  // ═══════════════════════════════════════════════════
  // ─── RECORDING DRAWER (Floating Draggable Panel) ──
  // Matches dashboard recording-drawer.tsx exactly
  // ═══════════════════════════════════════════════════

  function _handleDrawer(state) {
    if (!state.isRecordingDrawerOpen) {
      if (_drawer.el) {
        _drawer.el.remove();
        _drawer = { el: null, bodyEl: null, warningEl: null, minimizedEl: null,
                    timerEl: null, progressEl: null, canvasEl: null, previewEl: null,
                    lastSubState: null };
      }
      return;
    }

    // Determine sub-state
    var subState = 'idle';
    if (state.isRecording) subState = 'recording';
    else if (state.recordingUploading) subState = 'uploading';

    // Don't show the bar in idle state — only when actively recording or uploading
    if (subState === 'idle') {
      if (_drawer.el) {
        _drawer.el.remove();
        _drawer.el = null;
        _drawer.lastSubState = null;
      }
      return;
    }

    if (!_drawer.el) {
      _createDrawer(state, subState);
      return;
    }

    // If sub-state changed, rebuild
    if (subState !== _drawer.lastSubState) {
      _rebuildDrawerBody(state, subState);
      _drawer.lastSubState = subState;
      return;
    }

    // Same sub-state — targeted updates
    if (subState === 'recording' && _drawer.timerEl) {
      _drawer.timerEl.textContent = TicketSupportRecorder.formatTime(state.recordingSeconds) +
        ' / ' + TicketSupportRecorder.formatTime(TicketSupportRecorder.MAX_DURATION);
    }
  }

  function _createDrawer(state, subState) {
    var barEl = el('div', { className: 'ts-rec-bar' });

    _drawer.el = barEl;
    _drawer.lastSubState = subState;

    _rebuildDrawerBody(state, subState);
    _root.appendChild(barEl);
  }

  function _rebuildDrawerBody(state, subState) {
    if (!_drawer.el) return;
    _drawer.el.innerHTML = '';
    _drawer.timerEl = null;
    _drawer.progressEl = null;
    _drawer.canvasEl = null;

    var mode = state.recordingDrawerMode;
    var isScreen = mode === 'screen';

    if (subState === 'recording') {
      var infoEl = el('div', { className: 'ts-rec-bar-info' }, [
        el('span', { className: 'ts-pulse-dot' }),
        el('span', { className: 'ts-rec-bar-label' }, isScreen ? 'Recording' : 'Recording Audio'),
      ]);

      var timerEl = el('span', { className: 'ts-rec-bar-timer' },
        TicketSupportRecorder.formatTime(state.recordingSeconds) +
        ' / ' + TicketSupportRecorder.formatTime(TicketSupportRecorder.MAX_DURATION));
      _drawer.timerEl = timerEl;
      infoEl.appendChild(timerEl);

      _drawer.el.appendChild(infoEl);
      _drawer.el.appendChild(el('button', {
        className: 'ts-rec-bar-stop',
        onClick: function () { _stopActiveRecording(); },
      }, [el('span', { innerHTML: icon('square', 12, 12) }), el('span', {}, 'Stop')]));
    } else if (subState === 'uploading') {
      _drawer.el.appendChild(el('div', { className: 'ts-rec-bar-info' }, [
        el('span', { className: 'ts-spin-inline' }),
        el('span', { className: 'ts-rec-bar-muted' }, 'Uploading... ' + (state.recordingUploadProgress || 0) + '%'),
      ]));
    }
  }

  function _openRecordingDrawer(mode, context) {
    TicketSupportState.set({
      isRecordingDrawerOpen: true,
      recordingDrawerMode: mode,
      recordingDrawerContext: context,
      recordingDrawerMinimized: false,
      recordingUploading: false,
      recordingUploadProgress: 0,
    });
    // Auto-start recording immediately (no idle UI in compact bar)
    _startDrawerRecording();
  }

  function _closeDrawer() {
    var state = TicketSupportState.get();
    if (state.isRecording || state.recordingMode === 'popup') {
      _cancelActiveRecording();
    }
    TicketSupportState.set({
      isRecordingDrawerOpen: false,
      recordingDrawerMode: null,
      recordingDrawerContext: null,
      recordingDrawerMinimized: false,
      recordingUploading: false,
      recordingUploadProgress: 0,
      recordingMode: null,
    });
  }

  function _stopActiveRecording() {
    if (TicketSupportState.get('recordingMode') === 'popup') {
      TicketSupportPopupRecorder.stop();
    } else {
      TicketSupportRecorder.stop();
    }
  }

  function _cancelActiveRecording() {
    if (TicketSupportState.get('recordingMode') === 'popup') {
      TicketSupportPopupRecorder.cancel();
    } else {
      TicketSupportRecorder.cancel();
    }
  }

  function _startDrawerRecording() {
    var state = TicketSupportState.get();
    var mode = state.recordingDrawerMode;
    var context = state.recordingDrawerContext || 'create';
    var targetKey = context === 'reply' ? 'replyRecordings' : 'pendingRecordings';
    var draftId = state.draftTicketId;
    var spotlightEnabled = state.spotlightEnabled || false;

    // Panel stays open while recording so the user can read the description
    // aloud or do a walkthrough of items they listed. The screen-capture
    // popup and audio recording both run independently of panel visibility.

    var opts = {
      onTick: function () {},
      spotlightEnabled: mode === 'screen' ? spotlightEnabled : false,
      onComplete: function (blob, duration, recType, mouseSamples) {
        // Reopen the panel before uploading so user sees progress
        TicketSupportState.set({ widgetOpen: true });

        // Start upload
        TicketSupportState.set({ recordingUploading: true, recordingUploadProgress: 0 });

        TicketSupportUploader.uploadRecording(blob, draftId, recType, duration, function (pct) {
          TicketSupportState.set({ recordingUploadProgress: Math.round(pct * 0.9) }); // 90% for video
        }).then(function (meta) {
          // Upload mouse track data if available
          if (mouseSamples && mouseSamples.length > 0) {
            var trackData = {
              viewportWidth: window.innerWidth,
              viewportHeight: window.innerHeight,
              samples: mouseSamples,
            };
            return TicketSupportUploader.uploadMouseTrack(trackData, draftId).then(function (trackPath) {
              meta.mouseTrackPath = trackPath;
              meta.spotlightEnabled = true;
              TicketSupportState.set({ recordingUploadProgress: 100 });
              return meta;
            }).catch(function () {
              // Non-fatal — recording succeeds without mouse data
              TicketSupportState.set({ recordingUploadProgress: 100 });
              return meta;
            });
          }
          TicketSupportState.set({ recordingUploadProgress: 100 });
          return meta;
        }).then(function (meta) {
          var arr = TicketSupportState.get(targetKey).slice();
          arr.push(meta);
          var update = {};
          update[targetKey] = arr;
          update.isRecordingDrawerOpen = false;
          update.recordingDrawerMode = null;
          update.recordingDrawerContext = null;
          update.recordingDrawerMinimized = false;
          update.recordingUploading = false;
          update.recordingUploadProgress = 0;
          TicketSupportState.set(update);
          toast('Recording saved!', 'success');
        }).catch(function (err) {
          TicketSupportState.set({ recordingUploading: false, recordingUploadProgress: 0 });
          toast(err.message || 'Recording upload failed', 'error');
        });
      },
      onError: function (err) {
        _recStartUnsub(); // Clean up subscriber if recording fails to start
        toast(err.message || err || 'Recording failed', 'error');
      },
    };

    // Try the popup recorder first — it survives host-page refreshes.
    // Falls back to the in-page recorder on mobile or when popups are blocked.
    var recordingType = mode === 'screen' ? 'screen_audio' : 'audio_only';
    var popupOpened = false;
    var popupSupported = TicketSupportPopupRecorder.isSupported();
    if (popupSupported) {
      popupOpened = TicketSupportPopupRecorder.start({
        recordingType: recordingType,
        draftTicketId: draftId,
        spotlight: mode === 'screen' ? spotlightEnabled : false,
        context: context,
      });
    }

    if (popupOpened) {
      TicketSupportState.set({ recordingMode: 'popup' });
      return;
    }

    // Fallback: in-page recorder (same document as the host page).
    TicketSupportState.set({ recordingMode: 'inpage' });
    if (popupSupported) {
      // Popup was attempted but blocked — let the user know the refresh
      // protection won't apply.
      toast('Popup blocked — recording in this tab. Refreshing will cancel it.', 'error');
    }

    if (mode === 'screen') {
      TicketSupportRecorder.startScreenAudio(opts);
    } else {
      // For audio, pass canvas for waveform after recording starts
      if (_drawer.canvasEl) opts.canvasEl = _drawer.canvasEl;
      TicketSupportRecorder.startAudio(opts);
    }
  }

  // ─── ACTIONS ────────────────────────────────────────



  function _loadTicketList() {
    var email = TicketSupportState.get('userEmail');
    if (!email) {
      TicketSupportState.set({ tickets: [], loading: false });
      return;
    }
    TicketSupportState.set({ loading: true });
    TicketSupportAPI.listTickets(email, {
      status: TicketSupportState.get('ticketsStatusFilter'),
      page: TicketSupportState.get('ticketsPage'),
      pageSize: TicketSupportState.get('ticketsPageSize'),
    }).then(function (res) {
      TicketSupportState.set({
        tickets: res.data || [],
        ticketsTotal: res.total || 0,
        ticketsTotalPages: res.totalPages || 0,
        loading: false,
      });
    }).catch(function (err) {
      console.error('[TicketSupport] list error', err);
      TicketSupportState.set({ loading: false });
    });
  }

  function _loadTicketDetail(id) {
    TicketSupportState.set({ loading: true });
    var email = TicketSupportState.get('userEmail');
    TicketSupportAPI.getTicket(id, email).then(function (res) {
      TicketSupportState.set({ activeTicket: res.data, loading: false });
    }).catch(function (err) {
      console.error('[TicketSupport] detail error', err);
      TicketSupportState.set({ loading: false, error: 'Failed to load ticket' });
    });
  }

  function _updateTicketStatus(id, status) {
    var email = TicketSupportState.get('userEmail');
    TicketSupportAPI.updateTicketStatus(id, status, email).then(function () {
      toast('Ticket ' + (status === 'resolved' ? 'resolved' : 'reopened') + '!', 'success');
      _loadTicketDetail(id);
    }).catch(function (err) {
      toast(err.message || 'Failed to update', 'error');
    });
  }

  // ── Device info collector (mirrors src/lib/device-info.ts) ──
  function _collectDeviceInfo() {
    var ua = navigator.userAgent || '';
    // OS
    var os = 'Unknown OS';
    var wm = ua.match(/Windows NT ([\d.]+)/);
    if (wm) { var vm = { '10.0':'10/11','6.3':'8.1','6.2':'8','6.1':'7' }; os = 'Windows ' + (vm[wm[1]] || wm[1]); }
    else if (/iPhone OS ([\d_]+)/.test(ua)) os = 'iOS ' + RegExp.$1.replace(/_/g, '.');
    else if (/Mac OS X ([\d_]+)/.test(ua)) os = (/iPad|iPhone|iPod/.test(ua) ? 'iOS ' : 'macOS ') + RegExp.$1.replace(/_/g, '.');
    else if (/Android ([\d.]+)/.test(ua)) os = 'Android ' + RegExp.$1;
    else if (/CrOS/.test(ua)) os = 'Chrome OS';
    else if (/Linux/.test(ua)) os = 'Linux';
    // Browser
    var browser = 'Unknown Browser';
    if (/Edg(?:e|A|iOS)?\/([\d.]+)/.test(ua)) browser = 'Edge ' + RegExp.$1;
    else if (/OPR\/([\d.]+)/.test(ua)) browser = 'Opera ' + RegExp.$1;
    else if (/SamsungBrowser\/([\d.]+)/.test(ua)) browser = 'Samsung Internet ' + RegExp.$1;
    else if (/Firefox\/([\d.]+)/.test(ua)) browser = 'Firefox ' + RegExp.$1;
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) { var sv = ua.match(/Version\/([\d.]+)/); browser = sv ? 'Safari ' + sv[1] : 'Safari'; }
    else if (/Chrome\/([\d.]+)/.test(ua)) browser = 'Chrome ' + RegExp.$1;
    // Device
    var device = 'Unknown Device';
    if (/iPhone/.test(ua)) device = 'Mobile \u2014 iPhone';
    else if (/iPad/.test(ua)) device = 'Tablet \u2014 iPad';
    else if (/Android/.test(ua)) { var mm = ua.match(/;\s*([^;)]+)\s+Build\//); var md = mm ? mm[1].trim() : ''; device = /Mobile/.test(ua) ? ('Mobile \u2014 ' + (md || 'Android')) : ('Tablet \u2014 ' + (md || 'Android')); }
    else if (/Windows/.test(ua)) device = 'Desktop \u2014 Windows';
    else if (/Macintosh/.test(ua)) device = 'Desktop \u2014 Mac';
    else if (/Linux/.test(ua)) device = 'Desktop \u2014 Linux';
    // Screen
    var w = screen.width, h = screen.height, dpr = window.devicePixelRatio || 1;
    var screenRes = w + 'x' + h + ' @' + dpr + 'x (' + (w >= h ? 'Landscape' : 'Portrait') + ')';
    return { operatingSystem: os, browserVersion: browser, deviceType: device, screenResolution: screenRes, appVersion: 'widget-1.0' };
  }

  function _submitTicket() {
    var state = TicketSupportState.get();
    if (!state.pendingRecordings || !state.pendingRecordings.length) {
      TicketSupportState.set({ error: 'A recording is required before submitting.' });
      return;
    }
    if (!state.draftSubject.trim() || state.draftSubject.trim().length < 5) {
      TicketSupportState.set({ error: 'Subject must be at least 5 characters.' });
      return;
    }
    if (!state.draftDescription.trim() || state.draftDescription.trim().length < 10) {
      TicketSupportState.set({ error: 'Description must be at least 10 characters.' });
      return;
    }

    TicketSupportState.set({ loading: true, error: null });

    // Validate product for sgen_internal
    if (state.draftWorkType === 'sgen_internal' && !state.draftProduct) {
      TicketSupportState.set({ error: 'Please select a product.' });
      return;
    }

    // Validate department for client_work
    if (state.draftWorkType === 'client_work' && !state.draftDepartment) {
      TicketSupportState.set({ error: 'Please select a department.' });
      return;
    }

    // Validate task type when department is graphics
    if (state.draftWorkType === 'client_work' && state.draftDepartment === 'graphics' && !state.draftTaskType) {
      TicketSupportState.set({ error: 'Please select a task type.' });
      return;
    }

    // Validate category when department is not graphics
    if (state.draftWorkType === 'client_work' && state.draftDepartment !== 'graphics' && !state.draftCategory) {
      TicketSupportState.set({ error: 'Please select a category.' });
      return;
    }

    var devInfo = _collectDeviceInfo();
    var wt = state.draftWorkType || 'sgen_internal';
    var urls = (state.draftRelatedUrls || []).map(function (u) { return (u || '').trim(); }).filter(function (u) { return u.length > 0; });
    if (!urls.length) urls = [window.location.href];
    var payload = {
      workType: wt,
      product: wt === 'sgen_internal' ? state.draftProduct : undefined,
      department: wt === 'client_work' ? state.draftDepartment : undefined,
      taskType: (wt === 'client_work' && state.draftDepartment === 'graphics') ? state.draftTaskType : undefined,
      requestType: wt === 'client_work' ? state.draftRequestType : undefined,
      location: (wt === 'client_work' && state.draftDepartment === 'gmb_location') ? state.draftLocation : undefined,
      subject: state.draftSubject.trim(),
      category: state.draftCategory || undefined,
      priority: state.draftPriority,
      description: state.draftDescription.trim(),
      pageUrl: urls[0],
      pageUrls: urls,
      startDate: state.draftStartDate || undefined,
      endDate: state.draftEndDate || undefined,
      name: state.userName || '',
      email: state.userEmail || '',
      recordings: state.pendingRecordings,
      attachments: state.pendingAttachments,
      operatingSystem: devInfo.operatingSystem,
      browserVersion: devInfo.browserVersion,
      deviceType: devInfo.deviceType,
      screenResolution: devInfo.screenResolution,
      appVersion: devInfo.appVersion,
      _hp: '',
    };
    if (wt === 'client_work' && state.draftClient) {
      payload.client = state.draftClient;
      if (state.draftClientName) payload.clientName = state.draftClientName;
      if (state.draftClientCompanyId) payload.companyId = state.draftClientCompanyId;
    }

    // Recurring schedule — backend persists a RecurringTask instead of a
    // one-off ticket. A start date is required to anchor the schedule grid.
    if (state.draftRecurring) {
      if (!state.draftStartDate) {
        TicketSupportState.set({ loading: false, error: 'A start date is required for a recurring task.' });
        return;
      }
      var freq = state.draftRecurFrequency || 'weekly';
      var rec = {
        frequency: freq,
        interval: parseInt(state.draftRecurInterval, 10) || 1,
        timeOfDay: state.draftRecurTime || '09:00',
        startsAt: state.draftStartDate,
        endsAt: state.draftEndDate || undefined,
      };
      if (freq === 'weekly') rec.weekday = parseInt(state.draftRecurWeekday, 10);
      if (freq === 'monthly') rec.monthDay = parseInt(state.draftRecurMonthDay, 10);
      payload.recurring = rec;
    }

    TicketSupportAPI.createTicket(payload).then(function (res) {
      TicketSupportState.set({ loading: false });
      TicketSupportState.resetCreateForm();
      _manualBackSteps = {};
      // Drop the session so the next ticket gets a fresh draftTicketId and
      // empty GCS prefix.
      TicketSupportAPI.invalidateSession();
      TicketSupportAPI.ensureSession().then(function () {
        var dt = TicketSupportAPI.getDraftTicketId();
        if (dt) TicketSupportState.set({ draftTicketId: dt });
      }).catch(function () { /* next call will retry */ });
      var successMsg = (res.data && res.data.recurring)
        ? 'Recurring task schedule created!'
        : 'Ticket #' + res.data.ticketNumber + ' created successfully!';
      toast(successMsg, 'success');
      _closePanel();
    }).catch(function (err) {
      TicketSupportState.set({ loading: false, error: err.message || 'Failed to create ticket.' });
    });
  }

  function _submitReply(ticketId) {
    var state = TicketSupportState.get();
    if (!state.replyBody.trim()) return;

    TicketSupportState.set({ loading: true });

    TicketSupportAPI.createMessage(ticketId, {
      body: state.replyBody.trim(),
      name: state.userName || '',
      email: state.userEmail || '',
      recordings: state.replyRecordings,
      attachments: state.replyAttachments,
    }).then(function () {
      TicketSupportState.resetReplyForm();
      toast('Reply sent!', 'success');
      _loadTicketDetail(ticketId);
    }).catch(function (err) {
      TicketSupportState.set({ loading: false });
      toast(err.message || 'Failed to send reply.', 'error');
    });
  }

  function _handleFiles(files, context) {
    if (!files || !files.length) return;
    var draftId = TicketSupportState.get('draftTicketId');
    var targetKey = context === 'create' ? 'pendingAttachments' : 'replyAttachments';

    for (var i = 0; i < files.length; i++) {
      (function (file) {
        var previewUrl = file.type && file.type.indexOf('image/') === 0 ? URL.createObjectURL(file) : null;
        TicketSupportUploader.uploadFile(file, draftId).then(function (meta) {
          if (previewUrl) meta.previewUrl = previewUrl;
          var arr = TicketSupportState.get(targetKey).slice();
          arr.push(meta);
          var u = {}; u[targetKey] = arr;
          TicketSupportState.set(u);
        }).catch(function (err) {
          if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch(e) {} }
          toast(err.message || 'Upload failed', 'error');
        });
      })(files[i]);
    }
  }

  return {
    init: init,
    toast: toast,
  };
})();


// ─── MAIN.JS ─────────────────────────────────────
/**
 * ticket_support_embed — Main Entry Point
 *
 * Usage:
 *   <script src="https://your-dashboard.com/ticket_support_embed/widget.js"
 *           data-api-url="https://your-dashboard.com"
 *           data-user-name="John Doe"
 *           data-user-email="john@example.com"
 *           data-token="your-widget-token"></script>
 *
 * Authentication is handled automatically via the browser's Origin header.
 * Your domain must be registered in ALLOWED_WIDGET_ORIGINS on the server.
 *
 * Authentication is handled automatically via the browser's Origin header.
 * Your domain must be registered in ALLOWED_WIDGET_ORIGINS on the server.
 *
 * All source files are concatenated by the build script into this file.
 * The widget self-initializes on DOMContentLoaded.
 */
(function () {
  'use strict';

  // Prevent double-init
  if (window.__ticketSupportEmbed) return;
  window.__ticketSupportEmbed = true;

  function boot() {
    // Find our own script tag for data attributes
    var scripts = document.querySelectorAll('script[data-api-url]');
    var scriptEl = null;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') > -1) {
        scriptEl = scripts[i];
        break;
      }
    }
    // Fallback: try last script with data-api-url
    if (!scriptEl && scripts.length) {
      scriptEl = scripts[scripts.length - 1];
    }

    var apiUrl = scriptEl ? scriptEl.getAttribute('data-api-url') : '';
    var userName = scriptEl ? scriptEl.getAttribute('data-user-name') || '' : '';
    var userEmail = scriptEl ? scriptEl.getAttribute('data-user-email') || '' : '';
    var widgetToken = scriptEl ? scriptEl.getAttribute('data-token') || '' : '';
    var position = scriptEl ? (scriptEl.getAttribute('data-position') || 'bottom-right') : 'bottom-right';
    var offsetX = scriptEl ? (scriptEl.getAttribute('data-offset-x') || '') : '';
    var offsetY = scriptEl ? (scriptEl.getAttribute('data-offset-y') || '') : '';

    // Normalize position value
    var validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'middle-right', 'middle-left'];
    if (validPositions.indexOf(position) === -1) {
      console.warn('[TicketSupport] Invalid data-position "' + position + '". Using "bottom-right".');
      position = 'bottom-right';
    }

    // Parse offset values (pixels)
    var parsedOffsetX = offsetX ? parseInt(offsetX, 10) : 0;
    var parsedOffsetY = offsetY ? parseInt(offsetY, 10) : 0;
    if (isNaN(parsedOffsetX)) parsedOffsetX = 0;
    if (isNaN(parsedOffsetY)) parsedOffsetY = 0;

    if (!apiUrl) {
      console.error('[TicketSupport] Missing data-api-url on script tag.');
      return;
    }

    // Initialize API client. The site key (formerly data-token) is exchanged
    // for a short-lived widget session via /widget/session — see ensureSession.
    TicketSupportAPI.init(apiUrl, widgetToken);
    // Reuse any draftTicketId from persisted state so a refresh mid-form does
    // not invalidate already-uploaded recordings/attachments.
    var _persistedDraft = (TicketSupportState.get('draftTicketId') || '').trim();
    if (_persistedDraft) TicketSupportAPI.preferDraftTicketId(_persistedDraft);

    // Set user identity (from script attributes), preserve any restored state
    var restoredState = TicketSupportState.get();

    // Only override user name/email if provided via data attributes
    var stateUpdates = {};
    stateUpdates.position = position;
    stateUpdates.offsetX = parsedOffsetX;
    stateUpdates.offsetY = parsedOffsetY;
    if (userName) stateUpdates.userName = userName;
    else if (!restoredState.userName) stateUpdates.userName = '';
    if (userEmail) stateUpdates.userEmail = userEmail;
    else if (!restoredState.userEmail) stateUpdates.userEmail = '';

    // Apply without triggering render yet (UI.init will render)
    if (Object.keys(stateUpdates).length) {
      TicketSupportState.setSilent(stateUpdates);
    }

    // Kick off session mint immediately so the server-issued draftTicketId is
    // ready by the time the user opens the widget. When the session lands we
    // sync state.draftTicketId so uploads target the correct prefix.
    TicketSupportAPI.ensureSession().then(function () {
      var dt = TicketSupportAPI.getDraftTicketId();
      if (dt) TicketSupportState.set({ draftTicketId: dt });
    }).catch(function (err) {
      console.warn('[TicketSupport] Session mint failed:', err && err.message);
    });

    // Create shadow DOM host
    var host = document.createElement('div');
    host.id = 'ticket-support-embed';
    host.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;width:0;height:0;pointer-events:none;';
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: 'open' });

    // Allow pointer events on children
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'pointer-events:auto;';
    wrapper.setAttribute('data-position', position);
    shadow.appendChild(wrapper);

    // Inject styles into shadow root (for isolation)
    TicketSupportStyles.inject(shadow);

    // Initialize UI inside the wrapper (so [data-position] selectors work)
    TicketSupportUI.init(wrapper);

    // Wire up the popup recorder. The popup lives on the dashboard origin and
    // survives host-page refreshes, so it drives recording state via messages
    // rather than local callbacks.
    TicketSupportPopupRecorder.init(apiUrl, widgetToken, {
      onStarted: function (msg) {
        TicketSupportState.set({
          isRecording: true,
          recordingType: msg.recordingType || null,
          recordingSeconds: 0,
          recordingMode: 'popup',
        });
      },
      onTick: function (seconds) {
        var s = TicketSupportState.get();
        var updates = { recordingSeconds: seconds };
        // If the widget rebooted mid-recording, sync these as well.
        if (!s.isRecording) updates.isRecording = true;
        if (!s.recordingMode) updates.recordingMode = 'popup';
        TicketSupportState.set(updates);
      },
      onStopping: function () {
        TicketSupportState.set({ isRecording: false });
      },
      onUploadStarted: function () {
        TicketSupportState.set({
          widgetOpen: true,
          recordingUploading: true,
          recordingUploadProgress: 0,
        });
      },
      onUploadProgress: function (percent) {
        TicketSupportState.set({ recordingUploadProgress: Math.round(percent || 0) });
      },
      onComplete: function (meta) {
        if (!meta || !meta.gcsPath) return;
        var context = meta.context === 'reply' ? 'reply' : 'create';
        var targetKey = context === 'reply' ? 'replyRecordings' : 'pendingRecordings';
        var existing = TicketSupportState.get(targetKey) || [];
        // Dedupe by gcsPath — the popup retries until acked.
        var already = existing.some(function (m) { return m && m.gcsPath === meta.gcsPath; });
        if (!already) {
          var arr = existing.slice();
          arr.push(meta);
          var update = {};
          update[targetKey] = arr;
          update.isRecordingDrawerOpen = false;
          update.recordingDrawerMode = null;
          update.recordingDrawerContext = null;
          update.recordingDrawerMinimized = false;
          update.recordingUploading = false;
          update.recordingUploadProgress = 0;
          update.isRecording = false;
          update.recordingMode = null;
          update.widgetOpen = true;
          TicketSupportState.set(update);
          TicketSupportUI.toast('Recording saved!', 'success');
        }
        TicketSupportPopupRecorder.ack(meta.gcsPath);
      },
      onError: function (message) {
        TicketSupportState.set({
          isRecording: false,
          isRecordingDrawerOpen: false,
          recordingDrawerMode: null,
          recordingDrawerContext: null,
          recordingDrawerMinimized: false,
          recordingUploading: false,
          recordingUploadProgress: 0,
          recordingMode: null,
        });
        TicketSupportUI.toast(message || 'Recording failed', 'error');
      },
      onCancelled: function () {
        TicketSupportState.set({
          isRecording: false,
          isRecordingDrawerOpen: false,
          recordingDrawerMode: null,
          recordingDrawerContext: null,
          recordingDrawerMinimized: false,
          recordingUploading: false,
          recordingUploadProgress: 0,
          recordingMode: null,
        });
      },
      onAbandoned: function () {
        // User closed the popup mid-recording.
        TicketSupportState.set({
          isRecording: false,
          isRecordingDrawerOpen: false,
          recordingDrawerMode: null,
          recordingDrawerContext: null,
          recordingDrawerMinimized: false,
          recordingUploading: false,
          recordingUploadProgress: 0,
          recordingMode: null,
        });
        TicketSupportUI.toast('Recording window was closed — no recording saved.', 'error');
      },
      onStatus: function (msg) {
        // Sync UI to whatever the popup reports — useful right after refresh.
        var updates = {};
        if (typeof msg.isRecording === 'boolean') updates.isRecording = msg.isRecording;
        if (typeof msg.seconds === 'number') updates.recordingSeconds = msg.seconds;
        if (msg.recordingType) updates.recordingType = msg.recordingType;
        if (msg.isUploading) {
          updates.recordingUploading = true;
          updates.widgetOpen = true;
        }
        if (Object.keys(updates).length) TicketSupportState.set(updates);
      },
    });

    // After a host-page refresh, the popup keeps running and will re-emit
    // tick/upload/complete messages on its own retry sweep — the listeners
    // above pick those up and restore the UI without us needing to reach
    // into the popup window.
    //
    // Edge case: if the popup was closed while the host was mid-refresh, the
    // "abandoned" signal is sent to the dying document and lost. Detect a
    // stuck drawer by waiting briefly for any popup message; if nothing
    // arrives, clear the drawer.
    if (TicketSupportState.get('recordingMode') === 'popup') {
      var _popupPing = false;
      var _pingUnsub = TicketSupportState.subscribe(function (s) {
        if (s.recordingMode !== 'popup') {
          _popupPing = true;
          _pingUnsub();
        } else if (s.recordingSeconds > 0 || s.recordingUploading) {
          _popupPing = true;
          _pingUnsub();
        }
      });
      setTimeout(function () {
        if (!_popupPing) {
          _pingUnsub();
          TicketSupportState.set({
            isRecording: false,
            isRecordingDrawerOpen: false,
            recordingDrawerMode: null,
            recordingDrawerContext: null,
            recordingDrawerMinimized: false,
            recordingUploading: false,
            recordingUploadProgress: 0,
            recordingMode: null,
          });
        }
      }, 4000);
    }

    // If the widget was open before navigation, auto-fill URL + reload categories
    if (TicketSupportState.get('widgetOpen')) {
      if (!TicketSupportState.get('draftRelatedUrl')) {
        TicketSupportState.setSilent({ draftRelatedUrl: window.location.href });
      }
      if (typeof TicketSupportUI.loadCategories === 'function') {
        TicketSupportUI.loadCategories();
      }
    }
  }

  // Expose public API for host page integration
  window.TicketSupportWidget = {
    open: function () {
      TicketSupportState.set({ widgetOpen: true, view: 'create' });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


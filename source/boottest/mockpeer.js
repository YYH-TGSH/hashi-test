// Mock PeerJS loopback broker（jsdom 測試用）：同頁多個 Peer 以 id 互連
module.exports = `
(function () {
  var REG = window.__SHARED_REG__ || {}; window.__SHARED_REG__ = REG; window.__MOCK_PEER_REG = REG;
  function emit(obj, ev) { var hs = (obj._h && obj._h[ev]) || []; var args = Array.prototype.slice.call(arguments, 2); hs.slice().forEach(function (f) { try { f.apply(null, args); } catch (e) { console.error('mockpeer handler', e); } }); }
  function on(obj, ev, fn) { (obj._h[ev] = obj._h[ev] || []).push(fn); }
  function fakeTrack(kind) { return { kind: kind, enabled: true, stop: function () {}, getSettings: function () { return {}; } }; }
  function fakeStream() { var t = [fakeTrack('audio'), fakeTrack('video')]; return { getTracks: function () { return t; }, getAudioTracks: function () { return [t[0]]; }, getVideoTracks: function () { return [t[1]]; }, active: true }; }
  if (!window.navigator.mediaDevices) window.navigator.mediaDevices = {};
  if (!window.navigator.mediaDevices.getUserMedia) window.navigator.mediaDevices.getUserMedia = function () { return Promise.resolve(fakeStream()); };
  function DataConn(localPeer, remotePeer) { this._h = {}; this.peer = remotePeer ? remotePeer.id : null; this._local = localPeer; this._remote = remotePeer; this.open = false; }
  DataConn.prototype.on = function (ev, fn) { on(this, ev, fn); };
  DataConn.prototype.send = function (data) { var other = this._other; if (!other) return; var payload = data;
    try { var RR = window.__SHARED_REG__; var pl2 = (data && data.__pd) ? data.__pd : data; if (RR && RR.__dropOnce && pl2 && pl2.type === RR.__dropOnce) { RR.__dropOnce = null; return; } } catch (e) {}
    try { payload = JSON.parse(JSON.stringify(data)); } catch (e) {} // 真實 PeerJS 會序列化訊息：必須深拷貝，否則跨頁共用同一物件參照會互相污染狀態（曾害接管選舉誤判雙房主）
    try { var R = window.__SHARED_REG__; if (R) { R.__msglog = R.__msglog || []; var pl = (payload && payload.__pg) ? payload.__pd : payload; if (pl && pl.type) R.__msglog.push({ t: Date.now(), from: this.peer, to: other.peer, type: pl.type, stamp: payload.__pg || null, uid: pl.uid, players: pl.players ? pl.players.map(function(p){return String(p.id);}) : undefined }); } } catch (e) {}
    setTimeout(function () { emit(other, 'data', payload); }, 0); };
  DataConn.prototype.close = function () { if (this._other) emit(this._other, 'close'); emit(this, 'close'); };
  function MediaConn(localPeer, remotePeer, stream) { this._h = {}; this.peer = remotePeer ? remotePeer.id : null; this._local = localPeer; this._remote = remotePeer; this._stream = stream; }
  MediaConn.prototype.on = function (ev, fn) { on(this, ev, fn); };
  MediaConn.prototype.answer = function (stream) { var other = this._other; var self = this; setTimeout(function () { if (other) emit(other, 'stream', stream || fakeStream()); if (self._stream) emit(self, 'stream', self._stream); }, 0); };
  MediaConn.prototype.close = function () {};
  function Peer(id) {
    this._h = {}; this.id = id || ('mock-' + Math.random().toString(36).slice(2, 10));
    this.connections = {};
    REG[this.id] = this;
    var self = this;
    setTimeout(function () { emit(self, 'open', self.id); }, 0);
  }
  Peer.prototype.on = function (ev, fn) { on(this, ev, fn); };
  Peer.prototype.connect = function (remoteId) {
    var remote = REG[remoteId];
    var a = new DataConn(this, remote); var b = new DataConn(remote, this);
    a._other = b; b._other = a;
    setTimeout(function () {
      a.open = true; b.open = true;
      if (remote) emit(remote, 'connection', b);
      emit(a, 'open'); emit(b, 'open');
    }, (typeof window !== 'undefined' && window.__MOCK_OPEN_DELAY__) || 0);
    return a;
  };
  Peer.prototype.call = function (remoteId, stream) {
    var remote = REG[remoteId];
    var a = new MediaConn(this, remote, null); var b = new MediaConn(remote, this, stream);
    a._other = b; b._other = a;
    setTimeout(function () { if (remote) emit(remote, 'call', b); }, 0);
    return a;
  };
  Peer.prototype.disconnect = function () {};
  Peer.prototype.destroy = function () { delete REG[this.id]; };
  Peer.prototype.listAllPeers = function (cb) { cb(Object.keys(REG)); };
  window.Peer = Peer;
})();
`;

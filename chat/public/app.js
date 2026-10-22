(() => {
  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var a;
  var s;
  var h;
  var p;
  var v;
  var y;
  var d = {};
  var w = [];
  var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var g = Array.isArray;
  function m(n3, l2) {
    for (var u2 in l2) n3[u2] = l2[u2];
    return n3;
  }
  function b(n3) {
    n3 && n3.parentNode && n3.parentNode.removeChild(n3);
  }
  function k(l2, u2, t3) {
    var i2, r2, o2, e2 = {};
    for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
    if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
    return x(l2, e2, i2, r2, null);
  }
  function x(n3, t3, i2, r2, o2) {
    var e2 = { type: n3, props: t3, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u : o2, __i: -1, __u: 0 };
    return null == o2 && null != l.vnode && l.vnode(e2), e2;
  }
  function S(n3) {
    return n3.children;
  }
  function C(n3, l2) {
    this.props = n3, this.context = l2;
  }
  function $(n3, l2) {
    if (null == l2) return n3.__ ? $(n3.__, n3.__i + 1) : null;
    for (var u2; l2 < n3.__k.length; l2++) if (null != (u2 = n3.__k[l2]) && null != u2.__e) return u2.__e;
    return "function" == typeof n3.type ? $(n3) : null;
  }
  function I(n3) {
    if (n3.__P && n3.__d) {
      var u2 = n3.__v, t3 = u2.__e, i2 = [], r2 = [], o2 = m({}, u2);
      o2.__v = u2.__v + 1, l.vnode && l.vnode(o2), q(n3.__P, o2, u2, n3.__n, n3.__P.namespaceURI, 32 & u2.__u ? [t3] : null, i2, null == t3 ? $(u2) : t3, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t3 && P(o2);
    }
  }
  function P(n3) {
    if (null != (n3 = n3.__) && null != n3.__c) return n3.__e = n3.__c.base = null, n3.__k.some(function(l2) {
      if (null != l2 && null != l2.__e) return n3.__e = n3.__c.base = l2.__e;
    }), P(n3);
  }
  function A(n3) {
    (!n3.__d && (n3.__d = true) && i.push(n3) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
  }
  function H() {
    try {
      for (var n3, l2 = 1; i.length; ) i.length > l2 && i.sort(e), n3 = i.shift(), l2 = i.length, I(n3);
    } finally {
      i.length = H.__r = 0;
    }
  }
  function L(n3, l2, u2, t3, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, _2, g2 = t3 && t3.__k || w, m3 = l2.length;
    for (f2 = T(u2, l2, g2, f2, m3), s2 = 0; s2 < m3; s2++) null != (p2 = u2.__k[s2]) && (h2 = -1 != p2.__i && g2[p2.__i] || d, p2.__i = s2, _2 = q(n3, p2, h2, i2, r2, o2, e2, f2, c2, a2), v2 = p2.__e, p2.ref && h2.ref != p2.ref && (h2.ref && J(h2.ref, null, p2), a2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), 4 & p2.__u ? (f2 = j(p2, f2, n3), h2.__e && (h2.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
    return u2.__e = y2, f2;
  }
  function T(n3, l2, u2, t3, i2) {
    var r2, o2, e2, f2, c2, a2 = u2.length, s2 = a2, h2 = 0;
    for (n3.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n3.__k[r2] = x(null, o2, null, null, null) : g(o2) ? o2 = n3.__k[r2] = x(S, { children: o2 }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n3.__k[r2] = x(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n3.__k[r2] = o2, f2 = r2 + h2, o2.__ = n3, o2.__b = n3.__b + 1, e2 = null, -1 != (c2 = o2.__i = O(o2, u2, f2, s2)) && (s2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > a2 ? h2-- : i2 < a2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n3.__k[r2] = null;
    if (s2) for (r2 = 0; r2 < a2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t3 && (t3 = $(e2)), K(e2, e2));
    return t3;
  }
  function j(n3, l2, u2) {
    var t3, i2;
    if ("function" == typeof n3.type) {
      for (t3 = n3.__k, i2 = 0; t3 && i2 < t3.length; i2++) t3[i2] && (t3[i2].__ = n3, l2 = j(t3[i2], l2, u2));
      return l2;
    }
    n3.__e != l2 && (l2 && n3.type && !l2.parentNode && (l2 = $(n3)), l2 = u2.insertBefore(n3.__e, l2 || null));
    do {
      l2 = l2 && l2.nextSibling;
    } while (null != l2 && 8 == l2.nodeType);
    return l2;
  }
  function O(n3, l2, u2, t3) {
    var i2, r2, o2, e2 = n3.key, f2 = n3.type, c2 = l2[u2], a2 = null != c2 && 0 == (2 & c2.__u);
    if (null === c2 && null == e2 || a2 && e2 == c2.key && f2 == c2.type) return u2;
    if (t3 > (a2 ? 1 : 0)) {
      for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
    }
    return -1;
  }
  function z(n3, l2, u2) {
    "-" == l2[0] ? n3.setProperty(l2, null == u2 ? "" : u2) : n3[l2] = null == u2 ? "" : "number" != typeof u2 || _.test(l2) ? u2 : u2 + "px";
  }
  function N(n3, l2, u2, t3, i2) {
    var r2, o2;
    n: if ("style" == l2) if ("string" == typeof u2) n3.style.cssText = u2;
    else {
      if ("string" == typeof t3 && (n3.style.cssText = t3 = ""), t3) for (l2 in t3) u2 && l2 in u2 || z(n3.style, l2, "");
      if (u2) for (l2 in u2) t3 && u2[l2] == t3[l2] || z(n3.style, l2, u2[l2]);
    }
    else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(s, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n3 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n3.l || (n3.l = {}), n3.l[l2 + r2] = u2, u2 ? t3 ? u2[a] = t3[a] : (u2[a] = h, n3.addEventListener(l2, r2 ? v : p, r2)) : n3.removeEventListener(l2, r2 ? v : p, r2);
    else {
      if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n3) try {
        n3[l2] = null == u2 ? "" : u2;
        break n;
      } catch (n4) {
      }
      "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n3.removeAttribute(l2) : n3.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
    }
  }
  function V(n3) {
    return function(u2) {
      if (this.l) {
        var t3 = this.l[u2.type + n3];
        if (null == u2[c]) u2[c] = h++;
        else if (u2[c] < t3[a]) return;
        return t3(l.event ? l.event(u2) : u2);
      }
    };
  }
  function q(n3, u2, t3, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, d2, _2, k2, x2, M, I2, P2, A2, H2, T2, j2, F = u2.type;
    if (void 0 !== u2.constructor) return null;
    128 & t3.__u && (c2 = !!(32 & t3.__u), o2 = [f2 = u2.__e = t3.__e]), (s2 = l.__b) && s2(u2);
    n: if ("function" == typeof F) {
      h2 = e2.length;
      try {
        if (x2 = u2.props, M = F.prototype && F.prototype.render, I2 = (s2 = F.contextType) && i2[s2.__c], P2 = s2 ? I2 ? I2.props.value : s2.__ : i2, t3.__c ? k2 = (p2 = u2.__c = t3.__c).__ = p2.__E : (M ? u2.__c = p2 = new F(x2, P2) : (u2.__c = p2 = new C(x2, P2), p2.constructor = F, p2.render = Q), I2 && I2.sub(p2), p2.state || (p2.state = {}), p2.__n = i2, v2 = p2.__d = true, p2.__h = [], p2._sb = []), M && null == p2.__s && (p2.__s = p2.state), M && null != F.getDerivedStateFromProps && (p2.__s == p2.state && (p2.__s = m({}, p2.__s)), m(p2.__s, F.getDerivedStateFromProps(x2, p2.__s))), y2 = p2.props, d2 = p2.state, p2.__v = u2, v2) M && null == F.getDerivedStateFromProps && null != p2.componentWillMount && p2.componentWillMount(), M && null != p2.componentDidMount && p2.__h.push(p2.componentDidMount);
        else {
          if (M && null == F.getDerivedStateFromProps && x2 !== y2 && null != p2.componentWillReceiveProps && p2.componentWillReceiveProps(x2, P2), u2.__v == t3.__v || !p2.__e && null != p2.shouldComponentUpdate && false === p2.shouldComponentUpdate(x2, p2.__s, P2)) {
            u2.__v != t3.__v && (p2.props = x2, p2.state = p2.__s, p2.__d = false), u2.__e = t3.__e, u2.__k = t3.__k, u2.__k.some(function(n4) {
              n4 && (n4.__ = u2);
            }), w.push.apply(p2.__h, p2._sb), p2._sb = [], p2.__h.length && e2.push(p2), f2 = $(t3);
            break n;
          }
          null != p2.componentWillUpdate && p2.componentWillUpdate(x2, p2.__s, P2), M && null != p2.componentDidUpdate && p2.__h.push(function() {
            p2.componentDidUpdate(y2, d2, _2);
          });
        }
        if (p2.context = P2, p2.props = x2, p2.__P = n3, p2.__e = false, A2 = l.__r, H2 = 0, M) p2.state = p2.__s, p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), w.push.apply(p2.__h, p2._sb), p2._sb = [];
        else do {
          p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), p2.state = p2.__s;
        } while (p2.__d && ++H2 < 25);
        p2.state = p2.__s, null != p2.getChildContext && (i2 = m(m({}, i2), p2.getChildContext())), M && !v2 && null != p2.getSnapshotBeforeUpdate && (_2 = p2.getSnapshotBeforeUpdate(y2, d2)), T2 = null != s2 && s2.type === S && null == s2.key ? E(s2.props.children) : s2, f2 = L(n3, g(T2) ? T2 : [T2], u2, t3, i2, r2, o2, e2, f2, c2, a2), p2.base = u2.__e, u2.__u &= -161, p2.__h.length && e2.push(p2), k2 && (p2.__E = p2.__ = null);
      } catch (n4) {
        if (e2.length = h2, u2.__v = null, c2 || null != o2) {
          if (n4.then) {
            for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
            null != o2 && (o2[o2.indexOf(f2)] = null), u2.__e = f2;
          } else if (null != o2) for (j2 = o2.length; j2--; ) b(o2[j2]);
        } else u2.__e = t3.__e;
        null == u2.__k && (u2.__k = t3.__k || []), n4.then || B(u2), l.__e(n4, u2, t3);
      }
    } else null == o2 && u2.__v == t3.__v ? (u2.__k = t3.__k, u2.__e = t3.__e) : f2 = u2.__e = G(t3.__e, u2, t3, i2, r2, o2, e2, c2, a2);
    return (s2 = l.diffed) && s2(u2), 128 & u2.__u ? void 0 : f2;
  }
  function B(n3) {
    n3 && (n3.__c && (n3.__c.__e = true), n3.__k && n3.__k.some(B));
  }
  function D(n3, u2, t3) {
    for (var i2 = 0; i2 < t3.length; i2++) J(t3[i2], t3[++i2], t3[++i2]);
    l.__c && l.__c(u2, n3), n3.some(function(u3) {
      try {
        n3 = u3.__h, u3.__h = [], n3.some(function(n4) {
          n4.call(u3);
        });
      } catch (n4) {
        l.__e(n4, u3.__v);
      }
    });
  }
  function E(n3) {
    return "object" != typeof n3 || null == n3 || n3.__b > 0 ? n3 : g(n3) ? n3.map(E) : void 0 !== n3.constructor ? null : m({}, n3);
  }
  function G(u2, t3, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, w2, _2, m3 = i2.props || d, k2 = t3.props, x2 = t3.type;
    if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
      for (s2 = 0; s2 < e2.length; s2++) if ((y2 = e2[s2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
        u2 = y2, e2[s2] = null;
        break;
      }
    }
    if (null == u2) {
      if (null == x2) return document.createTextNode(k2);
      u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l.__m && l.__m(t3, e2), c2 = false), e2 = null;
    }
    if (null == x2) m3 === k2 || c2 && u2.data == k2 || (u2.data = k2);
    else {
      if (e2 = "textarea" == x2 && null != k2.defaultValue ? null : e2 && n.call(u2.childNodes), !c2 && null != e2) for (m3 = {}, s2 = 0; s2 < u2.attributes.length; s2++) m3[(y2 = u2.attributes[s2]).name] = y2.value;
      for (s2 in m3) y2 = m3[s2], "dangerouslySetInnerHTML" == s2 ? p2 = y2 : "children" == s2 || s2 in k2 || "value" == s2 && "defaultValue" in k2 || "checked" == s2 && "defaultChecked" in k2 || N(u2, s2, null, y2, o2);
      for (s2 in k2) y2 = k2[s2], "children" == s2 ? v2 = y2 : "dangerouslySetInnerHTML" == s2 ? h2 = y2 : "value" == s2 ? w2 = y2 : "checked" == s2 ? _2 = y2 : c2 && "function" != typeof y2 || m3[s2] === y2 || N(u2, s2, y2, m3[s2], o2);
      if (h2) c2 || p2 && (h2.__html == p2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t3.__k = [];
      else if (p2 && (u2.innerHTML = ""), L("template" == t3.type ? u2.content : u2, g(v2) ? v2 : [v2], t3, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $(i2, 0), c2, a2), null != e2) for (s2 = e2.length; s2--; ) b(e2[s2]);
      c2 && "textarea" != x2 || (s2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[s2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m3[s2]) && N(u2, s2, w2, m3[s2], o2), s2 = "checked", null != _2 && _2 != u2[s2] && N(u2, s2, _2, m3[s2], o2));
    }
    return u2;
  }
  function J(n3, u2, t3) {
    try {
      if ("function" == typeof n3) {
        var i2 = "function" == typeof n3.__u;
        i2 && n3.__u(), i2 && null == u2 || (n3.__u = n3(u2));
      } else n3.current = u2;
    } catch (n4) {
      l.__e(n4, t3);
    }
  }
  function K(n3, u2, t3) {
    var i2, r2;
    if (l.unmount && l.unmount(n3), (i2 = n3.ref) && (i2.current && i2.current != n3.__e || J(i2, null, u2)), null != (i2 = n3.__c)) {
      if (i2.componentWillUnmount) try {
        i2.componentWillUnmount();
      } catch (n4) {
        l.__e(n4, u2);
      }
      i2.base = i2.__P = i2.__n = null;
    }
    if (i2 = n3.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K(i2[r2], u2, t3 || "function" != typeof n3.type);
    t3 || b(n3.__e), n3.__c = n3.__ = n3.__e = void 0;
  }
  function Q(n3, l2, u2) {
    return this.constructor(n3, u2);
  }
  function R(u2, t3, i2) {
    var r2, o2, e2, f2;
    t3 == document && (t3 = document.documentElement), l.__ && l.__(u2, t3), o2 = (r2 = "function" == typeof i2) ? null : i2 && i2.__k || t3.__k, e2 = [], f2 = [], q(t3, u2 = (!r2 && i2 || t3).__k = k(S, null, [u2]), o2 || d, d, t3.namespaceURI, !r2 && i2 ? [i2] : o2 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e2, !r2 && i2 ? i2 : o2 ? o2.__e : t3.firstChild, r2, f2), D(e2, u2, f2), u2.props.children = null;
  }
  n = w.slice, l = { __e: function(n3, l2, u2, t3) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n3)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n3, t3 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n3 = l3;
    }
    throw n3;
  } }, u = 0, t = function(n3) {
    return null != n3 && void 0 === n3.constructor;
  }, C.prototype.setState = function(n3, l2) {
    var u2;
    u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n3 && (n3 = n3(m({}, u2), this.props)), n3 && m(u2, n3), null != n3 && this.__v && (l2 && this._sb.push(l2), A(this));
  }, C.prototype.forceUpdate = function(n3) {
    this.__v && (this.__e = true, n3 && this.__h.push(n3), A(this));
  }, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n3, l2) {
    return n3.__v.__b - l2.__v.__b;
  }, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

  // node_modules/htm/dist/htm.module.js
  var n2 = function(t3, s2, r2, e2) {
    var u2;
    s2[0] = 0;
    for (var h2 = 1; h2 < s2.length; h2++) {
      var p2 = s2[h2++], a2 = s2[h2] ? (s2[0] |= p2 ? 1 : 2, r2[s2[h2++]]) : s2[++h2];
      3 === p2 ? e2[0] = a2 : 4 === p2 ? e2[1] = Object.assign(e2[1] || {}, a2) : 5 === p2 ? (e2[1] = e2[1] || {})[s2[++h2]] = a2 : 6 === p2 ? e2[1][s2[++h2]] += a2 + "" : p2 ? (u2 = t3.apply(a2, n2(t3, a2, r2, ["", null])), e2.push(u2), a2[0] ? s2[0] |= 2 : (s2[h2 - 2] = 0, s2[h2] = u2)) : e2.push(a2);
    }
    return e2;
  };
  var t2 = /* @__PURE__ */ new Map();
  function htm_module_default(s2) {
    var r2 = t2.get(this);
    return r2 || (r2 = /* @__PURE__ */ new Map(), t2.set(this, r2)), (r2 = n2(this, r2.get(s2) || (r2.set(s2, r2 = (function(n3) {
      for (var t3, s3, r3 = 1, e2 = "", u2 = "", h2 = [0], p2 = function(n4) {
        1 === r3 && (n4 || (e2 = e2.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h2.push(0, n4, e2) : 3 === r3 && (n4 || e2) ? (h2.push(3, n4, e2), r3 = 2) : 2 === r3 && "..." === e2 && n4 ? h2.push(4, n4, 0) : 2 === r3 && e2 && !n4 ? h2.push(5, 0, true, e2) : r3 >= 5 && ((e2 || !n4 && 5 === r3) && (h2.push(r3, 0, e2, s3), r3 = 6), n4 && (h2.push(r3, n4, 0, s3), r3 = 6)), e2 = "";
      }, a2 = 0; a2 < n3.length; a2++) {
        a2 && (1 === r3 && p2(), p2(a2));
        for (var l2 = 0; l2 < n3[a2].length; l2++) t3 = n3[a2][l2], 1 === r3 ? "<" === t3 ? (p2(), h2 = [h2], r3 = 3) : e2 += t3 : 4 === r3 ? "--" === e2 && ">" === t3 ? (r3 = 1, e2 = "") : e2 = t3 + e2[0] : u2 ? t3 === u2 ? u2 = "" : e2 += t3 : '"' === t3 || "'" === t3 ? u2 = t3 : ">" === t3 ? (p2(), r3 = 1) : r3 && ("=" === t3 ? (r3 = 5, s3 = e2, e2 = "") : "/" === t3 && (r3 < 5 || ">" === n3[a2][l2 + 1]) ? (p2(), 3 === r3 && (h2 = h2[0]), r3 = h2, (h2 = h2[0]).push(2, 0, r3), r3 = 0) : " " === t3 || "	" === t3 || "\n" === t3 || "\r" === t3 ? (p2(), r3 = 2) : e2 += t3), 3 === r3 && "!--" === e2 && (r3 = 4, h2 = h2[0]);
      }
      return p2(), h2;
    })(s2)), r2), arguments, [])).length > 1 ? r2 : r2[0];
  }

  // node_modules/htm/preact/index.module.js
  var m2 = htm_module_default.bind(k);

  // chat/src/open-conversation.js
  var STORAGE_KEY = "hire-juno-chat:open-conversation";
  function rememberOpenConversation(value, storage = globalThis.localStorage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
    }
  }
  function recallOpenConversation(storage = globalThis.localStorage) {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }
  function pickConversationToRestore(saved, { colleagueIds, channelIds, sessionIdsByColleague, defaultSessionId }) {
    if (!saved || typeof saved !== "object") return null;
    if (typeof saved.channelId === "string") {
      return channelIds.includes(saved.channelId) ? { channelId: saved.channelId } : null;
    }
    if (typeof saved.colleagueId === "string" && colleagueIds.includes(saved.colleagueId)) {
      const sessionId = typeof saved.sessionId === "string" ? saved.sessionId : defaultSessionId;
      const known = sessionId === defaultSessionId || (sessionIdsByColleague[saved.colleagueId] ?? []).includes(sessionId);
      return { colleagueId: saved.colleagueId, sessionId: known ? sessionId : defaultSessionId };
    }
    return null;
  }

  // chat/src/app.js
  var paneEl = document.getElementById("pane");
  var paneHeaderEl = document.getElementById("pane-header");
  var hiringModeBannerEl = document.getElementById("hiring-mode-banner");
  var messagesEl = document.getElementById("messages");
  var scrollToBottomButtonEl = document.getElementById("scroll-to-bottom");
  var sidebarEl = document.getElementById("sidebar");
  var notifyPermissionButtonEl = document.getElementById("notify-permission-button");
  var noPersistenceBannerEl = document.getElementById("no-persistence-banner");
  var settingsButtonEl = document.getElementById("settings-button");
  var settingsBackdropEl = document.getElementById("settings-backdrop");
  var settingsModalEl = document.getElementById("settings-modal");
  var settingsCloseEl = document.getElementById("settings-close");
  var usageSummaryEl = document.getElementById("usage-summary");
  var usageTableEl = document.getElementById("usage-table");
  var autoModeListEl = document.getElementById("auto-mode-list");
  var workforceSwitcherEl = document.getElementById("workforce-switcher");
  var workforceMenuEl = document.getElementById("workforce-menu");
  var workforceListEl = document.getElementById("workforce-list");
  var workforceAddFormEl = document.getElementById("workforce-add-form");
  var workforceAddInputEl = document.getElementById("workforce-add-input");
  var workforceErrorEl = document.getElementById("workforce-error");
  var settingsNotifyRowEl = document.getElementById("settings-notify-row");
  var usageLimitsEl = document.getElementById("usage-limits");
  var sidebarSearchInputEl = document.getElementById("sidebar-search-input");
  var convSettingsBackdropEl = document.getElementById("conv-settings-backdrop");
  var convSettingsModalEl = document.getElementById("conv-settings-modal");
  var convSettingsTitleEl = document.getElementById("conv-settings-modal__title");
  var convSettingsCloseEl = document.getElementById("conv-settings-close");
  var convSettingsAutoModeEl = document.getElementById("conv-settings-auto-mode");
  var convSettingsNewSessionSectionEl = document.getElementById("conv-settings-new-session-section");
  var convSettingsNewSessionEl = document.getElementById("conv-settings-new-session");
  var convSearchInputEl = document.getElementById("conv-search-input");
  var convSearchResultsEl = document.getElementById("conv-search-results");
  var convResetContextEl = document.getElementById("conv-reset-context");
  var convClearChatEl = document.getElementById("conv-clear-chat");
  var convClearChatLabelEl = document.getElementById("conv-clear-chat-label");
  var form = document.getElementById("composer");
  var input = document.getElementById("composer-input");
  var fileInput = document.getElementById("composer-file");
  var attachmentPreviewEl = document.getElementById("attachment-preview");
  var sendButton = form.querySelector('button[type="submit"]');
  var attachButtonEl = document.getElementById("attach-button");
  var imageLightboxEl = document.getElementById("image-lightbox");
  var imageLightboxImgEl = document.getElementById("image-lightbox-img");
  var diffButtonEl = document.getElementById("diff-button");
  var diffBackdropEl = document.getElementById("diff-backdrop");
  var diffModalEl = document.getElementById("diff-modal");
  var diffCloseEl = document.getElementById("diff-close");
  var diffRefreshEl = document.getElementById("diff-refresh");
  var diffModalCwdEl = document.getElementById("diff-modal__cwd");
  var diffFileListEl = document.getElementById("diff-file-list");
  var diffContentEl = document.getElementById("diff-content");
  var appEl = document.getElementById("app");
  var mobileBackButtonEl = document.getElementById("mobile-back-button");
  mobileBackButtonEl.addEventListener("click", () => appEl.classList.remove("pane-active"));
  document.getElementById("mobile-tab-chats").addEventListener("click", () => appEl.classList.remove("pane-active"));
  document.getElementById("mobile-tab-changes").addEventListener("click", () => openDiffModal());
  document.getElementById("mobile-tab-settings").addEventListener("click", () => openSettingsModal());
  var brandNameEl = document.getElementById("brand-name");
  var brandLogoEl = document.getElementById("brand-logo");
  var brandingLogoPreviewEl = document.getElementById("branding-logo-preview");
  var brandingLogoFileEl = document.getElementById("branding-logo-file");
  var brandingUploadButtonEl = document.getElementById("branding-upload-button");
  var brandingErrorEl = document.getElementById("branding-error");
  var DEFAULT_SESSION_ID = "default";
  function convKey(colleagueId, sessionId) {
    return `${colleagueId}::${sessionId || DEFAULT_SESSION_ID}`;
  }
  function channelKey(colleagueId, channelId) {
    return `${colleagueId}::${channelId}`;
  }
  var activeColleagueId = null;
  var activeSessionId = DEFAULT_SESSION_ID;
  var activeChannelId = null;
  function activeConvKey() {
    if (!activeColleagueId) return null;
    return isSubagentThread(activeColleagueId) ? activeColleagueId : convKey(activeColleagueId, activeSessionId);
  }
  var showChannelForm = false;
  var colleagueSessions = /* @__PURE__ */ new Map();
  var lastSessionByColleague = /* @__PURE__ */ new Map();
  function sessionKeysFor(colleagueId) {
    return [
      convKey(colleagueId, DEFAULT_SESSION_ID),
      ...(colleagueSessions.get(colleagueId) || []).map((s2) => convKey(colleagueId, s2.id))
    ];
  }
  var showSessionForm = /* @__PURE__ */ new Set();
  var autoModeKeys = /* @__PURE__ */ new Set();
  var unreadConversations = /* @__PURE__ */ new Set();
  var UNREAD_CHANNEL_PREFIX = "channel:";
  function channelConvKey(channelId) {
    return UNREAD_CHANNEL_PREFIX + channelId;
  }
  var drafts = /* @__PURE__ */ new Map();
  function currentDraftKey() {
    if (activeChannelId) return channelConvKey(activeChannelId);
    if (activeColleagueId && !isSubagentThread(activeColleagueId)) return convKey(activeColleagueId, activeSessionId);
    return null;
  }
  function saveDraft() {
    const key = currentDraftKey();
    if (!key) return;
    if (input.value) drafts.set(key, input.value);
    else drafts.delete(key);
  }
  var BASE_TITLE = document.title;
  function refreshUnreadTitle() {
    document.title = unreadConversations.size > 0 ? `(${unreadConversations.size}) ${BASE_TITLE}` : BASE_TITLE;
  }
  var channelsById = /* @__PURE__ */ new Map();
  var channelMessages = /* @__PURE__ */ new Map();
  var channelTyping = /* @__PURE__ */ new Map();
  var channelStreaming = /* @__PURE__ */ new Map();
  var channelThinkingStreaming = /* @__PURE__ */ new Map();
  var channelPendingTrail = /* @__PURE__ */ new Map();
  var channelPendingPermission = /* @__PURE__ */ new Map();
  var colleagueStats = /* @__PURE__ */ new Map();
  var gatekeeperUsage = { calls: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 };
  function formatMessageTime(createdAt) {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function formatTokenCount(n3) {
    if (typeof n3 !== "number") return "?";
    if (n3 >= 1e6) return (n3 / 1e6).toFixed(1) + "M";
    if (n3 >= 1e3) return (n3 / 1e3).toFixed(1) + "k";
    return String(n3);
  }
  function formatCost(usd) {
    return typeof usd === "number" ? `$${usd.toFixed(4)}` : "\u2013";
  }
  function describeConvKey(key) {
    const [colleagueId, sessionId] = key.split("::");
    const name = colleaguesById.get(colleagueId)?.name || colleagueId;
    if (sessionId === DEFAULT_SESSION_ID) return name;
    const session = (colleagueSessions.get(colleagueId) || []).find((s2) => s2.id === sessionId);
    return `${name} \u2014 ${session?.title || sessionId}`;
  }
  function statsLine(colleagueId) {
    const stats = colleagueStats.get(colleagueId);
    if (!stats) return null;
    const parts = [];
    if (stats.model) parts.push(stats.model);
    if (stats.effort) parts.push(`effort: ${stats.effort}`);
    if (typeof stats.totalTokens === "number") parts.push(`${formatTokenCount(stats.totalTokens)} tokens`);
    if (typeof stats.costUsd === "number") parts.push(formatCost(stats.costUsd));
    return parts.length ? parts.join(" \xB7 ") : null;
  }
  function toggleAutoMode() {
    const key = activeConvKey();
    const enabled = !autoModeKeys.has(key);
    if (enabled) autoModeKeys.add(key);
    else autoModeKeys.delete(key);
    socket.send(JSON.stringify({ type: "set_auto_mode", colleagueId: activeColleagueId, sessionId: activeSessionId, enabled }));
    renderPaneHeader();
  }
  function turnOnAutoMode() {
    const key = activeConvKey();
    if (autoModeKeys.has(key)) return;
    autoModeKeys.add(key);
    socket.send(JSON.stringify({ type: "set_auto_mode", colleagueId: activeColleagueId, sessionId: activeSessionId, enabled: true }));
    renderPaneHeader();
  }
  function resetContext() {
    if (activeChannelId) {
      socket.send(JSON.stringify({ type: "reset_context", channelId: activeChannelId }));
      return;
    }
    if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
      socket.send(JSON.stringify({ type: "reset_context", colleagueId: activeColleagueId, sessionId: activeSessionId }));
      removeAllSubagentPanels(activeColleagueId);
    }
  }
  var alwaysAllowedTools = /* @__PURE__ */ new Map();
  function isAlwaysAllowed(key, toolName) {
    const allowed = alwaysAllowedTools.get(key);
    return Boolean(allowed && (allowed.has("*") || allowed.has(toolName)));
  }
  function rememberAlwaysAllowed(key, toolName) {
    if (!alwaysAllowedTools.has(key)) alwaysAllowedTools.set(key, /* @__PURE__ */ new Set());
    alwaysAllowedTools.get(key).add(toolName);
  }
  function convSettingsAutoModeRowEl(colleague, checked, onChange) {
    const row = document.createElement("label");
    row.className = "auto-mode-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.addEventListener("change", () => onChange(checkbox.checked));
    const nameSpan = document.createElement("span");
    nameSpan.textContent = colleague ? ` ${colleague.name} \u2014 auto mode (allow all tools)` : " Auto mode (allow all tools)";
    row.append(checkbox, nameSpan);
    return row;
  }
  function renderConvSettingsAutoMode() {
    convSettingsAutoModeEl.innerHTML = "";
    if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
      const key = activeConvKey();
      convSettingsAutoModeEl.appendChild(
        convSettingsAutoModeRowEl(null, autoModeKeys.has(key), () => toggleAutoMode())
      );
      return;
    }
    if (activeChannelId) {
      const channel = channelsById.get(activeChannelId);
      for (const id of channel?.memberIds || []) {
        const autopilotKey = channelKey(id, activeChannelId);
        convSettingsAutoModeEl.appendChild(
          convSettingsAutoModeRowEl(colleaguesById.get(id), Boolean(alwaysAllowedTools.get(autopilotKey)?.has("*")), (checked) => {
            if (checked) rememberAlwaysAllowed(autopilotKey, "*");
            else alwaysAllowedTools.delete(autopilotKey);
          })
        );
      }
    }
  }
  function renderConvSettingsNewSession() {
    if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
      convSettingsNewSessionSectionEl.hidden = true;
      return;
    }
    convSettingsNewSessionSectionEl.hidden = false;
    const colleague = colleaguesById.get(activeColleagueId);
    convSettingsNewSessionEl.innerHTML = "";
    const list = document.createElement("ul");
    list.className = "session-list";
    const entries = [
      { id: DEFAULT_SESSION_ID, title: "Main conversation" },
      ...colleagueSessions.get(colleague.id) || []
    ];
    for (const session of entries) {
      const key = convKey(colleague.id, session.id);
      const isCurrent = session.id === activeSessionId;
      const li = document.createElement("li");
      const row = document.createElement(isCurrent ? "div" : "button");
      row.className = "session-list__row" + (isCurrent ? " session-list__row--current" : "");
      if (!isCurrent) row.type = "button";
      const title = document.createElement("span");
      title.className = "session-list__title";
      title.textContent = session.title || "Untitled session";
      row.appendChild(title);
      if (isCurrent) {
        const tag = document.createElement("span");
        tag.className = "session-list__tag";
        tag.textContent = "open";
        row.appendChild(tag);
      }
      appendUnreadBadge(row, key);
      appendDraftBadge(row, key);
      if (!isCurrent) {
        row.addEventListener("click", () => {
          closeConvSettingsModal();
          selectColleague(colleague, session.id);
        });
      }
      li.appendChild(row);
      list.appendChild(li);
    }
    convSettingsNewSessionEl.appendChild(list);
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "secondary-button";
    toggle.innerHTML = "";
    if (showSessionForm.has(colleague.id)) {
      toggle.append(xIconEl(), document.createTextNode(" Cancel"));
    } else {
      toggle.textContent = `+ New session with ${colleague.name}`;
    }
    toggle.addEventListener("click", () => {
      if (showSessionForm.has(colleague.id)) showSessionForm.delete(colleague.id);
      else showSessionForm.add(colleague.id);
      renderConvSettingsNewSession();
    });
    convSettingsNewSessionEl.appendChild(toggle);
    if (showSessionForm.has(colleague.id)) convSettingsNewSessionEl.appendChild(newSessionFormEl(colleague));
  }
  function renderConvSearchResults(query) {
    convSearchResultsEl.innerHTML = "";
    const q2 = query.trim().toLowerCase();
    if (!q2) return;
    const raw = activeChannelId ? channelMessages.get(activeChannelId) || [] : history.get(activeConvKey()) || [];
    const items = raw.map((item, index) => ({ item, index })).filter(({ item }) => item.text && item.text.toLowerCase().includes(q2));
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "No matches in this conversation.";
      convSearchResultsEl.appendChild(li);
      return;
    }
    for (const { item, index } of items) {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.className = "settings-list__label";
      const who = activeChannelId ? item.senderId === "you" ? "You" : item.senderId === "system" ? "System" : colleaguesById.get(item.senderId)?.name || item.senderId : item.role === "you" ? "You" : colleaguesById.get(activeColleagueId)?.name || item.role;
      label.textContent = `${who}: ${truncatePreview(item.text, 80)}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Jump";
      button.addEventListener("click", () => {
        closeConvSettingsModal();
        jumpToMessage(index);
      });
      li.append(label, button);
      convSearchResultsEl.appendChild(li);
    }
  }
  function jumpToMessage(index) {
    const node = messagesEl.querySelectorAll(".message")[index];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("message--highlight");
    setTimeout(() => node.classList.remove("message--highlight"), 1600);
  }
  convSearchInputEl.addEventListener("input", () => renderConvSearchResults(convSearchInputEl.value));
  var convSearchPanelEl = document.getElementById("conv-search-panel");
  var convSearchCloseEl = document.getElementById("conv-search-close");
  var convSearchOpener = null;
  function openConvSearchPanel(opener) {
    convSearchOpener = opener || document.activeElement;
    convSearchPanelEl.hidden = false;
    convSearchInputEl.value = "";
    convSearchResultsEl.innerHTML = "";
    convSearchInputEl.focus();
  }
  function closeConvSearchPanel() {
    if (convSearchPanelEl.hidden) return;
    convSearchPanelEl.hidden = true;
    convSearchInputEl.value = "";
    convSearchResultsEl.innerHTML = "";
    document.querySelector(".pane-header__search-toggle")?.setAttribute("aria-expanded", "false");
    if (convSearchOpener?.isConnected) convSearchOpener.focus?.();
    convSearchOpener = null;
  }
  convSearchCloseEl.addEventListener("click", closeConvSearchPanel);
  convSearchPanelEl.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeConvSearchPanel();
    }
  });
  var clearChatArmed = false;
  function disarmClearChat() {
    clearChatArmed = false;
    convClearChatLabelEl.textContent = "Clear chat";
    convClearChatEl.classList.remove("danger-button--armed");
  }
  convClearChatEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!clearChatArmed) {
      clearChatArmed = true;
      convClearChatLabelEl.textContent = "Really clear? Click again";
      convClearChatEl.classList.add("danger-button--armed");
      return;
    }
    disarmClearChat();
    if (activeChannelId) {
      socket.send(JSON.stringify({ type: "clear_chat", channelId: activeChannelId }));
    } else if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
      socket.send(JSON.stringify({ type: "clear_chat", colleagueId: activeColleagueId, sessionId: activeSessionId }));
    }
  });
  convSettingsModalEl.addEventListener("click", () => {
    if (clearChatArmed) disarmClearChat();
  });
  convResetContextEl.addEventListener("click", () => {
    resetContext();
    closeConvSettingsModal();
  });
  var FOCUSABLE = [
    "a[href]",
    "button:not(:disabled)",
    "input:not(:disabled)",
    "select:not(:disabled)",
    "textarea:not(:disabled)",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");
  var dialogOpener = /* @__PURE__ */ new WeakMap();
  function focusablesIn(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
  }
  function openDialog(backdropEl, modalEl) {
    dialogOpener.set(backdropEl, document.activeElement);
    backdropEl.hidden = false;
    const target = modalEl.querySelector("[data-dialog-close]") || focusablesIn(modalEl)[0] || modalEl;
    target.focus?.();
  }
  function closeDialog(backdropEl) {
    backdropEl.hidden = true;
    const opener = dialogOpener.get(backdropEl);
    dialogOpener.delete(backdropEl);
    if (opener?.isConnected && opener.offsetParent !== null) opener.focus?.();
  }
  function topmostDialog() {
    if (!imageLightboxEl.hidden) return { backdrop: imageLightboxEl, modal: imageLightboxEl, close: closeImageLightbox };
    if (!convSettingsBackdropEl.hidden) return { backdrop: convSettingsBackdropEl, modal: convSettingsModalEl, close: closeConvSettingsModal };
    if (!settingsBackdropEl.hidden) return { backdrop: settingsBackdropEl, modal: settingsModalEl, close: closeSettingsModal };
    if (!diffBackdropEl.hidden) return { backdrop: diffBackdropEl, modal: diffModalEl, close: closeDiffModal };
    return null;
  }
  document.addEventListener("keydown", (event) => {
    const open = topmostDialog();
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      open.close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusablesIn(open.modal);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!open.modal.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  function openConvSettingsModal() {
    if (activeChannelId) {
      convSettingsTitleEl.textContent = `#${channelsById.get(activeChannelId)?.name || activeChannelId} settings`;
    } else {
      convSettingsTitleEl.textContent = `${colleaguesById.get(activeColleagueId)?.name || activeColleagueId} settings`;
    }
    renderConvSettingsAutoMode();
    renderConvSettingsNewSession();
    disarmClearChat();
    openDialog(convSettingsBackdropEl, convSettingsModalEl);
  }
  function closeConvSettingsModal() {
    disarmClearChat();
    closeDialog(convSettingsBackdropEl);
  }
  convSettingsCloseEl.addEventListener("click", closeConvSettingsModal);
  convSettingsBackdropEl.addEventListener("click", (event) => {
    if (event.target === convSettingsBackdropEl) closeConvSettingsModal();
  });
  function renderPaneHeader() {
    paneHeaderEl.innerHTML = "";
    let hasContent = false;
    const entries = document.createElement("div");
    entries.className = "pane-header__entries";
    if (activeColleagueId && !isSubagentThread(activeColleagueId)) {
      const key = activeConvKey();
      paneHeaderEl.appendChild(avatarEl(colleaguesById.get(activeColleagueId)));
      if (activeSessionId && activeSessionId !== DEFAULT_SESSION_ID) {
        const session = (colleagueSessions.get(activeColleagueId) || []).find((s2) => s2.id === activeSessionId);
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "pane-header__session";
        chip.textContent = session?.title || "Untitled session";
        chip.title = "Sessions with this colleague";
        chip.addEventListener("click", openConvSettingsModal);
        entries.appendChild(chip);
      }
      const line = statsLine(key);
      if (line) {
        const span = document.createElement("span");
        span.className = "pane-header__entry";
        span.appendChild(document.createTextNode(line));
        entries.appendChild(span);
      }
      paneHeaderEl.classList.toggle("pane-header--auto-mode", autoModeKeys.has(key));
      hasContent = true;
    } else {
      paneHeaderEl.classList.remove("pane-header--auto-mode");
      if (activeChannelId) {
        const channel = channelsById.get(activeChannelId);
        let totalTokens = 0;
        let totalCost = 0;
        let hasStats = false;
        for (const id of channel?.memberIds || []) {
          const stats = colleagueStats.get(convKey(id, DEFAULT_SESSION_ID));
          if (!stats) continue;
          if (typeof stats.totalTokens === "number") {
            totalTokens += stats.totalTokens;
            hasStats = true;
          }
          if (typeof stats.costUsd === "number") {
            totalCost += stats.costUsd;
            hasStats = true;
          }
        }
        if (hasStats) {
          const span = document.createElement("span");
          span.className = "pane-header__entry";
          span.appendChild(document.createTextNode(`${formatTokenCount(totalTokens)} tokens \xB7 ${formatCost(totalCost)}`));
          entries.appendChild(span);
          hasContent = true;
        }
      }
    }
    if (hasContent && planUsage && typeof planUsage.utilization === "number") {
      entries.appendChild(usageLimitRowEl("Session (5h)", planUsage, { compact: true }));
    }
    if (entries.childElementCount) paneHeaderEl.appendChild(entries);
    if (activeChannelId || activeColleagueId && !isSubagentThread(activeColleagueId)) {
      const actions = document.createElement("div");
      actions.className = "pane-header__actions";
      const searchToggle = document.createElement("button");
      searchToggle.type = "button";
      searchToggle.className = "pane-header__search-toggle";
      searchToggle.setAttribute("aria-label", "Search this conversation");
      searchToggle.setAttribute("aria-expanded", "false");
      searchToggle.setAttribute("aria-controls", "conv-search-panel");
      searchToggle.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      searchToggle.addEventListener("click", () => {
        searchToggle.setAttribute("aria-expanded", "true");
        openConvSearchPanel(searchToggle);
      });
      actions.appendChild(searchToggle);
      const menuButton = document.createElement("button");
      menuButton.type = "button";
      menuButton.className = "pane-header__menu";
      menuButton.title = "Conversation settings";
      menuButton.setAttribute("aria-label", "Conversation settings");
      menuButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
      menuButton.addEventListener("click", openConvSettingsModal);
      actions.appendChild(menuButton);
      paneHeaderEl.appendChild(actions);
      hasContent = true;
    }
    paneHeaderEl.hidden = !hasContent;
    closeConvSearchPanel();
  }
  var planUsage = null;
  async function refreshPlanUsage() {
    try {
      const res = await fetch("api/usage-limits");
      const data = await res.json();
      planUsage = data.rateLimits?.five_hour || null;
    } catch {
      planUsage = null;
    }
    renderPaneHeader();
  }
  var pendingAttachment = null;
  var colleaguesList = [];
  var colleaguesById = /* @__PURE__ */ new Map();
  var history = /* @__PURE__ */ new Map();
  var subagentPanels = /* @__PURE__ */ new Map();
  var streaming = /* @__PURE__ */ new Map();
  var thinkingStreaming = /* @__PURE__ */ new Map();
  var pendingTrail = /* @__PURE__ */ new Map();
  function isTyping(key) {
    return streaming.has(key) || thinkingStreaming.has(key) || pendingTrail.has(key);
  }
  function toolInputSummary(input2) {
    if (!input2) return "";
    const value = input2.command ?? input2.file_path ?? input2.path ?? input2.pattern ?? input2.query;
    const text = typeof value === "string" ? value : JSON.stringify(input2);
    return text.length > 80 ? text.slice(0, 80) + "\u2026" : text;
  }
  function toolUseLine(name, input2) {
    const summary = toolInputSummary(input2);
    return summary ? `${name}: ${summary}` : `Using ${name}\u2026`;
  }
  function reconstructTrail(trail) {
    if (!trail?.length) return void 0;
    return trail.map(
      (entry) => entry.kind === "tool_use" ? { kind: "tool_use", text: toolUseLine(entry.name, entry.input), toolName: entry.name, toolInput: entry.input } : entry
    );
  }
  var pendingPermission = /* @__PURE__ */ new Map();
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function renderInlineMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }
  function renderMarkdown(text) {
    const lines = text.split("\n");
    let html = "";
    let i2 = 0;
    while (i2 < lines.length) {
      const line = lines[i2];
      if (line.startsWith("```")) {
        const codeLines = [];
        i2++;
        while (i2 < lines.length && !lines[i2].startsWith("```")) {
          codeLines.push(lines[i2]);
          i2++;
        }
        i2++;
        html += `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`;
        continue;
      }
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        const level = Math.min(heading[1].length + 2, 6);
        html += `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
        i2++;
        continue;
      }
      if (/^\s*[*-]\s+/.test(line)) {
        const items = [];
        while (i2 < lines.length && /^\s*[*-]\s+/.test(lines[i2])) {
          items.push(`<li>${renderInlineMarkdown(lines[i2].replace(/^\s*[*-]\s+/, ""))}</li>`);
          i2++;
        }
        html += `<ul>${items.join("")}</ul>`;
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i2 < lines.length && /^\s*\d+\.\s+/.test(lines[i2])) {
          items.push(`<li>${renderInlineMarkdown(lines[i2].replace(/^\s*\d+\.\s+/, ""))}</li>`);
          i2++;
        }
        html += `<ol>${items.join("")}</ol>`;
        continue;
      }
      if (line.trim() === "") {
        i2++;
        continue;
      }
      const paraLines = [];
      while (i2 < lines.length && lines[i2].trim() !== "" && !lines[i2].startsWith("```") && !/^(#{1,4})\s+/.test(lines[i2]) && !/^\s*[*-]\s+/.test(lines[i2]) && !/^\s*\d+\.\s+/.test(lines[i2])) {
        paraLines.push(renderInlineMarkdown(lines[i2]));
        i2++;
      }
      html += `<p>${paraLines.join("<br>")}</p>`;
    }
    return html;
  }
  var HIRING_MODE_START = /^:::mode hiring-process:start\s*$/m;
  var HIRING_MODE_END = /^:::mode hiring-process:end\s*$/m;
  var hiringModeConversations = /* @__PURE__ */ new Set();
  function applyHiringModeMarkers(key, text) {
    let result = text;
    if (HIRING_MODE_START.test(result)) {
      hiringModeConversations.add(key);
      result = result.replace(HIRING_MODE_START, "").trim();
    }
    if (HIRING_MODE_END.test(result)) {
      hiringModeConversations.delete(key);
      result = result.replace(HIRING_MODE_END, "").trim();
    }
    return result;
  }
  function refreshHiringModeStyling(key) {
    paneEl.classList.toggle("pane--hiring-mode", hiringModeConversations.has(key));
    hiringModeBannerEl.hidden = !hiringModeConversations.has(key);
  }
  function isConversationVisible(key) {
    return document.hasFocus() && key === activeConvKey();
  }
  function notify(title, body, onClick) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const n3 = new Notification(title, { body, icon: "logo.png" });
    n3.onclick = () => {
      window.focus();
      onClick?.();
      n3.close();
    };
  }
  function refreshNotifyPermissionButton() {
    if (!("Notification" in window)) {
      notifyPermissionButtonEl.hidden = true;
      return;
    }
    notifyPermissionButtonEl.hidden = Notification.permission !== "default";
  }
  function usageRowEl({ colleague, label, model, effort, tokens, cost, className }) {
    const row = document.createElement("tr");
    if (className) row.className = className;
    const whoCell = document.createElement("td");
    whoCell.className = "usage-table__who";
    if (colleague) whoCell.appendChild(avatarEl(colleague));
    whoCell.appendChild(document.createTextNode(label));
    row.appendChild(whoCell);
    const tokensCell = document.createElement("td");
    tokensCell.className = "usage-table__number";
    tokensCell.textContent = formatTokenCount(tokens);
    row.appendChild(tokensCell);
    const costCell = document.createElement("td");
    costCell.className = "usage-table__number";
    costCell.textContent = formatCost(cost);
    row.appendChild(costCell);
    const modelCell = document.createElement("td");
    modelCell.className = "usage-table__model";
    modelCell.textContent = model || "\u2013";
    row.appendChild(modelCell);
    const effortCell = document.createElement("td");
    effortCell.textContent = effort || "\u2013";
    row.appendChild(effortCell);
    return row;
  }
  function renderUsageTable() {
    usageTableEl.innerHTML = "";
    const thead = document.createElement("thead");
    const head = document.createElement("tr");
    head.innerHTML = '<th scope="col">Who</th><th scope="col" class="usage-table__number">Tokens</th><th scope="col" class="usage-table__number">Cost</th><th scope="col">Model</th><th scope="col">Effort</th>';
    thead.appendChild(head);
    usageTableEl.appendChild(thead);
    const tbody = document.createElement("tbody");
    usageTableEl.appendChild(tbody);
    let totalTokens = 0;
    let totalCost = 0;
    for (const [key, stats] of colleagueStats) {
      const tokens = typeof stats.totalTokens === "number" ? stats.totalTokens : 0;
      const cost = typeof stats.costUsd === "number" ? stats.costUsd : 0;
      totalTokens += tokens;
      totalCost += cost;
      const [colleagueId] = key.split("::");
      tbody.appendChild(usageRowEl({
        colleague: colleaguesById.get(colleagueId),
        label: describeConvKey(key),
        model: stats.model,
        effort: stats.effort,
        tokens,
        cost
      }));
    }
    totalTokens += gatekeeperUsage.totalTokens || 0;
    totalCost += gatekeeperUsage.costUsd || 0;
    tbody.appendChild(usageRowEl({
      // The row is a count, and a count of one is singular in the language
      // this interface is written in.
      label: `Gatekeeper (${gatekeeperUsage.calls || 0} ${gatekeeperUsage.calls === 1 ? "call" : "calls"})`,
      model: "haiku",
      tokens: gatekeeperUsage.totalTokens || 0,
      cost: gatekeeperUsage.costUsd
    }));
    tbody.appendChild(usageRowEl({
      label: "Total",
      tokens: totalTokens,
      cost: totalCost,
      className: "usage-table__total"
    }));
    usageSummaryEl.innerHTML = "";
    const tokensBig = document.createElement("span");
    tokensBig.className = "usage-summary__figure";
    tokensBig.textContent = formatTokenCount(totalTokens) + " tokens";
    const costBig = document.createElement("span");
    costBig.className = "usage-summary__figure";
    costBig.textContent = formatCost(totalCost);
    usageSummaryEl.append(tokensBig, document.createTextNode(" \xB7 "), costBig);
  }
  function renderAutoModeList() {
    autoModeListEl.innerHTML = "";
    if (autoModeKeys.size === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "No one-to-one conversation has auto mode on right now. Channel autopilot is not listed here.";
      autoModeListEl.appendChild(li);
      return;
    }
    for (const key of autoModeKeys) {
      const [colleagueId] = key.split("::");
      const li = document.createElement("li");
      li.appendChild(avatarEl(colleaguesById.get(colleagueId)));
      const label = document.createElement("span");
      label.className = "settings-list__label";
      label.textContent = describeConvKey(key);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Turn off";
      button.addEventListener("click", () => {
        const [colleagueId2, sessionId] = key.split("::");
        autoModeKeys.delete(key);
        socket.send(JSON.stringify({ type: "set_auto_mode", colleagueId: colleagueId2, sessionId, enabled: false }));
        renderAutoModeList();
        if (key === activeConvKey()) renderPaneHeader();
      });
      li.append(label, button);
      autoModeListEl.appendChild(li);
    }
  }
  function renderSettingsNotifyRow() {
    settingsNotifyRowEl.innerHTML = "";
    if (!("Notification" in window)) {
      settingsNotifyRowEl.textContent = "Not supported in this browser.";
      return;
    }
    const STATE_TEXT = {
      granted: "Notifications are on.",
      denied: "Notifications are blocked for this site. Browsers only let you undo that in their own site settings, not from a page \u2014 look for notification permissions there.",
      default: "Notifications are off. Turn them on to hear about replies while this window is in the background."
    };
    settingsNotifyRowEl.append(document.createTextNode(STATE_TEXT[Notification.permission] || `Status: ${Notification.permission}`));
    if (Notification.permission === "default") {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Enable";
      button.style.marginLeft = "0.5rem";
      button.addEventListener("click", () => {
        Notification.requestPermission().then(() => {
          refreshNotifyPermissionButton();
          renderSettingsNotifyRow();
        });
      });
      settingsNotifyRowEl.appendChild(button);
    }
  }
  function formatResetAt(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  var USAGE_LIMIT_LABELS = {
    five_hour: "Session (5h)",
    seven_day: "Weekly",
    seven_day_oauth_apps: "Weekly \xB7 OAuth apps",
    seven_day_opus: "Weekly \xB7 Opus",
    seven_day_sonnet: "Weekly \xB7 Sonnet",
    seven_day_overage_included: "Weekly \xB7 overage-included"
  };
  function usageLimitRowEl(label, window2, { compact = false } = {}) {
    const row = document.createElement("div");
    row.className = "usage-limit-row" + (compact ? " usage-limit-row--compact" : "");
    const labelEl = document.createElement("span");
    labelEl.className = "usage-limit-row__label";
    labelEl.textContent = label;
    const pct = typeof window2.utilization === "number" ? Math.max(0, Math.min(100, window2.utilization)) : null;
    const barOuter = document.createElement("div");
    barOuter.className = "usage-limit-row__bar";
    const barInner = document.createElement("div");
    barInner.className = "usage-limit-row__bar-fill";
    if (pct !== null && pct >= 90) barInner.classList.add("usage-limit-row__bar-fill--critical");
    barInner.style.width = (pct ?? 0) + "%";
    barOuter.appendChild(barInner);
    const detail = document.createElement("span");
    detail.className = "usage-limit-row__detail";
    const resets = formatResetAt(window2.resets_at);
    detail.textContent = pct === null ? "\u2014" : compact ? `${Math.round(pct)}%` : `${Math.round(pct)}%${resets ? ` \xB7 resets ${resets}` : ""}`;
    row.append(labelEl, barOuter, detail);
    return row;
  }
  async function renderUsageLimits() {
    usageLimitsEl.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-note";
    loading.textContent = "Loading\u2026";
    usageLimitsEl.appendChild(loading);
    let data;
    try {
      const res = await fetch("api/usage-limits");
      data = await res.json();
    } catch {
      usageLimitsEl.innerHTML = "";
      const note = document.createElement("div");
      note.className = "empty-note";
      note.textContent = "Could not load.";
      usageLimitsEl.appendChild(note);
      return;
    }
    if (settingsBackdropEl.hidden) return;
    usageLimitsEl.innerHTML = "";
    const rateLimits = data.rateLimits;
    if (!rateLimits) {
      const note = document.createElement("div");
      note.className = "empty-note";
      note.textContent = "Not available yet \u2014 message a colleague first this run, or this account has no claude.ai plan limits to report (API key/Bedrock/Vertex sessions don't).";
      usageLimitsEl.appendChild(note);
      return;
    }
    let any = false;
    for (const key of ["five_hour", "seven_day", "seven_day_opus", "seven_day_sonnet", "seven_day_oauth_apps"]) {
      const window2 = rateLimits[key];
      if (!window2) continue;
      any = true;
      usageLimitsEl.appendChild(usageLimitRowEl(USAGE_LIMIT_LABELS[key] || key, window2));
    }
    for (const bucket of rateLimits.model_scoped || []) {
      any = true;
      usageLimitsEl.appendChild(usageLimitRowEl(`Weekly \xB7 ${bucket.display_name}`, bucket));
    }
    if (!any) {
      const note = document.createElement("div");
      note.className = "empty-note";
      note.textContent = "No windows reported.";
      usageLimitsEl.appendChild(note);
    }
    const footnote = document.createElement("div");
    footnote.className = "usage-limits__footnote";
    footnote.textContent = "Best-effort \u2014 reads an experimental Claude Agent SDK API that may change or disappear.";
    usageLimitsEl.appendChild(footnote);
  }
  function refreshSettingsModalIfOpen() {
    if (settingsBackdropEl.hidden) return;
    renderUsageTable();
    renderAutoModeList();
  }
  async function renderWorkforceList() {
    workforceListEl.innerHTML = "";
    const res = await fetch("api/workforces");
    const workforces = await res.json();
    for (const workforce of workforces) {
      const li = document.createElement("li");
      li.className = "workforce-row";
      const pick = document.createElement(workforce.current ? "div" : "button");
      pick.className = "workforce-row__pick";
      if (!workforce.current) {
        pick.type = "button";
        pick.disabled = !workforce.hasTeam;
      }
      const nameRow = document.createElement("span");
      nameRow.className = "workforce-row__name";
      nameRow.textContent = workforce.name;
      if (workforce.current) {
        const tag = document.createElement("span");
        tag.className = "workforce-row__tag";
        tag.textContent = "current";
        nameRow.appendChild(tag);
      }
      pick.appendChild(nameRow);
      const path = document.createElement("span");
      path.className = "workforce-row__path";
      path.textContent = workforce.hasTeam ? workforce.displayPath : `No team/ folder \u2014 ${workforce.displayPath}`;
      path.title = workforce.path;
      pick.appendChild(path);
      if (!workforce.current) {
        pick.addEventListener("click", () => {
          pick.disabled = true;
          nameRow.textContent = `Switching to ${workforce.name}\u2026`;
          switchWorkforce(workforce.path);
        });
      }
      li.appendChild(pick);
      if (!workforce.current) {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "workforce-row__remove";
        removeButton.appendChild(xIconEl());
        removeButton.title = "Remove from this list";
        removeButton.setAttribute("aria-label", `Remove ${workforce.path} from this list`);
        removeButton.addEventListener("click", () => {
          socket.send(JSON.stringify({ type: "remove_workforce", path: workforce.path }));
        });
        li.appendChild(removeButton);
      }
      workforceListEl.appendChild(li);
    }
  }
  function switchWorkforce(path) {
    workforceErrorEl.hidden = true;
    socket.send(JSON.stringify({ type: "switch_workforce", path }));
  }
  workforceAddFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const path = workforceAddInputEl.value.trim();
    if (!path) return;
    workforceErrorEl.hidden = true;
    socket.send(JSON.stringify({ type: "add_workforce", path }));
  });
  function openWorkforceMenu() {
    workforceErrorEl.hidden = true;
    workforceAddInputEl.value = "";
    renderWorkforceList();
    workforceMenuEl.hidden = false;
    workforceSwitcherEl.setAttribute("aria-expanded", "true");
  }
  function closeWorkforceMenu() {
    workforceMenuEl.hidden = true;
    workforceSwitcherEl.setAttribute("aria-expanded", "false");
  }
  workforceSwitcherEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (workforceMenuEl.hidden) openWorkforceMenu();
    else closeWorkforceMenu();
  });
  document.addEventListener("click", (event) => {
    if (workforceMenuEl.hidden) return;
    if (workforceMenuEl.contains(event.target) || workforceSwitcherEl.contains(event.target)) return;
    closeWorkforceMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || workforceMenuEl.hidden) return;
    event.stopPropagation();
    closeWorkforceMenu();
    workforceSwitcherEl.focus();
  }, true);
  function openSettingsModal() {
    renderUsageTable();
    renderAutoModeList();
    renderSettingsNotifyRow();
    renderUsageLimits();
    brandingLogoPreviewEl.src = "logo.png";
    brandingErrorEl.hidden = true;
    openDialog(settingsBackdropEl, settingsModalEl);
  }
  function closeSettingsModal() {
    closeDialog(settingsBackdropEl);
  }
  settingsButtonEl.addEventListener("click", openSettingsModal);
  settingsCloseEl.addEventListener("click", closeSettingsModal);
  settingsBackdropEl.addEventListener("click", (event) => {
    if (event.target === settingsBackdropEl) closeSettingsModal();
  });
  brandingUploadButtonEl.addEventListener("click", () => brandingLogoFileEl.click());
  attachButtonEl.addEventListener("click", () => fileInput.click());
  brandingLogoFileEl.addEventListener("change", () => {
    const file = brandingLogoFileEl.files?.[0];
    brandingLogoFileEl.value = "";
    if (!file) return;
    brandingErrorEl.hidden = true;
    resizeImageToPngDataUrl(file, 512).then((dataUrl) => {
      const commaIndex = dataUrl.indexOf(",");
      const data = commaIndex === -1 ? "" : dataUrl.slice(commaIndex + 1);
      if (!data) return;
      socket.send(JSON.stringify({ type: "upload_logo", data }));
    }).catch(() => {
      brandingErrorEl.textContent = "Could not read that image.";
      brandingErrorEl.hidden = false;
    });
  });
  function resizeImageToPngDataUrl(file, maxDimension) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not decode the picked file as an image"));
      };
      img.src = objectUrl;
    });
  }
  var diffFiles = null;
  var activeDiffPath = null;
  function diffStatusLabel(status) {
    const s2 = status.trim();
    if (s2 === "??") return "new";
    if (s2.includes("R")) return "renamed";
    if (s2.includes("D")) return "deleted";
    if (s2.includes("A")) return "added";
    return "modified";
  }
  function buildDiffFileTree(files) {
    const root = { dirs: /* @__PURE__ */ new Map(), files: [] };
    for (const file of files) {
      const parts = file.path.split("/");
      let node = root;
      for (let i2 = 0; i2 < parts.length - 1; i2++) {
        const segment = parts[i2];
        if (!node.dirs.has(segment)) node.dirs.set(segment, { dirs: /* @__PURE__ */ new Map(), files: [] });
        node = node.dirs.get(segment);
      }
      node.files.push(file);
    }
    return root;
  }
  function collapseDiffFolderChain(name, node) {
    while (node.files.length === 0 && node.dirs.size === 1) {
      const [childName, childNode] = node.dirs.entries().next().value;
      name = `${name}/${childName}`;
      node = childNode;
    }
    return { name, node };
  }
  function diffFileLeafLabel(file) {
    const base = file.path.slice(file.path.lastIndexOf("/") + 1);
    return { base, title: file.label !== file.path ? file.label : file.path };
  }
  function diffFileButton(file) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "diff-file" + (file.path === activeDiffPath ? " diff-file--active" : "");
    const statusLabel = diffStatusLabel(file.status);
    const statusTag = document.createElement("span");
    statusTag.className = `diff-file__status diff-file__status--${statusLabel}`;
    statusTag.textContent = file.status.trim() || "?";
    statusTag.title = statusLabel;
    const { base, title } = diffFileLeafLabel(file);
    const label = document.createElement("span");
    label.className = "diff-file__path";
    label.textContent = base;
    label.title = title;
    button.append(statusTag, label);
    button.addEventListener("click", () => selectDiffFile(file.path));
    return button;
  }
  function renderDiffTreeInto(node, container, depth) {
    const dirNames = [...node.dirs.keys()].sort((a2, b2) => a2.localeCompare(b2));
    for (const rawName of dirNames) {
      const { name, node: target } = collapseDiffFolderChain(rawName, node.dirs.get(rawName));
      const li = document.createElement("li");
      const folderRow = document.createElement("div");
      folderRow.className = "diff-tree__folder";
      folderRow.style.paddingLeft = `${depth * 0.9}rem`;
      folderRow.textContent = name;
      folderRow.title = name;
      li.appendChild(folderRow);
      const group = document.createElement("ul");
      group.className = "diff-tree__group";
      renderDiffTreeInto(target, group, depth + 1);
      li.appendChild(group);
      container.appendChild(li);
    }
    const files = [...node.files].sort((a2, b2) => a2.path.localeCompare(b2.path));
    for (const file of files) {
      const li = document.createElement("li");
      const button = diffFileButton(file);
      button.style.paddingLeft = `${0.5 + depth * 0.9}rem`;
      li.appendChild(button);
      container.appendChild(li);
    }
  }
  function renderDiffFileList() {
    diffFileListEl.innerHTML = "";
    if (diffFiles === null) {
      diffFileListEl.innerHTML = '<li class="empty-note">Not a git repository here, or git isn\u2019t available.</li>';
      return;
    }
    if (diffFiles.length === 0) {
      diffFileListEl.innerHTML = '<li class="empty-note">No changes.</li>';
      return;
    }
    renderDiffTreeInto(buildDiffFileTree(diffFiles), diffFileListEl, 0);
  }
  function renderDiffContent(diffText) {
    diffContentEl.innerHTML = "";
    if (!diffText) {
      diffContentEl.textContent = "No diff available.";
      return;
    }
    for (const line of diffText.split("\n")) {
      const lineEl = document.createElement("div");
      if (line.startsWith("+") && !line.startsWith("+++")) lineEl.className = "diff-line diff-line--add";
      else if (line.startsWith("-") && !line.startsWith("---")) lineEl.className = "diff-line diff-line--del";
      else if (line.startsWith("@@")) lineEl.className = "diff-line diff-line--hunk";
      else if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("+++") || line.startsWith("---")) {
        lineEl.className = "diff-line diff-line--meta";
      } else {
        lineEl.className = "diff-line";
      }
      lineEl.textContent = line || "\xA0";
      diffContentEl.appendChild(lineEl);
    }
  }
  async function loadDiffContent(path) {
    diffContentEl.textContent = "Loading\u2026";
    try {
      const res = await fetch(`api/git-diff?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (activeDiffPath !== path) return;
      renderDiffContent(data.diff);
    } catch {
      if (activeDiffPath === path) diffContentEl.textContent = "Could not load diff.";
    }
  }
  function selectDiffFile(path) {
    activeDiffPath = path;
    renderDiffFileList();
    loadDiffContent(path);
  }
  async function loadDiffFiles() {
    diffFileListEl.innerHTML = '<li class="empty-note">Loading\u2026</li>';
    diffContentEl.textContent = "";
    let data;
    try {
      const res = await fetch("api/git-status");
      data = await res.json();
    } catch {
      diffFiles = null;
      renderDiffFileList();
      return;
    }
    if (diffBackdropEl.hidden) return;
    diffFiles = data.files;
    diffModalCwdEl.textContent = data.cwd || "";
    if (diffFiles && diffFiles.length > 0) {
      if (!activeDiffPath || !diffFiles.some((f2) => f2.path === activeDiffPath)) activeDiffPath = diffFiles[0].path;
    } else {
      activeDiffPath = null;
    }
    renderDiffFileList();
    if (activeDiffPath) loadDiffContent(activeDiffPath);
  }
  function openDiffModal() {
    openDialog(diffBackdropEl, diffModalEl);
    loadDiffFiles();
  }
  function closeDiffModal() {
    closeDialog(diffBackdropEl);
  }
  diffButtonEl.addEventListener("click", openDiffModal);
  diffCloseEl.addEventListener("click", closeDiffModal);
  diffRefreshEl.addEventListener("click", loadDiffFiles);
  diffBackdropEl.addEventListener("click", (event) => {
    if (event.target === diffBackdropEl) closeDiffModal();
  });
  var SCROLL_TO_BOTTOM_THRESHOLD = 48;
  function isNearBottom() {
    return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight <= SCROLL_TO_BOTTOM_THRESHOLD;
  }
  function followThinkingTail() {
    for (const box of messagesEl.querySelectorAll(".message--thinking > span")) box.scrollTop = box.scrollHeight;
  }
  function scrollMessagesToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
    scrollToBottomButtonEl.hidden = true;
  }
  function updateScrollToBottomButton() {
    scrollToBottomButtonEl.hidden = isNearBottom();
  }
  messagesEl.addEventListener("scroll", updateScrollToBottomButton, { passive: true });
  scrollToBottomButtonEl.addEventListener("click", () => scrollMessagesToBottom());
  function openImageLightbox(thumb) {
    imageLightboxImgEl.src = thumb.src;
    imageLightboxImgEl.alt = thumb.alt;
    dialogOpener.set(imageLightboxEl, thumb);
    imageLightboxEl.hidden = false;
    imageLightboxEl.focus();
  }
  function closeImageLightbox() {
    imageLightboxEl.hidden = true;
    imageLightboxImgEl.src = "";
    const opener = dialogOpener.get(imageLightboxEl);
    dialogOpener.delete(imageLightboxEl);
    if (opener?.isConnected) opener.focus?.();
  }
  messagesEl.addEventListener("click", (event) => {
    if (!event.target.classList.contains("attachment-thumb")) return;
    openImageLightbox(event.target);
  });
  messagesEl.addEventListener("keydown", (event) => {
    if (!event.target.classList.contains("attachment-thumb")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openImageLightbox(event.target);
  });
  imageLightboxEl.addEventListener("click", closeImageLightbox);
  function wsUrl() {
    const scheme = location.protocol === "https:" ? "wss://" : "ws://";
    return `${scheme}${location.host}${location.pathname}ws`;
  }
  function registerSubagentColleague(panel) {
    const known = panel.knownColleagueId ? colleaguesById.get(panel.knownColleagueId) : null;
    colleaguesById.set(panel.syntheticId, {
      id: panel.syntheticId,
      name: known ? known.name : panel.subagentType,
      role: panel.taskDescription || (known ? known.role : panel.subagentType),
      hasAvatar: known ? known.hasAvatar : false,
      // avatarEl fetches by this when set, so a known colleague's real
      // photo shows up here too — the synthetic id itself isn't a real
      // colleague the /api/avatar route would recognize.
      avatarId: known ? known.id : null
    });
  }
  function removeSubagentPanel(ownerColleagueId, subagentId) {
    const panels = subagentPanels.get(ownerColleagueId);
    const panel = panels?.get(subagentId);
    if (!panel) return;
    panels.delete(subagentId);
    colleaguesById.delete(panel.syntheticId);
    if (activeColleagueId === panel.syntheticId) {
      const owner = colleaguesById.get(ownerColleagueId);
      if (owner) selectColleague(owner);
    }
    renderSidebar();
  }
  function removeAllSubagentPanels(ownerColleagueId) {
    const panels = subagentPanels.get(ownerColleagueId);
    if (!panels) return;
    for (const subagentId of [...panels.keys()]) removeSubagentPanel(ownerColleagueId, subagentId);
  }
  var handleSocketMessage = (event) => {
    const update = JSON.parse(event.data);
    if (update.type === "channel_created") {
      channelsById.set(update.channel.id, update.channel);
      channelMessages.set(update.channel.id, []);
      renderSidebar();
      selectChannel(update.channel);
      return;
    }
    if (update.type === "session_created") {
      if (!colleagueSessions.has(update.colleagueId)) colleagueSessions.set(update.colleagueId, []);
      colleagueSessions.get(update.colleagueId).push(update.session);
      showSessionForm.delete(update.colleagueId);
      renderSidebar();
      closeConvSettingsModal();
      const colleague = colleaguesById.get(update.colleagueId);
      if (colleague) selectColleague(colleague, update.session.id);
      return;
    }
    if (update.type === "auto_mode_changed") {
      const key2 = convKey(update.colleagueId, update.sessionId);
      if (update.enabled) autoModeKeys.add(key2);
      else autoModeKeys.delete(key2);
      if (key2 === activeConvKey()) renderPaneHeader();
      refreshSettingsModalIfOpen();
      return;
    }
    if (update.type === "chat_cleared") {
      const key2 = update.channelId ? channelConvKey(update.channelId) : convKey(update.colleagueId, update.sessionId);
      history.set(key2, []);
      if (!update.channelId) {
        const rosterColleague = colleaguesById.get(update.colleagueId);
        if (rosterColleague) rosterColleague.lastMessage = null;
      }
      renderSidebar();
      if (key2 === activeConvKey()) {
        if (update.channelId) renderChannelMessages();
        else renderMessages();
      }
      return;
    }
    if (update.type === "gatekeeper_usage") {
      const { calls, inputTokens, outputTokens, totalTokens, costUsd } = update;
      gatekeeperUsage = { calls, inputTokens, outputTokens, totalTokens, costUsd };
      refreshSettingsModalIfOpen();
      return;
    }
    if (update.type === "logo_updated") {
      const bust = `logo.png?t=${Date.now()}`;
      brandLogoEl.src = bust;
      brandingLogoPreviewEl.src = bust;
      return;
    }
    if (update.type === "logo_upload_failed") {
      brandingErrorEl.textContent = `Could not save the new logo: ${update.message}`;
      brandingErrorEl.hidden = false;
      return;
    }
    if (update.type === "workforce_added") {
      workforceAddInputEl.value = "";
      renderWorkforceList();
      return;
    }
    if (update.type === "workforce_add_failed") {
      workforceErrorEl.textContent = update.message;
      workforceErrorEl.hidden = false;
      return;
    }
    if (update.type === "workforce_removed") {
      renderWorkforceList();
      return;
    }
    if (update.type === "workforce_switch_ready") {
      const target = new URL(update.url);
      target.hostname = window.location.hostname;
      window.location.href = target.toString();
      return;
    }
    if (update.type === "workforce_switch_failed") {
      workforceErrorEl.textContent = update.message;
      workforceErrorEl.hidden = false;
      renderWorkforceList();
      return;
    }
    if (update.type === "permission_resolved") {
      for (const [key2, permission] of pendingPermission) {
        if (permission.requestId !== update.requestId) continue;
        pendingPermission.delete(key2);
        if (key2 === activeConvKey()) renderMessages();
      }
      for (const [key2, permission] of channelPendingPermission) {
        if (permission.requestId !== update.requestId) continue;
        channelPendingPermission.delete(key2);
        if (activeChannelId) renderChannelMessages();
      }
      return;
    }
    if (update.type === "channel_message") {
      const text = applyHiringModeMarkers(update.channelId, update.text);
      if (!channelMessages.has(update.channelId)) channelMessages.set(update.channelId, []);
      const attachments = (update.attachments || []).map((a2) => ({
        ...a2,
        dataUrl: `data:${a2.mimeType};base64,${a2.data}`
      }));
      const trail = channelPendingTrail.get(update.senderId) || [];
      if (channelThinkingStreaming.has(update.senderId)) {
        trail.push({ kind: "thinking", text: channelThinkingStreaming.get(update.senderId).text });
      }
      channelPendingTrail.delete(update.senderId);
      channelMessages.get(update.channelId).push({
        senderId: update.senderId,
        text,
        attachments,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        trail: trail.length ? trail : void 0
      });
      channelStreaming.delete(update.senderId);
      channelThinkingStreaming.delete(update.senderId);
      channelTyping.delete(update.senderId);
      const isColleagueMessage = update.senderId !== "you" && update.senderId !== "system";
      if (isColleagueMessage && !(document.hasFocus() && update.channelId === activeChannelId)) {
        const channel = channelsById.get(update.channelId);
        const sender = colleaguesById.get(update.senderId);
        notify(`#${channel?.name || "channel"} \u2014 ${sender?.name || update.senderId}`, text, () => {
          if (channel) selectChannel(channel);
        });
      }
      if (isColleagueMessage && update.channelId !== activeChannelId) {
        unreadConversations.add(UNREAD_CHANNEL_PREFIX + update.channelId);
        refreshUnreadTitle();
        renderSidebar();
      }
      if (update.channelId === activeChannelId) renderChannelMessages();
      return;
    }
    if (update.type === "session_info" || update.type === "usage") {
      const key2 = convKey(update.colleagueId, update.sessionId);
      const stats = colleagueStats.get(key2) || {};
      if (update.type === "session_info") {
        stats.model = update.model;
        stats.effort = update.effort;
      } else {
        stats.inputTokens = update.inputTokens;
        stats.outputTokens = update.outputTokens;
        stats.totalTokens = update.totalTokens;
        stats.costUsd = update.costUsd;
      }
      colleagueStats.set(key2, stats);
      renderPaneHeader();
      refreshSettingsModalIfOpen();
      if (update.type === "usage") refreshPlanUsage();
      return;
    }
    if (update.channelId) {
      const { channelId, colleagueId: colleagueId2 } = update;
      switch (update.type) {
        case "channel_typing":
          if (update.active) channelTyping.set(colleagueId2, channelId);
          else channelTyping.delete(colleagueId2);
          renderSidebar();
          break;
        case "delta":
          channelStreaming.set(colleagueId2, {
            channelId,
            text: (channelStreaming.get(colleagueId2)?.text || "") + update.text
          });
          break;
        case "thinking_delta":
          channelThinkingStreaming.set(colleagueId2, {
            channelId,
            text: (channelThinkingStreaming.get(colleagueId2)?.text || "") + update.text
          });
          break;
        case "tool_use": {
          if (!channelPendingTrail.has(colleagueId2)) channelPendingTrail.set(colleagueId2, []);
          channelPendingTrail.get(colleagueId2).push({
            kind: "tool_use",
            text: toolUseLine(update.name, update.input),
            toolName: update.name,
            toolInput: update.input
          });
          break;
        }
        case "permission_request":
          if (isAlwaysAllowed(channelKey(colleagueId2, channelId), update.toolName)) {
            socket.send(JSON.stringify({ type: "permission_response", requestId: update.requestId, allow: true }));
            break;
          }
          channelPendingPermission.set(channelKey(colleagueId2, channelId), { channelId, ...update });
          break;
        default:
          return;
      }
      if (channelId === activeChannelId) renderChannelMessages();
      return;
    }
    const { colleagueId, sessionId } = update;
    let key = convKey(colleagueId, sessionId);
    if (update.type.startsWith("subagent_")) {
      const ownerColleagueId = colleagueId;
      if (update.type === "subagent_start") {
        if (!subagentPanels.has(ownerColleagueId)) subagentPanels.set(ownerColleagueId, /* @__PURE__ */ new Map());
        const panel2 = {
          id: update.id,
          ownerColleagueId,
          syntheticId: `sub:${update.id}`,
          // When the subagent_type the model picked happens to name a
          // real colleague (Ada addressing "remy" as a subagent, say),
          // her own identity carries over — same avatar, same name,
          // whether she's answering directly or running as someone
          // else's subagent.
          knownColleagueId: colleaguesById.has(update.subagentType) ? update.subagentType : null,
          subagentType: update.subagentType || "subagent",
          taskDescription: update.taskDescription,
          closed: false
        };
        subagentPanels.get(ownerColleagueId).set(update.id, panel2);
        registerSubagentColleague(panel2);
        history.set(panel2.syntheticId, []);
        renderSidebar();
        return;
      }
      const panel = subagentPanels.get(ownerColleagueId)?.get(update.id);
      if (!panel) return;
      key = panel.syntheticId;
      if (update.type === "subagent_tool_use") {
        update.type = "tool_use";
      } else if (update.type === "subagent_delta") {
        update.type = "delta";
      } else if (update.type === "subagent_end") {
        panel.closed = true;
        update.type = "message";
        update.role = "colleague";
        update.text = update.report || "";
        renderSidebar();
      }
    }
    if (!history.has(key)) history.set(key, []);
    switch (update.type) {
      case "delta": {
        const wasTyping = isTyping(key);
        streaming.set(key, (streaming.get(key) || "") + update.text);
        if (!wasTyping) renderSidebar();
        break;
      }
      case "thinking_delta": {
        const wasTyping = isTyping(key);
        thinkingStreaming.set(key, (thinkingStreaming.get(key) || "") + update.text);
        if (!wasTyping) renderSidebar();
        break;
      }
      case "tool_use": {
        const wasTyping = isTyping(key);
        if (!pendingTrail.has(key)) pendingTrail.set(key, []);
        pendingTrail.get(key).push({
          kind: "tool_use",
          text: toolUseLine(update.name, update.input),
          toolName: update.name,
          toolInput: update.input
        });
        if (!wasTyping) renderSidebar();
        break;
      }
      case "message": {
        streaming.delete(key);
        pendingTrail.delete(key);
        thinkingStreaming.delete(key);
        renderSidebar();
        const text = applyHiringModeMarkers(key, update.text);
        for (const waiting of history.get(key)) delete waiting.pending;
        history.get(key).push({
          role: update.role,
          text,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          // update.trail arrives in the raw, persisted shape (see
          // store.js: {kind:'tool_use', name, input}) — the same shape
          // api/history already returns, and reconstructTrail is the
          // exact function that already turns that into what TrailBox
          // renders ({kind:'tool_use', text, toolName, toolInput}).
          // Passing it through unconverted would leave every tool_use
          // line blank: TrailBox reads entry.text, which the raw shape
          // doesn't have.
          trail: reconstructTrail(update.trail)
        });
        if (sessionId === DEFAULT_SESSION_ID && key === convKey(colleagueId, sessionId)) {
          const rosterColleague = colleaguesById.get(colleagueId);
          if (rosterColleague) rosterColleague.lastMessage = { role: update.role, text };
        }
        if (update.role === "colleague" && !isConversationVisible(key)) {
          const target = colleaguesById.get(key) || colleaguesById.get(colleagueId);
          notify(target?.name || colleagueId, text, () => target && selectColleague(target, sessionId));
        }
        if (update.role === "colleague" && key !== activeConvKey()) {
          unreadConversations.add(key);
          refreshUnreadTitle();
          renderSidebar();
        }
        break;
      }
      case "permission_request":
        if (isAlwaysAllowed(key, update.toolName)) {
          socket.send(JSON.stringify({ type: "permission_response", requestId: update.requestId, allow: true }));
          return;
        }
        pendingPermission.set(key, update);
        break;
      default:
        return;
    }
    if (key === activeConvKey()) renderMessages();
  };
  var reconnectDelayMs = 500;
  var reconnectTimer = null;
  function connectSocket() {
    const s2 = new WebSocket(wsUrl());
    s2.addEventListener("message", handleSocketMessage);
    s2.addEventListener("open", () => {
      reconnectDelayMs = 500;
    });
    s2.addEventListener("close", () => {
      if (reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        socket = connectSocket();
      }, reconnectDelayMs);
      reconnectDelayMs = Math.min(reconnectDelayMs * 2, 15e3);
    });
    return s2;
  }
  var socket = connectSocket();
  function reconnectIfDead() {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) return;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectDelayMs = 500;
    socket = connectSocket();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    reconnectIfDead();
  });
  function respondToPermission(key, requestId, allow, isChannel) {
    if (isChannel) {
      channelPendingPermission.delete(key);
      renderChannelMessages();
    } else {
      pendingPermission.delete(key);
      renderMessages();
    }
    socket.send(JSON.stringify({ type: "permission_response", requestId, allow }));
  }
  function PermissionCard({ permission, colleagueId, isChannel }) {
    const key = isChannel ? channelKey(colleagueId, permission.channelId) : colleagueId;
    const allow = () => respondToPermission(key, permission.requestId, true, isChannel);
    const allowAlways = () => {
      rememberAlwaysAllowed(key, permission.toolName);
      respondToPermission(key, permission.requestId, true, isChannel);
    };
    const deny = () => respondToPermission(key, permission.requestId, false, isChannel);
    const autopilot = () => {
      rememberAlwaysAllowed(key, "*");
      if (!isChannel) turnOnAutoMode();
      if (isChannel && permission.channelId === activeChannelId) renderPaneHeader();
      respondToPermission(key, permission.requestId, true, isChannel);
    };
    return m2`
    <div class="permission-card">
      <p>${permission.title || `Wants to use ${permission.displayName || permission.toolName}`}</p>
      ${permission.description ? m2`<p class="permission-card__description">${permission.description}</p>` : null}
      <div class="permission-card__actions">
        <button type="button" onClick=${allow}>Allow</button>
        <button type="button" class="permission-card__allow-always" onClick=${allowAlways}>Allow always</button>
        <button type="button" class="permission-card__deny" onClick=${deny}>Deny</button>
        <button type="button" class="permission-card__autopilot" onClick=${autopilot}>Turn on autopilot</button>
      </div>
    </div>
  `;
  }
  function Avatar({ colleague }) {
    if (colleague?.hasAvatar) {
      const src = `api/avatar?colleagueId=${encodeURIComponent(colleague.avatarId || colleague.id)}`;
      return m2`<img class="avatar" src=${src} alt=${colleague.name} />`;
    }
    return m2`<div class="avatar avatar--initial">${(colleague?.name || "?").charAt(0).toUpperCase()}</div>`;
  }
  function ToolDetailBox({ input: input2 }) {
    if (!input2) return m2`<div class="tool-detail">(no input)</div>`;
    if (Array.isArray(input2.edits)) {
      return m2`<div class="tool-detail">${input2.edits.map((edit, i2) => m2`<${ToolDetailBox} key=${i2} input=${edit} />`)}</div>`;
    }
    if (typeof input2.old_string === "string" && typeof input2.new_string === "string") {
      return m2`
      <div class="tool-detail">
        <div class="tool-detail__label">− removed</div>
        <pre class="tool-detail__removed">${input2.old_string}</pre>
        <div class="tool-detail__label">+ added</div>
        <pre class="tool-detail__added">${input2.new_string}</pre>
      </div>
    `;
    }
    return m2`<div class="tool-detail"><pre>${typeof input2.content === "string" ? input2.content : JSON.stringify(input2, null, 2)}</pre></div>`;
  }
  function TrailBox({ trail, onToggleEntry }) {
    return m2`
    <div class="trail-box">
      ${trail.map(
      (entry, i2) => m2`<div key=${i2} class="trail-box__entry">
            ${entry.kind === "tool_use" ? m2`
                  <span class="tool-use-line" onClick=${() => onToggleEntry(i2)}>${entry.text}</span>
                  ${entry.expanded ? m2`<${ToolDetailBox} input=${entry.toolInput} />` : null}
                ` : m2`<span class="trail-box__thinking">${entry.text}</span>`}
          </div>`
    )}
    </div>
  `;
  }
  function MessageRow({ role, avatarColleague, nameTag, item, toolText, onToggle, onToggleTrailEntry }) {
    const isToolUse = item.toolInput !== void 0;
    const time = formatMessageTime(item.createdAt);
    return m2`
    <${S}>
      ${item.trail?.length ? m2`<${TrailBox} trail=${item.trail} onToggleEntry=${onToggleTrailEntry} />` : null}
      <div class="message message--${role}${item.pending ? " message--pending" : ""}">
        ${avatarColleague ? m2`<${Avatar} colleague=${avatarColleague} />` : null}
        ${isToolUse ? m2`
              <span class="tool-use-line" onClick=${onToggle}>${toolText}</span>
              ${item.expanded ? m2`<${ToolDetailBox} input=${item.toolInput} />` : null}
            ` : m2`
              <span>
                ${nameTag ? m2`<strong class="message__sender">${nameTag}</strong><br />` : null}
                ${item.text ? m2`<span dangerouslySetInnerHTML=${{ __html: renderMarkdown(item.text) }} />` : null}
                ${(item.attachments || []).map(
      (attachment, i2) => m2`<img key=${i2} class="attachment-thumb" src=${attachment.dataUrl} alt=${attachment.name} role="button" tabindex="0" />`
    )}
                ${item.pending ? m2`<time class="message__time">Waiting, not read yet</time>` : time ? m2`<time class="message__time">${time}</time>` : null}
              </span>
            `}
      </div>
    <//>
  `;
  }
  function StreamingRow({ role, colleague, nameTag, text }) {
    return m2`
    <div class="message message--${role} message--streaming">
      ${colleague ? m2`<${Avatar} colleague=${colleague} />` : null}
      <span>
        ${nameTag ? m2`<strong class="message__sender">${nameTag}</strong><br />` : null}
        <span dangerouslySetInnerHTML=${{ __html: renderMarkdown(text) }} />
      </span>
    </div>
  `;
  }
  function xIconEl() {
    const span = document.createElement("span");
    span.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
    return span.firstElementChild;
  }
  function avatarEl(colleague) {
    if (colleague?.hasAvatar) {
      const img = document.createElement("img");
      img.className = "avatar";
      img.src = `api/avatar?colleagueId=${encodeURIComponent(colleague.avatarId || colleague.id)}`;
      img.alt = colleague.name;
      return img;
    }
    const fallback = document.createElement("div");
    fallback.className = "avatar avatar--initial";
    fallback.textContent = (colleague?.name || "?").charAt(0).toUpperCase();
    return fallback;
  }
  function EmptyConversation({ text }) {
    return m2`<p class="conversation-empty">${text}</p>`;
  }
  function renderMessages({ forceScrollToBottom = false } = {}) {
    const stickToBottom = forceScrollToBottom || isNearBottom();
    const key = activeConvKey();
    const items = history.get(key) || [];
    const thinkingText = thinkingStreaming.get(key);
    const partialText = streaming.get(key);
    const permission = pendingPermission.get(key);
    const liveTrail = pendingTrail.get(key) || [];
    const row = (item, i2) => m2`<${MessageRow}
    key=${i2}
    role=${item.role}
    avatarColleague=${null}
    nameTag=${null}
    item=${item}
    toolText=${item.text}
    onToggle=${() => {
      item.expanded = !item.expanded;
      renderMessages();
    }}
    onToggleTrailEntry=${(entryIndex) => {
      item.trail[entryIndex].expanded = !item.trail[entryIndex].expanded;
      renderMessages();
    }}
  />`;
    R(
      m2`<${S}>
      ${items.map((item, i2) => item.pending ? null : row(item, i2))}
      ${thinkingText ? m2`<${StreamingRow} role="thinking" colleague=${null} text=${thinkingText} />` : null}
      ${partialText ? m2`<${StreamingRow} role="colleague" colleague=${null} text=${partialText} />` : null}
      ${liveTrail.length ? m2`<${TrailBox}
            trail=${liveTrail}
            onToggleEntry=${(entryIndex) => {
        liveTrail[entryIndex].expanded = !liveTrail[entryIndex].expanded;
        renderMessages();
      }}
          />` : null}
      ${permission ? m2`<${PermissionCard} permission=${permission} colleagueId=${key} isChannel=${false} />` : null}
      ${items.map((item, i2) => item.pending ? row(item, i2) : null)}
      ${!items.length && !thinkingText && !partialText && !permission ? m2`<${EmptyConversation}
            text=${`No messages with ${colleaguesById.get(activeColleagueId)?.name || "this colleague"} yet. Write the first one below.`}
          />` : null}
    <//>`,
      messagesEl
    );
    refreshHiringModeStyling(key);
    followThinkingTail();
    if (stickToBottom) scrollMessagesToBottom();
    else updateScrollToBottomButton();
  }
  function renderChannelMessages({ forceScrollToBottom = false } = {}) {
    const stickToBottom = forceScrollToBottom || isNearBottom();
    const items = channelMessages.get(activeChannelId) || [];
    const typingEntries = [];
    for (const [colleagueId, channelId] of channelTyping) {
      if (channelId !== activeChannelId) continue;
      const colleague = colleaguesById.get(colleagueId);
      const thinkingPartial = channelThinkingStreaming.get(colleagueId);
      const partial = channelStreaming.get(colleagueId);
      typingEntries.push({
        colleagueId,
        colleague,
        thinkingText: thinkingPartial?.channelId === activeChannelId ? thinkingPartial.text : null,
        liveText: partial?.channelId === activeChannelId ? partial.text : "",
        // Tool calls for her turn still in progress — not attached to a
        // finished item yet (see the 'channel_message' handler), so shown
        // live here, same idea as the 1:1 view's own liveTrail.
        liveTrail: channelPendingTrail.get(colleagueId) || []
      });
    }
    const permissionEntries = [...channelPendingPermission.values()].filter((p2) => p2.channelId === activeChannelId);
    R(
      m2`<${S}>
      ${items.map((item, i2) => {
        const isYou = item.senderId === "you";
        const isSystem = item.senderId === "system";
        const sender = isYou || isSystem ? null : colleaguesById.get(item.senderId);
        const role = isYou ? "you" : isSystem ? "system" : "colleague";
        return m2`<${MessageRow}
          key=${i2}
          role=${role}
          avatarColleague=${sender}
          nameTag=${sender?.name || null}
          item=${item}
          toolText=${item.text}
          onToggle=${() => {
          item.expanded = !item.expanded;
          renderChannelMessages();
        }}
          onToggleTrailEntry=${(entryIndex) => {
          item.trail[entryIndex].expanded = !item.trail[entryIndex].expanded;
          renderChannelMessages();
        }}
        />`;
      })}
      ${typingEntries.map(
        ({ colleagueId, colleague, thinkingText, liveText, liveTrail }) => m2`
          <${S} key=${colleagueId}>
            ${liveTrail.length ? m2`<${TrailBox}
                  trail=${liveTrail}
                  onToggleEntry=${(entryIndex) => {
          liveTrail[entryIndex].expanded = !liveTrail[entryIndex].expanded;
          renderChannelMessages();
        }}
                />` : null}
            ${thinkingText ? m2`<${StreamingRow} role="thinking" colleague=${colleague} text=${thinkingText} />` : null}
            <${StreamingRow}
              role="colleague"
              colleague=${colleague}
              nameTag=${colleague?.name || colleagueId}
              text=${liveText || "is typing\u2026"}
            />
          <//>
        `
      )}
      ${permissionEntries.map(
        (permission) => m2`<${PermissionCard}
          key=${channelKey(permission.colleagueId, permission.channelId)}
          permission=${permission}
          colleagueId=${permission.colleagueId}
          isChannel=${true}
        />`
      )}
      ${!items.length && !typingEntries.length ? m2`<${EmptyConversation}
            text=${`Nothing in #${channelsById.get(activeChannelId)?.name || "this channel"} yet. Write the first message, or @name someone to bring them in.`}
          />` : null}
    <//>`,
      messagesEl
    );
    refreshHiringModeStyling(activeChannelId);
    followThinkingTail();
    if (stickToBottom) scrollMessagesToBottom();
    else updateScrollToBottomButton();
  }
  async function selectChannel(channel) {
    saveDraft();
    appEl.classList.add("pane-active");
    activeChannelId = channel.id;
    activeColleagueId = null;
    activeSessionId = null;
    rememberOpenConversation({ channelId: channel.id });
    closeMentionAutocomplete();
    if (unreadConversations.delete(UNREAD_CHANNEL_PREFIX + channel.id)) refreshUnreadTitle();
    renderSidebar();
    input.disabled = false;
    sendButton.disabled = false;
    attachButtonEl.style.display = "";
    input.placeholder = `Message #${channel.name}\u2026 (@name/@all to address someone directly, or just ask)`;
    input.value = drafts.get(channelConvKey(channel.id)) || "";
    autoResizeComposer();
    renderPaneHeader();
    await loadChannelHistory(channel.id);
    if (activeChannelId === channel.id) renderChannelMessages({ forceScrollToBottom: true });
  }
  async function loadChannelHistory(channelId, { force = false } = {}) {
    if (channelMessages.has(channelId) && !force) return;
    const res = await fetch(`api/channel-history?channelId=${encodeURIComponent(channelId)}`);
    const rows = await res.json();
    channelMessages.set(
      channelId,
      rows.map((row) => ({ senderId: row.sender_id, text: row.text, createdAt: row.created_at }))
    );
  }
  function isSubagentThread(colleagueId) {
    return colleagueId.startsWith("sub:");
  }
  async function selectColleague(colleague, sessionId = DEFAULT_SESSION_ID) {
    saveDraft();
    appEl.classList.add("pane-active");
    activeColleagueId = colleague.id;
    activeSessionId = isSubagentThread(colleague.id) ? null : sessionId;
    if (activeSessionId !== null) lastSessionByColleague.set(colleague.id, activeSessionId);
    if (activeSessionId !== null) rememberOpenConversation({ colleagueId: colleague.id, sessionId: activeSessionId });
    activeChannelId = null;
    closeMentionAutocomplete();
    if (unreadConversations.delete(activeConvKey())) refreshUnreadTitle();
    renderSidebar();
    const canReply = !isSubagentThread(colleague.id);
    input.disabled = !canReply;
    sendButton.disabled = !canReply;
    attachButtonEl.style.display = "";
    input.placeholder = canReply ? `Message ${colleague.name}\u2026` : "One-off exchange \u2014 nothing to reply to here.";
    input.value = canReply ? drafts.get(convKey(colleague.id, activeSessionId)) || "" : "";
    autoResizeComposer();
    renderPaneHeader();
    const key = activeConvKey();
    await loadColleagueHistory(colleague.id, activeSessionId, key);
    if (activeConvKey() === key) renderMessages({ forceScrollToBottom: true });
  }
  async function loadColleagueHistory(colleagueId, sessionId, key, { force = false } = {}) {
    if (isSubagentThread(colleagueId)) return;
    if (history.has(key) && !force) return;
    const res = await fetch(
      `api/history?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
    );
    const rows = await res.json();
    history.set(
      key,
      rows.map((row) => ({ role: row.role, text: row.text, createdAt: row.created_at, trail: reconstructTrail(row.trail) }))
    );
  }
  function appendUnreadBadge(button, key) {
    const keys = Array.isArray(key) ? key : [key];
    if (!keys.some((k2) => unreadConversations.has(k2))) return;
    const dot = document.createElement("span");
    dot.className = "unread-badge";
    dot.title = "New since you last looked";
    button.appendChild(dot);
  }
  function appendDraftBadge(button, key) {
    const keys = Array.isArray(key) ? key : [key];
    if (!keys.some((k2) => drafts.has(k2))) return;
    const pencil = document.createElement("span");
    pencil.className = "draft-badge";
    pencil.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
    pencil.title = "Unsent draft";
    button.appendChild(pencil);
  }
  function sidebarSubtitle(key, fallback) {
    return isTyping(key) ? { text: "typing\u2026", typing: true } : { text: fallback, typing: false };
  }
  function sidebarSubtitleHtml(key, fallback) {
    const { text, typing } = sidebarSubtitle(key, fallback);
    return `<span class="colleague__role${typing ? " colleague__role--typing" : ""}">${text}</span>`;
  }
  function truncatePreview(text, max = 64) {
    const oneLine = (text || "").replace(/\s+/g, " ").trim();
    return oneLine.length > max ? `${oneLine.slice(0, max - 1)}\u2026` : oneLine;
  }
  function sidebarNameHtml(colleague) {
    const roleTag = colleague.role ? `<span class="colleague__role-tag">(${colleague.role})</span>` : "";
    return `<span class="colleague__name-line"><span class="colleague__name">${colleague.name}</span>${roleTag}</span>`;
  }
  function sidebarPreviewHtml(key, colleague) {
    if (isTyping(key)) return `<span class="colleague__role colleague__role--typing">typing\u2026</span>`;
    const last = colleague.lastMessage;
    if (!last) return `<span class="colleague__role">No messages yet</span>`;
    const prefix = last.role === "you" ? "You: " : "";
    return `<span class="colleague__role">${prefix}${truncatePreview(last.text)}</span>`;
  }
  var sidebarSearchQuery = "";
  var sidebarSearchHits = [];
  var sidebarSearchDebounce = null;
  async function runSidebarSearch(query) {
    clearTimeout(sidebarSearchDebounce);
    sidebarSearchDebounce = setTimeout(async () => {
      const res = await fetch(`api/search?q=${encodeURIComponent(query)}`);
      const hits = await res.json();
      if (query === sidebarSearchQuery) {
        sidebarSearchHits = hits;
        renderSidebar();
      }
    }, 250);
  }
  sidebarSearchInputEl.addEventListener("input", () => {
    sidebarSearchQuery = sidebarSearchInputEl.value.trim();
    if (!sidebarSearchQuery) {
      sidebarSearchHits = [];
      renderSidebar();
      return;
    }
    runSidebarSearch(sidebarSearchQuery);
    renderSidebar();
  });
  function sidebarSearchResultRowEl({ avatarColleague, name, snippet, onClick }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "colleague";
    button.appendChild(avatarColleague ? avatarEl(avatarColleague) : (() => {
      const icon = document.createElement("div");
      icon.className = "avatar avatar--initial";
      icon.textContent = "#";
      return icon;
    })());
    const text = document.createElement("span");
    text.className = "colleague__text";
    text.innerHTML = `<span class="colleague__name">${name}</span><span class="colleague__role">${truncatePreview(snippet)}</span>`;
    button.appendChild(text);
    button.addEventListener("click", onClick);
    return button;
  }
  function renderSidebarSearchResults() {
    sidebarEl.innerHTML = "";
    const q2 = sidebarSearchQuery.toLowerCase();
    const nameMatches = colleaguesList.filter((c2) => c2.name.toLowerCase().includes(q2));
    if (nameMatches.length === 0 && sidebarSearchHits.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No matches.";
      sidebarEl.appendChild(empty);
      return;
    }
    if (nameMatches.length > 0) {
      const header = document.createElement("div");
      header.className = "sidebar-section-header";
      header.textContent = "Colleagues";
      sidebarEl.appendChild(header);
      for (const colleague of nameMatches) {
        sidebarEl.appendChild(sidebarSearchResultRowEl({
          avatarColleague: colleague,
          name: colleague.name,
          snippet: colleague.role || "",
          // Opening a result deliberately keeps the search open and does
          // not clear the query/results; selectColleague's own
          // renderSidebar() call re-renders this same search view since
          // sidebarSearchQuery is still set.
          onClick: () => selectColleague(colleague)
        }));
      }
    }
    if (sidebarSearchHits.length > 0) {
      const header = document.createElement("div");
      header.className = "sidebar-section-header";
      header.textContent = "Messages";
      sidebarEl.appendChild(header);
      for (const hit of sidebarSearchHits) {
        if (hit.kind === "channel") {
          const channel = channelsById.get(hit.channelId);
          sidebarEl.appendChild(sidebarSearchResultRowEl({
            avatarColleague: null,
            name: `#${channel?.name || hit.channelId}`,
            snippet: `${hit.senderId === "you" ? "You" : colleaguesById.get(hit.senderId)?.name || hit.senderId}: ${hit.text}`,
            onClick: () => {
              if (channel) openChannelAtHit(channel, hit);
            }
          }));
        } else {
          const colleague = colleaguesById.get(hit.colleagueId);
          sidebarEl.appendChild(sidebarSearchResultRowEl({
            avatarColleague: colleague,
            name: colleague?.name || hit.colleagueId,
            snippet: `${hit.role === "you" ? "You" : hit.role}: ${hit.text}`,
            onClick: () => {
              if (colleague) openColleagueAtHit(colleague, hit);
            }
          }));
        }
      }
    }
  }
  async function openColleagueAtHit(colleague, hit) {
    await selectColleague(colleague);
    const items = history.get(convKey(colleague.id, DEFAULT_SESSION_ID)) || [];
    const index = items.findIndex((item) => item.createdAt === hit.createdAt && item.text === hit.text);
    if (index !== -1) jumpToMessage(index);
  }
  async function openChannelAtHit(channel, hit) {
    await selectChannel(channel);
    const items = channelMessages.get(channel.id) || [];
    const index = items.findIndex((item) => item.createdAt === hit.createdAt && item.text === hit.text);
    if (index !== -1) jumpToMessage(index);
  }
  function renderSidebar() {
    if (sidebarSearchQuery) {
      renderSidebarSearchResults();
      return;
    }
    sidebarEl.innerHTML = "";
    if (colleaguesList.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No colleagues in team/ yet.";
      sidebarEl.appendChild(empty);
      return;
    }
    for (const colleague of colleaguesList) {
      const button = document.createElement("button");
      button.type = "button";
      const isActiveHere = colleague.id === activeColleagueId && activeSessionId !== null;
      button.className = "colleague" + (isActiveHere ? " colleague--active" : "");
      button.dataset.id = colleague.id;
      button.appendChild(avatarEl(colleague));
      const shownSessionId = isActiveHere ? activeSessionId : DEFAULT_SESSION_ID;
      const shownKey = convKey(colleague.id, shownSessionId);
      const text = document.createElement("span");
      text.className = "colleague__text";
      text.innerHTML = sidebarNameHtml(colleague) + sidebarPreviewHtml(shownKey, colleague);
      button.appendChild(text);
      const allKeys = sessionKeysFor(colleague.id);
      appendUnreadBadge(button, allKeys);
      appendDraftBadge(button, allKeys);
      button.addEventListener("click", () => selectColleague(colleague, lastSessionByColleague.get(colleague.id) || DEFAULT_SESSION_ID));
      sidebarEl.appendChild(button);
      for (const panel of subagentPanels.get(colleague.id)?.values() ?? []) {
        if (!panel.knownColleagueId) continue;
        const synthetic = colleaguesById.get(panel.syntheticId);
        const nested = document.createElement("button");
        nested.type = "button";
        nested.className = "colleague colleague--nested" + (panel.closed ? " colleague--nested-done" : "") + (panel.syntheticId === activeColleagueId ? " colleague--active" : "");
        nested.appendChild(avatarEl(synthetic));
        const nestedText = document.createElement("span");
        nestedText.className = "colleague__text";
        nestedText.innerHTML = `<span class="colleague__name">${synthetic.name}</span>` + sidebarSubtitleHtml(panel.syntheticId, panel.closed ? "done talking" : synthetic.role);
        nested.appendChild(nestedText);
        appendUnreadBadge(nested, panel.syntheticId);
        nested.addEventListener("click", () => selectColleague(synthetic));
        if (panel.closed) {
          const row = document.createElement("div");
          row.className = "colleague-row";
          nested.classList.add("colleague-row__button");
          row.appendChild(nested);
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "colleague-row__remove";
          removeButton.appendChild(xIconEl());
          removeButton.title = "Remove this panel";
          removeButton.setAttribute("aria-label", `Remove subagent panel for ${synthetic.name}`);
          removeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            removeSubagentPanel(colleague.id, panel.id);
          });
          row.appendChild(removeButton);
          sidebarEl.appendChild(row);
        } else {
          sidebarEl.appendChild(nested);
        }
      }
    }
    renderChannelsSection();
  }
  function newSessionFormEl(colleague) {
    const formEl = document.createElement("form");
    formEl.className = "session-form";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "What's this session about? (optional)";
    formEl.appendChild(titleInput);
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Start";
    formEl.appendChild(submit);
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      socket.send(JSON.stringify({ type: "create_session", colleagueId: colleague.id, title: titleInput.value.trim() }));
    });
    return formEl;
  }
  function renderChannelsSection() {
    const header = document.createElement("div");
    header.className = "sidebar-section-header";
    header.textContent = "Channels";
    sidebarEl.appendChild(header);
    for (const channel of channelsById.values()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "colleague" + (channel.id === activeChannelId ? " colleague--active" : "");
      const icon = document.createElement("div");
      icon.className = "avatar avatar--initial";
      icon.textContent = "#";
      button.appendChild(icon);
      const text = document.createElement("span");
      text.className = "colleague__text";
      const memberNames = channel.memberIds.map((id) => colleaguesById.get(id)?.name || id).join(", ");
      const typingNames = [...channelTyping.entries()].filter(([, chId]) => chId === channel.id).map(([cId]) => colleaguesById.get(cId)?.name || cId);
      text.innerHTML = `<span class="colleague__name">#${channel.name}</span>` + (typingNames.length ? `<span class="colleague__role colleague__role--typing">${typingNames.join(", ")} typing\u2026</span>` : `<span class="colleague__role">${memberNames}</span>`);
      button.appendChild(text);
      appendUnreadBadge(button, UNREAD_CHANNEL_PREFIX + channel.id);
      appendDraftBadge(button, channelConvKey(channel.id));
      button.addEventListener("click", () => selectChannel(channel));
      sidebarEl.appendChild(button);
    }
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "new-channel-button";
    toggle.innerHTML = "";
    if (showChannelForm) {
      toggle.append(xIconEl(), document.createTextNode(" Cancel"));
    } else {
      toggle.textContent = "+ New channel";
    }
    toggle.addEventListener("click", () => {
      showChannelForm = !showChannelForm;
      renderSidebar();
    });
    sidebarEl.appendChild(toggle);
    if (showChannelForm) sidebarEl.appendChild(channelFormEl());
  }
  function channelFormEl() {
    const formEl = document.createElement("form");
    formEl.id = "channel-form";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Channel name";
    nameInput.required = true;
    formEl.appendChild(nameInput);
    const membersHint = document.createElement("p");
    membersHint.className = "channel-form__hint";
    membersHint.textContent = "Who is in it? Pick at least one.";
    formEl.appendChild(membersHint);
    const members = document.createElement("div");
    members.className = "channel-form__members";
    for (const colleague of colleaguesList) {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = colleague.id;
      label.append(checkbox, document.createTextNode(" " + colleague.name));
      members.appendChild(label);
    }
    formEl.appendChild(members);
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Create";
    formEl.appendChild(submit);
    const syncSubmit = () => {
      submit.disabled = !nameInput.value.trim() || !members.querySelector("input:checked");
    };
    nameInput.addEventListener("input", syncSubmit);
    members.addEventListener("change", syncSubmit);
    syncSubmit();
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      const memberIds = [...members.querySelectorAll("input:checked")].map((c2) => c2.value);
      const name = nameInput.value.trim();
      if (!name || memberIds.length === 0) return;
      socket.send(JSON.stringify({ type: "create_channel", name, memberIds }));
      showChannelForm = false;
      renderSidebar();
    });
    return formEl;
  }
  async function loadRoster({ preserveSelection = false } = {}) {
    const statusRes = await fetch("api/status");
    const { persisted, teamName } = await statusRes.json();
    noPersistenceBannerEl.hidden = persisted;
    brandNameEl.textContent = teamName;
    brandNameEl.title = teamName;
    BASE_TITLE = `${teamName} chat`;
    refreshUnreadTitle();
    brandLogoEl.src = "logo.png";
    refreshPlanUsage();
    const res = await fetch("api/colleagues");
    colleaguesList = await res.json();
    const rosterIds = new Set(colleaguesList.map((c2) => c2.id));
    for (const id of [...colleaguesById.keys()]) {
      if (!isSubagentThread(id) && !rosterIds.has(id)) colleaguesById.delete(id);
    }
    for (const colleague of colleaguesList) colleaguesById.set(colleague.id, colleague);
    const channelsRes = await fetch("api/channels");
    const channels = await channelsRes.json();
    channelsById.clear();
    for (const channel of channels) channelsById.set(channel.id, channel);
    const statsRes = await fetch("api/colleague-stats");
    for (const [key, stats] of Object.entries(await statsRes.json())) colleagueStats.set(key, stats);
    const autoModeRes = await fetch("api/auto-mode-sessions");
    const autoModeSessions = await autoModeRes.json();
    autoModeKeys.clear();
    for (const key of autoModeSessions) autoModeKeys.add(key);
    const gatekeeperUsageRes = await fetch("api/gatekeeper-usage");
    gatekeeperUsage = await gatekeeperUsageRes.json();
    await Promise.all(
      colleaguesList.map(async (colleague) => {
        const sessionsRes = await fetch(`api/sessions?colleagueId=${encodeURIComponent(colleague.id)}`);
        colleagueSessions.set(colleague.id, await sessionsRes.json());
      })
    );
    refreshNotifyPermissionButton();
    if (!preserveSelection && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(refreshNotifyPermissionButton).catch(() => {
      });
    }
    renderSidebar();
    if (preserveSelection) {
      renderPaneHeader();
      return;
    }
    const restore = pickConversationToRestore(recallOpenConversation(), {
      colleagueIds: colleaguesList.map((c2) => c2.id),
      channelIds: [...channelsById.keys()],
      sessionIdsByColleague: Object.fromEntries([...colleagueSessions].map(([id, sessions]) => [id, sessions.map((x2) => x2.id)])),
      defaultSessionId: DEFAULT_SESSION_ID
    });
    if (restore?.channelId) selectChannel(channelsById.get(restore.channelId));
    else if (restore) selectColleague(colleaguesById.get(restore.colleagueId), restore.sessionId);
    else if (colleaguesList.length > 0) selectColleague(colleaguesList[0]);
  }
  notifyPermissionButtonEl.addEventListener("click", () => {
    Notification.requestPermission().then(refreshNotifyPermissionButton).catch(() => {
    });
  });
  function loadAttachmentFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      pendingAttachment = { name: file.name || "pasted-image", mimeType: file.type, dataUrl, data: dataUrl.split(",")[1] };
      renderAttachmentPreview();
    };
    reader.readAsDataURL(file);
  }
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    loadAttachmentFromFile(file);
  });
  input.addEventListener("paste", (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    const imageItem = [...items].find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    event.preventDefault();
    const file = imageItem.getAsFile();
    if (file) loadAttachmentFromFile(file);
  });
  function renderAttachmentPreview() {
    attachmentPreviewEl.innerHTML = "";
    attachmentPreviewEl.hidden = !pendingAttachment;
    if (!pendingAttachment) return;
    const img = document.createElement("img");
    img.src = pendingAttachment.dataUrl;
    img.alt = pendingAttachment.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.appendChild(xIconEl());
    remove.setAttribute("aria-label", `Discard attachment ${pendingAttachment.name}`);
    remove.addEventListener("click", () => {
      pendingAttachment = null;
      fileInput.value = "";
      renderAttachmentPreview();
    });
    attachmentPreviewEl.append(img, remove);
  }
  var mentionAutocompleteEl = document.getElementById("mention-autocomplete");
  var mentionState = null;
  function mentionCandidates(query) {
    const channel = activeChannelId && channelsById.get(activeChannelId);
    const q2 = query.toLowerCase();
    const named = colleaguesList.filter((c2) => c2.id.toLowerCase().startsWith(q2) || c2.name.toLowerCase().startsWith(q2)).map((c2) => ({ id: c2.id, name: c2.name, inChannel: channel ? channel.memberIds.includes(c2.id) : void 0 })).sort((a2, b2) => a2.inChannel !== b2.inChannel ? a2.inChannel ? -1 : 1 : a2.name.localeCompare(b2.name));
    const everyone = channel ? ["all", "everyone"].filter((kw) => kw.startsWith(q2)).map((kw) => ({ id: kw, name: "Everyone in this channel", inChannel: true })) : [];
    return [...named, ...everyone];
  }
  function currentMentionToken() {
    const caret = input.selectionStart;
    const match = input.value.slice(0, caret).match(/@([a-z0-9_-]*)$/i);
    return match ? { start: caret - match[0].length, end: caret, query: match[1] } : null;
  }
  function closeMentionAutocomplete() {
    mentionState = null;
    mentionAutocompleteEl.hidden = true;
    mentionAutocompleteEl.innerHTML = "";
  }
  function renderMentionAutocomplete() {
    mentionAutocompleteEl.innerHTML = "";
    mentionAutocompleteEl.hidden = false;
    mentionState.matches.forEach((candidate, index) => {
      const li = document.createElement("li");
      li.setAttribute("aria-selected", String(index === mentionState.selectedIndex));
      const known = colleaguesById.get(candidate.id);
      if (known) {
        li.appendChild(avatarEl(known));
      } else {
        const icon = document.createElement("div");
        icon.className = "avatar avatar--initial";
        icon.textContent = "@";
        li.appendChild(icon);
      }
      li.appendChild(document.createTextNode(candidate.name));
      if (candidate.inChannel === false) {
        li.classList.add("mention-candidate--outside");
        const hint = document.createElement("span");
        hint.className = "mention-candidate__hint";
        hint.textContent = "not in this channel";
        li.appendChild(hint);
      }
      li.addEventListener("mousedown", (event) => {
        event.preventDefault();
        acceptMention(candidate);
      });
      mentionAutocompleteEl.appendChild(li);
    });
  }
  function acceptMention(candidate) {
    const { start, end } = mentionState;
    const insertion = `@${candidate.id} `;
    input.value = input.value.slice(0, start) + insertion + input.value.slice(end);
    const caret = start + insertion.length;
    input.focus();
    input.setSelectionRange(caret, caret);
    autoResizeComposer();
    closeMentionAutocomplete();
  }
  var COMPOSER_MAX_HEIGHT = 192;
  function autoResizeComposer() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, COMPOSER_MAX_HEIGHT) + "px";
  }
  input.addEventListener("input", () => {
    autoResizeComposer();
    const token = currentMentionToken();
    const matches = token ? mentionCandidates(token.query) : [];
    if (matches.length === 0) {
      closeMentionAutocomplete();
      return;
    }
    mentionState = { ...token, matches, selectedIndex: 0 };
    renderMentionAutocomplete();
  });
  input.addEventListener("keydown", (event) => {
    if (mentionState) {
      const { matches } = mentionState;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        mentionState.selectedIndex = (mentionState.selectedIndex + 1) % matches.length;
        renderMentionAutocomplete();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        mentionState.selectedIndex = (mentionState.selectedIndex - 1 + matches.length) % matches.length;
        renderMentionAutocomplete();
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        acceptMention(matches[mentionState.selectedIndex]);
      } else if (event.key === "Escape") {
        closeMentionAutocomplete();
      }
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener("blur", () => closeMentionAutocomplete());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    closeMentionAutocomplete();
    const text = input.value.trim();
    if (!text && !pendingAttachment) return;
    if (activeChannelId) {
      const channelAttachments = pendingAttachment ? [pendingAttachment] : [];
      socket.send(JSON.stringify({
        type: "channel_message",
        channelId: activeChannelId,
        text,
        attachments: channelAttachments.map((a2) => ({ name: a2.name, mimeType: a2.mimeType, data: a2.data }))
      }));
      drafts.delete(channelConvKey(activeChannelId));
      input.value = "";
      autoResizeComposer();
      pendingAttachment = null;
      fileInput.value = "";
      renderAttachmentPreview();
      return;
    }
    if (!activeColleagueId) return;
    const key = activeConvKey();
    if (!history.has(key)) history.set(key, []);
    const attachments = pendingAttachment ? [pendingAttachment] : [];
    history.get(key).push({ role: "you", text, attachments, createdAt: (/* @__PURE__ */ new Date()).toISOString(), pending: isTyping(key) });
    renderMessages({ forceScrollToBottom: true });
    if (activeSessionId === DEFAULT_SESSION_ID) {
      const rosterColleague = colleaguesById.get(activeColleagueId);
      if (rosterColleague) {
        rosterColleague.lastMessage = { role: "you", text: text || "Sent an attachment" };
        renderSidebar();
      }
    }
    socket.send(JSON.stringify({
      colleagueId: activeColleagueId,
      sessionId: activeSessionId,
      text,
      attachments: attachments.map((a2) => ({ name: a2.name, mimeType: a2.mimeType, data: a2.data }))
    }));
    drafts.delete(key);
    input.value = "";
    autoResizeComposer();
    pendingAttachment = null;
    fileInput.value = "";
    renderAttachmentPreview();
  });
  var PULL_TRIGGER_PX = 56;
  var PULL_MAX_PX = 72;
  var PULL_DAMPING = 0.45;
  var PULL_MIN_SPIN_MS = 450;
  function attachPullToRefresh(scroller, onRefresh, surface) {
    const indicator = document.createElement("div");
    indicator.className = "pull-refresh";
    indicator.style.setProperty("--pull-surface", surface);
    indicator.setAttribute("aria-hidden", "true");
    const spinner = document.createElement("span");
    spinner.className = "pull-refresh__spinner";
    indicator.appendChild(spinner);
    document.body.appendChild(indicator);
    let startY = null;
    let pull = 0;
    let busy = false;
    function setPull(px) {
      pull = px;
      indicator.style.setProperty("--pull", `${px}px`);
      indicator.style.setProperty("--pull-progress", String(Math.min(px / PULL_TRIGGER_PX, 1)));
      indicator.classList.toggle("pull-refresh--armed", px >= PULL_TRIGGER_PX);
    }
    function hide() {
      setPull(0);
      indicator.classList.remove("pull-refresh--visible");
    }
    scroller.addEventListener("touchstart", (e2) => {
      if (busy || e2.touches.length !== 1) return;
      if (scroller.scrollTop > 0) return;
      startY = e2.touches[0].clientY;
      const rect = scroller.getBoundingClientRect();
      indicator.style.left = `${rect.left}px`;
      indicator.style.width = `${rect.width}px`;
      indicator.style.top = `${rect.top}px`;
      indicator.classList.remove("pull-refresh--settling");
    }, { passive: true });
    scroller.addEventListener("touchmove", (e2) => {
      if (startY === null) return;
      const delta = e2.touches[0].clientY - startY;
      if (delta <= 0 || scroller.scrollTop > 0) {
        startY = null;
        hide();
        return;
      }
      e2.preventDefault();
      indicator.classList.add("pull-refresh--visible");
      setPull(Math.min(delta * PULL_DAMPING, PULL_MAX_PX));
    }, { passive: false });
    async function release() {
      if (startY === null) return;
      startY = null;
      indicator.classList.add("pull-refresh--settling");
      if (pull < PULL_TRIGGER_PX) {
        hide();
        return;
      }
      busy = true;
      indicator.classList.add("pull-refresh--busy");
      setPull(PULL_TRIGGER_PX);
      try {
        reconnectIfDead();
        await Promise.all([
          onRefresh(),
          new Promise((resolve) => setTimeout(resolve, PULL_MIN_SPIN_MS))
        ]);
      } catch {
      } finally {
        busy = false;
        indicator.classList.remove("pull-refresh--busy");
        hide();
      }
    }
    scroller.addEventListener("touchend", release, { passive: true });
    scroller.addEventListener("touchcancel", release, { passive: true });
  }
  async function refreshActiveConversation() {
    if (activeChannelId) {
      const channelId = activeChannelId;
      await loadChannelHistory(channelId, { force: true });
      if (activeChannelId === channelId) renderChannelMessages();
      return;
    }
    if (!activeColleagueId) return;
    const key = activeConvKey();
    const colleagueId = activeColleagueId;
    const sessionId = activeSessionId;
    await loadColleagueHistory(colleagueId, sessionId, key, { force: true });
    if (activeConvKey() === key) renderMessages();
  }
  attachPullToRefresh(messagesEl, refreshActiveConversation, "var(--bg)");
  attachPullToRefresh(sidebarEl, () => loadRoster({ preserveSelection: true }), "var(--bg-sidebar)");
  loadRoster();
})();

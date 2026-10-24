(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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
    var s2, h2, p2, v2, y2, d2, _2, k2, x2, M, I2, P3, A2, H2, T2, j2, F = u2.type;
    if (void 0 !== u2.constructor) return null;
    128 & t3.__u && (c2 = !!(32 & t3.__u), o2 = [f2 = u2.__e = t3.__e]), (s2 = l.__b) && s2(u2);
    n: if ("function" == typeof F) {
      h2 = e2.length;
      try {
        if (x2 = u2.props, M = F.prototype && F.prototype.render, I2 = (s2 = F.contextType) && i2[s2.__c], P3 = s2 ? I2 ? I2.props.value : s2.__ : i2, t3.__c ? k2 = (p2 = u2.__c = t3.__c).__ = p2.__E : (M ? u2.__c = p2 = new F(x2, P3) : (u2.__c = p2 = new C(x2, P3), p2.constructor = F, p2.render = Q), I2 && I2.sub(p2), p2.state || (p2.state = {}), p2.__n = i2, v2 = p2.__d = true, p2.__h = [], p2._sb = []), M && null == p2.__s && (p2.__s = p2.state), M && null != F.getDerivedStateFromProps && (p2.__s == p2.state && (p2.__s = m({}, p2.__s)), m(p2.__s, F.getDerivedStateFromProps(x2, p2.__s))), y2 = p2.props, d2 = p2.state, p2.__v = u2, v2) M && null == F.getDerivedStateFromProps && null != p2.componentWillMount && p2.componentWillMount(), M && null != p2.componentDidMount && p2.__h.push(p2.componentDidMount);
        else {
          if (M && null == F.getDerivedStateFromProps && x2 !== y2 && null != p2.componentWillReceiveProps && p2.componentWillReceiveProps(x2, P3), u2.__v == t3.__v || !p2.__e && null != p2.shouldComponentUpdate && false === p2.shouldComponentUpdate(x2, p2.__s, P3)) {
            u2.__v != t3.__v && (p2.props = x2, p2.state = p2.__s, p2.__d = false), u2.__e = t3.__e, u2.__k = t3.__k, u2.__k.some(function(n4) {
              n4 && (n4.__ = u2);
            }), w.push.apply(p2.__h, p2._sb), p2._sb = [], p2.__h.length && e2.push(p2), f2 = $(t3);
            break n;
          }
          null != p2.componentWillUpdate && p2.componentWillUpdate(x2, p2.__s, P3), M && null != p2.componentDidUpdate && p2.__h.push(function() {
            p2.componentDidUpdate(y2, d2, _2);
          });
        }
        if (p2.context = P3, p2.props = x2, p2.__P = n3, p2.__e = false, A2 = l.__r, H2 = 0, M) p2.state = p2.__s, p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), w.push.apply(p2.__h, p2._sb), p2._sb = [];
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

  // node_modules/mdurl/index.mjs
  var mdurl_exports = {};
  __export(mdurl_exports, {
    decode: () => decode_default,
    encode: () => encode_default,
    format: () => format,
    parse: () => parse_default
  });

  // node_modules/mdurl/lib/decode.mjs
  var decodeCache = {};
  function getDecodeCache(exclude) {
    let cache = decodeCache[exclude];
    if (cache) {
      return cache;
    }
    cache = decodeCache[exclude] = [];
    for (let i2 = 0; i2 < 128; i2++) {
      const ch = String.fromCharCode(i2);
      cache.push(ch);
    }
    for (let i2 = 0; i2 < exclude.length; i2++) {
      const ch = exclude.charCodeAt(i2);
      cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
    }
    return cache;
  }
  function decode(string, exclude) {
    if (typeof exclude !== "string") {
      exclude = decode.defaultChars;
    }
    const cache = getDecodeCache(exclude);
    return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
      let result = "";
      for (let i2 = 0, l2 = seq.length; i2 < l2; i2 += 3) {
        const b1 = parseInt(seq.slice(i2 + 1, i2 + 3), 16);
        if (b1 < 128) {
          result += cache[b1];
          continue;
        }
        if ((b1 & 224) === 192 && i2 + 3 < l2) {
          const b2 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
          if ((b2 & 192) === 128) {
            const chr = b1 << 6 & 1984 | b2 & 63;
            if (chr < 128) {
              result += "\uFFFD\uFFFD";
            } else {
              result += String.fromCharCode(chr);
            }
            i2 += 3;
            continue;
          }
        }
        if ((b1 & 240) === 224 && i2 + 6 < l2) {
          const b2 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
          const b3 = parseInt(seq.slice(i2 + 7, i2 + 9), 16);
          if ((b2 & 192) === 128 && (b3 & 192) === 128) {
            const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
            if (chr < 2048 || chr >= 55296 && chr <= 57343) {
              result += "\uFFFD\uFFFD\uFFFD";
            } else {
              result += String.fromCharCode(chr);
            }
            i2 += 6;
            continue;
          }
        }
        if ((b1 & 248) === 240 && i2 + 9 < l2) {
          const b2 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
          const b3 = parseInt(seq.slice(i2 + 7, i2 + 9), 16);
          const b4 = parseInt(seq.slice(i2 + 10, i2 + 12), 16);
          if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
            let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
            if (chr < 65536 || chr > 1114111) {
              result += "\uFFFD\uFFFD\uFFFD\uFFFD";
            } else {
              chr -= 65536;
              result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
            }
            i2 += 9;
            continue;
          }
        }
        result += "\uFFFD";
      }
      return result;
    });
  }
  decode.defaultChars = ";/?:@&=+$,#";
  decode.componentChars = "";
  var decode_default = decode;

  // node_modules/mdurl/lib/encode.mjs
  var encodeCache = {};
  function getEncodeCache(exclude) {
    let cache = encodeCache[exclude];
    if (cache) {
      return cache;
    }
    cache = encodeCache[exclude] = [];
    for (let i2 = 0; i2 < 128; i2++) {
      const ch = String.fromCharCode(i2);
      if (/^[0-9a-z]$/i.test(ch)) {
        cache.push(ch);
      } else {
        cache.push("%" + ("0" + i2.toString(16).toUpperCase()).slice(-2));
      }
    }
    for (let i2 = 0; i2 < exclude.length; i2++) {
      cache[exclude.charCodeAt(i2)] = exclude[i2];
    }
    return cache;
  }
  function encode(string, exclude, keepEscaped) {
    if (typeof exclude !== "string") {
      keepEscaped = exclude;
      exclude = encode.defaultChars;
    }
    if (typeof keepEscaped === "undefined") {
      keepEscaped = true;
    }
    const cache = getEncodeCache(exclude);
    let result = "";
    for (let i2 = 0, l2 = string.length; i2 < l2; i2++) {
      const code2 = string.charCodeAt(i2);
      if (keepEscaped && code2 === 37 && i2 + 2 < l2) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i2 + 1, i2 + 3))) {
          result += string.slice(i2, i2 + 3);
          i2 += 2;
          continue;
        }
      }
      if (code2 < 128) {
        result += cache[code2];
        continue;
      }
      if (code2 >= 55296 && code2 <= 57343) {
        if (code2 >= 55296 && code2 <= 56319 && i2 + 1 < l2) {
          const nextCode = string.charCodeAt(i2 + 1);
          if (nextCode >= 56320 && nextCode <= 57343) {
            result += encodeURIComponent(string[i2] + string[i2 + 1]);
            i2++;
            continue;
          }
        }
        result += "%EF%BF%BD";
        continue;
      }
      result += encodeURIComponent(string[i2]);
    }
    return result;
  }
  encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
  encode.componentChars = "-_.!~*'()";
  var encode_default = encode;

  // node_modules/mdurl/lib/format.mjs
  function format(url) {
    let result = "";
    result += url.protocol || "";
    result += url.slashes ? "//" : "";
    result += url.auth ? url.auth + "@" : "";
    if (url.hostname && url.hostname.indexOf(":") !== -1) {
      result += "[" + url.hostname + "]";
    } else {
      result += url.hostname || "";
    }
    result += url.port ? ":" + url.port : "";
    result += url.pathname || "";
    result += url.search || "";
    result += url.hash || "";
    return result;
  }

  // node_modules/mdurl/lib/parse.mjs
  function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.pathname = null;
  }
  var protocolPattern = /^([a-z0-9.+-]+:)/i;
  var portPattern = /:[0-9]*$/;
  var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
  var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
  var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
  var autoEscape = ["'"].concat(unwise);
  var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
  var hostEndingChars = ["/", "?", "#"];
  var hostnameMaxLen = 255;
  var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
  var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
  var hostlessProtocol = {
    javascript: true,
    "javascript:": true
  };
  var slashedProtocol = {
    http: true,
    https: true,
    ftp: true,
    gopher: true,
    file: true,
    "http:": true,
    "https:": true,
    "ftp:": true,
    "gopher:": true,
    "file:": true
  };
  function urlParse(url, slashesDenoteHost) {
    if (url && url instanceof Url) return url;
    const u2 = new Url();
    u2.parse(url, slashesDenoteHost);
    return u2;
  }
  Url.prototype.parse = function(url, slashesDenoteHost) {
    let lowerProto, hec, slashes;
    let rest = url;
    rest = rest.trim();
    if (!slashesDenoteHost && url.split("#").length === 1) {
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.pathname = simplePath[1];
        if (simplePath[2]) {
          this.search = simplePath[2];
        }
        return this;
      }
    }
    let proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      lowerProto = proto.toLowerCase();
      this.protocol = proto;
      rest = rest.substr(proto.length);
    }
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      slashes = rest.substr(0, 2) === "//";
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }
    if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
      let hostEnd = -1;
      for (let i2 = 0; i2 < hostEndingChars.length; i2++) {
        hec = rest.indexOf(hostEndingChars[i2]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      let auth, atSign;
      if (hostEnd === -1) {
        atSign = rest.lastIndexOf("@");
      } else {
        atSign = rest.lastIndexOf("@", hostEnd);
      }
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = auth;
      }
      hostEnd = -1;
      for (let i2 = 0; i2 < nonHostChars.length; i2++) {
        hec = rest.indexOf(nonHostChars[i2]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      if (hostEnd === -1) {
        hostEnd = rest.length;
      }
      if (rest[hostEnd - 1] === ":") {
        hostEnd--;
      }
      const host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);
      this.parseHost(host);
      this.hostname = this.hostname || "";
      const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
      if (!ipv6Hostname) {
        const hostparts = this.hostname.split(/\./);
        for (let i2 = 0, l2 = hostparts.length; i2 < l2; i2++) {
          const part = hostparts[i2];
          if (!part) {
            continue;
          }
          if (!part.match(hostnamePartPattern)) {
            let newpart = "";
            for (let j2 = 0, k2 = part.length; j2 < k2; j2++) {
              if (part.charCodeAt(j2) > 127) {
                newpart += "x";
              } else {
                newpart += part[j2];
              }
            }
            if (!newpart.match(hostnamePartPattern)) {
              const validParts = hostparts.slice(0, i2);
              const notHost = hostparts.slice(i2 + 1);
              const bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = notHost.join(".") + rest;
              }
              this.hostname = validParts.join(".");
              break;
            }
          }
        }
      }
      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = "";
      }
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      }
    }
    const hash = rest.indexOf("#");
    if (hash !== -1) {
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    const qm = rest.indexOf("?");
    if (qm !== -1) {
      this.search = rest.substr(qm);
      rest = rest.slice(0, qm);
    }
    if (rest) {
      this.pathname = rest;
    }
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = "";
    }
    return this;
  };
  Url.prototype.parseHost = function(host) {
    let port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ":") {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) {
      this.hostname = host;
    }
  };
  var parse_default = urlParse;

  // node_modules/uc.micro/build/index.mjs
  var build_exports = {};
  __export(build_exports, {
    Any: () => Any,
    Cc: () => Cc,
    Cf: () => Cf,
    P: () => P2,
    S: () => S2,
    Z: () => Z
  });
  var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var Cc = /[\0-\x1F\x7F-\x9F]/;
  var Cf = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
  var P2 = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;
  var S2 = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C1\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2429\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E5\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD803[\uDD8E\uDD8F\uDED1-\uDED8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDC00-\uDCEF\uDCFA-\uDCFC\uDD00-\uDEB3\uDEBA-\uDED0\uDEE0-\uDEF0\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED8\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0-\uDCBB\uDCC0\uDCC1\uDCD0-\uDCD8\uDD00-\uDE57\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF-\uDEF8\uDF00-\uDF92\uDF94-\uDFEF\uDFFA]/;
  var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

  // node_modules/entities/dist/decode-codepoint.js
  var c1 = [
    8364,
    0,
    8218,
    402,
    8222,
    8230,
    8224,
    8225,
    710,
    8240,
    352,
    8249,
    338,
    0,
    381,
    0,
    0,
    8216,
    8217,
    8220,
    8221,
    8226,
    8211,
    8212,
    732,
    8482,
    353,
    8250,
    339,
    0,
    382,
    376
  ];
  function isInvalidCodePoint(codePoint) {
    return codePoint === 0 || codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111;
  }
  function replaceCodePoint(codePoint) {
    if (isInvalidCodePoint(codePoint)) {
      return 65533;
    }
    if (codePoint >= 128 && codePoint <= 159) {
      return c1[codePoint - 128] || codePoint;
    }
    return codePoint;
  }
  function codePointToString(codePoint) {
    return codePoint - 1 >>> 0 < 127 || codePoint - 160 >>> 0 < 55136 ? String.fromCharCode(codePoint) : String.fromCodePoint(replaceCodePoint(codePoint));
  }

  // node_modules/entities/dist/internal/decode-shared.js
  var BASE91_INVERSE = /* @__PURE__ */ (() => {
    const table2 = new Uint8Array(127);
    let code2 = 0;
    for (let char = 33; char <= 126; char++) {
      if (char !== 34 && char !== 36 && char !== 92) {
        table2[char] = code2++;
      }
    }
    return table2;
  })();
  function decodeTrieDict(input2, resultLength, atomCount, dict1AtomCount, ngramCount, dictSize) {
    const base2 = 91;
    const inputLength = input2.length;
    const twoCharBias = dictSize * (base2 - 1);
    let pos = 0;
    const readSlotCode = () => {
      const c12 = BASE91_INVERSE[input2.charCodeAt(pos++)];
      return c12 < dictSize ? c12 : c12 * base2 - twoCharBias + BASE91_INVERSE[input2.charCodeAt(pos++)];
    };
    const dict2AtomCount = atomCount - dict1AtomCount;
    const slotCount = atomCount + ngramCount;
    const single = new Int32Array(slotCount);
    single.fill(-1, dict1AtomCount, dictSize);
    single.fill(-1, dictSize + dict2AtomCount, slotCount);
    const start = new Int32Array(slotCount);
    const length = new Int32Array(slotCount);
    function decodeDelta(count, off) {
      let previous = 0;
      let slot = off;
      const end = off + count;
      while (slot < end) {
        const code2 = BASE91_INVERSE[input2.charCodeAt(pos++)];
        if (code2 < 89) {
          previous += code2;
          single[slot++] = previous;
        } else if (code2 === 89) {
          let runLength = BASE91_INVERSE[input2.charCodeAt(pos++)] + 2;
          while (runLength--)
            single[slot++] = ++previous;
        } else {
          const next = BASE91_INVERSE[input2.charCodeAt(pos++)];
          previous += 89 + // eslint-disable-next-line unicorn/prefer-minimal-ternary -- branches read a different number of side-effecting input bytes
          (next < 90 ? next * base2 + BASE91_INVERSE[input2.charCodeAt(pos++)] : BASE91_INVERSE[input2.charCodeAt(pos++)] * 8281 + BASE91_INVERSE[input2.charCodeAt(pos++)] * base2 + BASE91_INVERSE[input2.charCodeAt(pos++)]);
          single[slot++] = previous;
        }
      }
    }
    decodeDelta(dict1AtomCount, 0);
    decodeDelta(dict2AtomCount, dictSize);
    const references = new Int32Array(ngramCount * 2);
    let poolSize = 0;
    let ngramIndex = 0;
    function readNgramReferences(count, startSlot) {
      for (let index = 0; index < count; index++) {
        const slot = startSlot + index;
        const a2 = readSlotCode();
        const b2 = readSlotCode();
        references[ngramIndex * 2] = a2;
        references[ngramIndex * 2 + 1] = b2;
        ngramIndex += 1;
        start[slot] = poolSize;
        const entryLength = (single[a2] < 0 ? length[a2] : 1) + (single[b2] < 0 ? length[b2] : 1);
        length[slot] = entryLength;
        poolSize += entryLength;
      }
    }
    readNgramReferences(ngramCount - dictSize + dict1AtomCount, dictSize + dict2AtomCount);
    readNgramReferences(dictSize - dict1AtomCount, dict1AtomCount);
    const pool = new Uint16Array(poolSize);
    let write = 0;
    for (let index = 0; index < ngramIndex; index++) {
      for (let half = 0; half < 2; half++) {
        const source = references[index * 2 + half];
        const value = single[source];
        if (value < 0) {
          let read = start[source];
          const readEnd = read + length[source];
          while (read < readEnd)
            pool[write++] = pool[read++];
        } else {
          pool[write++] = value;
        }
      }
    }
    const out = new Uint16Array(resultLength);
    let outIndex = 0;
    while (pos < inputLength) {
      let slot = BASE91_INVERSE[input2.charCodeAt(pos++)];
      if (slot >= dictSize) {
        slot = slot * base2 - twoCharBias + BASE91_INVERSE[input2.charCodeAt(pos++)];
      }
      const value = single[slot];
      if (value < 0) {
        let read = start[slot];
        const readEnd = read + length[slot];
        while (read < readEnd)
          out[outIndex++] = pool[read++];
      } else {
        out[outIndex++] = value;
      }
    }
    return out;
  }

  // node_modules/entities/dist/generated/decode-data-html.js
  var htmlDecodeTree = /* @__PURE__ */ decodeTrieDict("!}.&u%}'&}*'~!6*)%&,~!J~!J~%L~y<~!R,~~%Lu~~#GD~~#|)1#%}^%}2%+#.##%##%}&%##%'#%##&%#%#'%#&#%#&#'#%%#&#%##%#)%''%&%#%#'%#%%#%%}%%%#%#&(23#%%#&-%0%('1#(##%#'##+%'*.:1}#%#6-+(%'%%#%%%}#L'2351&('%}&/N'(0(/*-%(%%}#'+&T%7.2}#&%&#%#36/5##%&%%#&#%%#))2%%##%&&'0~!#*+&'%1~!%).'3q?&%'1~!.##%6(~!+%%%(Gw'rT~!E#<nA%#jZ~!H%(~!42##~!*31&~!G%U~#)5~#`3~!J~!Z~%]~%Y~%C~!q~!u~#kz~%#~!6'~!D~!U~!?~#T~!c%~!G#'~%7|~!G~!J~!G&~#pb~(Df}#%}*&}#%##%##%##&#-}&'#'&%#.++}%mI,#,@&(}*%}*'%&##&#%##%}&0}#.},U},%}+%}&%}#%##&}B%(}(%}+%)})%##%#&}&%##%&}<%}>%#%&}*%}(%}9%}/%})%}*%}*%}?&}&%}3%}&*#%})%#%#)}#&#-#+*%E%%'%'#%}#*V##&##I}#&&##%&%#&&Qf%%))w/0+&%#(#.%-''''++++7}>%4'',##1,#%#&%##&#'##&#*#9)%&%}#*}%,#+P(%A&%#'&##wSD',9E00#y#@}(+}&%&>~!#~!X}#*}(&&}(&}(,%}%&#+&}#&}I%#%}%)#(},'%#*}4%%#%}(''}#/##(##),%-##%%)#&}(.}&%#&}%%}*&#%},&&}&%}#%*'#%})%}D&}&%}-&}6&#&}-,%}#%})-(~+`~,=?~I9'9%~!,#%})%})%}@%}?%}(~!?~#<~#pP~#BG~#=1#%K+~#?#~%;)~#A~#mF1~#A'~'X%'~#lR~#N~'N~#r~#m#-~#i'?%#'%~#B%##%,%#~#_%#0%~#]732~,w~2+#:&#%&'0%&>%}#>##F+)#%&&#(+_}4&}-%}(&}@&}O7Fdf0@+/v4}&WU##&/0#&'('B#%}.%}'+#%}#%%&#&%#%##+#&#)#6#'#.},%}c%},%#%##%&#&%#&~#>'*-.%##%##%}#%%}%'~#)D1}#%*&~#_%%'(~#S2%'.}#~#=##*'*-%}&'%'##&&~'E%.#&~#M4}%%##&'%#~#O1##%&#'+~#<B%##%%'%+~#;#@%}#&%#&&%#(~#H1}'%'##&&~#?A}&'~#D#%32}'&&&&~#[}'(#%}'~#;C})&}%%#%~#=&%,3}%'(#%%~#^'#&&)#%'~#Y%-~#d-%'~#^%%&#&&&}#~#b~2t*&'~&(~&@~0%~e~3}%*''0})&}+~!9##-}#%-hD*)1fC#%/&/fB#40~!+#)*4~!+~!K'&:~!/*7~!.#~!H~!L':~%x&~!H#~!*~%1~!I#~!+A~#p'~!F~~#-#~,,(~.Z~!V~%;'B'mq-W~!N~%I%#&&#&}#%},%%}'%}+X#%}#&}(%}'%}<%}#%}%%'}'%}:~![)9@~%>~#UA%-%##&~!C%~!-.9:~!1~!-^2/:a~!y,D*J#-5)/4~%23,~#G~!L1~!0X3`~!2+~!!0-~&E~!W~!o,>Y&]~%cZx_&~#O*9#A#'#+I'%#)~!0B*-5A+-((F&*M#)(-7-5+'-3a5Vi~!Y~!?+[)%3),ERHm~!+:D,VG.+)?fB%%*(%)'(#&80%1'8`K8?`+'Z#&O&'H5#*9)A%%5&3))0%39+.*7#()&&*=4@**L)<'_&*+..;(#*+)./&0#3)%')-8(4ixD(&.}%,('aI:,)%,k2231T)I'#/-W7,/'Q#.'Y24+h')37</31&83##&0#),H(?'&?/1##%#&&#%''-%&&&#(&''&#.-'%#%%(,')*'&#&#'##%(%(#%('#&##%%%%('%#%#%%#%#&%##h>w+v<ayvyvcg.uuhKr}g/v|g>u9i[~>g5uI~=RvdwEg;v/g;uk!!TTSx]@RT!U!#!@VBRUU!'UTe-d0c`e&gSdicedFcrdTaqb.kYcAohdYd@a3e+d}dMdtd.aJ#bqcK`dle/e.e'dwdPdodddjbEb}ogd^ofdpduc6j?l%d{drdqc)d7bacOdQ%T#Y)X.sR[yH>6Vyv3[xwLu>vo'!*.[yBacahoj>6Rew3[xqdZa#!a&#^(X-[yG>6Vyu3[xvg3sEr|g.u/Ri9db0T#^(Xa)!-[y;>6Vylg4wKs{JwNZt3@3r=c4Z([xlg;wKt!cpq's@v7A'*a(a+!-a#[y<3Dt?3Dt'>6Vym3[xmg9rxsNJwLZt4~?r?db1T#`-!(Xa,!0[yS>6Vz%NuQs.g4wKtnJwNZtS@3r>c4Z([y%g;wKtrdga8!a(!#&T*Y-Xa#!a0<or[yc3Dtq>6Vz43[y3JwNZtf@3s!Ju}!%Dti:pm3c_%X#tjB5pkd6q!r]u?voC'*-a.a2!0a&a+[yI3DtI3Ds~3DtH>6Vyw3[xx;:s#~<5pKJwNZtE@3r~d`a)!a2T#a.(!+U.X1[yT3Dt`3Dtv>6Vz&3[y&g9rxwzcxstPu.<rAJwLZtT~?r@dZa%!a.&^*Za(/Reu[ya>6Vz23[y1g3sEr}wkg{NuQRg{ci(U#5@b`~,cg#U(2WnH5wugcRh7dX#T(Y,a'Ta!!a,[yZ<]mj>6Vz,3[y+Pv#5ReZKu+=,%!H}7ABwkaS?Rh:BcW(X#<]mrj:ubv/ARekdg%!(!a.*Ta(Y.X1!#sP>Rl*Dt6[y>>6Vyo3Wf*jOvuumvuRgRJuq*!:9<B@bX~3jVv&v@s@5Re[d/rQt{uAvo&a&a*)a2!,0Wf!3Dt0=Bs'>6Re}3[xy~<5s%JwJZt1~Gs)c;&!#2sJkNuXvzq7rxu,Re8dka4!a8(aEZ+a@Y.X1Xa)[yd=Bs(3DtP>6Vz53[y4cX#X&Re:avRe9~<5s&JwJZtQ~Gs*i^rzvdRg+Jv{%!2sbB@bX}kdga,!Za?&^*T1/!a'Dt+[y6>6Vyf3Wf%g/u;s4hGu6?Rh-JvZ,!c%#&RoX54Rivj7uyvf8RgTKvZB%*!2sGh<vu5Rgq<=C::9bb~#dZ#T&Ta6Y.X*Dt>[y93Wf)coZ(T,6VyifluvRgC@95@B@bX~/hFu34cC#T,k/unq8w8Q5RkUklwQuzunq8w8Q5Rk8d/rJu?v8w9)-&!a0a;a&aIWejg3sEr/h1s<DtDJvyZqY5aws3Jvy!&Wei~Hr1:au5@Bag>23E~5c:Z&bX};kKv?w&unuVu5Rjc;>bs)#~@:Rh.=ay<a]C;b`}Vd6s/t{uAvoaxa()!a,a7%-a#a2Dt,[yF2Wo[>6Vyt3[xuNuPRi&NuPwpi#RoWh?vf8Ri%Jv]!%Ri:KvxD!.'2WeAjZu`q9rxu,Re7woeAg-unLq(qA_/*2Wg_g3u5q^9:4E}/jTrxrzv=Wkkd~0UX#^^Xa-a1a5T&a=U1a'*aEa]!a*aPaA-adok[y54Rn>;:p3~Dp5g9rpsFNvZqjg3uJp4~<5p0Pw;5qlJwNZt*@3p1Pw:5p/Ou!5p2JvG'!6Vye=<qnJvh_[xhg3v,Rh3kOwOw-sDuev/Re^dha[a%!%!a+#Ta7)-5TaCaO!aka!a)sf[yb2>Rl!9ARiq5E}Qg=ucRkBE|oJrJ_@Wk~@Wk{JrJ_@Wk|@WkyJrJ_@Wk}@WkzJvO_[y2g-vMRmiKuYC!)&>Ri;>Ri<@3RkNc](X#@9Rk=g5vuRmhKvDB!+'=]meg3u4Rmgd)#Y'Vz3CARmfd`a+!%T'!+#Ta1Ta6TaM-sTDt9[yA9sYd'%Y#s[[xpj:ueunaXRgEjRq,v-vuqdd2'`#6Rev<32@5>:2<E}5xIo9a*X#Y(;5RePJvD_g>vyRgNj8w)v8<wggs:RgXiZt|vjx,hSq3ah!-(~@:Ro/Ou!5RhWj^v(pyw8unRhUdx-UY#^Ua.a3a70!)%UX1TaDa)'omRiRRhE[y:3Dsz=Br,>6Vyj3[xkg6ruwjcqsrPw;5r*Ku]D'Zt-@3r(~?r.i[vwv]dU1a--U#`a4(g/vsRhPOu!5RhLj:rmu9Wo!~@:wdh@g/vsRiTjXuvvNr}:RhBj^v(pyw8unRn]dz1UYa'a+^Y(!aETZalaRY.Ta?a4[yDJw1!#qLsW>6Vyrfzq-pLflpwRe|Js>%!Dt@3Dt&Jvy_[xs~HrnjMuwpsw'RecKu+D#'!t<~Grl~?rjg5u-x,gwp{ah!-(~@:Rg~Ou!5Rh'jXuvvNr}:Rh#cW#X/c;&!#2sLi[v7u7RgpJv)(!iLrxu,Re6j7v@s@5Se[e7d`aW!Za(a`T.a#!a3!&aDa-!9)Dt_=6s+3[x~~DR|h~DS6avhGun5RkZj3w)v-]mkKunB!&*]kb97R|i<ARk<c:Z(6Vy}Juh'!wziMRoS:F|vkLuauJv5vtvQRh1d='T+Y#VyO~DR|jcF#T'7R|g97R|kJv3'!ay<Rj,Jvh&!:ReXcsa6*a+#a#_aIRf9aLRf?c,Z&Rf5Rf7c.Z&Rf;Rf>cQ#%T'p-Rf8Rf=ct#%'(*!,p,Rf4p+Rf6Rf:Rf<d~'Ua%U*^UYa(!a,-!#a4YaTalaEX0a8a<Weo3Dt/3Dsx=Br93Wen~Dr;~<5p<JwNZt2@3p=Pw:5p;Ou!5r3c7&!#:p>3Ds}KvGB)_6Vyk2sM=<r7x'eovA(!hFu1ARf}cV#X&@r5j6rvwQa^Rf3c=Za'wkghJv__g;unRggA53B9=b^}%j6uduo5Jq;!(hIv%2Re`Ou4ARe_e%a#^^^Xa&!a*a2!&a6YaP!*ad!#a:aE/5Rn?[y@>6Vyp;:pE~DrY~<5pBJwNZt8@3pCh=rt3rWPw:5pAJup_[xoNuPpF9c!#'45pD5ARn)d8#X'X*3@rU72s]h>v<<sSjJpqvewOJq/(!hNw'5ReBk0s2u3w/w'5ReE5@Jq.!a+JQ!&WeU23d(#Y&RjG5]jBk!u7w&u0udARjEe#+^^^Ub#!a2/a`Z(agT1!a-a;|@TaG!aS[yV=Re~fow'RguNuPRe?bz#'>RoUWeL>:Cbb|?JwPZtVg6ruRmzJvD'!6Vz(g/vmRh~Jvy_[y(g9voRgyx*cy(#2>Ri2B9b]~9kIw9u7rluJu3Rg]dI#a%UY'@=p%CAx.gQZ&RhwwygtRm{x5g_Z'+ABqR9Woa=Bp&dV#^*Xa'!&@o{g4v]Rk;Jv{!%Rk[wkkiA5RkiwwfUB=x,fUuqC&*!>RfTg8v0RfV~ARfSd;rJsAuAv9wR'ae+/aO!a@aza/a#[yQ@Wg!2Wemg3sEr0JvB_g>uvReWg2v+Re=KupB_+[y!2AbY~-~Hr2AJwD!(h<~El>h<~El?Kun@+_:9b`}Kg-v/Ri3g;vtwyk_9]k_d=&T#*U.6qh@Ab`|K9:H|CJv[!&3Dtex'fDwC%!Rf[9WlMd[(^X,!a%Z06Vz!@WgBg=v~Rgvg,QRe@awd,#Y+jTv|Q~EfWj]uNr|~FRfXdy#Y&^Ua%!aO.!(a)Ua;=!a@aKap!a-,a!Ta]a[rSa]p?[y82sK=Bq~;:p:~<5p8Pw:5p7d'#Y'Wf(;RnRi[u4w&RgJJvG'!6Vyh=<r#ijuuv/sIKuYD'ZtG@3p9~Gr&d2#`(g<vtRgFj`u5w&rqpxRf2CJuY!+:wfnTOu!5Rg}jNs1ucv&RfwJvA!&3@q|BDcC#T,k/unq8w8Q5RkTklwQuzunq8w8Q5Rk9dga#!a'!a=#a0!:+Tb*b@aO.a4!aba8aFJv^}?!VyR~Dr<g;u%Rn.~<5p[x'e`wNZtR@3p]Pw:5pZhNvjBp.woe_g5u-r4JwF!%DtO3:ooc7&!#:p^3DtpLuGw(!+%)Dtk6Vz#2sd=<r8d'#Y([y#<x3gJt`w@!)%}MRiowzikRij=]ilxAf3,U(#B2Rf#g0v-Rm[ck{`U#]giKv3>)!&6Ri154s,KuGB_%@r68r:dJ|t`#X(9<E|u2@H|rx3gJu?w'!+'1Nu7Reg4=H~+9<wxgY95Rm]xLggZ-`(X}U2:Ri4h<uOawRmsJv__5@bb{jbV~3dka#a'a]!,#a+U=a>b6a3b%!/aKa/)!arwve^VyJ;:pR~DpTg3uJpS~<5pOPw;5qmPw:5pNOu!5pQJvG'!6Vyx=<qoJvA!{~Jup!%@qk7Rn/KvyD!}''[xz;>wkh'?Rh,x8gyt`w5D!&),(SgyccRgztJ@3pPB5p#d'(Y#<]mmifubw&RgoJvE&!82s^JvF&!8Rf,ADb]~;x=h'rNu]vK!,%'*0RnORh)4Rh*AqQg-vaRnNg;wHwkh'ba~4cE#Ta*x3gctyw@'!+%RnFRnD<4Rn@hFvK5RnCxWg[#`&a0Ua()`1Rm75Rg[c]%X#qi8Rg^NvdRj>BwzgZauwji7Rm6A4wgg]d1#&(*,.0a#Rm;Rm<Rm=Rm>Rm?Rm@RmARmBe%#^^^Xaea?aC/b+(,!a+a#!a/!>a&Ta<aKbD!2wphBRnk[yPw}hE|.=Br-3Dtm>6Vy~g6urRf.x,hPrNav!%'RnqRo%Ro#Nu;q[Pw;5r+JwNZtM@3r)d'#Y'Weh;xChL#`&RnmRnoKu}>%(!Rne~Bs-;2wjcussJv+'!aYSO}6@B<5?ba~8LrNvj!.%*ROwungw~ng~:9;Ri^>wtnig;wHRnixDh@|(UZ.x1h@|)!#:2<H|*xHn]#-UX'3Ro)z=iT}6ARns=Bwsn_wpnaRncw]aR(#UXa&Ua*a/=]iPd'#Y&Ro'WnXf{QRm2hNvj]nZd`'T~&1`{|`#9b]{}c:'!#Wl{>@=be}]?cl{{U#:5Abb}Jds#^YaF!a*b4a#a3aPa>&Tb!bH!*a_!Eau?/a&RjY<]gj>6Vz*;:pe~DrZg,QRj1JwNZtX@wihspcJvZ&!VyX9WmOJu|!|N2WmHJvh&!]ht~Bpbcn&T(!#RmQ<s7Nu;padH#X'`+WmJ@>RmKCARhnKup=!)&Wf+:RhqNuPpf9c!#'45pd5AwghpARn(Ls@w!%,)!RmP@Wfe<E|IJva!&WmNg8vsRmLd`*.`#Y'Xa!axRn*]hrA8Rhug5s@rXg8u!RmMd8#X'X*3@rV72smdI*#UY&RmICARho~GsgxVgd)Ta'U-Y&Xa!T#RnEWnA@Wffg1uDRi0hFvK5RnBxGnG&#`%owp)@wsf+bX}Ze-*1!a*^^^Ua|!#a.aq&Ya2!a>.a6!a:aO`aJDtL[y`@Wg#>6Vz12@wzoYRoZNuPRi!NuPRhzg=ucRi,@=b`{Yg=ucRi-ACJvB!&Sh[ebSh]ebi`wUuFRm4Jw2_[y0JvB!.<Ju(!&SoG}6Shd}6<Ju(!&SoH}6She}6Kur@._g5vHRieJvx!{L2G{Kx6gd'T#?Rh82Wi5cZ#X(g1w)Rm5dW-Y(Ta#!a)!#aYa=wnfE=su2>>bU{0j9udv:<svj8uQv-7RgHdE%#^'sq9sp=>Bb_{TJv`!&g/r|snj6v(us5d,#Y(56H}[978H}]Jw5!&g1rushJvB!+j;v{u5?zDhd}6}bj;v{u5?zDhe}6}ce*#`(^^^a[aea!=!a6a*aoXb1a.!aAbL!b>,b'aL!aV@Wf|2Wlg3[y/JwNZt^@3piPw:5pgJunZou3@rsJva&!Vy_g<v~Rm#JvG'!6Vz0=<r{Ju{%!:pj@WfsiXuJu3Rm:JvZ&!WfA~Bph@c4Z&Dtwax5rubx(#:awRk1@d,#Y&RfjRfid1#,Y(@Wfp2Wlrg5s@ryKu[@!,'=]ig9wlk?Rk>g5u-rqJvy'!@9RkQcH(T#=>Ri~@<wkj(Wj(KuZB*!&<7rw@9RkRcH(T#=>Ri}@<wkj)Wj)dg(Ta2Xa9X#`-!a*CARhg@@=I}d9x;c~#X%so=<sj>2@@=aybb}XjWv0Q~EfEj3vLv;<d,#Y(56H}`978H}_dgaPaFa'a/!#a3Y0a_a;a|!1(a7-[yE3[xt;:pJNvZrrg3uJrvJwNZt=@3pIh=rt3rxPw:5pGOu!5rpJvG'!6Vys=<rz@c4Z&Dt(ax5rtJvZ!&~BpH@wsfNg-vaRlNci*U#=<wei<F}a5@Jq.!a*JQ!%@qZ23d(#Y&RjH5]jCk!u7w&u0udARjFd/prq=tyvpaEa(a:.!a1aZ(@@=I}:9wpd%=<sX55w_h}@@=I{t=ay<aU@@=I}T=ay<2@@=I})?C9:9au@9Cb]}DP~=x-fAZ(2Wl1=ay<aU@@=I}>5@d##Y+jTv|vV~EfFj]uNpn~FRfGdgaK!Z2&!a8a-Tb({E!acTbM*!a(DtY[yYd'%Y#sl[y*hHvh>Re5x2c{Z}.j4uCvcawRiMd+#X+_x&d!},<5RkX;2Hzw@x,gavfB-!{CcF&T#Roe;RodwWbBg5urRgaKvHC*_6Vz+<4opieuew&Rmq@d]&Y)X,T#X0Rh}<BqP=4qS9:ReMg/ujReNJw0!/<Jui%!bd{kawwnemRelAxUa?a3#*.&UX(Ya+a/RhvRnQ<o}9Wmtd-#Y&RgSRmw9;Rmxay=Rmyg-vaRmuxEhSrNu,v-voC!%(aR.a(a7+1Ro1>Ro5CE{A9b]{@;5x#eO{:g;urRi+KrNA!%(Ro3>Ro79;Ri_Ku@>{;&!x%gX|{KunA_+g5QRj/g3u5Rj#g>uERj%wio/xRhS&!,!#^1U}wba{8>>@=be}qC@:D5ba{7Ku+A&!}x?ba}t>>@=be}se(aA^^^Uat!b0#{pa+awUazbGa#aLb9bgaWac'a5TbS=Br!d1#`%scp_Jvl!#rT>Re0JvX&!VyN=H{Fcm#U&:pY=ReaJv2&!]h0=]nUJvG'!6Vy|=<r%JrM_=]h2@Wlud'#)U'Wf'b]{i=]h/Jvh!&~BpWg=v]RnMx+ny#'Nu;pVwjnu=]nwxJnx,T#`&Reqwjnt=]nvieu9vrRjLLuYwP(#+!th@wih5pX~Gr'g5v/Rh4KunA'!-CARnP@wwiN:Rm_9x'cvw>!|l=<saKvAA!0&3@q}>w^e1bp#&Re2Re3BDx7gH#T|f5H|eKuZ>!%(:qNAH{]Jv6!+3B2B9=b^{X<5<B92:E{ZLvhwA(a;a%!igQuyRmad+#Y}m@3Rh5d8#X'X*:AqUAHzmaxwbh<aXRnVcF}RT#Nw&cj#U(BWnug/vsRntdka)(a3+.Zb7aYYan1!bVa@Xa}[y^@b[{G=H{+hFu73Rj&Pv#5ReQcK%T#sig1v{Rj'Ku+D#'!t]~Grm~?rkKuMB!01d5#`'Vy.ta3Dtu~Hroc8#'{^45s85AwZbP&!#Rn!wghxWn#KvEA!)&2RlA2RlBx:h|#(T,=]j09Wobz>x]z/@awRoTd+#Y(az]hFhCrm4d,#Y+jTv|Q~EfMj]uNr|~FRfOdCa!Xa9_X#@<plJvf!%b`{(9;Rgwc;.!#2x7cw#T|UDb]|T5Ju={(!=@E{&Jv)&!Ab`{'awJvf!~*>>@=be{#KuY>!+&4Ezyi[ugv&RjIdea+T)#UXa&T-T&a!Rh9auRmW=]kLg5vuRn+g3u4Rn-Ow6ARn,hHus5xNk?#UX(U~)/g8v0RkD~AwkkF?Ri.OuNBwkkA?Ri/d|a2`a*^UYa.!aBTZaTa'Xa;!(!2!-a#b2[yC>6Vyq3[xr2Wi?g1rusVh%s?DtF~<5rbJs;%!DtBfswKtCj[uvuSsEu3RgVx3o:u+wN'*Zt;@3rd~Grh~?rfg8w)Lq)qE&-a%!>bI|`jWv0vV~EfCjTv|vV~Ef@j]uNpn~FRfBcK#T']gWNu7x,k7q4ai(0!hHv8<RhmkMu9vrsBuev/RhlCJvB!,g<v{wchh~@:Rhji[vrv{wchi~@:RhkdS&a5UY#Ta!RgPwwiI5BwciI~@:Rh`x'iJvj'!5]iJPu8Bwch]~@:Rhach)U#h3rp]gLh@t|Ax,hTq3ah!-(~@:Ro0Ou!5RhXj^v(pyw8unRhVd|)`,^UYas!a?/a2Z'a^Ta{Tb7Ta(a#!a,Wf&9sZ3DtAadamov=Bqt3[xig8vsRm~>waiL2b`{QJv*_Ouv2qgj<v]v2BqfdR'X*X#Y-@3qr~Gqv~?p6hHv-]glPup5Lq+q?_%*b_{qF{n9b^{rOu4ARhpKvCD!+&~Bqp:5Dbb}nwoiKl&unuTuBv]v+ueunaXRf0=Jvh!0nKufu8v1w&w7q%w&uHrz:Rgnj5w,uxDJq/(!hNw'5ReCk0s2u3w/w'5ReFd>Za&!*UaA=<wkgsRnSJv^!%Refifw3vyRgOKu_B'!,<]gkiiu:w&Rh<=C@a^<B57@2F{[<B5@aW:=3away9A5aW=<B=C@a^<B57@2F{Ie-#`(^^^bCara.b8aza6!/bZ,!adTbnTbOb+aFaS!aAT9@Wf~2Wli3Dtl2@d,#Y&RfnRfmJwJZtN~GqyJva&!VyMg<v~Rm%iXuJu3Rm9Jv[_=]ih9wlkDRkCd1#`(@Wg>2Wls3cH#T(@<Rj*=>Ri|b~'#23s9h<~El.d'#Y&Dtxi^rzvdRl#d*#U%(o|B2s`hJwSaxRmDKv4B&!1:Rmdd5#`'Vx}to~Hq{x'f1v3(!BA5ba|bJv_&!Wfug1v]ReIdO+U/Y#&G}-8wze=Rh{g1v]ReHg/uQRf/by#)ibQwERl/cH#T(@<Rj+=>Ri{cNu+vlax-!(#a0qa9<Rii2;;bU{H;x<i=&X#Rk`<4wwi=C9H~8xAI(Y#<azRi@45wXI<B9;5bb~7dL(X#Xa(+!aL6Vy{g5QqOau:5au2@ay547EzbxOcU(UX-T#Ta#:Cbb|A?wjh/b_|SOw6ARgtihr}u7Rhy<d1#T)X1@@=I|~=ay<2@@=aybb}Sj3vLv;<d,#Y(56H}A978H}@dGpvs@uAu`vcw9*!aFa+ai%(b!aXa8.a?a[ozWey=sU2@G}Nch&U#Rf_WexKu+D#'!t:~Gr`~?r^j]uNr|~FRg*j^psurwJt|RmcKv)@&!)7Rkv~Br[@wxfO:Rl3co#U'6Rezj_q#vIuavjRltwzeyh@vr5JqD0!>aY?C9:9au@9Cb]}9cl#U*5;5<H||jbuus1ucv&Rfvg1v~d/pppzqFr^a--a~!aMat1(hFv;Wiz@@=Izoj5uuv-7Rix~Cw`fk2WlVcZ#X,k)u3vWs@u2]ktg;wEx'fBq(_2Wg/jTv|vV~EfoJv]!15x'hzqG!(P~EfU~CRl_j6v(us5x4i-#T(2WmZ?C2F|d>Kq<aj1!*jTqIsBv=Wl`~Cw`fi2WlWj`v0u*~>RlR=c>Z,k#u3vWs@u2]kr<c1Z+jTqIsBv=Wla~Cw`fm2WlXdmb3!a{(arZa`bkTa%TbQTa-a9+c'!aM!/[yL=Bqug.w'RifhFvyDRj.g>vgwyk^9]k^Jv3_@WfbAARkhJw2_[x|JvB_wkoIRoKwkoJRoLd'(Y#<]gm=<9<H|yd'%_X#skDtb3awwqkgNulRkgdB#^',9:p'hJwSaxRmEBwVb8@4=H|qLu+w50&!)@3qs~?pU>Awwn;;Rn=c:Z'ARn<=<qwKvC@!/&~BqqJv6!&]eVb^z^xRge'/a%+^`#Sge}6<4Rn3=]n0Pw2>Rn8Jw0!&>Rn:>Rn6cY#a7+!a&=<wkaNw~h3z_c5Z{=wjh#=]nLKv^D!&)Vyz=bW|swYb<WetcG#T(2wxa@qVx@gD#Y&b^|V5JwG&!5bb|pg/w&RgD@x=kHs=uAvn!a%%/'+RmSRh694Ro`g-vaRmRhHv-]mlxCcS#`&ba~.5cD#Ta)P~=d,#Y(56H{>978H{Dd_#{2^Y%_+qbbb{6g3sERhsbU{?dfa.,`a(Xa<!aiX#(55RiG54RiHcI#T'WiU3RiVNvdwtfcRlKNvdd,#Y&RlHRlExQgf.1*^T'X#Sgf}6Wn4=]hfPrk>Rn7Jw0!&>Rn5>Rn9Lunw?&a2!,5<oq@@wqfdRlJj5Q~=d,#Y(~ARfcOuN]fdDKw;ay(}i!547E}j?cI#T(@5bV}iCbV}hdv(^^Tb?a40,b##Tbo!a*bR!a<b|a/!aKai!aU[yK=]o^g:v>ReGJwPZtK<7Rh+h<~El,Pv#5ReR@awwxjCg,ulRjDJv6&!]j!z?aQeeg>w=Sh<eeJw;!&axEzOg,Qosc!#*:wkeJ]eJ>x'h-u(!%Ro.w~h.zPdNZ(X,Ya![x{;9ReY;wkgxRiF:x?ap#Y&RmUg<s2Rkod]+UY0TZ'!a&A9sw<=bczLNvuw{gqzNhJwSaxRmCKuLay!#&s_Rf-55b^{uJvZa!!c%#(55Ri654wmiu5RiuawLu,vp!+}^%b_}Y9;wkgxba}o>A9:=b^}zKuh=a''!3awRk3c*'!#aHRk6c+Z&Rk5Rk4Jv)&!awRjSawd9*`#0?C2@EzMj8u<uJ5RmbjQrquJu3x,k>uq@_+=ayb^|W~ARkEOuN]k@7dhzV^X/X&a-#zRzSb`zXcJzTT#2WkVKvDBzW!%FzY9;5bbzWjQrquJu3Jw3%!b`zU=ayb^zQd:#X(T-a!6Vyywxh}=b]{Jg=u1RiAdGp~qHtzv!w(wA+a+a;<!aJaYai'anasb(=azRmV:Cbb{MLq2vb!%')RjuRjrRjtRjqx3jnqCw3!%')Rk(Rk+Rk&Rk)Lq2vb!%')Rj{RjxRjzRjwLq2vb!%')RjsRjpRjfRjex3jcqCw3!%')Rk'Rk*RjkRjl9<CbbzfOu4ARhxLq2vb!%')RjyRjvRjhRjgx=joq*uKvb!%')+-Rk.Rk%Rj~Rk-Rk#Rj}x=jdq*uKvb!%')+-Rk,Rk!Rj|RjmRjjRjidAq&qKs@uAv8Aa.'*-a@a&0!aM@a5[y73Dsy3Ds|3Dt):wxgI2sHJwJZt.~Gqxwsf0ikrzt}Rl0Jvy_[xj~HqzKv_A|D!&WfP8axRoVcf,U#k(v]v+ueunaXRf1Ju}'!g8u#Ri=jQw!sCunLprq>!,')~<5qeGzq9F{W=c##%s5au:5aU3CBE|;d4#X(D!a&6Vygx(b;#(=]ed?C2F{N<capoq2r[a&!aPa9,'Pw;5s:@@=I|,55w_h|@@=IzcP~=x'fCqB_2Wl2>aU@@=I|1OuNBc1Z+jTqIsBv=Wlc~Cw`fl2WlZ~AcTa%!Z+jTqIsBv=Wlb~Cw`fh2WlYk+uNqJsBv=WlSg,u3dca3#UXaMYa)TaB-=cM|7T#<bI}l5@B932:aV2G{BOuNBJq:|M!5Ezt=<B=C@a^<B57@2F{v>cB{/T#=ay<bI{3Jv6!a.6BKq0ah&+!5E}HP~Ef{978BaU@@=Iza<7d#.Y#978BaU@@=IzH~AJq0!(@@=IzG978BaU@@=IzFe,aU*Y&^^^bvJb,b:bFad!a,c2Ta>aL.bo6!a#CbTa'T#Re{2Wlh2@G{yg6t~Ro_NvdRfticuRQRllJv3&!x&c|zs@Jw3!%RflwpfkRlpKuL;%(!Re<@G|C2GzdhIvuBwgjAg-u0RjAKQB%!(GzZ@G|5NuuRl7d='T+Y#Vy[g<v~Rm!==G|>JvA!)@wma=]m1ifuaw&RmnLs@vT'!|/+[y,g:v>ReTJw1!#qX=x!eC{bLu+wT&)ZtZauq_~Graci&U#F|89:r_Lupvq!.)&2RlG8RfaC=x!eF{_h?rpWlmd&'!#X|&]k::xJey#`'T|+<E|&2@H|%dE#(^,g;u.RiEg6vjRiC9xCkA{O|zY#g=ucRmXKs0@!&*@G|m@awRknJuh!,3d(}gY}eJvj!%Rm):Jw3!%Rm+Rm-Ls0w(&!a(a#@b[|6cZ#X'7RkxWgAOu4ARn'dH'U#Y*Vz-Wm'CARm}d]*#a%^a*T'aK!a<9bV{PC=p*Jw4!&SgxcbB5r]idw(wBRmF7xFkt#&`(Rm/Rm8E|!JuY_9:Rl5=wrgr2:bbxd@xXfB(a*#T+!.X0X1Ta/a'T&RlDRfL>RlyARl9b[z[>RfZ:RlL:RfRwlg/ARl;9;RlxKv,A/!%7s69<74=BA5ba{-8Bde#`a<XaKYa1,a'P~=wxfB2bZ}}?C972@@=I}r8@55B9;5bb}G978B2@@=aybb}3j3vLv;<Jw3&!>Rfk=ayb^}4~Ad1#`*@@=aybb{w2@>==<bbz]dx+UY#^UaF!a9!bB'Ya1.!ajXa#%olRhD[y=3Dt#Ov5BrHKuMB%!(Rf^Wep~HrJwkiQjKr|~FRg)Ku+D#'!t5~GrF~?rDdV)UY,Z/_7RkuG{<~BrBg,rlsO:235B@bX}|d?a1!#`(6Vyn5@d##Y+jTv|vV~EfIj]uNpn~FRfH7Lq2vb1!a9-978BaU@@=Iz9978BbU}#~AJq0!(@@=Iz8978BaU@@=Iz7~AJQ|}!978BbU}!JvkaK!AdUa21-U#`a+(g/vsRn~Ou!5RPj:rmu9WhOjXuvvNr}:RhAj^v(pyw8unRn[kPr}p|u7vwv]RiSBd;pppzq@qHQa?(b.!a.a`@.|xa(hFv;Wiyj5uuv-7Riw~Cw`fg2WlU978BbU|wOuNBJqG!(P~EfD~CRlQcZ#X,k)u3vWs@u2]ksg;wEx'f@q1_2Wg.j]uNpn~FRfqJv]!15x'h{qG!(@@=IzK~CRl^j6v(us5x4i,#T(2WmY?C2F{1>Kq<aj1!*jTqIsBv=Wld~Cw`fj2Wl[j`v0u*~>RlT=c>Z,k#u3vWs@u2]kq<c1Z+jTqIsBv=Wle~Cw`fn2Wl]dn1#c(a(b^a2!b/bAT(bj!aDa7bu,a_a{c0!2T0g:v>ReD2@G{42@G{5~DpM~<5rc=Bx6i>{RT#RnI@zCx]y]z:2Jv[!zr5Awyk]9]k]dD(Y+X#6Vz.g=wKtgwhaCwgmTWj2Lu,w%_+/[y-B;b^xeg3u3Rj-2@bX{*KrJ<!+'@Wg(g?QRlC@Jv`!%b[zIwsfII}8JQ_@w|kW|=Jv(%!AqcOuNBJvEzh!bYzjLs@wP#(0!oy@>RkdJwMZtc3Dtd@BcG#T'9bWxg2@2Fznd*#Y+;2x'c}w<zizixNgwa#Z'U+!/!a'!a+w~g~z6wcn{Rn}wcnzRn|5Rh%=]nJg5vuRmvNvdRlvcprJu}w*az*a#!%.a.'Bot9qT]kj@Wg'ay2Gzv@Jv`!%b[zEwsfHI}1;ck#Ux`<Cbbx_Lu+w!a&0*!wko*wwo,So,}6Juqxf!E}PigQuyRm`d3(`#8>Rn%:A5B;bZ~%KvhCa!a2!x>k7#Uxb@b{#xaRk7Jw0!)>wwhlShl}6>wwhmShm}6CJvB!.x'hhvj{!!5Bwkhhbaz}x'hivjz~!5Bwkhibaz|xEhTrNu,v-vpD!a%&/)a3a.,%Ro2t[CE{)@3re9b]{%wjo09:rgc:Z&Ro6=<riifuaw&RmoKrNA!%(Ro4>Ro89;Ri`dSaL'UYzxZb)7Rka3xRhT&!,!#^1U}vbaz{>>@=be}yC@:D5bazzKu+A&!}{?ba}y>>@=be}wxBh[t`u~vJvr!%a!a()a,a0a4RoC=]o;Ju(!%RoGRhdwjh`=]oAg>w#Ro?g5vuRo=NvdRl|Ku]C.!&;RoEJvB!%RoORoMBx'h[v+_?w~h`}~5?w~hd~!xKh]oiptu-utv.vp!#%&a30a@a'a+(a/aOp(o~p!RoDJu(!%RoHRhewjha=]oBNvdRl}g>w#Ro@g5vuRo>c[#X']o<CauRoRAd-#Y':RkpauRoQKu]C.!&;RoFJvB!%RoNRoPBx'h]v+_?w~ha}t5?w~he}ue!/UbhYacXaW^Tc&a;b:a-c/#b&aja1(!cL+!bKbt!bmcRc9aIc?8[yW3Dtt94Rg`Jv}!&SiRMzBhEebShEMNuPRe>x7gL#TzuwjirRipc<Z&>on;>z=h-MSh.Mwqczx'a7vj&!>Re4@=ResJt__NuPRi*NuPRi)j]uNr|~FRfzKrJ>_+@Wfy@Wf]2WocKrJ<!+'@Wg%g/QRl@@Jv`!&awRl<wsfFIzgLu(w*!.*&ShBMwvhIRhI9;RhNx1hK'!#Sn]Mx1hK~0!#:2<H~7cNu+w7D*'1ZtW>Rn1~?rOc:Z&Rn2=<rQ<7wjh&=BSnLMc]#X(6Vz)w[b=a!U#9wzgMc3#&(RgMRitRis<x,gKt`ax!&+SioM=BSilMc3#&(RgKRinRimKurB,!&SiQMzBhDebShDM6BJQ!(P~Efx978B2@@=I}WLrJw!!,a*&@G}O@9wkibRid@@x'fKwC!&SlDMSfLMjUv~Q~EfKKv3@a+!(hFv-]mpx/hYZ(C5RiWz<o/MwkhY?So/M@x,gbvfB*&!SgEM:SoeeehFu3:Rgbda(,^TZa)X/7Sg[eb:2RgI~BrMC@wgkc:wwkcRerx3h(uUvK!&*,SnOM4Sh*MArRg;wHRh(x=h;rJvPwI!a4',a'0@Wg&=BSh/Mg>w=Rh=g3w*wwgGRgGcW(X#;Sg}M2Gzk@Jv`!&awRl=wsfGIz`dKZ*T'Y-:RhR7RhQg5u-p`j6v(us5d,#Y+~Awkia?RicOuNBwkibba}Ld6p~tyu_vbAa'a+!a/'a3aEa8a!>Sh,ebJv{!&Sh@ebSaReb9;SgwebNuPRi(NvdRl)NuPRi'hHu^<Rm^Jvv_@Wl(g;u1Si/ebKu'B&!*Sh?eb@Wl'z@aPeb95Si.ebcpputyvjB)!,&a+0a%ShAMWeK@G}C@WfJ9;RhMwvhH9w{ia}ix,hJvRA1(!zAn[MRhHx1hJ~*!#hFv(BSn[MBJQ!(@@=I~'978B2@@=I}2db.Ua<'X}+T#a0XaG2G}E;wkg|wuh!Rh!x,hZu,@)!&So0MVy)C5RiXACJvB!&5RiY5RiZg8w)cG}*T#2@bU}=KsA>(!a.3wkhZba~(x,h^u(A!&(SoCMRhb5Bz=h[eb?w~hb~6x,h_u(A!&(SoDMRhc5Bz=h]eb?w~hc~6e)aA1T#T,^^^c-bMb&blcPaP(a/!0!bA=b5c@a(!bfbrc#2afwmhARnjwchORnp2Wlf3DtsNvdRl-2@wpa<]m0bx(#:awRk2@Jw3!%RfhwpfgRlnKQB%!(G{V@G|'NuuRl6d='T+Y#VyUg<v~Rl~==G|<Jv+'!aYShC}6@B<5?ba~8@Jw3'!g2QRljhLrpWlOd+#Y'g.w'rIg>w*wgj@g-u0Rj@Lu+wT&)ZtUauq]~GrGci&U#F|39:rELrNvj!.%*RhCwunfw~nf~:9;Ri]>wtnhg;wHRnhx3hDs@v~!/+'@Wfr@9RkSNu&Rlo=@<5GzoKs0@_+@Wl+@awRkmJuh!-3d(}pY#qWJvj!%Rm(:Jw3!%Rm,Rm*de&!1U-U#`)Re;@G|.@9Ri82@wjfvRlq=@<5GzpLvOvr!).&2RlF8Rf`C=x!eE{.Jw3_g2QRlkhLrpWlPde(!#U{s,UXa*Ta'[y'g:v>ReS;x0PZ&RnlRnn~HrKJw1}f!=x!eB|2w]aP(#Xa&a*Ta.Ua2a7=]iOd'#Y&Ro&WnWg;u.RiDg6vjRiBNvdRlzhNvj]nYJuW_2Wm3x)kFze{9d])!a.!,Y01!#&aC!a3RndC=ox~BrC@2b^{pg,rlse7x'ksuq!%Rm.E{xidw(wBRmGx9o+)X#wwo-So-}69:Rl4@xSf@a#XZ'X)X,Ta(/ARl8b[xc>RfY:RlI:RfQwlg.ARl:9;Rlwdn'#^XafaQa1X1TaHTa)@b[{zcZ#X'7RkwWg@Ou4ARn&x)kG#{,g7u/RkGdH'U#Y*Vz'Wm&CARm|bx#(A]gUbUzJj9Q~=d,#Y(56H}l978H{U7d,0#U*2>ABb_xZ978BbU{e~AJQ{g!978BbU{hxMh?ad{oUYZ.x1h?{l!#:2<H{mx3n[t{vl!,&a%3Ro(z=iS}6ARnr=Bwsn^wvn`Rnbd`*T}B0!#^X'BG{c9b]{a>>@=be}F?JvS!&BG{d7BG}(Bde#`a1X,Ya@!a'P~=wxf@2bZ}I56B2@@=aybb}08@55B9;5bb}<j3vLv;<Jw3&!>Rfg=ayb^}&OuNBKuLA!)a!P~=x#fD{f2@>==<bbzl?C972@@=Ix^d6rSu,v7w*C(0a)a6#B+a%!sQ[y?3Dt%3[xn~<5rLOu!5p@Ku+D#'!t7~GrP~?rNKvlaya7'!h+v-5qMg=t|cd,U#5AAaa5Abb{S@52B5@a[@52B5Gx[iXueu;d<#`a(!/549C;ag>23ExY5@Dah89b^~689Jv)!~2b[~1Lv'w(%*!a#bX|aPrmawRe]keu7uhv-q6rxu,q`xTo]/a5aU!bNaDXbi!b-!ao!b<bwA!#5@B932:aV2G|:d-)Y#hJrL>RhG<7@C5<H|_=Cau:5aj5@B932:bJ|ng>vIbs)#?C2F|9jPv0w.vISh-MKvUaz(.!9ABbb|[5;5<H|Eg>unwfh;9:4E|YjQsBt|vjx'hYq3!(?C2F|J:2<BaY?C2F|GOu!5x,g|p{ah!-(?C2F|c9:4E|OjXuvvNr}:Rh&i[w*t|cd+U#jJvsu)vsSn~Mkfrmu9p}u7vwv]So!McW#Xa!ax5@A5aY:5;5<H|>kJv~vYrquJu3x4ib#T)2@SmZM?C2F|Bj:rmu9@xPhI(a*a#U#`a3-5Abb|L~@:RhK9:4E|0@52B5G|#C::aY?C2F|-:2<BaY?C2F|.5Jvk!a)javYrquJu3x4ia#T)2@SmYM?C2F|HAxPhH(!a#U#`a*-5Abb|4~@:RhJ9:4E|R@52B5G|F:2<BaY?C2F|Sc^#Xa2j=Qq5CJvB!-g<v{z;hhM?C2F|Zi[vrv{z;hiM?C2F|XKsA>!a)-g<v{z;h[eb?C2F|]i[vrv{z;h]eb?C2F|^iZu.vix,hZq3ah!.(?C2F|QOu!5ShXM:2<BaY?C2F|P", 13494, 2713, 49, 25, 61);

  // node_modules/entities/dist/internal/bin-trie-flags.js
  var BinTrieFlags;
  (function(BinTrieFlags2) {
    BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags2[BinTrieFlags2["FLAG13"] = 8192] = "FLAG13";
    BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
    BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
    BinTrieFlags2[BinTrieFlags2["VALUE_MASK"] = 8191] = "VALUE_MASK";
  })(BinTrieFlags || (BinTrieFlags = {}));

  // node_modules/entities/dist/decode.js
  var CharCodes;
  (function(CharCodes2) {
    CharCodes2[CharCodes2["AMP"] = 38] = "AMP";
    CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
    CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
    CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
    CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
    CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
    CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
    CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  })(CharCodes || (CharCodes = {}));
  var TO_LOWER_BIT = 32;
  var CONSUMED_SHIFT = 21;
  var CODE_POINT_MASK = 2097151;
  var CONSUMED_OVERFLOW = 2047;
  var longNumericConsumed = 0;
  function unpackConsumed(packed) {
    const consumed = packed >>> CONSUMED_SHIFT;
    return consumed === CONSUMED_OVERFLOW ? longNumericConsumed : consumed;
  }
  function isNumber(code2) {
    return code2 - CharCodes.ZERO >>> 0 <= 9;
  }
  function isHexadecimalCharacter(code2) {
    return (code2 | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 5;
  }
  function isAlpha(code2) {
    return (code2 | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 25;
  }
  function isEntityInAttributeInvalidEnd(code2) {
    return code2 === CharCodes.EQUALS || isAlpha(code2) || isNumber(code2);
  }
  var EntityDecoderState;
  (function(EntityDecoderState2) {
    EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
    EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
    EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
    EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
    EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
  })(EntityDecoderState || (EntityDecoderState = {}));
  var DecodingMode;
  (function(DecodingMode2) {
    DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
    DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
    DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
  })(DecodingMode || (DecodingMode = {}));
  function determineBranch(decodeTree, current, nodeIndex, char) {
    const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
    const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
    if (jumpOffset) {
      if (branchCount === 0) {
        return char === jumpOffset ? nodeIndex : -1;
      }
      const slot = char - jumpOffset;
      if (slot >>> 0 >= branchCount)
        return -1;
      const stored = decodeTree[nodeIndex + slot];
      return stored === 0 ? -1 : nodeIndex + branchCount + stored - 1 & 65535;
    }
    if (branchCount === 0)
      return -1;
    const packedKeySlots = branchCount + 1 >> 1;
    const branchEnd = nodeIndex + packedKeySlots + branchCount;
    for (let index = 0; index < branchCount; index++) {
      const packed = decodeTree[nodeIndex + (index >> 1)];
      const key = packed >> ((index & 1) << 3) & 255;
      if (key === char) {
        const pointerIndex = nodeIndex + packedKeySlots + index;
        return branchEnd + decodeTree[pointerIndex] & 65535;
      }
      if (key > char)
        return -1;
    }
    return -1;
  }
  function readTrieValue(decodeTree, nodeIndex, valueLength) {
    if (valueLength === 1) {
      return String.fromCharCode(decodeTree[nodeIndex] & BinTrieFlags.VALUE_MASK);
    }
    if (valueLength === 2) {
      return String.fromCharCode(decodeTree[nodeIndex + 1]);
    }
    return String.fromCharCode(decodeTree[nodeIndex + 1], decodeTree[nodeIndex + 2]);
  }
  function parseNumericEntity(input2, numberStart, inputLength) {
    let offset = numberStart + 1;
    let cp = 0;
    let digitStart = offset;
    if (offset < inputLength && (input2.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      offset += 1;
      digitStart = offset;
      while (offset < inputLength) {
        const char = input2.charCodeAt(offset);
        if (isNumber(char)) {
          cp = cp * 16 + (char - CharCodes.ZERO);
        } else if (isHexadecimalCharacter(char)) {
          cp = cp * 16 + ((char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10);
        } else {
          break;
        }
        offset += 1;
      }
    } else {
      while (offset < inputLength) {
        const digit = input2.charCodeAt(offset) - CharCodes.ZERO;
        if (digit >>> 0 > 9)
          break;
        cp = cp * 10 + digit;
        offset += 1;
      }
    }
    if (offset === digitStart)
      return 0;
    if (offset < inputLength && input2.charCodeAt(offset) === CharCodes.SEMI) {
      offset += 1;
    }
    if (cp > 1114111)
      cp = 1114112;
    let consumed = offset - numberStart;
    if (consumed >= CONSUMED_OVERFLOW) {
      longNumericConsumed = consumed;
      consumed = CONSUMED_OVERFLOW;
    }
    return consumed << CONSUMED_SHIFT | cp;
  }
  function decodeWithTrie(input2, isStrict, isAttribute) {
    const decodeTree = htmlDecodeTree;
    let offset = input2.indexOf("&");
    if (offset < 0)
      return input2;
    const inputLength = input2.length;
    let chunkStart = 0;
    let result = "";
    const root = decodeTree[0];
    const rootJumpOffset = root & BinTrieFlags.JUMP_TABLE;
    const rootBranchCount = (root & BinTrieFlags.BRANCH_LENGTH) >> 7;
    do {
      const entityStart = offset + 1;
      const firstChar = input2.charCodeAt(entityStart);
      let consumed;
      let value;
      if (firstChar === CharCodes.NUM) {
        const packed = parseNumericEntity(input2, entityStart, inputLength);
        consumed = unpackConsumed(packed);
        if (isStrict && consumed > 0 && input2.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI) {
          consumed = 0;
        }
        value = consumed === 0 ? "" : codePointToString(packed & CODE_POINT_MASK);
      } else if (isAlpha(firstChar)) {
        consumed = 0;
        value = "";
        const rootSlotIndex = firstChar - rootJumpOffset;
        let nodeIndex;
        if (rootSlotIndex >>> 0 < rootBranchCount) {
          const stored = decodeTree[1 + rootSlotIndex];
          nodeIndex = stored === 0 ? -1 : rootBranchCount + stored & 65535;
        } else {
          nodeIndex = -1;
        }
        let bestNodeIndex = 0;
        let bestValueLength = 0;
        let current = nodeIndex < 0 ? 0 : decodeTree[nodeIndex];
        let index = entityStart + 1;
        trie: while (index < inputLength) {
          while (
            // Value-less, non-run node with a nonzero jump offset.
            (current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === 0 && (current & BinTrieFlags.JUMP_TABLE) !== 0
          ) {
            const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
            const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
            if (branchCount === 0) {
              if (input2.charCodeAt(index) !== jumpOffset)
                break trie;
              nodeIndex += 1;
            } else {
              const slot = input2.charCodeAt(index) - jumpOffset;
              if (slot >>> 0 >= branchCount)
                break trie;
              const stored = decodeTree[nodeIndex + 1 + slot];
              if (stored === 0)
                break trie;
              nodeIndex = nodeIndex + branchCount + stored & 65535;
            }
            current = decodeTree[nodeIndex];
            index += 1;
            if (index >= inputLength)
              break trie;
          }
          if ((current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === BinTrieFlags.FLAG13) {
            const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
            if (input2.charCodeAt(index) !== (current & BinTrieFlags.JUMP_TABLE)) {
              break;
            }
            index += 1;
            const remaining = runLength - 1;
            let wordIndex = nodeIndex + 1;
            let charIndexInPacked = 0;
            for (; charIndexInPacked + 1 < remaining; charIndexInPacked += 2) {
              const packed = decodeTree[wordIndex];
              if (input2.charCodeAt(index) !== (packed & 255))
                break trie;
              index += 1;
              if (input2.charCodeAt(index) !== (packed >> 8 & 255))
                break trie;
              index += 1;
              wordIndex += 1;
            }
            if (charIndexInPacked < remaining) {
              if (input2.charCodeAt(index) !== (decodeTree[wordIndex] & 255))
                break;
              index += 1;
            }
            nodeIndex += 1 + (runLength >> 1);
            current = decodeTree[nodeIndex];
            continue;
          }
          const valueLength = current >>> 14;
          const char = input2.charCodeAt(index);
          if (valueLength !== 0) {
            if (char === CharCodes.SEMI) {
              consumed = index - entityStart + 1;
              value = valueLength === 1 ? String.fromCharCode(current & BinTrieFlags.VALUE_MASK) : readTrieValue(decodeTree, nodeIndex, valueLength);
              break;
            }
            if (!isStrict && (current & BinTrieFlags.FLAG13) === 0) {
              consumed = index - entityStart;
              bestNodeIndex = nodeIndex;
              bestValueLength = valueLength;
            }
            if (valueLength === 1)
              break;
          }
          const next = determineBranch(decodeTree, current, nodeIndex + (valueLength || 1), char);
          if (next < 0)
            break;
          nodeIndex = next;
          current = decodeTree[nodeIndex];
          index += 1;
        }
        if (value === "") {
          const finalVL = current >>> 14;
          if (finalVL !== 0 && !isStrict && (current & BinTrieFlags.FLAG13) === 0) {
            consumed = index - entityStart;
            bestNodeIndex = nodeIndex;
            bestValueLength = finalVL;
          }
          if (consumed > 0) {
            value = readTrieValue(decodeTree, bestNodeIndex, bestValueLength);
          }
        }
      } else {
        consumed = 0;
        value = "";
      }
      if (consumed === 0 || isAttribute && firstChar !== CharCodes.NUM && input2.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI && entityStart + consumed < inputLength && isEntityInAttributeInvalidEnd(input2.charCodeAt(entityStart + consumed))) {
        offset = entityStart;
      } else {
        if (chunkStart < offset) {
          result += input2.slice(chunkStart, offset);
        }
        result += value;
        offset = chunkStart = entityStart + consumed;
      }
      if (input2.charCodeAt(offset) !== CharCodes.AMP) {
        offset = input2.indexOf("&", offset);
      }
    } while (offset >= 0);
    return result + input2.slice(chunkStart);
  }
  function decodeHTMLStrict(htmlString) {
    return decodeWithTrie(htmlString, true, false);
  }

  // node_modules/entities/dist/index.js
  var EntityLevel;
  (function(EntityLevel2) {
    EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
    EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
  })(EntityLevel || (EntityLevel = {}));
  var EncodingMode;
  (function(EncodingMode2) {
    EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
    EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
    EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
    EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
    EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
  })(EncodingMode || (EncodingMode = {}));

  // node_modules/linkify-it/build/index.mjs
  var REBuilder = class {
    src_Any = Any.source;
    src_Cc = Cc.source;
    src_Z = Z.source;
    src_P = P2.source;
    src_ZPCc = [
      this.src_Z,
      this.src_P,
      this.src_Cc
    ].join("|");
    src_ZCc = [this.src_Z, this.src_Cc].join("|");
    cache = {};
    opts = {
      maxLength: 1e4,
      urlAuth: false,
      schema_names: []
    };
    constructor(opts = {}) {
      this.opts = {
        ...this.opts,
        ...opts
      };
    }
    set(opts = {}) {
      this.opts = {
        ...this.opts,
        ...opts
      };
      this.cache = {};
      return this;
    }
    escapeRE(str) {
      return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
    }
    nestedPairRE(open, close, depth = 4) {
      const openRE = this.escapeRE(open);
      const closeRE = this.escapeRE(close);
      const atom = `(?:(?!${this.src_ZCc}|${openRE}|${closeRE}).)`;
      let pair = `${openRE}${atom}{0,1000}${closeRE}`;
      for (let level = 2; level <= depth; level++) pair = `${openRE}(?:${atom}|${pair}){0,1000}${closeRE}`;
      return pair;
    }
    get_text_separators() {
      return this.cache.text_separators ??= /[><\uff5c]/;
    }
    get_pseudo_letter() {
      return this.cache.src_pseudo_letter ??= new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`);
    }
    get_ipv4_addr() {
      return this.cache.src_ip4 ??= /* @__PURE__ */ new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])");
    }
    get_ipv6_addr() {
      const h16 = "[0-9A-Fa-f]{1,4}";
      const ls32 = `(?:(?:${h16}:${h16})|${this.get_ipv4_addr().source})`;
      return this.cache.src_ip6_addr ??= new RegExp(`(?:(?:${h16}:){6}${ls32}|::(?:${h16}:){5}${ls32}|(?:${h16})?::(?:${h16}:){4}${ls32}|(?:(?:${h16}:){0,1}${h16})?::(?:${h16}:){3}${ls32}|(?:(?:${h16}:){0,2}${h16})?::(?:${h16}:){2}${ls32}|(?:(?:${h16}:){0,3}${h16})?::${h16}:${ls32}|(?:(?:${h16}:){0,4}${h16})?::${ls32}|(?:(?:${h16}:){0,5}${h16})?::${h16}|(?:(?:${h16}:){0,6}${h16})?::)`);
    }
    get_ipv6_url_host() {
      return this.cache.src_ip6_host ??= new RegExp(`\\[${this.get_ipv6_addr().source}\\]`);
    }
    get_ipv6_mail_host() {
      return this.cache.src_ipv6_mail_host ??= new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`);
    }
    get_auth() {
      return this.cache.src_auth ??= new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`);
    }
    get_port() {
      return this.cache.src_port ??= /* @__PURE__ */ new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?");
    }
    get_host_terminator() {
      return this.cache.src_host_terminator ??= new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`);
    }
    get_path_terminator() {
      return this.cache.src_path_terminator ??= new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`);
    }
    get_path() {
      return this.cache.src_path ??= new RegExp(`(?:[/?#](?:${this.nestedPairRE("[", "]")}|${this.nestedPairRE("(", ")")}|${this.nestedPairRE("{", "}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|` + (this.opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-{0,19})|" : "\\-{1,20}|") + `,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|` + this.get_path_extra().source + `[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`);
    }
    get_mail_name() {
      return this.cache.src_mail_name ??= /* @__PURE__ */ new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}");
    }
    get_xn() {
      return this.cache.src_xn ??= /* @__PURE__ */ new RegExp("xn--[a-z0-9\\-]{1,59}");
    }
    get_tld() {
      if (this.cache.tld) return this.cache.tld;
      const tlds_src = [...new Set(this.opts.tlds || [])].sort().reverse().join("|");
      this.cache.tld = new RegExp(`${tlds_src || "$#none#$"}|${this.get_xn().source}`);
      return this.cache.tld;
    }
    get_domain_root() {
      return this.cache.src_domain_root ??= new RegExp("(?:" + this.get_xn().source + `|${this.get_pseudo_letter().source}{1,63})`);
    }
    get_domain() {
      return this.cache.src_domain ??= new RegExp("(?:" + this.get_xn().source + `|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`);
    }
    get_url_host_port() {
      return this.cache.url_host_port ??= new RegExp("(?:" + this.get_ipv6_url_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))` + this.get_port().source + this.get_host_terminator().source);
    }
    get_fuzzy_url_host_port() {
      return this.cache.fuzzy_url_host_port ??= new RegExp("(?:" + (this.opts.fuzzyIP ? this.get_ipv4_addr().source + "|" : "") + `(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))` + this.get_host_terminator().source);
    }
    get_mail_host() {
      return this.cache.src_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))` + this.get_host_terminator().source);
    }
    get_fuzzy_mail_host() {
      return this.cache.src_fuzzy_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))` + this.get_host_terminator().source);
    }
    get_path_extra() {
      return this.cache.src_path_extra ??= /* @__PURE__ */ new RegExp("");
    }
    get_fuzzy_mail_host_search() {
      return this.cache.mail_fuzzy_host_search ??= new RegExp(`@${this.get_fuzzy_mail_host().source}`, "ig");
    }
    get_fuzzy_link_search() {
      return this.cache.link_fuzzy_search ??= new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`, "ig");
    }
    get_http_validator() {
      return this.cache.http_validator ??= new RegExp("\\/\\/" + (this.opts.urlAuth ? this.get_auth().source : "") + this.get_url_host_port().source + this.get_path().source, "iy");
    }
    get_relative_proto_validator() {
      return this.cache.relative_proto_validator ??= new RegExp((this.opts.urlAuth ? this.get_auth().source : "") + `(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})` + this.get_port().source + this.get_host_terminator().source + this.get_path().source, "iy");
    }
    get_mail_name_validator() {
      return this.cache.mail_name_validator ??= new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`);
    }
    get_mailto_validator() {
      return this.cache.mailto_validator ??= new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`, "iy");
    }
    get_schema_names() {
      return this.cache.schema_names ??= new RegExp((this.opts.schema_names || []).map((name) => this.escapeRE(name)).join("|"));
    }
    get_schema_search() {
      return this.cache.schema_search ??= new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`, "ig");
    }
    get_schema_at_start() {
      return this.cache.schema_at_start ??= new RegExp(`^${this.get_schema_search().source}`, "i");
    }
  };
  var web_schema = {
    validate: (text2, pos, self) => {
      const re = self.re.get_http_validator();
      re.lastIndex = pos;
      const m3 = re.exec(text2);
      return m3 ? m3[0].length : 0;
    },
    normalize: (match, self) => self.normalize(match)
  };
  var defaultSchemas = {
    "http:": web_schema,
    "https:": web_schema,
    "ftp:": web_schema,
    "//": {
      validate: function(text2, pos, self) {
        const re = self.re.get_relative_proto_validator();
        re.lastIndex = pos;
        const m3 = re.exec(text2);
        if (m3) {
          if (pos >= 3 && text2[pos - 3] === ":") return 0;
          if (pos >= 3 && text2[pos - 3] === "/") return 0;
          return m3[0].length;
        }
        return 0;
      },
      normalize: (match, self) => self.normalize(match)
    },
    "mailto:": {
      validate: function(text2, pos, self) {
        const re = self.re.get_mailto_validator();
        re.lastIndex = pos;
        const m3 = re.exec(text2);
        return m3 ? m3[0].length : 0;
      },
      normalize: (match, self) => self.normalize(match)
    }
  };
  var tlds_2ch = "a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw";
  var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";
  function unpackTlds() {
    const result = tlds_default.split("|");
    tlds_2ch.split("|").forEach((item) => {
      const sep = item.indexOf(":");
      const prefix = item.slice(0, sep);
      for (const suffix of item.slice(sep + 1)) result.push(prefix + suffix);
    });
    return result;
  }
  var defaultOptions = {
    fuzzyLink: false,
    fuzzyEmail: true,
    fuzzyIP: false,
    "---": false,
    tlds: unpackTlds(),
    urlAuth: false,
    maxLength: 1e4
  };
  var Match = class {
    /** Prefix (protocol) for matched string. Empty for fuzzy links. */
    schema;
    /** First position of matched string. */
    index;
    /** Next position after matched string. */
    lastIndex;
    /** Matched string. */
    raw;
    /** Normalized text of matched string. */
    text;
    /** Normalized URL of matched string. */
    url;
    constructor(text2, schema, index, lastIndex) {
      const raw = text2.slice(index, lastIndex);
      this.schema = schema.toLowerCase();
      this.index = index;
      this.lastIndex = lastIndex;
      this.raw = raw;
      this.text = raw;
      this.url = raw;
    }
  };
  var LinkifyIt = class {
    __opts__;
    __schemas__;
    re;
    /**
    * Creates new linkifier instance.
    *
    * By default understands:
    *
    * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
    * - "fuzzy" emails (foo@bar.com).
    *
    * See {@link LinkifyConstructorOptions} for available options.
    *
    * @param options Recognition options.
    *
    * @example
    * ```javascript
    * import { LinkifyIt } from 'linkify-it'
    *
    * const linkify = new LinkifyIt({ fuzzyLink: true })
    *
    * linkify
    *   .tlds(require('tlds'))       // Reload with full TLD list
    *   .tlds('onion', true)         // Add unofficial `.onion` domain
    *   .add('ftp:', null)           // Disable `ftp:` protocol
    *   .set({ fuzzyIP: true })      // Enable IPs in fuzzy links
    *
    * console.log(linkify.test('Site github.com!')) // true
    * console.log(linkify.match('Site github.com!'))
    * ```
    */
    constructor(options = {}) {
      const { rebuilder, ...linkifyOptions } = options;
      this.__opts__ = {
        ...defaultOptions,
        ...linkifyOptions
      };
      this.__schemas__ = { ...defaultSchemas };
      this.re = rebuilder || new REBuilder();
      this.re.set({
        ...this.__opts__,
        schema_names: Object.keys(this.__schemas__)
      });
    }
    /**
    * Add new rule definition.
    *
    * `schema` is a link prefix (usually, protocol name with `:` at the end,
    * `skype:` for example). `linkify-it` makes sure that prefix is not
    * preceded with alphanumeric char and symbols. Only whitespaces and
    * punctuation allowed.
    *
    * `definition` is a rule to check tail after link prefix. To disable an
    * existing rule, pass `null`.
    *
    * @param schema Rule name (fixed pattern prefix).
    * @param definition Schema definition, or `null` to disable the rule.
    *
    * See [twitter mentions example](https://github.com/markdown-it/linkify-it/blob/master/examples/twitter.mjs).
    */
    add(schema, definition = null) {
      if (!definition) delete this.__schemas__[schema];
      else {
        const def = {
          normalize: (match, self) => self.normalize(match),
          ...definition
        };
        this.__schemas__[schema] = def;
      }
      this.re.set({
        ...this.__opts__,
        schema_names: Object.keys(this.__schemas__)
      });
      return this;
    }
    /**
    * Set recognition options for links without schema.
    *
    * @param options Recognition options.
    */
    set(options = {}) {
      this.__opts__ = {
        ...this.__opts__,
        ...options
      };
      this.re.set({
        ...this.__opts__,
        schema_names: Object.keys(this.__schemas__)
      });
      return this;
    }
    /**
    * Searches linkifiable pattern and returns `true` on success or `false` on fail.
    *
    * @param text Text to scan.
    */
    test(text2) {
      if (!text2.length) return false;
      let m3, re;
      re = this.re.get_schema_search();
      re.lastIndex = 0;
      while ((m3 = re.exec(text2)) !== null) if (this.testSchemaAt(text2, m3[2], re.lastIndex)) return true;
      if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
        re = this.re.get_fuzzy_link_search();
        re.lastIndex = 0;
        if (re.exec(text2) !== null) return true;
      }
      if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
        if (text2.indexOf("@") >= 0) {
          const mailHostRe = this.re.get_fuzzy_mail_host_search();
          const mailNameRe = this.re.get_mail_name_validator();
          mailHostRe.lastIndex = 0;
          while ((m3 = mailHostRe.exec(text2)) !== null) {
            const name = text2.slice(Math.max(0, m3.index - 65), m3.index);
            if (mailNameRe.test(name)) return true;
          }
        }
      }
      return false;
    }
    /**
    * Similar to {@link LinkifyIt.test} but checks only specific protocol tail exactly
    * at given position. Returns length of found pattern (0 on fail).
    *
    * @param text Text to scan.
    * @param schema Rule (schema) name.
    * @param pos Text offset to check from.
    */
    testSchemaAt(text2, schema, pos) {
      if (!this.__schemas__[schema.toLowerCase()]) return 0;
      return this.__schemas__[schema.toLowerCase()].validate(text2.slice(0, pos + this.__opts__.maxLength), pos, this);
    }
    /**
    * Returns array of found link descriptions or `null` on fail. We strongly
    * recommend to use {@link LinkifyIt.test} first, for best speed.
    *
    * @param text Text to scan.
    */
    match(text2) {
      const result = [];
      const schemaRe = this.re.get_schema_search();
      let fuzzyLinkRe;
      let mailHostRe;
      let mailNameRe;
      let fuzzyLinkCandidate;
      let fuzzyEmailCandidate;
      let schemaPrefix;
      let schemaDone = false;
      let fuzzyLinkDone = false;
      let fuzzyEmailDone = false;
      let pos = 0;
      if (!text2.length) return null;
      schemaRe.lastIndex = 0;
      if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
        fuzzyLinkRe = this.re.get_fuzzy_link_search();
        fuzzyLinkRe.lastIndex = 0;
      }
      if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
        mailHostRe = this.re.get_fuzzy_mail_host_search();
        mailHostRe.lastIndex = 0;
        mailNameRe = this.re.get_mail_name_validator();
      }
      for (; ; ) {
        const scanFrom = Math.max(pos - 1, 0);
        if (mailHostRe && mailNameRe && !fuzzyEmailDone && (!fuzzyEmailCandidate || fuzzyEmailCandidate.index < pos)) {
          if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
          for (; ; ) {
            const m3 = mailHostRe.exec(text2);
            if (!m3) {
              fuzzyEmailDone = true;
              fuzzyEmailCandidate = void 0;
              break;
            }
            const name = mailNameRe.exec(text2.slice(Math.max(0, m3.index - 65), m3.index));
            if (!name) continue;
            fuzzyEmailCandidate = {
              schema: "mailto:",
              index: m3.index - name[1].length,
              lastIndex: m3.index + m3[0].length
            };
            if (fuzzyEmailCandidate.index >= pos) break;
            if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
          }
        }
        if (fuzzyLinkRe && !fuzzyLinkDone && (!fuzzyLinkCandidate || fuzzyLinkCandidate.index < pos)) {
          if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
          for (; ; ) {
            const m3 = fuzzyLinkRe.exec(text2);
            if (!m3) {
              fuzzyLinkDone = true;
              fuzzyLinkCandidate = void 0;
              break;
            }
            fuzzyLinkCandidate = {
              schema: "",
              index: m3.index + m3[1].length,
              lastIndex: m3.index + m3[0].length
            };
            if (fuzzyLinkCandidate.index >= pos) break;
            if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
          }
        }
        let fuzzyCandidate = fuzzyEmailCandidate;
        if (!fuzzyCandidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < fuzzyCandidate.index || fuzzyLinkCandidate.index === fuzzyCandidate.index && fuzzyLinkCandidate.lastIndex > fuzzyCandidate.lastIndex)) fuzzyCandidate = fuzzyLinkCandidate;
        let schemaCandidate;
        if (!schemaDone) for (; ; ) {
          if (!schemaPrefix) {
            if (schemaRe.lastIndex < scanFrom) schemaRe.lastIndex = scanFrom;
            const m3 = schemaRe.exec(text2);
            if (!m3) {
              schemaDone = true;
              break;
            }
            schemaPrefix = {
              schema: m3[2],
              index: m3.index + m3[1].length,
              lastIndex: m3.index + m3[0].length
            };
          }
          if (schemaPrefix.index < pos) {
            schemaPrefix = void 0;
            continue;
          }
          if (fuzzyCandidate && schemaPrefix.index > fuzzyCandidate.index) break;
          const prefix = schemaPrefix;
          schemaPrefix = void 0;
          const len = this.testSchemaAt(text2, prefix.schema, prefix.lastIndex);
          if (len) {
            schemaCandidate = {
              schema: prefix.schema,
              index: prefix.index,
              lastIndex: prefix.lastIndex + len
            };
            break;
          }
        }
        let candidate = schemaCandidate;
        if (!candidate || fuzzyEmailCandidate && (fuzzyEmailCandidate.index < candidate.index || fuzzyEmailCandidate.index === candidate.index && fuzzyEmailCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyEmailCandidate;
        if (!candidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < candidate.index || fuzzyLinkCandidate.index === candidate.index && fuzzyLinkCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyLinkCandidate;
        if (!candidate) break;
        if (candidate === fuzzyEmailCandidate) fuzzyEmailCandidate = void 0;
        else if (candidate === fuzzyLinkCandidate) fuzzyLinkCandidate = void 0;
        const match = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
        if (match.schema) this.__schemas__[match.schema].normalize(match, this);
        else this.normalize(match);
        result.push(match);
        pos = candidate.lastIndex;
      }
      if (result.length) return result;
      return null;
    }
    /**
    * Returns fully-formed (not fuzzy) link if it starts at the beginning
    * of the string, and null otherwise.
    *
    * @param text Text to scan.
    */
    matchAtStart(text2) {
      if (!text2.length) return null;
      const m3 = this.re.get_schema_at_start().exec(text2);
      if (!m3) return null;
      const len = this.testSchemaAt(text2, m3[2], m3[0].length);
      if (!len) return null;
      const match = new Match(text2, m3[2], m3.index + m3[1].length, m3.index + m3[0].length + len);
      this.__schemas__[match.schema].normalize(match, this);
      return match;
    }
    /**
    * Load (or merge) new TLDs list. Those are used for fuzzy links (without
    * prefix) to avoid false positives. By default this algorithm is used:
    *
    * - hostname with any 2-letter root zones are ok.
    * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
    *   are ok.
    * - encoded (`xn--...`) root zones are ok.
    *
    * If list is replaced, then exact match for 2-chars root zones will be checked.
    *
    * @param list List of TLDs.
    * @param keepOld Merge with current list if `true` (`false` by default).
    */
    tlds(list2, keepOld = false) {
      list2 = Array.isArray(list2) ? list2 : [list2];
      if (!keepOld) this.__opts__.tlds = list2;
      else this.__opts__.tlds = this.__opts__.tlds.concat(list2);
      this.re.set({
        ...this.__opts__,
        schema_names: Object.keys(this.__schemas__)
      });
      return this;
    }
    /**
    * Default normalizer (if schema does not define its own).
    *
    * @param match Match to normalize.
    */
    normalize(match) {
      if (!match.schema) match.url = `http://${match.url}`;
      if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) match.url = `mailto:${match.url}`;
    }
  };

  // node_modules/punycode.js/punycode.es6.js
  var maxInt = 2147483647;
  var base = 36;
  var tMin = 1;
  var tMax = 26;
  var skew = 38;
  var damp = 700;
  var initialBias = 72;
  var initialN = 128;
  var delimiter = "-";
  var regexPunycode = /^xn--/;
  var regexNonASCII = /[^\0-\x7F]/;
  var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
  var errors = {
    "overflow": "Overflow: input needs wider integers to process",
    "not-basic": "Illegal input >= 0x80 (not a basic code point)",
    "invalid-input": "Invalid input"
  };
  var baseMinusTMin = base - tMin;
  var floor = Math.floor;
  var stringFromCharCode = String.fromCharCode;
  function error(type) {
    throw new RangeError(errors[type]);
  }
  function map(array, callback) {
    const result = [];
    let length = array.length;
    while (length--) {
      result[length] = callback(array[length]);
    }
    return result;
  }
  function mapDomain(domain, callback) {
    const parts = domain.split("@");
    let result = "";
    if (parts.length > 1) {
      result = parts[0] + "@";
      domain = parts[1];
    }
    domain = domain.replace(regexSeparators, ".");
    const labels = domain.split(".");
    const encoded = map(labels, callback).join(".");
    return result + encoded;
  }
  function ucs2decode(string) {
    const output = [];
    let counter = 0;
    const length = string.length;
    while (counter < length) {
      const value = string.charCodeAt(counter++);
      if (value >= 55296 && value <= 56319 && counter < length) {
        const extra = string.charCodeAt(counter++);
        if ((extra & 64512) == 56320) {
          output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
        } else {
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }
  var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
  var basicToDigit = function(codePoint) {
    if (codePoint >= 48 && codePoint < 58) {
      return 26 + (codePoint - 48);
    }
    if (codePoint >= 65 && codePoint < 91) {
      return codePoint - 65;
    }
    if (codePoint >= 97 && codePoint < 123) {
      return codePoint - 97;
    }
    return base;
  };
  var digitToBasic = function(digit, flag) {
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  };
  var adapt = function(delta, numPoints, firstTime) {
    let k2 = 0;
    delta = firstTime ? floor(delta / damp) : delta >> 1;
    delta += floor(delta / numPoints);
    for (; delta > baseMinusTMin * tMax >> 1; k2 += base) {
      delta = floor(delta / baseMinusTMin);
    }
    return floor(k2 + (baseMinusTMin + 1) * delta / (delta + skew));
  };
  var decode2 = function(input2) {
    const output = [];
    const inputLength = input2.length;
    let i2 = 0;
    let n3 = initialN;
    let bias = initialBias;
    let basic = input2.lastIndexOf(delimiter);
    if (basic < 0) {
      basic = 0;
    }
    for (let j2 = 0; j2 < basic; ++j2) {
      if (input2.charCodeAt(j2) >= 128) {
        error("not-basic");
      }
      output.push(input2.charCodeAt(j2));
    }
    for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
      const oldi = i2;
      for (let w2 = 1, k2 = base; ; k2 += base) {
        if (index >= inputLength) {
          error("invalid-input");
        }
        const digit = basicToDigit(input2.charCodeAt(index++));
        if (digit >= base) {
          error("invalid-input");
        }
        if (digit > floor((maxInt - i2) / w2)) {
          error("overflow");
        }
        i2 += digit * w2;
        const t3 = k2 <= bias ? tMin : k2 >= bias + tMax ? tMax : k2 - bias;
        if (digit < t3) {
          break;
        }
        const baseMinusT = base - t3;
        if (w2 > floor(maxInt / baseMinusT)) {
          error("overflow");
        }
        w2 *= baseMinusT;
      }
      const out = output.length + 1;
      bias = adapt(i2 - oldi, out, oldi == 0);
      if (floor(i2 / out) > maxInt - n3) {
        error("overflow");
      }
      n3 += floor(i2 / out);
      i2 %= out;
      output.splice(i2++, 0, n3);
    }
    return String.fromCodePoint(...output);
  };
  var encode2 = function(input2) {
    const output = [];
    input2 = ucs2decode(input2);
    const inputLength = input2.length;
    let n3 = initialN;
    let delta = 0;
    let bias = initialBias;
    for (const currentValue of input2) {
      if (currentValue < 128) {
        output.push(stringFromCharCode(currentValue));
      }
    }
    const basicLength = output.length;
    let handledCPCount = basicLength;
    if (basicLength) {
      output.push(delimiter);
    }
    while (handledCPCount < inputLength) {
      let m3 = maxInt;
      for (const currentValue of input2) {
        if (currentValue >= n3 && currentValue < m3) {
          m3 = currentValue;
        }
      }
      const handledCPCountPlusOne = handledCPCount + 1;
      if (m3 - n3 > floor((maxInt - delta) / handledCPCountPlusOne)) {
        error("overflow");
      }
      delta += (m3 - n3) * handledCPCountPlusOne;
      n3 = m3;
      for (const currentValue of input2) {
        if (currentValue < n3 && ++delta > maxInt) {
          error("overflow");
        }
        if (currentValue === n3) {
          let q2 = delta;
          for (let k2 = base; ; k2 += base) {
            const t3 = k2 <= bias ? tMin : k2 >= bias + tMax ? tMax : k2 - bias;
            if (q2 < t3) {
              break;
            }
            const qMinusT = q2 - t3;
            const baseMinusT = base - t3;
            output.push(
              stringFromCharCode(digitToBasic(t3 + qMinusT % baseMinusT, 0))
            );
            q2 = floor(qMinusT / baseMinusT);
          }
          output.push(stringFromCharCode(digitToBasic(q2, 0)));
          bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
          delta = 0;
          ++handledCPCount;
        }
      }
      ++delta;
      ++n3;
    }
    return output.join("");
  };
  var toUnicode = function(input2) {
    return mapDomain(input2, function(string) {
      return regexPunycode.test(string) ? decode2(string.slice(4).toLowerCase()) : string;
    });
  };
  var toASCII = function(input2) {
    return mapDomain(input2, function(string) {
      return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
    });
  };
  var punycode = {
    /**
     * A string representing the current Punycode.js version number.
     * @memberOf punycode
     * @type String
     */
    "version": "2.3.1",
    /**
     * An object of methods to convert from JavaScript's internal character
     * representation (UCS-2) to Unicode code points, and back.
     * @see <https://mathiasbynens.be/notes/javascript-encoding>
     * @memberOf punycode
     * @type Object
     */
    "ucs2": {
      "decode": ucs2decode,
      "encode": ucs2encode
    },
    "decode": decode2,
    "encode": encode2,
    "toASCII": toASCII,
    "toUnicode": toUnicode
  };
  var punycode_es6_default = punycode;

  // node_modules/markdown-it/dist/markdown-it.mjs
  var __defProp2 = Object.defineProperty;
  var __exportAll = (all, no_symbols) => {
    let target = {};
    for (var name in all) __defProp2(target, name, {
      get: all[name],
      enumerable: true
    });
    if (!no_symbols) __defProp2(target, Symbol.toStringTag, { value: "Module" });
    return target;
  };
  var utils_exports = /* @__PURE__ */ __exportAll({
    arrayReplaceAt: () => arrayReplaceAt,
    asciiTrim: () => asciiTrim,
    callable: () => callable,
    escapeHtml: () => escapeHtml,
    escapeRE: () => escapeRE,
    fromCodePoint: () => fromCodePoint,
    isMdAsciiPunct: () => isMdAsciiPunct,
    isPunctChar: () => isPunctChar,
    isPunctCharCode: () => isPunctCharCode,
    isSpace: () => isSpace,
    isValidEntityCode: () => isValidEntityCode,
    isWhiteSpace: () => isWhiteSpace,
    lib: () => lib,
    normalizeReference: () => normalizeReference,
    unescapeAll: () => unescapeAll,
    unescapeMd: () => unescapeMd
  });
  function callable(cls) {
    const wrapper = function(...args) {
      return Reflect.construct(cls, args, new.target && new.target !== wrapper ? new.target : cls);
    };
    Object.defineProperty(wrapper, "name", { value: cls.name });
    Object.setPrototypeOf(wrapper, cls);
    wrapper.prototype = cls.prototype;
    return wrapper;
  }
  function arrayReplaceAt(src, pos, newElements) {
    return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
  }
  function isValidEntityCode(c2) {
    if (c2 >= 55296 && c2 <= 57343) return false;
    if (c2 >= 64976 && c2 <= 65007) return false;
    if ((c2 & 65535) === 65535 || (c2 & 65535) === 65534) return false;
    if (c2 >= 0 && c2 <= 8) return false;
    if (c2 === 11) return false;
    if (c2 >= 14 && c2 <= 31) return false;
    if (c2 >= 127 && c2 <= 159) return false;
    if (c2 > 1114111) return false;
    return true;
  }
  function fromCodePoint(c2) {
    if (c2 > 65535) {
      c2 -= 65536;
      const surrogate1 = 55296 + (c2 >> 10);
      const surrogate2 = 56320 + (c2 & 1023);
      return String.fromCharCode(surrogate1, surrogate2);
    }
    return String.fromCharCode(c2);
  }
  var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
  var UNESCAPE_ALL_RE = new RegExp(`${UNESCAPE_MD_RE.source}|${/&([a-z#][a-z0-9]{1,31});/gi.source}`, "gi");
  var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
  function replaceEntityPattern(match, name) {
    if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
      const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      if (isValidEntityCode(code2)) return fromCodePoint(code2);
      return match;
    }
    const decoded = decodeHTMLStrict(match);
    if (decoded !== match) return decoded;
    return match;
  }
  function unescapeMd(str) {
    if (str.indexOf("\\") < 0) return str;
    return str.replace(UNESCAPE_MD_RE, "$1");
  }
  function unescapeAll(str) {
    if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) return str;
    return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity2) {
      if (escaped) return escaped;
      return replaceEntityPattern(match, entity2);
    });
  }
  var HTML_ESCAPE_TEST_RE = /[&<>"]/;
  var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
  var HTML_REPLACEMENTS = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  };
  function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
  }
  function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    return str;
  }
  var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
  function escapeRE(str) {
    return str.replace(REGEXP_ESCAPE_RE, "\\$&");
  }
  function isSpace(code2) {
    switch (code2) {
      case 9:
      case 32:
        return true;
    }
    return false;
  }
  function isWhiteSpace(code2) {
    if (code2 >= 8192 && code2 <= 8202) return true;
    switch (code2) {
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 32:
      case 160:
      case 5760:
      case 8239:
      case 8287:
      case 12288:
        return true;
    }
    return false;
  }
  function isPunctChar(ch) {
    return P2.test(ch) || S2.test(ch);
  }
  function isPunctCharCode(code2) {
    return isPunctChar(fromCodePoint(code2));
  }
  function isMdAsciiPunct(ch) {
    switch (ch) {
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 39:
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
      case 58:
      case 59:
      case 60:
      case 61:
      case 62:
      case 63:
      case 64:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 123:
      case 124:
      case 125:
      case 126:
        return true;
      default:
        return false;
    }
  }
  function normalizeReference(str) {
    str = str.trim().replace(/\s+/g, " ");
    return str.toLowerCase().toUpperCase();
  }
  function isAsciiTrimmable(c2) {
    return c2 === 32 || c2 === 9 || c2 === 10 || c2 === 13;
  }
  function asciiTrim(str) {
    let start = 0;
    for (; start < str.length; start++) if (!isAsciiTrimmable(str.charCodeAt(start))) break;
    let end = str.length - 1;
    for (; end >= start; end--) if (!isAsciiTrimmable(str.charCodeAt(end))) break;
    return str.slice(start, end + 1);
  }
  var lib = {
    mdurl: mdurl_exports,
    ucmicro: build_exports
  };
  function parseLinkLabel(state, start, disableNested) {
    let level, found, marker, prevPos;
    const max = state.posMax;
    const oldPos = state.pos;
    state.pos = start + 1;
    level = 1;
    while (state.pos < max) {
      marker = state.src.charCodeAt(state.pos);
      if (marker === 93) {
        level--;
        if (level === 0) {
          found = true;
          break;
        }
      }
      prevPos = state.pos;
      state.md.inline.skipToken(state);
      if (marker === 91) {
        if (prevPos === state.pos - 1) level++;
        else if (disableNested) {
          state.pos = oldPos;
          return -1;
        }
      }
    }
    let labelEnd = -1;
    if (found) labelEnd = state.pos;
    state.pos = oldPos;
    return labelEnd;
  }
  function parseLinkDestination(str, start, max) {
    let code2;
    let pos = start;
    const result = {
      ok: false,
      pos: 0,
      str: ""
    };
    if (str.charCodeAt(pos) === 60) {
      pos++;
      while (pos < max) {
        code2 = str.charCodeAt(pos);
        if (code2 === 10) return result;
        if (code2 === 60) return result;
        if (code2 === 62) {
          result.pos = pos + 1;
          result.str = unescapeAll(str.slice(start + 1, pos));
          result.ok = true;
          return result;
        }
        if (code2 === 92 && pos + 1 < max) {
          pos += 2;
          continue;
        }
        pos++;
      }
      return result;
    }
    let level = 0;
    while (pos < max) {
      code2 = str.charCodeAt(pos);
      if (code2 === 32) break;
      if (code2 < 32 || code2 === 127) break;
      if (code2 === 92 && pos + 1 < max) {
        if (str.charCodeAt(pos + 1) === 32) {
          pos++;
          continue;
        }
        pos += 2;
        continue;
      }
      if (code2 === 40) {
        level++;
        if (level > 32) return result;
      }
      if (code2 === 41) {
        if (level === 0) break;
        level--;
      }
      pos++;
    }
    if (start === pos) return result;
    if (level !== 0) return result;
    result.str = unescapeAll(str.slice(start, pos));
    result.pos = pos;
    result.ok = true;
    return result;
  }
  function parseLinkTitle(str, start, max, prev_state) {
    let code2;
    let pos = start;
    const state = {
      ok: false,
      can_continue: false,
      pos: 0,
      str: "",
      marker: 0
    };
    if (prev_state) {
      state.str = prev_state.str;
      state.marker = prev_state.marker;
    } else {
      if (pos >= max) return state;
      let marker = str.charCodeAt(pos);
      if (marker !== 34 && marker !== 39 && marker !== 40) return state;
      start++;
      pos++;
      if (marker === 40) marker = 41;
      state.marker = marker;
    }
    while (pos < max) {
      code2 = str.charCodeAt(pos);
      if (code2 === state.marker) {
        state.pos = pos + 1;
        state.str += unescapeAll(str.slice(start, pos));
        state.ok = true;
        return state;
      } else if (code2 === 40 && state.marker === 41) return state;
      else if (code2 === 92 && pos + 1 < max) pos++;
      pos++;
    }
    state.can_continue = true;
    state.str += unescapeAll(str.slice(start, pos));
    return state;
  }
  var helpers_exports = /* @__PURE__ */ __exportAll({
    parseLinkDestination: () => parseLinkDestination,
    parseLinkLabel: () => parseLinkLabel,
    parseLinkTitle: () => parseLinkTitle
  });
  function _typeof(o2) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
      return typeof o3;
    } : function(o3) {
      return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
    }, _typeof(o2);
  }
  function toPrimitive(t3, r2) {
    if ("object" != _typeof(t3) || !t3) return t3;
    var e2 = t3[Symbol.toPrimitive];
    if (void 0 !== e2) {
      var i2 = e2.call(t3, r2 || "default");
      if ("object" != _typeof(i2)) return i2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t3);
  }
  function toPropertyKey(t3) {
    var i2 = toPrimitive(t3, "string");
    return "symbol" == _typeof(i2) ? i2 : i2 + "";
  }
  function _defineProperty(e2, r2, t3) {
    return (r2 = toPropertyKey(r2)) in e2 ? Object.defineProperty(e2, r2, {
      value: t3,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e2[r2] = t3, e2;
  }
  var Token = class {
    constructor(type, tag, nesting) {
      _defineProperty(
        this,
        /**
        * Source map info. Format: `[ line_begin, line_end ]`
        */
        "map",
        null
      );
      _defineProperty(
        this,
        /**
        * nesting level, the same as `state.level`
        */
        "level",
        0
      );
      _defineProperty(
        this,
        /**
        * An array of child nodes (inline and img tokens)
        */
        "children",
        null
      );
      _defineProperty(
        this,
        /**
        * In a case of self-closing tag (code, html, fence, etc.),
        * it has contents of this tag.
        */
        "content",
        ""
      );
      _defineProperty(
        this,
        /**
        * '*' or '_' for emphasis, fence string for fence, etc.
        */
        "markup",
        ""
      );
      _defineProperty(
        this,
        /**
        * Additional information:
        *
        * - Info string for "fence" tokens
        * - The value "auto" for autolink "link_open" and "link_close" tokens
        * - The string value of the item marker for ordered-list "list_item_open" tokens
        */
        "info",
        ""
      );
      _defineProperty(
        this,
        /**
        * True for block-level tokens, false for inline tokens.
        * Used in renderer to calculate line breaks
        */
        "block",
        false
      );
      _defineProperty(
        this,
        /**
        * If it's true, ignore this element when rendering. Used for tight lists
        * to hide paragraphs.
        */
        "hidden",
        false
      );
      this.type = type;
      this.tag = tag;
      this.attrs = null;
      this.nesting = nesting;
      this.meta = null;
    }
    /**
    * Search attribute index by name.
    */
    attrIndex(name) {
      if (!this.attrs) return -1;
      const attrs = this.attrs;
      for (let i2 = 0, len = attrs.length; i2 < len; i2++) if (attrs[i2][0] === name) return i2;
      return -1;
    }
    /**
    * Add `[ name, value ]` attribute to list. Init attrs if necessary
    */
    attrPush(attrData) {
      if (this.attrs) this.attrs.push(attrData);
      else this.attrs = [attrData];
    }
    /**
    * Set `name` attribute to `value`. Override old value if exists.
    */
    attrSet(name, value) {
      const idx = this.attrIndex(name);
      const attrData = [name, value];
      if (idx < 0) this.attrPush(attrData);
      else this.attrs[idx] = attrData;
    }
    /**
    * Get the value of attribute `name`, or null if it does not exist.
    */
    attrGet(name) {
      const idx = this.attrIndex(name);
      let value = null;
      if (idx >= 0) value = this.attrs[idx][1];
      return value;
    }
    /**
    * Join value to existing attribute via space. Or create new attribute if not
    * exists. Useful to operate with token classes.
    */
    attrJoin(name, value) {
      const idx = this.attrIndex(name);
      if (idx < 0) this.attrPush([name, value]);
      else this.attrs[idx][1] = `${this.attrs[idx][1]} ${value}`;
    }
  };
  var Ruler = class {
    constructor() {
      _defineProperty(
        this,
        /** @internal */
        "__rules__",
        []
      );
      _defineProperty(
        this,
        /** @internal */
        "__cache__",
        null
      );
    }
    /** @internal */
    __find__(name) {
      for (let i2 = 0; i2 < this.__rules__.length; i2++) if (this.__rules__[i2].name === name) return i2;
      return -1;
    }
    /** @internal */
    __compile__() {
      const chains = /* @__PURE__ */ new Set();
      this.__rules__.forEach((rule) => {
        if (!rule.enabled) return;
        rule.alt.forEach((altName) => {
          if (altName) chains.add(altName);
        });
      });
      this.__cache__ = /* @__PURE__ */ Object.create(null);
      this.__cache__[""] = [];
      this.__rules__.forEach((rule) => {
        if (rule.enabled) this.__cache__[""].push(rule.fn);
      });
      chains.forEach((chain) => {
        this.__cache__[chain] = [];
        this.__rules__.forEach((rule) => {
          if (rule.enabled && rule.alt.indexOf(chain) >= 0) this.__cache__[chain].push(rule.fn);
        });
      });
    }
    /**
    * Replace rule by name with new function & options. Throws error if name not
    * found.
    *
    * @example Replace existing typographer replacement rule with new one
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * const md = new MarkdownIt()
    *
    * md.core.ruler.at('replacements', function replace(state) {
    *   //...
    * });
    * ```
    */
    at(name, fn, options = {}) {
      const index = this.__find__(name);
      if (index === -1) throw new Error(`Parser rule not found: ${name}`);
      this.__rules__[index].fn = fn;
      this.__rules__[index].alt = options.alt || [];
      this.__cache__ = null;
    }
    /**
    * Add new rule to chain before one with given name. See also
    * {@link Ruler.after}, {@link Ruler.push}.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * const md = new MarkdownIt()
    *
    * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
    *   //...
    * });
    * ```
    */
    before(beforeName, ruleName, fn, options = {}) {
      const index = this.__find__(beforeName);
      if (index === -1) throw new Error(`Parser rule not found: ${beforeName}`);
      this.__rules__.splice(index, 0, {
        name: ruleName,
        enabled: true,
        fn,
        alt: options.alt || []
      });
      this.__cache__ = null;
    }
    /**
    * Add new rule to chain after one with given name. See also
    * {@link Ruler.before}, {@link Ruler.push}.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * const md = new MarkdownIt()
    *
    * md.inline.ruler.after('text', 'my_rule', function replace(state) {
    *   //...
    * });
    * ```
    */
    after(afterName, ruleName, fn, options = {}) {
      const index = this.__find__(afterName);
      if (index === -1) throw new Error(`Parser rule not found: ${afterName}`);
      this.__rules__.splice(index + 1, 0, {
        name: ruleName,
        enabled: true,
        fn,
        alt: options.alt || []
      });
      this.__cache__ = null;
    }
    /**
    * Push new rule to the end of chain. See also
    * {@link Ruler.before}, {@link Ruler.after}.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * const md = new MarkdownIt()
    *
    * md.core.ruler.push('my_rule', function replace(state) {
    *   //...
    * });
    * ```
    */
    push(ruleName, fn, options = {}) {
      this.__rules__.push({
        name: ruleName,
        enabled: true,
        fn,
        alt: options.alt || []
      });
      this.__cache__ = null;
    }
    /**
    * Enable rules with given names. If any rule name not found - throw Error.
    * Errors can be disabled by second param.
    *
    * See also {@link Ruler.disable}, {@link Ruler.enableOnly}.
    *
    * Returns list of found rule names (if no exception happened).
    */
    enable(list2, ignoreInvalid = false) {
      if (!Array.isArray(list2)) list2 = [list2];
      const result = [];
      list2.forEach((name) => {
        const idx = this.__find__(name);
        if (idx < 0) {
          if (ignoreInvalid) return;
          throw new Error(`Rules manager: invalid rule name ${name}`);
        }
        this.__rules__[idx].enabled = true;
        result.push(name);
      });
      this.__cache__ = null;
      return result;
    }
    /**
    * Enable rules with given names, and disable everything else. If any rule name
    * not found - throw Error. Errors can be disabled by second param.
    *
    * See also {@link Ruler.disable}, {@link Ruler.enable}.
    */
    enableOnly(list2, ignoreInvalid = false) {
      if (!Array.isArray(list2)) list2 = [list2];
      this.__rules__.forEach((rule) => {
        rule.enabled = false;
      });
      this.enable(list2, ignoreInvalid);
    }
    /**
    * Disable rules with given names. If any rule name not found - throw Error.
    * Errors can be disabled by second param.
    *
    * See also {@link Ruler.enable}, {@link Ruler.enableOnly}.
    *
    * Returns list of found rule names (if no exception happened).
    */
    disable(list2, ignoreInvalid = false) {
      if (!Array.isArray(list2)) list2 = [list2];
      const result = [];
      list2.forEach((name) => {
        const idx = this.__find__(name);
        if (idx < 0) {
          if (ignoreInvalid) return;
          throw new Error(`Rules manager: invalid rule name ${name}`);
        }
        this.__rules__[idx].enabled = false;
        result.push(name);
      });
      this.__cache__ = null;
      return result;
    }
    /**
    * Return array of active functions (rules) for given chain name. It analyzes
    * rules configuration, compiles caches if not exists and returns result.
    *
    * Default chain name is `''` (empty string). It can't be skipped. That's
    * done intentionally, to keep signature monomorphic for high speed.
    */
    getRules(chainName) {
      if (!this.__cache__) this.__compile__();
      return this.__cache__[chainName] || [];
    }
  };
  var default_rules = {};
  default_rules.code_inline = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return `<code${slf.renderAttrs(token)}>${escapeHtml(token.content)}</code>`;
  };
  default_rules.code_block = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return `<pre${slf.renderAttrs(token)}><code>${escapeHtml(tokens[idx].content)}</code></pre>
`;
  };
  default_rules.fence = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : "";
    let langName = "";
    let langAttrs = "";
    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
      langAttrs = arr.slice(2).join("");
    }
    let highlighted;
    if (options.highlight) highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
    else highlighted = escapeHtml(token.content);
    if (highlighted.indexOf("<pre") === 0) return highlighted + "\n";
    if (info) {
      const i2 = token.attrIndex("class");
      const tmpAttrs = token.attrs ? token.attrs.slice() : [];
      if (i2 < 0) tmpAttrs.push(["class", `${options.langPrefix}${langName}`]);
      else {
        tmpAttrs[i2] = [tmpAttrs[i2][0], tmpAttrs[i2][1]];
        tmpAttrs[i2][1] += ` ${options.langPrefix}${langName}`;
      }
      const tmpToken = { attrs: tmpAttrs };
      return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
    }
    return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
  };
  default_rules.image = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
    return slf.renderToken(tokens, idx, options);
  };
  default_rules.hardbreak = function(tokens, idx, options) {
    return options.xhtmlOut ? "<br />\n" : "<br>\n";
  };
  default_rules.softbreak = function(tokens, idx, options) {
    return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
  };
  default_rules.text = function(tokens, idx) {
    return escapeHtml(tokens[idx].content);
  };
  default_rules.html_block = function(tokens, idx) {
    return tokens[idx].content;
  };
  default_rules.html_inline = function(tokens, idx) {
    return tokens[idx].content;
  };
  var Renderer = class {
    constructor() {
      _defineProperty(
        this,
        /**
        * Contains render rules for tokens. Can be updated and extended.
        *
        * See [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts)
        * for more details and examples.
        *
        * @example Custom render rules
        * ```javascript
        * import MarkdownIt from 'markdown-it'
        * const md = new MarkdownIt()
        *
        * md.renderer.rules.strong_open  = function () { return '<b>'; };
        * md.renderer.rules.strong_close = function () { return '</b>'; };
        *
        * const result = md.renderInline(...);
        * ```
        *
        * @example Each rule is called as independent static function with fixed signature
        * ```javascript
        * function my_token_render(tokens, idx, options, env, renderer) {
        *   // ...
        *   return renderedHTML;
        * }
        * ```
        */
        "rules",
        Object.assign({}, default_rules)
      );
    }
    /**
    * Render token attributes to string.
    */
    renderAttrs(token) {
      let i2, l2, result;
      if (!token.attrs) return "";
      result = "";
      for (i2 = 0, l2 = token.attrs.length; i2 < l2; i2++) result += ` ${escapeHtml(token.attrs[i2][0])}="${escapeHtml(String(token.attrs[i2][1]))}"`;
      return result;
    }
    /**
    * Default token renderer. Can be overriden by custom function
    * in {@link Renderer.rules}.
    */
    renderToken(tokens, idx, options) {
      const token = tokens[idx];
      let result = "";
      if (token.hidden) return "";
      let prev = idx - 1;
      while (prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === 0) prev--;
      if (token.block && token.nesting !== -1 && prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === -1) result += "\n";
      result += (token.nesting === -1 ? "</" : "<") + token.tag;
      result += this.renderAttrs(token);
      if (token.nesting === 0 && options.xhtmlOut) result += " /";
      let needLf = false;
      if (token.block) {
        needLf = true;
        if (token.nesting === 1) {
          let next = idx + 1;
          while (next < tokens.length && tokens[next].hidden && tokens[next].nesting === 0) next++;
          if (next < tokens.length) {
            const nextToken = tokens[next];
            if (nextToken.type === "inline" || nextToken.hidden) needLf = false;
            else if (nextToken.nesting === -1 && nextToken.tag === token.tag) needLf = false;
          }
        }
      }
      result += needLf ? ">\n" : ">";
      return result;
    }
    /**
    * The same as {@link Renderer.render}, but for single token of `inline` type.
    */
    renderInline(tokens, options, env) {
      let result = "";
      const rules = this.rules;
      for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
        const type = tokens[i2].type;
        if (typeof rules[type] !== "undefined") result += rules[type](tokens, i2, options, env, this);
        else result += this.renderToken(tokens, i2, options);
      }
      return result;
    }
    /**
    * Special kludge for image `alt` attributes to conform CommonMark spec.
    * Don't try to use it! Spec requires to show `alt` content with stripped markup,
    * instead of simple escaping.
    */
    renderInlineAsText(tokens, options, env) {
      let result = "";
      for (let i2 = 0, len = tokens.length; i2 < len; i2++) switch (tokens[i2].type) {
        case "text":
        case "code_inline":
          result += tokens[i2].content;
          break;
        case "image":
          result += this.renderInlineAsText(tokens[i2].children, options, env);
          break;
        case "html_inline":
        case "html_block":
          result += tokens[i2].content;
          break;
        case "softbreak":
        case "hardbreak":
          result += "\n";
      }
      return result;
    }
    /**
    * Takes token stream and generates HTML. Probably, you will never need to call
    * this method directly.
    */
    render(tokens, options, env) {
      let result = "";
      const rules = this.rules;
      for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
        const type = tokens[i2].type;
        if (type === "inline") result += this.renderInline(tokens[i2].children, options, env);
        else if (typeof rules[type] !== "undefined") result += rules[type](tokens, i2, options, env, this);
        else result += this.renderToken(tokens, i2, options);
      }
      return result;
    }
  };
  var StateCore = class {
    constructor(src, md2, env) {
      _defineProperty(this, "tokens", []);
      _defineProperty(this, "inlineMode", false);
      _defineProperty(this, "Token", Token);
      this.src = src;
      this.env = env;
      this.md = md2;
    }
  };
  var UNNORMALIZED_NEWLINE_RE = /\r\n?/g;
  var NULL_RE = /\0/g;
  function normalize(state) {
    let str;
    str = state.src.replace(UNNORMALIZED_NEWLINE_RE, "\n");
    str = str.replace(NULL_RE, "\uFFFD");
    state.src = str;
  }
  function block(state) {
    let token;
    if (state.inlineMode) {
      token = new state.Token("inline", "", 0);
      token.content = state.src;
      token.map = [0, 1];
      token.children = [];
      state.tokens.push(token);
    } else state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
  function strip_references(state) {
    const tokens = state.tokens;
    let last = 0;
    for (let curr = 0; curr < tokens.length; curr++) {
      if (tokens[curr].type === "reference_definition") continue;
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
    if (tokens.length !== last) tokens.length = last;
  }
  function inline(state) {
    const tokens = state.tokens;
    for (let i2 = 0, l2 = tokens.length; i2 < l2; i2++) {
      const tok = tokens[i2];
      if (tok.type === "inline") state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
  function isLinkOpen$1(str) {
    return /^<a[>\s]/i.test(str);
  }
  function isLinkClose$1(str) {
    return /^<\/a\s*>/i.test(str);
  }
  function linkify$1(state) {
    const blockTokens = state.tokens;
    if (!state.md.options.linkify) return;
    for (let j2 = 0, l2 = blockTokens.length; j2 < l2; j2++) {
      if (blockTokens[j2].type !== "inline" || !state.md.linkify.test(blockTokens[j2].content)) continue;
      const tokens = blockTokens[j2].children;
      const replacements = [];
      let htmlLinkLevel = 0;
      for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
        const currentToken = tokens[i2];
        if (currentToken.type === "link_close") {
          i2--;
          while (tokens[i2].level !== currentToken.level && tokens[i2].type !== "link_open") i2--;
          continue;
        }
        if (currentToken.type === "html_inline") {
          if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) htmlLinkLevel--;
          if (isLinkClose$1(currentToken.content)) htmlLinkLevel++;
        }
        if (htmlLinkLevel > 0) continue;
        if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
          const text2 = currentToken.content;
          let links = state.md.linkify.match(text2);
          const nodes = [];
          let level = currentToken.level;
          let lastPos = 0;
          if (links.length > 0 && links[0].index === 0 && i2 > 0 && tokens[i2 - 1].type === "text_special") links = links.slice(1);
          for (let ln = 0; ln < links.length; ln++) {
            const url = links[ln].url;
            const fullUrl = state.md.normalizeLink(url);
            if (!state.md.validateLink(fullUrl)) continue;
            let urlText = links[ln].text;
            if (!links[ln].schema) urlText = state.md.normalizeLinkText(`http://${urlText}`).replace(/^http:\/\//, "");
            else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) urlText = state.md.normalizeLinkText(`mailto:${urlText}`).replace(/^mailto:/, "");
            else urlText = state.md.normalizeLinkText(urlText);
            const pos = links[ln].index;
            if (pos > lastPos) {
              const token = new state.Token("text", "", 0);
              token.content = text2.slice(lastPos, pos);
              token.level = level;
              nodes.push(token);
            }
            const token_o = new state.Token("link_open", "a", 1);
            token_o.attrs = [["href", fullUrl]];
            token_o.level = level++;
            token_o.markup = "linkify";
            token_o.info = "auto";
            nodes.push(token_o);
            const token_t = new state.Token("text", "", 0);
            token_t.content = urlText;
            token_t.level = level;
            nodes.push(token_t);
            const token_c = new state.Token("link_close", "a", -1);
            token_c.level = --level;
            token_c.markup = "linkify";
            token_c.info = "auto";
            nodes.push(token_c);
            lastPos = links[ln].lastIndex;
          }
          if (lastPos < text2.length) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos);
            token.level = level;
            nodes.push(token);
          }
          replacements.push({
            index: i2,
            nodes
          });
        }
      }
      if (replacements.length > 0) {
        let newTokensLength = tokens.length;
        for (const replacement of replacements) newTokensLength += replacement.nodes.length - 1;
        const newTokens = new Array(newTokensLength);
        let replacementIndex = 0;
        let newTokenIndex = 0;
        replacements.reverse();
        for (let i2 = 0; i2 < tokens.length; i2++) {
          const replacement = replacements[replacementIndex];
          if ((replacement === null || replacement === void 0 ? void 0 : replacement.index) === i2) {
            for (const node of replacement.nodes) newTokens[newTokenIndex++] = node;
            replacementIndex++;
          } else newTokens[newTokenIndex++] = tokens[i2];
        }
        blockTokens[j2].children = newTokens;
      }
    }
  }
  var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
  var SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
  var SCOPED_ABBR_RE = /\((c|tm|r)\)/gi;
  var SCOPED_ABBR = {
    c: "\xA9",
    r: "\xAE",
    tm: "\u2122"
  };
  function replaceFn(match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  }
  function replace_scoped(inlineTokens) {
    let inside_autolink = 0;
    for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
      const token = inlineTokens[i2];
      if (token.type === "text" && !inside_autolink) token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
      if (token.type === "link_open" && token.info === "auto") inside_autolink--;
      if (token.type === "link_close" && token.info === "auto") inside_autolink++;
    }
  }
  function replace_rare(inlineTokens) {
    let inside_autolink = 0;
    for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
      const token = inlineTokens[i2];
      if (token.type === "text" && !inside_autolink) {
        if (RARE_RE.test(token.content)) token.content = token.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013");
      }
      if (token.type === "link_open" && token.info === "auto") inside_autolink--;
      if (token.type === "link_close" && token.info === "auto") inside_autolink++;
    }
  }
  function replace(state) {
    let blkIdx;
    if (!state.md.options.typographer) return;
    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== "inline") continue;
      if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) replace_scoped(state.tokens[blkIdx].children);
      if (RARE_RE.test(state.tokens[blkIdx].content)) replace_rare(state.tokens[blkIdx].children);
    }
  }
  var QUOTE_TEST_RE = /['"]/;
  var QUOTE_RE = /['"]/g;
  var APOSTROPHE = "\u2019";
  var MAX_OPENERS = 1e3;
  function truncateStack(stack, heads, length) {
    while (stack.length > length) {
      const item = stack.pop();
      if (item.isSingleQuote) heads.single = item.prevSameQuoteIdx;
      else heads.double = item.prevSameQuoteIdx;
    }
  }
  function addReplacement(replacements, tokenIdx, pos, ch) {
    if (!replacements[tokenIdx]) replacements[tokenIdx] = [];
    replacements[tokenIdx].push({
      pos,
      ch
    });
  }
  function applyReplacements(str, replacements) {
    let result = "";
    let lastPos = 0;
    replacements.sort((a2, b2) => a2.pos - b2.pos);
    for (let i2 = 0; i2 < replacements.length; i2++) {
      const replacement = replacements[i2];
      result += str.slice(lastPos, replacement.pos) + replacement.ch;
      lastPos = replacement.pos + 1;
    }
    return result + str.slice(lastPos);
  }
  function process_inlines(tokens, state) {
    let j2;
    const stack = [];
    const heads = {
      single: -1,
      double: -1
    };
    const replacements = {};
    for (let i2 = 0; i2 < tokens.length; i2++) {
      const token = tokens[i2];
      const thisLevel = tokens[i2].level;
      for (j2 = stack.length - 1; j2 >= 0; j2--) if (stack[j2].level <= thisLevel) break;
      truncateStack(stack, heads, j2 + 1);
      if (token.type !== "text") continue;
      const text2 = token.content;
      let pos = 0;
      const max = text2.length;
      OUTER: while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t3 = QUOTE_RE.exec(text2);
        if (!t3) break;
        let canOpen = true;
        let canClose = true;
        pos = t3.index + 1;
        const isSingle = t3[0] === "'";
        let lastChar = 32;
        if (t3.index - 1 >= 0) lastChar = text2.charCodeAt(t3.index - 1);
        else for (j2 = i2 - 1; j2 >= 0; j2--) {
          if (tokens[j2].type === "softbreak" || tokens[j2].type === "hardbreak") break;
          if (!tokens[j2].content) continue;
          lastChar = tokens[j2].content.charCodeAt(tokens[j2].content.length - 1);
          break;
        }
        let nextChar = 32;
        if (pos < max) nextChar = text2.charCodeAt(pos);
        else for (j2 = i2 + 1; j2 < tokens.length; j2++) {
          if (tokens[j2].type === "softbreak" || tokens[j2].type === "hardbreak") break;
          if (!tokens[j2].content) continue;
          nextChar = tokens[j2].content.charCodeAt(0);
          break;
        }
        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);
        if (isNextWhiteSpace) canOpen = false;
        else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) canOpen = false;
        }
        if (isLastWhiteSpace) canClose = false;
        else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) canClose = false;
        }
        if (nextChar === 34 && t3[0] === '"') {
          if (lastChar >= 48 && lastChar <= 57) canClose = canOpen = false;
        }
        if (canOpen && canClose) {
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }
        if (!canOpen && !canClose) {
          if (isSingle) addReplacement(replacements, i2, t3.index, APOSTROPHE);
          continue;
        }
        if (canClose) {
          j2 = isSingle ? heads.single : heads.double;
          if (j2 >= 0 && stack[j2].level === thisLevel) {
            const item = stack[j2];
            let openQuote;
            let closeQuote;
            if (isSingle) {
              openQuote = state.md.options.quotes[2];
              closeQuote = state.md.options.quotes[3];
            } else {
              openQuote = state.md.options.quotes[0];
              closeQuote = state.md.options.quotes[1];
            }
            addReplacement(replacements, i2, t3.index, closeQuote);
            addReplacement(replacements, item.tokenIdx, item.contentPos, openQuote);
            truncateStack(stack, heads, j2);
            continue OUTER;
          }
        }
        if (canOpen) {
          if (stack.length >= MAX_OPENERS) return;
          stack.push({
            tokenIdx: i2,
            contentPos: t3.index,
            isSingleQuote: isSingle,
            level: thisLevel,
            prevSameQuoteIdx: isSingle ? heads.single : heads.double
          });
          if (isSingle) heads.single = stack.length - 1;
          else heads.double = stack.length - 1;
        } else if (canClose && isSingle) addReplacement(replacements, i2, t3.index, APOSTROPHE);
      }
    }
    Object.keys(replacements).forEach(function(tokenIdx) {
      const idx = Number(tokenIdx);
      tokens[idx].content = applyReplacements(tokens[idx].content, replacements[tokenIdx]);
    });
  }
  function smartquotes(state) {
    if (!state.md.options.typographer) return;
    for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) continue;
      process_inlines(state.tokens[blkIdx].children, state);
    }
  }
  function join_alt(tokens) {
    let curr, last;
    const max = tokens.length;
    for (curr = 0; curr < max; curr++) if (tokens[curr].type === "text_special") tokens[curr].type = "text";
    for (curr = last = 0; curr < max; curr++) if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    else {
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
    if (curr !== last) tokens.length = last;
  }
  function text_join(state) {
    let curr, last;
    const blockTokens = state.tokens;
    const l2 = blockTokens.length;
    for (let j2 = 0; j2 < l2; j2++) {
      if (blockTokens[j2].type !== "inline") continue;
      const tokens = blockTokens[j2].children;
      const max = tokens.length;
      for (curr = 0; curr < max; curr++) {
        if (tokens[curr].type === "text_special") tokens[curr].type = "text";
        if (tokens[curr].children) join_alt(tokens[curr].children);
      }
      for (curr = last = 0; curr < max; curr++) if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      else {
        if (curr !== last) tokens[last] = tokens[curr];
        last++;
      }
      if (curr !== last) tokens.length = last;
    }
  }
  var _rules$2 = [
    ["normalize", normalize],
    ["block", block],
    ["strip_references", strip_references],
    ["inline", inline],
    ["linkify", linkify$1],
    ["replacements", replace],
    ["smartquotes", smartquotes],
    ["text_join", text_join]
  ];
  var ParserCore = class {
    constructor() {
      _defineProperty(
        this,
        /**
        * {@link Ruler} instance. Keep configuration of core rules.
        */
        "ruler",
        new Ruler()
      );
      _defineProperty(this, "State", StateCore);
      for (let i2 = 0; i2 < _rules$2.length; i2++) this.ruler.push(_rules$2[i2][0], _rules$2[i2][1]);
    }
    /**
    * Executes core chain rules.
    */
    process(state) {
      const rules = this.ruler.getRules("");
      for (let i2 = 0, l2 = rules.length; i2 < l2; i2++) rules[i2](state);
    }
  };
  var StateBlock = class {
    constructor(src, md2, env, tokens) {
      _defineProperty(this, "bMarks", []);
      _defineProperty(this, "eMarks", []);
      _defineProperty(this, "tShift", []);
      _defineProperty(this, "sCount", []);
      _defineProperty(this, "bsCount", []);
      _defineProperty(this, "blkIndent", 0);
      _defineProperty(this, "line", 0);
      _defineProperty(this, "lineMax", 0);
      _defineProperty(this, "tight", false);
      _defineProperty(this, "listIndent", -1);
      _defineProperty(this, "parentType", "root");
      _defineProperty(this, "level", 0);
      _defineProperty(this, "Token", Token);
      this.src = src;
      this.md = md2;
      this.env = env;
      this.tokens = tokens;
      const s2 = this.src;
      for (let start = 0, pos = 0, indent = 0, offset = 0, len = s2.length, indent_found = false; pos < len; pos++) {
        const ch = s2.charCodeAt(pos);
        if (!indent_found) {
          if (isSpace(ch)) {
            indent++;
            if (ch === 9) offset += 4 - offset % 4;
            else offset++;
            continue;
          } else indent_found = true;
        }
        if (ch === 10 || pos === len - 1) {
          if (ch !== 10) pos++;
          this.bMarks.push(start);
          this.eMarks.push(pos);
          this.tShift.push(indent);
          this.sCount.push(offset);
          this.bsCount.push(0);
          indent_found = false;
          indent = 0;
          offset = 0;
          start = pos + 1;
        }
      }
      this.bMarks.push(s2.length);
      this.eMarks.push(s2.length);
      this.tShift.push(0);
      this.sCount.push(0);
      this.bsCount.push(0);
      this.lineMax = this.bMarks.length - 1;
    }
    push(type, tag, nesting) {
      const token = new Token(type, tag, nesting);
      token.block = true;
      if (nesting < 0) this.level--;
      token.level = this.level;
      if (nesting > 0) this.level++;
      this.tokens.push(token);
      return token;
    }
    isEmpty(line) {
      return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
    }
    skipEmptyLines(from) {
      for (let max = this.lineMax; from < max; from++) if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) break;
      return from;
    }
    skipSpaces(pos) {
      for (let max = this.src.length; pos < max; pos++) if (!isSpace(this.src.charCodeAt(pos))) break;
      return pos;
    }
    skipSpacesBack(pos, min) {
      if (pos <= min) return pos;
      while (pos > min) if (!isSpace(this.src.charCodeAt(--pos))) return pos + 1;
      return pos;
    }
    skipChars(pos, code2) {
      for (let max = this.src.length; pos < max; pos++) if (this.src.charCodeAt(pos) !== code2) break;
      return pos;
    }
    skipCharsBack(pos, code2, min) {
      if (pos <= min) return pos;
      while (pos > min) if (code2 !== this.src.charCodeAt(--pos)) return pos + 1;
      return pos;
    }
    getLines(begin, end, indent, keepLastLF) {
      if (begin >= end) return "";
      const queue = new Array(end - begin);
      for (let i2 = 0, line = begin; line < end; line++, i2++) {
        let lineIndent = 0;
        const lineStart = this.bMarks[line];
        let first = lineStart;
        let last;
        if (line + 1 < end || keepLastLF) last = this.eMarks[line] + 1;
        else last = this.eMarks[line];
        while (first < last && lineIndent < indent) {
          const ch = this.src.charCodeAt(first);
          if (isSpace(ch)) {
            if (ch === 9) lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
            else lineIndent++;
          } else if (first - lineStart < this.tShift[line]) lineIndent++;
          else break;
          first++;
        }
        if (lineIndent > indent) queue[i2] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
        else queue[i2] = this.src.slice(first, last);
      }
      return queue.join("");
    }
  };
  var MAX_AUTOCOMPLETED_CELLS = 65536;
  function getLine(state, line) {
    const pos = state.bMarks[line] + state.tShift[line];
    const max = state.eMarks[line];
    return state.src.slice(pos, max);
  }
  function escapedSplit(str) {
    const result = [];
    const max = str.length;
    let pos = 0;
    let ch = str.charCodeAt(pos);
    let isEscaped = false;
    let lastPos = 0;
    let current = "";
    while (pos < max) {
      if (ch === 124) {
        if (!isEscaped) {
          result.push(current + str.substring(lastPos, pos));
          current = "";
          lastPos = pos + 1;
        } else {
          current += str.substring(lastPos, pos - 1);
          lastPos = pos;
        }
      }
      isEscaped = ch === 92;
      pos++;
      ch = str.charCodeAt(pos);
    }
    result.push(current + str.substring(lastPos));
    return result;
  }
  function table(state, startLine, endLine, silent) {
    if (startLine + 2 > endLine) return false;
    let nextLine = startLine + 1;
    if (state.sCount[nextLine] < state.blkIndent) return false;
    if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
    let pos = state.bMarks[nextLine] + state.tShift[nextLine];
    if (pos >= state.eMarks[nextLine]) return false;
    const firstCh = state.src.charCodeAt(pos++);
    if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) return false;
    if (pos >= state.eMarks[nextLine]) return false;
    const secondCh = state.src.charCodeAt(pos++);
    if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) return false;
    if (firstCh === 45 && isSpace(secondCh)) return false;
    while (pos < state.eMarks[nextLine]) {
      const ch = state.src.charCodeAt(pos);
      if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) return false;
      pos++;
    }
    let lineText = getLine(state, startLine + 1);
    let columns = lineText.split("|");
    const aligns = [];
    for (let i2 = 0; i2 < columns.length; i2++) {
      const t3 = columns[i2].trim();
      if (!t3) {
        if (i2 === 0 || i2 === columns.length - 1) continue;
        else return false;
      }
      if (!/^:?-+:?$/.test(t3)) return false;
      if (t3.charCodeAt(t3.length - 1) === 58) aligns.push(t3.charCodeAt(0) === 58 ? "center" : "right");
      else if (t3.charCodeAt(0) === 58) aligns.push("left");
      else aligns.push("");
    }
    lineText = getLine(state, startLine).trim();
    if (lineText.indexOf("|") === -1) return false;
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    const columnCount = columns.length;
    if (columnCount === 0 || columnCount !== aligns.length) return false;
    if (silent) return true;
    const oldParentType = state.parentType;
    state.parentType = "table";
    const terminatorRules = state.md.block.ruler.getRules("blockquote");
    const token_to = state.push("table_open", "table", 1);
    const tableLines = [startLine, 0];
    token_to.map = tableLines;
    const token_tho = state.push("thead_open", "thead", 1);
    token_tho.map = [startLine, startLine + 1];
    const token_htro = state.push("tr_open", "tr", 1);
    token_htro.map = [startLine, startLine + 1];
    for (let i2 = 0; i2 < columns.length; i2++) {
      const token_ho = state.push("th_open", "th", 1);
      if (aligns[i2]) token_ho.attrs = [["style", `text-align:${aligns[i2]}`]];
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i2].trim();
      token_il.children = [];
      state.push("th_close", "th", -1);
    }
    state.push("tr_close", "tr", -1);
    state.push("thead_close", "thead", -1);
    let tbodyLines;
    let autocompletedCells = 0;
    for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) break;
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      if (terminate) break;
      lineText = getLine(state, nextLine).trim();
      if (!lineText) break;
      if (state.sCount[nextLine] - state.blkIndent >= 4) break;
      columns = escapedSplit(lineText);
      if (columns.length && columns[0] === "") columns.shift();
      if (columns.length && columns[columns.length - 1] === "") columns.pop();
      autocompletedCells += columnCount - columns.length;
      if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) break;
      if (nextLine === startLine + 2) {
        const token_tbo = state.push("tbody_open", "tbody", 1);
        token_tbo.map = tbodyLines = [startLine + 2, 0];
      }
      const token_tro = state.push("tr_open", "tr", 1);
      token_tro.map = [nextLine, nextLine + 1];
      for (let i2 = 0; i2 < columnCount; i2++) {
        const token_tdo = state.push("td_open", "td", 1);
        if (aligns[i2]) token_tdo.attrs = [["style", `text-align:${aligns[i2]}`]];
        const token_il = state.push("inline", "", 0);
        token_il.content = columns[i2] ? columns[i2].trim() : "";
        token_il.children = [];
        state.push("td_close", "td", -1);
      }
      state.push("tr_close", "tr", -1);
    }
    if (tbodyLines) {
      state.push("tbody_close", "tbody", -1);
      tbodyLines[1] = nextLine;
    }
    state.push("table_close", "table", -1);
    tableLines[1] = nextLine;
    state.parentType = oldParentType;
    state.line = nextLine;
    return true;
  }
  function code(state, startLine, endLine) {
    if (state.sCount[startLine] - state.blkIndent < 4) return false;
    let nextLine = startLine + 1;
    let last = nextLine;
    while (nextLine < endLine) {
      if (state.isEmpty(nextLine)) {
        nextLine++;
        continue;
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        nextLine++;
        last = nextLine;
        continue;
      }
      break;
    }
    state.line = last;
    const token = state.push("code_block", "code", 0);
    token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
    token.map = [startLine, state.line];
    return true;
  }
  function fence(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (pos + 3 > max) return false;
    const marker = state.src.charCodeAt(pos);
    if (marker !== 126 && marker !== 96) return false;
    let mem = pos;
    pos = state.skipChars(pos, marker);
    let len = pos - mem;
    if (len < 3) return false;
    const markup = state.src.slice(mem, pos);
    const params = state.src.slice(pos, max);
    if (marker === 96) {
      if (params.indexOf(String.fromCharCode(marker)) >= 0) return false;
    }
    if (silent) return true;
    let nextLine = startLine;
    let haveEndMarker = false;
    for (; ; ) {
      nextLine++;
      if (nextLine >= endLine) break;
      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      if (pos < max && state.sCount[nextLine] < state.blkIndent) break;
      if (state.src.charCodeAt(pos) !== marker) continue;
      if (state.sCount[nextLine] - state.blkIndent >= 4) continue;
      pos = state.skipChars(pos, marker);
      if (pos - mem < len) continue;
      pos = state.skipSpaces(pos);
      if (pos < max) continue;
      haveEndMarker = true;
      break;
    }
    len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);
    const token = state.push("fence", "code", 0);
    token.info = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = markup;
    token.map = [startLine, state.line];
    return true;
  }
  function blockquote(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    const oldLineMax = state.lineMax;
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (state.src.charCodeAt(pos) !== 62) return false;
    if (silent) return true;
    const oldBMarks = [];
    const oldBSCount = [];
    const oldSCount = [];
    const oldTShift = [];
    const terminatorRules = state.md.block.ruler.getRules("blockquote");
    const oldParentType = state.parentType;
    state.parentType = "blockquote";
    let lastLineEmpty = false;
    let nextLine;
    for (nextLine = startLine; nextLine < endLine; nextLine++) {
      const isOutdented = state.sCount[nextLine] < state.blkIndent;
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      if (pos >= max) break;
      if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
        let initial = state.sCount[nextLine] + 1;
        let spaceAfterMarker;
        let adjustTab;
        if (state.src.charCodeAt(pos) === 32) {
          pos++;
          initial++;
          adjustTab = false;
          spaceAfterMarker = true;
        } else if (state.src.charCodeAt(pos) === 9) {
          spaceAfterMarker = true;
          if ((state.bsCount[nextLine] + initial) % 4 === 3) {
            pos++;
            initial++;
            adjustTab = false;
          } else adjustTab = true;
        } else spaceAfterMarker = false;
        let offset = initial;
        oldBMarks.push(state.bMarks[nextLine]);
        state.bMarks[nextLine] = pos;
        while (pos < max) {
          const ch = state.src.charCodeAt(pos);
          if (isSpace(ch)) {
            if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
            else offset++;
          } else break;
          pos++;
        }
        lastLineEmpty = pos >= max;
        oldBSCount.push(state.bsCount[nextLine]);
        state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] = offset - initial;
        oldTShift.push(state.tShift[nextLine]);
        state.tShift[nextLine] = pos - state.bMarks[nextLine];
        continue;
      }
      if (lastLineEmpty) break;
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      if (terminate) {
        state.lineMax = nextLine;
        if (state.blkIndent !== 0) {
          oldBMarks.push(state.bMarks[nextLine]);
          oldBSCount.push(state.bsCount[nextLine]);
          oldTShift.push(state.tShift[nextLine]);
          oldSCount.push(state.sCount[nextLine]);
          state.sCount[nextLine] -= state.blkIndent;
        }
        break;
      }
      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = -1;
    }
    const oldIndent = state.blkIndent;
    state.blkIndent = 0;
    const token_o = state.push("blockquote_open", "blockquote", 1);
    token_o.markup = ">";
    const lines = [startLine, 0];
    token_o.map = lines;
    state.md.block.tokenize(state, startLine, nextLine);
    const token_c = state.push("blockquote_close", "blockquote", -1);
    token_c.markup = ">";
    state.lineMax = oldLineMax;
    state.parentType = oldParentType;
    lines[1] = state.line;
    for (let i2 = 0; i2 < oldTShift.length; i2++) {
      state.bMarks[i2 + startLine] = oldBMarks[i2];
      state.tShift[i2 + startLine] = oldTShift[i2];
      state.sCount[i2 + startLine] = oldSCount[i2];
      state.bsCount[i2 + startLine] = oldBSCount[i2];
    }
    state.blkIndent = oldIndent;
    return true;
  }
  function hr(state, startLine, endLine, silent) {
    const max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);
    if (marker !== 42 && marker !== 45 && marker !== 95) return false;
    let cnt = 1;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos++);
      if (ch !== marker && !isSpace(ch)) return false;
      if (ch === marker) cnt++;
    }
    if (cnt < 3) return false;
    if (silent) return true;
    state.line = startLine + 1;
    const token = state.push("hr", "hr", 0);
    token.map = [startLine, state.line];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
    return true;
  }
  function skipBulletListMarker(state, startLine) {
    const max = state.eMarks[startLine];
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);
    if (marker !== 42 && marker !== 45 && marker !== 43) return -1;
    if (pos < max) {
      if (!isSpace(state.src.charCodeAt(pos))) return -1;
    }
    return pos;
  }
  function skipOrderedListMarker(state, startLine) {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    let pos = start;
    if (pos + 1 >= max) return -1;
    let ch = state.src.charCodeAt(pos++);
    if (ch < 48 || ch > 57) return -1;
    for (; ; ) {
      if (pos >= max) return -1;
      ch = state.src.charCodeAt(pos++);
      if (ch >= 48 && ch <= 57) {
        if (pos - start >= 10) return -1;
        continue;
      }
      if (ch === 41 || ch === 46) break;
      return -1;
    }
    if (pos < max) {
      ch = state.src.charCodeAt(pos);
      if (!isSpace(ch)) return -1;
    }
    return pos;
  }
  function markTightParagraphs(state, idx) {
    const level = state.level + 2;
    for (let i2 = idx + 2, l2 = state.tokens.length - 2; i2 < l2; i2++) if (state.tokens[i2].level === level && state.tokens[i2].type === "paragraph_open") {
      state.tokens[i2 + 2].hidden = true;
      state.tokens[i2].hidden = true;
      i2 += 2;
    }
  }
  function list(state, startLine, endLine, silent) {
    let max, pos, start, token;
    let nextLine = startLine;
    let tight = true;
    if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
    if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) return false;
    let isTerminatingParagraph = false;
    if (silent && state.parentType === "paragraph") {
      if (state.sCount[nextLine] >= state.blkIndent) isTerminatingParagraph = true;
    }
    let isOrdered;
    let markerValue;
    let posAfterMarker;
    if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
      isOrdered = true;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      markerValue = Number(state.src.slice(start, posAfterMarker - 1));
      if (isTerminatingParagraph && markerValue !== 1) return false;
    } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) isOrdered = false;
    else return false;
    if (isTerminatingParagraph) {
      if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
    }
    if (silent) return true;
    const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
    const listTokIdx = state.tokens.length;
    if (isOrdered) {
      token = state.push("ordered_list_open", "ol", 1);
      if (markerValue !== 1) token.attrs = [["start", markerValue]];
    } else token = state.push("bullet_list_open", "ul", 1);
    const listLines = [nextLine, 0];
    token.map = listLines;
    token.markup = String.fromCharCode(markerCharCode);
    let prevEmptyEnd = false;
    const terminatorRules = state.md.block.ruler.getRules("list");
    const oldParentType = state.parentType;
    state.parentType = "list";
    while (nextLine < endLine) {
      pos = posAfterMarker;
      max = state.eMarks[nextLine];
      const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
      let offset = initial;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine]) % 4;
        else if (ch === 32) offset++;
        else break;
        pos++;
      }
      const contentStart = pos;
      let indentAfterMarker;
      if (contentStart >= max) indentAfterMarker = 1;
      else indentAfterMarker = offset - initial;
      if (indentAfterMarker > 4) indentAfterMarker = 1;
      const indent = initial + indentAfterMarker;
      token = state.push("list_item_open", "li", 1);
      token.markup = String.fromCharCode(markerCharCode);
      const itemLines = [nextLine, 0];
      token.map = itemLines;
      if (isOrdered) token.info = state.src.slice(start, posAfterMarker - 1);
      const oldTight = state.tight;
      const oldTShift = state.tShift[nextLine];
      const oldSCount = state.sCount[nextLine];
      const oldListIndent = state.listIndent;
      state.listIndent = state.blkIndent;
      state.blkIndent = indent;
      state.tight = true;
      state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
      state.sCount[nextLine] = offset;
      if (contentStart >= max && state.isEmpty(nextLine + 1)) state.line = Math.min(state.line + 2, endLine);
      else state.md.block.tokenize(state, nextLine, endLine);
      if (!state.tight || prevEmptyEnd) tight = false;
      prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
      state.blkIndent = state.listIndent;
      state.listIndent = oldListIndent;
      state.tShift[nextLine] = oldTShift;
      state.sCount[nextLine] = oldSCount;
      state.tight = oldTight;
      token = state.push("list_item_close", "li", -1);
      token.markup = String.fromCharCode(markerCharCode);
      nextLine = state.line;
      itemLines[1] = nextLine;
      if (nextLine >= endLine) break;
      if (state.sCount[nextLine] < state.blkIndent) break;
      if (state.sCount[nextLine] - state.blkIndent >= 4) break;
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      if (terminate) break;
      if (isOrdered) {
        posAfterMarker = skipOrderedListMarker(state, nextLine);
        if (posAfterMarker < 0) break;
        start = state.bMarks[nextLine] + state.tShift[nextLine];
      } else {
        posAfterMarker = skipBulletListMarker(state, nextLine);
        if (posAfterMarker < 0) break;
      }
      if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) break;
    }
    if (isOrdered) token = state.push("ordered_list_close", "ol", -1);
    else token = state.push("bullet_list_close", "ul", -1);
    token.markup = String.fromCharCode(markerCharCode);
    listLines[1] = nextLine;
    state.line = nextLine;
    state.parentType = oldParentType;
    if (tight) markTightParagraphs(state, listTokIdx);
    return true;
  }
  var MAX_LABEL_LENGTH = 999;
  function countCodePoints(str) {
    let length = str.length;
    for (let i2 = 0; i2 < str.length - 1; i2++) {
      const high = str.charCodeAt(i2);
      if (high < 55296 || high > 56319) continue;
      const low = str.charCodeAt(i2 + 1);
      if (low >= 56320 && low <= 57343) {
        length--;
        i2++;
      }
    }
    return length;
  }
  function lineEnd(state, line) {
    return Math.min(state.eMarks[line] + 1, state.src.length);
  }
  function getNextLinePos(state, nextLine) {
    const endLine = state.lineMax;
    if (nextLine >= endLine || state.isEmpty(nextLine)) return -1;
    let isContinuation = false;
    if (state.sCount[nextLine] - state.blkIndent > 3) isContinuation = true;
    if (state.sCount[nextLine] < 0) isContinuation = true;
    if (!isContinuation) {
      const terminatorRules = state.md.block.ruler.getRules("reference");
      const oldParentType = state.parentType;
      state.parentType = "reference";
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      state.parentType = oldParentType;
      if (terminate) return -1;
    }
    return state.bMarks[nextLine] + state.tShift[nextLine];
  }
  function reference(state, startLine, _endLine, silent) {
    const src = state.src;
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let nextLine = startLine + 1;
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (src.charCodeAt(pos) !== 91) return false;
    let max = lineEnd(state, startLine);
    let rawLabel = "";
    let labelEnd = -1;
    let segmentStart = ++pos;
    while (pos < max) {
      if (rawLabel.length + pos - segmentStart > MAX_LABEL_LENGTH * 2) return false;
      let ch = src.charCodeAt(pos);
      if (ch === 91) return false;
      if (ch === 93) {
        labelEnd = pos;
        break;
      }
      if (ch === 92) ch = src.charCodeAt(++pos);
      if (ch === 10 && pos < max) {
        const nextPos = getNextLinePos(state, nextLine);
        if (nextPos < 0) return false;
        rawLabel += src.slice(segmentStart, max);
        pos = segmentStart = nextPos;
        max = lineEnd(state, nextLine++);
        continue;
      }
      pos++;
    }
    if (labelEnd < 0 || src.charCodeAt(labelEnd + 1) !== 58) return false;
    rawLabel += src.slice(segmentStart, labelEnd);
    if (rawLabel.length > MAX_LABEL_LENGTH && countCodePoints(rawLabel) > MAX_LABEL_LENGTH) return false;
    pos = labelEnd + 2;
    while (pos < max) {
      const ch = src.charCodeAt(pos);
      if (ch === 10) {
        const nextPos = getNextLinePos(state, nextLine);
        if (nextPos < 0) break;
        pos = nextPos;
        max = lineEnd(state, nextLine++);
      } else if (isSpace(ch)) pos++;
      else break;
    }
    const destRes = state.md.helpers.parseLinkDestination(src, pos, max);
    if (!destRes.ok) return false;
    const href = state.md.normalizeLink(destRes.str);
    if (!state.md.validateLink(href)) return false;
    pos = destRes.pos;
    const destEndPos = pos;
    const destEndMax = max;
    const destEndLineNo = nextLine;
    while (pos < max) {
      const ch = src.charCodeAt(pos);
      if (ch === 10) {
        const nextPos = getNextLinePos(state, nextLine);
        if (nextPos < 0) break;
        pos = nextPos;
        max = lineEnd(state, nextLine++);
      } else if (isSpace(ch)) pos++;
      else break;
    }
    const titleStart = pos;
    let titleRes = state.md.helpers.parseLinkTitle(src, pos, max);
    while (titleRes.can_continue) {
      const nextPos = getNextLinePos(state, nextLine);
      if (nextPos < 0) break;
      pos = nextPos;
      max = lineEnd(state, nextLine++);
      titleRes = state.md.helpers.parseLinkTitle(src, pos, max, titleRes);
    }
    let title;
    if (titleStart !== destEndPos && titleRes.ok) {
      title = titleRes.str;
      pos = titleRes.pos;
    } else {
      title = "";
      pos = destEndPos;
      max = destEndMax;
      nextLine = destEndLineNo;
    }
    while (pos < max) {
      if (!isSpace(src.charCodeAt(pos))) break;
      pos++;
    }
    if (pos < max && src.charCodeAt(pos) !== 10) {
      if (title) {
        title = "";
        pos = destEndPos;
        max = destEndMax;
        nextLine = destEndLineNo;
        while (pos < max) {
          if (!isSpace(src.charCodeAt(pos))) break;
          pos++;
        }
      }
    }
    if (pos < max && src.charCodeAt(pos) !== 10) return false;
    const label = normalizeReference(rawLabel);
    if (!label) return false;
    if (silent) return true;
    if (typeof state.env.references === "undefined") state.env.references = {};
    if (typeof state.env.references[label] === "undefined") state.env.references[label] = {
      title,
      href
    };
    const token = state.push("reference_definition", "", 0);
    token.map = [startLine, nextLine];
    token.hidden = true;
    const meta = /* @__PURE__ */ Object.create(null);
    meta.label = label;
    token.meta = meta;
    state.line = nextLine;
    return true;
  }
  var html_blocks_default = [
    "address",
    "article",
    "aside",
    "base",
    "basefont",
    "blockquote",
    "body",
    "caption",
    "center",
    "col",
    "colgroup",
    "dd",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "iframe",
    "legend",
    "li",
    "link",
    "main",
    "menu",
    "menuitem",
    "nav",
    "noframes",
    "ol",
    "optgroup",
    "option",
    "p",
    "param",
    "search",
    "section",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "title",
    "tr",
    "track",
    "ul"
  ];
  var open_tag = `<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^"'=<>\`\\x00-\\x20]+|'[^']*'|"[^"]*"))?)*\\s*\\/?>`;
  var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
  new RegExp(`^(?:${open_tag}|${close_tag}|<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)`);
  var HTML_OPEN_CLOSE_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag})`);
  var HTML_SEQUENCES = [
    [
      /^<(script|pre|style|textarea)(?=(\s|>|$))/i,
      /<\/(script|pre|style|textarea)>/i,
      true
    ],
    [
      /^<!--/,
      /-->/,
      true
    ],
    [
      /^<\?/,
      /\?>/,
      true
    ],
    [
      /^<![A-Za-z]/,
      />/,
      true
    ],
    [
      /^<!\[CDATA\[/,
      /\]\]>/,
      true
    ],
    [
      new RegExp(`^</?(${html_blocks_default.join("|")})(?=(\\s|/?>|$))`, "i"),
      /^$/,
      true
    ],
    [
      new RegExp(`${HTML_OPEN_CLOSE_TAG_RE.source}\\s*$`),
      /^$/,
      false
    ]
  ];
  function html_block(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (!state.md.options.html) return false;
    if (state.src.charCodeAt(pos) !== 60) return false;
    let lineText = state.src.slice(pos, max);
    let i2 = 0;
    for (; i2 < HTML_SEQUENCES.length; i2++) if (HTML_SEQUENCES[i2][0].test(lineText)) break;
    if (i2 === HTML_SEQUENCES.length) return false;
    if (silent) return HTML_SEQUENCES[i2][2];
    let nextLine = startLine + 1;
    const endsOnBlankLine = HTML_SEQUENCES[i2][1].test("");
    if (!HTML_SEQUENCES[i2][1].test(lineText)) for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        if (endsOnBlankLine || !state.isEmpty(nextLine)) break;
      }
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);
      if (HTML_SEQUENCES[i2][1].test(lineText)) {
        if (lineText.length !== 0) nextLine++;
        break;
      }
    }
    state.line = nextLine;
    const token = state.push("html_block", "", 0);
    token.map = [startLine, nextLine];
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
    return true;
  }
  function heading(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    let ch = state.src.charCodeAt(pos);
    if (ch !== 35 || pos >= max) return false;
    let level = 1;
    ch = state.src.charCodeAt(++pos);
    while (ch === 35 && pos < max && level <= 6) {
      level++;
      ch = state.src.charCodeAt(++pos);
    }
    if (level > 6 || pos < max && !isSpace(ch)) return false;
    if (silent) return true;
    max = state.skipSpacesBack(max, pos);
    const tmp = state.skipCharsBack(max, 35, pos);
    if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) max = tmp;
    state.line = startLine + 1;
    const token_o = state.push("heading_open", `h${level}`, 1);
    token_o.markup = "########".slice(0, level);
    token_o.map = [startLine, state.line];
    const token_i = state.push("inline", "", 0);
    token_i.content = asciiTrim(state.src.slice(pos, max));
    token_i.map = [startLine, state.line];
    token_i.children = [];
    const token_c = state.push("heading_close", `h${level}`, -1);
    token_c.markup = "########".slice(0, level);
    return true;
  }
  function lheading(state, startLine, endLine) {
    const terminatorRules = state.md.block.ruler.getRules("paragraph");
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const oldParentType = state.parentType;
    state.parentType = "paragraph";
    let level = 0;
    let marker;
    let nextLine = startLine + 1;
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      if (state.sCount[nextLine] - state.blkIndent > 3) continue;
      if (state.sCount[nextLine] >= state.blkIndent) {
        let pos = state.bMarks[nextLine] + state.tShift[nextLine];
        const max = state.eMarks[nextLine];
        if (pos < max) {
          marker = state.src.charCodeAt(pos);
          if (marker === 45 || marker === 61) {
            pos = state.skipChars(pos, marker);
            pos = state.skipSpaces(pos);
            if (pos >= max) {
              level = marker === 61 ? 1 : 2;
              break;
            }
          }
        }
      }
      if (state.sCount[nextLine] < 0) continue;
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      if (terminate) break;
    }
    if (!level) {
      state.parentType = oldParentType;
      return false;
    }
    const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
    state.line = nextLine + 1;
    const token_o = state.push("heading_open", `h${level}`, 1);
    token_o.markup = String.fromCharCode(marker);
    token_o.map = [startLine, state.line];
    const token_i = state.push("inline", "", 0);
    token_i.content = content;
    token_i.map = [startLine, state.line - 1];
    token_i.children = [];
    const token_c = state.push("heading_close", `h${level}`, -1);
    token_c.markup = String.fromCharCode(marker);
    state.parentType = oldParentType;
    return true;
  }
  function paragraph(state, startLine, endLine) {
    const terminatorRules = state.md.block.ruler.getRules("paragraph");
    const oldParentType = state.parentType;
    let nextLine = startLine + 1;
    state.parentType = "paragraph";
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      if (state.sCount[nextLine] - state.blkIndent > 3) continue;
      if (state.sCount[nextLine] < 0) continue;
      let terminate = false;
      for (let i2 = 0, l2 = terminatorRules.length; i2 < l2; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
      if (terminate) break;
    }
    const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
    state.line = nextLine;
    const token_o = state.push("paragraph_open", "p", 1);
    token_o.map = [startLine, state.line];
    const token_i = state.push("inline", "", 0);
    token_i.content = content;
    token_i.map = [startLine, state.line];
    token_i.children = [];
    state.push("paragraph_close", "p", -1);
    state.parentType = oldParentType;
    return true;
  }
  var _rules$1 = [
    [
      "table",
      table,
      ["paragraph", "reference"]
    ],
    ["code", code],
    [
      "fence",
      fence,
      [
        "paragraph",
        "reference",
        "blockquote",
        "list"
      ]
    ],
    [
      "blockquote",
      blockquote,
      [
        "paragraph",
        "reference",
        "blockquote",
        "list"
      ]
    ],
    [
      "hr",
      hr,
      [
        "paragraph",
        "reference",
        "blockquote",
        "list"
      ]
    ],
    [
      "list",
      list,
      [
        "paragraph",
        "reference",
        "blockquote"
      ]
    ],
    ["reference", reference],
    [
      "html_block",
      html_block,
      [
        "paragraph",
        "reference",
        "blockquote"
      ]
    ],
    [
      "heading",
      heading,
      [
        "paragraph",
        "reference",
        "blockquote"
      ]
    ],
    ["lheading", lheading],
    ["paragraph", paragraph]
  ];
  var ParserBlock = class {
    constructor() {
      _defineProperty(
        this,
        /**
        * {@link Ruler} instance. Keep configuration of block rules.
        */
        "ruler",
        new Ruler()
      );
      _defineProperty(this, "State", StateBlock);
      for (let i2 = 0; i2 < _rules$1.length; i2++) this.ruler.push(_rules$1[i2][0], _rules$1[i2][1], { alt: (_rules$1[i2][2] || []).slice() });
    }
    tokenize(state, startLine, endLine) {
      const rules = this.ruler.getRules("");
      const len = rules.length;
      const maxNesting = state.md.options.maxNesting;
      let line = startLine;
      let hasEmptyLines = false;
      while (line < endLine) {
        state.line = line = state.skipEmptyLines(line);
        if (line >= endLine) break;
        if (state.sCount[line] < state.blkIndent) break;
        if (state.level >= maxNesting) {
          state.line = endLine;
          break;
        }
        const prevLine = state.line;
        let ok = false;
        for (let i2 = 0; i2 < len; i2++) {
          ok = rules[i2](state, line, endLine, false);
          if (ok) {
            if (prevLine >= state.line) throw new Error("block rule didn't increment state.line");
            break;
          }
        }
        if (!ok) throw new Error("none of the block rules matched");
        state.tight = !hasEmptyLines;
        if (state.isEmpty(state.line - 1)) hasEmptyLines = true;
        line = state.line;
        if (line < endLine && state.isEmpty(line)) {
          hasEmptyLines = true;
          line++;
          state.line = line;
        }
      }
    }
    /**
    * Process input string and push block tokens into `outTokens`
    */
    parse(src, md2, env, outTokens) {
      if (!src) return;
      const state = new this.State(src, md2, env, outTokens);
      this.tokenize(state, state.line, state.lineMax);
    }
  };
  var StateInline = class {
    constructor(src, md2, env, outTokens) {
      _defineProperty(this, "pos", 0);
      _defineProperty(this, "level", 0);
      _defineProperty(this, "pending", "");
      _defineProperty(this, "pendingLevel", 0);
      _defineProperty(this, "cache", {});
      _defineProperty(this, "backticks", {});
      _defineProperty(this, "backticksScanned", false);
      _defineProperty(this, "skipHtmlSpecial", false);
      _defineProperty(this, "linkLevel", 0);
      _defineProperty(this, "delimiters", []);
      _defineProperty(this, "_prev_delimiters", []);
      _defineProperty(this, "Token", Token);
      this.src = src;
      this.env = env;
      this.md = md2;
      this.tokens = outTokens;
      this.tokens_meta = Array(outTokens.length);
      this.posMax = this.src.length;
    }
    pushPending() {
      const token = new Token("text", "", 0);
      token.content = this.pending;
      token.level = this.pendingLevel;
      this.tokens.push(token);
      this.pending = "";
      return token;
    }
    push(type, tag, nesting) {
      if (this.pending) this.pushPending();
      const token = new Token(type, tag, nesting);
      let token_meta = void 0;
      if (nesting < 0) {
        this.level--;
        this.delimiters = this._prev_delimiters.pop();
      }
      token.level = this.level;
      if (nesting > 0) {
        this.level++;
        this._prev_delimiters.push(this.delimiters);
        this.delimiters = [];
        token_meta = { delimiters: this.delimiters };
      }
      this.pendingLevel = this.level;
      this.tokens.push(token);
      this.tokens_meta.push(token_meta);
      return token;
    }
    scanDelims(start, canSplitWord) {
      const max = this.posMax;
      const marker = this.src.charCodeAt(start);
      let lastChar;
      if (start === 0) lastChar = 32;
      else if (start === 1) {
        lastChar = this.src.charCodeAt(0);
        if ((lastChar & 63488) === 55296) lastChar = 65533;
      } else {
        lastChar = this.src.charCodeAt(start - 1);
        if ((lastChar & 64512) === 56320) {
          const highSurr = this.src.charCodeAt(start - 2);
          lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
        } else if ((lastChar & 64512) === 55296) lastChar = 65533;
      }
      let pos = start;
      while (pos < max && this.src.charCodeAt(pos) === marker) pos++;
      const count = pos - start;
      let nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
      if ((nextChar & 64512) === 55296) {
        const lowSurr = this.src.charCodeAt(pos + 1);
        nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
      } else if ((nextChar & 64512) === 56320) nextChar = 65533;
      const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
      const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);
      const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
      const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
      return {
        can_open: left_flanking && (canSplitWord || !right_flanking || isLastPunctChar),
        can_close: right_flanking && (canSplitWord || !left_flanking || isNextPunctChar),
        length: count
      };
    }
  };
  function isTerminatorChar(ch) {
    switch (ch) {
      case 10:
      case 33:
      case 35:
      case 36:
      case 37:
      case 38:
      case 42:
      case 43:
      case 45:
      case 58:
      case 60:
      case 61:
      case 62:
      case 64:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 123:
      case 125:
      case 126:
        return true;
      default:
        return false;
    }
  }
  function text(state, silent) {
    let pos = state.pos;
    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) pos++;
    if (pos === state.pos) return false;
    if (!silent) state.pending += state.src.slice(state.pos, pos);
    state.pos = pos;
    return true;
  }
  function isAsciiAlpha(code2) {
    return code2 >= 65 && code2 <= 90 || code2 >= 97 && code2 <= 122;
  }
  function isSchemeChar(code2) {
    return code2 >= 65 && code2 <= 90 || code2 >= 97 && code2 <= 122 || code2 >= 48 && code2 <= 57 || code2 === 43 || code2 === 45 || code2 === 46;
  }
  function linkify(state, silent) {
    if (!state.md.options.linkify) return false;
    if (state.linkLevel > 0) return false;
    const pos = state.pos;
    const max = state.posMax;
    if (pos + 3 > max) return false;
    if (state.src.charCodeAt(pos) !== 58) return false;
    if (state.src.charCodeAt(pos + 1) !== 47) return false;
    if (state.src.charCodeAt(pos + 2) !== 47) return false;
    const protoMin = pos - Math.min(10, state.pending.length, pos);
    let protoStart = pos;
    while (protoStart > protoMin && isSchemeChar(state.src.charCodeAt(protoStart - 1))) protoStart--;
    if (protoStart === pos || !isAsciiAlpha(state.src.charCodeAt(protoStart))) return false;
    const protoLength = pos - protoStart;
    const link2 = state.md.linkify.matchAtStart(state.src.slice(protoStart));
    if (!link2) return false;
    let url = link2.url;
    if (url.length <= protoLength) return false;
    let urlEnd = url.length;
    while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) urlEnd--;
    if (urlEnd !== url.length) url = url.slice(0, urlEnd);
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      state.pending = state.pending.slice(0, -protoLength);
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "linkify";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "linkify";
      token_c.info = "auto";
    }
    state.pos += url.length - protoLength;
    return true;
  }
  function newline(state, silent) {
    let pos = state.pos;
    if (state.src.charCodeAt(pos) !== 10) return false;
    const pmax = state.pending.length - 1;
    const max = state.posMax;
    if (!silent) {
      if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
        if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
          let ws = pmax - 1;
          while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
          state.pending = state.pending.slice(0, ws);
          state.push("hardbreak", "br", 0);
        } else {
          state.pending = state.pending.slice(0, -1);
          state.push("softbreak", "br", 0);
        }
      } else state.push("softbreak", "br", 0);
    }
    pos++;
    while (pos < max && isSpace(state.src.charCodeAt(pos))) pos++;
    state.pos = pos;
    return true;
  }
  var ESCAPED = [];
  for (let i2 = 0; i2 < 256; i2++) ESCAPED.push(0);
  "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
    ESCAPED[ch.charCodeAt(0)] = 1;
  });
  function escape(state, silent) {
    let pos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(pos) !== 92) return false;
    pos++;
    if (pos >= max) return false;
    let ch1 = state.src.charCodeAt(pos);
    if (ch1 === 10) {
      if (!silent) state.push("hardbreak", "br", 0);
      pos++;
      while (pos < max) {
        ch1 = state.src.charCodeAt(pos);
        if (!isSpace(ch1)) break;
        pos++;
      }
      state.pos = pos;
      return true;
    }
    if (ch1 === 32) {
      if (!silent) {
        const token = state.push("text_special", "", 0);
        token.content = "\\";
        token.markup = "\\";
        token.info = "escape";
      }
      state.pos = pos;
      return true;
    }
    let escapedStr = state.src[pos];
    if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
      const ch2 = state.src.charCodeAt(pos + 1);
      if (ch2 >= 56320 && ch2 <= 57343) {
        escapedStr += state.src[pos + 1];
        pos++;
      }
    }
    const origStr = "\\" + escapedStr;
    if (!silent) {
      const token = state.push("text_special", "", 0);
      if (ch1 < 256 && ESCAPED[ch1] !== 0) token.content = escapedStr;
      else token.content = origStr;
      token.markup = origStr;
      token.info = "escape";
    }
    state.pos = pos + 1;
    return true;
  }
  function buildLastRuns(src) {
    const lastRuns = {};
    let pos = 0;
    while ((pos = src.indexOf("`", pos)) !== -1) {
      const start = pos;
      while (src.charCodeAt(++pos) === 96) ;
      lastRuns[pos - start] = start;
    }
    return lastRuns;
  }
  function backtick(state, silent) {
    var _state$backticks$open;
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 96) return false;
    const max = state.posMax;
    let pos = start + 1;
    while (pos < max && state.src.charCodeAt(pos) === 96) pos++;
    const marker = state.src.slice(start, pos);
    const openerLength = marker.length;
    if (!state.backticksScanned) {
      state.backticks = buildLastRuns(state.src);
      state.backticksScanned = true;
    }
    if (((_state$backticks$open = state.backticks[openerLength]) !== null && _state$backticks$open !== void 0 ? _state$backticks$open : -1) >= pos) {
      let matchEnd = pos;
      let matchStart;
      while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1 && matchStart < max) {
        matchEnd = matchStart + 1;
        while (state.src.charCodeAt(matchEnd) === 96) matchEnd++;
        if (matchEnd > max) break;
        if (matchEnd - matchStart === openerLength) {
          if (!silent) {
            const token = state.push("code_inline", "code", 0);
            token.markup = marker;
            let content = state.src.slice(pos, matchStart).replace(/\n/g, " ");
            if (content.startsWith(" ") && content.endsWith(" ") && /[^ ]/.test(content)) content = content.slice(1, -1);
            token.content = content;
          }
          state.pos = matchEnd;
          return true;
        }
      }
    }
    if (!silent) state.pending += marker;
    state.pos = pos;
    return true;
  }
  function strikethrough_tokenize(state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    if (silent) return false;
    if (marker !== 126) return false;
    const scanned = state.scanDelims(state.pos, true);
    let len = scanned.length;
    const ch = String.fromCharCode(marker);
    if (len < 2) return false;
    let token;
    if (len % 2) {
      token = state.push("text", "", 0);
      token.content = ch;
      len--;
    }
    for (let i2 = 0; i2 < len; i2 += 2) {
      token = state.push("text", "", 0);
      token.content = ch + ch;
      state.delimiters.push({
        marker,
        length: 0,
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close
      });
    }
    state.pos += scanned.length;
    return true;
  }
  function postProcess$1(state, delimiters) {
    let token;
    const loneMarkers = [];
    const max = delimiters.length;
    for (let i2 = 0; i2 < max; i2++) {
      const startDelim = delimiters[i2];
      if (startDelim.marker !== 126) continue;
      if (startDelim.end === -1) continue;
      const endDelim = delimiters[startDelim.end];
      token = state.tokens[startDelim.token];
      token.type = "s_open";
      token.tag = "s";
      token.nesting = 1;
      token.markup = "~~";
      token.content = "";
      token = state.tokens[endDelim.token];
      token.type = "s_close";
      token.tag = "s";
      token.nesting = -1;
      token.markup = "~~";
      token.content = "";
      if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") loneMarkers.push(endDelim.token - 1);
    }
    while (loneMarkers.length) {
      const i2 = loneMarkers.pop();
      let j2 = i2 + 1;
      while (j2 < state.tokens.length && state.tokens[j2].type === "s_close") j2++;
      j2--;
      if (i2 !== j2) {
        token = state.tokens[j2];
        state.tokens[j2] = state.tokens[i2];
        state.tokens[i2] = token;
      }
    }
  }
  function strikethrough_postProcess(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    postProcess$1(state, state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      var _tokens_meta$curr;
      const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
      if (delimiters) postProcess$1(state, delimiters);
    }
  }
  var strikethrough_default = {
    tokenize: strikethrough_tokenize,
    postProcess: strikethrough_postProcess
  };
  function emphasis_tokenize(state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    if (silent) return false;
    if (marker !== 95 && marker !== 42) return false;
    const scanned = state.scanDelims(state.pos, marker === 42);
    for (let i2 = 0; i2 < scanned.length; i2++) {
      const token = state.push("text", "", 0);
      token.content = String.fromCharCode(marker);
      state.delimiters.push({
        marker,
        length: scanned.length,
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close
      });
    }
    state.pos += scanned.length;
    return true;
  }
  function postProcess(state, delimiters) {
    const max = delimiters.length;
    for (let i2 = max - 1; i2 >= 0; i2--) {
      const startDelim = delimiters[i2];
      if (startDelim.marker !== 95 && startDelim.marker !== 42) continue;
      if (startDelim.end === -1) continue;
      const endDelim = delimiters[startDelim.end];
      const isStrong = i2 > 0 && delimiters[i2 - 1].end === startDelim.end + 1 && delimiters[i2 - 1].marker === startDelim.marker && delimiters[i2 - 1].token === startDelim.token - 1 && delimiters[startDelim.end + 1].token === endDelim.token + 1;
      const ch = String.fromCharCode(startDelim.marker);
      const token_o = state.tokens[startDelim.token];
      token_o.type = isStrong ? "strong_open" : "em_open";
      token_o.tag = isStrong ? "strong" : "em";
      token_o.nesting = 1;
      token_o.markup = isStrong ? ch + ch : ch;
      token_o.content = "";
      const token_c = state.tokens[endDelim.token];
      token_c.type = isStrong ? "strong_close" : "em_close";
      token_c.tag = isStrong ? "strong" : "em";
      token_c.nesting = -1;
      token_c.markup = isStrong ? ch + ch : ch;
      token_c.content = "";
      if (isStrong) {
        state.tokens[delimiters[i2 - 1].token].content = "";
        state.tokens[delimiters[startDelim.end + 1].token].content = "";
        i2--;
      }
    }
  }
  function emphasis_post_process(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    postProcess(state, state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      var _tokens_meta$curr;
      const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
      if (delimiters) postProcess(state, delimiters);
    }
  }
  var emphasis_default = {
    tokenize: emphasis_tokenize,
    postProcess: emphasis_post_process
  };
  function link(state, silent) {
    let code2, label, res, ref;
    let href = "";
    let title = "";
    let start = state.pos;
    let parseReference = true;
    if (state.src.charCodeAt(state.pos) !== 91) return false;
    const oldPos = state.pos;
    const max = state.posMax;
    const labelStart = state.pos + 1;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
    if (labelEnd < 0) return false;
    let pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 40) {
      parseReference = false;
      pos++;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
      if (pos >= max) return false;
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) pos = res.pos;
        else href = "";
        start = pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) break;
        }
        res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
        if (pos < max && start !== pos && res.ok) {
          title = res.str;
          pos = res.pos;
          for (; pos < max; pos++) {
            code2 = state.src.charCodeAt(pos);
            if (!isSpace(code2) && code2 !== 10) break;
          }
        }
      }
      if (pos >= max || state.src.charCodeAt(pos) !== 41) parseReference = true;
      pos++;
    }
    if (parseReference) {
      if (typeof state.env.references === "undefined") return false;
      if (pos < max && state.src.charCodeAt(pos) === 91) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) label = state.src.slice(start, pos++);
        else pos = labelEnd + 1;
      } else pos = labelEnd + 1;
      if (!label) label = state.src.slice(labelStart, labelEnd);
      label = normalizeReference(label);
      ref = state.env.references[label];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }
    if (!silent) {
      state.pos = labelStart;
      state.posMax = labelEnd;
      const token_o = state.push("link_open", "a", 1);
      const attrs = [["href", href]];
      token_o.attrs = attrs;
      if (title) attrs.push(["title", title]);
      if (label) {
        const meta = /* @__PURE__ */ Object.create(null);
        meta.label = label;
        token_o.meta = meta;
      }
      state.linkLevel++;
      state.md.inline.tokenize(state);
      state.linkLevel--;
      state.push("link_close", "a", -1);
    }
    state.pos = pos;
    state.posMax = max;
    return true;
  }
  function image(state, silent) {
    let code2, content, label, pos, ref, res, title, start;
    let href = "";
    const oldPos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(state.pos) !== 33) return false;
    if (state.src.charCodeAt(state.pos + 1) !== 91) return false;
    const labelStart = state.pos + 2;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
    if (labelEnd < 0) return false;
    pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 40) {
      pos++;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
      if (pos >= max) return false;
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) pos = res.pos;
        else href = "";
      }
      start = pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) break;
        }
      } else title = "";
      if (pos >= max || state.src.charCodeAt(pos) !== 41) {
        state.pos = oldPos;
        return false;
      }
      pos++;
    } else {
      if (typeof state.env.references === "undefined") return false;
      if (pos < max && state.src.charCodeAt(pos) === 91) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) label = state.src.slice(start, pos++);
        else pos = labelEnd + 1;
      } else pos = labelEnd + 1;
      if (!label) label = state.src.slice(labelStart, labelEnd);
      label = normalizeReference(label);
      ref = state.env.references[label];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }
    if (!silent) {
      content = state.src.slice(labelStart, labelEnd);
      const tokens = [];
      state.md.inline.parse(content, state.md, state.env, tokens);
      const token = state.push("image", "img", 0);
      const attrs = [["src", href], ["alt", ""]];
      token.attrs = attrs;
      token.children = tokens;
      token.content = content;
      if (title) attrs.push(["title", title]);
      if (label) {
        const meta = /* @__PURE__ */ Object.create(null);
        meta.label = label;
        token.meta = meta;
      }
    }
    state.pos = pos;
    state.posMax = max;
    return true;
  }
  var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
  var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
  function autolink(state, silent) {
    let pos = state.pos;
    if (state.src.charCodeAt(pos) !== 60) return false;
    const start = state.pos;
    const max = state.posMax;
    for (; ; ) {
      if (++pos >= max) return false;
      const ch = state.src.charCodeAt(pos);
      if (ch === 60) return false;
      if (ch === 62) break;
    }
    const url = state.src.slice(start + 1, pos);
    if (AUTOLINK_RE.test(url)) {
      const fullUrl = state.md.normalizeLink(url);
      if (!state.md.validateLink(fullUrl)) return false;
      if (!silent) {
        const token_o = state.push("link_open", "a", 1);
        token_o.attrs = [["href", fullUrl]];
        token_o.markup = "autolink";
        token_o.info = "auto";
        const token_t = state.push("text", "", 0);
        token_t.content = state.md.normalizeLinkText(url);
        const token_c = state.push("link_close", "a", -1);
        token_c.markup = "autolink";
        token_c.info = "auto";
      }
      state.pos += url.length + 2;
      return true;
    }
    if (EMAIL_RE.test(url)) {
      const fullUrl = state.md.normalizeLink(`mailto:${url}`);
      if (!state.md.validateLink(fullUrl)) return false;
      if (!silent) {
        const token_o = state.push("link_open", "a", 1);
        token_o.attrs = [["href", fullUrl]];
        token_o.markup = "autolink";
        token_o.info = "auto";
        const token_t = state.push("text", "", 0);
        token_t.content = state.md.normalizeLinkText(url);
        const token_c = state.push("link_close", "a", -1);
        token_c.markup = "autolink";
        token_c.info = "auto";
      }
      state.pos += url.length + 2;
      return true;
    }
    return false;
  }
  function isLinkOpen(str) {
    return /^<a[>\s]/i.test(str);
  }
  function isLinkClose(str) {
    return /^<\/a\s*>/i.test(str);
  }
  function isLetter(ch) {
    const lc = ch | 32;
    return lc >= 97 && lc <= 122;
  }
  function scanSpecial(state, pos) {
    const src = state.src;
    let start;
    let terminator;
    if (src.startsWith("<!--", pos)) {
      if (src.startsWith(">", pos + 4)) return pos + 5;
      if (src.startsWith("->", pos + 4)) return pos + 6;
      start = pos + 4;
      terminator = "-->";
    } else if (src.startsWith("<![CDATA[", pos)) {
      start = pos + 9;
      terminator = "]]>";
    } else if (src.charCodeAt(pos + 1) === 63) {
      start = pos + 2;
      terminator = "?>";
    } else if (isLetter(src.charCodeAt(pos + 2))) {
      start = pos + 3;
      terminator = ">";
    } else return -1;
    if (state.skipHtmlSpecial) return -1;
    const end = src.indexOf(terminator, start);
    if (end < 0) {
      state.skipHtmlSpecial = true;
      return -1;
    }
    return end + terminator.length;
  }
  function html_inline(state, silent) {
    if (!state.md.options.html) return false;
    const max = state.posMax;
    const pos = state.pos;
    if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) return false;
    let end;
    const ch = state.src.charCodeAt(pos + 1);
    if (ch === 33 || ch === 63) end = scanSpecial(state, pos);
    else if (ch === 47 || isLetter(ch)) {
      const match = state.src.slice(pos).match(HTML_OPEN_CLOSE_TAG_RE);
      end = match ? pos + match[0].length : -1;
    } else return false;
    if (end < 0) return false;
    if (!silent) {
      const token = state.push("html_inline", "", 0);
      token.content = state.src.slice(pos, end);
      if (isLinkOpen(token.content)) state.linkLevel++;
      if (isLinkClose(token.content)) state.linkLevel--;
    }
    state.pos = end;
    return true;
  }
  var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
  var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
  function entity(state, silent) {
    const pos = state.pos;
    const max = state.posMax;
    if (state.src.charCodeAt(pos) !== 38) return false;
    if (pos + 1 >= max) return false;
    if (state.src.charCodeAt(pos + 1) === 35) {
      const match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          const code2 = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          const token = state.push("text_special", "", 0);
          token.content = isValidEntityCode(code2) ? fromCodePoint(code2) : fromCodePoint(65533);
          token.markup = match[0];
          token.info = "entity";
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      const match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        const decoded = decodeHTMLStrict(match[0]);
        if (decoded !== match[0]) {
          if (!silent) {
            const token = state.push("text_special", "", 0);
            token.content = decoded;
            token.markup = match[0];
            token.info = "entity";
          }
          state.pos += match[0].length;
          return true;
        }
      }
    }
    return false;
  }
  function processDelimiters(delimiters) {
    const openersBottom = {};
    const max = delimiters.length;
    if (!max) return;
    let headerIdx = 0;
    let lastTokenIdx = -2;
    const jumps = [];
    for (let closerIdx = 0; closerIdx < max; closerIdx++) {
      const closer = delimiters[closerIdx];
      jumps.push(0);
      if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) headerIdx = closerIdx;
      lastTokenIdx = closer.token;
      closer.length = closer.length || 0;
      if (!closer.close) continue;
      if (!openersBottom.hasOwnProperty(closer.marker)) openersBottom[closer.marker] = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1
      ];
      const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
      let openerIdx = headerIdx - jumps[headerIdx] - 1;
      let newMinOpenerIdx = openerIdx;
      for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
        const opener = delimiters[openerIdx];
        if (opener.marker !== closer.marker) continue;
        if (opener.open && opener.end < 0) {
          let isOddMatch = false;
          if (opener.close || closer.open) {
            if ((opener.length + closer.length) % 3 === 0) {
              if (opener.length % 3 !== 0 || closer.length % 3 !== 0) isOddMatch = true;
            }
          }
          if (!isOddMatch) {
            const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
            jumps[closerIdx] = closerIdx - openerIdx + lastJump;
            jumps[openerIdx] = lastJump;
            closer.open = false;
            opener.end = closerIdx;
            opener.close = false;
            newMinOpenerIdx = -1;
            lastTokenIdx = -2;
            break;
          }
        }
      }
      if (newMinOpenerIdx !== -1) openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }
  function link_pairs(state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;
    processDelimiters(state.delimiters);
    for (let curr = 0; curr < max; curr++) {
      var _tokens_meta$curr;
      const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
      if (delimiters) processDelimiters(delimiters);
    }
  }
  function fragments_join(state) {
    let curr, last;
    let level = 0;
    const tokens = state.tokens;
    const max = state.tokens.length;
    for (curr = last = 0; curr < max; curr++) {
      if (tokens[curr].nesting < 0) level--;
      tokens[curr].level = level;
      if (tokens[curr].nesting > 0) level++;
      if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      else {
        if (curr !== last) tokens[last] = tokens[curr];
        last++;
      }
    }
    if (curr !== last) tokens.length = last;
  }
  var _rules = [
    ["text", text],
    ["linkify", linkify],
    ["newline", newline],
    ["escape", escape],
    ["backticks", backtick],
    ["strikethrough", strikethrough_default.tokenize],
    ["emphasis", emphasis_default.tokenize],
    ["link", link],
    ["image", image],
    ["autolink", autolink],
    ["html_inline", html_inline],
    ["entity", entity]
  ];
  var _rules2 = [
    ["balance_pairs", link_pairs],
    ["strikethrough", strikethrough_default.postProcess],
    ["emphasis", emphasis_default.postProcess],
    ["fragments_join", fragments_join]
  ];
  var ParserInline = class {
    constructor() {
      _defineProperty(
        this,
        /**
        * {@link Ruler} instance. Keep configuration of inline rules.
        */
        "ruler",
        new Ruler()
      );
      _defineProperty(
        this,
        /**
        * {@link Ruler} instance. Second ruler used for post-processing
        * (e.g. in emphasis-like rules).
        */
        "ruler2",
        new Ruler()
      );
      _defineProperty(this, "State", StateInline);
      for (let i2 = 0; i2 < _rules.length; i2++) this.ruler.push(_rules[i2][0], _rules[i2][1]);
      for (let i2 = 0; i2 < _rules2.length; i2++) this.ruler2.push(_rules2[i2][0], _rules2[i2][1]);
    }
    skipToken(state) {
      const pos = state.pos;
      const rules = this.ruler.getRules("");
      const len = rules.length;
      const maxNesting = state.md.options.maxNesting;
      const cache = state.cache;
      if (typeof cache[pos] !== "undefined") {
        state.pos = cache[pos];
        return;
      }
      let ok = false;
      if (state.level < maxNesting) for (let i2 = 0; i2 < len; i2++) {
        state.level++;
        ok = rules[i2](state, true);
        state.level--;
        if (ok) {
          if (pos >= state.pos) throw new Error("inline rule didn't increment state.pos");
          break;
        }
      }
      else state.pos = state.posMax;
      if (!ok) state.pos++;
      cache[pos] = state.pos;
    }
    tokenize(state) {
      const rules = this.ruler.getRules("");
      const len = rules.length;
      const end = state.posMax;
      const maxNesting = state.md.options.maxNesting;
      while (state.pos < end) {
        const prevPos = state.pos;
        let ok = false;
        if (state.level < maxNesting) for (let i2 = 0; i2 < len; i2++) {
          ok = rules[i2](state, false);
          if (ok) {
            if (prevPos >= state.pos) throw new Error("inline rule didn't increment state.pos");
            break;
          }
        }
        if (ok) {
          if (state.pos >= end) break;
          continue;
        }
        state.pending += state.src[state.pos++];
      }
      if (state.pending) state.pushPending();
    }
    /**
    * Process input string and push inline tokens into `outTokens`
    */
    parse(str, md2, env, outTokens) {
      const state = new this.State(str, md2, env, outTokens);
      this.tokenize(state);
      const rules = this.ruler2.getRules("");
      const len = rules.length;
      for (let i2 = 0; i2 < len; i2++) rules[i2](state);
    }
  };
  var config = {
    default: {
      options: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: "language-",
        linkify: false,
        typographer: false,
        quotes: "\u201C\u201D\u2018\u2019",
        highlight: null,
        maxNesting: 100
      },
      components: {
        core: {},
        block: {},
        inline: {}
      }
    },
    zero: {
      options: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: "language-",
        linkify: false,
        typographer: false,
        quotes: "\u201C\u201D\u2018\u2019",
        highlight: null,
        maxNesting: 20
      },
      components: {
        core: { rules: [
          "normalize",
          "block",
          "strip_references",
          "inline",
          "text_join"
        ] },
        block: { rules: ["paragraph"] },
        inline: {
          rules: ["text"],
          rules2: ["balance_pairs", "fragments_join"]
        }
      }
    },
    commonmark: {
      options: {
        html: true,
        xhtmlOut: true,
        breaks: false,
        langPrefix: "language-",
        linkify: false,
        typographer: false,
        quotes: "\u201C\u201D\u2018\u2019",
        highlight: null,
        maxNesting: 20
      },
      components: {
        core: { rules: [
          "normalize",
          "block",
          "strip_references",
          "inline",
          "text_join"
        ] },
        block: { rules: [
          "blockquote",
          "code",
          "fence",
          "heading",
          "hr",
          "html_block",
          "lheading",
          "list",
          "reference",
          "paragraph"
        ] },
        inline: {
          rules: [
            "autolink",
            "backticks",
            "emphasis",
            "entity",
            "escape",
            "html_inline",
            "image",
            "link",
            "newline",
            "text"
          ],
          rules2: [
            "balance_pairs",
            "emphasis",
            "fragments_join"
          ]
        }
      }
    }
  };
  var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
  var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
  var RECODE_HOSTNAME_FOR = [
    "http:",
    "https:",
    "mailto:"
  ];
  var MarkdownIt = class {
    /**
    * Link validation function. CommonMark allows too much in links. By default
    * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
    * except some embedded image types.
    *
    * You can change this behaviour:
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * const md = new MarkdownIt()
    *
    * // enable everything
    * md.validateLink = function () { return true; }
    * ```
    */
    validateLink(url) {
      const str = url.trim().toLowerCase();
      return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
    }
    /**
    * Function used to encode link url to a machine-readable format,
    * which includes url-encoding, punycode, etc.
    */
    normalizeLink(url) {
      const parsed = parse_default(url, true);
      if (parsed.hostname) {
        if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
          parsed.hostname = punycode_es6_default.toASCII(parsed.hostname);
        } catch (er) {
        }
      }
      if (parsed.auth) parsed.auth = encode_default(parsed.auth);
      if (parsed.hostname) parsed.hostname = encode_default(parsed.hostname);
      if (parsed.pathname) parsed.pathname = encode_default(parsed.pathname);
      if (parsed.search) parsed.search = encode_default(parsed.search);
      if (parsed.hash) parsed.hash = encode_default(parsed.hash);
      return format(parsed);
    }
    /**
    * Function used to decode link url to a human-readable format`
    */
    normalizeLinkText(url) {
      const parsed = parse_default(url, true);
      if (parsed.hostname) {
        if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
          parsed.hostname = punycode_es6_default.toUnicode(parsed.hostname);
        } catch (er) {
        }
      }
      return decode_default(format(parsed), decode_default.defaultChars + "%");
    }
    constructor(...args) {
      _defineProperty(
        this,
        /**
        * Instance of {@link ParserInline}. You may need it to add new rules when
        * writing plugins. For simple rules control use {@link MarkdownIt.disable}
        * and {@link MarkdownIt.enable}.
        */
        "inline",
        new ParserInline()
      );
      _defineProperty(
        this,
        /**
        * Instance of {@link ParserBlock}. You may need it to add new rules when
        * writing plugins. For simple rules control use {@link MarkdownIt.disable}
        * and {@link MarkdownIt.enable}.
        */
        "block",
        new ParserBlock()
      );
      _defineProperty(
        this,
        /**
        * Instance of {@link ParserCore} chain executor. You may need it to add new
        * rules when writing plugins. For simple rules control use
        * {@link MarkdownIt.disable} and {@link MarkdownIt.enable}.
        */
        "core",
        new ParserCore()
      );
      _defineProperty(
        this,
        /**
        * Instance of {@link Renderer}. Use it to modify output look. Or to add rendering
        * rules for new token types, generated by plugins.
        *
        * See {@link Renderer} docs and
        * [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts).
        *
        * @example
        * ```javascript
        * import MarkdownIt from 'markdown-it'
        * const md = new MarkdownIt()
        *
        * function myToken(tokens, idx, options, env, self) {
        *   //...
        *   return result;
        * };
        *
        * md.renderer.rules['my_token'] = myToken
        * ```
        */
        "renderer",
        new Renderer()
      );
      _defineProperty(
        this,
        /**
        * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
        * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/src/rules_core/linkify.ts)
        * rule.
        */
        "linkify",
        new LinkifyIt()
      );
      _defineProperty(
        this,
        /**
        * Assorted utility functions, useful to write plugins. See details
        * [here](https://github.com/markdown-it/markdown-it/blob/master/src/common/utils.ts).
        */
        "utils",
        utils_exports
      );
      _defineProperty(
        this,
        /**
        * Link components parser functions, useful to write plugins. See details
        * [here](https://github.com/markdown-it/markdown-it/blob/master/src/helpers).
        */
        "helpers",
        Object.assign({}, helpers_exports)
      );
      const [presetNameOrOptions, options] = args;
      if (typeof presetNameOrOptions === "string") {
        this.configure(presetNameOrOptions);
        if (options) this.set(options);
      } else {
        this.configure("default");
        this.set(presetNameOrOptions || {});
      }
    }
    /**
    * Set parser options (in the same format as in constructor). Probably, you
    * will never need it, but you can change options after constructor call.
    *
    * __Note:__ To achieve the best possible performance, don't modify a
    * `markdown-it` instance options on the fly. If you need multiple configurations
    * it's best to create multiple instances and initialize each with separate
    * config.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    *
    * const md = new MarkdownIt()
    *   .set({ html: true, breaks: true })
    *   .set({ typographer: true })
    * ```
    */
    set(options) {
      Object.assign(this.options, options);
      return this;
    }
    /**
    * Batch load of all options and compenent settings. This is internal method,
    * and you probably will not need it. But if you will - see available presets
    * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/src/presets)
    *
    * We strongly recommend to use presets instead of direct config loads. That
    * will give better compatibility with next versions.
    */
    configure(presets) {
      let p2;
      if (typeof presets === "string") {
        const presetName = presets;
        p2 = config[presetName];
        if (!p2) throw new Error(`Wrong 'markdown-it' preset "${presetName}", check name`);
      } else p2 = presets;
      if (!p2) throw new Error("Wrong `markdown-it` preset, can't be empty");
      if (p2.options) this.options = { ...p2.options };
      const components = p2.components;
      if (components) {
        var _components$inline;
        [
          "core",
          "block",
          "inline"
        ].forEach((name) => {
          var _components$name;
          const rules = (_components$name = components[name]) === null || _components$name === void 0 ? void 0 : _components$name.rules;
          if (rules) this[name].ruler.enableOnly(rules);
        });
        const rules2 = (_components$inline = components.inline) === null || _components$inline === void 0 ? void 0 : _components$inline.rules2;
        if (rules2) this.inline.ruler2.enableOnly(rules2);
      }
      return this;
    }
    /**
    * Enable list or rules. It will automatically find appropriate components,
    * containing rules with given names. If rule not found, and `ignoreInvalid`
    * not set - throws exception.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    *
    * const md = new MarkdownIt()
    *   .enable(['sub', 'sup'])
    *   .disable('smartquotes')
    * ```
    */
    enable(list2, ignoreInvalid = false) {
      let result = [];
      if (!Array.isArray(list2)) list2 = [list2];
      [
        "core",
        "block",
        "inline"
      ].forEach((chain) => {
        result = result.concat(this[chain].ruler.enable(list2, true));
      });
      result = result.concat(this.inline.ruler2.enable(list2, true));
      const missed = list2.filter((name) => result.indexOf(name) < 0);
      if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to enable unknown rule(s): ${missed}`);
      return this;
    }
    /**
    * The same as {@link MarkdownIt.enable}, but turn specified rules off.
    */
    disable(list2, ignoreInvalid = false) {
      let result = [];
      if (!Array.isArray(list2)) list2 = [list2];
      [
        "core",
        "block",
        "inline"
      ].forEach((chain) => {
        result = result.concat(this[chain].ruler.disable(list2, true));
      });
      result = result.concat(this.inline.ruler2.disable(list2, true));
      const missed = list2.filter((name) => result.indexOf(name) < 0);
      if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to disable unknown rule(s): ${missed}`);
      return this;
    }
    /**
    * Load specified plugin with given params into current parser instance.
    * It's just a sugar to call `plugin(md, params)` with curring.
    *
    * @example
    * ```javascript
    * import MarkdownIt from 'markdown-it'
    * import iterator from 'markdown-it-for-inline'
    *
    * const md = new MarkdownIt()
    *   .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
    *     tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar')
    *   })
    * ```
    */
    use(plugin, ...params) {
      plugin.apply(plugin, [this, ...params]);
      return this;
    }
    /**
    * Parse input string and return list of block tokens (special token type
    * "inline" will contain list of inline tokens). You should not call this
    * method directly, until you write custom renderer (for example, to produce
    * AST).
    *
    * `env` is used to pass data between "distributed" rules and return additional
    * metadata like reference info, needed for the renderer. It also can be used to
    * inject data in specific cases. Usually, you will be ok to pass `{}`,
    * and then pass updated object to renderer.
    */
    parse(src, env) {
      if (typeof src !== "string") throw new Error("Input data should be a String");
      const state = new this.core.State(src, this, env);
      this.core.process(state);
      return state.tokens;
    }
    /**
    * Render markdown string into html. It does all magic for you :).
    *
    * `env` can be used to inject additional metadata (`{}` by default).
    * But you will not need it with high probability. See also comment
    * in {@link MarkdownIt.parse}.
    */
    render(src, env = {}) {
      return this.renderer.render(this.parse(src, env), this.options, env);
    }
    /**
    * The same as {@link MarkdownIt.parse} but skip all block rules. It returns
    * the block tokens list with the single `inline` element, containing parsed
    * inline tokens in `children` property. Also updates `env` object.
    */
    parseInline(src, env) {
      const state = new this.core.State(src, this, env);
      state.inlineMode = true;
      this.core.process(state);
      return state.tokens;
    }
    /**
    * Similar to {@link MarkdownIt.render} but for single paragraph content.
    * Result will NOT be wrapped into `<p>` tags.
    */
    renderInline(src, env = {}) {
      return this.renderer.render(this.parseInline(src, env), this.options, env);
    }
  };
  _defineProperty(MarkdownIt, "Token", Token);
  _defineProperty(MarkdownIt, "Ruler", Ruler);
  _defineProperty(MarkdownIt, "Renderer", Renderer);
  _defineProperty(MarkdownIt, "ParserCore", ParserCore);
  _defineProperty(MarkdownIt, "StateCore", StateCore);
  _defineProperty(MarkdownIt, "ParserBlock", ParserBlock);
  _defineProperty(MarkdownIt, "StateBlock", StateBlock);
  _defineProperty(MarkdownIt, "ParserInline", ParserInline);
  _defineProperty(MarkdownIt, "StateInline", StateInline);
  var MarkdownItCallable = callable(MarkdownIt);

  // chat/src/markdown.js
  var md = new MarkdownItCallable({ html: false, linkify: true, breaks: true });
  md.disable("image");
  var defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noopener noreferrer");
    return defaultLinkOpen(tokens, idx, options, env, self);
  };
  function shiftedHeading(token) {
    const level = Number(token.tag.slice(1));
    return `h${Math.min(level + 2, 6)}`;
  }
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    tokens[idx].tag = shiftedHeading(tokens[idx]);
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
    tokens[idx].tag = shiftedHeading(tokens[idx]);
    return self.renderToken(tokens, idx, options);
  };
  var copyButton = '<button type="button" class="code-copy" aria-label="Copy code">Copy</button>';
  for (const rule of ["fence", "code_block"]) {
    const original = md.renderer.rules[rule];
    md.renderer.rules[rule] = (...args) => `<div class="code-block">${copyButton}${original(...args)}</div>`;
  }
  md.renderer.rules.table_open = () => '<div class="table-scroll"><table>\n';
  md.renderer.rules.table_close = () => "</table></div>\n";
  function renderMarkdown(text2) {
    return md.render(text2).replace(/>\n/g, ">");
  }

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
  var convSettingsModelSectionEl = document.getElementById("conv-settings-model-section");
  var convSettingsModelEl = document.getElementById("conv-settings-model");
  var convSettingsWorktreeSectionEl = document.getElementById("conv-settings-worktree-section");
  var convSettingsWorktreeEl = document.getElementById("conv-settings-worktree");
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
    else {
      autoModeKeys.delete(key);
      withdrawAllowEverything(key);
    }
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
  function withdrawAllowEverything(key) {
    const allowed = alwaysAllowedTools.get(key);
    if (!allowed) return;
    allowed.delete("*");
    if (!allowed.size) alwaysAllowedTools.delete(key);
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
  var modelPicker = null;
  async function renderConvSettingsModel() {
    convSettingsModelEl.innerHTML = "";
    modelPicker = null;
    if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
      convSettingsModelSectionEl.hidden = true;
      return;
    }
    const colleagueId = activeColleagueId;
    const sessionId = activeSessionId;
    convSettingsModelSectionEl.hidden = false;
    const loading = document.createElement("p");
    loading.className = "model-picker__hint";
    loading.textContent = "Loading models\u2026";
    convSettingsModelEl.appendChild(loading);
    let data;
    try {
      const res = await fetch(`api/models?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`);
      data = await res.json();
    } catch {
      data = { supported: false };
    }
    if (convSettingsBackdropEl.hidden || colleagueId !== activeColleagueId || sessionId !== activeSessionId) return;
    convSettingsModelEl.innerHTML = "";
    if (!data.supported || !data.models?.length) {
      convSettingsModelSectionEl.hidden = true;
      return;
    }
    const select = document.createElement("select");
    select.id = "conv-model-select";
    select.setAttribute("aria-label", "Model");
    for (const model of data.models) {
      const option = document.createElement("option");
      option.value = model.value;
      option.textContent = model.displayName || model.value;
      select.appendChild(option);
    }
    const confirmed = data.models.some((m3) => m3.value === data.choice) ? data.choice : "default";
    select.value = data.models.some((m3) => m3.value === confirmed) ? confirmed : data.models[0].value;
    const hint = document.createElement("p");
    hint.className = "model-picker__hint";
    const error2 = document.createElement("p");
    error2.className = "model-picker__error";
    error2.setAttribute("role", "alert");
    error2.hidden = true;
    const showDescription = () => {
      hint.textContent = data.models.find((m3) => m3.value === select.value)?.description || "";
    };
    showDescription();
    select.addEventListener("change", () => {
      showDescription();
      error2.hidden = true;
      select.disabled = true;
      socket.send(JSON.stringify({ type: "set_model", colleagueId, sessionId, model: select.value }));
    });
    convSettingsModelEl.append(select, hint, error2);
    modelPicker = { colleagueId, sessionId, select, hint, error: error2, confirmed: select.value };
  }
  function renderConvSettingsNewSession() {
    if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
      convSettingsNewSessionSectionEl.hidden = true;
      return;
    }
    convSettingsNewSessionSectionEl.hidden = false;
    const colleague = colleaguesById.get(activeColleagueId);
    convSettingsNewSessionEl.innerHTML = "";
    const list2 = document.createElement("ul");
    list2.className = "session-list";
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
      list2.appendChild(li);
    }
    convSettingsNewSessionEl.appendChild(list2);
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
    renderConvSettingsWorktree();
    disarmClearChat();
    openDialog(convSettingsBackdropEl, convSettingsModalEl);
    renderConvSettingsModel();
  }
  function closeConvSettingsModal() {
    disarmClearChat();
    closeDialog(convSettingsBackdropEl);
  }
  convSettingsCloseEl.addEventListener("click", closeConvSettingsModal);
  convSettingsBackdropEl.addEventListener("click", (event) => {
    if (event.target === convSettingsBackdropEl) closeConvSettingsModal();
  });
  var worktreeInfo = /* @__PURE__ */ new Map();
  var worktreeInfoLoading = /* @__PURE__ */ new Set();
  async function loadWorktreeInfo(colleagueId, sessionId, { force = false } = {}) {
    const key = convKey(colleagueId, sessionId);
    if (worktreeInfoLoading.has(key) || worktreeInfo.has(key) && !force) return;
    worktreeInfoLoading.add(key);
    try {
      const res = await fetch(
        `api/worktree?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
      );
      worktreeInfo.set(key, await res.json());
    } catch {
      worktreeInfo.set(key, { available: false, worktree: null });
    } finally {
      worktreeInfoLoading.delete(key);
    }
    if (key === activeConvKey()) {
      renderPaneHeader();
      if (!convSettingsBackdropEl.hidden) renderConvSettingsWorktree();
    }
  }
  var worktreeForm = null;
  async function renderConvSettingsWorktree() {
    convSettingsWorktreeEl.innerHTML = "";
    worktreeForm = null;
    if (!activeColleagueId || isSubagentThread(activeColleagueId)) {
      convSettingsWorktreeSectionEl.hidden = true;
      return;
    }
    const colleagueId = activeColleagueId;
    const sessionId = activeSessionId;
    const key = convKey(colleagueId, sessionId);
    if (!worktreeInfo.has(key)) {
      await loadWorktreeInfo(colleagueId, sessionId);
      return;
    }
    const info = worktreeInfo.get(key);
    if (!info.available) {
      convSettingsWorktreeSectionEl.hidden = true;
      return;
    }
    convSettingsWorktreeSectionEl.hidden = false;
    const hint = document.createElement("p");
    hint.className = "model-picker__hint";
    if (info.worktree) {
      hint.textContent = `Works on branch ${info.worktree.branch} in ${info.worktree.path}.`;
      convSettingsWorktreeEl.append(hint);
      return;
    }
    hint.textContent = "Creates a git worktree and a branch for this conversation. She keeps what she knows and works there from her next message on. There is no way back from here yet.";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Work in its own worktree";
    const error2 = document.createElement("p");
    error2.className = "model-picker__error";
    error2.setAttribute("role", "alert");
    error2.hidden = true;
    button.addEventListener("click", () => {
      error2.hidden = true;
      button.disabled = true;
      socket.send(JSON.stringify({ type: "use_worktree", colleagueId, sessionId }));
    });
    convSettingsWorktreeEl.append(button, hint, error2);
    worktreeForm = { colleagueId, sessionId, button, error: error2 };
  }
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
      const info = worktreeInfo.get(key);
      if (!info) loadWorktreeInfo(activeColleagueId, activeSessionId);
      if (info?.worktree) {
        const chip = document.createElement("span");
        chip.className = "pane-header__branch";
        chip.textContent = info.worktree.branch;
        chip.title = "Branch of this conversation's own worktree";
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
    const text2 = typeof value === "string" ? value : JSON.stringify(input2);
    return text2.length > 80 ? text2.slice(0, 80) + "\u2026" : text2;
  }
  function toolUseLine(name, input2) {
    const summary = toolInputSummary(input2);
    return summary ? `${name}: ${summary}` : `Using ${name}\u2026`;
  }
  function reconstructTrail(trail) {
    if (!trail?.length) return void 0;
    return trail.map(
      (entry) => entry.kind === "tool_use" ? { kind: "tool_use", text: toolUseLine(entry.name, entry.input), toolName: entry.name, toolInput: entry.input, approval: entry.approval } : entry
    );
  }
  var loadedHistory = /* @__PURE__ */ new Set();
  var pendingPermission = /* @__PURE__ */ new Map();
  var HIRING_MODE_START = /^:::mode hiring-process:start\s*$/m;
  var HIRING_MODE_END = /^:::mode hiring-process:end\s*$/m;
  var hiringModeConversations = /* @__PURE__ */ new Set();
  function applyHiringModeMarkers(key, text2) {
    let result = text2;
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
    const base2 = file.path.slice(file.path.lastIndexOf("/") + 1);
    return { base: base2, title: file.label !== file.path ? file.label : file.path };
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
    const { base: base2, title } = diffFileLeafLabel(file);
    const label = document.createElement("span");
    label.className = "diff-file__path";
    label.textContent = base2;
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
  function diffScopeParams() {
    if (!activeColleagueId || isSubagentThread(activeColleagueId) || !activeSessionId) return "";
    return `colleagueId=${encodeURIComponent(activeColleagueId)}&sessionId=${encodeURIComponent(activeSessionId)}`;
  }
  var diffLoadSeq = 0;
  async function loadDiffContent(path) {
    diffContentEl.textContent = "Loading\u2026";
    const seq = diffLoadSeq;
    try {
      const res = await fetch(`api/git-diff?path=${encodeURIComponent(path)}&${diffScopeParams()}`);
      const data = await res.json();
      if (activeDiffPath !== path || seq !== diffLoadSeq) return;
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
    const seq = ++diffLoadSeq;
    diffFileListEl.innerHTML = '<li class="empty-note">Loading\u2026</li>';
    diffContentEl.textContent = "";
    let data;
    try {
      const res = await fetch(`api/git-status?${diffScopeParams()}`);
      data = await res.json();
    } catch {
      if (seq !== diffLoadSeq) return;
      diffFiles = null;
      renderDiffFileList();
      return;
    }
    if (diffBackdropEl.hidden || seq !== diffLoadSeq) return;
    diffFiles = data.files;
    const where = `${data.worktree ? "Worktree" : "Workforce folder"}: ${data.cwd || ""}${data.branch ? ` (${data.branch})` : ""}`;
    diffModalCwdEl.textContent = where;
    diffModalCwdEl.title = where;
    if (diffFiles && diffFiles.length > 0) {
      if (!activeDiffPath || !diffFiles.some((f2) => f2.path === activeDiffPath)) activeDiffPath = diffFiles[0].path;
    } else {
      activeDiffPath = null;
    }
    renderDiffFileList();
    if (activeDiffPath) loadDiffContent(activeDiffPath);
  }
  function refreshDiffIfOpen() {
    if (diffBackdropEl.hidden) return;
    activeDiffPath = null;
    loadDiffFiles();
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
    const button = event.target.closest?.(".code-copy");
    if (!button) return;
    const code2 = button.parentElement?.querySelector("code");
    if (code2) copyWithFeedback(code2.textContent, button);
  });
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
    if (update.type === "live_state") {
      for (const turn of update.turns || []) {
        const key2 = convKey(turn.colleagueId, turn.sessionId);
        if (turn.thinking) thinkingStreaming.set(key2, turn.thinking);
        else thinkingStreaming.delete(key2);
        if (turn.text) streaming.set(key2, turn.text);
        else streaming.delete(key2);
        const trail = reconstructTrail(turn.trail);
        if (trail) pendingTrail.set(key2, trail);
        else pendingTrail.delete(key2);
      }
      renderSidebar();
      if (activeConvKey()) renderMessages();
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
      else {
        autoModeKeys.delete(key2);
        withdrawAllowEverything(key2);
      }
      if (key2 === activeConvKey()) renderPaneHeader();
      refreshSettingsModalIfOpen();
      return;
    }
    if (update.type === "worktree_changed") {
      const key2 = convKey(update.colleagueId, update.sessionId);
      const info = worktreeInfo.get(key2) || { available: true };
      worktreeInfo.set(key2, { ...info, available: true, worktree: { branch: update.branch, path: update.path } });
      if (key2 === activeConvKey()) {
        renderPaneHeader();
        refreshDiffIfOpen();
        if (!convSettingsBackdropEl.hidden) renderConvSettingsWorktree();
      }
      return;
    }
    if (update.type === "worktree_failed") {
      const form2 = worktreeForm;
      if (form2 && form2.colleagueId === update.colleagueId && form2.sessionId === update.sessionId) {
        form2.button.disabled = false;
        form2.error.textContent = update.message || "Could not create the worktree.";
        form2.error.hidden = false;
      }
      return;
    }
    if (update.type === "model_changed" || update.type === "model_change_failed") {
      const picker = modelPicker;
      const isThisPicker = picker && picker.colleagueId === update.colleagueId && picker.sessionId === update.sessionId;
      if (update.type === "model_changed") {
        const key2 = convKey(update.colleagueId, update.sessionId);
        const stats = colleagueStats.get(key2) || {};
        stats.model = update.resolvedModel || update.model || stats.model;
        colleagueStats.set(key2, stats);
        if (key2 === activeConvKey()) renderPaneHeader();
        if (isThisPicker) {
          picker.confirmed = picker.select.value;
          picker.select.disabled = false;
        }
      } else if (isThisPicker) {
        picker.select.value = picker.confirmed;
        picker.select.disabled = false;
        picker.hint.textContent = "";
        picker.error.textContent = update.message || "Could not switch the model.";
        picker.error.hidden = false;
      }
      return;
    }
    if (update.type === "chat_cleared") {
      const key2 = update.channelId ? channelConvKey(update.channelId) : convKey(update.colleagueId, update.sessionId);
      history.set(key2, []);
      loadedHistory.add(key2);
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
      const text2 = applyHiringModeMarkers(update.channelId, update.text);
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
        text: text2,
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
        notify(`#${channel?.name || "channel"} \u2014 ${sender?.name || update.senderId}`, text2, () => {
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
            id: update.id,
            text: toolUseLine(update.name, update.input),
            toolName: update.name,
            toolInput: update.input
          });
          break;
        }
        case "tool_done": {
          const entry = (channelPendingTrail.get(colleagueId2) || []).find((e2) => e2.id && e2.id === update.id);
          if (entry) entry.approval = update.approval;
          break;
        }
        case "permission_request":
          if (isAlwaysAllowed(channelKey(colleagueId2, channelId), update.toolName)) {
            const via = alwaysAllowedTools.get(channelKey(colleagueId2, channelId))?.has("*") ? "autopilot" : "allow always";
            socket.send(JSON.stringify({ type: "permission_response", requestId: update.requestId, allow: true, via }));
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
        history.set(
          panel2.syntheticId,
          update.prompt ? [{ role: "you", text: update.prompt, createdAt: (/* @__PURE__ */ new Date()).toISOString() }] : []
        );
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
          id: update.id,
          text: toolUseLine(update.name, update.input),
          toolName: update.name,
          toolInput: update.input
        });
        if (!wasTyping) renderSidebar();
        break;
      }
      case "tool_done": {
        const entry = (pendingTrail.get(key) || []).find((e2) => e2.id && e2.id === update.id);
        if (entry) entry.approval = update.approval;
        for (const waiting of history.get(key)) delete waiting.pending;
        break;
      }
      case "message": {
        streaming.delete(key);
        pendingTrail.delete(key);
        thinkingStreaming.delete(key);
        renderSidebar();
        const text2 = applyHiringModeMarkers(key, update.text);
        for (const waiting of history.get(key)) delete waiting.pending;
        history.get(key).push({
          role: update.role,
          text: text2,
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
          if (rosterColleague) rosterColleague.lastMessage = { role: update.role, text: text2 };
        }
        if (update.role === "colleague" && !isConversationVisible(key)) {
          const target = colleaguesById.get(key) || colleaguesById.get(colleagueId);
          notify(target?.name || colleagueId, text2, () => target && selectColleague(target, sessionId));
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
          const via = alwaysAllowedTools.get(key)?.has("*") ? "autopilot" : "allow always";
          socket.send(JSON.stringify({ type: "permission_response", requestId: update.requestId, allow: true, via }));
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
  var NO_APPROVAL_TOOLS = /* @__PURE__ */ new Set(["Read", "Grep", "Glob"]);
  function approvalLabel(entry) {
    if (!entry.approval || entry.approval === "asked") return null;
    if (entry.approval === "not asked" && NO_APPROVAL_TOOLS.has(entry.toolName)) return null;
    return entry.approval === "not asked" ? "ran without asking" : entry.approval;
  }
  function TrailBox({ trail, onToggleEntry }) {
    return m2`
    <div class="trail-box">
      ${trail.map(
      (entry, i2) => m2`<div key=${i2} class="trail-box__entry">
            ${entry.kind === "tool_use" ? m2`
                  <span class="tool-use-line" onClick=${() => onToggleEntry(i2)}>${entry.text}</span>
                  ${approvalLabel(entry) ? m2` <span class="trail-box__approval">${approvalLabel(entry)}</span>` : null}
                  ${entry.expanded ? m2`<${ToolDetailBox} input=${entry.toolInput} />` : null}
                ` : m2`<span class="trail-box__thinking">${entry.text}</span>`}
          </div>`
    )}
    </div>
  `;
  }
  async function copyToClipboard(text2) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text2);
        return true;
      } catch {
      }
    }
    const previous = document.activeElement;
    const area = document.createElement("textarea");
    area.value = text2;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text2.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    previous?.focus?.();
    return ok;
  }
  async function copyWithFeedback(text2, button) {
    const label = button.dataset.label || button.textContent;
    button.dataset.label = label;
    const ok = await copyToClipboard(text2);
    button.textContent = ok ? "Copied" : "Copy failed";
    clearTimeout(Number(button.dataset.timer));
    button.dataset.timer = String(setTimeout(() => {
      button.textContent = label;
    }, 1500));
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
                <span class="message__footer">
                  ${item.text ? m2`<button type="button" class="copy-button" aria-label="Copy message as Markdown" onClick=${(event) => copyWithFeedback(item.text, event.currentTarget)}>Copy</button>` : null}
                  ${item.pending ? m2`<time class="message__time">Waiting, not read yet</time>` : time ? m2`<time class="message__time">${time}</time>` : null}
                </span>
              </span>
            `}
      </div>
    <//>
  `;
  }
  function StreamingRow({ role, colleague, nameTag, text: text2 }) {
    return m2`
    <div class="message message--${role} message--streaming">
      ${colleague ? m2`<${Avatar} colleague=${colleague} />` : null}
      <span>
        ${nameTag ? m2`<strong class="message__sender">${nameTag}</strong><br />` : null}
        <span dangerouslySetInnerHTML=${{ __html: renderMarkdown(text2) }} />
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
  function EmptyConversation({ text: text2 }) {
    return m2`<p class="conversation-empty">${text2}</p>`;
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
      ${isTyping(key) && !permission ? m2`<div class="typing-indicator" role="status">typing…</div>` : null}
      ${!items.length && !thinkingText && !partialText && !permission && !liveTrail.length ? m2`<${EmptyConversation}
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
    refreshDiffIfOpen();
    await loadChannelHistory(channel.id);
    if (activeChannelId === channel.id) renderChannelMessages({ forceScrollToBottom: true });
  }
  async function loadChannelHistory(channelId, { force = false } = {}) {
    if (channelMessages.has(channelId) && !force) return;
    const res = await fetch(`api/channel-history?channelId=${encodeURIComponent(channelId)}`);
    const rows = await res.json();
    channelMessages.set(
      channelId,
      rows.map((row) => ({
        senderId: row.sender_id,
        text: row.text,
        createdAt: row.created_at,
        attachments: storedAttachments(row.attachments)
      }))
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
    refreshDiffIfOpen();
    const key = activeConvKey();
    await loadColleagueHistory(colleague.id, activeSessionId, key);
    if (activeConvKey() === key) renderMessages({ forceScrollToBottom: true });
  }
  function storedAttachments(list2) {
    return (list2 || []).map((a2) => ({ ...a2, dataUrl: `api/attachment?id=${a2.id}` }));
  }
  async function loadColleagueHistory(colleagueId, sessionId, key, { force = false } = {}) {
    if (isSubagentThread(colleagueId)) return;
    if (loadedHistory.has(key) && !force) return;
    const res = await fetch(
      `api/history?colleagueId=${encodeURIComponent(colleagueId)}&sessionId=${encodeURIComponent(sessionId)}`
    );
    const rows = await res.json();
    loadedHistory.add(key);
    history.set(
      key,
      rows.map((row) => ({
        role: row.role,
        text: row.text,
        createdAt: row.created_at,
        trail: reconstructTrail(row.trail),
        attachments: storedAttachments(row.attachments)
      }))
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
    const { text: text2, typing } = sidebarSubtitle(key, fallback);
    return `<span class="colleague__role${typing ? " colleague__role--typing" : ""}">${text2}</span>`;
  }
  function truncatePreview(text2, max = 64) {
    const oneLine = (text2 || "").replace(/\s+/g, " ").trim();
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
    const text2 = document.createElement("span");
    text2.className = "colleague__text";
    text2.innerHTML = `<span class="colleague__name">${name}</span><span class="colleague__role">${truncatePreview(snippet)}</span>`;
    button.appendChild(text2);
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
      const text2 = document.createElement("span");
      text2.className = "colleague__text";
      text2.innerHTML = sidebarNameHtml(colleague) + sidebarPreviewHtml(shownKey, colleague);
      button.appendChild(text2);
      const allKeys = sessionKeysFor(colleague.id);
      appendUnreadBadge(button, allKeys);
      appendDraftBadge(button, allKeys);
      button.addEventListener("click", () => selectColleague(colleague, lastSessionByColleague.get(colleague.id) || DEFAULT_SESSION_ID));
      sidebarEl.appendChild(button);
      for (const panel of subagentPanels.get(colleague.id)?.values() ?? []) {
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
      const text2 = document.createElement("span");
      text2.className = "colleague__text";
      const memberNames = channel.memberIds.map((id) => colleaguesById.get(id)?.name || id).join(", ");
      const typingNames = [...channelTyping.entries()].filter(([, chId]) => chId === channel.id).map(([cId]) => colleaguesById.get(cId)?.name || cId);
      text2.innerHTML = `<span class="colleague__name">#${channel.name}</span>` + (typingNames.length ? `<span class="colleague__role colleague__role--typing">${typingNames.join(", ")} typing\u2026</span>` : `<span class="colleague__role">${memberNames}</span>`);
      button.appendChild(text2);
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
    const text2 = input.value.trim();
    if (!text2 && !pendingAttachment) return;
    if (activeChannelId) {
      const channelAttachments = pendingAttachment ? [pendingAttachment] : [];
      socket.send(JSON.stringify({
        type: "channel_message",
        channelId: activeChannelId,
        text: text2,
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
    history.get(key).push({ role: "you", text: text2, attachments, createdAt: (/* @__PURE__ */ new Date()).toISOString(), pending: isTyping(key) });
    renderMessages({ forceScrollToBottom: true });
    if (activeSessionId === DEFAULT_SESSION_ID) {
      const rosterColleague = colleaguesById.get(activeColleagueId);
      if (rosterColleague) {
        rosterColleague.lastMessage = { role: "you", text: text2 || "Sent an attachment" };
        renderSidebar();
      }
    }
    socket.send(JSON.stringify({
      colleagueId: activeColleagueId,
      sessionId: activeSessionId,
      text: text2,
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
/*! Bundled license information:

markdown-it/dist/markdown-it.mjs:
  (*! markdown-it 15.0.3 https://github.com/markdown-it/markdown-it @license MIT *)
*/

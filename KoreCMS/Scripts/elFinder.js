/*!
 * elFinder - file manager for web
 * Version 2.0 rc1 (2012-07-18)
 * http://elfinder.org
 * 
 * Copyright 2009-2012, Studio 42
 * Licensed under a 3 clauses BSD license
 */ (function (e) {
    window.elFinder = function (t, n) {
        this.time("load");
        var r = this,
            t = e(t),
            i = e("<div/>").append(t.contents()),
            s = t.attr("style"),
            o = t.attr("id") || "",
            u = "elfinder-" + (o || Math.random().toString().substr(2, 7)),
            a = "mousedown." + u,
            f = "keydown." + u,
            l = "keypress." + u,
            c = !0,
            h = !0,
            p = ["enable", "disable", "load", "open", "reload", "select", "add", "remove", "change", "dblclick", "getfile", "lockfiles", "unlockfiles", "dragstart", "dragstop"],
            d = {}, v = "",
            m = {
                path: "",
                url: "",
                tmbUrl: "",
                disabled: [],
                separator: "/",
                archives: [],
                extract: [],
                copyOverwrite: !0,
                tmb: !1
            }, g = {}, y = [],
            b = {}, w = {}, E = [],
            S = [],
            x = [],
            T = new r.command(r),
            N = "auto",
            C = 400,
            k = e(document.createElement("audio")).hide().appendTo("body")[0],
            L, A = function (t) {
                if (t.init) g = {};
                else for (var n in g) g.hasOwnProperty(n) && g[n].mime != "directory" && g[n].phash == v && e.inArray(n, S) === -1 && delete g[n];
                v = t.cwd.hash, O(t.files), g[v] || O([t.cwd]), r.lastDir(v)
            }, O = function (e) {
                var t = e.length,
                    n;
                while (t--) n = e[t], n.name && n.hash && n.mime && (g[n.hash] = n)
            }, M = function (t) {
                var n = t.keyCode,
                    i = !! t.ctrlKey || !! t.metaKey;
                c && (e.each(w, function (e, s) {
                    s.type == t.type && s.keyCode == n && s.shiftKey == t.shiftKey && s.ctrlKey == i && s.altKey == t.altKey && (t.preventDefault(), t.stopPropagation(), s.callback(t, r), r.debug("shortcut-exec", e + " : " + s.description))
                }), n == 9 && !e(t.target).is(":input") && t.preventDefault())
            }, _ = new Date,
            D, P;
        this.api = null, this.newAPI = !1, this.oldAPI = !1, this.OS = navigator.userAgent.indexOf("Mac") !== -1 ? "mac" : navigator.userAgent.indexOf("Win") !== -1 ? "win" : "other", this.options = e.extend(!0, {}, this._options, n || {}), n.ui && (this.options.ui = n.ui), n.commands && (this.options.commands = n.commands), n.uiOptions && n.uiOptions.toolbar && (this.options.uiOptions.toolbar = n.uiOptions.toolbar), e.extend(this.options.contextmenu, n.contextmenu), this.requestType = /^(get|post)$/i.test(this.options.requestType) ? this.options.requestType.toLowerCase() : "get", this.customData = e.isPlainObject(this.options.customData) ? this.options.customData : {}, this.id = o, this.uploadURL = n.urlUpload || n.url, this.namespace = u, this.lang = this.i18[this.options.lang] && this.i18[this.options.lang].messages ? this.options.lang : "en", P = this.lang == "en" ? this.i18.en : e.extend(!0, {}, this.i18.en, this.i18[this.lang]), this.direction = P.direction, this.messages = P.messages, this.dateFormat = this.options.dateFormat || P.dateFormat, this.fancyFormat = this.options.fancyDateFormat || P.fancyDateFormat, this.today = (new Date(_.getFullYear(), _.getMonth(), _.getDate())).getTime() / 1e3, this.yesterday = this.today - 86400, D = this.options.UTCDate ? "UTC" : "", this.getHours = "get" + D + "Hours", this.getMinutes = "get" + D + "Minutes", this.getSeconds = "get" + D + "Seconds", this.getDate = "get" + D + "Date", this.getDay = "get" + D + "Day", this.getMonth = "get" + D + "Month", this.getFullYear = "get" + D + "FullYear", this.cssClass = "ui-helper-reset ui-helper-clearfix ui-widget ui-widget-content ui-corner-all elfinder elfinder-" + (this.direction == "rtl" ? "rtl" : "ltr") + " " + this.options.cssClass, this.storage = function () {
            try {
                return "localStorage" in window && window.localStorage !== null ? r.localStorage : r.cookie
            } catch (e) {
                return r.cookie
            }
        }(), this.viewType = this.storage("view") || this.options.defaultView || "icons", this.sortType = this.storage("sortType") || this.options.sortType || "name", this.sortOrder = this.storage("sortOrder") || this.options.sortOrder || "asc", this.sortStickFolders = this.storage("sortStickFolders"), this.sortStickFolders === null ? this.sortStickFolders = !! this.options.sortStickFolders : this.sortStickFolders = !! this.sortStickFolders, this.sortRules = e.extend(!0, {}, this._sortRules, this.options.sortsRules), e.each(this.sortRules, function (e, t) {
            typeof t != "function" && delete r.sortRules[e]
        }), this.compare = e.proxy(this.compare, this), this.notifyDelay = this.options.notifyDelay > 0 ? parseInt(this.options.notifyDelay) : 500, this.draggable = {
            appendTo: "body",
            addClasses: !0,
            delay: 30,
            revert: !0,
            refreshPositions: !0,
            cursor: "move",
            cursorAt: {
                left: 50,
                top: 47
            },
            drag: function (e, t) {
                t.helper.data("locked") || t.helper.toggleClass("elfinder-drag-helper-plus", e.shiftKey || e.ctrlKey || e.metaKey)
            },
            start: function (t, n) {
                var r = e.map(n.helper.data("files") || [], function (e) {
                    return e || null
                }),
                    i, s;
                i = r.length;
                while (i--) {
                    s = r[i];
                    if (g[s].locked) {
                        n.helper.addClass("elfinder-drag-helper-plus").data("locked", !0);
                        break
                    }
                }
            },
            stop: function () {
                r.trigger("focus").trigger("dragstop")
            },
            helper: function (t, n) {
                var i = this.id ? e(this) : e(this).parents("[id]:first"),
                    s = e('<div class="elfinder-drag-helper"><span class="elfinder-drag-helper-icon-plus"/></div>'),
                    o = function (e) {
                        return '<div class="elfinder-cwd-icon ' + r.mime2class(e) + ' ui-corner-all"/>'
                    }, u, a;
                return r.trigger("dragstart", {
                    target: i[0],
                    originalEvent: t
                }), u = i.is("." + r.res("class", "cwdfile")) ? r.selected() : [r.navId2Hash(i.attr("id"))], s.append(o(g[u[0]].mime)).data("files", u).data("locked", !1), (a = u.length) > 1 && s.append(o(g[u[a - 1]].mime) + '<span class="elfinder-drag-num">' + a + "</span>"), s
            }
        }, this.droppable = {
            tolerance: "pointer",
            accept: ".elfinder-cwd-file-wrapper,.elfinder-navbar-dir,.elfinder-cwd-file",
            hoverClass: this.res("class", "adroppable"),
            drop: function (t, n) {
                var i = e(this),
                    s = e.map(n.helper.data("files") || [], function (e) {
                        return e || null
                    }),
                    o = [],
                    u = "class",
                    a, f, l, c;
                i.is("." + r.res(u, "cwd")) ? f = v : i.is("." + r.res(u, "cwdfile")) ? f = i.attr("id") : i.is("." + r.res(u, "navdir")) && (f = r.navId2Hash(i.attr("id"))), a = s.length;
                while (a--) c = s[a], c != f && g[c].phash != f && o.push(c);
                o.length && (n.helper.hide(), r.clipboard(o, !(t.ctrlKey || t.shiftKey || t.metaKey || n.helper.data("locked"))), r.exec("paste", f), r.trigger("drop", {
                    files: s
                }))
            }
        }, this.enabled = function () {
            return t.is(":visible") && c
        }, this.visible = function () {
            return t.is(":visible")
        }, this.root = function (e) {
            var t = g[e || v],
                n;
            while (t && t.phash) t = g[t.phash];
            if (t) return t.hash;
            while (n in g && g.hasOwnProperty(n)) {
                t = g[n];
                if (!t.phash && !t.mime == "directory" && t.read) return t.hash
            }
            return ""
        }, this.cwd = function () {
            return g[v] || {}
        }, this.option = function (e) {
            return m[e] || ""
        }, this.file = function (e) {
            return g[e]
        }, this.files = function () {
            return e.extend(!0, {}, g)
        }, this.parents = function (e) {
            var t = [],
                n;
            while (n = this.file(e)) t.unshift(n.hash), e = n.phash;
            return t
        }, this.path2array = function (e) {
            var t, n = [];
            while (e && (t = g[e]) && t.hash) n.unshift(t.name), e = t.phash;
            return n
        }, this.path = function (e) {
            return g[e] && g[e].path ? g[e].path : this.path2array(e).join(m.separator)
        }, this.url = function (t) {
            var n = g[t];
            if (!n || !n.read) return "";
            if (n.url) return n.url;
            if (m.url) return m.url + e.map(this.path2array(t), function (e) {
                return encodeURIComponent(e)
            }).slice(1).join("/");
            var r = e.extend({}, this.customData, {
                cmd: "file",
                target: n.hash
            });
            return this.oldAPI && (r.cmd = "open", r.current = n.phash), this.options.url + (this.options.url.indexOf("?") === -1 ? "?" : "&") + e.param(r, !0)
        }, this.tmb = function (t) {
            var n = g[t],
                r = n && n.tmb && n.tmb != 1 ? m.tmbUrl + n.tmb : "";
            return r && (e.browser.opera || e.browser.msie) && (r += "?_=" + (new Date).getTime()), r
        }, this.selected = function () {
            return y.slice(0)
        }, this.selectedFiles = function () {
            return e.map(y, function (t) {
                return g[t] ? e.extend({}, g[t]) : null
            })
        }, this.fileByName = function (e, t) {
            var n;
            for (n in g) if (g.hasOwnProperty(n) && g[n].phash == t && g[n].name == e) return g[n]
        }, this.validResponse = function (e, t) {
            return t.error || this.rules[this.rules[e] ? e : "defaults"](t)
        }, this.request = function (t) {
            var n = this,
                r = this.options,
                i = e.Deferred(),
                s = e.extend({}, r.customData, {
                    mimes: r.onlyMimes
                }, t.data || t),
                o = s.cmd,
                u = !t.preventDefault && !t.preventFail,
                a = !t.preventDefault && !t.preventDone,
                f = e.extend({}, t.notify),
                l = !! t.raw,
                c = t.syncOnFail,
                h, t = e.extend({
                    url: r.url,
                    async: !0,
                    type: this.requestType,
                    dataType: "json",
                    cache: !1,
                    data: s
                }, t.options || {}),
                p = function (t) {
                    t.warning && n.error(t.warning), o == "open" && A(e.extend(!0, {}, t)), t.removed && t.removed.length && n.remove(t), t.added && t.added.length && n.add(t), t.changed && t.changed.length && n.change(t), n.trigger(o, t), t.sync && n.sync()
                }, d = function (e, t) {
                    var n;
                    switch (t) {
                        case "abort":
                            n = e.quiet ? "" : ["errConnect", "errAbort"];
                            break;
                        case "timeout":
                            n = ["errConnect", "errTimeout"];
                            break;
                        case "parsererror":
                            n = ["errResponse", "errDataNotJSON"];
                            break;
                        default:
                            e.status == 403 ? n = ["errConnect", "errAccess"] : e.status == 404 ? n = ["errConnect", "errNotFound"] : n = "errConnect"
                    }
                    i.reject(n, e, t)
                }, v = function (t) {
                    if (l) return i.resolve(t);
                    if (!t) return i.reject(["errResponse", "errDataEmpty"], g);
                    if (!e.isPlainObject(t)) return i.reject(["errResponse", "errDataNotJSON"], g);
                    if (t.error) return i.reject(t.error, g);
                    if (!n.validResponse(o, t)) return i.reject("errResponse", g);
                    t = n.normalize(t), n.api || (n.api = t.api || 1, n.newAPI = n.api >= 2, n.oldAPI = !n.newAPI), t.options && (m = e.extend({}, m, t.options)), t.netDrivers && (n.netDrivers = t.netDrivers), i.resolve(t), t.debug && n.debug("backend-debug", t.debug)
                }, g, y;
            a && i.done(p), i.fail(function (e) {
                e && (u ? n.error(e) : n.debug("error", n.i18n(e)))
            });
            if (!o) return i.reject("errCmdReq");
            c && i.fail(function (e) {
                e && n.sync()
            }), f.type && f.cnt && (h = setTimeout(function () {
                n.notify(f), i.always(function () {
                    f.cnt = -(parseInt(f.cnt) || 0), n.notify(f)
                })
            }, n.notifyDelay), i.always(function () {
                clearTimeout(h)
            }));
            if (o == "open") while (y = x.pop())!y.state() == "rejected" && !y.isResolved() && (y.quiet = !0, y.abort());
            return delete t.preventFail, g = this.transport.send(t).fail(d).done(v), o == "open" && (x.unshift(g), i.always(function () {
                var t = e.inArray(g, x);
                t !== -1 && x.splice(t, 1)
            })), i
        }, this.diff = function (t) {
            var n = {}, r = [],
                i = [],
                s = [],
                o = function (e) {
                    var t = s.length;
                    while (t--) if (s[t].hash == e) return !0
                };
            return e.each(t, function (e, t) {
                n[t.hash] = t
            }), e.each(g, function (e, t) {
                !n[e] && i.push(e)
            }), e.each(n, function (t, n) {
                var i = g[t];
                i ? e.each(n, function (e) {
                    if (n[e] != i[e]) return s.push(n), !1
                }) : r.push(n)
            }), e.each(i, function (t, r) {
                var u = g[r],
                    a = u.phash;
                a && u.mime == "directory" && e.inArray(a, i) === -1 && n[a] && !o(a) && s.push(n[a])
            }), {
                added: r,
                removed: i,
                changed: s
            }
        }, this.sync = function () {
            var t = this,
                n = e.Deferred().done(function () {
                    t.trigger("sync")
                }),
                r = {
                    data: {
                        cmd: "open",
                        init: 1,
                        target: v,
                        tree: this.ui.tree ? 1 : 0
                    },
                    preventDefault: !0
                }, i = {
                    data: {
                        cmd: "parents",
                        target: v
                    },
                    preventDefault: !0
                };
            return e.when(this.request(r), this.request(i)).fail(function (e) {
                n.reject(e), e && t.request({
                    data: {
                        cmd: "open",
                        target: t.lastDir(""),
                        tree: 1,
                        init: 1
                    },
                    notify: {
                        type: "open",
                        cnt: 1,
                        hideCnt: !0
                    }
                })
            }).done(function (e, r) {
                var i = t.diff(e.files.concat(r && r.tree ? r.tree : []));
                return i.removed.length && t.remove(i), i.added.length && t.add(i), i.changed.length && t.change(i), n.resolve(i)
            }), n
        }, this.upload = function (e) {
            return this.transport.upload(e, this)
        }, this.bind = function (e, t) {
            var n;
            if (typeof t == "function") {
                e = ("" + e).toLowerCase().split(/\s+/);
                for (n = 0; n < e.length; n++) b[e[n]] === void 0 && (b[e[n]] = []), b[e[n]].push(t)
            }
            return this
        }, this.unbind = function (e, t) {
            var n = b[("" + e).toLowerCase()] || [],
                r = n.indexOf(t);
            return r > -1 && n.splice(r, 1), t = null, this
        }, this.trigger = function (t, n) {
            var t = t.toLowerCase(),
                r = b[t] || [],
                i, s;
            this.debug("event-" + t, n);
            if (r.length) {
                t = e.Event(t);
                for (i = 0; i < r.length; i++) {
                    t.data = e.extend(!0, {}, n);
                    try {
                        if (r[i](t, this) === !1 || t.isDefaultPrevented()) {
                            this.debug("event-stoped", t.type);
                            break
                        }
                    } catch (o) {
                        window.console && window.console.log && window.console.log(o)
                    }
                }
            }
            return this
        }, this.shortcut = function (t) {
            var n, r, i, s, o;
            if (this.options.allowShortcuts && t.pattern && e.isFunction(t.callback)) {
                n = t.pattern.toUpperCase().split(/\s+/);
                for (s = 0; s < n.length; s++) r = n[s], o = r.split("+"), i = (i = o.pop()).length == 1 ? i > 0 ? i : i.charCodeAt(0) : e.ui.keyCode[i], i && !w[r] && (w[r] = {
                    keyCode: i,
                    altKey: e.inArray("ALT", o) != -1,
                    ctrlKey: e.inArray("CTRL", o) != -1,
                    shiftKey: e.inArray("SHIFT", o) != -1,
                    type: t.type || "keydown",
                    callback: t.callback,
                    description: t.description,
                    pattern: r
                })
            }
            return this
        }, this.shortcuts = function () {
            var t = [];
            return e.each(w, function (e, n) {
                t.push([n.pattern, r.i18n(n.description)])
            }), t
        }, this.clipboard = function (t, n) {
            var r = function () {
                return e.map(E, function (e) {
                    return e.hash
                })
            };
            return t !== void 0 && (E.length && this.trigger("unlockfiles", {
                files: r()
            }), S = [], E = e.map(t || [], function (e) {
                var t = g[e];
                return t ? (S.push(e), {
                    hash: e,
                    phash: t.phash,
                    name: t.name,
                    mime: t.mime,
                    read: t.read,
                    locked: t.locked,
                    cut: !! n
                }) : null
            }), this.trigger("changeclipboard", {
                clipboard: E.slice(0, E.length)
            }), n && this.trigger("lockfiles", {
                files: r()
            })), E.slice(0, E.length)
        }, this.isCommandEnabled = function (t) {
            return this._commands[t] ? e.inArray(t, m.disabled) === -1 : !1
        }, this.exec = function (t, n, r) {
            return this._commands[t] && this.isCommandEnabled(t) ? this._commands[t].exec(n, r) : e.Deferred().reject("No such command")
        }, this.dialog = function (n, r) {
            return e("<div/>").append(n).appendTo(t).elfinderdialog(r)
        }, this.getUI = function (e) {
            return this.ui[e] || t
        }, this.command = function (e) {
            return e === void 0 ? this._commands : this._commands[e]
        }, this.resize = function (e, n) {
            t.css("width", e).height(n).trigger("resize"), this.trigger("resize", {
                width: t.width(),
                height: t.height()
            })
        }, this.restoreSize = function () {
            this.resize(N, C)
        }, this.show = function () {
            t.show(), this.enable().trigger("show")
        }, this.hide = function () {
            this.disable().trigger("hide"), t.hide()
        }, this.destroy = function () {
            t && t[0].elfinder && (this.trigger("destroy").disable(), b = {}, w = {}, e(document).add(t).unbind("." + this.namespace), r.trigger = function () {}, t.children().remove(), t.append(i.contents()).removeClass(this.cssClass).attr("style", s), t[0].elfinder = null, L && clearInterval(L))
        };
        if (!(e.fn.selectable && e.fn.draggable && e.fn.droppable)) return alert(this.i18n("errJqui"));
        if (!t.length) return alert(this.i18n("errNode"));
        if (!this.options.url) return alert(this.i18n("errURL"));
        e.extend(e.ui.keyCode, {
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120
        }), this.dragUpload = !1, this.xhrUpload = typeof XMLHttpRequestUpload != "undefined" && typeof File != "undefined" && typeof FormData != "undefined", this.transport = {}, typeof this.options.transport == "object" && (this.transport = this.options.transport, typeof this.transport.init == "function" && this.transport.init(this)), typeof this.transport.send != "function" && (this.transport.send = function (t) {
            return e.ajax(t)
        }), this.transport.upload == "iframe" ? this.transport.upload = e.proxy(this.uploads.iframe, this) : typeof this.transport.upload == "function" ? this.dragUpload = !! this.options.dragUploadAllow : this.xhrUpload ? (this.transport.upload = e.proxy(this.uploads.xhr, this), this.dragUpload = !0) : this.transport.upload = e.proxy(this.uploads.iframe, this), this.error = function () {
            var e = arguments[0];
            return arguments.length == 1 && typeof e == "function" ? r.bind("error", e) : r.trigger("error", {
                error: e
            })
        }, e.each(["enable", "disable", "load", "open", "reload", "select", "add", "remove", "change", "dblclick", "getfile", "lockfiles", "unlockfiles", "dragstart", "dragstop", "search", "searchend", "viewchange"], function (t, n) {
            r[n] = function () {
                var t = arguments[0];
                return arguments.length == 1 && typeof t == "function" ? r.bind(n, t) : r.trigger(n, e.isPlainObject(t) ? t : {})
            }
        }), this.enable(function () {
            !c && r.visible() && r.ui.overlay.is(":hidden") && (c = !0, e("texarea:focus,input:focus,button").blur(), t.removeClass("elfinder-disabled"))
        }).disable(function () {
            h = c, c = !1, t.addClass("elfinder-disabled")
        }).open(function () {
            y = []
        }).select(function (t) {
            y = e.map(t.data.selected || t.data.value || [], function (e) {
                return g[e] ? e : null
            })
        }).error(function (t) {
            var n = {
                cssClass: "elfinder-dialog-error",
                title: r.i18n(r.i18n("error")),
                resizable: !1,
                destroyOnClose: !0,
                buttons: {}
            };
            n.buttons[r.i18n(r.i18n("btnClose"))] = function () {
                e(this).elfinderdialog("close")
            }, r.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-error"/>' + r.i18n(t.data.error), n)
        }).bind("tree parents", function (e) {
            O(e.data.tree || [])
        }).bind("tmb", function (t) {
            e.each(t.data.images || [], function (e, t) {
                g[e] && (g[e].tmb = t)
            })
        }).add(function (e) {
            O(e.data.added || [])
        }).change(function (t) {
            e.each(t.data.changed || [], function (t, n) {
                var r = n.hash;
                g[r] = g[r] ? e.extend(g[r], n) : n
            })
        }).remove(function (t) {
            var n = t.data.removed || [],
                r = n.length,
                i = function (t) {
                    var n = g[t];
                    n && (n.mime == "directory" && n.dirs && e.each(g, function (e, n) {
                        n.phash == t && i(e)
                    }), delete g[t])
                };
            while (r--) i(n[r])
        }).bind("search", function (e) {
            O(e.data.files)
        }).bind("rm", function (t) {
            var n = k.canPlayType && k.canPlayType('audio/wav; codecs="1"');
            n && n != "" && n != "no" && e(k).html('<source src="./sounds/rm.wav" type="audio/wav">')[0].play()
        }), e.each(this.options.handlers, function (e, t) {
            r.bind(e, t)
        }), this.history = new this.history(this), typeof this.options.getFileCallback == "function" && this.commands.getfile && (this.bind("dblclick", function (e) {
            e.preventDefault(), r.exec("getfile").fail(function () {
                r.exec("open")
            })
        }), this.shortcut({
            pattern: "enter",
            description: this.i18n("cmdgetfile"),
            callback: function () {
                r.exec("getfile").fail(function () {
                    r.exec(r.OS == "mac" ? "rename" : "open")
                })
            }
        }).shortcut({
            pattern: "ctrl+enter",
            description: this.i18n(this.OS == "mac" ? "cmdrename" : "cmdopen"),
            callback: function () {
                r.exec(r.OS == "mac" ? "rename" : "open")
            }
        })), this._commands = {}, e.isArray(this.options.commands) || (this.options.commands = []), e.each(["open", "reload", "back", "forward", "up", "home", "info", "quicklook", "getfile", "help"], function (t, n) {
            e.inArray(n, r.options.commands) === -1 && r.options.commands.push(n)
        }), e.each(this.options.commands, function (t, n) {
            var i = r.commands[n];
            e.isFunction(i) && !r._commands[n] && (i.prototype = T, r._commands[n] = new i, r._commands[n].setup(n, r.options.commandsOptions[n] || {}))
        }), t.addClass(this.cssClass).bind(a, function () {
            !c && r.enable()
        }), this.ui = {
            workzone: e("<div/>").appendTo(t).elfinderworkzone(this),
            navbar: e("<div/>").appendTo(t).elfindernavbar(this, this.options.uiOptions.navbar || {}),
            contextmenu: e("<div/>").appendTo(t).elfindercontextmenu(this),
            overlay: e("<div/>").appendTo(t).elfinderoverlay({
                show: function () {
                    r.disable()
                },
                hide: function () {
                    h && r.enable()
                }
            }),
            cwd: e("<div/>").appendTo(t).elfindercwd(this, this.options.uiOptions.cwd || {}),
            notify: this.dialog("", {
                cssClass: "elfinder-dialog-notify",
                position: {
                    top: "12px",
                    right: "12px"
                },
                resizable: !1,
                autoOpen: !1,
                title: "&nbsp;",
                width: 280
            }),
            statusbar: e('<div class="ui-widget-header ui-helper-clearfix ui-corner-bottom elfinder-statusbar"/>').hide().appendTo(t)
        }, e.each(this.options.ui || [], function (n, i) {
            var s = "elfinder" + i,
                o = r.options.uiOptions[i] || {};
            !r.ui[i] && e.fn[s] && (r.ui[i] = e("<" + (o.tag || "div") + "/>").appendTo(t)[s](r, o))
        }), t[0].elfinder = this, this.options.resizable && e.fn.resizable && t.resizable({
            handles: "se",
            minWidth: 300,
            minHeight: 200
        }), this.options.width && (N = this.options.width), this.options.height && (C = parseInt(this.options.height)), r.resize(N, C), e(document).bind("click." + this.namespace, function (n) {
            c && !e(n.target).closest(t).length && r.disable()
        }).bind(f + " " + l, M), this.trigger("init").request({
            data: {
                cmd: "open",
                target: r.lastDir(),
                init: 1,
                tree: this.ui.tree ? 1 : 0
            },
            preventDone: !0,
            notify: {
                type: "open",
                cnt: 1,
                hideCnt: !0
            },
            freeze: !0
        }).fail(function () {
            r.trigger("fail").disable().lastDir(""), b = {}, w = {}, e(document).add(t).unbind("." + this.namespace), r.trigger = function () {}
        }).done(function (t) {
            r.load().debug("api", r.api), t = e.extend(!0, {}, t), A(t), r.trigger("open", t)
        }), this.one("load", function () {
            t.trigger("resize"), r.options.sync > 1e3 && (L = setInterval(function () {
                r.sync()
            }, r.options.sync))
        })
    }, elFinder.prototype = {
        res: function (e, t) {
            return this.resources[e] && this.resources[e][t]
        },
        i18: {
            en: {
                translator: "",
                language: "English",
                direction: "ltr",
                dateFormat: "d.m.Y H:i",
                fancyDateFormat: "$1 H:i",
                messages: {}
            },
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        },
        kinds: {
            unknown: "Unknown",
            directory: "Folder",
            symlink: "Alias",
            "symlink-broken": "AliasBroken",
            "application/x-empty": "TextPlain",
            "application/postscript": "Postscript",
            "application/vnd.ms-office": "MsOffice",
            "application/vnd.ms-word": "MsWord",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "MsWord",
            "application/vnd.ms-word.document.macroEnabled.12": "MsWord",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.template": "MsWord",
            "application/vnd.ms-word.template.macroEnabled.12": "MsWord",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "MsWord",
            "application/vnd.ms-excel": "MsExcel",
            "application/vnd.ms-excel.sheet.macroEnabled.12": "MsExcel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.template": "MsExcel",
            "application/vnd.ms-excel.template.macroEnabled.12": "MsExcel",
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12": "MsExcel",
            "application/vnd.ms-excel.addin.macroEnabled.12": "MsExcel",
            "application/vnd.ms-powerpoint": "MsPP",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "MsPP",
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12": "MsPP",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "MsPP",
            "application/vnd.ms-powerpoint.slideshow.macroEnabled.12": "MsPP",
            "application/vnd.openxmlformats-officedocument.presentationml.template": "MsPP",
            "application/vnd.ms-powerpoint.template.macroEnabled.12": "MsPP",
            "application/vnd.ms-powerpoint.addin.macroEnabled.12": "MsPP",
            "application/vnd.openxmlformats-officedocument.presentationml.slide": "MsPP",
            "application/vnd.ms-powerpoint.slide.macroEnabled.12": "MsPP",
            "application/pdf": "PDF",
            "application/xml": "XML",
            "application/vnd.oasis.opendocument.text": "OO",
            "application/vnd.oasis.opendocument.text-template": "OO",
            "application/vnd.oasis.opendocument.text-web": "OO",
            "application/vnd.oasis.opendocument.text-master": "OO",
            "application/vnd.oasis.opendocument.graphics": "OO",
            "application/vnd.oasis.opendocument.graphics-template": "OO",
            "application/vnd.oasis.opendocument.presentation": "OO",
            "application/vnd.oasis.opendocument.presentation-template": "OO",
            "application/vnd.oasis.opendocument.spreadsheet": "OO",
            "application/vnd.oasis.opendocument.spreadsheet-template": "OO",
            "application/vnd.oasis.opendocument.chart": "OO",
            "application/vnd.oasis.opendocument.formula": "OO",
            "application/vnd.oasis.opendocument.database": "OO",
            "application/vnd.oasis.opendocument.image": "OO",
            "application/vnd.openofficeorg.extension": "OO",
            "application/x-shockwave-flash": "AppFlash",
            "application/flash-video": "Flash video",
            "application/x-bittorrent": "Torrent",
            "application/javascript": "JS",
            "application/rtf": "RTF",
            "application/rtfd": "RTF",
            "application/x-font-ttf": "TTF",
            "application/x-font-otf": "OTF",
            "application/x-rpm": "RPM",
            "application/x-web-config": "TextPlain",
            "application/xhtml+xml": "HTML",
            "application/docbook+xml": "DOCBOOK",
            "application/x-awk": "AWK",
            "application/x-gzip": "GZIP",
            "application/x-bzip2": "BZIP",
            "application/zip": "ZIP",
            "application/x-zip": "ZIP",
            "application/x-rar": "RAR",
            "application/x-tar": "TAR",
            "application/x-7z-compressed": "7z",
            "application/x-jar": "JAR",
            "text/plain": "TextPlain",
            "text/x-php": "PHP",
            "text/html": "HTML",
            "text/javascript": "JS",
            "text/css": "CSS",
            "text/rtf": "RTF",
            "text/rtfd": "RTF",
            "text/x-c": "C",
            "text/x-csrc": "C",
            "text/x-chdr": "CHeader",
            "text/x-c++": "CPP",
            "text/x-c++src": "CPP",
            "text/x-c++hdr": "CPPHeader",
            "text/x-shellscript": "Shell",
            "application/x-csh": "Shell",
            "text/x-python": "Python",
            "text/x-java": "Java",
            "text/x-java-source": "Java",
            "text/x-ruby": "Ruby",
            "text/x-perl": "Perl",
            "text/x-sql": "SQL",
            "text/xml": "XML",
            "text/x-comma-separated-values": "CSV",
            "image/x-ms-bmp": "BMP",
            "image/jpeg": "JPEG",
            "image/gif": "GIF",
            "image/png": "PNG",
            "image/tiff": "TIFF",
            "image/x-targa": "TGA",
            "image/vnd.adobe.photoshop": "PSD",
            "image/xbm": "XBITMAP",
            "image/pxm": "PXM",
            "audio/mpeg": "AudioMPEG",
            "audio/midi": "AudioMIDI",
            "audio/ogg": "AudioOGG",
            "audio/mp4": "AudioMPEG4",
            "audio/x-m4a": "AudioMPEG4",
            "audio/wav": "AudioWAV",
            "audio/x-mp3-playlist": "AudioPlaylist",
            "video/x-dv": "VideoDV",
            "video/mp4": "VideoMPEG4",
            "video/mpeg": "VideoMPEG",
            "video/x-msvideo": "VideoAVI",
            "video/quicktime": "VideoMOV",
            "video/x-ms-wmv": "VideoWM",
            "video/x-flv": "VideoFlash",
            "video/x-matroska": "VideoMKV",
            "video/ogg": "VideoOGG"
        },
        rules: {
            defaults: function (t) {
                return !t || t.added && !e.isArray(t.added) || t.removed && !e.isArray(t.removed) || t.changed && !e.isArray(t.changed) ? !1 : !0
            },
            open: function (t) {
                return t && t.cwd && t.files && e.isPlainObject(t.cwd) && e.isArray(t.files)
            },
            tree: function (t) {
                return t && t.tree && e.isArray(t.tree)
            },
            parents: function (t) {
                return t && t.tree && e.isArray(t.tree)
            },
            tmb: function (t) {
                return t && t.images && (e.isPlainObject(t.images) || e.isArray(t.images))
            },
            upload: function (t) {
                return t && (e.isPlainObject(t.added) || e.isArray(t.added))
            },
            search: function (t) {
                return t && t.files && e.isArray(t.files)
            }
        },
        commands: {},
        parseUploadData: function (t) {
            var n;
            if (!e.trim(t)) return {
                error: ["errResponse", "errDataEmpty"]
            };
            try {
                n = e.parseJSON(t)
            } catch (r) {
                return {
                    error: ["errResponse", "errDataNotJSON"]
                }
            }
            return this.validResponse("upload", n) ? (n = this.normalize(n), n.removed = e.map(n.added || [], function (e) {
                return e.hash
            }), n) : {
                error: ["errResponse"]
            }
        },
        iframeCnt: 0,
        uploads: {
            iframe: function (t, n) {
                var r = n ? n : this,
                    i = t.input,
                    s = e.Deferred().fail(function (e) {
                        e && r.error(e)
                    }).done(function (e) {
                        e.warning && r.error(e.warning), e.removed && r.remove(e), e.added && r.add(e), e.changed && r.change(e), r.trigger("upload", e), e.sync && r.sync()
                    }),
                    o = "iframe-" + r.namespace + ++r.iframeCnt,
                    u = e('<form action="' + r.uploadURL + '" method="post" enctype="multipart/form-data" encoding="multipart/form-data" target="' + o + '" style="display:none"><input type="hidden" name="cmd" value="upload" /></form>'),
                    a = e.browser.msie,
                    f = function () {
                        d && clearTimeout(d), p && clearTimeout(p), h && r.notify({
                            type: "upload",
                            cnt: -c
                        }), setTimeout(function () {
                            a && e('<iframe src="javascript:false;"/>').appendTo(u), u.remove(), l.remove()
                        }, 100)
                    }, l = e('<iframe src="' + (a ? "javascript:false;" : "about:blank") + '" name="' + o + '" style="position:absolute;left:-1000px;top:-1000px" />').bind("load", function () {
                        l.unbind("load").bind("load", function () {
                            var e = r.parseUploadData(l.contents().text());
                            f(), e.error ? s.reject(e.error) : s.resolve(e)
                        }), p = setTimeout(function () {
                            h = !0, r.notify({
                                type: "upload",
                                cnt: c
                            })
                        }, r.options.notifyDelay), r.options.iframeTimeout > 0 && (d = setTimeout(function () {
                            f(), s.reject([errors.connect, errors.timeout])
                        }, r.options.iframeTimeout)), u.submit()
                    }),
                    c, h, p, d;
                return i && e(i).is(":file") && e(i).val() ? (u.append(i), c = i.files ? i.files.length : 1, u.append('<input type="hidden" name="' + (r.newAPI ? "target" : "current") + '" value="' + r.cwd().hash + '"/>').append('<input type="hidden" name="html" value="1"/>').append(e(i).attr("name", "upload[]")), e.each(r.options.onlyMimes || [], function (e, t) {
                    u.append('<input type="hidden" name="mimes[]" value="' + t + '"/>')
                }), e.each(r.options.customData, function (e, t) {
                    u.append('<input type="hidden" name="' + e + '" value="' + t + '"/>')
                }), u.appendTo("body"), l.appendTo("body"), s) : s.reject()
            },
            xhr: function (t, n) {
                var r = n ? n : this,
                    i = e.Deferred().fail(function (e) {
                        e && r.error(e)
                    }).done(function (e) {
                        e.warning && r.error(e.warning), e.removed && r.remove(e), e.added && r.add(e), e.changed && r.change(e), r.trigger("upload", e), e.sync && r.sync()
                    }).always(function () {
                        h && clearTimeout(h), l && r.notify({
                            type: "upload",
                            cnt: -a,
                            progress: 100 * a
                        })
                    }),
                    s = new XMLHttpRequest,
                    o = new FormData,
                    u = t.input ? t.input.files : t.files,
                    a = u.length,
                    f = 5,
                    l = !1,
                    c = function () {
                        return setTimeout(function () {
                            l = !0, r.notify({
                                type: "upload",
                                cnt: a,
                                progress: f * a
                            })
                        }, r.options.notifyDelay)
                    }, h;
                if (!a) return i.reject();
                s.addEventListener("error", function () {
                    i.reject("errConnect")
                }, !1), s.addEventListener("abort", function () {
                    i.reject(["errConnect", "errAbort"])
                }, !1), s.addEventListener("load", function () {
                    var e = s.status,
                        t;
                    if (e > 500) return i.reject("errResponse");
                    if (e != 200) return i.reject("errConnect");
                    if (s.readyState != 4) return i.reject(["errConnect", "errTimeout"]);
                    if (!s.responseText) return i.reject(["errResponse", "errDataEmpty"]);
                    t = r.parseUploadData(s.responseText), t.error ? i.reject(t.error) : i.resolve(t)
                }, !1), s.upload.addEventListener("progress", function (e) {
                    var t = f,
                        n;
                    e.lengthComputable && (n = parseInt(e.loaded * 100 / e.total), n > 0 && !h && (h = c()), n - t > 4 && (f = n, l && r.notify({
                        type: "upload",
                        cnt: 0,
                        progress: (f - t) * a
                    })))
                }, !1), s.open("POST", r.uploadURL, !0), o.append("cmd", "upload"), o.append(r.newAPI ? "target" : "current", r.cwd().hash), e.each(r.options.customData, function (e, t) {
                    o.append(e, t)
                }), e.each(r.options.onlyMimes, function (e, t) {
                    o.append("mimes[" + e + "]", t)
                }), e.each(u, function (e, t) {
                    o.append("upload[]", t)
                }), s.onreadystatechange = function () {
                    s.readyState == 4 && s.status == 0 && i.reject(["errConnect", "errAbort"])
                }, s.send(o);
                if (!e.browser.safari || !t.files) h = c();
                return i
            }
        },
        one: function (t, n) {
            var r = this,
                i = e.proxy(n, function (e) {
                    return setTimeout(function () {
                        r.unbind(e.type, i)
                    }, 3), n.apply(this, arguments)
                });
            return this.bind(t, i)
        },
        localStorage: function (e, t) {
            var n = window.localStorage;
            e = "elfinder-" + e + this.id;
            if (t === null) return console.log("remove", e), n.removeItem(e);
            if (t !== void 0) try {
                n.setItem(e, t)
            } catch (r) {
                n.clear(), n.setItem(e, t)
            }
            return n.getItem(e)
        },
        cookie: function (t, n) {
            var r, i, s, o;
            t = "elfinder-" + t + this.id;
            if (n === void 0) {
                if (document.cookie && document.cookie != "") {
                    s = document.cookie.split(";"), t += "=";
                    for (o = 0; o < s.length; o++) {
                        s[o] = e.trim(s[o]);
                        if (s[o].substring(0, t.length) == t) return decodeURIComponent(s[o].substring(t.length))
                    }
                }
                return ""
            }
            return i = e.extend({}, this.options.cookie), n === null && (n = "", i.expires = -1), typeof i.expires == "number" && (r = new Date, r.setTime(r.getTime() + i.expires * 864e5), i.expires = r), document.cookie = t + "=" + encodeURIComponent(n) + "; expires=" + i.expires.toUTCString() + (i.path ? "; path=" + i.path : "") + (i.domain ? "; domain=" + i.domain : "") + (i.secure ? "; secure" : ""), n
        },
        lastDir: function (e) {
            return this.options.rememberLastDir ? this.storage("lastdir", e) : ""
        },
        _node: e("<span/>"),
        escape: function (e) {
            return this._node.text(e).html()
        },
        normalize: function (t) {
            var n = function (e) {
                return e && e.hash && e.name && e.mime ? (e.mime == "application/x-empty" && (e.mime = "text/plain"), e) : null
            };
            return t.files && (t.files = e.map(t.files, n)), t.tree && (t.tree = e.map(t.tree, n)), t.added && (t.added = e.map(t.added, n)), t.changed && (t.changed = e.map(t.changed, n)), t.api && (t.init = !0), t
        },
        setSort: function (e, t, n) {
            this.storage("sortType", this.sortType = this.sortRules[e] ? e : "name"), this.storage("sortOrder", this.sortOrder = /asc|desc/.test(t) ? t : "asc"), this.storage("sortStickFolders", (this.sortStickFolders = !! n) ? 1 : ""), this.trigger("sortchange")
        },
        _sortRules: {
            name: function (e, t) {
                return e.name.toLowerCase().localeCompare(t.name.toLowerCase())
            },
            size: function (e, t) {
                var n = parseInt(e.size) || 0,
                    r = parseInt(t.size) || 0;
                return n == r ? 0 : n > r ? 1 : -1
            },
            kind: function (e, t) {
                return e.mime.localeCompare(t.mime)
            },
            date: function (e, t) {
                var n = e.ts || e.date,
                    r = t.ts || t.date;
                return n == r ? 0 : n > r ? 1 : -1
            }
        },
        compare: function (e, t) {
            var n = this,
                r = n.sortType,
                i = n.sortOrder == "asc",
                s = n.sortStickFolders,
                o = n.sortRules,
                u = o[r],
                a = e.mime == "directory",
                f = t.mime == "directory",
                l;
            if (s) {
                if (a && !f) return -1;
                if (!a && f) return 1
            }
            return l = i ? u(e, t) : u(t, e), r != "name" && l == 0 ? l = i ? o.name(e, t) : o.name(t, e) : l
        },
        sortFiles: function (e) {
            return e.sort(this.compare)
        },
        notify: function (t) {
            var n = t.type,
                r = this.messages["ntf" + n] ? this.i18n("ntf" + n) : this.i18n("ntfsmth"),
                i = this.ui.notify,
                s = i.children(".elfinder-notify-" + n),
                o = '<div class="elfinder-notify elfinder-notify-{type}"><span class="elfinder-dialog-icon elfinder-dialog-icon-{type}"/><span class="elfinder-notify-msg">{msg}</span> <span class="elfinder-notify-cnt"/><div class="elfinder-notify-progressbar"><div class="elfinder-notify-progress"/></div></div>',
                u = t.cnt,
                a = t.progress >= 0 && t.progress <= 100 ? t.progress : 0,
                f, l, c;
            return n ? (s.length || (s = e(o.replace(/\{type\}/g, n).replace(/\{msg\}/g, r)).appendTo(i).data("cnt", 0), a && s.data({
                progress: 0,
                total: 0
            })), f = u + parseInt(s.data("cnt")), f > 0 ? (!t.hideCnt && s.children(".elfinder-notify-cnt").text("(" + f + ")"), i.is(":hidden") && i.elfinderdialog("open"), s.data("cnt", f), a < 100 && (l = s.data("total")) >= 0 && (c = s.data("progress")) >= 0 && (l = u + parseInt(s.data("total")), c = a + c, a = parseInt(c / l), s.data({
                progress: c,
                total: l
            }), i.find(".elfinder-notify-progress").animate({
                width: (a < 100 ? a : 100) + "%"
            }, 20))) : (s.remove(), !i.children().length && i.elfinderdialog("close")), this) : this
        },
        confirm: function (t) {
            var n = !1,
                r = {
                    cssClass: "elfinder-dialog-confirm",
                    modal: !0,
                    resizable: !1,
                    title: this.i18n(t.title || "confirmReq"),
                    buttons: {},
                    close: function () {
                        !n && t.cancel.callback(), e(this).elfinderdialog("destroy")
                    }
                }, i = this.i18n("apllyAll"),
                s, o;
            return t.reject && (r.buttons[this.i18n(t.reject.label)] = function () {
                t.reject.callback( !! o && !! o.prop("checked")), n = !0, e(this).elfinderdialog("close")
            }), r.buttons[this.i18n(t.accept.label)] = function () {
                t.accept.callback( !! o && !! o.prop("checked")), n = !0, e(this).elfinderdialog("close")
            }, r.buttons[this.i18n(t.cancel.label)] = function () {
                e(this).elfinderdialog("close")
            }, t.all && (t.reject && (r.width = 370), r.create = function () {
                o = e('<input type="checkbox" />'), e(this).next().children().before(e("<label>" + i + "</label>").prepend(o))
            }, r.open = function () {
                var t = e(this).next(),
                    n = parseInt(t.children(":first").outerWidth() + t.children(":last").outerWidth());
                n > parseInt(t.width()) && e(this).closest(".elfinder-dialog").width(n + 30)
            }), this.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-confirm"/>' + this.i18n(t.text), r)
        },
        uniqueName: function (e, t) {
            var n = 0,
                r = "",
                i, s;
            e = this.i18n(e), t = t || this.cwd().hash, (i = e.indexOf(".txt")) != -1 && (r = ".txt", e = e.substr(0, i)), s = e + r;
            if (!this.fileByName(s, t)) return s;
            while (n < 1e4) {
                s = e + " " + ++n + r;
                if (!this.fileByName(s, t)) return s
            }
            return e + Math.random() + r
        },
        i18n: function () {
            var t = this,
                n = this.messages,
                r = [],
                i = [],
                s = function (e) {
                    var n;
                    if (e.indexOf("#") === 0) if (n = t.file(e.substr(1))) return n.name;
                    return e
                }, o, u, a;
            for (o = 0; o < arguments.length; o++) {
                a = arguments[o];
                if (typeof a == "string") r.push(s(a));
                else if (e.isArray(a)) for (u = 0; u < a.length; u++) typeof a[u] == "string" && r.push(s(a[u]))
            }
            for (o = 0; o < r.length; o++) {
                if (e.inArray(o, i) !== -1) continue;
                a = r[o], a = n[a] || a, a = a.replace(/\$(\d+)/g, function (e, t) {
                    return t = o + parseInt(t), t > 0 && r[t] && i.push(t), r[t] || ""
                }), r[o] = a
            }
            return e.map(r, function (t, n) {
                return e.inArray(n, i) === -1 ? t : null
            }).join("<br>")
        },
        mime2class: function (e) {
            var t = "elfinder-cwd-icon-";
            return e = e.split("/"), t + e[0] + (e[0] != "image" && e[1] ? " " + t + e[1].replace(/(\.|\+)/g, "-") : "")
        },
        mime2kind: function (e) {
            var t = typeof e == "object" ? e.mime : e,
                n;
            e.alias ? n = "Alias" : this.kinds[t] ? n = this.kinds[t] : t.indexOf("text") === 0 ? n = "Text" : t.indexOf("image") === 0 ? n = "Image" : t.indexOf("audio") === 0 ? n = "Audio" : t.indexOf("video") === 0 ? n = "Video" : t.indexOf("application") === 0 ? n = "App" : n = t;
            return this.messages["kind" + n] ? this.i18n("kind" + n) : t;
            var t, n
        },
        formatDate: function (e, t) {
            var n = this,
                t = t || e.ts,
                r = n.i18,
                i, s, o, u, a, f, l, c, h, p, d;
            return n.options.clientFormatDate && t > 0 ? (i = new Date(t * 1e3), c = i[n.getHours](), h = c > 12 ? c - 12 : c, p = i[n.getMinutes](), d = i[n.getSeconds](), u = i[n.getDate](), a = i[n.getDay](), f = i[n.getMonth]() + 1, l = i[n.getFullYear](), s = t >= this.yesterday ? this.fancyFormat : this.dateFormat, o = s.replace(/[a-z]/gi, function (e) {
                switch (e) {
                    case "d":
                        return u > 9 ? u : "0" + u;
                    case "j":
                        return u;
                    case "D":
                        return n.i18n(r.daysShort[a]);
                    case "l":
                        return n.i18n(r.days[a]);
                    case "m":
                        return f > 9 ? f : "0" + f;
                    case "n":
                        return f;
                    case "M":
                        return n.i18n(r.monthsShort[f - 1]);
                    case "F":
                        return n.i18n(r.months[f - 1]);
                    case "Y":
                        return l;
                    case "y":
                        return ("" + l).substr(2);
                    case "H":
                        return c > 9 ? c : "0" + c;
                    case "G":
                        return c;
                    case "g":
                        return h;
                    case "h":
                        return h > 9 ? h : "0" + h;
                    case "a":
                        return c > 12 ? "pm" : "am";
                    case "A":
                        return c > 12 ? "PM" : "AM";
                    case "i":
                        return p > 9 ? p : "0" + p;
                    case "s":
                        return d > 9 ? d : "0" + d
                }
                return e
            }), t >= this.yesterday ? o.replace("$1", this.i18n(t >= this.today ? "Today" : "Yesterday")) : o) : e.date ? e.date.replace(/([a-z]+)\s/i, function (e, t) {
                return n.i18n(t) + " "
            }) : n.i18n("dateUnknown")
        },
        perms2class: function (e) {
            var t = "";
            return !e.read && !e.write ? t = "elfinder-na" : e.read ? e.write || (t = "elfinder-ro") : t = "elfinder-wo", t
        },
        formatPermissions: function (e) {
            var t = [];
            return e.read && t.push(this.i18n("read")), e.write && t.push(this.i18n("write")), t.length ? t.join(" " + this.i18n("and") + " ") : this.i18n("noaccess")
        },
        formatSize: function (e) {
            var t = 1,
                n = "b";
            return e == "unknown" ? this.i18n("unknown") : (e > 1073741824 ? (t = 1073741824, n = "GB") : e > 1048576 ? (t = 1048576, n = "MB") : e > 1024 && (t = 1024, n = "KB"), e /= t, (e > 0 ? t >= 1048576 ? e.toFixed(2) : Math.round(e) : 0) + " " + n)
        },
        navHash2Id: function (e) {
            return "nav-" + e
        },
        navId2Hash: function (e) {
            return typeof e == "string" ? e.substr(4) : !1
        },
        log: function (e) {
            return window.console && window.console.log && window.console.log(e), this
        },
        debug: function (t, n) {
            var r = this.options.debug;
            return (r == "all" || r === !0 || e.isArray(r) && e.inArray(t, r) != -1) && window.console && window.console.log && window.console.log("elfinder debug: [" + t + "] [" + this.id + "]", n), this
        },
        time: function (e) {
            window.console && window.console.time && window.console.time(e)
        },
        timeEnd: function (e) {
            window.console && window.console.timeEnd && window.console.timeEnd(e)
        }
    }, elFinder.prototype.version = "2.0 rc1", e.fn.elfinder = function (e) {
        return e == "instance" ? this.getElFinder() : this.each(function () {
            var t = typeof e == "string" ? e : "";
            this.elfinder || new elFinder(this, typeof e == "object" ? e : {});
            switch (t) {
                case "close":
                case "hide":
                    this.elfinder.hide();
                    break;
                case "open":
                case "show":
                    this.elfinder.show();
                    break;
                case "destroy":
                    this.elfinder.destroy()
            }
        })
    }, e.fn.getElFinder = function () {
        var e;
        return this.each(function () {
            if (this.elfinder) return e = this.elfinder, !1
        }), e
    }, elFinder.prototype._options = {
        url: "",
        requestType: "get",
        transport: {},
        urlUpload: "",
        dragUploadAllow: "auto",
        iframeTimeout: 0,
        customData: {},
        handlers: {},
        lang: "en",
        cssClass: "",
        commands: ["open", "reload", "home", "up", "back", "forward", "getfile", "quicklook", "download", "rm", "duplicate", "rename", "mkdir", "mkfile", "upload", "copy", "cut", "paste", "edit", "extract", "archive", "search", "info", "view", "help", "resize", "sort", "netmount"],
        commandsOptions: {
            getfile: {
                onlyURL: !1,
                multiple: !1,
                folders: !1,
                oncomplete: ""
            },
            upload: {
                ui: "uploadbutton"
            },
            quicklook: {
                autoplay: !0,
                jplayer: "extensions/jplayer"
            },
            edit: {
                mimes: [],
                editors: []
            },
            help: {
                view: ["about", "shortcuts", "help"]
            }
        },
        getFileCallback: null,
        defaultView: "icons",
        ui: ["toolbar", "tree", "path", "stat"],
        uiOptions: {
            toolbar: [
                ["back", "forward"],
                ["netmount"],
                ["mkdir", "mkfile", "upload"],
                ["open", "download", "getfile"],
                ["info"],
                ["quicklook"],
                ["copy", "cut", "paste"],
                ["rm"],
                ["duplicate", "rename", "edit", "resize"],
                ["extract", "archive"],
                ["search"],
                ["view", "sort"],
                ["help"]
            ],
            tree: {
                openRootOnLoad: !0,
                syncTree: !0
            },
            navbar: {
                minWidth: 150,
                maxWidth: 500
            },
            cwd: {
                oldSchool: !1
            }
        },
        onlyMimes: [],
        sortRules: {},
        sortType: "name",
        sortOrder: "asc",
        sortStickFolders: !0,
        clientFormatDate: !0,
        UTCDate: !1,
        dateFormat: "",
        fancyDateFormat: "",
        width: "auto",
        height: 400,
        resizable: !0,
        notifyDelay: 500,
        allowShortcuts: !0,
        rememberLastDir: !0,
        showFiles: 30,
        showThreshold: 50,
        validName: !1,
        sync: 0,
        loadTmbs: 5,
        cookie: {
            expires: 30,
            domain: "",
            path: "/",
            secure: !1
        },
        contextmenu: {
            navbar: ["open", "|", "copy", "cut", "paste", "duplicate", "|", "rm", "|", "info"],
            cwd: ["reload", "back", "|", "upload", "mkdir", "mkfile", "paste", "|", "sort", "|", "info"],
            files: ["getfile", "|", "open", "quicklook", "|", "download", "|", "copy", "cut", "paste", "duplicate", "|", "rm", "|", "edit", "rename", "resize", "|", "archive", "extract", "|", "info"]
        },
        debug: ["error", "warning", "event-destroy"]
    }, elFinder.prototype.history = function (t) {
        var n = this,
            r = !0,
            i = [],
            s, o = function () {
                i = [t.cwd().hash], s = 0, r = !0
            }, u = function (u) {
                return u && n.canForward() || !u && n.canBack() ? (r = !1, t.exec("open", i[u ? ++s : --s]).fail(o)) : e.Deferred().reject()
            };
        this.canBack = function () {
            return s > 0
        }, this.canForward = function () {
            return s < i.length - 1
        }, this.back = u, this.forward = function () {
            return u(!0)
        }, t.open(function (e) {
            var n = i.length,
                o = t.cwd().hash;
            r && (s >= 0 && n > s + 1 && i.splice(s + 1), i[i.length - 1] != o && i.push(o), s = i.length - 1), r = !0
        }).reload(o)
    }, elFinder.prototype.command = function (t) {
        this.fm = t, this.name = "", this.title = "", this.state = -1, this.alwaysEnabled = !1, this._disabled = !1, this.disableOnSearch = !1, this.updateOnSelect = !0, this._handlers = {
            enable: function () {
                this.update(void 0, this.value)
            },
            disable: function () {
                this.update(-1, this.value)
            },
            "open reload load": function (e) {
                this._disabled = !this.alwaysEnabled && !this.fm.isCommandEnabled(this.name), this.update(void 0, this.value), this.change()
            }
        }, this.handlers = {}, this.shortcuts = [], this.options = {
            ui: "button"
        }, this.setup = function (t, n) {
            var r = this,
                i = this.fm,
                s, o;
            this.name = t, this.title = i.messages["cmd" + t] ? i.i18n("cmd" + t) : t, this.options = e.extend({}, this.options, n), this.listeners = [], this.updateOnSelect && (this._handlers.select = function () {
                this.update(void 0, this.value)
            }), e.each(e.extend({}, r._handlers, r.handlers), function (t, n) {
                i.bind(t, e.proxy(n, r))
            });
            for (s = 0; s < this.shortcuts.length; s++) o = this.shortcuts[s], o.callback = e.proxy(o.callback || function () {
                this.exec()
            }, this), !o.description && (o.description = this.title), i.shortcut(o);
            this.disableOnSearch && i.bind("search searchend", function (e) {
                r._disabled = e.type == "search", r.update(void 0, r.value)
            }), this.init()
        }, this.init = function () {}, this.exec = function (t, n) {
            return e.Deferred().reject()
        }, this.disabled = function () {
            return this.state < 0
        }, this.enabled = function () {
            return this.state > -1
        }, this.active = function () {
            return this.state > 0
        }, this.getstate = function () {
            return -1
        }, this.update = function (e, t) {
            var n = this.state,
                r = this.value;
            this._disabled ? this.state = -1 : this.state = e !== void 0 ? e : this.getstate(), this.value = t, (n != this.state || r != this.value) && this.change()
        }, this.change = function (e) {
            var t, n;
            if (typeof e == "function") this.listeners.push(e);
            else for (n = 0; n < this.listeners.length; n++) {
                t = this.listeners[n];
                try {
                    t(this.state, this.value)
                } catch (r) {
                    this.fm.debug("error", r)
                }
            }
            return this
        }, this.hashes = function (n) {
            return n ? e.map(e.isArray(n) ? n : [n], function (e) {
                return t.file(e) ? e : null
            }) : t.selected()
        }, this.files = function (t) {
            var n = this.fm;
            return t ? e.map(e.isArray(t) ? t : [t], function (e) {
                return n.file(e) || null
            }) : n.selectedFiles()
        }
    }, elFinder.prototype.resources = {
        "class": {
            hover: "ui-state-hover",
            active: "ui-state-active",
            disabled: "ui-state-disabled",
            draggable: "ui-draggable",
            droppable: "ui-droppable",
            adroppable: "elfinder-droppable-active",
            cwdfile: "elfinder-cwd-file",
            cwd: "elfinder-cwd",
            tree: "elfinder-tree",
            treeroot: "elfinder-navbar-root",
            navdir: "elfinder-navbar-dir",
            navdirwrap: "elfinder-navbar-dir-wrapper",
            navarrow: "elfinder-navbar-arrow",
            navsubtree: "elfinder-navbar-subtree",
            navcollapse: "elfinder-navbar-collapsed",
            navexpand: "elfinder-navbar-expanded",
            treedir: "elfinder-tree-dir",
            placedir: "elfinder-place-dir",
            searchbtn: "elfinder-button-search"
        },
        tpl: {
            perms: '<span class="elfinder-perms"/>',
            symlink: '<span class="elfinder-symlink"/>',
            navicon: '<span class="elfinder-nav-icon"/>',
            navspinner: '<span class="elfinder-navbar-spinner"/>',
            navdir: '<div class="elfinder-navbar-wrapper"><span id="{id}" class="ui-corner-all elfinder-navbar-dir {cssclass}"><span class="elfinder-navbar-arrow"/><span class="elfinder-navbar-icon"/>{symlink}{permissions}{name}</span><div class="elfinder-navbar-subtree"/></div>'
        },
        mimes: {
            text: ["application/x-empty", "application/javascript", "application/xhtml+xml", "audio/x-mp3-playlist", "application/x-web-config", "application/docbook+xml", "application/x-php", "application/x-perl", "application/x-awk", "application/x-config", "application/x-csh", "application/xml"]
        },
        mixin: {
            make: function () {
                var t = this.fm,
                    n = this.name,
                    r = t.getUI("cwd"),
                    i = e.Deferred().fail(function (e) {
                        e && t.error(e)
                    }).always(function () {
                        l.remove(), f.remove(), t.enable()
                    }),
                    s = "tmp_" + parseInt(Math.random() * 1e5),
                    o = t.cwd().hash,
                    u = new Date,
                    a = {
                        hash: s,
                        name: t.uniqueName(this.prefix),
                        mime: this.mime,
                        read: !0,
                        write: !0,
                        date: "Today " + u.getHours() + ":" + u.getMinutes()
                    }, f = r.trigger("create." + t.namespace, a).find("#" + s),
                    l = e('<input type="text"/>').keydown(function (t) {
                        t.stopImmediatePropagation(), t.keyCode == e.ui.keyCode.ESCAPE ? i.reject() : t.keyCode == e.ui.keyCode.ENTER && l.blur()
                    }).mousedown(function (e) {
                        e.stopPropagation()
                    }).blur(function () {
                        var r = e.trim(l.val()),
                            u = l.parent();
                        if (u.length) {
                            if (!r) return i.reject("errInvName");
                            if (t.fileByName(r, o)) return i.reject(["errExists", r]);
                            u.html(t.escape(r)), t.lockfiles({
                                files: [s]
                            }), t.request({
                                data: {
                                    cmd: n,
                                    name: r,
                                    target: o
                                },
                                notify: {
                                    type: n,
                                    cnt: 1
                                },
                                preventFail: !0,
                                syncOnFail: !0
                            }).fail(function (e) {
                                i.reject(e)
                            }).done(function (e) {
                                i.resolve(e)
                            })
                        }
                    });
                return this.disabled() || !f.length ? i.reject() : (t.disable(), f.find(".elfinder-cwd-filename").empty("").append(l.val(a.name)), l.select().focus(), i)
            }
        }
    }, e.fn.dialogelfinder = function (t) {
        var n = "elfinderPosition",
            r = "elfinderDestroyOnClose";
        this.not(".elfinder").each(function () {
            var i = e(document),
                s = e('<div class="ui-widget-header dialogelfinder-drag ui-corner-top">' + (t.title || "Files") + "</div>"),
                o = e('<a href="#" class="dialogelfinder-drag-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').appendTo(s).click(function (e) {
                    e.preventDefault(), u.dialogelfinder("close")
                }),
                u = e(this).addClass("dialogelfinder").css("position", "absolute").hide().appendTo("body").draggable({
                    handle: ".dialogelfinder-drag",
                    containment: "parent"
                }).elfinder(t).prepend(s),
                a = u.elfinder("instance");
            u.width(parseInt(u.width()) || 840).data(r, !! t.destroyOnClose).find(".elfinder-toolbar").removeClass("ui-corner-top"), t.position && u.data(n, t.position), t.autoOpen !== !1 && e(this).dialogelfinder("open")
        });
        if (t == "open") {
            var i = e(this),
                s = i.data(n) || {
                    top: parseInt(e(document).scrollTop() + (e(window).height() < i.height() ? 2 : (e(window).height() - i.height()) / 2)),
                    left: parseInt(e(document).scrollLeft() + (e(window).width() < i.width() ? 2 : (e(window).width() - i.width()) / 2))
                }, o = 100;
            i.is(":hidden") && (e("body").find(":visible").each(function () {
                var t = e(this),
                    n;
                this !== i[0] && t.css("position") == "absolute" && (n = parseInt(t.zIndex())) > o && (o = n + 1)
            }), i.zIndex(o).css(s).show().trigger("resize"), setTimeout(function () {
                i.trigger("resize").mousedown()
            }, 200))
        } else if (t == "close") {
            var i = e(this);
            i.is(":visible") && (i.data(r) ? i.elfinder("destroy").remove() : i.elfinder("close"))
        } else if (t == "instance") return e(this).getElFinder();
        return this
    }, elFinder && elFinder.prototype && typeof elFinder.prototype.i18 == "object" && (elFinder.prototype.i18.en = {
        translator: "Troex Nevelin &lt;troex@fury.scancode.ru&gt;",
        language: "English",
        direction: "ltr",
        dateFormat: "M d, Y h:i A",
        fancyDateFormat: "$1 h:i A",
        messages: {
            error: "Error",
            errUnknown: "Unknown error.",
            errUnknownCmd: "Unknown command.",
            errJqui: "Invalid jQuery UI configuration. Selectable, draggable and droppable components must be included.",
            errNode: "elFinder requires DOM Element to be created.",
            errURL: "Invalid elFinder configuration! URL option is not set.",
            errAccess: "Access denied.",
            errConnect: "Unable to connect to backend.",
            errAbort: "Connection aborted.",
            errTimeout: "Connection timeout.",
            errNotFound: "Backend not found.",
            errResponse: "Invalid backend response.",
            errConf: "Invalid backend configuration.",
            errJSON: "PHP JSON module not installed.",
            errNoVolumes: "Readable volumes not available.",
            errCmdParams: 'Invalid parameters for command "$1".',
            errDataNotJSON: "Data is not JSON.",
            errDataEmpty: "Data is empty.",
            errCmdReq: "Backend request requires command name.",
            errOpen: 'Unable to open "$1".',
            errNotFolder: "Object is not a folder.",
            errNotFile: "Object is not a file.",
            errRead: 'Unable to read "$1".',
            errWrite: 'Unable to write into "$1".',
            errPerm: "Permission denied.",
            errLocked: '"$1" is locked and can not be renamed, moved or removed.',
            errExists: 'File named "$1" already exists.',
            errInvName: "Invalid file name.",
            errFolderNotFound: "Folder not found.",
            errFileNotFound: "File not found.",
            errTrgFolderNotFound: 'Target folder "$1" not found.',
            errPopup: "Browser prevented opening popup window. To open file enable it in browser options.",
            errMkdir: 'Unable to create folder "$1".',
            errMkfile: 'Unable to create file "$1".',
            errRename: 'Unable to rename "$1".',
            errCopyFrom: 'Copying files from volume "$1" not allowed.',
            errCopyTo: 'Copying files to volume "$1" not allowed.',
            errUpload: "Upload error.",
            errUploadFile: 'Unable to upload "$1".',
            errUploadNoFiles: "No files found for upload.",
            errUploadTotalSize: "Data exceeds the maximum allowed size.",
            errUploadFileSize: "File exceeds maximum allowed size.",
            errUploadMime: "File type not allowed.",
            errUploadTransfer: '"$1" transfer error.',
            errNotReplace: 'Object "$1" already exists at this location and can not be replaced by object with another type.',
            errReplace: 'Unable to replace "$1".',
            errSave: 'Unable to save "$1".',
            errCopy: 'Unable to copy "$1".',
            errMove: 'Unable to move "$1".',
            errCopyInItself: 'Unable to copy "$1" into itself.',
            errRm: 'Unable to remove "$1".',
            errRmSrc: "Unable remove source file(s).",
            errExtract: 'Unable to extract files from "$1".',
            errArchive: "Unable to create archive.",
            errArcType: "Unsupported archive type.",
            errNoArchive: "File is not archive or has unsupported archive type.",
            errCmdNoSupport: "Backend does not support this command.",
            errReplByChild: "The folder $1 cant be replaced by an item it contains.",
            errArcSymlinks: "For security reason denied to unpack archives contains symlinks or files with not allowed names.",
            errArcMaxSize: "Archive files exceeds maximum allowed size.",
            errResize: 'Unable to resize "$1".',
            errUsupportType: "Unsupported file type.",
            errNotUTF8Content: 'File "$1" is not in UTF-8 and cannot be edited.',
            errNetMount: 'Unable to mount "$1".',
            errNetMountNoDriver: "Unsupported protocol.",
            errNetMountFailed: "Mount failed.",
            errNetMountHostReq: "Host required.",
            cmdarchive: "Create archive",
            cmdback: "Back",
            cmdcopy: "Copy",
            cmdcut: "Cut",
            cmddownload: "Download",
            cmdduplicate: "Duplicate",
            cmdedit: "Edit file",
            cmdextract: "Extract files from archive",
            cmdforward: "Forward",
            cmdgetfile: "Select files",
            cmdhelp: "About this software",
            cmdhome: "Home",
            cmdinfo: "Get info",
            cmdmkdir: "New folder",
            cmdmkfile: "New text file",
            cmdopen: "Open",
            cmdpaste: "Paste",
            cmdquicklook: "Preview",
            cmdreload: "Reload",
            cmdrename: "Rename",
            cmdrm: "Delete",
            cmdsearch: "Find files",
            cmdup: "Go to parent directory",
            cmdupload: "Upload files",
            cmdview: "View",
            cmdresize: "Resize & Rotate",
            cmdsort: "Sort",
            cmdnetmount: "Mount network volume",
            btnClose: "Close",
            btnSave: "Save",
            btnRm: "Remove",
            btnApply: "Apply",
            btnCancel: "Cancel",
            btnNo: "No",
            btnYes: "Yes",
            btnMount: "Mount",
            ntfopen: "Open folder",
            ntffile: "Open file",
            ntfreload: "Reload folder content",
            ntfmkdir: "Creating directory",
            ntfmkfile: "Creating files",
            ntfrm: "Delete files",
            ntfcopy: "Copy files",
            ntfmove: "Move files",
            ntfprepare: "Prepare to copy files",
            ntfrename: "Rename files",
            ntfupload: "Uploading files",
            ntfdownload: "Downloading files",
            ntfsave: "Save files",
            ntfarchive: "Creating archive",
            ntfextract: "Extracting files from archive",
            ntfsearch: "Searching files",
            ntfresize: "Resizing images",
            ntfsmth: "Doing something >_<",
            ntfloadimg: "Loading image",
            ntfnetmount: "Mounting network volume",
            dateUnknown: "unknown",
            Today: "Today",
            Yesterday: "Yesterday",
            Jan: "Jan",
            Feb: "Feb",
            Mar: "Mar",
            Apr: "Apr",
            May: "May",
            Jun: "Jun",
            Jul: "Jul",
            Aug: "Aug",
            Sep: "Sep",
            Oct: "Oct",
            Nov: "Nov",
            Dec: "Dec",
            sortname: "by name",
            sortkind: "by kind",
            sortsize: "by size",
            sortdate: "by date",
            sortFoldersFirst: "Folders first",
            confirmReq: "Confirmation required",
            confirmRm: "Are you sure you want to remove files?<br/>This cannot be undone!",
            confirmRepl: "Replace old file with new one?",
            apllyAll: "Apply to all",
            name: "Name",
            size: "Size",
            perms: "Permissions",
            modify: "Modified",
            kind: "Kind",
            read: "read",
            write: "write",
            noaccess: "no access",
            and: "and",
            unknown: "unknown",
            selectall: "Select all files",
            selectfiles: "Select file(s)",
            selectffile: "Select first file",
            selectlfile: "Select last file",
            viewlist: "List view",
            viewicons: "Icons view",
            places: "Places",
            calc: "Calculate",
            path: "Path",
            aliasfor: "Alias for",
            locked: "Locked",
            dim: "Dimensions",
            files: "Files",
            folders: "Folders",
            items: "Items",
            yes: "yes",
            no: "no",
            link: "Link",
            searcresult: "Search results",
            selected: "selected items",
            about: "About",
            shortcuts: "Shortcuts",
            help: "Help",
            webfm: "Web file manager",
            ver: "Version",
            protocolver: "protocol version",
            homepage: "Project home",
            docs: "Documentation",
            github: "Fork us on Github",
            twitter: "Follow us on twitter",
            facebook: "Join us on facebook",
            team: "Team",
            chiefdev: "chief developer",
            developer: "developer",
            contributor: "contributor",
            maintainer: "maintainer",
            translator: "translator",
            icons: "Icons",
            dontforget: "and don't forget to take your towel",
            shortcutsof: "Shortcuts disabled",
            dropFiles: "Drop files here",
            or: "or",
            selectForUpload: "Select files to upload",
            moveFiles: "Move files",
            copyFiles: "Copy files",
            rmFromPlaces: "Remove from places",
            aspectRatio: "Aspect ratio",
            scale: "Scale",
            width: "Width",
            height: "Height",
            resize: "Resize",
            crop: "Crop",
            rotate: "Rotate",
            "rotate-cw": "Rotate 90 degrees CW",
            "rotate-ccw": "Rotate 90 degrees CCW",
            degree: "°",
            netMountDialogTitle: "Mount network volume",
            protocol: "Protocol",
            host: "Host",
            port: "Port",
            user: "User",
            pass: "Password",
            kindUnknown: "Unknown",
            kindFolder: "Folder",
            kindAlias: "Alias",
            kindAliasBroken: "Broken alias",
            kindApp: "Application",
            kindPostscript: "Postscript document",
            kindMsOffice: "Microsoft Office document",
            kindMsWord: "Microsoft Word document",
            kindMsExcel: "Microsoft Excel document",
            kindMsPP: "Microsoft Powerpoint presentation",
            kindOO: "Open Office document",
            kindAppFlash: "Flash application",
            kindPDF: "Portable Document Format (PDF)",
            kindTorrent: "Bittorrent file",
            kind7z: "7z archive",
            kindTAR: "TAR archive",
            kindGZIP: "GZIP archive",
            kindBZIP: "BZIP archive",
            kindZIP: "ZIP archive",
            kindRAR: "RAR archive",
            kindJAR: "Java JAR file",
            kindTTF: "True Type font",
            kindOTF: "Open Type font",
            kindRPM: "RPM package",
            kindText: "Text document",
            kindTextPlain: "Plain text",
            kindPHP: "PHP source",
            kindCSS: "Cascading style sheet",
            kindHTML: "HTML document",
            kindJS: "Javascript source",
            kindRTF: "Rich Text Format",
            kindC: "C source",
            kindCHeader: "C header source",
            kindCPP: "C++ source",
            kindCPPHeader: "C++ header source",
            kindShell: "Unix shell script",
            kindPython: "Python source",
            kindJava: "Java source",
            kindRuby: "Ruby source",
            kindPerl: "Perl script",
            kindSQL: "SQL source",
            kindXML: "XML document",
            kindAWK: "AWK source",
            kindCSV: "Comma separated values",
            kindDOCBOOK: "Docbook XML document",
            kindImage: "Image",
            kindBMP: "BMP image",
            kindJPEG: "JPEG image",
            kindGIF: "GIF Image",
            kindPNG: "PNG Image",
            kindTIFF: "TIFF image",
            kindTGA: "TGA image",
            kindPSD: "Adobe Photoshop image",
            kindXBITMAP: "X bitmap image",
            kindPXM: "Pixelmator image",
            kindAudio: "Audio media",
            kindAudioMPEG: "MPEG audio",
            kindAudioMPEG4: "MPEG-4 audio",
            kindAudioMIDI: "MIDI audio",
            kindAudioOGG: "Ogg Vorbis audio",
            kindAudioWAV: "WAV audio",
            AudioPlaylist: "MP3 playlist",
            kindVideo: "Video media",
            kindVideoDV: "DV movie",
            kindVideoMPEG: "MPEG movie",
            kindVideoMPEG4: "MPEG-4 movie",
            kindVideoAVI: "AVI movie",
            kindVideoMOV: "Quick Time movie",
            kindVideoWM: "Windows Media movie",
            kindVideoFlash: "Flash movie",
            kindVideoMKV: "Matroska movie",
            kindVideoOGG: "Ogg movie"
        }
    }), e.fn.elfinderbutton = function (t) {
        return this.each(function () {
            var n = "class",
                r = t.fm,
                i = r.res(n, "disabled"),
                s = r.res(n, "active"),
                o = r.res(n, "hover"),
                u = "elfinder-button-menu-item",
                a = "elfinder-button-menu-item-selected",
                f, l = e(this).addClass("ui-state-default elfinder-button").attr("title", t.title).append('<span class="elfinder-button-icon elfinder-button-icon-' + t.name + '"/>').hover(function (e) {
                    !l.is("." + i) && l[e.type == "mouseleave" ? "removeClass" : "addClass"](o)
                }).click(function (e) {
                    l.is("." + i) || (f && t.variants.length > 1 ? (f.is(":hidden") && t.fm.getUI().click(), e.stopPropagation(), f.slideToggle(100)) : t.exec())
                }),
                c = function () {
                    f.hide()
                };
            e.isArray(t.variants) && (l.addClass("elfinder-menubutton"), f = e('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(l).zIndex(12 + l.zIndex()).delegate("." + u, "hover", function () {
                e(this).toggleClass(o)
            }).delegate("." + u, "click", function (n) {
                n.preventDefault(), n.stopPropagation(), l.removeClass(o), t.exec(t.fm.selected(), e(this).data("value"))
            }), t.fm.bind("disable select", c).getUI().click(c), t.change(function () {
                f.html(""), e.each(t.variants, function (n, r) {
                    f.append(e('<div class="' + u + '">' + r[1] + "</div>").data("value", r[0]).addClass(r[0] == t.value ? a : ""))
                })
            })), t.change(function () {
                t.disabled() ? l.removeClass(s + " " + o).addClass(i) : (l.removeClass(i), l[t.active() ? "addClass" : "removeClass"](s))
            }).change()
        })
    }, e.fn.elfindercontextmenu = function (t) {
        return this.each(function () {
            var n = e(this).addClass("ui-helper-reset ui-widget ui-state-default ui-corner-all elfinder-contextmenu elfinder-contextmenu-" + t.direction).hide().appendTo("body").delegate(".elfinder-contextmenu-item", "hover", function () {
                e(this).toggleClass("ui-state-hover")
            }),
                r = t.direction == "ltr" ? "left" : "right",
                i = e.extend({}, t.options.contextmenu),
                s = '<div class="elfinder-contextmenu-item"><span class="elfinder-button-icon {icon} elfinder-contextmenu-icon"/><span>{label}</span></div>',
                o = function (t, n, r) {
                    return e(s.replace("{icon}", n ? "elfinder-button-icon-" + n : "").replace("{label}", t)).click(function (e) {
                        e.stopPropagation(), e.stopPropagation(), r()
                    })
                }, u = function (i, s) {
                    var o = e(window),
                        u = n.outerWidth(),
                        a = n.outerHeight(),
                        f = o.width(),
                        l = o.height(),
                        c = o.scrollTop(),
                        h = o.scrollLeft(),
                        p = {
                            top: (s + a < l ? s : s - a > 0 ? s - a : s) + c,
                            left: (i + u < f ? i : i - u) + h,
                            "z-index": 100 + t.getUI("workzone").zIndex()
                        };
                    n.css(p).show(), p = {
                        "z-index": p["z-index"] + 10
                    }, p[r] = parseInt(n.width()), n.find(".elfinder-contextmenu-sub").css(p)
                }, a = function () {
                    n.hide().empty()
                }, f = function (r, s) {
                    var u = !1;
                    e.each(i[r] || [], function (r, i) {
                        var f, l, c;
                        if (i == "|" && u) {
                            n.append('<div class="elfinder-contextmenu-separator"/>'), u = !1;
                            return
                        }
                        f = t.command(i);
                        if (f && f.getstate(s) != -1) {
                            if (f.variants) {
                                if (!f.variants.length) return;
                                l = o(f.title, f.name, function () {}), c = e('<div class="ui-corner-all elfinder-contextmenu-sub"/>').appendTo(l.append('<span class="elfinder-contextmenu-arrow"/>')), l.addClass("elfinder-contextmenu-group").hover(function () {
                                    c.toggle()
                                }), e.each(f.variants, function (t, n) {
                                    c.append(e('<div class="elfinder-contextmenu-item"><span>' + n[1] + "</span></div>").click(function (e) {
                                        e.stopPropagation(), a(), f.exec(s, n[0])
                                    }))
                                })
                            } else l = o(f.title, f.name, function () {
                                a(), f.exec(s)
                            });
                            n.append(l), u = !0
                        }
                    })
                }, l = function (t) {
                    e.each(t, function (e, t) {
                        var r;
                        t.label && typeof t.callback == "function" && (r = o(t.label, t.icon, function () {
                            a(), t.callback()
                        }), n.append(r))
                    })
                };
            t.one("load", function () {
                t.bind("contextmenu", function (e) {
                    var t = e.data;
                    a(), t.type && t.targets ? f(t.type, t.targets) : t.raw && l(t.raw), n.children().length && u(t.x, t.y)
                }).one("destroy", function () {
                    n.remove()
                }).bind("disable select", a).getUI().click(a)
            })
        })
    }, e.fn.elfindercwd = function (t, n) {
        return this.not(".elfinder-cwd").each(function () {
            var r = t.viewType == "list",
                i = "undefined",
                s = "select." + t.namespace,
                o = "unselect." + t.namespace,
                u = "disable." + t.namespace,
                a = "enable." + t.namespace,
                f = "class",
                l = t.res(f, "cwdfile"),
                c = "." + l,
                h = "ui-selected",
                p = t.res(f, "disabled"),
                d = t.res(f, "draggable"),
                v = t.res(f, "droppable"),
                m = t.res(f, "hover"),
                g = t.res(f, "adroppable"),
                y = l + "-tmp",
                b = t.options.loadTmbs > 0 ? t.options.loadTmbs : 5,
                w = "",
                E = [],
                S = {
                    icon: '<div id="{hash}" class="' + l + ' {permsclass} {dirclass} ui-corner-all" title="{tooltip}"><div class="elfinder-cwd-file-wrapper ui-corner-all"><div class="elfinder-cwd-icon {mime} ui-corner-all" unselectable="on" {style}/>{marker}</div><div class="elfinder-cwd-filename" title="{name}">{name}</div></div>',
                    row: '<tr id="{hash}" class="' + l + ' {permsclass} {dirclass}" title="{tooltip}"><td><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon {mime}"/>{marker}<span class="elfinder-cwd-filename">{name}</span></div></td><td>{perms}</td><td>{date}</td><td>{size}</td><td>{kind}</td></tr>'
                }, x = t.res("tpl", "perms"),
                T = t.res("tpl", "symlink"),
                N = {
                    permsclass: function (e) {
                        return t.perms2class(e)
                    },
                    perms: function (e) {
                        return t.formatPermissions(e)
                    },
                    dirclass: function (e) {
                        return e.mime == "directory" ? "directory" : ""
                    },
                    mime: function (e) {
                        return t.mime2class(e.mime)
                    },
                    size: function (e) {
                        return t.formatSize(e.size)
                    },
                    date: function (e) {
                        return t.formatDate(e)
                    },
                    kind: function (
                    e) {
                        return t.mime2kind(e)
                    },
                    marker: function (e) {
                        return (e.alias || e.mime == "symlink-broken" ? T : "") + (!e.read || !e.write ? x : "")
                    },
                    tooltip: function (e) {
                        var n = t.formatDate(e) + (e.size > 0 ? " (" + t.formatSize(e.size) + ")" : "");
                        return e.tooltip ? t.escape(e.tooltip).replace(/"/g, "&quot;").replace(/\r/g, "&#13;") + "&#13;" + n : n
                    }
                }, C = function (e) {
                    return e.name = t.escape(e.name), S[r ? "row" : "icon"].replace(/\{([a-z]+)\}/g, function (t, n) {
                        return N[n] ? N[n](e) : e[n] ? e[n] : ""
                    })
                }, k = !1,
                L = function (t, n) {
                    function g(e, t) {
                        return e[t + "All"]("[id]:not(." + p + "):not(.elfinder-cwd-parent):first")
                    }
                    var i = e.ui.keyCode,
                        u = t == i.LEFT || t == i.UP,
                        a = V.find("[id]." + h),
                        f = u ? "first:" : "last",
                        l, c, d, v, m;
                    if (a.length) {
                        l = a.filter(u ? ":first" : ":last"), d = g(l, u ? "prev" : "next");
                        if (!d.length) c = l;
                        else if (r || t == i.LEFT || t == i.RIGHT) c = d;
                        else {
                            v = l.position().top, m = l.position().left, c = l;
                            if (u) {
                                do c = c.prev("[id]");
                                while (c.length && !(c.position().top < v && c.position().left <= m));
                                c.is("." + p) && (c = g(c, "next"))
                            } else {
                                do c = c.next("[id]");
                                while (c.length && !(c.position().top > v && c.position().left >= m));
                                c.is("." + p) && (c = g(c, "prev")), c.length || (d = V.find("[id]:not(." + p + "):last"), d.position().top > v && (c = d))
                            }
                        }
                    } else c = V.find("[id]:not(." + p + "):not(.elfinder-cwd-parent):" + (u ? "last" : "first"));
                    c && c.length && !c.is(".elfinder-cwd-parent") && (n ? c = l.add(l[u ? "prevUntil" : "nextUntil"]("#" + c.attr("id"))).add(c) : a.trigger(o), c.trigger(s), D(c.filter(u ? ":first" : ":last")), _())
                }, A = function (e) {
                    V.find("#" + e).trigger(s)
                }, O = function () {
                    V.find("[id]." + h).trigger(o)
                }, M = function () {
                    return e.map(V.find("[id]." + h), function (t) {
                        return t = e(t), t.is("." + p) ? null : e(t).attr("id")
                    })
                }, _ = function () {
                    t.trigger("select", {
                        selected: M()
                    })
                }, D = function (e) {
                    var t = e.position().top,
                        n = e.outerHeight(!0),
                        r = J.scrollTop(),
                        i = J.innerHeight();
                    t + n > r + i ? J.scrollTop(parseInt(t + n - i)) : t < r && J.scrollTop(t)
                }, P = [],
                H = function (e) {
                    var t = P.length;
                    while (t--) if (P[t].hash == e) return t;
                    return -1
                }, B = "scroll." + t.namespace,
                j = function () {
                    var n = [],
                        i = !1,
                        s = [],
                        o = {}, u = V.find("[id]:last"),
                        a = !u.length,
                        f = r ? V.children("table").children("tbody") : V,
                        l;
                    if (!P.length) return J.unbind(B);
                    while ((!u.length || u.position().top <= J.height() + J.scrollTop() + t.options.showThreshold) && (l = P.splice(0, t.options.showFiles)).length) n = e.map(l, function (e) {
                        return e.hash && e.name ? (e.mime == "directory" && (i = !0), e.tmb && (e.tmb === 1 ? s.push(e.hash) : o[e.hash] = e.tmb), C(e)) : null
                    }), f.append(n.join("")), u = V.find("[id]:last"), a && V.scrollTop(0);
                    q(o), s.length && R(s), i && I()
                }, F = e.extend({}, t.droppable, {
                    over: function (n, r) {
                        var i = t.cwd().hash;
                        e.each(r.helper.data("files"), function (e, n) {
                            if (t.file(n).phash == i) return V.removeClass(g), !1
                        })
                    }
                }),
                I = function () {
                    setTimeout(function () {
                        V.find(".directory:not(." + v + ",.elfinder-na,.elfinder-ro)").droppable(t.droppable)
                    }, 20)
                }, q = function (n) {
                    var r = t.option("tmbUrl"),
                        i = !0,
                        s;
                    return e.each(n, function (t, n) {
                        var o = V.find("#" + t);
                        o.length ? function (t, n) {
                            e("<img/>").load(function () {
                                t.find(".elfinder-cwd-icon").css("background", "url('" + n + "') center center no-repeat")
                            }).attr("src", n)
                        }(o, r + n) : (i = !1, (s = H(t)) != -1 && (P[s].tmb = n))
                    }), i
                }, R = function (e) {
                    var n = [];
                    if (t.oldAPI) {
                        t.request({
                            data: {
                                cmd: "tmb",
                                current: t.cwd().hash
                            },
                            preventFail: !0
                        }).done(function (e) {
                            q(e.images || []) && e.tmb && R()
                        });
                        return
                    }
                    n = n = e.splice(0, b), n.length && t.request({
                        data: {
                            cmd: "tmb",
                            targets: n
                        },
                        preventFail: !0
                    }).done(function (t) {
                        q(t.images || []) && R(e)
                    })
                }, U = function (e) {
                    var n = r ? V.find("tbody") : V,
                        i = e.length,
                        s = [],
                        o = {}, u = !1,
                        a = function (e) {
                            var n = V.find("[id]:first"),
                                r;
                            while (n.length) {
                                r = t.file(n.attr("id"));
                                if (!n.is(".elfinder-cwd-parent") && r && t.compare(e, r) < 0) return n;
                                n = n.next("[id]")
                            }
                        }, f = function (e) {
                            var n = P.length,
                                r;
                            for (r = 0; r < n; r++) if (t.compare(e, P[r]) < 0) return r;
                            return n || -1
                        }, l, c, h, p;
                    while (i--) {
                        l = e[i], c = l.hash;
                        if (V.find("#" + c).length) continue;
                        (h = a(l)) && h.length ? h.before(C(l)) : (p = f(l)) >= 0 ? P.splice(p, 0, l) : n.append(C(l)), V.find("#" + c).length && (l.mime == "directory" ? u = !0 : l.tmb && (l.tmb === 1 ? s.push(c) : o[c] = l.tmb))
                    }
                    q(o), s.length && R(s), u && I()
                }, z = function (e) {
                    var n = e.length,
                        r, i, s;
                    while (n--) {
                        r = e[n];
                        if ((i = V.find("#" + r)).length) try {
                            i.detach()
                        } catch (o) {
                            t.debug("error", o)
                        } else(s = H(r)) != -1 && P.splice(s, 1)
                    }
                }, W = {
                    name: t.i18n("name"),
                    perm: t.i18n("perms"),
                    mod: t.i18n("modify"),
                    size: t.i18n("size"),
                    kind: t.i18n("kind")
                }, X = function (i, s) {
                    var o = t.cwd().hash;
                    try {
                        V.children("table," + c).remove()
                    } catch (u) {
                        V.html("")
                    }
                    V.removeClass("elfinder-cwd-view-icons elfinder-cwd-view-list").addClass("elfinder-cwd-view-" + (r ? "list" : "icons")), J[r ? "addClass" : "removeClass"]("elfinder-cwd-wrapper-list"), r && V.html('<table><thead><tr class="ui-state-default"><td >' + W.name + "</td><td>" + W.perm + "</td><td>" + W.mod + "</td><td>" + W.size + "</td><td>" + W.kind + "</td></tr></thead><tbody/></table>"), P = e.map(i, function (e) {
                        return s || e.phash == o ? e : null
                    }), P = t.sortFiles(P), J.bind(B, j).trigger(B), _(), o = t.cwd().phash;
                    if (n.oldSchool && o && !w) {
                        var a = e.extend(!0, {}, t.file(o), {
                            name: "..",
                            mime: "directory"
                        });
                        a = e(C(a)).addClass("elfinder-cwd-parent").bind("mousedown click mouseup dblclick mouseenter", function (e) {
                            e.preventDefault(), e.stopPropagation()
                        }).dblclick(function () {
                            t.exec("open", this.id)
                        }), (r ? V.find("tbody") : V).prepend(a)
                    }
                }, V = e(this).addClass("ui-helper-clearfix elfinder-cwd").attr("unselectable", "on").delegate(c, "click." + t.namespace, function (t) {
                    var n = this.id ? e(this) : e(this).parents("[id]:first"),
                        r = n.prevAll("." + h + ":first"),
                        i = n.nextAll("." + h + ":first"),
                        u = r.length,
                        a = i.length,
                        f;
                    t.stopImmediatePropagation(), t.shiftKey && (u || a) ? (f = u ? n.prevUntil("#" + r.attr("id")) : n.nextUntil("#" + i.attr("id")), f.add(n).trigger(s)) : t.ctrlKey || t.metaKey ? n.trigger(n.is("." + h) ? o : s) : (V.find("[id]." + h).trigger(o), n.trigger(s)), _()
                }).delegate(c, "dblclick." + t.namespace, function (e) {
                    t.dblclick({
                        file: this.id
                    })
                }).delegate(c, "mouseenter." + t.namespace, function (n) {
                    var i = e(this),
                        s = r ? i : i.children();
                    !i.is("." + y) && !s.is("." + d + ",." + p) && s.draggable(t.draggable)
                }).delegate(c, s, function (t) {
                    var n = e(this);
                    !k && !n.is("." + p) && n.addClass(h).children().addClass(m)
                }).delegate(c, o, function (t) {
                    !k && e(this).removeClass(h).children().removeClass(m)
                }).delegate(c, u, function () {
                    var t = e(this).removeClass(h).addClass(p),
                        n = (r ? t : t.children()).removeClass(m);
                    t.is("." + v) && t.droppable("disable"), n.is("." + d) && n.draggable("disable"), !r && n.removeClass(p)
                }).delegate(c, a, function () {
                    var t = e(this).removeClass(p),
                        n = r ? t : t.children();
                    t.is("." + v) && t.droppable("enable"), n.is("." + d) && n.draggable("enable")
                }).delegate(c, "scrolltoview", function () {
                    D(e(this))
                }).delegate(c, "hover", function (n) {
                    t.trigger("hover", {
                        hash: e(this).attr("id"),
                        type: n.type
                    })
                }).bind("contextmenu." + t.namespace, function (n) {
                    var r = e(n.target).closest("." + l);
                    r.length && (n.stopPropagation(), n.preventDefault(), r.is("." + p) || (r.is("." + h) || (V.trigger("unselectall"), r.trigger(s), _()), t.trigger("contextmenu", {
                        type: "files",
                        targets: t.selected(),
                        x: n.clientX,
                        y: n.clientY
                    })))
                }).selectable({
                    filter: c,
                    stop: _,
                    selected: function (t, n) {
                        e(n.selected).trigger(s)
                    },
                    unselected: function (t, n) {
                        e(n.unselected).trigger(o)
                    }
                }).droppable(F).bind("create." + t.namespace, function (t, n) {
                    var i = r ? V.find("tbody") : V,
                        s = i.find(".elfinder-cwd-parent"),
                        n = e(C(n)).addClass(y);
                    V.trigger("unselectall"), s.length ? s.after(n) : i.prepend(n), V.scrollTop(0)
                }).bind("unselectall", function () {
                    V.find("[id]." + h + "").trigger(o), _()
                }).bind("selectfile", function (e, t) {
                    V.find("#" + t).trigger(s), _()
                }),
                J = e('<div class="elfinder-cwd-wrapper"/>').bind("contextmenu", function (e) {
                    e.preventDefault(), t.trigger("contextmenu", {
                        type: "cwd",
                        targets: [t.cwd().hash],
                        x: e.clientX,
                        y: e.clientY
                    })
                }),
                K = function () {
                    var t = 0;
                    J.siblings(".elfinder-panel:visible").each(function () {
                        t += e(this).outerHeight(!0)
                    }), J.height(G.height() - t)
                }, Q = e(this).parent().resize(K),
                G = Q.children(".elfinder-workzone").append(J.append(this));
            t.dragUpload && (J[0].addEventListener("dragenter", function (e) {
                e.preventDefault(), e.stopPropagation(), J.addClass(g)
            }, !1), J[0].addEventListener("dragleave", function (e) {
                e.preventDefault(), e.stopPropagation(), e.target == V[0] && J.removeClass(g)
            }, !1), J[0].addEventListener("dragover", function (e) {
                e.preventDefault(), e.stopPropagation()
            }, !1), J[0].addEventListener("drop", function (e) {
                e.preventDefault(), J.removeClass(g), e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length && t.exec("upload", {
                    files: e.dataTransfer.files
                })
            }, !1)), t.bind("open", function (e) {
                X(e.data.files)
            }).bind("search", function (e) {
                E = e.data.files, X(E, !0)
            }).bind("searchend", function () {
                E = [], w && (w = "", X(t.files()))
            }).bind("searchstart", function (e) {
                w = e.data.query
            }).bind("sortchange", function () {
                X(w ? E : t.files(), !! w)
            }).bind("viewchange", function () {
                var n = t.selected(),
                    i = t.storage("view") == "list";
                i != r && (r = i, X(t.files()), e.each(n, function (e, t) {
                    A(t)
                }), _()), K()
            }).add(function (n) {
                var r = t.cwd().hash,
                    i = w ? e.map(n.data.added || [], function (e) {
                        return e.name.indexOf(w) === -1 ? null : e
                    }) : e.map(n.data.added || [], function (e) {
                        return e.phash == r ? e : null
                    });
                U(i)
            }).change(function (n) {
                var r = t.cwd().hash,
                    i = t.selected(),
                    s;
                w ? e.each(n.data.changed || [], function (t, n) {
                    z([n.hash]), n.name.indexOf(w) !== -1 && (U([n]), e.inArray(n.hash, i) !== -1 && A(n.hash))
                }) : e.each(e.map(n.data.changed || [], function (e) {
                    return e.phash == r ? e : null
                }), function (t, n) {
                    z([n.hash]), U([n]), e.inArray(n.hash, i) !== -1 && A(n.hash)
                }), _()
            }).remove(function (e) {
                z(e.data.removed || []), _()
            }).bind("open add search searchend", function () {
                V.css("height", "auto"), V.outerHeight(!0) < J.height() && V.height(J.height() - (V.outerHeight(!0) - V.height()) - 2)
            }).dragstart(function (t) {
                var n = e(t.data.target),
                    r = t.data.originalEvent;
                n.is(c) && (n.is("." + h) || (!(r.ctrlKey || r.metaKey || r.shiftKey) && O(), n.trigger(s), _()), V.droppable("disable")), V.selectable("disable").removeClass(p), k = !0
            }).dragstop(function () {
                V.selectable("enable"), k = !1
            }).bind("lockfiles unlockfiles", function (e) {
                var t = e.type == "lockfiles" ? u : a,
                    n = e.data.files || [],
                    r = n.length;
                while (r--) V.find("#" + n[r]).trigger(t);
                _()
            }).bind("mkdir mkfile duplicate upload rename archive extract", function (n) {
                var r = t.cwd().hash,
                    i;
                V.trigger("unselectall"), e.each(n.data.added || [], function (e, t) {
                    t && t.phash == r && A(t.hash)
                }), _()
            }).shortcut({
                pattern: "ctrl+a",
                description: "selectall",
                callback: function () {
                    var n = [],
                        r;
                    V.find("[id]:not(." + h + "):not(.elfinder-cwd-parent)").trigger(s), P.length ? (r = t.cwd().hash, t.select({
                        selected: e.map(t.files(), function (e) {
                            return e.phash == r ? e.hash : null
                        })
                    })) : _()
                }
            }).shortcut({
                pattern: "left right up down shift+left shift+right shift+up shift+down",
                description: "selectfiles",
                type: "keydown",
                callback: function (e) {
                    L(e.keyCode, e.shiftKey)
                }
            }).shortcut({
                pattern: "home",
                description: "selectffile",
                callback: function (e) {
                    O(), D(V.find("[id]:first").trigger(s)), _()
                }
            }).shortcut({
                pattern: "end",
                description: "selectlfile",
                callback: function (e) {
                    O(), D(V.find("[id]:last").trigger(s)), _()
                }
            })
        }), this
    }, e.fn.elfinderdialog = function (t) {
        var n;
        return typeof t == "string" && (n = this.closest(".ui-dialog")).length && (t == "open" ? n.css("display") == "none" && n.fadeIn(120, function () {
            n.trigger("open")
        }) : t == "close" ? n.css("display") != "none" && n.hide().trigger("close") : t == "destroy" ? n.hide().remove() : t == "toTop" && n.trigger("totop")), t = e.extend({}, e.fn.elfinderdialog.defaults, t), this.filter(":not(.ui-dialog-content)").each(function () {
            var n = e(this).addClass("ui-dialog-content ui-widget-content"),
                r = n.parent(),
                i = "elfinder-dialog-active",
                s = "elfinder-dialog",
                o = "elfinder-dialog-notify",
                u = "ui-state-hover",
                a = parseInt(Math.random() * 1e6),
                f = r.children(".elfinder-overlay"),
                l = e('<div class="ui-dialog-buttonset"/>'),
                c = e('<div class=" ui-helper-clearfix ui-dialog-buttonpane ui-widget-content"/>').append(l),
                h = e('<div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable std42-dialog  ' + s + " " + t.cssClass + '"/>').hide().append(n).appendTo(r).draggable({
                    handle: ".ui-dialog-titlebar",
                    containment: e("body")
                }).css({
                    width: t.width,
                    height: t.height
                }).mousedown(function (t) {
                    t.stopPropagation(), e(document).mousedown(), h.is("." + i) || (r.find("." + s + ":visible").removeClass(i), h.addClass(i).zIndex(p() + 1))
                }).bind("open", function () {
                    t.modal && f.elfinderoverlay("show"), h.trigger("totop"), typeof t.open == "function" && e.proxy(t.open, n[0])(), h.is("." + o) || r.find("." + s + ":visible").not("." + o).each(function () {
                        var t = e(this),
                            n = parseInt(t.css("top")),
                            r = parseInt(t.css("left")),
                            i = parseInt(h.css("top")),
                            s = parseInt(h.css("left"));
                        t[0] != h[0] && (n == i || r == s) && h.css({
                            top: n + 10 + "px",
                            left: r + 10 + "px"
                        })
                    })
                }).bind("close", function () {
                    var i = r.find(".elfinder-dialog:visible"),
                        s = p();
                    t.modal && f.elfinderoverlay("hide"), i.length ? i.each(function () {
                        var t = e(this);
                        if (t.zIndex() >= s) return t.trigger("totop"), !1
                    }) : setTimeout(function () {
                        r.mousedown().click()
                    }, 10), typeof t.close == "function" ? e.proxy(t.close, n[0])() : t.destroyOnClose && h.hide().remove()
                }).bind("totop", function () {
                    e(this).mousedown().find(".ui-button:first").focus().end().find(":text:first").focus()
                }),
                p = function () {
                    var t = r.zIndex() + 10;
                    return r.find("." + s + ":visible").each(function () {
                        var n;
                        this != h[0] && (n = e(this).zIndex(), n > t && (t = n))
                    }), t
                }, d;
            t.position || (d = parseInt((r.height() - h.outerHeight()) / 2 - 42), t.position = {
                top: (d > 0 ? d : 0) + "px",
                left: parseInt((r.width() - h.outerWidth()) / 2) + "px"
            }), h.css(t.position), t.closeOnEscape && e(document).bind("keyup." + a, function (t) {
                t.keyCode == e.ui.keyCode.ESCAPE && h.is("." + i) && (n.elfinderdialog("close"), e(document).unbind("keyup." + a))
            }), h.prepend(e('<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">' + t.title + "</div>").prepend(e('<a href="#" class="ui-dialog-titlebar-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').mousedown(function (e) {
                e.preventDefault(), n.elfinderdialog("close")
            }))), e.each(t.buttons, function (t, r) {
                var i = e('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">' + t + "</span></button>").click(e.proxy(r, n[0])).hover(function (t) {
                    e(this)[t.type == "mouseenter" ? "focus" : "blur"]()
                }).focus(function () {
                    e(this).addClass(u)
                }).blur(function () {
                    e(this).removeClass(u)
                }).keydown(function (t) {
                    var n;
                    t.keyCode == e.ui.keyCode.ENTER ? e(this).click() : t.keyCode == e.ui.keyCode.TAB && (n = e(this).next(".ui-button"), n.length ? n.focus() : e(this).parent().children(".ui-button:first").focus())
                });
                l.append(i)
            }), l.children().length && h.append(c), t.resizable && e.fn.resizable && h.resizable({
                minWidth: t.minWidth,
                minHeight: t.minHeight,
                alsoResize: this
            }), typeof t.create == "function" && e.proxy(t.create, this)(), t.autoOpen && n.elfinderdialog("open")
        }), this
    }, e.fn.elfinderdialog.defaults = {
        cssClass: "",
        title: "",
        modal: !1,
        resizable: !0,
        autoOpen: !0,
        closeOnEscape: !0,
        destroyOnClose: !1,
        buttons: {},
        position: null,
        width: 320,
        height: "auto",
        minWidth: 200,
        minHeight: 110
    }, e.fn.elfindernavbar = function (t, n) {
        return this.not(".elfinder-navbar").each(function () {
            var r = e(this).addClass("ui-state-default elfinder-navbar"),
                i = r.parent().resize(function () {
                    r.height(s.height() - o)
                }),
                s = i.children(".elfinder-workzone").append(r),
                o = r.outerHeight() - r.height(),
                u = t.direction == "ltr",
                a;
            e.fn.resizable && (a = r.resizable({
                handles: u ? "e" : "w",
                minWidth: n.minWidth || 150,
                maxWidth: n.maxWidth || 500
            }).bind("resize scroll", function () {
                a.css({
                    top: parseInt(r.scrollTop()) + "px",
                    left: parseInt(u ? r.width() + r.scrollLeft() - a.width() - 2 : r.scrollLeft() + 2)
                })
            }).find(".ui-resizable-handle").zIndex(r.zIndex() + 10), u || r.resize(function () {
                r.css("left", null).css("right", 0)
            }), t.one("open", function () {
                setTimeout(function () {
                    r.trigger("resize")
                }, 150)
            }))
        }), this
    }, e.fn.elfinderoverlay = function (t) {
        this.filter(":not(.elfinder-overlay)").each(function () {
            t = e.extend({}, t), e(this).addClass("ui-widget-overlay elfinder-overlay").hide().mousedown(function (e) {
                e.preventDefault(), e.stopPropagation()
            }).data({
                cnt: 0,
                show: typeof t.show == "function" ? t.show : function () {},
                hide: typeof t.hide == "function" ? t.hide : function () {}
            })
        });
        if (t == "show") {
            var n = this.eq(0),
                r = n.data("cnt") + 1,
                i = n.data("show");
            n.data("cnt", r), n.is(":hidden") && (n.zIndex(n.parent().zIndex() + 1), n.show(), i())
        }
        if (t == "hide") {
            var n = this.eq(0),
                r = n.data("cnt") - 1,
                s = n.data("hide");
            n.data("cnt", r), r == 0 && n.is(":visible") && (n.hide(), s())
        }
        return this
    }, e.fn.elfinderpanel = function (t) {
        return this.each(function () {
            var n = e(this).addClass("elfinder-panel ui-state-default ui-corner-all"),
                r = "margin-" + (t.direction == "ltr" ? "left" : "right");
            t.one("load", function (e) {
                var i = t.getUI("navbar");
                n.css(r, parseInt(i.outerWidth(!0))), i.bind("resize", function () {
                    n.is(":visible") && n.css(r, parseInt(i.outerWidth(!0)))
                })
            })
        })
    }, e.fn.elfinderpath = function (t) {
        return this.each(function () {
            var n = e(this).addClass("elfinder-path").html("&nbsp;").delegate("a", "click", function (n) {
                var r = e(this).attr("href").substr(1);
                n.preventDefault(), r != t.cwd().hash && t.exec("open", r)
            }).prependTo(t.getUI("statusbar").show());
            t.bind("open searchend", function () {
                var r = [];
                e.each(t.parents(t.cwd().hash), function (e, n) {
                    r.push('<a href="#' + n + '">' + t.escape(t.file(n).name) + "</a>")
                }), n.html(r.join(t.option("separator")))
            }).bind("search", function () {
                n.html(t.i18n("searcresult"))
            })
        })
    }, e.fn.elfinderplaces = function (t, n) {
        return this.each(function () {
            var r = [],
                i = "class",
                s = t.res(i, "navdir"),
                o = t.res(i, "navcollapse"),
                u = t.res(i, "navexpand"),
                a = t.res(i, "hover"),
                f = t.res(i, "treeroot"),
                l = t.res("tpl", "navdir"),
                c = t.res("tpl", "perms"),
                h = e(t.res("tpl", "navspinner")),
                p = function (e) {
                    return e.substr(6)
                }, d = function (e) {
                    return "place-" + e
                }, v = function () {
                    t.storage("places", r.join(","))
                }, m = function (n) {
                    return e(l.replace(/\{id\}/, d(n.hash)).replace(/\{name\}/, t.escape(n.name)).replace(/\{cssclass\}/, t.perms2class(n)).replace(/\{permissions\}/, !n.read || !n.write ? c : "").replace(/\{symlink\}/, ""))
                }, g = function (n) {
                    var i = m(n);
                    S.children().length && e.each(S.children(), function () {
                        var t = e(this);
                        if (n.name.localeCompare(t.children("." + s).text()) < 0) return !i.insertBefore(t)
                    }), r.push(n.hash), !i.parent().length && S.append(i), E.addClass(o), i.draggable({
                        appendTo: "body",
                        revert: !1,
                        helper: function () {
                            var n = e(this);
                            return n.children().removeClass("ui-state-hover"), e('<div class="elfinder-place-drag elfinder-' + t.direction + '"/>').append(n.clone()).data("hash", p(n.children(":first").attr("id")))
                        },
                        start: function () {
                            e(this).hide()
                        },
                        stop: function (t, n) {
                            var r = x.offset().top,
                                i = x.offset().left,
                                s = x.width(),
                                o = x.height(),
                                u = t.clientX,
                                a = t.clientY;
                            u > i && u < i + s && a > r && a < a + o ? e(this).show() : (y(n.helper.data("hash")), v())
                        }
                    })
                }, y = function (t) {
                    var n = e.inArray(t, r);
                    n !== -1 && (r.splice(n, 1), S.find("#" + d(t)).parent().remove(), !S.children().length && E.removeClass(o + " " + u))
                }, b = function () {
                    S.empty(), E.removeClass(o + " " + u)
                }, w = m({
                    hash: "root-" + t.namespace,
                    name: t.i18n(n.name, "places"),
                    read: !0,
                    write: !0
                }),
                E = w.children("." + s).addClass(f).click(function () {
                    E.is("." + o) && (x.toggleClass(u), S.slideToggle(), t.storage("placesState", x.is("." + u) ? 1 : 0))
                }),
                S = w.children("." + t.res(i, "navsubtree")),
                x = e(this).addClass(t.res(i, "tree") + " elfinder-places ui-corner-all").hide().append(w).appendTo(t.getUI("navbar")).delegate("." + s, "hover", function () {
                    e(this).toggleClass("ui-state-hover")
                }).delegate("." + s, "click", function (n) {
                    t.exec("open", e(this).attr("id").substr(6))
                }).delegate("." + s + ":not(." + f + ")", "contextmenu", function (n) {
                    var r = e(this).attr("id").substr(6);
                    n.preventDefault(), t.trigger("contextmenu", {
                        raw: [{
                            label: t.i18n("rmFromPlaces"),
                            icon: "rm",
                            callback: function () {
                                y(r), v()
                            }
                        }],
                        x: n.clientX,
                        y: n.clientY
                    })
                }).droppable({
                    tolerance: "pointer",
                    accept: ".elfinder-cwd-file-wrapper,.elfinder-tree-dir,.elfinder-cwd-file",
                    hoverClass: t.res("class", "adroppable"),
                    drop: function (n, i) {
                        var s = !0;
                        e.each(i.helper.data("files"), function (n, i) {
                            var o = t.file(i);
                            o && o.mime == "directory" && e.inArray(o.hash, r) === -1 ? g(o) : s = !1
                        }), v(), s && i.helper.hide()
                    }
                });
            t.one("load", function () {
                if (t.oldAPI) return;
                x.show().parent().show(), r = e.map(t.storage("places").split(","), function (e) {
                    return e || null
                }), r.length && (E.prepend(h), t.request({
                    data: {
                        cmd: "info",
                        targets: r
                    },
                    preventDefault: !0
                }).done(function (n) {
                    r = [], e.each(n.files, function (e, t) {
                        t.mime == "directory" && g(t)
                    }), v(), t.storage("placesState") > 0 && E.click()
                }).always(function () {
                    h.remove()
                })), t.remove(function (t) {
                    e.each(t.data.removed, function (e, t) {
                        y(t)
                    }), v()
                }).change(function (t) {
                    e.each(t.data.changed, function (t, n) {
                        e.inArray(n.hash, r) !== -1 && (y(n.hash), n.mime == "directory" && g(n))
                    }), v()
                }).bind("sync", function () {
                    r.length && (E.prepend(h), t.request({
                        data: {
                            cmd: "info",
                            targets: r
                        },
                        preventDefault: !0
                    }).done(function (t) {
                        e.each(t.files || [], function (t, n) {
                            e.inArray(n.hash, r) === -1 && y(n.hash)
                        }), v()
                    }).always(function () {
                        h.remove()
                    }))
                })
            })
        })
    }, e.fn.elfindersearchbutton = function (t) {
        return this.each(function () {
            var n = !1,
                r = e(this).hide().addClass("ui-widget-content elfinder-button " + t.fm.res("class", "searchbtn") + ""),
                i = function () {
                    t.exec(e.trim(o.val())).done(function () {
                        n = !0, o.focus()
                    })
                }, s = function () {
                    o.val(""), n && (n = !1, t.fm.trigger("searchend"))
                }, o = e('<input type="text" size="42"/>').appendTo(r).keypress(function (e) {
                    e.stopPropagation()
                }).keydown(function (e) {
                    e.stopPropagation(), e.keyCode == 13 && i(), e.keyCode == 27 && (e.preventDefault(), s())
                });
            e('<span class="ui-icon ui-icon-search" title="' + t.title + '"/>').appendTo(r).click(i), e('<span class="ui-icon ui-icon-close"/>').appendTo(r).click(s), setTimeout(function () {
                r.parent().detach(), t.fm.getUI("toolbar").prepend(r.show());
                if (e.browser.msie) {
                    var n = r.children(t.fm.direction == "ltr" ? ".ui-icon-close" : ".ui-icon-search");
                    n.css({
                        right: "",
                        left: parseInt(r.width()) - n.outerWidth(!0)
                    })
                }
            }, 200), t.fm.error(function () {
                o.unbind("keydown")
            }).select(function () {
                o.blur()
            }).bind("searchend", function () {
                o.val("")
            }).viewchange(s).shortcut({
                pattern: "ctrl+f f3",
                description: t.title,
                callback: function () {
                    o.select().focus()
                }
            })
        })
    }, e.fn.elfindersortbutton = function (t) {
        return this.each(function () {
            var n = t.fm,
                r = t.name,
                i = "class",
                s = n.res(i, "disabled"),
                o = n.res(i, "hover"),
                u = "elfinder-button-menu-item",
                a = u + "-selected",
                f = a + "-asc",
                l = a + "-desc",
                c = e(this).addClass("ui-state-default elfinder-button elfinder-menubutton elfiner-button-" + r).attr("title", t.title).append('<span class="elfinder-button-icon elfinder-button-icon-' + r + '"/>').hover(function (e) {
                    !c.is("." + s) && c.toggleClass(o)
                }).click(function (e) {
                    c.is("." + s) || (e.stopPropagation(), h.is(":hidden") && t.fm.getUI().click(), h.slideToggle(100))
                }),
                h = e('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(c).zIndex(12 + c.zIndex()).delegate("." + u, "hover", function () {
                    e(this).toggleClass(o)
                }).delegate("." + u, "click", function (e) {
                    e.preventDefault(), e.stopPropagation(), d()
                }),
                p = function () {
                    h.children(":not(:last)").removeClass(a + " " + f + " " + l).filter('[rel="' + n.sortType + '"]').addClass(a + " " + (n.sortOrder == "asc" ? f : l)), h.children(":last").toggleClass(a, n.sortStickFolders)
                }, d = function () {
                    h.hide()
                };
            e.each(n.sortRules, function (t, r) {
                h.append(e('<div class="' + u + '" rel="' + t + '"><span class="ui-icon ui-icon-arrowthick-1-n"/><span class="ui-icon ui-icon-arrowthick-1-s"/>' + n.i18n("sort" + t) + "</div>").data("type", t))
            }), h.children().click(function (r) {
                var i = e(this).attr("rel");
                t.exec([], {
                    type: i,
                    order: i == n.sortType ? n.sortOrder == "asc" ? "desc" : "asc" : n.sortOrder,
                    stick: n.sortStickFolders
                })
            }), e('<div class="' + u + " " + u + '-separated"><span class="ui-icon ui-icon-check"/>' + n.i18n("sortFoldersFirst") + "</div>").appendTo(h).click(function () {
                t.exec([], {
                    type: n.sortType,
                    order: n.sortOrder,
                    stick: !n.sortStickFolders
                })
            }), n.bind("disable select", d).getUI().click(d), n.bind("sortchange", p), h.children().length > 1 ? t.change(function () {
                c.toggleClass(s, t.disabled()), p()
            }).change() : c.addClass(s)
        })
    }, e.fn.elfinderstat = function (t) {
        return this.each(function () {
            var n = e(this).addClass("elfinder-stat-size"),
                r = e('<div class="elfinder-stat-selected"/>'),
                i = t.i18n("size").toLowerCase(),
                s = t.i18n("items").toLowerCase(),
                o = t.i18n("selected"),
                u = function (r, o) {
                    var u = 0,
                        a = 0;
                    e.each(r, function (e, t) {
                        if (!o || t.phash == o) u++, a += parseInt(t.size) || 0
                    }), n.html(s + ": " + u + ", " + i + ": " + t.formatSize(a))
                };
            t.getUI("statusbar").prepend(n).append(r).show(), t.bind("open reload add remove change searchend", function () {
                u(t.files(), t.cwd().hash)
            }).search(function (e) {
                u(e.data.files)
            }).select(function () {
                var n = 0,
                    s = 0,
                    u = t.selectedFiles();
                if (u.length == 1) {
                    n = u[0].size, r.html(t.escape(u[0].name) + (n > 0 ? ", " + t.formatSize(n) : ""));
                    return
                }
                e.each(u, function (e, t) {
                    s++, n += parseInt(t.size) || 0
                }), r.html(s ? o + ": " + s + ", " + i + ": " + t.formatSize(n) : "&nbsp;")
            })
        })
    }, e.fn.elfindertoolbar = function (t, n) {
        return this.not(".elfinder-toolbar").each(function () {
            var r = t._commands,
                i = e(this).addClass("ui-helper-clearfix ui-widget-header ui-corner-top elfinder-toolbar"),
                s = n || [],
                o = s.length,
                u, a, f, l;
            i.prev().length && i.parent().prepend(this);
            while (o--) if (s[o]) {
                f = e('<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>'), u = s[o].length;
                while (u--) if (a = r[s[o][u]]) l = "elfinder" + a.options.ui, e.fn[l] && f.prepend(e("<div/>")[l](a));
                f.children().length && i.prepend(f), f.children(":not(:last),:not(:first):not(:last)").after('<span class="ui-widget-content elfinder-toolbar-button-separator"/>')
            }
            i.children().length && i.show()
        }), this
    }, e.fn.elfindertree = function (t, n) {
        var r = t.res("class", "tree");
        return this.not("." + r).each(function () {
            var i = "class",
                s = t.res(i, "treeroot"),
                o = n.openRootOnLoad,
                u = t.res(i, "navsubtree"),
                a = t.res(i, "treedir"),
                f = t.res(i, "navcollapse"),
                l = t.res(i, "navexpand"),
                c = "elfinder-subtree-loaded",
                h = t.res(i, "navarrow"),
                p = t.res(i, "active"),
                d = t.res(i, "adroppable"),
                v = t.res(i, "hover"),
                m = t.res(i, "disabled"),
                g = t.res(i, "draggable"),
                y = t.res(i, "droppable"),
                b = function (
                e) {
                    var t = B.offset().left;
                    return t <= e && e <= t + B.width()
                }, w = t.droppable.drop,
                E = e.extend(!0, {}, t.droppable, {
                    over: function (t) {
                        var n = e(this),
                            r = v + " " + d;
                        b(t.clientX) ? (n.addClass(r), n.is("." + f + ":not(." + l + ")") && setTimeout(function () {
                            n.is("." + d) && n.children("." + h).click()
                        }, 500)) : n.removeClass(r)
                    },
                    out: function () {
                        e(this).removeClass(v + " " + d)
                    },
                    drop: function (e, t) {
                        b(e.clientX) && w.call(this, e, t)
                    }
                }),
                S = e(t.res("tpl", "navspinner")),
                x = t.res("tpl", "navdir"),
                T = t.res("tpl", "perms"),
                N = t.res("tpl", "symlink"),
                C = {
                    id: function (e) {
                        return t.navHash2Id(e.hash)
                    },
                    cssclass: function (e) {
                        return (e.phash ? "" : s) + " " + a + " " + t.perms2class(e) + " " + (e.dirs && !e.link ? f : "")
                    },
                    permissions: function (e) {
                        return !e.read || !e.write ? T : ""
                    },
                    symlink: function (e) {
                        return e.alias ? N : ""
                    }
                }, k = function (e) {
                    return e.name = t.escape(e.name), x.replace(/(?:\{([a-z]+)\})/ig, function (t, n) {
                        return e[n] || (C[n] ? C[n](e) : "")
                    })
                }, L = function (t) {
                    return e.map(t || [], function (e) {
                        return e.mime == "directory" ? e : null
                    })
                }, A = function (e) {
                    return e ? H.find("#" + t.navHash2Id(e)).next("." + u) : H
                }, O = function (n, r) {
                    var i = n.children(":first"),
                        s;
                    while (i.length) {
                        s = t.file(t.navId2Hash(i.children("[id]").attr("id")));
                        if ((s = t.file(t.navId2Hash(i.children("[id]").attr("id")))) && r.name.toLowerCase().localeCompare(s.name.toLowerCase()) < 0) return i;
                        i = i.next()
                    }
                    return e("")
                }, M = function (e) {
                    var n = e.length,
                        r = [],
                        i = e.length,
                        s, o, u, a;
                    while (i--) {
                        s = e[i];
                        if (H.find("#" + t.navHash2Id(s.hash)).length) continue;
                        (u = A(s.phash)).length ? (o = k(s), s.phash && (a = O(u, s)).length ? a.before(o) : u[s.phash ? "append" : "prepend"](o)) : r.push(s)
                    }
                    if (r.length && r.length < n) return M(r);
                    setTimeout(function () {
                        D()
                    }, 10)
                }, _ = function (e) {
                    var r = t.cwd().hash,
                        i = H.find("#" + t.navHash2Id(r)),
                        f, h;
                    o && (f = H.find("#" + t.navHash2Id(t.root())), f.is("." + c) && f.addClass(l).next("." + u).show(), o = !1), i.is("." + p) || (H.find("." + a + "." + p).removeClass(p), i.addClass(p)), n.syncTree && (i.length ? i.parentsUntil("." + s).filter("." + u).show().prev("." + a).addClass(l) : t.newAPI && !e && ((h = t.file(r)).phash && H.find("#" + t.navHash2Id(h.phash)).length && M([h]), t.request({
                        data: {
                            cmd: "parents",
                            target: r
                        },
                        preventFail: !0
                    }).done(function (e) {
                        var n = L(e.tree);
                        M(n), P(n, c), r == t.cwd().hash && _(!0)
                    })))
                }, D = function () {
                    H.find("." + a + ":not(." + y + ",.elfinder-ro,.elfinder-na)").droppable(E)
                }, P = function (n, r) {
                    var i = r == c ? "." + f + ":not(." + c + ")" : ":not(." + f + ")";
                    e.each(n, function (n, s) {
                        H.find("#" + t.navHash2Id(s.phash) + i).filter(function () {
                            return e(this).next("." + u).children().length > 0
                        }).addClass(r)
                    })
                }, H = e(this).addClass(r).delegate("." + a, "hover", function (n) {
                    var r = e(this),
                        i = n.type == "mouseenter";
                    r.is("." + d + " ,." + m) || (i && !r.is("." + s + ",." + g + ",.elfinder-na,.elfinder-wo") && r.draggable(t.draggable), r.toggleClass(v, i))
                }).delegate("." + a, "dropover dropout drop", function (t) {
                    e(this)[t.type == "dropover" ? "addClass" : "removeClass"](d + " " + v)
                }).delegate("." + a, "click", function (n) {
                    var r = e(this),
                        i = t.navId2Hash(r.attr("id")),
                        s = t.file(i);
                    t.trigger("searchend"), i != t.cwd().hash && !r.is("." + m) ? t.exec("open", s.thash || i) : r.is("." + f) && r.children("." + h).click()
                }).delegate("." + a + "." + f + " ." + h, "click", function (n) {
                    var r = e(this),
                        i = r.parent("." + a),
                        s = i.next("." + u);
                    n.stopPropagation(), i.is("." + c) ? (i.toggleClass(l), s.slideToggle()) : (S.insertBefore(r), i.removeClass(f), t.request({
                        cmd: "tree",
                        target: t.navId2Hash(i.attr("id"))
                    }).done(function (e) {
                        M(L(e.tree)), s.children().length && (i.addClass(f + " " + l), s.slideDown()), _()
                    }).always(function (e) {
                        S.remove(), i.addClass(c)
                    }))
                }).delegate("." + a, "contextmenu", function (n) {
                    n.preventDefault(), t.trigger("contextmenu", {
                        type: "navbar",
                        targets: [t.navId2Hash(e(this).attr("id"))],
                        x: n.clientX,
                        y: n.clientY
                    })
                }),
                B = t.getUI("navbar").append(H).show();
            t.open(function (e) {
                var t = e.data,
                    n = L(t.files);
                t.init && H.empty(), n.length && (M(n), P(n, c)), _()
            }).add(function (e) {
                var t = L(e.data.added);
                t.length && (M(t), P(t, f))
            }).change(function (n) {
                var r = L(n.data.changed),
                    i = r.length,
                    s, o, f, h, p, d, v, m, g;
                while (i--) {
                    s = r[i];
                    if ((o = H.find("#" + t.navHash2Id(s.hash))).length) {
                        if (s.phash) {
                            h = o.closest("." + u), p = A(s.phash), d = o.parent().next(), v = O(p, s);
                            if (!p.length) continue;
                            if (p[0] !== h[0] || d.get(0) !== v.get(0)) v.length ? v.before(o) : p.append(o)
                        }
                        m = o.is("." + l), g = o.is("." + c), f = e(k(s)), o.replaceWith(f.children("." + a)), s.dirs && (m || g) && (o = H.find("#" + t.navHash2Id(s.hash))) && o.next("." + u).children().length && (m && o.addClass(l), g && o.addClass(c))
                    }
                }
                _(), D()
            }).remove(function (e) {
                var n = e.data.removed,
                    r = n.length,
                    i, s;
                while (r--)(i = H.find("#" + t.navHash2Id(n[r]))).length && (s = i.closest("." + u), i.parent().detach(), s.children().length || s.hide().prev("." + a).removeClass(f + " " + l + " " + c))
            }).bind("search searchend", function (e) {
                H.find("#" + t.navHash2Id(t.cwd().hash))[e.type == "search" ? "removeClass" : "addClass"](p)
            }).bind("lockfiles unlockfiles", function (n) {
                var r = n.type == "lockfiles",
                    i = r ? "disable" : "enable",
                    s = e.map(n.data.files || [], function (e) {
                        var n = t.file(e);
                        return n && n.mime == "directory" ? e : null
                    });
                e.each(s, function (e, n) {
                    var s = H.find("#" + t.navHash2Id(n));
                    s.length && (s.is("." + g) && s.draggable(i), s.is("." + y) && s.droppable(p), s[r ? "addClass" : "removeClass"](m))
                })
            })
        }), this
    }, e.fn.elfinderuploadbutton = function (t) {
        return this.each(function () {
            var n = e(this).elfinderbutton(t).unbind("click"),
                r = e("<form/>").appendTo(n),
                i = e('<input type="file" multiple="true"/>').change(function () {
                    var n = e(this);
                    n.val() && (t.exec({
                        input: n.remove()[0]
                    }), i.clone(!0).appendTo(r))
                });
            r.append(i.clone(!0)), t.change(function () {
                r[t.disabled() ? "hide" : "show"]()
            }).change()
        })
    }, e.fn.elfinderviewbutton = function (t) {
        return this.each(function () {
            var n = e(this).elfinderbutton(t),
                r = n.children(".elfinder-button-icon");
            t.change(function () {
                var e = t.value == "icons";
                r.toggleClass("elfinder-button-icon-view-list", e), n.attr("title", t.fm.i18n(e ? "viewlist" : "viewicons"))
            })
        })
    }, e.fn.elfinderworkzone = function (t) {
        var n = "elfinder-workzone";
        return this.not("." + n).each(function () {
            var t = e(this).addClass(n),
                r = t.outerHeight(!0) - t.height(),
                i = t.parent();
            i.add(window).bind("resize", function () {
                var s = i.height();
                i.children(":visible:not(." + n + ")").each(function () {
                    var t = e(this);
                    t.css("position") != "absolute" && (s -= t.outerHeight(!0))
                }), t.height(s - r)
            })
        }), this
    }, elFinder.prototype.commands.archive = function () {
        var t = this,
            n = t.fm,
            r = [];
        this.variants = [], this.disableOnSearch = !0, n.bind("open reload", function () {
            t.variants = [], e.each(r = n.option("archivers").create || [], function (e, r) {
                t.variants.push([r, n.mime2kind(r)])
            }), t.change()
        }), this.getstate = function () {
            return !this._disabled && r.length && n.selected().length && n.cwd().write ? 0 : -1
        }, this.exec = function (t, i) {
            var s = this.files(t),
                o = s.length,
                u = i || r[0],
                a = n.cwd(),
                f = ["errArchive", "errPerm"],
                l = e.Deferred().fail(function (e) {
                    e && n.error(e)
                }),
                c;
            if (!(this.enabled() && o && r.length && e.inArray(u, r) !== -1)) return l.reject();
            if (!a.write) return l.reject(f);
            for (c = 0; c < o; c++) if (!s[c].read) return l.reject(f);
            return n.request({
                data: {
                    cmd: "archive",
                    targets: this.hashes(t),
                    type: u
                },
                notify: {
                    type: "archive",
                    cnt: 1
                },
                syncOnFail: !0
            })
        }
    }, elFinder.prototype.commands.back = function () {
        this.alwaysEnabled = !0, this.updateOnSelect = !1, this.shortcuts = [{
            pattern: "ctrl+left backspace"
        }], this.getstate = function () {
            return this.fm.history.canBack() ? 0 : -1
        }, this.exec = function () {
            return this.fm.history.back()
        }
    }, elFinder.prototype.commands.copy = function () {
        this.shortcuts = [{
            pattern: "ctrl+c ctrl+insert"
        }], this.getstate = function (t) {
            var t = this.files(t),
                n = t.length;
            return n && e.map(t, function (e) {
                return e.phash && e.read ? e : null
            }).length == n ? 0 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                r = e.Deferred().fail(function (e) {
                    n.error(e)
                });
            return e.each(this.files(t), function (e, t) {
                if (!t.read || !t.phash) return !r.reject(["errCopy", t.name, "errPerm"])
            }), r.state() == "rejected" ? r : r.resolve(n.clipboard(this.hashes(t)))
        }
    }, elFinder.prototype.commands.cut = function () {
        this.shortcuts = [{
            pattern: "ctrl+x shift+insert"
        }], this.getstate = function (t) {
            var t = this.files(t),
                n = t.length;
            return n && e.map(t, function (e) {
                return e.phash && e.read && !e.locked ? e : null
            }).length == n ? 0 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                r = e.Deferred().fail(function (e) {
                    n.error(e)
                });
            return e.each(this.files(t), function (e, t) {
                if (!t.read || !t.phash) return !r.reject(["errCopy", t.name, "errPerm"]);
                if (t.locked) return !r.reject(["errLocked", t.name])
            }), r.state() == "rejected" ? r : r.resolve(n.clipboard(this.hashes(t), !0))
        }
    }, elFinder.prototype.commands.download = function () {
        var t = this,
            n = this.fm,
            r = function (n) {
                return e.map(t.files(n), function (e) {
                    return e.mime == "directory" ? null : e
                })
            };
        this.shortcuts = [{
            pattern: "shift+enter"
        }], this.getstate = function () {
            var t = this.fm.selected(),
                n = t.length;
            return !this._disabled && n && (!e.browser.msie || n == 1) && n == r(t).length ? 0 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                i = n.options.url,
                s = r(t),
                o = e.Deferred(),
                u = "",
                a = "",
                f, l;
            if (this.disabled()) return o.reject();
            if (n.oldAPI) return n.error("errCmdNoSupport"), o.reject();
            e.each(n.options.customData || {}, function (e, t) {
                a += "&" + e + "=" + t
            }), i += i.indexOf("?") === -1 ? "?" : "&";
            for (f = 0; f < s.length; f++) u += '<iframe class="downloader" id="downloader-' + s[f].hash + '" style="display:none" src="' + i + "cmd=file&target=" + s[f].hash + "&download=1" + a + '"/>';
            return e(u).appendTo("body").ready(function () {
                setTimeout(function () {
                    e(u).each(function () {
                        e("#" + e(this).attr("id")).remove()
                    })
                }, e.browser.mozilla ? 2e4 + 1e4 * f : 1e3)
            }), n.trigger("download", {
                files: s
            }), o.resolve(t)
        }
    }, elFinder.prototype.commands.duplicate = function () {
        var t = this.fm;
        this.getstate = function (n) {
            var n = this.files(n),
                r = n.length;
            return !this._disabled && r && t.cwd().write && e.map(n, function (e) {
                return e.phash && e.read ? e : null
            }).length == r ? 0 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                r = this.files(t),
                i = r.length,
                s = e.Deferred().fail(function (e) {
                    e && n.error(e)
                }),
                o = [];
            return !i || this._disabled ? s.reject() : (e.each(r, function (e, t) {
                if (!t.read || !n.file(t.phash).write) return !s.reject(["errCopy", t.name, "errPerm"])
            }), s.state() == "rejected" ? s : n.request({
                data: {
                    cmd: "duplicate",
                    targets: this.hashes(t)
                },
                notify: {
                    type: "copy",
                    cnt: i
                }
            }))
        }
    }, elFinder.prototype.commands.edit = function () {
        var t = this,
            n = this.fm,
            r = n.res("mimes", "text") || [],
            i = function (n) {
                return e.map(n, function (n) {
                    return (n.mime.indexOf("text/") === 0 || e.inArray(n.mime, r) !== -1) && n.mime.indexOf("text/rtf") && (!t.onlyMimes.length || e.inArray(n.mime, t.onlyMimes) !== -1) && n.read && n.write ? n : null
                })
            }, s = function (r, i, s) {
                var o = e.Deferred(),
                    u = e('<textarea class="elfinder-file-edit" rows="20" id="' + r + '-ta">' + n.escape(s) + "</textarea>"),
                    a = function () {
                        u.editor && u.editor.save(u[0], u.editor.instance), o.resolve(u.getContent()), u.elfinderdialog("close")
                    }, f = function () {
                        o.reject(), u.elfinderdialog("close")
                    }, l = {
                        title: i.name,
                        width: t.options.dialogWidth || 450,
                        buttons: {},
                        close: function () {
                            u.editor && u.editor.close(u[0], u.editor.instance), e(this).elfinderdialog("destroy")
                        },
                        open: function () {
                            n.disable(), u.focus(), u[0].setSelectionRange && u[0].setSelectionRange(0, 0), u.editor && u.editor.load(u[0])
                        }
                    };
                return u.getContent = function () {
                    return u.val()
                }, e.each(t.options.editors || [], function (t, n) {
                    if (e.inArray(i.mime, n.mimes || []) !== -1 && typeof n.load == "function" && typeof n.save == "function") return u.editor = {
                        load: n.load,
                        save: n.save,
                        close: typeof n.close == "function" ? n.close : function () {},
                        instance: null
                    }, !1
                }), u.editor || u.keydown(function (e) {
                    var t = e.keyCode,
                        n, r;
                    e.stopPropagation(), t == 9 && (e.preventDefault(), this.setSelectionRange && (n = this.value, r = this.selectionStart, this.value = n.substr(0, r) + "	" + n.substr(this.selectionEnd), r += 1, this.setSelectionRange(r, r)));
                    if (e.ctrlKey || e.metaKey) {
                        if (t == 81 || t == 87) e.preventDefault(), f();
                        t == 83 && (e.preventDefault(), a())
                    }
                }), l.buttons[n.i18n("Save")] = a, l.buttons[n.i18n("Cancel")] = f, n.dialog(u, l).attr("id", r), o.promise()
            }, o = function (t) {
                var r = t.hash,
                    i = n.options,
                    o = e.Deferred(),
                    u = {
                        cmd: "file",
                        target: r
                    }, a = n.url(r) || n.options.url,
                    f = "edit-" + n.namespace + "-" + t.hash,
                    l = n.getUI().find("#" + f),
                    c;
                return l.length ? (l.elfinderdialog("toTop"), o.resolve()) : !t.read || !t.write ? (c = ["errOpen", t.name, "errPerm"], n.error(c), o.reject(c)) : (n.request({
                    data: {
                        cmd: "get",
                        target: r
                    },
                    notify: {
                        type: "openfile",
                        cnt: 1
                    },
                    syncOnFail: !0
                }).done(function (e) {
                    s(f, t, e.content).done(function (e) {
                        n.request({
                            options: {
                                type: "post"
                            },
                            data: {
                                cmd: "put",
                                target: r,
                                content: e
                            },
                            notify: {
                                type: "save",
                                cnt: 1
                            },
                            syncOnFail: !0
                        }).fail(function (e) {
                            o.reject(e)
                        }).done(function (e) {
                            e.changed && e.changed.length && n.change(e), o.resolve(e)
                        })
                    })
                }).fail(function (e) {
                    o.reject(e)
                }), o.promise())
            };
        this.shortcuts = [{
            pattern: "ctrl+e"
        }], this.init = function () {
            this.onlyMimes = this.options.mimes || []
        }, this.getstate = function (e) {
            var e = this.files(e),
                t = e.length;
            return !this._disabled && t && i(e).length == t ? 0 : -1
        }, this.exec = function (t) {
            var n = i(this.files(t)),
                r = [],
                s;
            if (this.disabled()) return e.Deferred().reject();
            while (s = n.shift()) r.push(o(s));
            return r.length ? e.when.apply(null, r) : e.Deferred().reject()
        }
    }, elFinder.prototype.commands.extract = function () {
        var t = this,
            n = t.fm,
            r = [],
            i = function (t) {
                return e.map(t, function (t) {
                    return t.read && e.inArray(t.mime, r) !== -1 ? t : null
                })
            };
        this.disableOnSearch = !0, n.bind("open reload", function () {
            r = n.option("archivers").extract || [], t.change()
        }), this.getstate = function (e) {
            var e = this.files(e),
                t = e.length;
            return !this._disabled && t && this.fm.cwd().write && i(e).length == t ? 0 : -1
        }, this.exec = function (t) {
            var i = this.files(t),
                s = e.Deferred(),
                o = i.length,
                u = o,
                a, f, l;
            if (!(this.enabled() && o && r.length)) return s.reject();
            for (a = 0; a < o; a++) {
                f = i[a];
                if (!f.read || !n.file(f.phash).write) return l = ["errExtract", f.name, "errPerm"], n.error(l), s.reject(l);
                if (e.inArray(f.mime, r) === -1) return l = ["errExtract", f.name, "errNoArchive"], n.error(l), s.reject(l);
                n.request({
                    data: {
                        cmd: "extract",
                        target: f.hash
                    },
                    notify: {
                        type: "extract",
                        cnt: 1
                    },
                    syncOnFail: !0
                }).fail(function (e) {
                    s.state() == "rejected" || s.reject(e)
                }).done(function () {
                    u--, u == 0 && s.resolve()
                })
            }
            return s
        }
    }, elFinder.prototype.commands.forward = function () {
        this.alwaysEnabled = !0, this.updateOnSelect = !0, this.shortcuts = [{
            pattern: "ctrl+right"
        }], this.getstate = function () {
            return this.fm.history.canForward() ? 0 : -1
        }, this.exec = function () {
            return this.fm.history.forward()
        }
    }, elFinder.prototype.commands.getfile = function () {
        var t = this,
            n = this.fm,
            r = function (n) {
                var r = t.options;
                return n = e.map(n, function (e) {
                    return e.mime != "directory" || r.folders ? e : null
                }), r.multiple || n.length == 1 ? n : []
            };
        this.alwaysEnabled = !0, this.callback = n.options.getFileCallback, this._disabled = typeof this.callback == "function", this.getstate = function (e) {
            var e = this.files(e),
                t = e.length;
            return this.callback && t && r(e).length == t ? 0 : -1
        }, this.exec = function (n) {
            var r = this.fm,
                i = this.options,
                s = this.files(n),
                o = s.length,
                u = r.option("url"),
                a = r.option("tmbUrl"),
                f = e.Deferred().done(function (e) {
                    r.trigger("getfile", {
                        files: e
                    }), t.callback(e, r), i.oncomplete == "close" ? r.hide() : i.oncomplete == "destroy" && r.destroy()
                }),
                l = function (t) {
                    return i.onlyURL ? i.multiple ? e.map(s, function (e) {
                        return e.url
                    }) : s[0].url : i.multiple ? s : s[0]
                }, c = [],
                h, p, d;
            if (this.getstate() == -1) return f.reject();
            for (h = 0; h < o; h++) {
                p = s[h];
                if (p.mime == "directory" && !i.folders) return f.reject();
                p.baseUrl = u, p.url = r.url(p.hash), p.path = r.path(p.hash), p.tmb && p.tmb != 1 && (p.tmb = a + p.tmb), !p.width && !p.height && (p.dim ? (d = p.dim.split("x"), p.width = d[0], p.height = d[1]) : p.mime.indexOf("image") !== -1 && c.push(r.request({
                    data: {
                        cmd: "dim",
                        target: p.hash
                    },
                    preventDefault: !0
                }).done(e.proxy(function (e) {
                    e.dim && (d = e.dim.split("x"), this.width = d[0], this.height = d[1]), this.dim = e.dim
                }, s[h]))))
            }
            return c.length ? (e.when.apply(null, c).always(function () {
                f.resolve(l(s))
            }), f) : f.resolve(l(s))
        }
    }, elFinder.prototype.commands.help = function () {
        var t = this.fm,
            n = this,
            r = '<div class="elfinder-help-link"> <a href="{url}">{link}</a></div>',
            i = '<div class="elfinder-help-team"><div>{author}</div>{work}</div>',
            s = /\{url\}/,
            o = /\{link\}/,
            u = /\{author\}/,
            a = /\{work\}/,
            f = "replace",
            l = "ui-priority-primary",
            c = "ui-priority-secondary",
            h = "elfinder-help-license",
            p = '<li class="ui-state-default ui-corner-top"><a href="#{id}">{title}</a></li>',
            d = ['<div class="ui-tabs ui-widget ui-widget-content ui-corner-all elfinder-help">', '<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'],
            v = '<div class="elfinder-help-shortcut"><div class="elfinder-help-shortcut-pattern">{pattern}</div> {descrip}</div>',
            m = '<div class="elfinder-help-separator"/>',
            g = function () {
                d.push('<div id="about" class="ui-tabs-panel ui-widget-content ui-corner-bottom"><div class="elfinder-help-logo"/>'), d.push("<h3>elFinder</h3>"), d.push('<div class="' + l + '">' + t.i18n("webfm") + "</div>"), d.push('<div class="' + c + '">' + t.i18n("ver") + ": " + t.version + ", " + t.i18n("protocolver") + ": " + t.api + "</div>"), d.push('<div class="' + c + '">jQuery/jQuery UI: ' + e().jquery + "/" + e.ui.version + "</div>"), d.push(m), d.push(r[f](s, "http://elfinder.org/")[f](o, t.i18n("homepage"))), d.push(r[f](s, "https://github.com/Studio-42/elFinder/wiki")[f](o, t.i18n("docs"))), d.push(r[f](s, "https://github.com/Studio-42/elFinder")[f](o, t.i18n("github"))), d.push(r[f](s, "http://twitter.com/elrte_elfinder")[f](o, t.i18n("twitter"))), d.push(m), d.push('<div class="' + l + '">' + t.i18n("team") + "</div>"), d.push(i[
                f](u, 'Dmitry "dio" Levashov &lt;dio@std42.ru&gt;')[f](a, t.i18n("chiefdev"))), d.push(i[f](u, "Troex Nevelin &lt;troex@fury.scancode.ru&gt;")[f](a, t.i18n("maintainer"))), d.push(i[f](u, "Alexey Sukhotin &lt;strogg@yandex.ru&gt;")[f](a, t.i18n("contributor"))), d.push(i[f](u, "Naoki Sawada &lt;hypweb@gmail.com&gt;")[f](a, t.i18n("contributor"))), t.i18[t.lang].translator && d.push(i[f](u, t.i18[t.lang].translator)[f](a, t.i18n("translator") + " (" + t.i18[t.lang].language + ")")), d.push(m), d.push('<div class="' + h + '">' + t.i18n("icons") + ': <a href="http://pixelmixer.ru/" target="_blank">Pixelmixer</a>, <a href="http://p.yusukekamiyamane.com" target="_blank">Fugue</a></div>'), d.push(m), d.push('<div class="' + h + '">Licence: BSD Licence</div>'), d.push('<div class="' + h + '">Copyright © 2009-2011, Studio 42</div>'), d.push('<div class="' + h + '"> ' + t.i18n("dontforget") + " </div>"), d.push("</div>")
            }, y = function () {
                var n = t.shortcuts();
                d.push('<div id="shortcuts" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'), n.length ? (d.push('<div class="ui-widget-content elfinder-help-shortcuts">'), e.each(n, function (e, t) {
                    d.push(v.replace(/\{pattern\}/, t[0]).replace(/\{descrip\}/, t[1]))
                }), d.push("</div>")) : d.push('<div class="elfinder-help-disabled">' + t.i18n("shortcutsof") + "</div>"), d.push("</div>")
            }, b = function () {
                d.push('<div id="help" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'), d.push('<a href="http://elfinder.org/forum/" target="_blank" class="elfinder-dont-panic"><span>DON\'T PANIC</span></a>'), d.push("</div>")
            }, w;
        this.alwaysEnabled = !0, this.updateOnSelect = !1, this.state = 0, this.shortcuts = [{
            pattern: "f1",
            description: this.title
        }], setTimeout(function () {
            var r = n.options.view || ["about", "shortcuts", "help"];
            e.each(r, function (e, n) {
                d.push(p[f](/\{id\}/, n)[f](/\{title\}/, t.i18n(n)))
            }), d.push("</ul>"), e.inArray("about", r) !== -1 && g(), e.inArray("shortcuts", r) !== -1 && y(), e.inArray("help", r) !== -1 && b(), d.push("</div>"), w = e(d.join("")), w.find(".ui-tabs-nav li").hover(function () {
                e(this).toggleClass("ui-state-hover")
            }).children().click(function (t) {
                var n = e(this);
                t.preventDefault(), t.stopPropagation(), n.is(".ui-tabs-selected") || (n.parent().addClass("ui-tabs-selected ui-state-active").siblings().removeClass("ui-tabs-selected").removeClass("ui-state-active"), w.find(".ui-tabs-panel").hide().filter(n.attr("href")).show())
            }).filter(":first").click()
        }, 200), this.getstate = function () {
            return 0
        }, this.exec = function () {
            this.dialog || (this.dialog = this.fm.dialog(w, {
                title: this.title,
                width: 530,
                autoOpen: !1,
                destroyOnClose: !1
            })), this.dialog.elfinderdialog("open").find(".ui-tabs-nav li a:first").click()
        }
    }, elFinder.prototype.commands.home = function () {
        this.title = "Home", this.alwaysEnabled = !0, this.updateOnSelect = !1, this.shortcuts = [{
            pattern: "ctrl+home ctrl+shift+up",
            description: "Home"
        }], this.getstate = function () {
            var e = this.fm.root(),
                t = this.fm.cwd().hash;
            return e && t && e != t ? 0 : -1
        }, this.exec = function () {
            return this.fm.exec("open", this.fm.root())
        }
    }, elFinder.prototype.commands.info = function () {
        var t = "msg",
            n = this.fm,
            r = "elfinder-info-spinner",
            i = {
                calc: n.i18n("calc"),
                size: n.i18n("size"),
                unknown: n.i18n("unknown"),
                path: n.i18n("path"),
                aliasfor: n.i18n("aliasfor"),
                modify: n.i18n("modify"),
                perms: n.i18n("perms"),
                locked: n.i18n("locked"),
                dim: n.i18n("dim"),
                kind: n.i18n("kind"),
                files: n.i18n("files"),
                folders: n.i18n("folders"),
                items: n.i18n("items"),
                yes: n.i18n("yes"),
                no: n.i18n("no"),
                link: n.i18n("link")
            };
        this.tpl = {
            main: '<div class="ui-helper-clearfix elfinder-info-title"><span class="elfinder-cwd-icon {class} ui-corner-all"/>{title}</div><table class="elfinder-info-tb">{content}</table>',
            itemTitle: '<strong>{name}</strong><span class="elfinder-info-kind">{kind}</span>',
            groupTitle: "<strong>{items}: {num}</strong>",
            row: "<tr><td>{label} : </td><td>{value}</td></tr>",
            spinner: '<span>{text}</span> <span class="' + r + '"/>'
        }, this.alwaysEnabled = !0, this.updateOnSelect = !1, this.shortcuts = [{
            pattern: "ctrl+i"
        }], this.init = function () {
            e.each(i, function (e, t) {
                i[e] = n.i18n(t)
            })
        }, this.getstate = function () {
            return 0
        }, this.exec = function (t) {
            var n = this,
                s = this.fm,
                o = this.tpl,
                u = o.row,
                a = this.files(t),
                f = a.length,
                l = [],
                c = o.main,
                h = "{label}",
                p = "{value}",
                d = {
                    title: this.title,
                    width: "auto",
                    close: function () {
                        e(this).elfinderdialog("destroy")
                    }
                }, v = [],
                m = function (e) {
                    y.find("." + r).parent().text(e)
                }, g = s.namespace + "-info-" + e.map(a, function (e) {
                    return e.hash
                }).join("-"),
                y = s.getUI().find("#" + g),
                b, w, E, S, x;
            if (!f) return e.Deferred().reject();
            if (y.length) return y.elfinderdialog("toTop"), e.Deferred().resolve();
            f == 1 ? (E = a[0], c = c.replace("{class}", s.mime2class(E.mime)), S = o.itemTitle.replace("{name}", E.name).replace("{kind}", s.mime2kind(E)), E.tmb && (w = s.option("tmbUrl") + E.tmb), E.read ? E.mime != "directory" || E.alias ? b = s.formatSize(E.size) : (b = o.spinner.replace("{text}", i.calc), v.push(E.hash)) : b = i.unknown, l.push(u.replace(h, i.size).replace(p, b)), E.alias && l.push(u.replace(h, i.aliasfor).replace(p, E.alias)), l.push(u.replace(h, i.path).replace(p, s.escape(s.path(E.hash)))), E.read && l.push(u.replace(h, i.link).replace(p, '<a href="' + s.url(E.hash) + '" target="_blank">' + E.name + "</a>")), E.dim ? l.push(u.replace(h, i.dim).replace(p, E.dim)) : E.mime.indexOf("image") !== -1 && (E.width && E.height ? l.push(u.replace(h, i.dim).replace(p, E.width + "x" + E.height)) : (l.push(u.replace(h, i.dim).replace(p, o.spinner.replace("{text}", i.calc))), s.request({
                data: {
                    cmd: "dim",
                    target: E.hash
                },
                preventDefault: !0
            }).fail(function () {
                m(i.unknown)
            }).done(function (e) {
                m(e.dim || i.unknown)
            }))), l.push(u.replace(h, i.modify).replace(p, s.formatDate(E))), l.push(u.replace(h, i.perms).replace(p, s.formatPermissions(E))), l.push(u.replace(h, i.locked).replace(p, E.locked ? i.yes : i.no))) : (c = c.replace("{class}", "elfinder-cwd-icon-group"), S = o.groupTitle.replace("{items}", i.items).replace("{num}", f), x = e.map(a, function (e) {
                return e.mime == "directory" ? 1 : null
            }).length, x ? (l.push(u.replace(h, i.kind).replace(p, x == f ? i.folders : i.folders + " " + x + ", " + i.files + " " + (f - x))), l.push(u.replace(h, i.size).replace(p, o.spinner.replace("{text}", i.calc))), v = e.map(a, function (e) {
                return e.hash
            })) : (b = 0, e.each(a, function (e, t) {
                var n = parseInt(t.size);
                n >= 0 && b >= 0 ? b += n : b = "unknown"
            }), l.push(u.replace(h, i.kind).replace(p, i.files)), l.push(u.replace(h, i.size).replace(p, s.formatSize(b))))), c = c.replace("{title}", S).replace("{content}", l.join("")), y = s.dialog(c, d), y.attr("id", g), w && e("<img/>").load(function () {
                y.find(".elfinder-cwd-icon").css("background", 'url("' + w + '") center center no-repeat')
            }).attr("src", w), v.length && s.request({
                data: {
                    cmd: "size",
                    targets: v
                },
                preventDefault: !0
            }).fail(function () {
                m(i.unknown)
            }).done(function (e) {
                var t = parseInt(e.size);
                s.log(e.size), m(t >= 0 ? s.formatSize(t) : i.unknown)
            })
        }
    }, elFinder.prototype.commands.mkdir = function () {
        this.disableOnSearch = !0, this.updateOnSelect = !1, this.mime = "directory", this.prefix = "untitled folder", this.exec = e.proxy(this.fm.res("mixin", "make"), this), this.shortcuts = [{
            pattern: "ctrl+shift+n"
        }], this.getstate = function () {
            return !this._disabled && this.fm.cwd().write ? 0 : -1
        }
    }, elFinder.prototype.commands.mkfile = function () {
        this.disableOnSearch = !0, this.updateOnSelect = !1, this.mime = "text/plain", this.prefix = "untitled file.txt", this.exec = e.proxy(this.fm.res("mixin", "make"), this), this.getstate = function () {
            return !this._disabled && this.fm.cwd().write ? 0 : -1
        }
    }, elFinder.prototype.commands.netmount = function () {
        var t = this;
        this.alwaysEnabled = !0, this.updateOnSelect = !1, this.drivers = [], this.handlers = {
            load: function () {
                this.drivers = this.fm.netDrivers
            }
        }, this.getstate = function () {
            return this.drivers.length ? 0 : -1
        }, this.exec = function () {
            var n = t.fm,
                r = e.Deferred(),
                i = function () {
                    var i = {
                        protocol: e("<select/>"),
                        host: e('<input type="text"/>'),
                        port: e('<input type="text"/>'),
                        path: e('<input type="text" value="/"/>'),
                        user: e('<input type="text"/>'),
                        pass: e('<input type="password"/>')
                    }, s = {
                        title: n.i18n("netMountDialogTitle"),
                        resizable: !1,
                        modal: !0,
                        destroyOnClose: !0,
                        close: function () {
                            delete t.dialog, !r.isResolved() && !r.state() == "rejected" && r.reject()
                        },
                        buttons: {}
                    }, o = e('<table class="elfinder-info-tb elfinder-netmount-tb"/>');
                    return e.each(t.drivers, function (e, t) {
                        i.protocol.append('<option value="' + t + '">' + n.i18n(t) + "</option>")
                    }), e.each(i, function (t, r) {
                        t != "protocol" && r.addClass("ui-corner-all"), o.append(e("<tr/>").append(e("<td>" + n.i18n(t) + "</td>")).append(e("<td/>").append(r)))
                    }), s.buttons[n.i18n("btnMount")] = function () {
                        var n = {
                            cmd: "netmount"
                        };
                        e.each(i, function (t, r) {
                            var i = e.trim(r.val());
                            i && (n[t] = i)
                        });
                        if (!n.host) return t.fm.trigger("error", {
                            error: "errNetMountHostReq"
                        });
                        t.fm.request({
                            data: n,
                            notify: {
                                type: "netmount",
                                cnt: 1
                            }
                        }).done(function () {
                            r.resolve()
                        }).fail(function (e) {
                            r.reject(e)
                        }), t.dialog.elfinderdialog("close")
                    }, s.buttons[n.i18n("btnCancel")] = function () {
                        t.dialog.elfinderdialog("close")
                    }, n.dialog(o, s)
                };
            return t.dialog || (t.dialog = i()), r.promise()
        }
    }, elFinder.prototype.commands.open = function () {
        this.alwaysEnabled = !0, this._handlers = {
            dblclick: function (e) {
                e.preventDefault(), this.exec()
            },
            "select enable disable reload": function (e) {
                this.update(e.type == "disable" ? -1 : void 0)
            }
        }, this.shortcuts = [{
            pattern: "ctrl+down numpad_enter" + (this.fm.OS != "mac" && " enter")
        }], this.getstate = function (t) {
            var t = this.files(t),
                n = t.length;
            return n == 1 ? 0 : n ? e.map(t, function (e) {
                return e.mime == "directory" ? null : e
            }).length == n ? 0 : -1 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                r = e.Deferred().fail(function (e) {
                    e && n.error(e)
                }),
                i = this.files(t),
                s = i.length,
                o, u, a, f;
            if (!s) return r.reject();
            if (s == 1 && (o = i[0]) && o.mime == "directory") return o && !o.read ? r.reject(["errOpen", o.name, "errPerm"]) : n.request({
                data: {
                    cmd: "open",
                    target: o.thash || o.hash
                },
                notify: {
                    type: "open",
                    cnt: 1,
                    hideCnt: !0
                },
                syncOnFail: !0
            });
            i = e.map(i, function (e) {
                return e.mime != "directory" ? e : null
            });
            if (s != i.length) return r.reject();
            s = i.length;
            while (s--) {
                o = i[s];
                if (!o.read) return r.reject(["errOpen", o.name, "errPerm"]);
                (u = n.url(o.hash)) || (u = n.options.url, u = u + (u.indexOf("?") === -1 ? "?" : "&") + (n.oldAPI ? "cmd=open&current=" + o.phash : "cmd=file") + "&target=" + o.hash), f = "", o.dim && (a = o.dim.split("x"), f = "width=" + (parseInt(a[0]) + 20) + ",height=" + (parseInt(a[1]) + 20));
                if (!window.open(u, "_blank", f + ",top=50,left=50,scrollbars=yes,resizable=yes")) return r.reject("errPopup")
            }
            return r.resolve(t)
        }
    }, elFinder.prototype.commands.paste = function () {
        this.updateOnSelect = !1, this.handlers = {
            changeclipboard: function () {
                this.update()
            }
        }, this.shortcuts = [{
            pattern: "ctrl+v shift+insert"
        }], this.getstate = function (t) {
            if (this._disabled) return -1;
            if (t) {
                if (e.isArray(t)) {
                    if (t.length != 1) return -1;
                    t = this.fm.file(t[0])
                }
            } else t = this.fm.cwd();
            return this.fm.clipboard().length && t.mime == "directory" && t.write ? 0 : -1
        }, this.exec = function (t) {
            var n = this,
                r = n.fm,
                t = t ? this.files(t)[0] : r.cwd(),
                i = r.clipboard(),
                s = i.length,
                o = s ? i[0].cut : !1,
                u = o ? "errMove" : "errCopy",
                a = [],
                f = [],
                l = e.Deferred().fail(function (e) {
                    e && r.error(e)
                }),
                c = function (t) {
                    return t.length && r._commands.duplicate ? r.exec("duplicate", t) : e.Deferred().resolve()
                }, h = function (i) {
                    var s = e.Deferred(),
                        u = [],
                        a = function (t, n) {
                            var r = [],
                                i = t.length;
                            while (i--) e.inArray(t[i].name, n) !== -1 && r.unshift(i);
                            return r
                        }, f = function (e) {
                            var t = u[e],
                                n = i[t],
                                a = e == u.length - 1;
                            if (!n) return;
                            r.confirm({
                                title: r.i18n(o ? "moveFiles" : "copyFiles"),
                                text: r.i18n(["errExists", n.name, "confirmRepl"]),
                                all: !a,
                                accept: {
                                    label: "btnYes",
                                    callback: function (t) {
                                        !a && !t ? f(++e) : c(i)
                                    }
                                },
                                reject: {
                                    label: "btnNo",
                                    callback: function (t) {
                                        var n;
                                        if (t) {
                                            n = u.length;
                                            while (e < n--) i[u[n]].remove = !0
                                        } else i[u[e]].remove = !0;
                                        !a && !t ? f(++e) : c(i)
                                    }
                                },
                                cancel: {
                                    label: "btnCancel",
                                    callback: function () {
                                        s.resolve()
                                    }
                                }
                            })
                        }, l = function (e) {
                            u = a(i, e), u.length ? f(0) : c(i)
                        }, c = function (n) {
                            var n = e.map(n, function (e) {
                                return e.remove ? null : e
                            }),
                                i = n.length,
                                u = {}, a = [],
                                f;
                            if (!i) return s.resolve();
                            f = n[0].phash, n = e.map(n, function (e) {
                                return e.hash
                            }), r.request({
                                data: {
                                    cmd: "paste",
                                    dst: t.hash,
                                    targets: n,
                                    cut: o ? 1 : 0,
                                    src: f
                                },
                                notify: {
                                    type: o ? "move" : "copy",
                                    cnt: i
                                }
                            }).always(function () {
                                s.resolve(), r.unlockfiles({
                                    files: n
                                })
                            })
                        };
                    return n._disabled || !i.length ? s.resolve() : (r.oldAPI ? c(i) : r.option("copyOverwrite") ? t.hash == r.cwd().hash ? l(e.map(r.files(), function (e) {
                        return e.phash == t.hash ? e.name : null
                    })) : r.request({
                        data: {
                            cmd: "ls",
                            target: t.hash
                        },
                        notify: {
                            type: "prepare",
                            cnt: 1,
                            hideCnt: !0
                        },
                        preventFail: !0
                    }).always(function (e) {
                        l(e.list || [])
                    }) : c(i), s)
                }, p, d;
            return !s || !t || t.mime != "directory" ? l.reject() : t.write ? (p = r.parents(t.hash), e.each(i, function (n, s) {
                if (!s.read) return !l.reject([u, i[0].name, "errPerm"]);
                if (o && s.locked) return !l.reject(["errLocked", s.name]);
                if (e.inArray(s.hash, p) !== -1) return !l.reject(["errCopyInItself", s.name]);
                d = r.parents(s.hash);
                if (e.inArray(t.hash, d) !== -1 && e.map(d, function (e) {
                    var n = r.file(e);
                    return n.phash == t.hash && n.name == s.name ? n : null
                }).length) return !l.reject(["errReplByChild", s.name]);
                s.phash == t.hash ? f.push(s.hash) : a.push({
                    hash: s.hash,
                    phash: s.phash,
                    name: s.name
                })
            }), l.state() == "rejected" ? l : e.when(c(f), h(a)).always(function () {
                o && r.clipboard([])
            })) : l.reject([u, i[0].name, "errPerm"])
        }
    }, elFinder.prototype.commands.quicklook = function () {
        var t = this,
            n = t.fm,
            r = 0,
            i = 1,
            s = 2,
            o = r,
            u = "elfinder-quicklook-navbar-icon",
            a = "elfinder-quicklook-fullscreen",
            f = function (t) {
                e(document).trigger(e.Event("keydown", {
                    keyCode: t,
                    ctrlKey: !1,
                    shiftKey: !1,
                    altKey: !1,
                    metaKey: !1
                }))
            }, l = function (e) {
                return {
                    opacity: 0,
                    width: 20,
                    height: n.view == "list" ? 1 : 20,
                    top: e.offset().top + "px",
                    left: e.offset().left + "px"
                }
            }, c = function () {
                var t = e(window);
                return {
                    opacity: 1,
                    width: p,
                    height: d,
                    top: parseInt((t.height() - d) / 2 + t.scrollTop()),
                    left: parseInt((t.width() - p) / 2 + t.scrollLeft())
                }
            }, h = function (e) {
                var t = document.createElement(e.substr(0, e.indexOf("/"))),
                    n = !1;
                try {
                    n = t.canPlayType && t.canPlayType(e)
                } catch (r) {}
                return n && n !== "" && n != "no"
            }, p, d, v, m, g = e('<div class="elfinder-quicklook-title"/>'),
            y = e("<div/>"),
            b = e('<div class="elfinder-quicklook-info"/>'),
            w = e('<div class="' + u + " " + u + '-fullscreen"/>').mousedown(function (r) {
                var i = t.window,
                    s = i.is("." + a),
                    o = "scroll." + n.namespace,
                    f = e(window);
                r.stopPropagation(), s ? (i.css(i.data("position")).unbind("mousemove"), f.unbind(o).trigger(t.resize).unbind(t.resize), E.unbind("mouseenter").unbind("mousemove")) : (i.data("position", {
                    left: i.css("left"),
                    top: i.css("top"),
                    width: i.width(),
                    height: i.height()
                }).css({
                    width: "100%",
                    height: "100%"
                }), e(window).bind(o, function () {
                    i.css({
                        left: parseInt(e(window).scrollLeft()) + "px",
                        top: parseInt(e(window).scrollTop()) + "px"
                    })
                }).bind(t.resize, function (e) {
                    t.preview.trigger("changesize")
                }).trigger(o).trigger(t.resize), i.bind("mousemove", function (e) {
                    E.stop(!0, !0).show().delay(3e3).fadeOut("slow")
                }).mousemove(), E.mouseenter(function () {
                    E.stop(!0, !0).show()
                }).mousemove(function (e) {
                    e.stopPropagation()
                })), E.attr("style", "").draggable(s ? "destroy" : {}), i.toggleClass(a), e(this).toggleClass(u + "-fullscreen-off"), e.fn.resizable && v.add(i).resizable(s ? "enable" : "disable").removeClass("ui-state-disabled")
            }),
            E = e('<div class="elfinder-quicklook-navbar"/>').append(e('<div class="' + u + " " + u + '-prev"/>').mousedown(function () {
                f(37)
            })).append(w).append(e('<div class="' + u + " " + u + '-next"/>').mousedown(function () {
                f(39)
            })).append('<div class="elfinder-quicklook-navbar-separator"/>').append(e('<div class="' + u + " " + u + '-close"/>').mousedown(function () {
                t.window.trigger("close")
            }));
        this.resize = "resize." + n.namespace, this.info = e('<div class="elfinder-quicklook-info-wrapper"/>').append(y).append(b), this.preview = e('<div class="elfinder-quicklook-preview ui-helper-clearfix"/>').bind("change", function (e) {
            t.info.attr("style", "").hide(), y.removeAttr("class").attr("style", ""), b.html("")
        }).bind("update", function (n) {
            var r = t.fm,
                i = t.preview,
                s = n.file,
                o = '<div class="elfinder-quicklook-info-data">{value}</div>',
                u;
            s ? (!s.read && n.stopImmediatePropagation(), t.window.data("hash", s.hash), t.preview.unbind("changesize").trigger("change").children().remove(), g.html(r.escape(s.name)), b.html(o.replace(/\{value\}/, s.name) + o.replace(/\{value\}/, r.mime2kind(s)) + (s.mime == "directory" ? "" : o.replace(/\{value\}/, r.formatSize(s.size))) + o.replace(/\{value\}/, r.i18n("modify") + ": " + r.formatDate(s))), y.addClass("elfinder-cwd-icon ui-corner-all " + r.mime2class(s.mime)), s.tmb && e("<img/>").hide().appendTo(t.preview).load(function () {
                y.css("background", 'url("' + u + '") center center no-repeat'), e(this).remove()
            }).attr("src", u = r.tmb(s.hash)), t.info.delay(100).fadeIn(10)) : n.stopImmediatePropagation()
        }), this.window = e('<div class="ui-helper-reset ui-widget elfinder-quicklook" style="position:absolute"/>').click(function (e) {
            e.stopPropagation()
        }).append(e('<div class="elfinder-quicklook-titlebar"/>').append(g).append(e('<span class="ui-icon ui-icon-circle-close"/>').mousedown(function (e) {
            e.stopPropagation(), t.window.trigger("close")
        }))).append(this.preview.add(E)).append(t.info.hide()).draggable({
            handle: "div.elfinder-quicklook-titlebar"
        }).bind("open", function (e) {
            var n = t.window,
                r = t.value,
                u;
            t.closed() && r && (u = m.find("#" + r.hash)).length && (o = i, u.trigger("scrolltoview"), n.css(l(u)).show().animate(c(), 550, function () {
                o = s, t.update(1, t.value)
            }))
        }).bind("close", function (e) {
            var n = t.window,
                s = t.preview.trigger("change"),
                u = t.value,
                f = m.find("#" + n.data("hash")),
                c = function () {
                    o = r, n.hide(), s.children().remove(), t.update(0, t.value)
                };
            t.opened() && (o = i, n.is("." + a) && w.mousedown(), f.length ? n.animate(l(f), 500, c) : c())
        }), this.alwaysEnabled = !0, this.value = null, this.handlers = {
            select: function () {
                this.update(void 0, this.fm.selectedFiles()[0])
            },
            error: function () {
                t.window.is(":visible") && t.window.data("hash", "").trigger("close")
            },
            "searchshow searchhide": function () {
                this.opened() && this.window.trigger("close")
            }
        }, this.shortcuts = [{
            pattern: "space"
        }], this.support = {
            audio: {
                ogg: h('audio/ogg; codecs="vorbis"'),
                mp3: h("audio/mpeg;"),
                wav: h('audio/wav; codecs="1"'),
                m4a: h("audio/x-m4a;") || h("audio/aac;")
            },
            video: {
                ogg: h('video/ogg; codecs="theora"'),
                webm: h('video/webm; codecs="vp8, vorbis"'),
                mp4: h('video/mp4; codecs="avc1.42E01E"') || h('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
            }
        }, this.closed = function () {
            return o == r
        }, this.opened = function () {
            return o == s
        }, this.init = function () {
            var r = this.options,
                i = this.window,
                s = this.preview,
                o, u;
            p = r.width > 0 ? parseInt(r.width) : 450, d = r.height > 0 ? parseInt(r.height) : 300, n.one("load", function () {
                v = n.getUI(), m = n.getUI("cwd"), i.appendTo("body").zIndex(100 + v.zIndex()), e(document).keydown(function (e) {
                    e.keyCode == 27 && t.opened() && i.trigger("close")
                }), e.fn.resizable && i.resizable({
                    handles: "se",
                    minWidth: 350,
                    minHeight: 120,
                    resize: function () {
                        s.trigger("changesize")
                    }
                }), t.change(function () {
                    t.opened() && (t.value ? s.trigger(e.Event("update", {
                        file: t.value
                    })) : i.trigger("close"))
                }), e.each(n.commands.quicklook.plugins || [], function (e, n) {
                    typeof n == "function" && new n(t)
                }), s.bind("update", function () {
                    t.info.show()
                })
            })
        }, this.getstate = function () {
            return this.fm.selected().length == 1 ? o == s ? 1 : 0 : -1
        }, this.exec = function () {
            this.enabled() && this.window.trigger(this.opened() ? "close" : "open")
        }, this.hideinfo = function () {
            this.info.stop(!0).hide()
        }
    }, elFinder.prototype.commands.quicklook.plugins = [function (t) {
        var n = ["image/jpeg", "image/png", "image/gif"],
            r = t.preview;
        e.each(navigator.mimeTypes, function (t, r) {
            var i = r.type;
            i.indexOf("image/") === 0 && e.inArray(i, n) && n.push(i)
        }), r.bind("update", function (i) {
            var s = i.file,
                o;
            e.inArray(s.mime, n) !== -1 && (i.stopImmediatePropagation(), o = e("<img/>").hide().appendTo(r).load(function () {
                setTimeout(function () {
                    var e = (o.width() / o.height()).toFixed(2);
                    r.bind("changesize", function () {
                        var t = parseInt(r.width()),
                            n = parseInt(r.height()),
                            i, s;
                        e < (t / n).toFixed(2) ? (s = n, i = Math.floor(s * e)) : (i = t, s = Math.floor(i / e)), o.width(i).height(s).css("margin-top", s < n ? Math.floor((n - s) / 2) : 0)
                    }).trigger("changesize"), t.hideinfo(), o.fadeIn(100)
                }, 1)
            }).attr("src", t.fm.url(s.hash)))
        })
    }, function (t) {
        var n = ["text/html", "application/xhtml+xml"],
            r = t.preview,
            i = t.fm;
        r.bind("update", function (s) {
            var o = s.file,
                u;
            e.inArray(o.mime, n) !== -1 && (s.stopImmediatePropagation(), r.one("change", function () {
                !u.isResolved() && !u.state() == "rejected" && u.reject()
            }), u = i.request({
                data: {
                    cmd: "get",
                    target: o.hash,
                    current: o.phash
                },
                preventDefault: !0
            }).done(function (n) {
                t.hideinfo(), doc = e('<iframe class="elfinder-quicklook-preview-html"/>').appendTo(r)[0].contentWindow.document, doc.open(), doc.write(n.content), doc.close()
            }))
        })
    }, function (t) {
        var n = t.fm,
            r = n.res("mimes", "text"),
            i = t.preview;
        i.bind("update", function (s) {
            var o = s.file,
                u = o.mime,
                a;
            if (u.indexOf("text/") === 0 || e.inArray(u, r) !== -1) s.stopImmediatePropagation(), i.one("change", function () {
                !a.isResolved() && !a.state() == "rejected" && a.reject()
            }), a = n.request({
                data: {
                    cmd: "get",
                    target: o.hash
                },
                preventDefault: !0
            }).done(function (r) {
                t.hideinfo(), e('<div class="elfinder-quicklook-preview-text-wrapper"><pre class="elfinder-quicklook-preview-text">' + n.escape(r.content) + "</pre></div>").appendTo(i)
            })
        })
    }, function (t) {
        var n = t.fm,
            r = "application/pdf",
            i = t.preview,
            s = !1;
        e.browser.safari && navigator.platform.indexOf("Mac") != -1 || e.browser.msie ? s = !0 : e.each(navigator.plugins, function (t, n) {
            e.each(n, function (e, t) {
                if (t.type == r) return !(s = !0)
            })
        }), s && i.bind("update", function (s) {
            var o = s.file,
                u;
            o.mime == r && (s.stopImmediatePropagation(), i.one("change", function () {
                u.unbind("load").remove()
            }), u = e('<iframe class="elfinder-quicklook-preview-pdf"/>').hide().appendTo(i).load(function () {
                t.hideinfo(), u.show()
            }).attr("src", n.url(o.hash)))
        })
    }, function (t) {
        var n = t.fm,
            r = "application/x-shockwave-flash",
            i = t.preview,
            s = !1;
        e.each(navigator.plugins, function (t, n) {
            e.each(n, function (e, t) {
                if (t.type == r) return !(s = !0)
            })
        }), s && i.bind("update", function (s) {
            var o = s.file,
                u;
            o.mime == r && (s.stopImmediatePropagation(), t.hideinfo(), i.append(u = e('<embed class="elfinder-quicklook-preview-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="' + n.url(o.hash) + '" quality="high" type="application/x-shockwave-flash" />')))
        })
    }, function (t) {
        var n = t.preview,
            r = !! t.options.autoplay,
            i = {
                "audio/mpeg": "mp3",
                "audio/mpeg3": "mp3",
                "audio/mp3": "mp3",
                "audio/x-mpeg3": "mp3",
                "audio/x-mp3": "mp3",
                "audio/x-wav": "wav",
                "audio/wav": "wav",
                "audio/x-m4a": "m4a",
                "audio/aac": "m4a",
                "audio/mp4": "m4a",
                "audio/x-mp4": "m4a",
                "audio/ogg": "ogg"
            }, s;
        n.bind("update", function (o) {
            var u = o.file,
                a = i[u.mime];
            t.support.audio[a] && (o.stopImmediatePropagation(), s = e('<audio class="elfinder-quicklook-preview-audio" controls preload="auto" autobuffer><source src="' + t.fm.url(u.hash) + '" /></audio>').appendTo(n), r && s[0].play())
        }).bind("change", function () {
            s && s.parent().length && (s[0].pause(), s.remove(), s = null)
        })
    }, function (t) {
        var n = t.preview,
            r = !! t.options.autoplay,
            i = {
                "video/mp4": "mp4",
                "video/x-m4v": "mp4",
                "video/ogg": "ogg",
                "application/ogg": "ogg",
                "video/webm": "webm"
            }, s;
        n.bind("update", function (o) {
            var u = o.file,
                a = i[u.mime];
            t.support.video[a] && (o.stopImmediatePropagation(), t.hideinfo(), s = e('<video class="elfinder-quicklook-preview-video" controls preload="auto" autobuffer><source src="' + t.fm.url(u.hash) + '" /></video>').appendTo(n), r && s[0].play())
        }).bind("change", function () {
            s && s.parent().length && (s[0].pause(), s.remove(), s = null)
        })
    }, function (t) {
        var n = t.preview,
            r = [],
            i;
        e.each(navigator.plugins, function (t, n) {
            e.each(n, function (e, t) {
                (t.type.indexOf("audio/") === 0 || t.type.indexOf("video/") === 0) && r.push(t.type)
            })
        }), n.bind("update", function (s) {
            var o = s.file,
                u = o.mime,
                a;
            e.inArray(o.mime, r) !== -1 && (s.stopImmediatePropagation(), (a = u.indexOf("video/") === 0) && t.hideinfo(), i = e('<embed src="' + t.fm.url(o.hash) + '" type="' + u + '" class="elfinder-quicklook-preview-' + (a ? "video" : "audio") + '"/>').appendTo(n))
        }).bind("change", function () {
            i && i.parent().length && (i.remove(), i = null)
        })
    }], elFinder.prototype.commands.reload = function () {
        this.alwaysEnabled = !0, this.updateOnSelect = !0, this.shortcuts = [{
            pattern: "ctrl+shift+r f5"
        }], this.getstate = function () {
            return 0
        }, this.exec = function () {
            var e = this.fm,
                t = e.sync(),
                n = setTimeout(function () {
                    e.notify({
                        type: "reload",
                        cnt: 1,
                        hideCnt: !0
                    }), t.always(function () {
                        e.notify({
                            type: "reload",
                            cnt: -1
                        })
                    })
                }, e.notifyDelay);
            return t.always(function () {
                clearTimeout(n), e.trigger("reload")
            })
        }
    }, elFinder.prototype.commands.rename = function () {
        this.shortcuts = [{
            pattern: "f2" + (this.fm.OS == "mac" ? " enter" : "")
        }], this.getstate = function () {
            var e = this.fm.selectedFiles();
            return !this._disabled && e.length == 1 && e[0].phash && !e[0].locked ? 0 : -1
        }, this.exec = function () {
            var t = this.fm,
                n = t.getUI("cwd"),
                r = t.selected(),
                i = r.length,
                s = t.file(r.shift()),
                o = ".elfinder-cwd-filename",
                u = e.Deferred().fail(function (e) {
                    var r = a.parent(),
                        i = t.escape(s.name);
                    r.length ? (a.remove(), r.html(i)) : (n.find("#" + s.hash).find(o).html(i), setTimeout(function () {
                        n.find("#" + s.hash).click()
                    }, 50)), e && t.error(e)
                }).always(function () {
                    t.enable()
                }),
                a = e('<input type="text"/>').keydown(function (t) {
                    t.stopPropagation(), t.stopImmediatePropagation(), t.keyCode == e.ui.keyCode.ESCAPE ? u.reject() : t.keyCode == e.ui.keyCode.ENTER && a.blur()
                }).mousedown(function (e) {
                    e.stopPropagation()
                }).dblclick(function (e) {
                    e.stopPropagation(), e.preventDefault()
                }).blur(function () {
                    var n = e.trim(a.val()),
                        r = a.parent();
                    if (r.length) {
                        a[0].setSelectionRange && a[0].setSelectionRange(0, 0);
                        if (n == s.name) return u.reject();
                        if (!n) return u.reject("errInvName");
                        if (t.fileByName(n, s.phash)) return u.reject(["errExists", n]);
                        r.html(t.escape(n)), t.lockfiles({
                            files: [s.hash]
                        }), t.request({
                            data: {
                                cmd: "rename",
                                target: s.hash,
                                name: n
                            },
                            notify: {
                                type: "rename",
                                cnt: 1
                            }
                        }).fail(function (e) {
                            u.reject(), t.sync()
                        }).done(function (e) {
                            u.resolve(e)
                        }).always(function () {
                            t.unlockfiles({
                                files: [s.hash]
                            })
                        })
                    }
                }),
                f = n.find("#" + s.hash).find(o).empty().append(a.val(s.name)),
                l = a.val().replace(/\.((tar\.(gz|bz|bz2|z|lzo))|cpio\.gz|ps\.gz|xcf\.(gz|bz2)|[a-z0-9]{1,4})$/ig, "");
            return this.disabled() ? u.reject() : !s || i > 1 || !f.length ? u.reject("errCmdParams", this.title) : s.locked ? u.reject(["errLocked", s.name]) : (t.one("select", function () {
                a.parent().length && s && e.inArray(s.hash, t.selected()) === -1 && a.blur()
            }), a.select().focus(), a[0].setSelectionRange && a[0].setSelectionRange(0, l.length), u)
        }
    }, elFinder.prototype.commands.resize = function () {
        this.updateOnSelect = !1, this.getstate = function () {
            var e = this.fm.selectedFiles();
            return !this._disabled && e.length == 1 && e[0].read && e[0].write && e[0].mime.indexOf("image/") !== -1 ? 0 : -1
        }, this.exec = function (t) {
            var n = this.fm,
                r = this.files(t),
                i = e.Deferred(),
                s = function (t, r) {
                    var s = e('<div class="elfinder-dialog-resize"/>'),
                        o = '<input type="text" size="5"/>',
                        u = '<div class="elfinder-resize-row"/>',
                        a = '<div class="elfinder-resize-label"/>',
                        f = e('<div class="elfinder-resize-control"/>'),
                        l = e('<div class="elfinder-resize-preview"/>'),
                        c = e('<div class="elfinder-resize-spinner">' + n.i18n("ntfloadimg") + "</div>"),
                        h = e('<div class="elfinder-resize-handle"/>'),
                        p = e('<div class="elfinder-resize-handle"/>'),
                        d = e('<div class="elfinder-resize-uiresize"/>'),
                        v = e('<div class="elfinder-resize-uicrop"/>'),
                        m = '<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>',
                        g = '<div class="ui-state-default elfinder-button"/>',
                        y = '<span class="ui-widget-content elfinder-toolbar-button-separator"/>',
                        b = e('<div class="elfinder-resize-rotate"/>'),
                        w = e(g).attr("title", n.i18n("rotate-cw")).append(e('<span class="elfinder-button-icon elfinder-button-icon-rotate-l"/>').click(function () {
                            W -= 90, et.update(W)
                        })),
                        E = e(g).attr("title", n.i18n("rotate-ccw")).append(e('<span class="elfinder-button-icon elfinder-button-icon-rotate-r"/>').click(function () {
                            W += 90, et.update(W)
                        })),
                        S = e("<span />"),
                        x = e('<div class="ui-state-default ui-corner-all elfinder-resize-reset"><span class="ui-icon ui-icon-arrowreturnthick-1-w"/></div>'),
                        T = e('<div class="elfinder-resize-type"/>').append('<input type="radio" name="type" id="type-resize" value="resize" checked="checked" /><label for="type-resize">' + n.i18n("resize") + "</label>").append('<input type="radio" name="type" id="type-crop"   value="crop"/><label for="type-crop">' + n.i18n("crop") + "</label>").append('<input type="radio" name="type" id="type-rotate" value="rotate"/><label for="type-rotate">' + n.i18n("rotate") + "</label>"),
                        N = e("input", T).change(function () {
                            var t = e("input:checked", T).val();
                            G(), tt(!0), nt(!0), rt(!0), t == "resize" ? (d.show(), b.hide(), v.hide(), tt()) : t == "crop" ? (b.hide(), d.hide(), v.show(), nt()) : t == "rotate" && (d.hide(), v.hide(), b.show(), rt())
                        }),
                        C = e('<input type="checkbox" checked="checked"/>').change(function () {
                            I = !! C.prop("checked"), Y.fixHeight(), tt(!0), tt()
                        }),
                        k = e(o).change(function () {
                            var e = parseInt(k.val()),
                                t = parseInt(I ? e / H : L.val());
                            e > 0 && t > 0 && (Y.updateView(e, t), L.val(t))
                        }),
                        L = e(o).change(function () {
                            var e = parseInt(L.val()),
                                t = parseInt(I ? e * H : k.val());
                            t > 0 && e > 0 && (Y.updateView(t, e), k.val(t))
                        }),
                        A = e(o),
                        O = e(o),
                        M = e(o),
                        _ = e(o),
                        D = e('<input type="text" size="3" maxlength="3" value="0" />').change(function () {
                            et.update()
                        }),
                        P = e('<div class="elfinder-resize-rotate-slider"/>').slider({
                            min: 0,
                            max: 359,
                            value: D.val(),
                            animate: !0,
                            change: function (e, t) {
                                t.value != P.slider("value") && et.update(t.value)
                            },
                            slide: function (e, t) {
                                et.update(t.value, !1)
                            }
                        }),
                        H = 1,
                        B = 1,
                        j = 0,
                        F = 0,
                        I = !0,
                        q = 0,
                        R = 0,
                        U = 0,
                        z = 0,
                        W = 0,
                        X = e("<img/>").load(function () {
                            c.remove(), j = X.width(), F = X.height(), H = j / F, Y.updateView(j, F), h.append(X.show()).show(), k.val(j), L.val(F);
                            var t = Math.min(q, R) / Math.sqrt(Math.pow(j, 2) + Math.pow(F, 2));
                            U = j * t, z = F * t, f.find("input,select").removeAttr("disabled").filter(":text").keydown(function (t) {
                                var n = t.keyCode,
                                    r;
                                t.stopPropagation();
                                if (n >= 37 && n <= 40 || n == e.ui.keyCode.BACKSPACE || n == e.ui.keyCode.DELETE || n == 65 && (t.ctrlKey || t.metaKey) || n == 27) return;
                                n == 9 && (r = e(this).parent()[t.shiftKey ? "prev" : "next"](".elfinder-resize-row").children(":text"), r.length && r.focus());
                                if (n == 13) {
                                    it();
                                    return
                                }(n < 48 || n > 57) && t.preventDefault()
                            }).filter(":first").focus(), tt(), x.hover(function () {
                                x.toggleClass("ui-state-hover")
                            }).click(G)
                        }).error(function () {
                            c.text("Unable to load image").css("background", "transparent")
                        }),
                        V = e("<div/>"),
                        J = e("<img/>"),
                        K = e("<div/>"),
                        Q = e("<img/>"),
                        G = function () {
                            k.val(j), L.val(F), Y.updateView(j, F)
                        }, Y = {
                            update: function () {
                                k.val(parseInt(X.width() / B)), L.val(parseInt(X.height() / B))
                            },
                            updateView: function (e, t) {
                                e > q || t > R ? e / q > t / R ? X.width(q).height(Math.ceil(X.width() / H)) : X.height(R).width(Math.ceil(X.height() * H)) : X.width(e).height(t), B = X.width() / e, S.text("1 : " + (1 / B).toFixed(2)), Y.updateHandle()
                            },
                            updateHandle: function () {
                                h.width(X.width()).height(X.height())
                            },
                            fixWidth: function () {
                                var e, t;
                                I && (t = L.val(), t = parseInt(t * H), Y.updateView(e, t), k.val(e))
                            },
                            fixHeight: function () {
                                var e, t;
                                I && (e = k.val(), t = parseInt(e / H), Y.updateView(e, t), L.val(t))
                            }
                        }, Z = {
                            update: function () {
                                M.val(parseInt(p.width() / B)), _.val(parseInt(p.height() / B)), A.val(parseInt((p.offset().left - J.offset().left) / B)), O.val(parseInt((p.offset().top - J.offset().top) / B))
                            },
                            resize_update: function () {
                                Z.update(), K.width(p.width()), K.height(p.height())
                            }
                        }, et = {
                            mouseStartAngle: 0,
                            imageStartAngle: 0,
                            imageBeingRotated: !1,
                            update: function (t, n) {
                                typeof t == "undefined" && (W = t = parseInt(D.val())), typeof n == "undefined" && (n = !0), !n || e.browser.opera || e.browser.msie && parseInt(e.browser.version) < 9 ? Q.rotate(t) : Q.animate({
                                    rotate: t + "deg"
                                }), t %= 360, t < 0 && (t += 360), D.val(parseInt(t)), P.slider("value", D.val())
                            },
                            execute: function (e) {
                                if (!et.imageBeingRotated) return;
                                var t = et.getCenter(Q),
                                    n = e.pageX - t[0],
                                    r = e.pageY - t[1],
                                    i = Math.atan2(r, n),
                                    s = i - et.mouseStartAngle + et.imageStartAngle;
                                return s = Math.round(parseFloat(s) * 180 / Math.PI), e.shiftKey && (s = Math.round((s + 6) / 15) * 15), Q.rotate(s), s %= 360, s < 0 && (s += 360), D.val(s), P.slider("value", D.val()), !1
                            },
                            start: function (t) {
                                et.imageBeingRotated = !0;
                                var n = et.getCenter(Q),
                                    r = t.pageX - n[0],
                                    i = t.pageY - n[1];
                                return et.mouseStartAngle = Math.atan2(i, r), et.imageStartAngle = parseFloat(Q.rotate()) * Math.PI / 180, e(document).mousemove(et.execute), !1
                            },
                            stop: function (t) {
                                if (!et.imageBeingRotated) return;
                                return e(document).unbind("mousemove", et.execute), setTimeout(function () {
                                    et.imageBeingRotated = !1
                                }, 10), !1
                            },
                            getCenter: function (e) {
                                var t = Q.rotate();
                                Q.rotate(0);
                                var n = Q.offset(),
                                    r = n.left + Q.width() / 2,
                                    i = n.top + Q.height() / 2;
                                return Q.rotate(t), Array(r, i)
                            }
                        }, tt = function (t) {
                            e.fn.resizable && (t ? (h.resizable("destroy"), h.hide()) : (h.show(), h.resizable({
                                alsoResize: X,
                                aspectRatio: I,
                                resize: Y.update,
                                stop: Y.fixHeight
                            })))
                        }, nt = function (t) {
                            e.fn.draggable && e.fn.resizable && (t ? (p.resizable("destroy"), p.draggable("destroy"), V.hide()) : (J.width(X.width()).height(X.height()), K.width(X.width()).height(X.height()), p.width(J.width()).height(J.height()).offset(J.offset()).resizable({
                                containment: V,
                                resize: Z.resize_update,
                                handles: "all"
                            }).draggable({
                                handle: p,
                                containment: J,
                                drag: Z.update
                            }), V.show().width(X.width()).height(X.height()), Z.update()))
                        }, rt = function (t) {
                            e.fn.draggable && e.fn.resizable && (t ? Q.hide() : Q.show().width(U).height(z).css("margin-top", (R - z) / 2 + "px").css("margin-left", (q - U) / 2 + "px"))
                        }, it = function () {
                            var r, o, u, a, f, l = e("input:checked", T).val();
                            k.add(L).change();
                            if (l == "resize") r = parseInt(k.val()) || 0, o = parseInt(L.val()) || 0;
                            else if (l == "crop") r = parseInt(M.val()) || 0, o = parseInt(_.val()) || 0, u = parseInt(A.val()) || 0, a = parseInt(O.val()) || 0;
                            else if (l = "rotate") {
                                r = j, o = F, f = parseInt(D.val()) || 0;
                                if (f < 0 || f > 360) return n.error("Invalid rotate degree");
                                if (f == 0 || f == 360) return n.error("Image dose not rotated")
                            }
                            if (l != "rotate") {
                                if (r <= 0 || o <= 0) return n.error("Invalid image size");
                                if (r == j && o == F) return n.error("Image size not changed")
                            }
                            s.elfinderdialog("close"), n.request({
                                data: {
                                    cmd: "resize",
                                    target: t.hash,
                                    width: r,
                                    height: o,
                                    x: u,
                                    y: a,
                                    degree: f,
                                    mode: l
                                },
                                notify: {
                                    type: "resize",
                                    cnt: 1
                                }
                            }).fail(function (e) {
                                i.reject(e)
                            }).done(function () {
                                i.resolve()
                            })
                        }, st = {}, ot = "elfinder-resize-handle-hline",
                        ut = "elfinder-resize-handle-vline",
                        at = "elfinder-resize-handle-point",
                        ft = n.url(t.hash);
                    Q.mousedown(et.start), e(document).mouseup(et.stop), d.append(e(u).append(e(a).text(n.i18n("width"))).append(k).append(x)).append(e(u).append(e(a).text(n.i18n("height"))).append(L)).append(e(u).append(e("<label/>").text(n.i18n("aspectRatio")).prepend(C))).append(e(u).append(n.i18n("scale") + " ").append(S)), v.append(e(u).append(e(a).text("X")).append(A)).append(e(u).append(e(a).text("Y")).append(O)).append(e(u).append(e(a).text(n.i18n("width"))).append(M)).append(e(u).append(e(a).text(n.i18n("height"))).append(_)), b.append(e(u).append(e(a).text(n.i18n("rotate"))).append(e('<div style="float:left; width: 130px;">').append(e('<div style="float:left;">').append(D).append(e("<span/>").text(n.i18n("degree")))).append(e(m).append(w).append(e(y)).append(E))).append(P)), s.append(T), f.append(e(u)).append(d).append(v.hide()).append(b.hide()).find("input,select").attr("disabled", "disabled"), h.append('<div class="' + ot + " " + ot + '-top"/>').append('<div class="' + ot + " " + ot + '-bottom"/>').append('<div class="' + ut + " " + ut + '-left"/>').append('<div class="' + ut + " " + ut + '-right"/>').append('<div class="' + at + " " + at + '-e"/>').append('<div class="' + at + " " + at + '-se"/>').append('<div class="' + at + " " + at + '-s"/>'), l.append(c).append(h.hide()).append(X.hide()), p.css("position", "absolute").append('<div class="' + ot + " " + ot + '-top"/>').append('<div class="' + ot + " " + ot + '-bottom"/>').append('<div class="' + ut + " " + ut + '-left"/>').append('<div class="' + ut + " " + ut + '-right"/>').append('<div class="' + at + " " + at + '-n"/>').append('<div class="' + at + " " + at + '-e"/>').append('<div class="' + at + " " + at + '-s"/>').append('<div class="' + at + " " + at + '-w"/>').append('<div class="' + at + " " + at + '-ne"/>').append('<div class="' + at + " " + at + '-se"/>').append('<div class="' + at + " " + at + '-sw"/>').append('<div class="' + at + " " + at + '-nw"/>'), l.append(V.css("position", "absolute").hide().append(J).append(p.append(K))), l.append(Q.hide()), l.css("overflow", "hidden"), s.append(l).append(f), st[n.i18n("btnCancel")] = function () {
                        s.elfinderdialog("close")
                    }, st[n.i18n("btnApply")] = it, n.dialog(s, {
                        title: t.name,
                        width: 650,
                        resizable: !1,
                        destroyOnClose: !0,
                        buttons: st,
                        open: function () {
                            l.zIndex(1 + e(this).parent().zIndex())
                        }
                    }).attr("id", r), e.browser.msie && parseInt(e.browser.version) < 9 && e(".elfinder-dialog").css("filter", ""), x.css("left", k.position().left + k.width() + 12), K.css({
                        opacity: .2,
                        "background-color": "#fff",
                        position: "absolute"
                    }), p.css("cursor", "move"), p.find(".elfinder-resize-handle-point").css({
                        "background-color": "#fff",
                        opacity: .5,
                        "border-color": "#000"
                    }), Q.css("cursor", "pointer"), T.buttonset(), q = l.width() - (h.outerWidth() - h.width()), R = l.height() - (h.outerHeight() - h.height()), X.attr("src", ft + (ft.indexOf("?") === -1 ? "?" : "&") + "_=" + Math.random()), J.attr("src", X.attr("src")), Q.attr("src", X.attr("src"))
                }, o, u;
            return !r.length || r[0].mime.indexOf("image/") === -1 ? i.reject() : (o = "resize-" + n.namespace + "-" + r[0].hash, u = n.getUI().find("#" + o), u.length ? (u.elfinderdialog("toTop"), i.resolve()) : (s(r[0], o), i))
        }
    },
    function (e) {
        var t = function (e, t) {
            var n = 0;
            for (n in t) if (typeof e[t[n]] != "undefined") return t[n];
            return e[t[n]] = "", t[n]
        };
        e.cssHooks.rotate = {
            get: function (t, n, r) {
                return e(t).rotate()
            },
            set: function (t, n) {
                return e(t).rotate(n), n
            }
        }, e.cssHooks.transform = {
            get: function (e, n, r) {
                var i = t(e.style, ["WebkitTransform", "MozTransform", "OTransform", "msTransform", "transform"]);
                return e.style[i]
            },
            set: function (e, n) {
                var r = t(e.style, ["WebkitTransform", "MozTransform", "OTransform", "msTransform", "transform"]);
                return e.style[r] = n, n
            }
        }, e.fn.rotate = function (t) {
            if (typeof t == "undefined") {
                if (e.browser.opera) {
                    var n = this.css("transform").match(/rotate\((.*?)\)/);
                    return n && n[1] ? Math.round(parseFloat(n[1]) * 180 / Math.PI) : 0
                }
                var n = this.css("transform").match(/rotate\((.*?)\)/);
                return n && n[1] ? parseInt(n[1]) : 0
            }
            return this.css("transform", this.css("transform").replace(/none|rotate\(.*?\)/, "") + "rotate(" + parseInt(t) + "deg)"), this
        }, e.fx.step.rotate = function (t) {
            t.state == 0 && (t.start = e(t.elem).rotate(), t.now = t.start), e(t.elem).rotate(t.now)
        };
        if (e.browser.msie && parseInt(e.browser.version) < 9) {
            var n = function (e) {
                var t = e,
                    n = t.offsetLeft,
                    r = t.offsetTop;
                while (t.offsetParent) {
                    t = t.offsetParent;
                    if (t != document.body && t.currentStyle["position"] != "static") break;
                    t != document.body && t != document.documentElement && (n -= t.scrollLeft, r -= t.scrollTop), n += t.offsetLeft, r += t.offsetTop
                }
                return {
                    x: n,
                    y: r
                }
            }, r = function (e) {
                if (e.currentStyle["position"] != "static") return;
                var t = n(e);
                e.style.position = "absolute", e.style.left = t.x + "px", e.style.top = t.y + "px"
            }, i = function (e, t) {
                var n, i = 1,
                    s = 1,
                    o = 1,
                    u = 1;
                if (typeof e.style["msTransform"] != "undefined") return !0;
                r(e), n = t.match(/rotate\((.*?)\)/);
                var a = n && n[1] ? parseInt(n[1]) : 0;
                a %= 360, a < 0 && (a = 360 + a);
                var f = a * Math.PI / 180,
                    l = Math.cos(f),
                    c = Math.sin(f);
                i *= l, s *= -c, o *= c, u *= l, e.style.filter = (e.style.filter || "").replace(/progid:DXImageTransform\.Microsoft\.Matrix\([^)]*\)/, "") + ("progid:DXImageTransform.Microsoft.Matrix(M11=" + i + ",M12=" + s + ",M21=" + o + ",M22=" + u + ",FilterType='bilinear',sizingMethod='auto expand')");
                var h = parseInt(e.style.width || e.width || 0),
                    p = parseInt(e.style.height || e.height || 0),
                    f = a * Math.PI / 180,
                    d = Math.abs(Math.cos(f)),
                    v = Math.abs(Math.sin(f)),
                    m = (h - (h * d + p * v)) / 2,
                    g = (p - (h * v + p * d)) / 2;
                return e.style.marginLeft = Math.floor(m) + "px", e.style.marginTop = Math.floor(g) + "px", !0
            }, s = e.cssHooks.transform.set;
            e.cssHooks.transform.set = function (e, t) {
                return s.apply(this, [e, t]), i(e, t), t
            }
        }
    }(jQuery), elFinder.prototype.commands.rm = function () {
        this.shortcuts = [{
            pattern: "delete ctrl+backspace"
        }], this.getstate = function (t) {
            var n = this.fm;
            return t = t || n.selected(), !this._disabled && t.length && e.map(t, function (e) {
                var t = n.file(e);
                return t && t.phash && !t.locked ? e : null
            }).length == t.length ? 0 : -1
        }, this.exec = function (t) {
            var n = this,
                r = this.fm,
                i = e.Deferred().fail(function (e) {
                    e && r.error(e)
                }),
                s = this.files(t),
                o = s.length,
                u = r.cwd().hash,
                a = !1;
            return !o || this._disabled ? i.reject() : (e.each(s, function (e, t) {
                if (!t.phash) return !i.reject(["errRm", t.name, "errPerm"]);
                if (t.locked) return !i.reject(["errLocked", t.name]);
                t.hash == u && (a = r.root(t.hash))
            }), i.state() == "rejected" || (s = this.hashes(t), r.confirm({
                title: n.title,
                text: "confirmRm",
                accept: {
                    label: "btnRm",
                    callback: function () {
                        r.lockfiles({
                            files: s
                        }), r.request({
                            data: {
                                cmd: "rm",
                                targets: s
                            },
                            notify: {
                                type: "rm",
                                cnt: o
                            },
                            preventFail: !0
                        }).fail(function (e) {
                            i.reject(e)
                        }).done(function (e) {
                            i.done(e), a && r.exec("open", a)
                        }).always(function () {
                            r.unlockfiles({
                                files: s
                            })
                        })
                    }
                },
                cancel: {
                    label: "btnCancel",
                    callback: function () {
                        i.reject()
                    }
                }
            })), i)
        }
    }, elFinder.prototype.commands.search = function () {
        this.title = "Find files", this.options = {
            ui: "searchbutton"
        }, this.alwaysEnabled = !0, this.updateOnSelect = !1, this.getstate = function () {
            return 0
        }, this.exec = function (t) {
            var n = this.fm;
            return typeof t == "string" && t ? (n.trigger("searchstart", {
                query: t
            }), n.request({
                data: {
                    cmd: "search",
                    q: t
                },
                notify: {
                    type: "search",
                    cnt: 1,
                    hideCnt: !0
                }
            })) : (n.getUI("toolbar").find("." + n.res("class", "searchbtn") + " :text").focus(), e.Deferred().reject())
        }
    }, elFinder.prototype.commands.sort = function () {
        this.options = {
            ui: "sortbutton"
        }, this.getstate = function () {
            return 0
        }, this.exec = function (t, n) {
            var r = this.fm,
                n = e.extend({
                    type: r.sortType,
                    order: r.sortOrder,
                    stick: r.sortStickFolders
                }, n);
            return this.fm.setSort(n.type, n.order, n.stick), e.Deferred().resolve()
        }
    }, elFinder.prototype.commands.up = function () {
        this.alwaysEnabled = !0, this.updateOnSelect = !1, this.shortcuts = [{
            pattern: "ctrl+up"
        }], this.getstate = function () {
            return this.fm.cwd().phash ? 0 : -1
        }, this.exec = function () {
            return this.fm.cwd().phash ? this.fm.exec("open", this.fm.cwd().phash) : e.Deferred().reject()
        }
    }, elFinder.prototype.commands.upload = function () {
        var t = this.fm.res("class", "hover");
        this.disableOnSearch = !0, this.updateOnSelect = !1, this.shortcuts = [{
            pattern: "ctrl+u"
        }], this.getstate = function () {
            return !this._disabled && this.fm.cwd().write ? 0 : -1
        }, this.exec = function (n) {
            var r = this.fm,
                i = function (e) {
                    o.elfinderdialog("close"), r.upload(e).fail(function (e) {
                        s.reject(e)
                    }).done(function (e) {
                        s.resolve(e)
                    })
                }, s, o, u, a, f;
            return this.disabled() ? e.Deferred().reject() : n && (n.input || n.files) ? r.upload(n) : (s = e.Deferred(), u = e('<input type="file" multiple="true"/>').change(function () {
                i({
                    input: u[0]
                })
            }), a = e('<div class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">' + r.i18n("selectForUpload") + "</span></div>").append(e("<form/>").append(u)).hover(function () {
                a.toggleClass(t)
            }), o = e('<div class="elfinder-upload-dialog-wrapper"/>').append(a), r.dragUpload && (f = e('<div class="ui-corner-all elfinder-upload-dropbox">' + r.i18n("dropFiles") + "</div>").prependTo(o).after('<div class="elfinder-upload-dialog-or">' + r.i18n("or") + "</div>")[0], f.addEventListener("dragenter", function (n) {
                n.stopPropagation(), n.preventDefault(), e(f).addClass(t)
            }, !1), f.addEventListener("dragleave", function (n) {
                n.stopPropagation(), n.preventDefault(), e(f).removeClass(t)
            }, !1), f.addEventListener("dragover", function (e) {
                e.stopPropagation(), e.preventDefault()
            }, !1), f.addEventListener("drop", function (e) {
                e.stopPropagation(), e.preventDefault(), i({
                    files: e.dataTransfer.files
                })
            }, !1)), r.dialog(o, {
                title: this.title,
                modal: !0,
                resizable: !1,
                destroyOnClose: !0
            }), s)
        }
    }, elFinder.prototype.commands.view = function () {
        this.value = this.fm.viewType, this.alwaysEnabled = !0, this.updateOnSelect = !1, this.options = {
            ui: "viewbutton"
        }, this.getstate = function () {
            return 0
        }, this.exec = function () {
            var e = this.fm.storage("view", this.value == "list" ? "icons" : "list");
            this.fm.viewchange(), this.update(void 0, e)
        }
    }
})(jQuery)
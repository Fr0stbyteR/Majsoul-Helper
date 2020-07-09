// ==UserScript==
// @name         Majsoul Helper
// @namespace    https://github.com/Fr0stbyteR/
// @version      0.4.15
// @description  dye recommended discarding tile with tenhou/2 + River tiles indication
// @author       Fr0stbyteR, FlyingBamboo
// @match        https://www.majsoul.com/*
// @match        https://game.maj-soul.com/*
// @match        https://majsoul.union-game.com/
// @match        https://game.mahjongsoul.com/
// @match        https://mahjongsoul.game.yo-star.com/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    class Helper {
        constructor() {
            this.reset();
            this.inject();
            this.appendButton();
            this.resetDefenseInfo();
        }
        reset() {
            this.auto = false;
            this._handHelper = +localStorage.handHelper || 0;
            this._riverHelper = +localStorage.riverHelper || 0;
            this.mountain = new Array(34).fill(4);
        }
        resetDefenseInfo() {
            this.defenseInfo = { mySeat: 0, river: [[], [], [], []], riichiPlayers: [], fuuro: [[], [], [], []], chang: 0, ju: 0 };
        }
        set handHelper(i) {
            this._handHelper = i;
            localStorage.handHelper = i;
            if (i == 0 && view.DesktopMgr.Inst && view.DesktopMgr.Inst.mainrole.hand.length) view.DesktopMgr.Inst.mainrole.hand.forEach(tile => tile._SetColor(new Laya.Vector4(1, 1, 1, 1)));
            if (i > 0) this.analyseHand();
        }
        set riverHelper(i) {
            this._riverHelper = i;
            localStorage.riverHelper = i;
            if (!view.DesktopMgr.Inst) return;
            if (i == 0) {
                for (let i = 0; i <= 3; i++) {
                    const player = view.DesktopMgr.Inst.players[i];
                    const tiles = player.container_qipai.pais.slice();
                    if (player.container_qipai.last_pai !== null) tiles.push(player.container_qipai.last_pai);
                    tiles.forEach(tile => {
                        if (tile.ismoqie) {
                            tile._ismoqie = tile.ismoqie;
                            tile.model.meshRender.sharedMaterial.setColor(caps.Cartoon.COLOR, new Laya.Vector4(1, 1, 1, 1));
                            delete tile.ismoqie;
                        }
                    })
                }
            } else {
                for (let i = 0; i <= 3; i++) {
                    const player = view.DesktopMgr.Inst.players[i];
                    const tiles = player.container_qipai.pais.slice();
                    if (player.container_qipai.last_pai !== null) tiles.push(player.container_qipai.last_pai);
                    tiles.forEach(tile => {
                        if (tile._ismoqie) {
                            tile.ismoqie = tile._ismoqie;
                            tile.model.meshRender.sharedMaterial.setColor(caps.Cartoon.COLOR, new Laya.Vector4(0.8, 0.8, 0.8, 1));
                            delete tile._ismoqie;
                        }
                    })
                }
            }
        }
        inject() {
            if (typeof uiscript === "undefined" || !uiscript.UI_DesktopInfo || typeof Laya.View.uiMap === "undefined" || !Laya.View.uiMap["mj/desktopInfo"]) return setTimeout(() => this.inject(), 1000);
            if (typeof view === "undefined" || !view.DesktopMgr || !view.DesktopMgr.prototype) return setTimeout(() => this.inject(), 1000);
            const actionsToInject = { ActionAnGangAddGang: 700, ActionBabei: 700, ActionChiPengGang: 700, ActionDealTile: 200, ActionDiscardTile: 500, ActionNewRound: 1500 };// as { [key: string]: number } // inject with proper timeout
            for (const key in actionsToInject) {
                const action = view[key];
                const delay = actionsToInject[key];
                const mToInject = ["play", "fastplay", "record", "fastrecord"];
                mToInject.forEach(mType => {
                    const m = action[mType].bind(action);
                    action[mType] = action => {
                        const r = m(action);
                        setTimeout(() => this.analyse(key, action, mType), delay + (key === "ActionNewRound" && action.al ? 1300 : 0));
                        // console.log(action);
                        return r;
                    }
                })
            }
            const m = view.DesktopMgr.prototype.setChoosedPai;
            view.DesktopMgr.prototype.setChoosedPai = e => {
                const r = m.call(view.DesktopMgr.Inst, e); // render normally
                if (e !== null) this.dyeRiver(e); // override rendering
                return r;
            }
            uiscript.UI_DesktopInfo.prototype.btn_seeinfo = function(t) {
                //if (view.DesktopMgr.Inst.mode != view.EMJMode.paipu && view.DesktopMgr.Inst.gameing) {
                var i = view.DesktopMgr.Inst.player_datas[view.DesktopMgr.Inst.localPosition2Seat(t)].account_id;
                i  && 0 != i && uiscript.UI_OtherPlayerInfo.Inst.show(i)
                //}
            }
            uiscript.UI_DesktopInfo.prototype.refreshSeat = function (e) {
                void 0 === e && (e = !1);
                view.DesktopMgr.Inst.seat;
                for (var t = view.DesktopMgr.Inst.player_datas, i = 0; i < 4; i++) {
                    var n = view.DesktopMgr.Inst.localPosition2Seat(i),
                        a = this._player_infos[i];
                    if (n < 0) a.container.visible = !1;
                    else {
                        a.container.visible = !0;
                        try {
                            var r = view.DesktopMgr.Inst.getPlayerName(n);
                            game.Tools.SetNickname(a.name, r);
                        } catch(e) {
                            a.name.text = t[n].nickname;
                            game.Tools.SetNickname(a.name, t[n]);
                        }
                            if (a.head.id = t[n].avatar_id,
                            a.head.set_head_frame(t[n].account_id, t[n].avatar_frame),
                            a.avatar = t[n].avatar_id,
                            a.level = new uiscript.UI_Level(this.me.getChildByName("container_player_" + i).getChildByName("head").getChildByName("level")),
                            a.level.id = t[n].level.id,
                            0 != i) {
                            var s = t[n].account_id && 0 != t[n].account_id,// && view.DesktopMgr.Inst.mode != view.EMJMode.paipu,
                                o = t[n].account_id && 0 != t[n].account_id && view.DesktopMgr.Inst.mode == view.EMJMode.play,
                                l = view.DesktopMgr.Inst.mode != view.EMJMode.play;
                            e ? a.headbtn.onChangeSeat(s, o, l) : a.headbtn.reset(s, o, l)
                        }
                        t[n].title ? a.title.id = game.Tools.titleLocalization(t[n].account_id, t[n].title) : a.title.id = 0
                    }
                }
            }
            for (let i = 5; i <= 8; i++) {
                Laya.View.uiMap["mj/desktopInfo"].child[i].child[2].child.push({
                    type: "Image",
                    props: { y: -10, x: -10, name: "level", scaleY: .5, scaleX: .5 },
                    child: [{
                        type: "Image",
                        props: { y: 0, x: 0, skin: "myres/rank_bg.png", name: "bg" }
                    }, {
                        type: "Image",
                        props: { y: 15, x: 0, skin: "extendRes/level/queshi.png", name: "icon" }
                    }, {
                        type: "Image",
                        props: {
                            y: 191, x: 58, skin: "myres/starbg.png", scaleY: 1, scaleX: 1, name: "star2", anchorY: .5, anchorX: .5 },
                        child: [{
                            type: "Image",
                            props: { y: 26, x: 27, skin: "myres/star.png", anchorY: .5, anchorX: .5 }
                        }]
                    }, {
                        type: "Image",
                        props: { y: 142, x: 29, skin: "myres/starbg.png", scaleY: .7, scaleX: .7, name: "star3", anchorY: .5, anchorX: .5 },
                        child: [{
                            type: "Image",
                            props: { y: 26, x: 27, skin: "myres/star.png", anchorY: .5, anchorX: .5 }
                        }]
                    }, {
                        type: "Image",
                        props: { y: 214, x: 110, skin: "myres/starbg.png", scaleY: .7, scaleX: .7, name: "star1", anchorY: .5, anchorX: .5 },
                        child: [{ type: "Image", props: { y: 26, x: 27, skin: "myres/star.png", anchorY: .5, anchorX: .5 } }]
                    }]
                })
            }
            console.log("Majsoul Helper injected.");
            // uiscript.UI_GameEnd.prototype.show = () => game.Scene_MJ.Inst.GameEnd();
            // uiscript.UI_PiPeiYuYue.Inst.addMatch(2);
        }
        appendButton() {
            const b = document.createElement("button");
            b.innerText = "雀魂辅助";
            b.style.position = "absolute";
            b.style.bottom = "0px";
            b.style.right = "0px";
            b.style.zIndex = 1000;
            b.addEventListener("click", () => {
                this.window = window.open("", "雀魂辅助", "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=380,height=380");
                const d = this.window.document;
                d.body.innerHTML = "";
                d.head.innerHTML = "";
                d.write(`
                    <html>
                        <head>
                            <title>雀魂辅助</title>
                            <style>
                                .mask {
                                    position: relative;
                                    display: inline-block;
                                    width: 40px;
                                    height: 64.5px;
                                    z-index: 10;
                                    background-color: black;
                                    opacity: 0
                                }
                            </style>
                        </head>
                        <body style="margin: 0px; background-color: black; color: white">
                            <div style="position: absolute; width: 360px; overflow: hidden;">
                                <img width="400" src="data:image/png;base64,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" />
                            </div>
                            <div id="masks" style="width: 360px;">
                            </div>
                            <div id="options" style=" margin: 5px;">
                                <div>
                                    <span>手牌提示</span>
                                    <input type="radio" id="hand0" value="0" name="hand"${this._handHelper === 0 ? " checked" : ""}>
                                    <label>无</label>
                                    <input type="radio" id="hand1" value="1" name="hand"${this._handHelper === 1 ? " checked" : ""}>
                                    <label>攻</label>
                                    <input type="radio" id="hand2" value="2" name="hand"${this._handHelper === 2 ? " checked" : ""}>
                                    <label>防</label>
                                </div>
                                <div>
                                    <span>牌河提示</span>
                                    <input type="radio" id="river0" value="0" name="river"${this._riverHelper === 0 ? " checked" : ""}>
                                    <label>关闭</label>
                                    <input type="radio" id="river1" value="1" name="river"${this._riverHelper === 1 ? " checked" : ""}>
                                    <label>仅模切</label>
                                    <input type="radio" id="river2" value="2" name="river"${this._riverHelper === 2 ? " checked" : ""}>
                                    <label>开启</label>
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                for (let i = 0; i < 34; i++) {
                    const div = d.createElement("div");
                    div.className = "mask";
                    let j = i;
                    if (i < 9) j += 18;
                    else if (i < 27 && i >= 9) j -= 9;
                    div.id = Helper.indexToString(j);
                    d.getElementById("masks").appendChild(div);
                }
                ["hand0", "hand1", "hand2"].forEach(str => d.getElementById(str).addEventListener("click", e => this.handHelper = +e.target.value));
                ["river0", "river1", "river2"].forEach(str => d.getElementById(str).addEventListener("click", e => this.riverHelper = +e.target.value));
            })
            document.body.appendChild(b);
            window.addEventListener("beforeunload", () => this.window.close());
        }
        analyse(key, action, mType) {
            this.calcMountain();
            if (mType !== "play") return;
            view.DesktopMgr.bianjietishi = true;
            if (key == "ActionNewRound") {
                view.DesktopMgr.Inst.setAutoHule(true);
                view.DesktopMgr.bianjietishi = true;
                uiscript.UIMgr.Inst._ui_desktop.refreshFuncBtnShow(uiscript.UIMgr.Inst._ui_desktop._container_fun.getChildByName("btn_autohu"), 1);
                if (this.auto) {
                    view.DesktopMgr.Inst.setAutoNoFulu(true);
                    uiscript.UIMgr.Inst._ui_desktop.refreshFuncBtnShow(uiscript.UIMgr.Inst._ui_desktop._container_fun.getChildByName("btn_autonoming"), 1);
                }
                this.resetDefenseInfo();
            }
            if (key == "ActionDiscardTile") {
                let tile = null;
                for (let i = 0; i < 4; i++) {
                    if (view.DesktopMgr.Inst.players[i].seat == action.seat) {
                        tile = view.DesktopMgr.Inst.lastqipai;
                        break;
                    }
                }
                this.defenseInfo.river[action.seat].push({ tileIndex: Helper.indexOfTile(tile.val.toString()), afterRiichi: this.defenseInfo.riichiPlayers.slice() });
                if (action.is_liqi || action.is_wliqi) this.defenseInfo.riichiPlayers.push(action.seat);
                if (action.moqie) {
                    if (this._riverHelper) {
                        tile.ismoqie = true;
                        tile.model.meshRender.sharedMaterial.setColor(caps.Cartoon.COLOR, new Laya.Vector4(0.8, 0.8, 0.8, 1));
                    } else {
                        tile._ismoqie = true;
                    }
                }
            }
            if (action.hasOwnProperty("operation")) {
                const operations = action.operation;
                if (this.auto) {
                    for (const operation of operations.operation_list) {
                        if (operation.type == 11) { // Babei
                            console.log("Babei");
                            setTimeout(() => uiscript.UI_LiQiZiMo.Inst.onBtn_BaBei(), Math.random() * 1000);
                            return;
                        }
                        if (operation.type == 7) {
                            console.log("Riichi");
                            view.DesktopMgr.Inst.mainrole.during_liqi = true;
                        }
                    }
                }
                for (const operation of operations.operation_list) {
                    if (operation.type == 1) {
                        this.defenseInfo.mySeat = view.DesktopMgr.Inst.seat;
                        this.defenseInfo.chang = view.DesktopMgr.Inst.index_change;
                        this.defenseInfo.ju = view.DesktopMgr.Inst.index_ju;
                        const option = this.analyseHand();
                        if (this.auto && typeof option === "number") setTimeout(() => this.discard(Helper.indexToString(option)), Math.random() * 2000 + 1000);
                    }
                }
            }
        }
        dyeRiver(tileIn) {
            if (this._riverHelper < 2) return;
            const warningColor = (tileSelected, tileRiverModel, isSelf) => {
                let color = tileRiverModel.ismoqie ? new Laya.Vector4(0.8, 0.8, 0.8, 1) : new Laya.Vector4(1, 1, 1, 1);
                const tileRiver = tileRiverModel.val;
                if (tileSelected.type !== tileRiver.type) return color;
                const delta = Math.abs(tileSelected.index - tileRiver.index);
                if (delta == 0) return new Laya.Vector4(.615, .827, .976, 1);
                if (tileSelected.type == 3) return color; // 字牌
                if (delta == 3 && !isSelf) { // 筋
                    if (tileSelected.index <= 6 && tileSelected.index >= 4) return new Laya.Vector4(1, 0.8, 0.8, 1);
                    return new Laya.Vector4(0.8, 1, 0.8, 1);
                }
                if (delta < 2) { // 壁
                    const tilesInMountain = this.mountain[Helper.indexOfTile(tileRiver.toString())];
                    if (tilesInMountain < 2) return new Laya.Vector4(1, 1, Math.min(1, tilesInMountain * 0.2 + 0.6), 1);
                }
                return color;
            }
            for (let i = 0; i <= 3; i++) {
                const isSelf = i === 0;
                const player = view.DesktopMgr.Inst.players[i];
                const tiles = [...player.container_qipai.pais, ...player.container_ming.pais];
                if (player.container_qipai.last_pai !== null) tiles.push(player.container_qipai.last_pai);
                tiles.forEach(tile => tile.model.meshRender.sharedMaterial.setColor(caps.Cartoon.COLOR, warningColor(tileIn, tile, isSelf)));
            }
        }
        handToString() {
            const handIn = view.DesktopMgr.Inst.mainrole.hand;
            let strOut = "";
            for (const tileInGameIn of handIn) {
                strOut += tileInGameIn.val.toString();
            }
            return tenhou.MPSZ.contract(strOut);
        }
        calcMountain() {
            this.mountain = new Array(34).fill(4);
            if (view.DesktopMgr.Inst.player_datas.length === 3) {
                for (let i = 1; i < 8; i++) {
                    this.mountain[i] = 0;
                }
            }
            const visibleTiles = [];
            view.DesktopMgr.Inst.players.forEach((player, i) => { // 别家弃牌和副露
                const seat = view.DesktopMgr.Inst.localPosition2Seat(i);
                this.defenseInfo.fuuro[seat] = [];
                const reinitRiver = player.container_qipai.pais.length && !this.defenseInfo.river[seat].length ? true : false;
                if (reinitRiver) this.defenseInfo.river[seat] = [];
				for (const tile of player.container_qipai.pais) {
					visibleTiles.push(tile.val.toString());
                    if (reinitRiver) this.defenseInfo.river[seat].push({ tileIndex: Helper.indexOfTile(tile.val.toString()), afterRiichi: []});
				}
				for (const tile of player.container_babei.pais) {
                    visibleTiles.push(tile.val.toString());
				}
                const lastTile = player.container_qipai.last_pai;
                if (lastTile !== null) visibleTiles.push(lastTile.val.toString());
                for (const tile of player.container_ming.pais) {
					visibleTiles.push(tile.val.toString());
                    this.defenseInfo.fuuro[seat].push(Helper.indexOfTile(tile.val.toString()));
				}
            })
            view.DesktopMgr.Inst.mainrole.hand.forEach(tile => { // 自家手牌
                visibleTiles.push(tile.val.toString());
            });
            view.DesktopMgr.Inst.dora.forEach(tile => { // 宝牌指示牌
                visibleTiles.push(tile.toString());
            });
            visibleTiles.forEach(strTile => this.mountain[Helper.indexOfTile(strTile)]--);
            this.displayMountain();
            return this.mountain;
        }
        displayMountain() {
            if (!this.window) return;
            const d = this.window.document;
            this.mountain.forEach((v, i) => {
                d.getElementById(Helper.indexToString(i)).style.opacity = (4 - v) / 5;
            })
        }
        analyseHand() {
            let option;
            if (!view.DesktopMgr.Inst || !view.DesktopMgr.Inst.mainrole.hand.length) return option;
            const hand = tenhou.MPSZ.exextract34(tenhou.MPSZ.expand(this.handToString())); // as number[34], hand tiles to mountain array
            const atkOptions = Helper.evaluateAttack(hand, this.mountain);
            const defOptions = Helper.evaluateDefense(hand, this.mountain, this.defenseInfo, view.DesktopMgr.Inst.player_datas.length);
            const atk = this._handHelper < 2 ? 1 : 0;
            let maxRate = -1;
            view.DesktopMgr.Inst.mainrole.hand.forEach(tile => {
                const tileIndex = Helper.indexOfTile(tile.val.toString());
                let atkRate = 0;
                let defRate = 0;
                for (const option of atkOptions) {
                    if (option.tileIndex === tileIndex) {
                        atkRate = option.rate;
                        break;
                    }
                }
                for (const option of defOptions) {
                    if (option.tileIndex === tileIndex) {
                        defRate = option.rate;
                        break;
                    }
                }
                const rate = atk * atkRate + (1 - atk) * defRate;
                if (rate > maxRate) {
                    option = tileIndex;
                    maxRate = rate;
                }
                const r = Math.max(0, rate ** 3 * -1) * 0.6;
                const g = Math.max(0, rate ** 3) * 0.6;
                if (this._handHelper) tile._SetColor(new Laya.Vector4(1 - g, 1 - r, 1 - r - g, 1));
            });
            return option;
        }
        static evaluateAttack(hand, mountain) { // as number[34]
            const restc = waitings => { // : number,
                let rest = 0;
                waitings.forEach(tileIndex => rest += mountain[tileIndex]);
                return rest;
            }
            const options = [];
            const syanten_org = tenhou.SYANTEN.calcSyanten2(hand, 34)[0]; // 向听数：-1 和牌，0 听牌
            if (syanten_org == -1) return options; // 和牌
            else if (syanten_org == 0) { // 听牌
                for (let i = 0; i < 34; i++) { // 遍历打/摸
                    if (!hand[i]) continue;
                    hand[i]--; // 打
                    const waitings = [];
                    for (let j = 0; j < 34; j++) {
                        if (i == j || hand[j] >= 4) continue;
                        hand[j]++; // 摸
                        if (tenhou.AGARI.isAgari(hand)) waitings.push(j);
                        hand[j]--;
                    }
                    hand[i]++;
                    if (waitings.length) options.push({ tileIndex: i, n: restc(waitings) });
                }
            } else {
                for (let i = 0; i < 34; i++) {
                    if (!hand[i]) continue;
                    hand[i]--; // 打
                    const waitings = [];
                    for (let j = 0; j < 34; ++j) {
                        if (i == j || hand[j] >= 4) continue;
                        hand[j]++; // 摸
                        if (tenhou.SYANTEN.calcSyanten2(hand, 34)[0] == syanten_org - 1) waitings.push(j);
                        hand[j]--;
                    }
                    hand[i]++;
                    if (waitings.length) options.push({ tileIndex: i, n: restc(waitings) });
                }
            }
            if (!options.length) return options;
            options.sort((a, b) => b.n - a.n);
            let maxn = options[0].n;
            options.forEach(option => option.rate = option.n / maxn);
            return options;
        }
        /**
         *
         * @static
         * @param {number[]} hand - number[34]
         * @param {number[]} mountain - number[34]
         * @param {{ mySeat: number, riichiPlayers: number[], river: { tileIndex: number, afterRiichi: number[] }[], fuuro: number[][], chang: number, ju: number }} defenseInfo
         * @param {number} playersCount
         */
        static evaluateDefense(hand, mountain, defenseInfo, playersCount) {
            const getTilesOfOthersAfterRiichi = (seat, mySeat) => {
                const tiles = [];
                for (let i = 0; i < 4; i++) {
                    if (i === mySeat) continue;
                    if (i === seat) continue;
                    for (const tile of defenseInfo.river[i]) {
                        if (tile.afterRiichi.indexOf(seat) >= 0) {
                            tiles.push(tile);
                        }
                    }
                }
                return tiles;
            };
            const findGenbutsuInRiver = (tileIndex, seat, mySeat) => {
                for (const tile of defenseInfo.river[seat]) {
                    if (tile.tileIndex === tileIndex) return true;
                }
                if (defenseInfo.riichiPlayers.indexOf(seat) === -1) return false;
                for (const tile of getTilesOfOthersAfterRiichi(seat, mySeat)) {
                    if (tile.tileIndex === tileIndex) return true;
                }
                return false;
            }
            const isYakuhai = (tileIndex, seat) => {
                if (!this.TILE_GROUP.Z[tileIndex]) return false;
                const n = tileIndex - 27;
                return n >= 4 || n == (seat - defenseInfo.ju + 4) % 4 || n == defenseInfo.chang;
            };
            const playersDangerRate = [];
            const mySeat = defenseInfo.mySeat;
            for (let seat = 0; seat < 4; seat++) { // Evaluate danger rates
                playersDangerRate[seat] = 0;
                if (seat === mySeat) continue;
                if (defenseInfo.riichiPlayers.indexOf(seat) >= 0) {
                    playersDangerRate[seat] = 1;
                    continue;
                }
                playersDangerRate[seat] += Math.min(defenseInfo.river[seat].length / 12, 0.8); // For each discard + 1/12
                playersDangerRate[seat] += defenseInfo.fuuro[seat].length * 0.1; // For each tile of fuuro + 0.1
                playersDangerRate[seat] = Math.min(playersDangerRate[seat], 1);
            }
            const safetyRate = [];
            hand.forEach((count, tileIndex) => { // Evaluate hand tiles
                if (!count) return;
                safetyRate[tileIndex] = [];
                for (let seat = 0; seat < 4; seat++) {
                    if (seat === mySeat) continue;
                    safetyRate[tileIndex][seat] = 1;
                    if (findGenbutsuInRiver(tileIndex, seat, mySeat)) { // Genbutsu
                        safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Genbutsu[0];
                        continue;
                    }
                    if (this.TILE_GROUP.Z[tileIndex]) {
                        if (mountain[tileIndex] === 0) { // TankiZ
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.TankiZ[0];
                        } else {
                            if (isYakuhai(tileIndex, seat)) { // Yakuhai
                                safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Yakuhai[0];
                            } else { // Kyakufuu
                                safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Kyakufuu[0];
                                safetyRate[tileIndex][seat] += this.TILE_SAFETY_RATE.Kyakufuu[1] * (3 - mountain[tileIndex]);
                            }
                        }
                        continue;
                    }
                    if (this.TILE_GROUP.N19[tileIndex]) { // Suji19
                        const suji = tileIndex + (tileIndex % 9 === 0 ? 3 : -3);
                        const hasSuji = findGenbutsuInRiver(suji, seat, mySeat);
                        if (hasSuji) {
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Suji19[0];
                            safetyRate[tileIndex][seat] += this.TILE_SAFETY_RATE.Suji19[1] * (3 - mountain[suji]);
                        } else { // Musuji19
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Musuji19[0];
                        }
                        continue;
                    }
                    if (this.TILE_GROUP.N28[tileIndex]) { // Suji28
                        const suji = tileIndex + (tileIndex % 9 === 1 ? 3 : -3);
                        const hasSuji = findGenbutsuInRiver(suji, seat, mySeat);
                        if (hasSuji) {
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Suji28[0];
                        } else { // Musuji28
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Musuji2378[0];
                        }
                        continue;
                    }
                    if (this.TILE_GROUP.N456[tileIndex]) { // Nakasuji 456
                        const suji1 = tileIndex - 3;
                        const suji2 = tileIndex + 3;
                        const hasSuji1 = findGenbutsuInRiver(suji1, seat, mySeat);
                        const hasSuji2 = findGenbutsuInRiver(suji2, seat, mySeat);
                        if (hasSuji1 && hasSuji2) {
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.NakaSuji[0];
                        } else if (hasSuji1 || hasSuji2) { // Katasuji
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Katasuji[0];
                        } else { // Musuji
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Musuji456[0];
                        }
                        continue;
                    }
                    if (this.TILE_GROUP.N37[tileIndex]) { // Suji37
                        const suji = tileIndex + (tileIndex % 9 === 2 ? 3 : -3);
                        const hasSuji = findGenbutsuInRiver(suji, seat, mySeat);
                        if (hasSuji) {
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Suji37[0];
                        } else { // Musuji37
                            safetyRate[tileIndex][seat] = this.TILE_SAFETY_RATE.Musuji2378[0];
                        }
                        continue;
                    }
                }
            })
            const options = [];
            safetyRate.forEach((tileRate, tileIndex) => {
                if (!tileRate) return;
                options.push({ tileIndex, rate: tileRate.reduce((a, v, i) => typeof v === "number" ? Math.min(a, (v - 1) * playersDangerRate[i] + 1) : a, 1) })
            })
            options.sort((a, b) => b.rate - a.rate);
            return options;
        }
        discard(tileIn) {
            const mainrole = view.DesktopMgr.Inst.mainrole;
            const handIn = mainrole.hand;
            for (let i = 0; i < handIn.length; i++) {
                const tile = handIn[i];
                if (tile.val.toString() == tileIn) {
                    mainrole._choose_pai = handIn[i]; // setChoosePai
                    mainrole.DoDiscardTile();
                    return;
                }
            }
            if (tileIn.substr(0, 1) == "5") tileIn = tileIn.replace("5", "0");
            for (let i = 0; i < handIn.length; i++) {
                const tile = handIn[i];
                if (tile.val.toString() == tileIn) {
                    mainrole._choose_pai = handIn[i]; // setChoosePai
                    mainrole.DoDiscardTile();
                    return;
                }
            }
        }
        getFromHand(tileIn) { // : Tile[]
            const handIn = view.DesktopMgr.Inst.mainrole.hand;
            const result = [];
            handIn.forEach(tile => tile.val.toString() == tileIn ? result.push(tile) : null);
            if (tileIn.match(/5[mps]/) !== null) tileIn = tileIn.replace("5", "0");
            handIn.forEach(tile => tile.val.toString() == tileIn ? result.push(tile) : null);
            return result;
        }
        static indexOfTile(str) {
            const match = str.match(/(\d)([mpsz])/);
            if (match === null) return -1;
            return "mpsz".indexOf(match[2]) * 9 + (+match[1] === 0 ? 5 : +match[1]) - 1;
        }
        static indexToString(i) {
            return (i % 9 + 1) + "mpsz"[parseInt(i / 9)];
        }
    }
    Helper.TILE_SAFETY_RATE = {
        Genbutsu: [1, 0], // 现物
        TankiZ: [0.9, 0], // 单骑字牌
        Suji19: [0.4, 0.2], // 筋牌19 仅单骑 看牌数
        Kyakufuu: [0.2, 0.3], // 客风 看牌数
        Suji28: [0.2, 0], // 筋牌28
        NakaSuji: [0.2, 0], // 两筋456
        Suji37: [0, 0], //筋牌37
        Yakuhai: [-0.2, 0], // 役牌
        Musuji19: [-0.5, 0], // 无筋19
        Katasuji: [-0.5, 0], // 半筋456
        Musuji2378: [-0.75, 0], // 无筋2378
        Musuji456: [-1, 0] //无筋456
    }
    Helper.TILE_GROUP = {
        Z: new Array(34).fill(false).map((v, i) => i >= 27 ? true : false),
        N19: new Array(34).fill(false).map((v, i) => i < 27 && (i % 9 === 0 || i % 9 === 8) ? true : false),
        N28: new Array(34).fill(false).map((v, i) => i < 27 && (i % 9 === 1 || i % 9 === 7) ? true : false),
        N37: new Array(34).fill(false).map((v, i) => i < 27 && (i % 9 === 2 || i % 9 === 6) ? true : false),
        N456: new Array(34).fill(false).map((v, i) => i < 27 && (i % 9 >= 3 && i % 9 <= 5) ? true : false),
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // TENHOU.NET (C)C-EGG http://tenhou.net/
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    var MPSZ = {
        aka: true,
        fromHai136: function (hai136) {
            var a = (hai136 >> 2);
            if (!this.aka) return ((a % 9) + 1) + "mpsz".substr(a / 9, 1);
            return (a < 27 && (hai136 % 36) == 16 ? "0" : ((a % 9) + 1)) + "mpsz".substr(a / 9, 1);
        },
        expand: function (t) {
            return t
                .replace(/(\d)(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{8})(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9")
                .replace(/(\d?)(\d?)(\d?)(\d?)(\d?)(\d?)(\d)(\d)(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9") // 57???A???????
                .replace(/(m|p|s|z)(m|p|s|z)+/g, "$1")
                .replace(/^[^\d]/, "");
        },
        contract: function (t) {
            return t
                .replace(/\d(m|p|s|z)(\d\1)*/g, "$&:")
                .replace(/(m|p|s|z)([^:])/g, "$2")
                .replace(/:/g, "");
        },
        exsort: function (t) {
            return t
                .replace(/(\d)(m|p|s|z)/g, "$2$1$1,")
                .replace(/00/g, "50")
                .split(",").sort().join("")
                .replace(/(m|p|s|z)\d(\d)/g, "$2$1");
        },
        exextract136: function (t) {
            var s = t
                .replace(/(\d)m/g, "0$1")
                .replace(/(\d)p/g, "1$1")
                .replace(/(\d)s/g, "2$1")
                .replace(/(\d)z/g, "3$1");
            var i, c = new Array(136);
            for (i = 0; i < s.length; i += 2) {
                var n = s.substr(i, 2),
                    k = -1;
                if (n % 10) {
                    var b = (9 * Math.floor(n / 10) + ((n % 10) - 1)) * 4;
                    k = (!c[b + 3] ? b + 3 : !c[b + 2] ? b + 2 : !c[b + 1] ? b + 1 : b);
                } else {
                    k = (9 * n / 10 + 4) * 4 + 0; // aka5
                }
                if (c[k]) console.error("err n=" + n + " k=" + k + "<br>");
                c[k] = 1;
            }
            return c;
        },
        exextract34: function (t) { // Hand tiles to mountain array
            var s = t
                .replace(/(\d)m/g, "0$1")
                .replace(/(\d)p/g, "1$1")
                .replace(/(\d)s/g, "2$1")
                .replace(/(\d)z/g, "3$1");
            var mountain = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (var i = 0; i < s.length; i += 2) {
                var strTile = s.substr(i, 2),
                    index = -1;
                if (strTile % 10) {
                    index = 9 * Math.floor(strTile / 10) + ((strTile % 10) - 1);
                } else {
                    index = 9 * strTile / 10 + 4; // aka5
                }
                if (mountain[index] > 4) console.error("err n=" + strTile + " k=" + index + "<br>");
                mountain[index]++;
            }
            return mountain;
        },
        compile136: function (c) {
            var i, s = "";
            for (i = 0; i < 136; ++i)
                if (c[i]) s += MPSZ.fromHai136(i);
            return s;
        }
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // TENHOU.NET (C)C-EGG http://tenhou.net/
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    function AGARIPATTERN() {
        this.toitsu34 = [-1, -1, -1, -1, -1, -1, -1];
        this.v = [{
            atama34: -1,
            mmmm35: 0
        }, {
            atama34: -1,
            mmmm35: 0
        }, {
            atama34: -1,
            mmmm35: 0
        }, {
            atama34: -1,
            mmmm35: 0
        }]; // 一般形の面子の取り方は高々４つ
        // mmmm35=( 21(順子)+34(暗刻)+34(槓子)+1(ForZeroInvalid) )*0x01010101 | 0x80808080(喰い)
    }
    AGARIPATTERN.prototype = {
        //	isKokushi:function(){return this.v[0].mmmm35==0xFFFFFFFF;},
        //	isChiitoi:function(){return this.v[3].mmmm35==0xFFFFFFFF;},

        cc2m: function (c, d) {
            return (c[d + 0] << 0) | (c[d + 1] << 3) | (c[d + 2] << 6) |
                (c[d + 3] << 9) | (c[d + 4] << 12) | (c[d + 5] << 15) |
                (c[d + 6] << 18) | (c[d + 7] << 21) | (c[d + 8] << 24);
        },
        getAgariPattern: function (c, n) {
            if (n != 34) return false;
            var e = this;
            var v = e.v;
            var j = (1 << c[27]) | (1 << c[28]) | (1 << c[29]) | (1 << c[30]) | (1 << c[31]) | (1 << c[32]) | (1 << c[33]);
            if (j >= 0x10) return false; // 字牌が４枚
            // 国士無双 // １４枚のみ
            if (((j & 3) == 2) && (c[0] * c[8] * c[9] * c[17] * c[18] * c[26] * c[27] * c[28] * c[29] * c[30] * c[31] * c[32] * c[33] == 2)) {
                var i, a = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
                for (i = 0; i < 13; ++i)
                    if (c[a[i]] == 2) break;
                v[0].atama34 = a[i];
                v[0].mmmm35 = 0xFFFFFFFF;
                return true;
            }
            if (j & 2) return false; // 字牌が１枚
            var ok = false;
            // 七対子 // １４枚のみ
            if (!(j & 10) && (
                    (c[0] == 2) + (c[1] == 2) + (c[2] == 2) + (c[3] == 2) + (c[4] == 2) + (c[5] == 2) + (c[6] == 2) + (c[7] == 2) + (c[8] == 2) +
                    (c[9] == 2) + (c[10] == 2) + (c[11] == 2) + (c[12] == 2) + (c[13] == 2) + (c[14] == 2) + (c[15] == 2) + (c[16] == 2) + (c[17] == 2) +
                    (c[18] == 2) + (c[19] == 2) + (c[20] == 2) + (c[21] == 2) + (c[22] == 2) + (c[23] == 2) + (c[24] == 2) + (c[25] == 2) + (c[26] == 2) +
                    (c[27] == 2) + (c[28] == 2) + (c[29] == 2) + (c[30] == 2) + (c[31] == 2) + (c[32] == 2) + (c[33] == 2)) == 7) {
                v[3].mmmm35 = 0xFFFFFFFF;
                var i, n = 0;
                for (i = 0; i < 34; ++i)
                    if (c[i] == 2) e.toitsu34[n] = i, n += 1;
                ok = true;
                // 二盃口へ
            }
            // 一般形
            var n00 = c[0] + c[3] + c[6],
                n01 = c[1] + c[4] + c[7],
                n02 = c[2] + c[5] + c[8];
            var n10 = c[9] + c[12] + c[15],
                n11 = c[10] + c[13] + c[16],
                n12 = c[11] + c[14] + c[17];
            var n20 = c[18] + c[21] + c[24],
                n21 = c[19] + c[22] + c[25],
                n22 = c[20] + c[23] + c[26];
            var k0 = (n00 + n01 + n02) % 3;
            if (k0 == 1) return ok; // 余る
            var k1 = (n10 + n11 + n12) % 3;
            if (k1 == 1) return ok; // 余る
            var k2 = (n20 + n21 + n22) % 3;
            if (k2 == 1) return ok; // 余る
            if ((k0 == 2) + (k1 == 2) + (k2 == 2) +
                (c[27] == 2) + (c[28] == 2) + (c[29] == 2) + (c[30] == 2) +
                (c[31] == 2) + (c[32] == 2) + (c[33] == 2) != 1) return ok; // 頭の場所は１つ
            if (j & 8) { // 字牌３枚
                if (c[27] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 27 + 1;
                if (c[28] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 28 + 1;
                if (c[29] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 29 + 1;
                if (c[30] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 30 + 1;
                if (c[31] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 31 + 1;
                if (c[32] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 32 + 1;
                if (c[33] == 3) v[0].mmmm35 <<= 8, v[0].mmmm35 |= 21 + 33 + 1;
            }
            var n0 = n00 + n01 + n02,
                kk0 = (n00 * 1 + n01 * 2) % 3,
                m0 = e.cc2m(c, 0);
            var n1 = n10 + n11 + n12,
                kk1 = (n10 * 1 + n11 * 2) % 3,
                m1 = e.cc2m(c, 9);
            var n2 = n20 + n21 + n22,
                kk2 = (n20 * 1 + n21 * 2) % 3,
                m2 = e.cc2m(c, 18);
            //		document.write("n="+n0+" "+n1+" "+n2+" k="+k0+" "+k1+" "+k2+" kk="+kk0+" "+kk1+" "+kk2+" mmmm="+v[0].mmmm35+"<br>");
            if (j & 4) { // 字牌が頭
                if (k0 | kk0 | k1 | kk1 | k2 | kk2) return ok;
                if (c[27] == 2) v[0].atama34 = 27;
                else if (c[28] == 2) v[0].atama34 = 28;
                else if (c[29] == 2) v[0].atama34 = 29;
                else if (c[30] == 2) v[0].atama34 = 30;
                else if (c[31] == 2) v[0].atama34 = 31;
                else if (c[32] == 2) v[0].atama34 = 32;
                else if (c[33] == 2) v[0].atama34 = 33;
                if (n0 >= 9) {
                    if (e.GetMentsu(1, m1) && e.GetMentsu(2, m2) && e.GetMentsu9Fin(0, m0)) return true;
                } else if (n1 >= 9) {
                    if (e.GetMentsu(2, m2) && e.GetMentsu(0, m0) && e.GetMentsu9Fin(1, m1)) return true;
                } else if (n2 >= 9) {
                    if (e.GetMentsu(0, m0) && e.GetMentsu(1, m1) && e.GetMentsu9Fin(2, m2)) return true;
                } else if (e.GetMentsu(0, m0) && e.GetMentsu(1, m1) && e.GetMentsu(2, m2)) return true; // 一意
            } else if (k0 == 2) { // 萬子が頭
                if (k1 | kk1 | k2 | kk2) return ok;
                if (n0 >= 8) {
                    if (e.GetMentsu(1, m1) && e.GetMentsu(2, m2) && e.GetAtamaMentsu8Fin(kk0, 0, m0)) return true;
                } else if (n1 >= 9) {
                    if (e.GetMentsu(2, m2) && e.GetAtamaMentsu(kk0, 0, m0) && e.GetMentsu9Fin(1, m1)) return true;
                } else if (n2 >= 9) {
                    if (e.GetAtamaMentsu(kk0, 0, m0) && e.GetMentsu(1, m1) && e.GetMentsu9Fin(2, m2)) return true;
                } else if (e.GetMentsu(1, m1) && e.GetMentsu(2, m2) && e.GetAtamaMentsu(kk0, 0, m0)) return true; // 一意
            } else if (k1 == 2) { // 筒子が頭
                if (k2 | kk2 | k0 | kk0) return ok;
                if (n1 >= 8) {
                    if (e.GetMentsu(2, m2) && e.GetMentsu(0, m0) && e.GetAtamaMentsu8Fin(kk1, 1, m1)) return true;
                } else if (n2 >= 9) {
                    if (e.GetMentsu(0, m0) && e.GetAtamaMentsu(kk1, 1, m1) && e.GetMentsu9Fin(2, m2)) return true;
                } else if (n0 >= 9) {
                    if (e.GetAtamaMentsu(kk1, 1, m1) && e.GetMentsu(2, m2) && e.GetMentsu9Fin(0, m0)) return true;
                } else if (e.GetMentsu(2, m2) && e.GetMentsu(0, m0) && e.GetAtamaMentsu(kk1, 1, m1)) return true; // 一意
            } else if (k2 == 2) { // 索子が頭
                if (k0 | kk0 | k1 | kk1) return ok;
                if (n2 >= 8) {
                    if (e.GetMentsu(0, m0) && e.GetMentsu(1, m1) && e.GetAtamaMentsu8Fin(kk2, 2, m2)) return true;
                } else if (n0 >= 9) {
                    if (e.GetMentsu(1, m1) && e.GetAtamaMentsu(kk2, 2, m2) && e.GetMentsu9Fin(0, m0)) return true;
                } else if (n1 >= 9) {
                    if (e.GetAtamaMentsu(kk2, 2, m2) && e.GetMentsu(0, m0) && e.GetMentsu9Fin(1, m1)) return true;
                } else if (e.GetMentsu(0, m0) && e.GetMentsu(1, m1) && e.GetAtamaMentsu(kk2, 2, m2)) return true; // 一意
            }
            v[0].mmmm35 = 0; // 一般形不発
            return ok;
        },

        // private:
        GetMentsu: function (col, m) { // ６枚以下は一意
            var e = this;
            var mmmm = e.v[0].mmmm35;
            var i, a = (m & 7),
                b = 0,
                c = 0;
            for (i = 0; i < 7; ++i) {
                switch (a) {
                    case 4:
                        mmmm <<= 16, mmmm |= ((21 + col * 9 + i + 1) << 8) | (col * 7 + i + 1), b += 1, c += 1;
                        break;
                    case 3:
                        mmmm <<= 8, mmmm |= (21 + col * 9 + i + 1);
                        break;
                    case 2:
                        mmmm <<= 16, mmmm |= (col * 7 + i + 1) * 0x0101, b += 2, c += 2;
                        break;
                    case 1:
                        mmmm <<= 8, mmmm |= (col * 7 + i + 1), b += 1, c += 1;
                        break;
                    case 0:
                        break;
                    default:
                        return false;
                }
                m >>= 3, a = (m & 7) - b, b = c, c = 0;
            }
            if (a == 3) mmmm <<= 8, mmmm |= (21 + col * 9 + 7 + 1);
            else if (a) return false; // ⑧
            m >>= 3, a = (m & 7) - b;
            if (a == 3) mmmm <<= 8, mmmm |= (21 + col * 9 + 8 + 1);
            else if (a) return false; // ⑨
            e.v[0].mmmm35 = mmmm;
            //		DBGPRINT((_T("GetMentsu col=%d mmmm=%X\r\n"),col,mmmm));
            return true;
        },
        GetAtamaMentsu: function (nn, col, m) { // ５枚以下は一意
            var e = this;
            var a = (7 << (24 - nn * 3));
            var b = (2 << (24 - nn * 3));
            if ((m & a) >= b && e.GetMentsu(col, m - b)) return e.v[0].atama34 = col * 9 + 8 - nn, true;
            a >>= 9, b >>= 9;
            if ((m & a) >= b && e.GetMentsu(col, m - b)) return e.v[0].atama34 = col * 9 + 5 - nn, true;
            a >>= 9, b >>= 9;
            if ((m & a) >= b && e.GetMentsu(col, m - b)) return e.v[0].atama34 = col * 9 + 2 - nn, true;
            return false;
        },
        GetMentsu9: function (mmmm, col, m, v) { // const // ９枚以上
            // 面子選択は四連刻（１２枚）三連刻（９枚以上）しかない
            var s = -1; // 三連刻
            var i, a = (m & 7),
                b = 0,
                c = 0;
            for (i = 0; i < 7; ++i) {
                if (m == 0x6DB) break; // 四連刻 // 三暗対々が高目 // １２枚のみ
                switch (a) {
                    case 4:
                        mmmm <<= 8, mmmm |= (col * 7 + i + 1), b += 1, c += 1; // nobreak // 平和二盃口が三暗刻より高目
                        break;
                    case 3: // 帯幺九系が高目、ロン平和一盃口以外は三暗刻が高目
                        if (((m >> 3) & 7) >= 3 + b && ((m >> 6) & 7) >= 3 + c) s = i, b += 3, c += 3; // 三連刻
                        else mmmm <<= 8, mmmm |= (21 + col * 9 + i + 1);
                        break;
                    case 2:
                        mmmm <<= 16, mmmm |= (col * 7 + i + 1) * 0x0101, b += 2, c += 2;
                        break;
                    case 1:
                        mmmm <<= 8, mmmm |= (col * 7 + i + 1), b += 1, c += 1;
                        break;
                    case 0:
                        break;
                    default:
                        return 0;
                }
                m >>= 3, a = (m & 7) - b, b = c, c = 0;
            }
            if (i < 7) { // 四連刻を展開
                v[0] = (21 + col * 9 + i + 1) * 0x01010101 + 0x00010203;
                v[1] = (col * 7 + i + 1 + 1) * 0x010101 | (21 + col * 9 + i + 0 + 1) << 24;
                v[2] = (col * 7 + i + 0 + 1) * 0x010101 | (21 + col * 9 + i + 3 + 1) << 24;
                return 3;
            }
            if (a == 3) mmmm <<= 8, mmmm |= (21 + col * 9 + 7 + 1);
            else if (a) return 0; // ⑧
            m >>= 3, a = (m & 7) - b;
            if (a == 3) mmmm <<= 8, mmmm |= (21 + col * 9 + 8 + 1);
            else if (a) return 0; // ⑨

            if (s != -1) { // 三連刻を展開
                mmmm <<= 24;
                v[0] = mmmm | ((21 + col * 9 + s + 1) * 0x010101 + 0x000102);
                v[1] = mmmm | ((col * 7 + s + 1) * 0x010101);
                v[2] = 0;
                return 2;
            }
            v[0] = mmmm, v[1] = v[2] = 0;
            return 1;
        },
        GetMentsu9Fin: function (col, m) { // ９枚以上
            var e = this;
            var v = e.v;
            var mm = [0, 0, 0];
            if (!e.GetMentsu9(v[0].mmmm35, col, m, mm)) return false;
            var n = 0;
            if (mm[0]) v[n].atama34 = v[0].atama34, v[n].mmmm35 = mm[0], ++n;
            if (mm[1]) v[n].atama34 = v[0].atama34, v[n].mmmm35 = mm[1], ++n;
            if (mm[2]) v[n].atama34 = v[0].atama34, v[n].mmmm35 = mm[2], ++n;
            //		document.write("GetMentsu9Fin col="+col+" n="+n+"<br>");
            return n != 0;
        },
        GetAtamaMentsu8Fin: function (nn, col, m) { // ８枚以上
            var e = this;
            var v = e.v;
            var mmmm = v[0].mmmm35;
            var mm = [0, 0, 0];
            var a = (7 << (24 - nn * 3));
            var b = (2 << (24 - nn * 3));
            var n = 0;
            if ((m & a) >= b && e.GetMentsu9(mmmm, col, m - b, mm)) {
                if (mm[0]) v[n].atama34 = col * 9 + 8 - nn, v[n].mmmm35 = mm[0], ++n;
                if (mm[1]) v[n].atama34 = col * 9 + 8 - nn, v[n].mmmm35 = mm[1], ++n;
                if (mm[2]) v[n].atama34 = col * 9 + 8 - nn, v[n].mmmm35 = mm[2], ++n;
            }
            a >>= 9, b >>= 9;
            if ((m & a) >= b && e.GetMentsu9(mmmm, col, m - b, mm)) {
                if (mm[0]) v[n].atama34 = col * 9 + 5 - nn, v[n].mmmm35 = mm[0], ++n;
                if (mm[1]) v[n].atama34 = col * 9 + 5 - nn, v[n].mmmm35 = mm[1], ++n;
                if (mm[2]) v[n].atama34 = col * 9 + 5 - nn, v[n].mmmm35 = mm[2], ++n;
            }
            a >>= 9, b >>= 9;
            if ((m & a) >= b && e.GetMentsu9(mmmm, col, m - b, mm)) {
                if (mm[0]) v[n].atama34 = col * 9 + 2 - nn, v[n].mmmm35 = mm[0], ++n;
                if (mm[1]) v[n].atama34 = col * 9 + 2 - nn, v[n].mmmm35 = mm[1], ++n;
                if (mm[2]) v[n].atama34 = col * 9 + 2 - nn, v[n].mmmm35 = mm[2], ++n;
            }
            //		document.write("GetAtamaMentsu8Fin col="+col+" n="+n+"<br>");
            return n != 0;
        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // TENHOU.NET (C)C-EGG http://tenhou.net/
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    var AGARI = { // 和了判定のみ // SYANTENで-1検査より高速
        isMentsu: function (m) {
            var a = (m & 7),
                b = 0,
                c = 0;
            if (a == 1 || a == 4) b = c = 1;
            else if (a == 2) b = c = 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a < 0) return false;
            b = c, c = 0;
            if (a == 1 || a == 4) b += 1, c += 1;
            else if (a == 2) b += 2, c += 2;
            m >>= 3, a = (m & 7) - b;
            if (a != 0 && a != 3) return false;
            m >>= 3, a = (m & 7) - c;
            return a == 0 || a == 3;
        },
        isAtamaMentsu: function (nn, m) {
            if (nn == 0) {
                if ((m & (7 << 6)) >= (2 << 6) && this.isMentsu(m - (2 << 6))) return true;
                if ((m & (7 << 15)) >= (2 << 15) && this.isMentsu(m - (2 << 15))) return true;
                if ((m & (7 << 24)) >= (2 << 24) && this.isMentsu(m - (2 << 24))) return true;
            } else if (nn == 1) {
                if ((m & (7 << 3)) >= (2 << 3) && this.isMentsu(m - (2 << 3))) return true;
                if ((m & (7 << 12)) >= (2 << 12) && this.isMentsu(m - (2 << 12))) return true;
                if ((m & (7 << 21)) >= (2 << 21) && this.isMentsu(m - (2 << 21))) return true;
            } else if (nn == 2) {
                if ((m & (7 << 0)) >= (2 << 0) && this.isMentsu(m - (2 << 0))) return true;
                if ((m & (7 << 9)) >= (2 << 9) && this.isMentsu(m - (2 << 9))) return true;
                if ((m & (7 << 18)) >= (2 << 18) && this.isMentsu(m - (2 << 18))) return true;
            }
            return false;
        },
        cc2m: function (c, d) {
            return (c[d + 0] << 0) | (c[d + 1] << 3) | (c[d + 2] << 6) |
                (c[d + 3] << 9) | (c[d + 4] << 12) | (c[d + 5] << 15) |
                (c[d + 6] << 18) | (c[d + 7] << 21) | (c[d + 8] << 24);
        },
        isAgari: function (c) {
            var j = (1 << c[27]) | (1 << c[28]) | (1 << c[29]) | (1 << c[30]) | (1 << c[31]) | (1 << c[32]) | (1 << c[33]);
            if (j >= 0x10) return false; // 字牌が４枚
            // 国士無双 // １４枚のみ
            if (((j & 3) == 2) && (c[0] * c[8] * c[9] * c[17] * c[18] * c[26] * c[27] * c[28] * c[29] * c[30] * c[31] * c[32] * c[33] == 2)) return true;
            // 七対子 // １４枚のみ
            if (!(j & 10) && (
                    (c[0] == 2) + (c[1] == 2) + (c[2] == 2) + (c[3] == 2) + (c[4] == 2) + (c[5] == 2) + (c[6] == 2) + (c[7] == 2) + (c[8] == 2) +
                    (c[9] == 2) + (c[10] == 2) + (c[11] == 2) + (c[12] == 2) + (c[13] == 2) + (c[14] == 2) + (c[15] == 2) + (c[16] == 2) + (c[17] == 2) +
                    (c[18] == 2) + (c[19] == 2) + (c[20] == 2) + (c[21] == 2) + (c[22] == 2) + (c[23] == 2) + (c[24] == 2) + (c[25] == 2) + (c[26] == 2) +
                    (c[27] == 2) + (c[28] == 2) + (c[29] == 2) + (c[30] == 2) + (c[31] == 2) + (c[32] == 2) + (c[33] == 2)) == 7) return true;
            // 一般系
            if (j & 2) return false; // 字牌が１枚
            var n00 = c[0] + c[3] + c[6],
                n01 = c[1] + c[4] + c[7],
                n02 = c[2] + c[5] + c[8];
            var n10 = c[9] + c[12] + c[15],
                n11 = c[10] + c[13] + c[16],
                n12 = c[11] + c[14] + c[17];
            var n20 = c[18] + c[21] + c[24],
                n21 = c[19] + c[22] + c[25],
                n22 = c[20] + c[23] + c[26];
            var n0 = (n00 + n01 + n02) % 3;
            if (n0 == 1) return false; // 萬子が１枚余る
            var n1 = (n10 + n11 + n12) % 3;
            if (n1 == 1) return false; // 筒子が１枚余る
            var n2 = (n20 + n21 + n22) % 3;
            if (n2 == 1) return false; // 索子が１枚余る
            if ((n0 == 2) + (n1 == 2) + (n2 == 2) +
                (c[27] == 2) + (c[28] == 2) + (c[29] == 2) + (c[30] == 2) +
                (c[31] == 2) + (c[32] == 2) + (c[33] == 2) != 1) return false; // 頭の場所は１つ
            var nn0 = (n00 * 1 + n01 * 2) % 3,
                m0 = this.cc2m(c, 0);
            var nn1 = (n10 * 1 + n11 * 2) % 3,
                m1 = this.cc2m(c, 9);
            var nn2 = (n20 * 1 + n21 * 2) % 3,
                m2 = this.cc2m(c, 18);
            if (j & 4) return !(n0 | nn0 | n1 | nn1 | n2 | nn2) && this.isMentsu(m0) && this.isMentsu(m1) && this.isMentsu(m2); // 字牌が頭
            //		document.write("c="+c+"<br>");
            //		document.write("n="+n0+","+n1+","+n2+" nn="+nn0+","+nn1+","+nn2+"<br>");
            //		document.write("m="+m0+","+m1+","+m2+"<br>");
            if (n0 == 2) return !(n1 | nn1 | n2 | nn2) && this.isMentsu(m1) && this.isMentsu(m2) && this.isAtamaMentsu(nn0, m0); // 萬子が頭
            if (n1 == 2) return !(n2 | nn2 | n0 | nn0) && this.isMentsu(m2) && this.isMentsu(m0) && this.isAtamaMentsu(nn1, m1); // 筒子が頭
            if (n2 == 2) return !(n0 | nn0 | n1 | nn1) && this.isMentsu(m0) && this.isMentsu(m1) && this.isAtamaMentsu(nn2, m2); // 索子が頭
            return false;
        }
    }

    function isAgari(c, n) {
        if (n != 34) return;
        return AGARI.isAgari(c, n);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // TENHOU.NET (C)C-EGG http://tenhou.net/
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // REFERENCE
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // http://www.asamiryo.jp/fst13.html
    /////////////////////////////////////////////////////////////////////////////////////////////////////


    //function SYANTEN(a,n){}
    //SYANTEN.prototype={
    var SYANTEN = { // singleton
        n_eval: 0,
        // input
        c: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // status
        n_mentsu: 0,
        n_tatsu: 0,
        n_toitsu: 0,
        n_jidahai: 0, // １３枚にしてから少なくとも打牌しなければならない字牌の数 -> これより向聴数は下がらない
        f_n4: 0, // 27bitを数牌、1bitを字牌で使用
        f_koritsu: 0, // 孤立牌
        // final result
        min_syanten: 8,

        updateResult: function () {
            var e = this;
            var ret_syanten = 8 - e.n_mentsu * 2 - e.n_tatsu - e.n_toitsu;
            var n_mentsu_kouho = e.n_mentsu + e.n_tatsu;
            if (e.n_toitsu) {
                n_mentsu_kouho += e.n_toitsu - 1;
            } else if (e.f_n4 && e.f_koritsu) {
                if ((e.f_n4 | e.f_koritsu) == e.f_n4) ++ret_syanten; // 対子を作成できる孤立牌が無い
            }
            if (n_mentsu_kouho > 4) ret_syanten += (n_mentsu_kouho - 4);
            if (ret_syanten != -1 && ret_syanten < e.n_jidahai) ret_syanten = e.n_jidahai;
            if (ret_syanten < e.min_syanten) e.min_syanten = ret_syanten;
        },


        // method
        init: function (a, n) {
            var e = this;
            e.c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            // status
            e.n_mentsu = 0;
            e.n_tatsu = 0;
            e.n_toitsu = 0;
            e.n_jidahai = 0;
            e.f_n4 = 0;
            e.f_koritsu = 0;
            // final result
            e.min_syanten = 8;

            var c = this.c;
            if (n == 136) {
                for (n = 0; n < 136; ++n)
                    if (a[n]) ++c[n >> 2];
            } else if (n == 34) {
                for (n = 0; n < 34; ++n) c[n] = a[n];
            } else {
                for (n -= 1; n >= 0; --n) ++c[a[n] >> 2];
            }
        },
        count34: function () {
            var c = this.c;
            return c[0] + c[1] + c[2] + c[3] + c[4] + c[5] + c[6] + c[7] + c[8] +
                c[9] + c[10] + c[11] + c[12] + c[13] + c[14] + c[15] + c[16] + c[17] +
                c[18] + c[19] + c[20] + c[21] + c[22] + c[23] + c[24] + c[25] + c[26] +
                c[27] + c[28] + c[29] + c[30] + c[31] + c[32] + c[33];
        },

        i_anko: function (k) {
            this.c[k] -= 3, ++this.n_mentsu;
        },
        d_anko: function (k) {
            this.c[k] += 3, --this.n_mentsu;
        },
        i_toitsu: function (k) {
            this.c[k] -= 2, ++this.n_toitsu;
        },
        d_toitsu: function (k) {
            this.c[k] += 2, --this.n_toitsu;
        },
        i_syuntsu: function (k) {
            --this.c[k], --this.c[k + 1], --this.c[k + 2], ++this.n_mentsu;
        },
        d_syuntsu: function (k) {
            ++this.c[k], ++this.c[k + 1], ++this.c[k + 2], --this.n_mentsu;
        },
        i_tatsu_r: function (k) {
            --this.c[k], --this.c[k + 1], ++this.n_tatsu;
        },
        d_tatsu_r: function (k) {
            ++this.c[k], ++this.c[k + 1], --this.n_tatsu;
        },
        i_tatsu_k: function (k) {
            --this.c[k], --this.c[k + 2], ++this.n_tatsu;
        },
        d_tatsu_k: function (k) {
            ++this.c[k], ++this.c[k + 2], --this.n_tatsu;
        },
        i_koritsu: function (k) {
            --this.c[k], this.f_koritsu |= (1 << k);
        },
        d_koritsu: function (k) {
            ++this.c[k], this.f_koritsu &= ~(1 << k);
        },

        scanChiitoiKokushi: function () {
            var e = this;
            var syanten = e.min_syanten;
            var c = e.c;
            var n13 = // 幺九牌の対子候補の数
                (c[0] >= 2) + (c[8] >= 2) +
                (c[9] >= 2) + (c[17] >= 2) +
                (c[18] >= 2) + (c[26] >= 2) +
                (c[27] >= 2) + (c[28] >= 2) + (c[29] >= 2) + (c[30] >= 2) + (c[31] >= 2) + (c[32] >= 2) + (c[33] >= 2);
            var m13 = // 幺九牌の種類数
                (c[0] != 0) + (c[8] != 0) +
                (c[9] != 0) + (c[17] != 0) +
                (c[18] != 0) + (c[26] != 0) +
                (c[27] != 0) + (c[28] != 0) + (c[29] != 0) + (c[30] != 0) + (c[31] != 0) + (c[32] != 0) + (c[33] != 0);
            var n7 = n13 + // 対子候補の数
                (c[1] >= 2) + (c[2] >= 2) + (c[3] >= 2) + (c[4] >= 2) + (c[5] >= 2) + (c[6] >= 2) + (c[7] >= 2) +
                (c[10] >= 2) + (c[11] >= 2) + (c[12] >= 2) + (c[13] >= 2) + (c[14] >= 2) + (c[15] >= 2) + (c[16] >= 2) +
                (c[19] >= 2) + (c[20] >= 2) + (c[21] >= 2) + (c[22] >= 2) + (c[23] >= 2) + (c[24] >= 2) + (c[25] >= 2);
            var m7 = m13 + // 牌の種類数
                (c[1] != 0) + (c[2] != 0) + (c[3] != 0) + (c[4] != 0) + (c[5] != 0) + (c[6] != 0) + (c[7] != 0) +
                (c[10] != 0) + (c[11] != 0) + (c[12] != 0) + (c[13] != 0) + (c[14] != 0) + (c[15] != 0) + (c[16] != 0) +
                (c[19] != 0) + (c[20] != 0) + (c[21] != 0) + (c[22] != 0) + (c[23] != 0) + (c[24] != 0) + (c[25] != 0); { // 七対子
                var ret_syanten = 6 - n7 + (m7 < 7 ? 7 - m7 : 0);
                if (ret_syanten < syanten) syanten = ret_syanten;
            } { // 国士無双
                var ret_syanten = 13 - m13 - (n13 ? 1 : 0);
                if (ret_syanten < syanten) syanten = ret_syanten;
            }
            return syanten;
        },
        removeJihai: function (nc) { // 字牌
            var e = this;
            var c = e.c;
            var j_n4 = 0; // 7bitを字牌で使用
            var j_koritsu = 0; // 孤立牌
            var i;
            for (i = 27; i < 34; ++i) switch (c[i]) {
                case 4:
                    ++e.n_mentsu, j_n4 |= (1 << (i - 27)), j_koritsu |= (1 << (i - 27)), ++e.n_jidahai;
                    break;
                case 3:
                    ++e.n_mentsu;
                    break;
                case 2:
                    ++e.n_toitsu;
                    break;
                case 1:
                    j_koritsu |= (1 << (i - 27));
                    break;
            }
            if (e.n_jidahai && (nc % 3) == 2) --e.n_jidahai;

            if (j_koritsu) { // 孤立牌が存在する
                e.f_koritsu |= (1 << 27);
                if ((j_n4 | j_koritsu) == j_n4) e.f_n4 |= (1 << 27); // 対子を作成できる孤立牌が無い
            }
        },
        removeJihaiSanma19: function (nc) { // 字牌
            var e = this;
            var c = e.c;
            var j_n4 = 0; // 7+9bitを字牌で使用
            var j_koritsu = 0; // 孤立牌
            var i;
            for (i = 27; i < 34; ++i) switch (c[i]) {
                case 4:
                    ++e.n_mentsu, j_n4 |= (1 << (i - 18)), j_koritsu |= (1 << (i - 18)), ++e.n_jidahai;
                    break;
                case 3:
                    ++e.n_mentsu;
                    break;
                case 2:
                    ++e.n_toitsu;
                    break;
                case 1:
                    j_koritsu |= (1 << (i - 18));
                    break;
            }
            for (i = 0; i < 9; i += 8) switch (c[i]) {
                case 4:
                    ++e.n_mentsu, j_n4 |= (1 << i), j_koritsu |= (1 << i), ++e.n_jidahai;
                    break;
                case 3:
                    ++e.n_mentsu;
                    break;
                case 2:
                    ++e.n_toitsu;
                    break;
                case 1:
                    j_koritsu |= (1 << i);
                    break;
            }
            if (e.n_jidahai && (nc % 3) == 2) --e.n_jidahai;

            if (j_koritsu) { // 孤立牌が存在する
                e.f_koritsu |= (1 << 27);
                if ((j_n4 | j_koritsu) == j_n4) e.f_n4 |= (1 << 27); // 対子を作成できる孤立牌が無い
            }
        },
        scanNormal: function (init_mentsu) {
            var e = this;
            var c = e.c;
            e.f_n4 |= // 孤立しても対子(雀頭)になれない数牌
                ((c[0] == 4) << 0) | ((c[1] == 4) << 1) | ((c[2] == 4) << 2) | ((c[3] == 4) << 3) | ((c[4] == 4) << 4) | ((c[5] == 4) << 5) | ((c[6] == 4) << 6) | ((c[7] == 4) << 7) | ((c[8] == 4) << 8) |
                ((c[9] == 4) << 9) | ((c[10] == 4) << 10) | ((c[11] == 4) << 11) | ((c[12] == 4) << 12) | ((c[13] == 4) << 13) | ((c[14] == 4) << 14) | ((c[15] == 4) << 15) | ((c[16] == 4) << 16) | ((c[17] == 4) << 17) |
                ((c[18] == 4) << 18) | ((c[19] == 4) << 19) | ((c[20] == 4) << 20) | ((c[21] == 4) << 21) | ((c[22] == 4) << 22) | ((c[23] == 4) << 23) | ((c[24] == 4) << 24) | ((c[25] == 4) << 25) | ((c[26] == 4) << 26);
            this.n_mentsu += init_mentsu;
            e.Run(0);
        },

        Run: function (depth) { // ネストは高々１４回
            var e = this;
            ++e.n_eval;
            if (e.min_syanten == -1) return; // 和了は１つ見つければよい
            var c = e.c;
            for (; depth < 27 && !c[depth]; ++depth); // skip
            if (depth == 27) return e.updateResult();

            var i = depth;
            if (i > 8) i -= 9;
            if (i > 8) i -= 9; // mod_9_in_27
            switch (c[depth]) {
                case 4:
                    // 暗刻＋順子|搭子|孤立
                    e.i_anko(depth);
                    if (i < 7 && c[depth + 2]) {
                        if (c[depth + 1]) e.i_syuntsu(depth), e.Run(depth + 1), e.d_syuntsu(depth); // 順子
                        e.i_tatsu_k(depth), e.Run(depth + 1), e.d_tatsu_k(depth); // 嵌張搭子
                    }
                    if (i < 8 && c[depth + 1]) e.i_tatsu_r(depth), e.Run(depth + 1), e.d_tatsu_r(depth); // 両面搭子
                    e.i_koritsu(depth), e.Run(depth + 1), e.d_koritsu(depth); // 孤立
                    e.d_anko(depth);
                    // 対子＋順子系 // 孤立が出てるか？ // 対子＋対子は不可
                    e.i_toitsu(depth);
                    if (i < 7 && c[depth + 2]) {
                        if (c[depth + 1]) e.i_syuntsu(depth), e.Run(depth), e.d_syuntsu(depth); // 順子＋他
                        e.i_tatsu_k(depth), e.Run(depth + 1), e.d_tatsu_k(depth); // 搭子は２つ以上取る必要は無い -> 対子２つでも同じ
                    }
                    if (i < 8 && c[depth + 1]) e.i_tatsu_r(depth), e.Run(depth + 1), e.d_tatsu_r(depth);
                    e.d_toitsu(depth);
                    break;
                case 3:
                    // 暗刻のみ
                    e.i_anko(depth), e.Run(depth + 1), e.d_anko(depth);
                    // 対子＋順子|搭子
                    e.i_toitsu(depth);
                    if (i < 7 && c[depth + 1] && c[depth + 2]) {
                        e.i_syuntsu(depth), e.Run(depth + 1), e.d_syuntsu(depth); // 順子
                    } else { // 順子が取れれば搭子はその上でよい
                        if (i < 7 && c[depth + 2]) e.i_tatsu_k(depth), e.Run(depth + 1), e.d_tatsu_k(depth); // 嵌張搭子は２つ以上取る必要は無い -> 対子２つでも同じ
                        if (i < 8 && c[depth + 1]) e.i_tatsu_r(depth), e.Run(depth + 1), e.d_tatsu_r(depth); // 両面搭子
                    }
                    e.d_toitsu(depth);
                    // 順子系
                    if (i < 7 && c[depth + 2] >= 2 && c[depth + 1] >= 2) e.i_syuntsu(depth), e.i_syuntsu(depth), e.Run(depth), e.d_syuntsu(depth), e.d_syuntsu(depth); // 順子＋他
                    break;
                case 2:
                    // 対子のみ
                    e.i_toitsu(depth), e.Run(depth + 1), e.d_toitsu(depth);
                    // 順子系
                    if (i < 7 && c[depth + 2] && c[depth + 1]) e.i_syuntsu(depth), e.Run(depth), e.d_syuntsu(depth); // 順子＋他
                    break;
                case 1:
                    // 孤立牌は２つ以上取る必要は無い -> 対子のほうが向聴数は下がる -> ３枚 -> 対子＋孤立は対子から取る
                    // 孤立牌は合計８枚以上取る必要は無い
                    if (i < 6 && c[depth + 1] == 1 && c[depth + 2] && c[depth + 3] != 4) { // 延べ単
                        e.i_syuntsu(depth), e.Run(depth + 2), e.d_syuntsu(depth); // 順子＋他
                    } else {
                        //				if (n_koritsu<8) e.i_koritsu(depth), e.Run(depth+1), e.d_koritsu(depth);
                        e.i_koritsu(depth), e.Run(depth + 1), e.d_koritsu(depth);
                        // 順子系
                        if (i < 7 && c[depth + 2]) {
                            if (c[depth + 1]) e.i_syuntsu(depth), e.Run(depth + 1), e.d_syuntsu(depth); // 順子＋他
                            e.i_tatsu_k(depth), e.Run(depth + 1), e.d_tatsu_k(depth); // 搭子は２つ以上取る必要は無い -> 対子２つでも同じ
                        }
                        if (i < 8 && c[depth + 1]) e.i_tatsu_r(depth), e.Run(depth + 1), e.d_tatsu_r(depth);
                    }
                    break;
            }
        },
        calcSyanten(a, n, bSkipChiitoiKokushi) {
            //	var e=new SYANTEN(a,n);
            var e = SYANTEN;
            e.init(a, n);
            var nc = e.count34();
            if (nc > 14) return -2; // ネスト検査が爆発する
            if (!bSkipChiitoiKokushi && nc >= 13) e.min_syanten = e.scanChiitoiKokushi(nc); // １３枚より下の手牌は評価できない
            e.removeJihai(nc);
            //	e.removeJihaiSanma19(nc);
            var init_mentsu = Math.floor((14 - nc) / 3); // 副露面子を逆算
            e.scanNormal(init_mentsu);
            return e.min_syanten;
        },
        calcSyanten2(a, n) {
            //	var e=new SYANTEN(a,n);
            var e = SYANTEN;
            e.init(a, n);
            var nc = e.count34();
            if (nc > 14) return undefined; // ネスト検査が爆発する
            var syanten = [e.min_syanten, e.min_syanten];
            if (nc >= 13) syanten[0] = e.scanChiitoiKokushi(nc); // １３枚より下の手牌は評価できない
            e.removeJihai(nc);
            //	e.removeJihaiSanma19(nc);
            var init_mentsu = Math.floor((14 - nc) / 3); // 副露面子を逆算
            e.scanNormal(init_mentsu);
            syanten[1] = e.min_syanten;
            if (syanten[1] < syanten[0]) syanten[0] = syanten[1];
            return syanten;
        }

    };
    let tenhou = {
        MPSZ,
        SYANTEN,
        AGARI
    };
    window.Helper = Helper;
    window.helper = new Helper();
    window.AddRoom = class AddRoom {
        constructor(idIn) {
            this.id = idIn;
            this.timer;
        }
        joinRoom(id) {
            app.NetAgent.sendReq2Lobby("Lobby", "joinRoom", { room_id: id }, (t, i) => {
                if (t || i.error) {
                    console.log("Failed");
                    return false;
                } else {
                    this.stop();
                    console.log("Success");
                    uiscript.UI_Lobby.Inst.enable = !1;
                    uiscript.UI_WaitingRoom.Inst.updateData(i.room);
                    uiscript.UIMgr.Inst.ShowWaitingRoom();
                    return true;
                }
            })
        }
        start() {
            this.stop();
            this.timer = setInterval(() => this.joinRoom(this.id), 250);
            return this;
        }
        stop() {
            if (this.timer) clearInterval(this.timer);
            return this;
        }
    }
    window.getCharacter = () => {
        for (let charid in cfg.item_definition.character.map_) {
            const chardef = cfg.item_definition.character.map_[charid];
            const $ = uiscript.UI_Sushe.characters.findIndex(char => char.charid === charid);
            if ($ === -1) {
                uiscript.UI_Sushe.characters.push({ ...uiscript.UI_Sushe.characters[200001], charid, exp: 20000, extra_emoji: [10, 11, 12, 13], is_upgraded: true, level: 5, skin: chardef.init_skin });
            } else {
                uiscript.UI_Sushe.characters[$] = { ...uiscript.UI_Sushe.characters[$], exp: 20000, extra_emoji: [10, 11, 12, 13], is_upgraded: true, level: 5 };
            }
        }
        for (const id in cfg.item_definition.skin.map_) {
            uiscript.UI_Sushe.skin_map[id] = 1;
        }
    };
    // Events overRiding
    // Operations : 0 = "none", 1 = "dapai", 2 = "eat", 3 = "peng", 4 = "an_gang", 5 = "ming_gang", 6 = "add_gang", 7 = "liqi", 8 = "zimo", 9 = "rong", 10 = "jiuzhongjiupai", 11 = "babei"
    //# sourceMappingURL=haili.js.map
})();

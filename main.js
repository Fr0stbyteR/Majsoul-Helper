// ==UserScript==
// @name         Majsoul Helper
// @namespace    https://github.com/Fr0stbyteR/
// @version      0.3.9
// @description  dye recommended discarding tile with tenhou/2 + River tiles indication
// @author       Fr0stbyteR, FlyingBamboo
// @match        https://majsoul.union-game.com/0/
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
                    const tiles = player.container_qipai.pais;
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
                    const tiles = player.container_qipai.pais;
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
            if (typeof uiscript === "undefined" || !uiscript.UI_DesktopInfo || typeof ui === "undefined" || !ui.mj.desktopInfoUI.uiView) return setTimeout(() => this.inject(), 1000);
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
                        if (a.container.visible = !0,
                            a.name.text = t[n].nickname,
                            a.head.id = t[n].avatar_id,
                            a.avatar = t[n].avatar_id,
                            a.head.setEmo(""),
                            a.level = new uiscript.UI_Level(this.me.getChildByName("container_player_" + i).getChildByName("head").getChildByName("level")),
                            a.level.id = t[n].level.id,
                            0 != i) {
                            var r = t[n].account_id && 0 != t[n].account_id,// && view.DesktopMgr.Inst.mode != view.EMJMode.paipu,
                                o = t[n].account_id && 0 != t[n].account_id && view.DesktopMgr.Inst.mode == view.EMJMode.play,
                                s = view.DesktopMgr.Inst.mode != view.EMJMode.play;
                            e ? a.headbtn.onChangeSeat(r, o, s) : a.headbtn.reset(r, o, s)
                        }
                        t[n].title ? a.title.id = t[n].title : a.title.id = 0
                    }
                }
            }
            for (let i = 5; i <= 8; i++) {
                ui.mj.desktopInfoUI.uiView.child[i].child[3].child[1] = {
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
                }

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
                                <img width="400" src="https://majsoul.union-game.com/0/v0.4.1.w/scene/Assets/Resource/mjpai/mjp_default/hand.png" />
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
            if (key == "ActionNewRound") {
                view.DesktopMgr.Inst.setAutoHule(true);
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
                        if (this.auto && option) setTimeout(() => this.discard(Helper.indexToString(option)), Math.random() * 2000 + 1000);
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
            this.timer = setTimeout(() => this.start(), 250);
            return this;
        }
        stop() {
            if (this.timer) clearTimeout(this.timer);
            return this;
        }
    }
    window.getCharacter = () => {
        uiscript.UI_Sushe.characters[2] = { charid: 200003, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400301 };
        uiscript.UI_Sushe.characters[3] = { charid: 200004, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400401 };
        uiscript.UI_Sushe.characters[4] = { charid: 200005, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400501 };
        uiscript.UI_Sushe.characters[5] = { charid: 200006, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400601 };
        uiscript.UI_Sushe.characters[6] = { charid: 200007, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400701 };
        uiscript.UI_Sushe.characters[7] = { charid: 200008, exp: 20000, extra_emoji: [13], is_upgraded: true, level: 5, skin: 400801 };
    }
    // Events overRiding
    // Operations : 0 = "none", 1 = "dapai", 2 = "eat", 3 = "peng", 4 = "an_gang", 5 = "ming_gang", 6 = "add_gang", 7 = "liqi", 8 = "zimo", 9 = "rong", 10 = "jiuzhongjiupai", 11 = "babei"
    //# sourceMappingURL=haili.js.map
})();

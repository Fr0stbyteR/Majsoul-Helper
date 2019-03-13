// app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountInfo", { account_id: 3644 }, function (t, n) { t || n.error ? null : console.log(n) })
declare interface ResAccountInfo {
    account: Account;
}
declare interface Account {
    account_id: number;
    avatar_id: number;
    diamond: number;
    gold: number;
    level: AccountLevel;
    login_time: number;
    logout_time: number;
    nickname: string;
    room_id: number;
    signature: number;
    title: number;
    vip: number;
}
declare interface AccountLevel {
    /**
     * 段位 ID : 1010x: 初心x, 1040x: 雀豪x, 10601: 魂天, check cfg.level_definition.level_definition
     *
     * @type {number}
     * @memberof AccountLevel
     */
    id: number;
    score: number;
}
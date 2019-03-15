// app.NetAgent.sendReq2Lobby("Lobby", "fetchAccountStatisticInfo", { account_id: 3644 }, function (t, n) { t || n.error ? null : console.log(n) })
declare interface ResAccountStatisticInfo {
    detail_data: AccountDetailStatisticV2;
    statistic_data: AccountStatisticData[];
}
declare interface AccountDetailStatisticV2 {
    customized_contest_statistic: CustomizedContestStatistic;
    friend_room_statistic: AccountDetailStatistic;
    rank_statistic: RankStatistic;
}
declare interface CustomizedContestStatistic {
    total_statistic: AccountDetailStatistic;
    month_statistic: AccountDetailStatistic;
    month_refresh_time: number
}
declare interface AccountDetailStatistic {
    game_mode: AccountStatisticByGameMode[];
    fan_achieved: AccountFanAchieved[]
}
declare interface RankStatistic {
    total_statistic: RankData;
    month_statistic: RankData;
    month_refresh_time: number
}
declare interface AccountStatisticByGameMode {
    mode: number;
    game_count_sum: number
    dadian_sum: number;
    fly_count: number
    game_final_position: number[];
    gold_earn_sum: number;
    highest_lianzhuang: number;
    liqi_count_sum: number;
    ming_count_sum: number;
    round_count_sum: number;
    round_end: RoundEndData[];
    score_earn_sum: number;
    xun_count_sum: number;
}
declare interface RoundEndData {
    type: number;
    sum: number;
}
declare interface AccountFanAchieved {
    fan: AccountStatisticByFan[];
    liujumanguan: number;
    mahjong_category: number;
}
declare interface AccountStatisticByFan {
    fan_id: number;
    sum: number;
}
declare interface RankData {
    all_level_statistic: AccountDetailStatistic;
    level_data_list: RankLevelData[];
}
declare interface RankLevelData {
    rank_level: number;
    statistic: AccountDetailStatistic;
}
declare interface AccountStatisticData {
    /**
     * 1: 友人场，2: 匹配场
     *
     * @type {1 | 2 | 3 | 4}
     * @memberof AccountMahjongStatistic
     */
    game_category: 1 | 2 | 3 | 4;
    /**
     * 1: 四麻，2: 三麻
     *
     * @type {(1 | 2)}
     * @memberof AccountMahjongStatistic
     */
    mahjong_category: 1 | 2;
    statistic: AccountMahjongStatistic;
}
declare interface AccountMahjongStatistic {
    final_position_counts: number[];
    highest_hu: HighestHuRecord;
    recent_10_hu_summary: LiQi10Summary;
    recent_20_hu_summary: Liqi20Summary;
    recent_hu: HuSummary;
    recent_ranks: number[];
    recent_round: RoundSummary;
}
declare interface HighestHuRecord {
    fanshu: number;
    doranum: number;
    title: string;
    hands: string[];
    hupai: string;
    ming: string[]
}
declare interface LiQi10Summary {
    total_xuanshang: number;
    total_fanshu: number;
}
declare interface Liqi20Summary {
    total_count: number;
    total_lidora_count: number;
    average_hu_point: number
}
declare interface HuSummary {
    total_count: number;
    dora_round_count: number;
    total_fan: number;
}
declare interface RoundSummary {
    fangchong_count: number;
    rong_count: number;
    total_count: number;
    zimo_count: number;
}
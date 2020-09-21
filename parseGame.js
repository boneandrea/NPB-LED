module.exports={
    parse(g,params){

        const q = (s) => g.querySelector(s)
        const team_l = q('div.bb-score__team > p.bb-score__homeLogo').textContent.trim()
        const team_r = q('div.bb-score__team > p.bb-score__awayLogo').textContent.trim()

        if (q('.bb-score__score.bb-score__score--left')) {
            if(q('.bb-score__link').textContent.trim() === "試合終了"){
                const win_pitcher=q(".bb-score__player.bb-score__player--win").textContent;
                const lose_pitcher=q(".bb-score__player.bb-score__player--lose").textContent;

                const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
                const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()
                const inning = q('.bb-score__link').textContent.trim()
                return `${team_l} 対 ${team_r} : ${score_l}-${score_r} (${inning}) [勝:${win_pitcher} 負:${lose_pitcher}]`;
            }else{
                // 試合中
                const score_l = q('.bb-score__score.bb-score__score--left').textContent.trim()
                const score_r = q('.bb-score__score.bb-score__score--right').textContent.trim()
                const inning = q('.bb-score__link').textContent.trim()
                return `${team_l} 対 ${team_r} : ${score_l}-${score_r} (${inning})`;
            }

        } else if (q('.bb-score__link')) {
            // 中止とか
            console.log("2;"+q('.bb-score__link').textContent.trim());
            const result = q('.bb-score__link').textContent.trim().replace(/見どころ/,"開始前")
            params.notOnPlayGames++;
            return `${team_l}-${team_r} (${result})`;
        }
    }
};

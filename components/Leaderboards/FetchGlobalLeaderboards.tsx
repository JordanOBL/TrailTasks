import React, { useState, useEffect } from "react";
import handleError from "../../helpers/ErrorHandler";
import Config from "react-native-config";
//This code gets the top 100 rankings AND the user ranking
export interface Top100Ranking {
    username: string;
    total_miles: string;
}
export interface UserRank {
    user_id: string;
    username: string;
    total_miles: string;
    rank: string;
}
export interface Leaderboard {
    top100Rankings: Top100Ranking[]
    userRank: UserRank
}
const FetchGlobalLeaderboards = (userId: string) => {
    const [leaderboard, setLeaderboard] = useState<Leaderboard>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError("")
            if(!userId){
                setError("UserId not Found in FetchGlobalLeaderboards")
            }

            try {
                let response = await fetch(Config.DATABASE_LEADERBOARDS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({userId})
                });
                // response {
                    // data : {
                    //     "top100Rankings": [
                    //     {
                    //         "id": "0y4ABJMtW0jWIKxM",
                    //         "total_miles": "0.00",
                    //         "created_at": "2024-08-22T06:21:49.692Z",
                    //         "updated_at": "2024-08-22T06:21:49.692Z",
                    //         "user_id": "EYmdQ3jTB2W68wYH",
                    //         "username": "Android"
                    //     }
                    // ],
                    //     "userRank": {
                    //     "user_id": "EYmdQ3jTB2W68wYH",
                    //         "username": "Android",
                    //         "total_miles": "0.00",
                    //         "rank": "1"
                    // }
                    // }
                // }

                if (!response.ok) {
                    setError("Error fetching global leaderboard.")
                    //throw new Error("Error fetching global leaderboard.");
                }

                const data = await response.json();
                setLeaderboard(data || []);
            } catch (err: any) {
                setError(err.message);
                handleError(err, 'FetchGlobalLeaderboards')
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    return { leaderboard, loading, error };
};

export default FetchGlobalLeaderboards;

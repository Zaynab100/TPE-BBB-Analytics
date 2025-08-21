import React, {useState, useEffect} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import {Card, Typography, CircularProgress, CardContent} from '@mui/material';
import {ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';


const UserSession_onlineTime = () => {
    const {session_id, user_id} = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const started_on = location.state?.started_on;
    const stopped_on = location.state?.stopped_on;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/${user_id}/GetOnlineTime`);

                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }

                const result = await response.json();
                console.log("Données reçues onlinetime:", result); // Vérifiez dans la console
                const onlineTime = result?.online_time;

                if (!onlineTime) {
                    throw new Error("Aucune donnée trouvée");
                }

                const formattedData = {
                    user_id: onlineTime.user_id,
                    user_name: onlineTime.user_name,
                    online_time: onlineTime.online_time
                };

                setData(formattedData);
            } catch (err) {
                console.error("Erreur:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session_id && user_id) {
            fetchData();
        }
    }, [session_id, user_id]);

    if (loading) {
        return (
            <Card sx={{height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <CircularProgress/>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{padding: 2}}>
                <Typography color="error">Erreur : {error}</Typography>
            </Card>
        );
    }

    // 🧮 Calculs logiques en dehors du JSX
    const sessionDuration = stopped_on && started_on ? (parseInt(stopped_on) - parseInt(started_on)) / 1000 : 0;
    const userOnlineTime = parseInt(data.online_time);
    const pieData = [
        {name: "Connecté", value: userOnlineTime},
        {name: "Déconnecté", value: Math.max(parseInt(sessionDuration - userOnlineTime), 0)},
    ];

    const COLORS = ['#82ca9d', '#e57373']; // Vert / Rouge

    return (
       <Card sx={{
            height: 450,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2.5,
        }}>

            <CardContent>
                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}> Temps en ligne de l'utilisateur
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    <strong>Nom :</strong> {data.user_name}
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    <strong>Temps en ligne :</strong> {data.online_time} s
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={false} // pas de lignes ni de labels
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => {
                                const percentage = ((value / sessionDuration) * 100).toFixed(1);
                                return [`${value}s (${percentage}%)`, name];
                            }}
                            contentStyle={{
                                fontSize: 12,
                                padding: 10,
                            }}
                        />
                        <Legend/>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default UserSession_onlineTime;
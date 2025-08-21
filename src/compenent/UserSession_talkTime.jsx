import React, {useState, useEffect} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import {Card, Typography, CircularProgress, CardContent} from '@mui/material';
import {ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';


const UserSession_talkTime = () => {
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
                const response = await fetch(`/api/${session_id}/${user_id}/GetTalkTime`);

                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }

                const result = await response.json();
                console.log("Données reçues talktime:", result); // Vérifiez dans la console
                const talkTime = result?.talk_time;

                if (!talkTime) {
                    throw new Error("Aucune donnée trouvée");
                }

                const formattedData = {
                    user_id: talkTime.user_id,
                    user_name: talkTime.user_name,
                    talk_time: talkTime.talk_time
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
            <Card sx={{
                padding: 2, display: 'flex',
                flexDirection: 'column',
                minHeight: 300, // Hauteur uniforme (tu peux ajuster)
                justifyContent: 'space-between', margin: 2, borderRadius: 4, boxShadow: 3, backgroundColor: '#f9f9f9'
            }}>

                <Typography color="error">Erreur : {error}</Typography>
            </Card>
        );
    }

    // 🧮 Calculs logiques en dehors du JSX
    const sessionDuration = stopped_on && started_on ? (parseInt(stopped_on) - parseInt(started_on)) / 1000 : 0;
    console.log("duration:", sessionDuration);
    const userTalkTime = parseInt(data.talk_time);
    const pieData = [
        {name: "Parlé", value: userTalkTime},
        {name: "Silencieux", value: Math.max(parseInt(sessionDuration - userTalkTime), 0)},
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
                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}> Temps de parole de l'utilisateur
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    <strong>Nom :</strong> {data.user_name}
                </Typography>
                <Typography variant="body1" sx={{mt: 1}}>
                    <strong>Temps de parole :</strong> {data.talk_time} s
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

export default UserSession_talkTime;
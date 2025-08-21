import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {Card, CardContent, Typography, CircularProgress} from '@mui/material';

const WebCam_UserSession = () => {
    const {session_id, user_id} = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);


    // Colors for pie chart segments
    const COLORS = ['#82ca9d','#e57373'];

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
    };
    const CustomTooltip = ({active, payload}) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <>
                    <p style={{fontWeight: 'bold', fontSize: '16px'}}>{data.name}</p>
                    <p>Durée: {data.formattedTime}</p>
                    <p>Pourcentage: {data.percentage}%</p>
                </>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}) => {
        // Ne pas afficher l'étiquette si la valeur est 0%
        if (percent * 100 <= 0) {
            return null;
        }

        const RADIAN = Math.PI / 180;
        const radius = outerRadius * 0.7;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch webcam data
                const response = await fetch(`/api/${session_id}/${user_id}/GetWebCam`);
                if (!response.ok) throw new Error('Erreur réseau');
                const result = await response.json();
                console.log("Données reçues:", result);

                // Fetch session data
                const sessionResponse = await fetch(`/api/GetSession/${session_id}`);
                if (!sessionResponse.ok) throw new Error('Erreur lors de la récupération des données de session');
                const sessionResult = await sessionResponse.json();
                console.log("📦 session :", sessionResult);

                if (!sessionResult || sessionResult.length === 0) {
                    throw new Error('Aucune donnée de session disponible');
                }

                const session = sessionResult[0];
                setSessionData(session);

                // Durée de session (en secondes)
                const startTime = session[3];
                const endTime = session[4];
                const sessionDuration = (endTime - startTime) / 1000;


                // Temps de webcam (0 par défaut si aucun enregistrement)
                let webcamTime = 0;
                if (result.webcam_times && result.webcam_times.length > 0) {
                    webcamTime = result.webcam_times[0].webcam_time;
                }

                const inactiveTime = sessionDuration - webcamTime;
                const webcamPercentage = (webcamTime / sessionDuration) * 100;
                const inactivePercentage = (inactiveTime / sessionDuration) * 100;

                const chartData = [
                    {
                        name: "Caméra activée",
                        value: webcamTime,
                        percentage: webcamPercentage.toFixed(2),
                        formattedTime: formatTime(webcamTime)
                    },
                    {
                        name: "Caméra désactivée",
                        value: inactiveTime,
                        percentage: inactivePercentage.toFixed(2),
                        formattedTime: formatTime(inactiveTime)
                    }
                ];

                setData(chartData);
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
        return <CircularProgress/>;
    }

    if (error) {
        return <Typography color="error">Erreur : {error}</Typography>;
    }

    if (data.length === 0 || !sessionData) {
        return <Typography>Aucune donnée disponible</Typography>;
    }


    return (
       <Card sx={{
            height: 450,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2.5,
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}> Activation de caméra
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Analyse du pourcentage d'utilisation de la webcam par utilisateur.
                </Typography>

                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            innerRadius={60}
                            labelLine={false}
                            label={renderCustomizedLabel}

                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#FFFFFF"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            formatter={(value, entry, index) =>
                                `${value}: ${data[index].percentage}% (${data[index].formattedTime})`
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

};

export default WebCam_UserSession;
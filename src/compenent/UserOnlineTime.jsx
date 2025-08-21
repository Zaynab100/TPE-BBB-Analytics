import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Typography, CircularProgress, Box, Card
} from '@mui/material';

const UserOnlineTime = () => {
    const { session_id } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/onlinetimes`);
                if (!response.ok) throw new Error('Erreur réseau');

                const result = await response.json();
                const formattedData = result.online_times.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    online_time: item.online_time
                }));

                setData(formattedData);
            } catch (err) {
                console.error("Erreur:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session_id) {
            fetchData();
        }
    }, [session_id]);

    return (
        <Card sx={{
            height: 450,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2.5,
        }}>
            {loading ? (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">Erreur : {error}</Typography>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}>
                    Temps de présence par utilisateur
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} layout="vertical">
                                    <XAxis
                                        type="number"
                                        label={{ value: 'Temps de présence (s)', position: 'insideBottomCenter', offset: -5, dy: 12 }}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="user_name"
                                        width={100}
                                        tick={false}                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            const seconds = value;
                                            const hours = Math.floor(seconds / 3600);
                                            const minutes = Math.floor((seconds % 3600) / 60);
                                            const remainingSeconds = seconds % 60;
                                            return [`${hours}h ${minutes}m ${remainingSeconds}s`, 'Temps de présence'];
                                        }}
                                        contentStyle={{
                                            fontSize: 12,
                                            padding: 10,
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="online_time"
                                        name="Temps de connexion"
                                        barSize={25}
                                        fill="#667eea"
                                        radius={[0, 10, 10, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography>Aucune donnée disponible</Typography>
                        )}
                    </Box>
                </>
            )}
        </Card>
    );
};

export default UserOnlineTime;
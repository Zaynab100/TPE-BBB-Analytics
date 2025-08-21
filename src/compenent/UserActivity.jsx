import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Typography, CircularProgress, Box
} from '@mui/material';
import Card from "@mui/material/Card";  // Assure-toi d'importer StyledCard

const UserActivity = () => {
    const { session_id } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/user_activity_timeline`);
                if (!response.ok) throw new Error('Erreur réseau');
                const result = await response.json();
                const formattedData = result.map(item => ({
                    ...item,
                    date: new Date(item.timestamp_raw),
                    time: new Date(item.timestamp_raw).toLocaleTimeString(),
                    value: item.active_users
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
                    Évolution du nombre d'utilisateurs actifs
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="time"
                                        label={{ value: 'Heure', position: 'insideBottom', offset: -5 }}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        label={{ value: 'Nombre Utilisateurs actifs', angle: -90, position: 'BottomLeft' }}
                                        domain={[0, 'dataMax + 1']}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} utilisateurs`]}
                                        labelFormatter={(label) => `Heure : ${label}`}
                                        contentStyle={{
                                            fontSize: 12,
                                            padding: 10,
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        name="Utilisateurs actifs"
                                        stroke="#667eea"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
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

export default UserActivity;
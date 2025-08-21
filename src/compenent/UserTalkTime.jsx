import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, CircularProgress, Box, Avatar } from '@mui/material';
import { MessageSquare } from 'lucide-react';

const UserTalkTime = () => {
    const { session_id } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/talktimes`);
                if (!response.ok) throw new Error('Erreur réseau');

                const result = await response.json();
                const formattedData = result.talk_times.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    talk_time: item.talk_time
                }));

                const totalTalkTime = formattedData.reduce((sum, item) => sum + item.talk_time, 0);
                const dataWithPercentage = formattedData.map(item => ({
                    ...item,
                    percentage: ((item.talk_time / totalTalkTime) * 100).toFixed(2)
                }));

                setData(dataWithPercentage);
            } catch (err) {
                console.error("Erreur:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session_id) fetchData();
    }, [session_id]);

    // Palette de couleurs cohérente avec la page Session
    const colorPalette = [
        '#667eea', // Bleu principal de la page
        '#f5576c', // Rose/rouge
        '#00f2fe', // Cyan
        '#38f9d7', // Vert turquoise
        '#fa709a', // Rose
        '#a8edea', // Turquoise clair
        '#764ba2', // Violet
        '#fee140', // Jaune
        '#f093fb', // Rose violet
        '#43e97b', // Vert
        '#4facfe', // Bleu clair
        '#fed6e3'  // Rose pâle
    ];

    const generateColor = (index) => {
        return colorPalette[index % colorPalette.length];
    };

    // Fonction personnalisée pour la légende
    const renderCustomLegend = (props) => {
        const { payload } = props;
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 2,
                maxHeight: 150,
                overflowY: 'auto'
            }}>
                {payload.map((entry, index) => {
                    const seconds = entry.payload.talk_time;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const remainingSeconds = seconds % 60;

                    return (
                        <Box key={index} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: '0.75rem'
                        }}>
                            <Box sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: entry.color,
                                flexShrink: 0
                            }} />
                            <Typography variant="caption" sx={{
                                flexGrow: 1,
                                color: '#64748b',
                                fontWeight: 500
                            }}>
                                {entry.payload.user_name}
                            </Typography>
                            <Typography variant="caption" sx={{
                                color: '#1e293b',
                                fontWeight: 600,
                                minWidth: 'fit-content'
                            }}>
                                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${remainingSeconds}s`} ({entry.payload.percentage}%)
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    if (loading) {
        return (
            <Card sx={{
                height: 450,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{
                p: 3,
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
                <Typography color="error">Erreur: {error}</Typography>
            </Card>
        );
    }

    return (
        <Card sx={{
            height: 450,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2.5,
        }}>
            {/* Header avec icône */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}>

                    Temps de parole par utilisateur
                </Typography>
            </Box>

            <CardContent sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 0
            }}>
                {data.length > 0 ? (
                    <>
                        <Box sx={{ height: 250, flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="talk_time"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="80%"
                                        paddingAngle={0}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={generateColor(index)}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const percentage = props.payload.percentage;
                                            const seconds = value;
                                            const hours = Math.floor(seconds / 3600);
                                            const minutes = Math.floor((seconds % 3600) / 60);
                                            const remainingSeconds = seconds % 60;
                                            return [`${hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${remainingSeconds}s`} (${percentage}%)`, props.payload.user_name];
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid rgba(102, 126, 234, 0.2)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: 12,
                                            padding: 12,
                                            color: '#1e293b'
                                        }}
                                        labelStyle={{
                                            color: '#1e293b',
                                            fontWeight: 600
                                        }}
                                    />
                                    <Legend
                                        content={renderCustomLegend}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#64748b'
                    }}>
                        <Typography>Aucune donnée disponible</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default UserTalkTime;
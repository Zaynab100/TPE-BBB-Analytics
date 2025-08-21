import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

const Emojis_Reactions = () => {
    const { session_id } = useParams();
    const [dataEmojis, setDataEmojis] = useState([]);
    const [dataReactions, setDataReactions] = useState([]);
    const [dataMessages, setDataMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [resEmojis, resReactions, resMessages] = await Promise.all([
                    fetch(`/api/${session_id}/nbEmojis`),
                    fetch(`/api/${session_id}/nbReactions`),
                    fetch(`/api/${session_id}/totalMessage`)
                ]);

                if (!resEmojis.ok || !resReactions.ok || !resMessages.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const emojisData = await resEmojis.json();
                const reactionsData = await resReactions.json();
                const messagesData = await resMessages.json();

                const formattedEmojis = emojisData.nb_emojis.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    nb_emojis: item.nb_emojis
                }));

                const formattedReactions = reactionsData.nb_reactions.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    nb_reactions: item.nb_reactions
                }));

                const formattedMessages = messagesData.nb_message.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    nb_message: item.nb_message
                }));

                setDataEmojis(formattedEmojis);
                setDataReactions(formattedReactions);
                setDataMessages(formattedMessages);
            } catch (err) {
                console.error("Erreur:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session_id) fetchData();
    }, [session_id]);

    if (loading) {
        return (
            <Card style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Card>
        );
    }

    if (error) {
        return (
            <Card style={{ padding: 16 }}>
                <Typography color="error">Erreur: {error}</Typography>
            </Card>
        );
    }

    // Fusionner les données par user_id
    const mergedData = dataEmojis.map(user => {
        const reaction = dataReactions.find(r => r.user_id === user.user_id);
        const message = dataMessages.find(m => m.user_id === user.user_id);
        return {
            user_id: user.user_id,
            user_name: user.user_name,
            nb_emojis: user.nb_emojis,
            nb_reactions: reaction ? reaction.nb_reactions : 0,
            nb_message: message ? message.nb_message : 0
        };
    });

    return (
        <Card style={{ padding: 16, height:450}}>
            <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}>
                Activité des utilisateurs (Emojis, Réactions, Messages)
            </Typography>
            <CardContent style={{ height: 350 }}>
                {mergedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={mergedData}
                        >
                            <XAxis dataKey="user_name" tick={false}/>
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => {
                                    switch (name) {
                                        case 'nb_emojis':
                                            return [value, 'Emojis'];
                                        case 'nb_reactions':
                                            return [value, 'Réactions'];
                                        case 'nb_message':
                                            return [value, 'Messages'];
                                        default:
                                            return [value, name];
                                    }
                                }}
                                contentStyle={{
                                    whiteSpace: 'normal', // permet le retour à la ligne
                                    overflowWrap: 'break-word', // force la coupure de ligne si nécessaire
                                    fontSize: 12,
                                    padding: 10,
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="nb_emojis"
                                name="Emojis"
                                stroke="#667eea"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="nb_reactions"
                                name="Réactions"
                                stroke="#82ca9d"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="nb_message"
                                name="Messages"
                                stroke="#ff7300"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography>Aucune donnée disponible</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default Emojis_Reactions;
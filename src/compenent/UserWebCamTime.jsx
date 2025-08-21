import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // Importer le hook useParams
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

const UserWebCamTime = () => {
    const { session_id } = useParams();  // Utiliser useParams pour obtenir le paramètre de l'URL
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/WebCamtimes`);

                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }

                const result = await response.json();
                console.log("Données reçues:", result); // Vérifiez dans la console

                // Transformation des données pour Recharts
                const formattedData = result.webcam_times.map(item => ({
                    user_id: item.user_id,
                    user_name: item.user_name,
                    webcam_time: item.webcam_time // Assurez-vous que webcam_time est bien défini
                }));

                console.log("Données formatées:", formattedData);
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
    }, [session_id]);  // Ajoute session_id comme dépendance pour recharger quand il change

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

    return (
        <Card style={{ padding: 16 ,height: 450}}>
            <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}>
                Durée d'activation de la caméra par utilisateur
            </Typography>
            <CardContent style={{ height: 350 }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                        >
                            <XAxis dataKey="user_name" label={{ value: 'Utilisateurs', position: 'insideBottomCenter', offset: -10 }}  tick={false} />
                            <YAxis label={{ value: 'Temps de caméra', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                formatter={(value) => {
                                    // Convertir la valeur en secondes en heures, minutes, secondes
                                    const seconds = value;
                                    const hours = Math.floor(seconds / 3600);
                                    const minutes = Math.floor((seconds % 3600) / 60);
                                    const remainingSeconds = seconds % 60;

                                    // Formatage du texte pour afficher le temps
                                    return [`${hours} heures, ${minutes} minutes, ${remainingSeconds} secondes`, 'Durée d\'activation de la caméra '];
                                }}
                                contentStyle={{
                                    maxWidth: 150,
                                    whiteSpace: 'normal', // permet le retour à la ligne
                                    overflowWrap: 'break-word', // force la coupure de ligne si nécessaire
                                    fontSize: 12,
                                    padding: 10,
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="webcam_time"
                                name="Durée d'activation de la caméra "
                                fill="#667eea"
                                barSize={25}
                                radius={[10, 10, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography>Aucune donnée disponible</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default UserWebCamTime;

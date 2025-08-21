import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {
    Card,
    Typography,
    CircularProgress,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

export const EmojiUserSession = () => {
    const {session_id, user_id} = useParams();
    const [emojis, setEmojis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/${session_id}/${user_id}/GetEmojiUser`);

                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }

                const result = await response.json();
                console.log("Données reçues GetReaction:", result);

                if (!Array.isArray(result)) {
                    throw new Error("Format de données invalide");
                }

// On mappe les colonnes indexées -> noms clairs
                const mappedEmojis = result.map(row => ({
                    name: row[2],
                    sent_on: row[3],
                }));

                setEmojis(mappedEmojis);

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


    return (
    <Card sx={{
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2,
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{color: "#3b3f91"}}> Emoji envoyé par l'utilisateur
                </Typography>

                {loading && <CircularProgress/>}
                {error && <Typography color="error">{error}</Typography>}

                {!loading && emojis.length > 0 && (
                    <TableContainer component={Paper} sx={{
                        maxHeight: 100,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {width: '6px'},
                        '&::-webkit-scrollbar-thumb': {backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px'}
                    }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nom de la réaction</TableCell>
                                    <TableCell>Envoyée le</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {emojis.map((reaction, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{reaction.name}</TableCell>
                                        <TableCell>{new Date(reaction.sent_on).toLocaleTimeString()
                                        }</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {!loading && emojis.length === 0 && !error && (
                    <Typography>Aucune réaction trouvée.</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default EmojiUserSession;

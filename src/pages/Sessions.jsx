import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import {Button, Grid} from "@mui/material";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ModernButton} from "../compenent/atoms/styles.js";
import {handleNavigation} from "../utils/navigation.jsx";


const Sessions = () => {
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const handleCardSelect = (index) => {
        setSelectedCard(index);
    };
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/GetSession');
                if (!response.ok) throw new Error('Erreur API');

                const data = await response.json();
                console.log("📦 Données reçues :", data); // <-- ici pour voir ce que tu reçois
                setCards(data);

            } catch (error) {
                console.error('Erreur : ', error);
            }
        };

        fetchStats();
    }, []);
    const navigate = useNavigate();


    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 3
        }}>
            {/* Header */}
            <Box sx={{mb: 4, textAlign: 'center'}}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}
                >
                    Sessions
                </Typography>
                <Typography variant="h6" sx={{color: '#64748b', fontWeight: 300}}>
                    Liste des sessions enregistrées </Typography>
            </Box> <Box sx={{padding: '3%'}}>
            <Grid
                container
                spacing={2}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', // Initial layout for large screens
                    gap: 2,
                    '@media (max-width: 1200px)': { // Medium screens
                        gridTemplateColumns: 'repeat(2, 1fr)',
                    },
                    '@media (max-width: 600px)': { // Small screens
                        gridTemplateColumns: '1fr', // One column on very small screens
                    }
                }}
            >
                {cards.map((card, index) => (

                    <Card
                        key={card[0]}

                        sx={{
                            backgroundColor: selectedCard === index ? 'action.selected' : 'white',
                            transition: 'background-color 0.3s',
                            '&:hover': {
                                backgroundColor: selectedCard === index
                                    ? 'action.selectedHover'
                                    : 'action.hover'
                            }
                        }}
                    >

                        <CardContent sx={{height: '100%'}}>
                            <Typography variant="h5" component="div">
                                {card[2]}

                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Started on : {new Date(parseInt(card[3])).toString().split(' GMT')[0]}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Ended on : {new Date(parseInt(card[4])).toString().split(' GMT')[0]}

                            </Typography>
                            <ModernButton
                                onClick={() => {
                                    handleCardSelect(index);
                                    handleNavigation(navigate,`/Session/${card[0]}`);
                                }}
                                sx={{
                                    marginLeft: '70%',
                                    display: 'block',
                                }}
                                variant="contained"
                            >
                                Détail
                            </ModernButton>
                        </CardContent>
                    </Card>
                ))}
            </Grid>
        </Box>
        </Box>
    );
}

export default Sessions;
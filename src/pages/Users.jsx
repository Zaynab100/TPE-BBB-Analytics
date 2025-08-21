import React, { useState, useEffect, Fragment } from 'react';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Grid,
    useTheme,
    useMediaQuery
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import {StyledTableCell, StyledTableRow} from "../compenent/atoms/styles.js";
import {handleNavigation} from "../utils/navigation.jsx";
import {handleChangePage, handleChangeRowsPerPage} from "../utils/pagination.jsx";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));



    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/GetUser');
                if (!response.ok) throw new Error('Erreur API');

                const data = await response.json();
                console.log("📦 hiiii :", data);
                setUsers(data);
            } catch (error) {
                console.error('Erreur : ', error);
            }
        };
        fetchStats();
    }, []);



     return (
        <Grid container justifyContent="center" sx={{ px: isMobile ? 1 : 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',}}>
            <Grid
                item
                xs={12}
                sm={12}
                md={11}
                lg={10}
                xl={9}
                sx={{
                    width: '100%',
                    mx: 'auto',
                    px: isMobile ? 5 : 30,
                }}
            >
                <Paper elevation={3}>
                    <TableContainer sx={{ width: '100%' }}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Nom
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <Fragment key={user[0]}>
                                            <StyledTableRow>
                                                <StyledTableCell
                                                    component="th"
                                                    scope="row"
                                                    onClick={() => {
                                                        handleNavigation(navigate,`/Users/${user[0]}`);
                                                    }}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        fontSize: isMobile ? 12 : 14,
                                                    }}
                                                >
                                                    {user[2]}
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        </Fragment>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={isMobile ? [10, 20] : [20, 50, 100]}
                        component="div"
                        count={users.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage(setPage)}
                        onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPage, setPage)}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Users;


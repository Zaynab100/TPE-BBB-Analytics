export const handleChangePage = (setPage) => (event, newPage) => {
    setPage(newPage);
};

export const handleChangeRowsPerPage = (setRowsPerPage, setPage) => (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
};


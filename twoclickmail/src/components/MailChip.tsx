import { Button, IconButton, TableContainer, TextField, Typography } from "@mui/material";
import React from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeIcon from '@mui/icons-material/Mode';

import * as EmailValidator from "email-validator";

type RowMode = 'view' | 'edit' | 'delete';

type Row = {
    id: number,
    email: string,
    mode: RowMode,
};


const mailsToRows = (mails: string[]): Row[] => {
    return mails.map((mail, index) => {
        return {
            id: index,
            email: mail,
            mode: 'view' as RowMode,
        } as Row;
    });
}

const ViewCell = ({ row, setRow, editMode }: { row: Row, setRow: (row: Row) => void, editMode: boolean }) => {
    return (
        <>

            <Typography variant="body1" component="div">
                {row.email}
            </Typography>
            {(editMode &&
            <div>
                
                <IconButton aria-label="edit" onClick={() => { setRow({ ...row, mode: 'edit' }) }}>
                    <ModeIcon fontSize="small" />
                </IconButton>

                <IconButton aria-label="delete" onClick={() => { setRow({ ...row, mode: 'delete' }) }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </div>
            )}
        </>
    );
}


const EditCell = ({ row, setRow }: { row: Row, setRow: (row: Row) => void }) => {
    const [editValue, setEditValue] = React.useState<string>(row.email);

    const saveEmail = (email: string) => {
        const isValid = EmailValidator.validate(email);
        if (isValid) {
            setRow({ ...row, email: email, mode: 'view' });
        } else {
            alert(`Invalid email: "${email}"`);
        }
    }

    return (
        <>
            <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                size="small"
                value={editValue}
                onChange={(e) => { setEditValue(e.target.value) }}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        saveEmail(editValue);
                    }
                }}
                
            />
            <div>
                <IconButton aria-label="save" onClick={() => { saveEmail(editValue); }}>
                    <CheckIcon fontSize="small" />
                </IconButton>

                <IconButton aria-label="close" onClick={() => {
                    if (row.email === '') {
                        setRow({ ...row, mode: 'delete' });
                    } else {
                        setRow({ ...row, mode: 'view' })
                    }
                }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        </>
    );
}

export const MailChip = ( {mailState, editMode} : { mailState: {mails: string[], setMails: (mails: string[]) => void}, editMode: boolean }) => {
    const {mails, setMails} = mailState;
    const [rowValues, setRowValues] = React.useState<{ id: number, email: string, mode: RowMode }[]>(mailsToRows(mails));
    const [rowIdCount, setRowIdCount] = React.useState(rowValues.length);

    const [editRowColor, setEditRowColor] = React.useState<'grey' | 'black'>('grey');

    const addEditRow = () => {
        setRowValues([...rowValues, { id: rowIdCount, email: '', mode: 'edit' }]);
        setRowIdCount(rowIdCount + 1);
    }

    const setRow = (id: number, row: Row) => {
        if (row.mode === 'delete') {
            const newValues = rowValues.filter((row) => row.id !== id);
            setRowValues(newValues);
            setMails(newValues.map((row) => row.email));
            return;
        }

        const newValues = rowValues.map((_row) => {
            if (_row.id === id) {
                return row;
            }
            return _row;
        });

        setRowValues(newValues);
        setMails(newValues.map((row) => row.email));
    }


    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rowValues.map((row) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                <Stack direction="row" alignItems="center" justifyContent='space-between' gap={1}>
                                    {row.mode === 'view' && (
                                        <ViewCell row={row} setRow={(_row) => setRow(row.id, _row)} editMode={editMode} />
                                    )}
                                    {row.mode === 'edit' && (
                                        <EditCell row={row} setRow={(_row) => setRow(row.id, _row)} />
                                    )}
                                </Stack>

                            </TableCell>
                        </TableRow>
                    ))}

                    {(editMode &&
                    <TableRow>
                        <TableCell component="th" scope="row" onMouseEnter={() => setEditRowColor('black')} onMouseLeave={() => setEditRowColor('grey')} onClick={() => { addEditRow() }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ color: editRowColor }}>
                                <AddIcon />
                                <Typography variant="body1">Click to add new email</Typography>
                            </Stack>
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
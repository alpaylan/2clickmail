
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export const MailChip = (mails: string[]) => {
    // A set of mail addresses put into small bubbles
    const style = {
        display: "flex",
        listStyle: "none",
        padding: 0,
        margin: 0,
        backgroundColor: "white",
        borderRadius: "5px",
        border: "1px solid #ced4da",
        boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    };

    const chipStyle = {
        margin: "5px",
    };

    return (
        <Box sx={{ width: 500, maxWidth: 500, bgcolor: "background.paper" }}>
            <ul style={style}>
                {mails.map((data) => {
                    return (
                        <li key={data}>
                            <Chip label={data} style={chipStyle} />
                        </li>
                    );
                })}
            </ul>
        </Box>
    );
}
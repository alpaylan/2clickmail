import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';

const Footer = () => {

  return (
    <Box sx={{ pb: 7 }}>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={2}>
        <BottomNavigation
          showLabels
        >
          <BottomNavigationAction label="Github Page" href="https://github.com/alpaylan/2clickmail" />
          <BottomNavigationAction label="About" href="/about" />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default Footer;
import { useState, useContext } from 'react';
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Toolbar,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { StoreContext } from '../providers/BasicStoreProvider';
import { useAuth } from '../providers/AuthProvider';

const navItems = [{ name: 'Competitions' }, { name: 'Import Competition' }];

function Mainbar() {
  const [open, setOpen] = useState(false);
  const { jwt, logout, login } = useAuth();
  const [appTitle] = useContext(StoreContext).appTitle;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <AppBar position="relative">
        <Toolbar
          sx={{
            pr: '24px',
          }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography>{appTitle}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          {navItems.map((item) => (
            <ListItemButton key={item.name}>{item.name}</ListItemButton>
          ))}
        </List>
        <Divider />
        <div style={{ display: 'flex', flex: 1 }} />
        <Divider />
        <ListItemButton
          style={{ display: 'flex', flexGrow: 0 }}
          onClick={jwt ? logout : login}>
          {jwt ? 'Logout' : 'Login'}
        </ListItemButton>
      </Drawer>
    </>
  );
}

export default Mainbar;

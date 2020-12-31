import React, { useContext, useState } from 'react';
import { withStyles, makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/MenuOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import GitHubIcon from '@material-ui/icons/GitHub';
import { ZKTitle } from "./Title";
import { AuthContext } from "../app/AuthContext";
import {
  accentColor,
  secondAccent,
  textColor,
  background,
} from "../styles";
import { Button, Modal } from '@material-ui/core';
import Login from './Login';
import About from './About';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    background: background,
    color: accentColor,
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: "unset",
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: textColor,
      },
    },
  },
}))(MenuItem);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

// AppBar shows LOGIN or username alongside Github icon
const LoginButton = (props: { onClick: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined; }) => {

  return (
    <AuthContext.Consumer>
      {(Auth) => {return (Auth.isLoggedIn && Auth.authUser) ?
        (<Button
          aria-controls="github-login"
          color="inherit"
          endIcon={<GitHubIcon />}
          style={{ color: accentColor }}
          onClick={props.onClick}
          >
          {Auth.authUser?.displayName || "-"}
        </Button>)
      : 
        (<Button
          aria-controls="github-login"
          color="inherit"
          endIcon={<GitHubIcon >Login</GitHubIcon>}
          style={{ color: accentColor }}
          onClick={props.onClick}
          >
          Login
        </Button>)
      }}
    </AuthContext.Consumer>
  );
};


const MainMenu = (props: { anchorEl: Element | ((element: Element) => Element) | null | undefined; handleClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined; }) => {
  const [openAbout, setOpenAbout] = useState(false);

  const toggleAbout = () => {
    setOpenAbout(open => {
      if (props.handleClose) props.handleClose({}, 'backdropClick');
      return !open;
    });
  }

  return (
    <span>
      <StyledMenu
        id="customized-menu"
        anchorEl={props.anchorEl}
        keepMounted
        open={Boolean(props.anchorEl)}
        onClose={props.handleClose}
      >
      <StyledMenuItem>
        <ListItemIcon>
            <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Coordinator Settings" />
        </StyledMenuItem>
        <StyledMenuItem>
        <ListItemIcon>
            <InfoIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="About" onClick={toggleAbout}/>
        </StyledMenuItem>
      </StyledMenu>
      <About open={openAbout} close={toggleAbout} />
    </span>
  );
};

const LoginMenu = (props: { anchorEl: Element | ((element: Element) => Element) | null | undefined; handleClose: (() => void) | undefined; }) => {
  return (
    <StyledMenu
      id="customized-menu"
      anchorEl={props.anchorEl}
      keepMounted
      open={Boolean(props.anchorEl)}
      onClose={props.handleClose}
    >
      <StyledMenuItem>
        <Login close={props.handleClose}/>
      </StyledMenuItem>
    </StyledMenu>

  );
};



export default function ButtonAppBar() {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [loginAnchorEl, setLoginAnchorEl] = React.useState<null | HTMLElement>(null);
    const Auth = React.useContext(AuthContext);
    const classes = useStyles();

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
      setMenuAnchorEl(null);
    };
        
    const handleLoginClick = (event: React.MouseEvent<HTMLElement>) => {
      setLoginAnchorEl(event.currentTarget);
  };
  
  const handleLoginClose = () => {
    setLoginAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('loggin out');
    Auth.setLoggedIn(false);
  }
      
  return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <IconButton 
            edge="start" 
            className={classes.menuButton} 
            color="inherit" 
            aria-label="menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            >
            <MenuIcon style={{ color: accentColor }}/>
          </IconButton>
          <MainMenu anchorEl={menuAnchorEl} handleClose={handleMenuClose} />
          <ZKTitle />
          <LoginButton onClick={handleLoginClick}/>
          <LoginMenu anchorEl={loginAnchorEl} handleClose={handleLoginClose} />
        </Toolbar>
      </AppBar>
    </div>
  );
}

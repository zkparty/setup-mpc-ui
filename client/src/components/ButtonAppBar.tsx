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
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import { ZKTitle } from "./Title";
import { AuthStateContext, AuthDispatchContext } from "../state/AuthContext";
import {
  accentColor,
  secondAccent,
  textColor,
  background,
  darkerBackground,
  NormalBodyText,
  subtleText,
  lighterBackground,
} from "../styles";
import Options from './Options';
import { ComputeStateContext, Step } from '../state/ComputeStateManager';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { CeremonyProgress } from './ProgressPanel';
import { useSelectionContext } from '../state/SelectionContext';

const allowOptions = true; // if true, the 'Options' panel is available

interface ScrollProps {
  children: React.ReactElement;
}

function ElevationScroll(props: ScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {backgroundColor: background},
  });
}

const StyledMenu = withStyles({
  paper: {
    border: `1px solid ${lighterBackground}`,
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

interface MainMenuProps {
  anchorEl: Element | ((element: Element) => Element) | null | undefined; 
  handleClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined; 
  logout: () => void;
}

const MainMenu = (props: MainMenuProps) => {
  const [openOptions, setOpenOptions] = useState(false);
  const [selection, dispatch] = useSelectionContext();
  const auth = useContext(AuthStateContext);

  const enableLogout = (auth.isLoggedIn && auth.authUser);

  const toggleOptions = () => {
    setOpenOptions(open => {
      if (props.handleClose) props.handleClose({}, 'backdropClick');
      return !open;
    });
  }

  // const toggleAbout = () => {
  //   setOpenAbout(open => {
  //     if (props.handleClose) props.handleClose({}, 'backdropClick');
  //     return !open;
  //   });
  // }

  const newCircuit = () => {
    dispatch({ type: 'ADD_CEREMONY' });
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
          <ListItemText primary="Logout"  
            onClick={ enableLogout ? props.logout : undefined } 
            style={{ color: (enableLogout ? textColor : subtleText) }} />
        </StyledMenuItem>
        {allowOptions ? (
          <StyledMenuItem>
            <ListItemText primary="Options" onClick={toggleOptions} style={{ color: textColor }} />
          </StyledMenuItem>
          ) : (<></>)
        }
        {auth.isCoordinator ?
          (<StyledMenuItem>
            <ListItemText primary="New Circuit" onClick={newCircuit} style={{ color: textColor }}/>
          </StyledMenuItem>) 
          : (<></>)
        }
      </StyledMenu>
      <Options open={openOptions} close={toggleOptions} />
    </span>
  );
};

export default function ButtonAppBar() {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const AuthDispatch = React.useContext(AuthDispatchContext);
  const state = useContext(ComputeStateContext);
  const classes = useStyles();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    // Toggle menu
    if (menuAnchorEl) {
      handleMenuClose();
    } else {
      setMenuAnchorEl(event.currentTarget);
    }
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
      
  const handleLogout = () => {
    console.debug('logging out');
    if (AuthDispatch) AuthDispatch({type: 'LOGOUT'});
    handleMenuClose();
  }

  const displayProgress = ((
    state.step === Step.WAITING || 
    state.step === Step.QUEUED ||
    state.step === Step.RUNNING)
    && !state.isProgressPanelVisible
  );

  const menuIcon = (
      menuAnchorEl ? 
        (<CloseIcon style={{ color: textColor }}/>)
      : (<MenuIcon style={{ color: textColor }}/>)
  );
      
  return (
    <div className={classes.root}>
      <ElevationScroll>
        <AppBar color='default'>
          <Toolbar>
            <IconButton 
              edge="start" 
              className={classes.menuButton} 
              color="inherit" 
              aria-label="menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              >
              {menuIcon}
            </IconButton>
            <MainMenu anchorEl={menuAnchorEl} handleClose={handleMenuClose} logout={handleLogout} />
            <ZKTitle title={state.project?.shortName} />
            {displayProgress ? 
              <div style={{ display: 'flex' }}>
                {/*<NormalBodyText>Your contribution: </NormalBodyText>*/}
                <CeremonyProgress format='bar' 
                  barColor={(state.step === Step.QUEUED) ? subtleText : accentColor}
                />
              </div> 
            : (<></>)}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </div>
  );
}

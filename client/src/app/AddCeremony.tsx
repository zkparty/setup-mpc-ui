import { useState, useContext, useRef, ReactNode } from "react";
import * as React from "react";
import styled from "styled-components";
import TextField, { FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps } from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import { useSnackbar, withSnackbar } from 'notistack';
import firebase from "firebase/app";
import "firebase/storage";
import {
  textColor,
  lighterBackground,
  accentColor,
  PageContainer,
  secondAccent,
  CeremonyTitle,
  Center
} from "../styles";
import { Ceremony, CeremonyEvent } from "../types/ceremony";
import { addCeremony, jsonToCeremony } from "../api/ZKPartyApi";
import { addCeremonyEvent, ceremonyEventListener, getCeremony } from "../api/FirestoreApi";
import FileUploader from "../components/FileUploader";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import { useSelectionContext } from "./SelectionContext";
import { UploadCircuitFile } from "../api/FileApi";

const HomeLinkContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;

  a {
    color: ${accentColor};

    &:hover {
      color: ${textColor};
      background-color: ${secondAccent};
    }
  }
`;

const NotFoundContainer = styled.div`
  width: 512px;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
  text-align: center;
`;

const CeremonyDetailsContainer = styled.div`
  width: 512px;
  background-color: ${lighterBackground};
  padding: 16px;
  border-radius: 4px;
`;

const AddCeremonyPage = () => {
  const [ceremony, setCeremony] = useState<null | Ceremony>(null);
  const [selection, dispatch] = useSelectionContext();

  console.debug(`AddCeremony ${selection.ceremonyId} ${JSON.stringify(ceremony)}`);

  // Edit an existing ceremony
  if (selection.ceremonyId && !ceremony) {
    console.debug(`getting ceremony`);
    getCeremony(selection.ceremonyId).then(
      c => {
        console.debug(`have ceremony`);
        if (c) setCeremony(c);
    });
  }

  const onSubmit = () => {
    dispatch({
      type: 'CLOSE_CEREMONY',      
    });
  }

  return (
      <CeremonyDetails ceremony={ceremony} onSubmit={onSubmit}></CeremonyDetails> 
  );
};

const CssTextField = withStyles({
    root: {
      "& .MuiInput-root": {
        color: textColor,
      },
      "& label": {
        color: accentColor
      },
      "& label.Mui-focused": {
        color: accentColor,
      },
      "& .MuiInput-underline:after": {
        borderBottomColor: accentColor,
      },
      "& .MuiOutlinedInput-root": {
        "&.Mui-focused fieldset": {
          borderColor: secondAccent,
        }
      }
    }
  })(TextField);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'block',
      flexWrap: 'wrap', 
    },
    margin: {
      margin: theme.spacing(1),
    },
  }),
);

const CeremonyDetails = (props: { ceremony: Ceremony | null, onSubmit: () => void}) => {
  const classes = useStyles();
  const ceremony = useRef<Ceremony | any>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const statusUpdate = (event: CeremonyEvent) => {
    enqueueSnackbar(event.message);
  };

  var circuitFile: File | null = null;
  if (!ceremony.current.id) {
    if (props.ceremony) {
      try {
        ceremony.current = props.ceremony;
        console.debug(`ceremony id ${ceremony.current.id}`);
      } catch (err) {
        console.log(`Cannot parse provided ceremony ${err.message}`);
      }
    } else {
      console.debug(`adding ceremony`);
    }
  }

  //TODO - return unsub + avoid subbing 2ce
  if (ceremony.current) ceremonyEventListener(ceremony.current.id, statusUpdate); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(`handleChange ${e.target.id}`);
      e.preventDefault();

      switch (e.target.id) {
        //case 'title': ceremony.current.title = e.target.value; break;
        //case 'description': ceremony.current.description = e.target.value; break;
        case 'start-time': ceremony.current.startTime = Date.parse(e.target.value); break;
        case 'end-time': ceremony.current.endTime = Date.parse(e.target.value); break;
        case 'min-participants': ceremony.current.minParticipants = parseInt(e.target.value); break;
      }
  };

  const handleFileUpload = (f: File) => {
      console.log(`handleFileUpload`);
      circuitFile = f;
  }

  const validateInput = () => {
    var isValid = true;
    ceremony.current.title = titleRef.current?.value;
    ceremony.current.description = descRef.current?.value;
    if (!ceremony.current.title || ceremony.current.title.length == 0) {enqueueSnackbar("Must have a title"); isValid = false;}
    if (!ceremony.current.description || ceremony.current.description.length == 0) {enqueueSnackbar("Must have a description"); isValid = false;};
    return isValid;
  };

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    console.log(`submit ....`);
    event.preventDefault();
    // validate
    if (!validateInput()) return;

    if (circuitFile) {
        // Firebase storage ref for the new file
        ceremony.current.circuitFileName = circuitFile.name;
    };
    // insert new DB record. Get id
    addCeremony(ceremony.current).then((id: string) => {
        console.log(`ceremony added: ${id}`);

        ceremonyEventListener(id, statusUpdate);

        if (circuitFile) {          
          UploadCircuitFile(id, circuitFile).then((snapshot) => {
              console.log('Uploaded file!');
              const event: CeremonyEvent = {
                sender: "COORDINATOR",
                eventType: "CIRCUIT_FILE_UPLOAD",
                timestamp: new Date(),
                message: "",
                acknowledged: false,
              }
              addCeremonyEvent(id, event);
              props.onSubmit();
          });
        }
    });
  }

  console.debug(`current title ${ceremony.current?.title}`);

  return (
    <CeremonyDetailsContainer>
        <form className={classes.root} noValidate autoComplete="off" >
            <CssTextField 
              id="title" 
              label="Title" 
              type='text'
              value={ceremony.current?.title}
              /*onChange={handleChange}*/ 
              inputRef={titleRef}
            />

            <br />
            <CssTextField 
              id="description" 
              label="Description" 
              value={ceremony.current?.description} 
              /*onChange={handleChange}*/
              inputRef={descRef}
            />
            <br />
            <span style={{ display: "flow"}}>
                <InputLabel variant="standard" style={{ color: accentColor }}>Circuit File:</InputLabel>
                <FileUploader id="circuitFileName" onChange={handleFileUpload} />
                <label>{ceremony.current?.circuitFileName}</label>
            </span>
            <br />
            <CssTextField
                id="start-time"
                label="Start time"
                type="datetime-local"
                InputLabelProps={{
                    shrink: true,
                }}
                value={ceremony.current?.startTime}
                onChange={handleChange}
            />
            <br />
            <CssTextField
                id="end-time"
                label="End time"
                type="datetime-local"
                InputLabelProps={{
                    shrink: true,
                }}
                value={ceremony.current?.endTime}
                onChange={handleChange}
            />
            <br />
            <CssTextField 
              id="min-participants" 
              label="Minimum Participants" 
              type='number'
              value={ceremony.current?.minParticipants} 
              onChange={handleChange}/>
            <br />
            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
      </form>
    </CeremonyDetailsContainer>
  );
};

export default withSnackbar(AddCeremonyPage);
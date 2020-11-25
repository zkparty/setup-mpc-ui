import { useState, useContext } from "react";
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
import { addCeremonyEvent, ceremonyEventListener } from "./../api/FirebaseApi";
import FileUploader from "../components/FileUploader";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";


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

const StyledTextField = styled(TextField)`
  color: "white";

  & .label {
      color: ${textColor}
  }

  & .MuiInput-root {
    color: "white"
  }

  & .MuiInputLabel-root {
      color: "yellow"
  }

  & .MuiInputBase-root {
      color: "white"
  }


`;

const statusUpdate = (event: CeremonyEvent) => {
  const { enqueueSnackbar } = useSnackbar();
  enqueueSnackbar(event.message);
};

const AddCeremonyPage = () => {
  const [ceremony, setCeremony] = useState<null | Ceremony>(null);

  ceremonyEventListener(ceremony?.id, statusUpdate);

  return (
      <CeremonyDetails ceremony={ceremony}></CeremonyDetails> 
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

const CeremonyDetails = (props: { ceremony: Ceremony | null}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  var newCeremony: Ceremony | any = {};
  var circuitFile: File | null = null;
  if (props.ceremony) {
    try {
      newCeremony = jsonToCeremony(props.ceremony);
    } catch (err) {
      console.log(`Cannot parse provided ceremony ${err.message}`);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(`handleChange ${e.target.id}`);

      switch (e.target.id) {
        case 'title': newCeremony.title = e.target.value; break;
        case 'description': newCeremony.description = e.target.value; break;
        case 'start-time': newCeremony.startTime = new Date(Date.parse(e.target.value)); break;
        case 'end-time': newCeremony.endTime = new Date(Date.parse(e.target.value)); break;
        case 'min-participants': newCeremony.minParticipants = parseInt(e.target.value); break;
      }
  };

  const handleFileUpload = (f: File) => {
      console.log(`handleFileUpload`);
      circuitFile = f;
  }

  const validateInput = () => {
    var isValid = true;
    if (!newCeremony.title || newCeremony.title.length == 0) {enqueueSnackbar("Must have a title"); isValid = false;}
    if (!newCeremony.description || newCeremony.description.length == 0) {enqueueSnackbar("Must have a description"); isValid = false;};
    return isValid;
  };

  const handleSubmit = () => {
    console.log(`submit ....`);
    // validate
    if (!validateInput()) return;

    if (circuitFile) {
        // Firebase storage ref for the new file
        newCeremony.circuitFileName = circuitFile.name;
    };
    // insert new DB record. Get id
    addCeremony(newCeremony).then((id: string) => {
        console.log(`ceremony added: ${id}`);

        // upload circuit file
        const storageRef = firebase.storage().ref();
        const ceremonyDataRef = storageRef.child(`ceremony_data/${id}`);

        const fileReader = new FileReader();
        if (circuitFile) {  
          // Firebase storage ref for the new file
          const fbFileRef = ceremonyDataRef.child(circuitFile.name);
          
          fbFileRef.put(circuitFile).then((snapshot) => {
              console.log('Uploaded file!');
              const event: CeremonyEvent = {
                sender: "COORDINATOR",
                eventType: "CIRCUIT_FILE_UPLOAD",
                timestamp: new Date(),
                message: "",
                acknowledged: false,
              }
              addCeremonyEvent(id, event);
          });
        }
    });
  }

  return (
    <CeremonyDetailsContainer>
        <form className={classes.root} noValidate autoComplete="off" >
            <CssTextField id="title" label="Title" defaultValue={props.ceremony?.title} onChange={handleChange}/>

            <br />
            <CssTextField id="description" label="Description" defaultValue={props.ceremony?.description} onChange={handleChange}/>
            <br />
            <span style={{ display: "flow"}}>
                <InputLabel variant="standard" style={{ color: accentColor }}>Circuit File:</InputLabel>
                <FileUploader id="circuitFileName" onChange={handleFileUpload} />
                <label>{props.ceremony?.circuitFileName}</label>
            </span>
            <br />
            <CssTextField
                id="start-time"
                label="Start time"
                type="datetime-local"
                InputLabelProps={{
                    shrink: true,
                }}
                defaultValue={props.ceremony?.startTime}
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
                defaultValue={props.ceremony?.endTime}
                onChange={handleChange}
            />
            <br />
            <CssTextField id="min-participants" label="Minimum Participants" defaultValue={props.ceremony?.minParticipants} onChange={handleChange}/>
            <br />
            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
      </form>
    </CeremonyDetailsContainer>
  );
};

export default withSnackbar(AddCeremonyPage);
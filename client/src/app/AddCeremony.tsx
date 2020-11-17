import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import * as React from "react";
import styled from "styled-components";
import FormControl from '@material-ui/core/FormControl';
import TextField, { FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps } from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import firebase from "firebase";

import {
  textColor,
  lighterBackground,
  accentColor,
  PageContainer,
  secondAccent,
  CeremonyTitle,
  Center
} from "../styles";
import { Ceremony } from "../types/ceremony";
import { addCeremony } from "../api/ZKPartyApi";
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


const StyledTextField2 = (props: (JSX.IntrinsicAttributes & StandardTextFieldProps) | (JSX.IntrinsicAttributes & FilledTextFieldProps) | (JSX.IntrinsicAttributes & OutlinedTextFieldProps)) => {
    return <StyledTextField {...props} InputLabelProps={{
        style: { color: accentColor },
      }}/>
}

export const AddCeremonyPage = () => {
  //let { id } = useParams<{ id: string }>();
  //const [loaded, setLoaded] = useState<boolean>(false);
  const [ceremony, setCeremony] = useState<null | Ceremony>(null);
    /*
  const refreshCeremony = () => {
    getCeremonyData(id)
      .then(ceremony => {
        setCeremony(ceremony);
      })
      .catch(err => {
        console.error(`error getting ceremony: ${err}`);
      });
  };

  useEffect(() => {
    getCeremonyDataCached(id)
      .then(ceremonyData => {
        setCeremony(ceremonyData);
        setLoaded(true);
        refreshCeremony();
        // TODO: clear interval with returned function for useEffect
        setInterval(refreshCeremony, 15000);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [loaded]);
*/
  return (    
      <>
      <HomeLinkContainer>
        <Link to="/">home</Link>
      </HomeLinkContainer>
        <PageContainer>
          <br />
          <CeremonyDetails ceremony={ceremony}></CeremonyDetails> 
       </PageContainer>
       </>
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

  var newCeremony: Ceremony | any = {...props.ceremony};

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
      newCeremony.circuitFile = f;
  }

  const handleSubmit = () => {
      console.log('submit ....');
    // validate
    if (newCeremony.circuitFile) {
  
        // Firebase storage ref for the new file
        newCeremony.circuitFileName = newCeremony.circuitFile.name;
    };
    // insert new DB record. Get id
    addCeremony(newCeremony).then((id: string) => {
        console.log(`ceremony added: ${id}`);

        // upload circuit file
        const storageRef = firebase.storage().ref();
        const ceremonyDataRef = storageRef.child(`ceremony_data/${id}`);

        const fileReader = new FileReader();
        if (newCeremony.circuitFile) {
  
          // Firebase storage ref for the new file
          const fbFileRef = ceremonyDataRef.child(newCeremony.circuitFile.name);
          
          fbFileRef.put(newCeremony.circuitFile).then((snapshot) => {
              console.log('Uploaded file!');
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
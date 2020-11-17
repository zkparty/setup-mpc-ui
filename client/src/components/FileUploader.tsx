import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import firebase from "firebase";
import { CloudUpload } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
    button: {
        margin: theme.spacing(1),
      },
  }),
);

export default function FileUploader() {
    const storageRef = firebase.storage().ref();
    const ceremonyDataRef = storageRef.child("ceremony_data");
    
      const classes = useStyles();

  const handleFile = ({ target } : React.ChangeEvent<HTMLInputElement>) => {
      const fileReader = new FileReader();
      console.log(`target file: ${target.files? target.files[0].name : "-"}`);
      if (target.files) {

        // Firebase storage ref for the new file
        const fbFileRef = ceremonyDataRef.child(target.files[0].name);
        
        fbFileRef.put(target.files[0]).then((snapshot) => {
            console.log('Uploaded file!');
        });
        //   const name = target.accept.includes('image') ? 'images' : 'videos';

        //   fileReader.readAsDataURL(target.files[0]);
        //   fileReader.onload = (e) => {
        //       this.setState((prevState) => ({
        //           [name]: [...prevState[name], e.target.result]
        //       }));
        //   };
      }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
        <Button
            variant="contained"
            color="default"
            className={classes.button}
            startIcon={<CloudUpload />}
        >Upload<input
            type="file"
            hidden
            onChange={handleFile}
        />
        </Button>
    </form>
  );
}
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

export default function FileUploader(props: { id: string, onChange: (f: File) => void }) {
    
    const classes = useStyles();

    const handleFile = ({ target } : React.ChangeEvent<HTMLInputElement>) => {
        console.log(`target file: ${target.files? target.files[0].name : "-"}`);
        
        if (target.files) {
            props.onChange(target.files[0]);
        }
    };

  return (
        <Button
            variant="contained"
            color="default"
            className={classes.button}
            startIcon={<CloudUpload />}
        >Upload<input
            type="file"
            //hidden
            onChange={handleFile}
        />
        </Button>
  );
}
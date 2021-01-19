import { Ceremony } from "../types/ceremony";
import moment from 'moment';

export const ceremonyStatus = (c: Ceremony): string => {
    let status: string;
    switch (c.ceremonyState) {
      case "WAITING":
      case "PRESELECTION": {
        
        status = `Will start accepting contributions ${moment(c.startTime).fromNow()}`;
        break;
      }
      case 'PAUSED': {
        status = 'Not accepting contributions at present';
        break;
      }
      case 'RUNNING': {
        status = 'Accepting contributions';
        break;
      }
      default: {
        status = c.ceremonyState;
      }
    };
    return status;
}
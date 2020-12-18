import React, { createContext, useContext, useReducer } from "react";

export interface SelectedCeremonyContextInterface {
    ceremonyId: string | null,
    edit: boolean,
    openModal: boolean,
  };
  
  const defaultSelection: SelectedCeremonyContextInterface = {
    ceremonyId: null,
    edit: false,
    openModal: false,
  };
  export const SelectedCeremonyContext = createContext<any[]>([]);
  
  export const SelectionContextProvider = ({ children }: any) => {
    const contextValue = useReducer(selectionReducer, defaultSelection);
    return (
      <SelectedCeremonyContext.Provider value={contextValue}>
        {children}
      </SelectedCeremonyContext.Provider>
    );
  };

  export const useSelectionContext = () => {
    const contextValue = useContext(SelectedCeremonyContext);
    return contextValue;
  }
  
  const selectionReducer = (state: any, action: any): SelectedCeremonyContextInterface => {
    let selection: SelectedCeremonyContextInterface = {ceremonyId: null, edit: false, openModal: false};
    switch (action.type) {
      case 'DISPLAY_CEREMONY': {
        selection = {...selection, ceremonyId: action.ceremonyId, openModal: true};
        break;
      }
      case 'ADD_CEREMONY': {
        selection.edit = true;
        break;
      }
      case 'EDIT_CEREMONY': {
        selection = {...selection, ceremonyId: action.ceremonyId, edit: true};
        break;
      }
      case 'CLOSE_CEREMONY': {
        // default
      }
    }
    return {...state, ...selection};
  }
  
  
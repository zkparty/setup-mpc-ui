import React, { createContext, useContext, useReducer } from "react";

export interface SelectedCeremonyContextInterface {
    ceremonyId: string | null,
    edit: boolean,
    openModal: boolean,
    activeTab: string,
  };
  
  const defaultSelection: SelectedCeremonyContextInterface = {
    ceremonyId: null,
    edit: false,
    openModal: false,
    activeTab: '1',
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
  
  const selectionReducer = (state: SelectedCeremonyContextInterface, action: any): SelectedCeremonyContextInterface => {
    console.debug(`selectionReducer ${action.type}`);
    let selection = defaultSelection;
    switch (action.type) {
      case 'DISPLAY_CEREMONY': {
        return { 
            ceremonyId: action.ceremonyId, 
            edit: false,
            openModal: true,
            activeTab: '1',
        };
      }
      case 'ADD_CEREMONY': {
        selection.edit = true;
        selection.activeTab = '3';
        return {...state, ...selection};
      }
      case 'EDIT_CEREMONY': {
        return {
            ceremonyId: action.ceremonyId, 
            edit: true, 
            openModal: false,
            activeTab: '3'
        };
      }
      case 'SET_TAB': {
        return {...state, activeTab: action.newTab};
      }
      case 'CLOSE_CEREMONY': {
        // default
        return {...state, ...defaultSelection};
      }
    }
    return state;
  }
  
  
import * as React from 'react';
import { useState, useEffect, Fragment } from "react";
import {
    accentColor,
    secondAccent,
    textColor,
    PageContainer,
    lighterBackground,
    SectionContainer,
    CeremonyTitle
  } from "../styles";
//import './styles.css';
import { Ceremony } from "../types/ceremony";
import { ceremonyListener, getCeremonies, getCeremony } from "../api/FirestoreApi";

export default function CircuitsGrid(props: any) {
    const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
    const [loaded, setLoaded] = useState(false);
    console.debug(`render summary section `);
  
    const findCeremonyIndex = (id: string): number => {
      return ceremonies.findIndex(val => val.id === id);
    }
  
    const updateCeremony = (ceremony: Ceremony) => {
      //console.log(`${ceremony}`);
      const idx = findCeremonyIndex(ceremony.id);
      const update = (c: Ceremony, i: number) => {
        if (i == idx) {
          console.debug(`updating ceremony ${ceremony.id} ${ceremony.complete}`);
          return ceremony;
        } else {
          return c;
        }
      }
      if (idx >= 0) {
        setCeremonies(prev => prev.map(update));
      } else {
        console.debug(`adding ceremony ${ceremony.id} ${ceremony.complete}`);
        setCeremonies(prev => [...prev, ceremony]);
      }
    };
  
    useEffect(() => {
      if (!loaded) {
        // Subscribe to ceremony updates
        ceremonyListener(updateCeremony);
        console.debug('getCeremonies done');
        setLoaded(true);
      }
    }, [loaded]);
  
    return (
      <>
        {ceremonies.map((c, i) => (
          <CeremonySummary key={i} ceremony={c} />
        ))}
      </>
    );
  };

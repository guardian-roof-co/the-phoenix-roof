import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, QuoteData } from '../types';

interface AuthContextType {
  appointments: Appointment[];
  savedQuotes: QuoteData[];
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  saveQuote: (quote: QuoteData) => void;
  getUserQuotes: () => QuoteData[];
  getUserAppointments: () => Appointment[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>([]);

  useEffect(() => {
    const storedAppts = localStorage.getItem('phoenix_appts_v2');
    const storedQuotes = localStorage.getItem('phoenix_quotes_v2');
    
    if (storedAppts) setAppointments(JSON.parse(storedAppts));
    if (storedQuotes) setSavedQuotes(JSON.parse(storedQuotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('phoenix_appts_v2', JSON.stringify(appointments));
    localStorage.setItem('phoenix_quotes_v2', JSON.stringify(savedQuotes));
  }, [appointments, savedQuotes]);

  const addAppointment = (apptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppt: Appointment = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...apptData
    };
    setAppointments([...appointments, newAppt]);
  };

  const saveQuote = (quote: QuoteData) => {
    if (!savedQuotes.find(q => q.id === quote.id)) {
        setSavedQuotes([...savedQuotes, quote]);
    }
  };

  const getUserQuotes = () => savedQuotes;
  const getUserAppointments = () => appointments;

  return (
    <AuthContext.Provider value={{ 
      appointments, 
      savedQuotes, 
      addAppointment, 
      saveQuote,
      getUserQuotes,
      getUserAppointments,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

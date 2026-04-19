import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { QueueEntry, apiService } from '../services/apiService';
import { socket } from '../services/socketService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { DEPARTMENTS } from '../data/mockData';

interface QueueContextType {
  tokens: QueueEntry[];
  stats: {
    waiting: number;
    serving: number;
    completed: number;
    byDepartment: { name: string; count: number }[];
  };
  generateToken: (data: { name: string; phone?: string; departmentId: string; source: string; userId?: string }) => Promise<QueueEntry>;
  updateTokenStatus: (tokenId: string, newStatus: QueueEntry['status']) => Promise<void>;
  resetQueue: () => Promise<void>;
  callNextInDepartment: (departmentId: string) => Promise<QueueEntry | null>;
  skipPatient: (tokenId: string) => Promise<void>;
  pauseDepartment: (departmentId: string) => Promise<void>;
  transferPatient: (tokenId: string, newDeptId: string) => Promise<void>;
  departments: { id: string; name: string }[];
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<QueueEntry[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Socket Listeners
  useEffect(() => {
    socket.on('queue_updated', () => {
      fetchInitialData();
    });

    socket.on('stats_updated', () => {
      // Re-fetch everything when stats change
      fetchInitialData();
    });

    return () => {
      socket.off('queue_updated');
      socket.off('stats_updated');
    };
  }, []);

  useEffect(() => {
    // Background notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const setupNotifications = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      }
    };

    setupNotifications();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQueue();
      if (response.data && response.data.queue) {
        // Map backend response to frontend QueueEntry
        const mappedQueue: QueueEntry[] = response.data.queue.map((q: any) => ({
          id: q._id,
          queue_number: `#${q.queue_number}`,
          patient_name: q.patient_name,
          phone: q.phone,
          department: { id: q.department._id, name: q.department_name },
          status: q.status,
          source: q.source,
          createdAt: new Date(q.createdAt),
        }));
        setTokens(mappedQueue);
      }
    } catch (error) {
      console.error("Failed to fetch queue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.data && response.data.departments) {
        const mapped = response.data.departments.map((d: any) => ({
          id: d._id,
          name: d.name
        }));
        setDepartments(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const skipPatient = async (tokenId: string) => {
    try {
      await apiService.skipPatient(tokenId);
      // Let socket listener handle state update
    } catch (error) {
      console.error("Skip Patient Error:", error);
      throw error;
    }
  };

  const pauseDepartment = async (departmentId: string) => {
    try {
      await apiService.pauseDepartment(departmentId);
      // Let socket handle update
    } catch (error) {
      console.error("Pause Department Error:", error);
      throw error;
    }
  };

  const transferPatient = async (tokenId: string, newDeptId: string) => {
    try {
      await apiService.transferPatient(tokenId, newDeptId);
      // Let socket handle update
    } catch (error) {
      console.error("Transfer Patient Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Derived Stats
  const stats = useMemo(() => {
    const waiting = tokens.filter(t => t.status === 'waiting').length;
    const serving = tokens.filter(t => t.status === 'current').length;
    const completed = tokens.filter(t => t.status === 'completed').length;

    const byDepartment = (departments.length > 0 ? departments : DEPARTMENTS).map(dept => {
      const count = tokens.filter(t => t.department.id === dept.id && t.status === 'waiting').length;
      return { name: dept.name, count };
    });

    return { waiting, serving, completed, byDepartment };
  }, [tokens]);

  const generateToken = async (data: { name: string; phone?: string; departmentId: string; source: string; userId?: string }) => {
    try {
      const response = await apiService.joinQueue({
        patient_name: data.name,
        phone: data.phone,
        department_id: data.departmentId,
        source: data.source
      });
      
      const newEntry: QueueEntry = {
        id: response.data.entry_id || Math.random().toString(16).slice(2),
        queue_number: `#${response.data.queue_number}`,
        patient_name: response.data.patient_name,
        phone: data.phone,
        department: { id: data.departmentId, name: response.data.department_name },
        status: 'waiting',
        source: data.source as any,
        createdAt: new Date(),
      };

      setTokens(prev => [...prev, newEntry]);
      return newEntry;
    } catch (error) {
      console.error("Queue Join Error:", error);
      throw error;
    }
  };

  const updateTokenStatus = async (tokenId: string, newStatus: QueueEntry['status']) => {
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, status: newStatus } : t
    ));
  };

  const callNextInDepartment = async (departmentId: string) => {
    const nextItem = tokens.find(t => t.department.id === departmentId && t.status === 'waiting');
    if (nextItem) {
      await updateTokenStatus(nextItem.id, 'current');
      return { ...nextItem, status: 'current' } as QueueEntry;
    }
    return null;
  };

  const resetQueue = async () => {
    setTokens([]);
  };

  return (
    <QueueContext.Provider value={{ 
      tokens, 
      stats, 
      generateToken, 
      updateTokenStatus, 
      resetQueue,
      callNextInDepartment,
      skipPatient,
      pauseDepartment,
      transferPatient,
      departments
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

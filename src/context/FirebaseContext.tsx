import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { WheelFinishId } from '../data/kahnData';
import { SITE } from '../config/site';

export type BrakeSystemType =
  | 'M Compound Steel'
  | 'M Carbon Ceramic'
  | 'Bespoke Big Brake Kit';

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  city: string;
  primaryMake: string;
  primaryModel: string;
  primaryYear: string;
  chassisCode: string;
  exteriorPaint: string;
  brakeSystem: BrakeSystemType;
  preferredFinish: WheelFinishId;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface UserVehicleData {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: string;
  chassisCode: string;
  exteriorPaint: string;
  brakeSystem: BrakeSystemType;
  targetWheelSlug: string;
  targetFinish: WheelFinishId;
  notes: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface SaveProfileInput {
  displayName: string;
  city: string;
  primaryMake: string;
  primaryModel: string;
  primaryYear: string;
  chassisCode: string;
  exteriorPaint: string;
  brakeSystem: BrakeSystemType;
  preferredFinish: WheelFinishId;
}

export interface SaveVehicleInput {
  make: string;
  model: string;
  year: string;
  chassisCode: string;
  exteriorPaint: string;
  brakeSystem: BrakeSystemType;
  targetWheelSlug: string;
  targetFinish: WheelFinishId;
  notes: string;
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  profile: UserProfileData | null;
  vehicles: UserVehicleData[];
  loadingData: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveUserProfile: (input: SaveProfileInput) => Promise<void>;
  addGarageVehicle: (input: SaveVehicleInput) => Promise<void>;
  updateGarageVehicle: (vehicleId: string, input: SaveVehicleInput) => Promise<void>;
  deleteGarageVehicle: (vehicleId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// Blueprint constraints synced verbatim with firebase-blueprint.json & firestore.rules
const ALLOWED_BRAKE_SYSTEMS: BrakeSystemType[] = [
  'M Compound Steel',
  'M Carbon Ceramic',
  'Bespoke Big Brake Kit',
];

const ALLOWED_FINISHES: WheelFinishId[] = [
  'silver',
  'satin-black',
  'champagne-bronze',
  'dark-gunmetal',
];

function clampStr(val: string, maxLen: number, fallback = ''): string {
  const trimmed = (val || fallback).trim();
  return trimmed.slice(0, maxLen);
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [vehicles, setVehicles] = useState<UserVehicleData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setProfile(null);
        setVehicles([]);
        setLoadingData(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Attach real-time Firestore listeners only when auth is ready and user is signed in
  useEffect(() => {
    if (!authReady || !user) return;

    setLoadingData(true);
    const userDocPath = `users/${user.uid}`;
    const userDocRef = doc(db, 'users', user.uid);

    const unsubProfile = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfileData);
        } else {
          setProfile(null);
        }
        setLoadingData(false);
      },
      (error) => {
        setLoadingData(false);
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    );

    const vehiclesPath = `users/${user.uid}/vehicles`;
    const vehiclesQuery = query(
      collection(db, 'users', user.uid, 'vehicles'),
      where('ownerId', '==', user.uid)
    );

    const unsubVehicles = onSnapshot(
      vehiclesQuery,
      (snapshot) => {
        const list: UserVehicleData[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserVehicleData, 'id'>),
        }));
        setVehicles(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, vehiclesPath);
      }
    );

    return () => {
      unsubProfile();
      unsubVehicles();
    };
  }, [authReady, user]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg);
      throw err;
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  const saveUserProfile = async (input: SaveProfileInput) => {
    if (!user) throw new Error('Must be signed in to save profile');
    const userDocPath = `users/${user.uid}`;
    const userDocRef = doc(db, 'users', user.uid);

    const safeBrake: BrakeSystemType = ALLOWED_BRAKE_SYSTEMS.includes(
      input.brakeSystem
    )
      ? input.brakeSystem
      : 'M Compound Steel';

    const safeFinish: WheelFinishId = ALLOWED_FINISHES.includes(
      input.preferredFinish
    )
      ? input.preferredFinish
      : 'silver';

    const sanitized = {
      displayName: clampStr(input.displayName, 100, user.displayName || 'FORGED Client'),
      city: clampStr(input.city, 80, ''),
      primaryMake: clampStr(input.primaryMake, 50, 'BMW'),
      primaryModel: clampStr(input.primaryModel, 80, 'G80 M3 Competition'),
      primaryYear: clampStr(input.primaryYear, 20, '2025'),
      chassisCode: clampStr(input.chassisCode, 40, 'G80'),
      exteriorPaint: clampStr(input.exteriorPaint, 60, 'Mint Green Individual'),
      brakeSystem: safeBrake,
      preferredFinish: safeFinish,
    };

    try {
      if (!profile) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: clampStr(user.email || `client@${SITE.domain}`, 150, `client@${SITE.domain}`),
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userDocRef, {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        profile ? OperationType.UPDATE : OperationType.CREATE,
        userDocPath
      );
    }
  };

  const addGarageVehicle = async (input: SaveVehicleInput) => {
    if (!user) throw new Error('Must be signed in to add a vehicle');

    // Ensure parent profile exists first to satisfy Master Gate rule
    if (!profile) {
      await saveUserProfile({
        displayName: user.displayName || 'FORGED Client',
        city: '',
        primaryMake: input.make || 'BMW',
        primaryModel: input.model || 'G80 M3 Competition',
        primaryYear: input.year || '2025',
        chassisCode: input.chassisCode || 'G80',
        exteriorPaint: input.exteriorPaint || 'Mint Green Individual',
        brakeSystem: input.brakeSystem || 'M Compound Steel',
        preferredFinish: input.targetFinish || 'silver',
      });
    }

    const vehicleId = `veh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const vehiclePath = `users/${user.uid}/vehicles/${vehicleId}`;
    const vehicleRef = doc(db, 'users', user.uid, 'vehicles', vehicleId);

    const safeBrake: BrakeSystemType = ALLOWED_BRAKE_SYSTEMS.includes(
      input.brakeSystem
    )
      ? input.brakeSystem
      : 'M Compound Steel';

    const safeFinish: WheelFinishId = ALLOWED_FINISHES.includes(
      input.targetFinish
    )
      ? input.targetFinish
      : 'silver';

    try {
      await setDoc(vehicleRef, {
        ownerId: user.uid,
        make: clampStr(input.make, 50, 'BMW'),
        model: clampStr(input.model, 80, 'M3 Competition'),
        year: clampStr(input.year, 20, '2025'),
        chassisCode: clampStr(input.chassisCode, 40, 'G80'),
        exteriorPaint: clampStr(input.exteriorPaint, 60, 'Mint Green Individual'),
        brakeSystem: safeBrake,
        targetWheelSlug: clampStr(input.targetWheelSlug, 60, 'fsa001-black-matte'),
        targetFinish: safeFinish,
        notes: clampStr(input.notes, 500, ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, vehiclePath);
    }
  };

  const updateGarageVehicle = async (
    vehicleId: string,
    input: SaveVehicleInput
  ) => {
    if (!user) throw new Error('Must be signed in to update vehicle');
    const vehiclePath = `users/${user.uid}/vehicles/${vehicleId}`;
    const vehicleRef = doc(db, 'users', user.uid, 'vehicles', vehicleId);

    const safeBrake: BrakeSystemType = ALLOWED_BRAKE_SYSTEMS.includes(
      input.brakeSystem
    )
      ? input.brakeSystem
      : 'M Compound Steel';

    const safeFinish: WheelFinishId = ALLOWED_FINISHES.includes(
      input.targetFinish
    )
      ? input.targetFinish
      : 'silver';

    try {
      await updateDoc(vehicleRef, {
        make: clampStr(input.make, 50, 'BMW'),
        model: clampStr(input.model, 80, 'M3 Competition'),
        year: clampStr(input.year, 20, '2025'),
        chassisCode: clampStr(input.chassisCode, 40, 'G80'),
        exteriorPaint: clampStr(input.exteriorPaint, 60, 'Mint Green Individual'),
        brakeSystem: safeBrake,
        targetWheelSlug: clampStr(input.targetWheelSlug, 60, 'fsa001-black-matte'),
        targetFinish: safeFinish,
        notes: clampStr(input.notes, 500, ''),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, vehiclePath);
    }
  };

  const deleteGarageVehicle = async (vehicleId: string) => {
    if (!user) throw new Error('Must be signed in to delete vehicle');
    const vehiclePath = `users/${user.uid}/vehicles/${vehicleId}`;
    const vehicleRef = doc(db, 'users', user.uid, 'vehicles', vehicleId);
    try {
      await deleteDoc(vehicleRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, vehiclePath);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        profile,
        vehicles,
        loadingData,
        authError,
        signInWithGoogle,
        signOutUser,
        saveUserProfile,
        addGarageVehicle,
        updateGarageVehicle,
        deleteGarageVehicle,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebaseAuth must be used inside FirebaseProvider');
  }
  return ctx;
}

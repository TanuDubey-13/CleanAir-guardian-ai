import React, { createContext, useState, useEffect } from 'react';
import { 
  type User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseMock } from '../firebase/config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'admin';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// High-fidelity pre-populated local storage reports for Demo Mode
const PRE_POPULATED_REPORTS = [
  {
    id: "report-mock-001",
    reporterId: "mock-admin-uid-999",
    reporterName: "Demo Lead Admin",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    imagePath: "",
    location: { latitude: 37.7749, longitude: -122.4194 },
    address: "Market Street, San Francisco, CA",
    description: "Large pile of plastic bottles and garbage bags blocking the pedestrian walkway.",
    aiAnalysis: {
      category: "Plastic Waste",
      confidenceScore: 0.95,
      severity: "High",
      environmentalImpact: "Plastic debris blocks drainage channels causing pooling and leaks microplastics into soil.",
      healthRisk: "Attracts disease-carrying vectors and breeds waterborne bacteria.",
      cleanupRecommendation: "Organize civic volunteer cleanup sweep and install public collection trash bins.",
      professionalComplaint: "Dear Commissioner,\n\nWe report a massive pile of plastic waste blocking pedestrian flow at Market Street. Kindly dispatch garbage collection crews promptly.\n\nSincerely,\nCleanAir Guardian User",
      citizenTips: ["Bring reusable container cups", "Separate plastics from wet waste", "Secure lids on trash cans"]
    },
    status: "pending",
    adminNotes: "",
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z"
  },
  {
    id: "report-mock-002",
    reporterId: "mock-user-456",
    reporterName: "Sarah Connor",
    imageUrl: "https://images.unsplash.com/photo-1605600611280-146e6889b698?w=600&auto=format&fit=crop&q=60",
    imagePath: "",
    location: { latitude: 37.7858, longitude: -122.4064 },
    address: "SOMA District, San Francisco, CA",
    description: "Discarded computer monitors, circuit boards, and wires dumped behind the warehouse.",
    aiAnalysis: {
      category: "Electronic Waste",
      confidenceScore: 0.92,
      severity: "Critical",
      environmentalImpact: "Heavy metals such as lead and mercury leak out of tubes, poisoning ground soil layers.",
      healthRisk: "Severe contact hazard for children and pets due to sharp glass shards and heavy metal toxicity.",
      cleanupRecommendation: "Contact hazardous waste disposal service. Place concrete barriers to restrict vehicle dumping access.",
      professionalComplaint: "Dear Sanitation Chief,\n\nIllegal dump of computer waste found at SOMA Warehouse coordinates. Immediate toxic team extraction is requested.\n\nSincerely,\nCleanAir Guardian User",
      citizenTips: ["Recycle via e-waste drives", "Donate working screens to schools", "Strip copper cables safely"]
    },
    status: "verified",
    adminNotes: "Sanitation dispatch truck scheduled for Thursday cleanup.",
    createdAt: "2026-07-02T09:15:00.000Z",
    updatedAt: "2026-07-02T09:30:00.000Z"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile details when auth state changes
  useEffect(() => {
    if (isFirebaseMock) {
      console.log("AuthProvider: Running in LOCAL DEMO MODE.");
      
      // Seed initial mock reports if empty
      if (!localStorage.getItem('mock_reports')) {
        localStorage.setItem('mock_reports', JSON.stringify(PRE_POPULATED_REPORTS));
      }
      
      // Simulate session validation latency
      const timer = setTimeout(() => {
        const mockUser = {
          uid: 'mock-admin-uid-999',
          email: 'admin@cleanairguardian.ai',
          displayName: 'Demo Lead Admin',
          emailVerified: true,
          providerData: [{ providerId: 'google.com' }]
        } as any;
        
        const mockProfile: UserProfile = {
          uid: 'mock-admin-uid-999',
          email: 'admin@cleanairguardian.ai',
          displayName: 'Demo Lead Admin',
          role: 'admin', // Admin by default to let user inspect all views
          createdAt: new Date().toISOString(),
        };

        setUser(mockUser);
        setProfile(mockProfile);
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setProfile(userDocSnap.data() as UserProfile);
          } else {
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Citizen Guardian',
              role: 'citizen',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, fallbackProfile);
            setProfile(fallbackProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (isFirebaseMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        uid: 'mock-admin-uid-999',
        email,
        displayName: 'Demo Lead Admin',
        emailVerified: true,
        providerData: [{ providerId: 'google.com' }]
      } as any;
      setUser(mockUser);
      setProfile({
        uid: 'mock-admin-uid-999',
        email,
        displayName: 'Demo Lead Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      return { user: mockUser };
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
    if (isFirebaseMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        uid: 'mock-admin-uid-999',
        email,
        displayName,
        emailVerified: true,
        providerData: [{ providerId: 'google.com' }]
      } as any;
      setUser(mockUser);
      setProfile({
        uid: 'mock-admin-uid-999',
        email,
        displayName,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      return mockUser;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const currentUser = userCredential.user;
    await updateProfile(currentUser, { displayName });
    
    const userProfile: UserProfile = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', currentUser.uid), userProfile);
    
    try {
      await sendEmailVerification(currentUser);
    } catch (err) {
      console.warn("Failed to send automatic verification email:", err);
    }
    
    return currentUser;
  };

  const loginWithGoogle = async () => {
    if (isFirebaseMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        uid: 'mock-admin-uid-999',
        email: 'admin@cleanairguardian.ai',
        displayName: 'Demo Lead Admin',
        emailVerified: true,
        providerData: [{ providerId: 'google.com' }]
      } as any;
      setUser(mockUser);
      setProfile({
        uid: 'mock-admin-uid-999',
        email: 'admin@cleanairguardian.ai',
        displayName: 'Demo Lead Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const currentUser = userCredential.user;
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      const userProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Citizen Guardian',
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, userProfile);
    }
  };

  const logout = async () => {
    if (isFirebaseMock) {
      setUser(null);
      setProfile(null);
      return;
    }
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseMock) return;
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerification = async () => {
    if (isFirebaseMock) return;
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No user currently logged in.");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      sendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

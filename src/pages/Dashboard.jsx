import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';
import { auth } from "../firebase/config"
import { signOut } from '@firebase/auth';
import Sidebar from '../component/Sidebar';

const Dashboard = () => {
  const { currentUser, dispatch } = useContext(AuthContext);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#000', color: '#000', overflow: 'hidden', paddingTop:'2px' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft:'3px' }}>
        {/* Navbar */}
        <div style={{ width: '100%', backgroundColor: '#000', color: '#fff', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderRadius: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentUser && (
              <>
                <span>{currentUser.email}</span>
                <button onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f9f9f9', height: '100vh' }}>
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

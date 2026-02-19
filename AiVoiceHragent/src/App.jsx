
import React from 'react'
import MainFile from './components/MainFile'
import Login from './components/Login'
import Signup from './components/Signup'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Route ,Routes } from 'react-router-dom'


const App = () => {
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        style={{ zIndex: 9999 }}
      />

      <Routes>
        <Route path='/' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/main' element={<MainFile/>}/>
      </Routes>
    </div>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Routes,Route} from "react-router-dom"
import './App.css'
import Home from './pages/Home'
import Editorpage from './pages/Editorpage'
import { ToastContainer } from 'react-toastify'

function App() {

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/editor/:roomId' element={<Editorpage/>}/>
      </Routes>
    </>
  )
}

export default App

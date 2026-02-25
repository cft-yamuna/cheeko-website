import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HeroSection from './components/HeroSection'
import CardScrollSection from './components/CardScrollSection'
import './App.css'

function HomePage() {
  return (
    <div>
      <HeroSection />
      <CardScrollSection />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

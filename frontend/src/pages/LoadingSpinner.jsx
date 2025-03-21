import { CircularProgress } from '@mui/material'
import React from 'react'

export default function LoadingSpinner() {
  return (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', 
        backgroundColor: '#f5f5f5', 
      }}>
        <CircularProgress color="primary" /> 
      </div>
  )
}

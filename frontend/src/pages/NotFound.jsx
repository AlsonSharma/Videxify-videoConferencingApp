import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
    const routeTo = useNavigate()
  return (
    <div>
        <img src="../../public/NotFound.png" alt="" onClick={() => routeTo("/") }  style={{width: "100%"}}/>
</div>
  )
}

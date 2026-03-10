import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import Basis from './App.tsx'
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <Basis/>
      </BrowserRouter>
  </StrictMode>,
)

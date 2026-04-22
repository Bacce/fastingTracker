import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Register the service worker.
// updateSW() triggers the waiting SW to take control and reloads the page.
const updateSW = registerSW({
  // Called when a new SW is waiting — show the update banner
  onNeedRefresh() {
    showUpdateBanner(updateSW)
  },
  // Called when the app is now fully offline-ready
  onOfflineReady() {
    console.info('[PWA] App is ready to work offline.')
  },
})

function showUpdateBanner(update: (reloadPage?: boolean) => Promise<void>) {
  const banner = document.createElement('div')
  banner.id = 'pwa-update-banner'
  banner.innerHTML = `
    <span>A new version is available.</span>
    <button id="pwa-update-btn">Update now</button>
    <button id="pwa-dismiss-btn">Later</button>
  `
  Object.assign(banner.style, {
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    color: '#e2e8f0',
    fontSize: '0.875rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: '9999',
    whiteSpace: 'nowrap',
  })

  const btnStyle = {
    padding: '0.35rem 0.85rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.8rem',
  }

  const updateBtn = banner.querySelector<HTMLButtonElement>('#pwa-update-btn')!
  Object.assign(updateBtn.style, { ...btnStyle, background: '#3b82f6', color: '#fff' })
  updateBtn.onclick = () => update(true)

  const dismissBtn = banner.querySelector<HTMLButtonElement>('#pwa-dismiss-btn')!
  Object.assign(dismissBtn.style, { ...btnStyle, background: 'rgba(255,255,255,0.08)', color: '#94a3b8' })
  dismissBtn.onclick = () => banner.remove()

  document.body.appendChild(banner)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

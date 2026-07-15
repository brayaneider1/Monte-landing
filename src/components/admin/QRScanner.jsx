import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { checkInOrder } from '../../services/api'
import './QRScanner.css'

export default function QRScanner({ pin }) {
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Only init if scanning is true and the div exists
    if (scanning && document.getElementById('qr-reader')) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        rememberLastUsedCamera: true
      })
      
      scanner.render(onScanSuccess, onScanError)
      scannerRef.current = scanner

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanning])

  const onScanSuccess = async (decodedText) => {
    // Prevent double scanning immediately
    if (!scanning) return
    
    setScanning(false)
    if (scannerRef.current) {
      await scannerRef.current.clear()
    }

    try {
      // The QR code contains the orderRef, e.g., "LR-BD92A5FA"
      const result = await checkInOrder(decodedText, pin)
      setScanResult({ type: 'success', data: result })
    } catch (err) {
      setScanResult({ type: 'error', message: err.message })
    }
  }

  const onScanError = (err) => {
    // Ignore routine scan errors (no QR found yet)
  }

  const resetScanner = () => {
    setScanResult(null)
    setScanning(true)
  }

  return (
    <div className="qr-scanner-container">
      {scanning ? (
        <div className="scanner-active">
          <h3 style={{color: 'white', textAlign: 'center'}}>Apunta la cámara al QR del ticket</h3>
          <div id="qr-reader" className="qr-reader"></div>
        </div>
      ) : (
        <div className={`scan-result ${scanResult?.type}`}>
          {scanResult?.type === 'success' ? (
            <>
              <div className="result-icon">✅</div>
              <h2 style={{color: '#88FF00'}}>{scanResult.data.message}</h2>
              <p className="buyer-name" style={{color: 'white', fontSize: '20px'}}>{scanResult.data.buyer_name}</p>
              <p className="ticket-count" style={{color: '#aaa'}}>Tickets validados: {scanResult.data.tickets_count}</p>
            </>
          ) : (
            <>
              <div className="result-icon">❌</div>
              <h2 style={{color: '#ff4444'}}>ACCESO DENEGADO</h2>
              <p className="error-msg" style={{color: 'white', fontSize: '18px'}}>{scanResult?.message}</p>
            </>
          )}
          <button className="admin-btn-primary next-scan-btn" onClick={resetScanner} style={{marginTop: '20px'}}>
            ESCANEAR SIGUIENTE
          </button>
        </div>
      )}
    </div>
  )
}

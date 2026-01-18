import jsPDF from 'jspdf'

export const generateSecurityPDF = (userData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(20, 20, 25) // Casi negro
  doc.text('NIUN VAULT', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('CREDENCIALES DE ACCESO & RECUPERACIÓN', pageWidth / 2, 26, { align: 'center' })

  doc.setDrawColor(20, 20, 25)
  doc.setLineWidth(0.5)
  doc.line(20, 30, pageWidth - 20, 30)

  let y = 50
  const xLabel = 25
  const xValue = 70
  const lineHeight = 12

  const addField = (label, value) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(50)
    doc.text(label, xLabel, y)

    doc.setFont('courier', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(value, xValue, y)

    y += lineHeight
  }

  addField('USUARIO:', userData.username)
  addField('EMAIL:', userData.email)
  addField('CONTRASEÑA:', userData.password)

  y += 5

  doc.setDrawColor(200)
  doc.line(25, y, pageWidth - 25, y)
  y += 15

  addField('PIN BÓVEDA:', userData.pin_boveda)
  addField('PREGUNTA:', userData.pregunta_seguridad)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(50)
  doc.text('RESPUESTA:', xLabel, y)

  doc.setFont('helvetica', 'italic')
  doc.setTextColor(150)
  doc.text(' ', xValue, y)

  y += 30

  doc.setFillColor(240, 50, 50)
  doc.rect(20, y, pageWidth - 40, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PROTOCOLO DE AUTODESTRUCCIÓN', pageWidth / 2, y + 10, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const warningText =
    'Este sistema cuenta con una medida de seguridad extrema. Si ingresas incorrectamente tu contraseña, respuesta o PIN 10 veces consecutivas, tu cuenta y todos los archivos encriptados serán ELIMINADOS PERMANENTEMENTE sin posibilidad de recuperación.'
  doc.text(doc.splitTextToSize(warningText, pageWidth - 60), pageWidth / 2, y + 18, {
    align: 'center',
  })

  const footerY = 270
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text('Este documento es tu único respaldo físico.', pageWidth / 2, footerY, {
    align: 'center',
  })
  doc.text(
    'Sugerencia: Imprímelo, guárdalo en un lugar seguro y BORRA este archivo del dispositivo.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' },
  )

  doc.save(`Niun_Credenciales_${userData.username}.pdf`)
}

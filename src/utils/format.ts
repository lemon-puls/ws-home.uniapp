export const formatSize = (mb: number): string => {
  if (mb === 0) return '0 MB'

  if (mb < 1) {
    return mb.toFixed(2) + ' MB'
  }

  const k = 1024
  const sizes = ['MB', 'GB', 'TB']
  const i = Math.floor(Math.log(mb) / Math.log(k))

  return parseFloat((mb / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (date: string | number | Date): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

export default function Logo() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <img 
        src="/images/logo-cropped.png" 
        alt="Yoga for PE Logo" 
        className="w-auto object-contain"
        style={{ height: '80px', maxHeight: '80px' }}
      />
    </div>
  )
}

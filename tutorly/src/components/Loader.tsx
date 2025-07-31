import { Loader2Icon } from 'lucide-react'
import React from 'react'

const LoaderUI = () => {
  return (
    <div className='h-screen flex flex-col items-center justify-center w-full'>
        <Loader2Icon className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
        <p className="text-center text-gray-500 mt-2">Loading...</p>
    </div>
  )
}

export default LoaderUI
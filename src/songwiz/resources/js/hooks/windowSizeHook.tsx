import { useState, useEffect } from 'react'

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height,
    }
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    )

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    if (windowDimensions.width >= 1024) {
        return 'lg'
    }
    if (windowDimensions.width >= 768) {
        return 'md'
    }
    if (windowDimensions.width >= 640) {
        return 'sm'
    }
    return 'xs'
}

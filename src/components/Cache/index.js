import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Image,
  ActivityIndicator,
  View,
} from 'react-native'
import { Text, withTheme } from 'react-native-paper'
import { pushImageQueue, getImageAvailability } from 'components/Cache/Fetch'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

/**
 * UI Component
 */
const CacheComponent = ({
  theme,
  images,
  fallback,
  resizeMode,
  priorityIndex,
  style,
  hideProgress,
  hideLabel,
  priorityQueueInstance,
}) => {
  const styling = styles(theme)
  const [uri, setUri] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressVisible, setProgressVisible] = useState(hideProgress)
  const [filename, setFilename] = useState(0)

  /**
   * 
   */
  const completeCallback = useRef()
  const progressCallback = useRef()
  const beginCallback = useRef()

  const onComplete = (source) => (error, type, response) => {
    setUri(response)
    setProgressVisible(false)

    if (type !== 'fallback') {
      setFilename(getFilename(source))
    }
  }

  const onProgress = (source) => (response) => {
    setProgress(parseInt(response.bytesWritten / response.contentLength * 100, 10))
  }

  const onBegin = (source) => (response) => {
    setProgress(0)
    setProgressVisible(true)
  }

  useEffect(() => {
    completeCallback.current = onComplete
    progressCallback.current = onProgress
    beginCallback.current = onBegin
  })


  /**
   * 
   */
  const handleError = ({ nativeEvent }) => {
    setUri(fallback)
  }

  const getFilename = (source) => {
    if (!source) return ''
    const withoutQuery = source.split('?').shift()
    const withoutPath = withoutQuery.split('/').pop()
    const withoutExt = withoutPath.split('.').shift()
    return withoutExt
  }

  const getImageType = (filename) => {
    return filename
  }

  const getPriority = (filename = '', priority = 0) => {
    if (filename.includes('480p')) {
      return priority
    }
    if (filename.includes('4k')) {
      return 1000 + priority
    }
    if (filename.includes('native')) {
      return 10000 + priority
    }
    return 0
  }

  useEffect(() => {
    images.forEach(([source, shouldDownload], index) => {
      const priority = getPriority(getFilename(source), priorityIndex)

      if (!shouldDownload) {
        getImageAvailability(source, completeCallback.current(source))
        return
      }

      pushImageQueue(
        priorityQueueInstance,

        /**
         * Callback executed on complete
         */
        completeCallback.current(source),

        /**
         * Callback executed on download progress
         */
        progressCallback.current(source),

        /**
         * Callback executed on download init
         */
        beginCallback.current(source),
    
        /**
         * Image source
         */
        source,

        /**
         * Priority of the image, usually is the position of the item in list
         */
        priority
      )
    })

    /**
     * Cancel all pending tasks on image remove
     */
    return () => {
      handleError({})
    }
  }, [])

  /**
   * Show loading indicator image if placeholder image is not loaded, yet.
   */
  if (!uri && !progress) {
    return (
      <ActivityIndicator
        style={styling.image}
      />
    )
  }

  return (
    <View style={styling.root}>
      <View style={[styling.image, style]}>
        {!hideLabel && getImageType(filename) ?
          <Text style={styling.label}>{getImageType(filename)}</Text>
        : null}

        {progressVisible ?
          <View style={styling.progress}>
            <AnimatedCircularProgress
              size={50}
              width={2}
              fill={progress}
              tintColor="#00e0ff"
              backgroundColor="#3d5875"
            />
          </View>
        : null}

        {uri ?
          <Image
            source={{ uri }}
            resizeMode={resizeMode}
            style={[styling.image, style]}
            onError={handleError}
          />
        : null}
      </View>
    </View>
  )
}

CacheComponent.propTypes = {
  theme: PropTypes.any,
  images: PropTypes.any,
  fallback: PropTypes.any,
  resizeMode: PropTypes.any,
  priorityIndex: PropTypes.any,
  style: PropTypes.any,
  hideProgress: PropTypes.any,
  hideLabel: PropTypes.any,
}

CacheComponent.defaultProps = {
  hideProgress: false,
  hideLabel: true,
}

const styles = theme => StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  label: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
    margin: 6,
    padding: 2,
    fontSize: 8,
    borderWidth: 0.5,
    borderRadius: 3,
    borderColor: theme.colors.text,
  },
})

export const CacheContext = React.createContext(null)
export default withTheme(CacheComponent)
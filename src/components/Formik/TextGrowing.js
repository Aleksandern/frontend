import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native'
import { Text } from 'react-native-paper'
import { ErrorMessage } from 'formik'

import { withTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { withTranslation } from 'react-i18next'

const TextGrowing = ({
  t,
  theme,
  field: {
    value,
    name,
  },
  form,
  placeholder,
  multiline = true,
  keyboardType = 'default',
  onSubmitEditing,
  disabled,
  inputRef,
}) => {
  const styling = styles(theme)
  
  const [height, setHeight] = useState(42)

  /**
   * Prevent too much multiline characters
   * - no more than 4 lines
   * - sequential lines will be replaces by single line
   */
  const onChangeText = (event) => {
    const newlines = event.match(/(\r\n|\n|\r)/gm) || []
    if (newlines.length > 5) return
    form.handleChange(name)(event.replace(/(\n\n|\r\r|\r\n\r\n)/gm, '\n'))
  }

  return (
    <View style={styling.root}>
      <TextInput
        ref={inputRef}
        style={[styling.input, { height }]}
        name={name}
        onChangeText={onChangeText}
        onBlur={form.handleBlur(name)}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        autoCapitalize="none"
        multiline={multiline}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        mode="outlined"
        dense={true}
        label={placeholder}
        disabled={disabled}
        maxLength={255}
        // returnKeyType="done"
        // blurOnSubmit={true}
        scrollEnabled={true}
        onContentSizeChange={e => setHeight(e.nativeEvent.contentSize.height + 12)}
      />
      {/*<ErrorMessage name={name} render={msg => <Text style={styling.error}>{msg}</Text>} />*/}
    </View>
  )
}

const styles = theme => StyleSheet.create({
  root: {
  },
  input: {
    minHeight: 42,
    padding: 12,
    lineHeight: 23,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: theme.colors.border,
  },
  error: {
    textAlign: 'right',
    fontSize: 11,
  },
})

TextGrowing.propTypes = {
  theme: PropTypes.any,
  field: PropTypes.any,
  form: PropTypes.any,
  placeholder: PropTypes.any,
  meta: PropTypes.any,
  multiline: PropTypes.any,
  keyboardType: PropTypes.any,
  onSubmitEditing: PropTypes.any,
  disabled: PropTypes.any,
  t: PropTypes.any,
  inputRef: PropTypes.any,
}

export default withTranslation()(withTheme(TextGrowing))

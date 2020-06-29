import { Linking } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import * as navigationActions from 'navigation/actions'
import { useNavigation } from '@react-navigation/native'
import * as usersActions from 'store/ducks/users/actions'
import urlPattern from 'url-pattern'

const options = { segmentValueCharset: '/:a-zA-Z0-9_-' }
const matchComment = new urlPattern(
  '*/user/:userId/post/:postId/comments',
  options
)

const FeedCardsService = ({ children }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const usersGetCards = useSelector(state => state.users.usersGetCards)

  const usersDeleteCardRequest = (payload) =>
    dispatch(usersActions.usersDeleteCardRequest(payload))

  const handleCardPress = ({ action, cardId }) => {
    dispatch(usersActions.usersDeleteCardRequest({ cardId }))
    
    const matchedComment = matchComment.match(action)

    if (action === 'https://real.app/chat/') {
      navigationActions.navigateChat(navigation)()
    } else if (matchedComment) {
      navigationActions.navigateComments(navigation, matchedComment)()
    } else {
      Linking.openURL(action)
    }
  }
 
  return children({
		usersGetCards,
		handleCardPress,
		usersDeleteCardRequest,
  })
}

export default FeedCardsService

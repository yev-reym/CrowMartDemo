/**
 *
 * This service will handle reading the prediction score and responding to them by manipulating the DOM
 *
 */
const MAKE_CART_ADDITION_THRESHOLD = 0.8

export function predictionResponder(
  latestPrediction: CrowAPIResponse['data']['apps'],
  event_id: 'page_load' | 'cart_click' | string,
  eventCount: number
) {
  /** For this implementation I chose to use facebook ads score */
  function parseTargetRemarketingScore() {
    const googAdsInt = latestPrediction.target.integrations.find((i) => {
      return i.platform === 'facebook_ads'
    })

    const { score, threshold_group_count } =
      googAdsInt?.scores.find(
        (scoreObj) => scoreObj.integration_product === 'remarketing'
      ) || {}

    return Number((Number(score) / Number(threshold_group_count)).toFixed(2))
  }

  function shouldNudgeToShop(score: number): boolean {
    console.log('score', score)
    //We dont want to make an alert to shop if the user just added an item
    const lowShoppingActivity =
      event_id !== 'cart_click' && score >= MAKE_CART_ADDITION_THRESHOLD

    //"debounce" the condition so that we do not spam. Only fire every 5th event if the condition is met.
    return lowShoppingActivity && eventCount >= 3 && eventCount % 3 === 0
  }

  function respond() {
    const latestRemarketingScore: number = parseTargetRemarketingScore()

    if (shouldNudgeToShop(latestRemarketingScore)) {
      //If we enter this, that means the user has been navigating the site without
      //adding to the cart. Let is "remarket" to them a bit.
      alert(
        "Hey! Have you checked out our Crow and Crow accessories? They'll make you caw!"
      )
    }
  }

  respond()
}

import { CartManager } from "../cart/index.js"

/**
 *
 * This service will handle reading the prediction score and responding to them by manipulating the DOM
 *
 */
const REMARKETING_SCORE_THRESHOLD = 0.85

export function predictionResponder(
  latestPrediction: CrowAPIResponse['data']['apps'],
  event_id: 'page_load' | 'cart_click' | string,
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
    //We dont want to make an alert to shop if the user just added an item
    const lowShoppingActivity = score >= REMARKETING_SCORE_THRESHOLD

    //We trigger a response if we determine by score that they should be remarketed to, and if they are not on the an items page, 
    //so we do not spam them when they are already potentially buying an item. 
    return lowShoppingActivity && !CartManager.isItemsPage()
  }

  function respond() {
    const latestRemarketingScore: number = parseTargetRemarketingScore()

    if (shouldNudgeToShop(latestRemarketingScore)) {
      //If we enter this, that means the user has been navigating the site without
      //adding to the cart. Let is "remarket" to them a bit.
      alert(
        "Hey! Have you checked out our Crows and Crow accessories? They'll make you caw!"
      )
    }
  }

  respond()
}

'use strict'

import { State as StateManager } from './state/index.js'
import { CartManager } from './cart/index.js'
import { AnalyticsManager } from './analytics/index.js'
import { fireView } from './analytics/fireView.js'

async function App() {
  const stateManager = new StateManager()
  const analyticsManager = new AnalyticsManager(stateManager)
  const cartManager = new CartManager(stateManager)
  let stateSnapshot: CrowMarket.CrowMarketState

  const setStateIfNotExists = async (): Promise<void> => {
    const stateCreated = await stateManager.doesStateExist()

    if (!stateCreated) {
      await stateManager.init()
    }

    stateSnapshot =
      (await stateManager.getDataFromState()) as CrowMarket.CrowMarketState
  }

  const initAnalyticsManager = (): Promise<void> =>
    analyticsManager.init(stateSnapshot)

  const initCartManager = (): void => cartManager.init(stateSnapshot)

  const fireViewEvent = (): Promise<void> => fireView('page_load')

  await setStateIfNotExists()
  await initAnalyticsManager()
  initCartManager()

  /**
   * When this script runs both DOMContentLoaded and onload states are complete
   * We simply make sure that all services have formed the state we need to send in the view request
   * Since we are serving a static multi-page app and not an SPA, everytime this code runs it is a page load
   */
  await fireViewEvent()
}

App()

'use strict'

import { getCountryIso } from '../utils/countryCodes.js'
import { getCurrencyIso } from '../utils/currencyCodes.js'

const PAGE_ID_MAP = {
  '/index.html': 'home',
  '/crows.html': 'other',
  '/accessories.html': 'other',
  '/cart.html': 'other'
} as ObjectGeneric<string>

export class AnalyticsManager {
  public state
  public currentBrowserState!: CrowMarket.BrowserStore
  public currentPageState!: CrowMarket.PageStore
  public currentUserState!: CrowMarket.UserStore

  private userBrowserData = globalThis.UAParser()

  public static isItemsPage(): boolean {
    return ['/accessories.html', '/crows.html'].includes(
      globalThis?.location?.pathname
    )
  }
  constructor(state: State) {
    this.state = state
  }
  public async init(stateSnapshot: CrowMarket.CrowMarketState): Promise<void> {
    this.currentBrowserState = stateSnapshot.browser
    this.currentPageState = stateSnapshot.page
    this.currentUserState = stateSnapshot.user

    return this.populateState()
  }

  /**
   *
   * State Parsers
   *
   *
   */
  private async populateState(): Promise<void> {
    const browserState = {
      ...this.currentBrowserState,
      ...this.getLocaleInfo(),
      ...this.getDeviceInfo()
    }
    const pageState = { ...this.currentPageState, ...this.getPageInfo() }
    const userState = { ...this.currentUserState, ...this.getUserInfo() }

    await this.state.upsertToState('browser', browserState)
    await this.state.upsertToState('page', pageState)
    await this.state.upsertToState('user', userState)
  }

  /**Gets Browser info */
  private getLocaleInfo(): object {
    const { timeZone, locale } =
      globalThis.Intl.DateTimeFormat().resolvedOptions()

    const site_language = locale[0] + locale[1]
    const site_country = getCountryIso(timeZone)
    const site_currency = getCurrencyIso(site_country)

    return { site_language, site_country, site_currency }
  }

  private getDeviceInfo(): object {
    const {
      ua,
      device: { vendor, model, type }
    } = this.userBrowserData

    let device_info
    if (ua?.length) {
      device_info = ua
    } else if (vendor || model || type) device_info = `${vendor}${model}${type}`

    return { device_info }
  }

  /**Gets Page info */
  private getPageInfo(): object {
    const currentPageUrl = document.location.href
    const referrerUrl = new URL(document.referrer)

    return {
      page_id: PAGE_ID_MAP[document.location.pathname],
      page_title: document.title,
      page_url: currentPageUrl,
      page_referrer_url: referrerUrl.href,
      referrer_source: referrerUrl.searchParams.get('utm_source'),
      referrer_channel: referrerUrl.searchParams.get('utm_medium'),
      referrer_query: referrerUrl.search
    }
  }

  /**Gets User Info */
  private getUserInfo(): object {
    let { visitor_id: currentVisitorId } = this.currentUserState

    if (!currentVisitorId) {
      currentVisitorId = (globalThis as globalWithScriptLibs).uuid()
    }

    return { visitor_id: currentVisitorId }
  }
}

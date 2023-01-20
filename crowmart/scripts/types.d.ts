/// <reference types="node" />
/// <reference types="ua-parser-js" />
/// <reference types="uuid" />

interface ObjectGeneric<T> {
  [key: string]: T
}

// Hack to get ts to play nice with cdn script lib objects attached to global
type globalWithScriptLibs = typeof globalThis & {
  uuid: () => string
  axios: (config: AxiosConfig) => Promise<CrowAPIResponse>
}

interface AxiosConfig {
  method: string
  url: string
  data: object
}

interface CrowAPIResponse {
  data: {
    event_id: string
    version: string
    request_timestamp: string
    history_id: string
    apps: {
      audience: AppsAudience
      measure: AppsMeasure
      target: AppsTarget
    }
  }
  status: number
}

interface AppsAudience {
  active: boolean
  scores: AppScoreObject[]
}

interface AppsMeasure {
  active: boolean
  integrations: Array<{
    platform: string
    scores: IntegrationScoreObject[]
  }>
}

interface AppsTarget extends AppsMeasure {}

interface AppScoreObject {
  conversion_type: string
  conversion_product: string
  threshold_setter: string
  threshold_group_count: string
  comparison_type: string
  comparison_population: string
  comparison_group: string
  score: string
}

interface IntegrationScoreObject extends AppScoreObject {
  name: string
  integration_product: string
}

declare type State = import('./state/index.js').State
declare type CartManager = import('./cart/index.js').CartManager
declare type AnalyticsManager = import('./analytics/index.js').AnalyticsManager

declare namespace CrowMarket {
  interface CrowMarketState {
    cart: CartStore
    page: PageStore
    browser: BrowserStore
    predictions: PredictionsStore
    user: UserStore
  }

  /**
   *
   *
   * USER STORE
   *
   */
  interface UserStore {
    visitor_ip_address: string | null
    visitor_id: string | null
    is_logged_in_user: boolean
    user_has_subscription: boolean
  }

  /**
   *
   * CART STORE
   *
   *
   */
  interface CartStore {
    items: CartItem[]
    total: number
  }

  interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    categories: string[]
    on_sale: boolean
    available: boolean
    color: string
    subscription: boolean

    /**This describes the position of an item in the grid displayed when adding to cart.
     * Should only be 0, 1, 2 in our case
     */
    item_position_index: number
  }

  /**
   *
   * PAGE STORE
   *
   *
   */
  interface PageStore {
    site_name: 'BLACKCROW'
    page_id: 'home' | 'other'
    page_title: string
    page_url: string | null
    page_referrer_url: string | null
    referrer_source: string | null
    referrer_channel: string | null
    referrer_query: string | null
  }

  /**
   *
   * BROWSER STORE
   *
   *
   */
  interface BrowserStore {
    site_country: string
    site_language: string
    site_currency: string
    device_info: string | null
  }

  /**
   *
   * PREDICTIONS STORE
   *
   *
   */
  interface PredictionsStore {
    history_id: string | null
    events: {
      [k: string]: Array<CrowAPIResponse['data']['apps']>
    }
  }
}

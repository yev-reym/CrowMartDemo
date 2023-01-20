export const initialState: CrowMarket.CrowMarketState = {
  cart: {
    items: [],
    total: 0
  },
  page: {
    site_name: 'BLACKCROW',
    page_id: 'home',
    page_title: 'CrowMart',
    page_url: null,
    page_referrer_url: null,
    referrer_source: null,
    referrer_channel: null,
    referrer_query: null
  },
  user: {
    visitor_ip_address: null,
    visitor_id: null,
    is_logged_in_user: false,
    user_has_subscription: false
  },
  browser: {
    site_country: 'US',
    site_language: 'en',
    site_currency: 'USD',
    device_info: null
  },
  predictions: {
    history_id: null,
    events: {
      page_load: [],
      cart_click: []
    }
  }
}

export const stores = Object.keys(initialState)

export function buildRequestBody(
  state: CrowMarket.CrowMarketState,
  event_id: string
) {
  const {
    browser,
    user,
    page,
    cart,
    predictions: { history_id }
  } = state

  const body = {
    ...page,
    ...browser,
    ...user,
    cart: cart.items,
    total_price: cart.total,
    event_id
  }

  if (history_id) {
    ;(body as typeof body & { history_id: string }).history_id = history_id
  }

  return body
}

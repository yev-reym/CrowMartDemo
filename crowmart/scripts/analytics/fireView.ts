'use strict'

import { predictionResponder } from '../predictions/responder.js'
import { State as StateManager } from '../state/index.js'
import { buildRequestBody } from '../utils/requestBuilder.js'

const BLACK_CROW_BASE = 'https://api.sandbox.blackcrow.ai'
const PAGE_VIEW_PATHNAME = '/v1/events/view'

export async function fireView(event_id: string): Promise<void> {
  const stateManager = new StateManager()
  const state =
    (await stateManager.getDataFromState()) as CrowMarket.CrowMarketState
  const requestBody = buildRequestBody(state, event_id)

  const axiosConfig: AxiosConfig = {
    method: 'POST',
    url: BLACK_CROW_BASE + PAGE_VIEW_PATHNAME,
    data: {
      ...requestBody
    }
  }
  let response!: CrowAPIResponse

  try {
    response = await (globalThis as globalWithScriptLibs).axios(axiosConfig)
  } catch (error) {
    console.error(error)
  }

  if (response.status === 201) {
    const {
      predictions: { history_id, events }
    } = state
    const {
      apps,
      event_id,
      request_timestamp,
      history_id: responseHistoryId
    } = response.data

    /**
     *
     * events = {
     *    page_load: {
     *        timestamp_1: results,
     *        timestamp_2: results
     *    },
     *    cart_click: {
     *        ...
     *    }
     * }
     *
     */
    const latestPrediction = { ...apps, request_timestamp }
    const updatedPredictionsState = {
      events: {
        ...events,
        [event_id]: [...events[event_id], latestPrediction]
      },
      history_id: history_id ?? responseHistoryId
    }

    await stateManager.upsertToState('predictions', updatedPredictionsState)
    predictionResponder(latestPrediction, event_id)
  }
}

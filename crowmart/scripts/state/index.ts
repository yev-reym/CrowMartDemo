'use strict'

import { stores, initialState } from './stateConfiguration.js'

export class State {
  private db!: IDBDatabase

  private static dbName: string = 'crow_market_db'
  private static storeName: string = 'crow_market_state'
  private static storeKeys: string[] = stores
  private static initialState = initialState
  private static version: number = 1
  public static indexedDb: IDBFactory = globalThis.indexedDB

  /**
   *
   * Class Helper Methods
   *
   */
  private openNewDbConnection(): IDBOpenDBRequest {
    return State.indexedDb.open(State.dbName, State.version)
  }

  public async doesStateExist(): Promise<boolean> {
    try {
      const result = await State.indexedDb.databases()
      return result?.length === 1 && result[0]?.name === State.dbName
    } catch (error) {
      return false
    }
  }

  /**
   *
   * Initialization instance method for creating DB and objectStore which we refer to as State
   *
   */
  public init(): void {
    if (!this.db) {
      let request = this.openNewDbConnection()

      request.onerror = (): void => {
        /**We do not want to throw an error since this should not affect the UX*/
        console.error(
          'There was an error opening a new IndexedDB connection:',
          request.error
        )
      }

      request.onupgradeneeded = (): void => {
        console.log('Upserting new db version.')
        this.db = request.result
        this.createState()
      }

      request.onsuccess = (): void => {
        console.log('IndexedDB connection successfully established.')
        this.db = request.result
        this.initState()
      }
    }
  }

  private createState(): void {
    if (this.db) {
      this.db.createObjectStore(State.storeName)
    }
  }

  /**We will treat the object store as the entire state, and each key will be a "store" within the state*/
  private initState(): void {
    State.storeKeys.forEach((stateSlice) => {
      this.initializeStore(stateSlice as keyof CrowMarket.CrowMarketState)
    })
  }

  private initializeStore(stateSlice: keyof CrowMarket.CrowMarketState) {
    const transaction = this.db.transaction(State.storeName, 'readwrite')
    const state = transaction.objectStore(State.storeName)

    const request = state.add(State.initialState[stateSlice], stateSlice)

    request.onerror = () => console.error(request.error)
    request.onsuccess = () => this.db.close()
  }

  /**
   *
   * State CRUD operations
   *
   */
  public getDataFromState(
    key: string = 'all'
  ): Promise<CrowMarket.CrowMarketState | Partial<CrowMarket.CrowMarketState>> {
    const connection = this.openNewDbConnection()
    let stateObject: { [k: string]: IDBCursorWithValue } = {}

    return new Promise((resolve, reject) => {
      connection.onsuccess = () => {
        this.db = connection.result
        const transaction = this.db.transaction(State.storeName, 'readonly')
        const state = transaction.objectStore(State.storeName)

        let request!: IDBRequest
        if (key === 'all') {
          request = state.openCursor()
        } else {
          request = state.get(key)
        }

        request.onerror = () => console.error(request.error)
        request.onsuccess = () => {
          if (key === 'all') {
            let cursor: IDBCursorWithValue = request.result

            if (cursor) {
              const k = cursor.primaryKey as string
              stateObject[k] = cursor.value
              cursor.continue()
            } else {
              resolve(stateObject)
            }
          } else {
            const value = request.result
            stateObject[key] = value
            resolve(stateObject)
          }
        }

        transaction.oncomplete = () => {
          this.db.close()
        }
      }
    })
  }

  public upsertToState(key: keyof CrowMarket.CrowMarketState, payload: object) {
    const connection = this.openNewDbConnection()

    return new Promise((resolve, reject) => {
      connection.onsuccess = () => {
        this.db = connection.result
        const transaction = this.db.transaction(State.storeName, 'readwrite')
        const state = transaction.objectStore(State.storeName)

        let upsertRequest!: IDBRequest
        upsertRequest = state.put(payload, key)

        upsertRequest.onerror = () => console.error(upsertRequest.error)
        upsertRequest.onsuccess = () => {
          resolve(upsertRequest.result)
        }

        transaction.oncomplete = () => {
          this.db.close()
        }
      }
    })
  }
}

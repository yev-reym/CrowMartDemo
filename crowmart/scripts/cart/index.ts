'use strict'

import { fireView } from '../analytics/fireView.js'

const CART_ITEM_MAP = {
  '09f8d37e': {
    name: 'Snow Crow',
    price: 20000,
    on_sale: false,
    quantity: 1,
    categories: ['animals'],
    color: 'black',
    subscription: false,
    available: true,
    item_position_index: 0
  },
  '09f8d5b8': {
    name: 'Sky Crow',
    price: 30000,
    on_sale: false,
    quantity: 1,
    categories: ['animals'],
    color: 'black',
    subscription: false,
    available: true,
    item_position_index: 1
  },
  '09f8d90a': {
    name: 'Canyon Crow',
    price: 50000,
    on_sale: false,
    quantity: 1,
    categories: ['animals'],
    color: 'black',
    subscription: false,
    available: true,
    item_position_index: 2
  },
  '09f8d9e6': {
    name: 'Crow House',
    price: 20000,
    on_sale: false,
    quantity: 1,
    categories: ['animal accessories', 'woodwork'],
    color: 'green',
    subscription: false,
    available: true,
    item_position_index: 0
  },
  '09f8daa4': {
    name: 'Crow Stories',
    price: 20000,
    on_sale: false,
    quantity: 1,
    categories: ['animal accessories'],
    color: 'blue',
    subscription: false,
    available: true,
    item_position_index: 1
  },
  '09f8db58': {
    name: 'Crow Feed',
    price: 20000,
    on_sale: false,
    quantity: 1,
    categories: ['animal accessories', 'food'],
    color: 'black',
    subscription: false,
    available: true,
    item_position_index: 2
  }
}

export class CartManager {
  public state
  public currentCartState!: CrowMarket.CartStore

  public static isCartPage(): boolean {
    return globalThis?.location?.pathname === '/cart.html'
  }

  public static isItemsPage(): boolean {
    return ['/accessories.html', '/crows.html'].includes(
      globalThis?.location?.pathname
    )
  }

  constructor(state: State) {
    this.state = state
  }

  public init(stateSnapshot: CrowMarket.CrowMarketState): void {
    this.currentCartState = stateSnapshot.cart

    if (CartManager.isItemsPage()) {
      this.mountAddToCartListeners()
    }

    if (CartManager.isCartPage()) {
      //Manipulate DOM to render Cart State info to user
      this.renderCartInfo()
    }
  }

  private mountAddToCartListeners(): void {
    const cartListings = document.querySelectorAll("div[id$='listing']")

    if (cartListings?.length) {
      for (let listing of cartListings) {
        const itemId = listing.getAttribute(
          'data-item-id'
        ) as keyof typeof CART_ITEM_MAP

        listing.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopPropagation()
          this.addItemToCart(itemId)
          fireView('cart_click')
        })
      }
    }
  }

  /**Handle Rendering Logic based on state */
  private renderCartInfo(): void {
    this.renderCartItems()
    this.renderTotal()
  }

  private renderTotal(): void {
    const totalElement = document.getElementById('total') as Element
    const countElement = document.getElementById('count') as Element
    const { total, items } = this.currentCartState
    const count = items.reduce((acc, { quantity }): number => {
      return (acc += quantity)
    }, 0)

    totalElement.innerHTML = `Total: $${(total / 100).toFixed(2)}`
    countElement.innerHTML = `You have ${count} items in cart`
  }

  private renderCartItems(): void {
    const { items } = this.currentCartState
    const elementToHook = document.getElementById('cart-items') as HTMLElement

    items.forEach((cartItem) => {
      this.renderCartItem(cartItem, elementToHook)
    })

    this.addRemoveCartListeners()
  }

  private addRemoveCartListeners(): void {
    const removeCartButtons = document.querySelectorAll('button.button-primary')

    if (removeCartButtons?.length) {
      for (let button of removeCartButtons) {
        const itemId = button.getAttribute(
          'data-item-id'
        ) as keyof typeof CART_ITEM_MAP

        button.addEventListener('click', (event) => {
          event.stopPropagation()
          event.preventDefault()
          this.removeItemFromCart(itemId)
        })
      }
    }
  }

  private renderCartItem(
    cartItem: CrowMarket.CartItem,
    elementToHook: HTMLElement
  ): void {
    const { name, id, quantity, price } = cartItem
    const imgSrc = 'images/' + name.replace(' ', '_').toLowerCase() + '.jpg'
    const quantityText = quantity === 1 ? '' : ` x ${quantity}`
    const htmlAsText = `
        <div>
            <img class="u-max-full-width" src=${imgSrc}>
            <h4>${name}</h4><h5>$${(price / 100).toFixed(2)}${quantityText}</h5>
            <button data-item-id=${id} class="button-primary">Remove Item from Cart</button>
        </div>
        `

    elementToHook.insertAdjacentHTML('afterbegin', htmlAsText)
  }

  /**
   *
   * Cart CRUD
   */
  private async addItemToCart(
    itemId: keyof typeof CART_ITEM_MAP
  ): Promise<void> {
    const newCartItems = [...this.currentCartState.items]
    let newTotal = this.currentCartState.total

    // Create an updated state using current cart state
    const itemToAdd = CART_ITEM_MAP[itemId]
    const itemIndexInCart = newCartItems.findIndex(
      (cartItem) => cartItem.id === itemId
    )

    if (itemIndexInCart !== -1) {
      //If item already exists in cart, all we do is update the quantity
      const currentItemInCart = newCartItems[itemIndexInCart]
      const currentQuantity = currentItemInCart.quantity

      newCartItems[itemIndexInCart] = {
        ...currentItemInCart,
        quantity: currentQuantity + 1
      }
    } else {
      // Add new item to cart
      newCartItems.push({ ...itemToAdd, id: itemId })
    }

    newTotal += itemToAdd.price

    // Upsert new state to reflect changes
    const newCartState = {
      items: newCartItems,
      total: newTotal
    }

    await this.state.upsertToState('cart', newCartState)

    this.currentCartState = newCartState
  }

  private async removeItemFromCart(
    itemId: keyof typeof CART_ITEM_MAP
  ): Promise<void> {
    //Find item to delete
    const cartItemToDelete = this.currentCartState.items.find(
      (item: CrowMarket.CartItem): boolean => item.id === itemId
    ) as CrowMarket.CartItem

    let newItemsState
    const newTotal = this.currentCartState.total - cartItemToDelete.price
    console.log('total', newTotal)

    //If only one of item, remove from state, otherwise update quantity
    if (cartItemToDelete.quantity === 1) {
      newItemsState = this.currentCartState.items.filter(
        (item: CrowMarket.CartItem): boolean => item.id !== itemId
      )
    } else {
      newItemsState = this.currentCartState.items.map((item) =>
        item.id === itemId
          ? { ...cartItemToDelete, quantity: cartItemToDelete.quantity - 1 }
          : item
      )
    }

    // Upsert new state to reflect changes
    const newCartState = {
      items: newItemsState,
      total: newTotal
    }

    await this.state.upsertToState('cart', newCartState)

    this.currentCartState = newCartState

    //Quick way of updating page, not ideal though
    document.location.reload()
  }
}

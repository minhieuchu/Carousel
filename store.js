let storeInstance;

export const initialState = {
  carouselItemWidth: 150,
  carouselFocusedItemWidth: 200,
  carouselSmallItemWidth: 115,
  carouselItemGap: 30,
  carouselItemFontSize: 24,
  carouselFocusedItemFontSize: 26,
  carouselSmallItemFontSize: 18,
  slideButtonSize: 15,
  slideButtonDistance: -50,
};

export const mediumState = {
  carouselItemWidth: 90,
  carouselFocusedItemWidth: 120,
  carouselSmallItemWidth: 60,
  carouselItemGap: 20,
  carouselItemFontSize: 16,
  carouselFocusedItemFontSize: 20,
  carouselSmallItemFontSize: 13,
  slideButtonSize: 15,
  slideButtonDistance: -50,
};

export const smallState = {
  carouselItemWidth: 60,
  carouselFocusedItemWidth: 90,
  carouselSmallItemWidth: 40,
  carouselItemGap: 15,
  carouselItemFontSize: 12,
  carouselFocusedItemFontSize: 15,
  carouselSmallItemFontSize: 9,
  slideButtonSize: 12,
  slideButtonDistance: -40,
};

class ObservableStore {
  constructor() {
    this._state = initialState;
    this.observers = [];
  }

  static getInstance() {
    if (!storeInstance) {
      storeInstance = new ObservableStore();
    }
    return storeInstance;
  }

  notifyObservers() {
    this.observers.forEach((observer) => {
      observer.next(this._state);
    });
  }
  registerObserver(observer) {
    this.observers.push(observer);
  }
  unregisterObserver(observer) {
    const unregisteredObserverIndex = this.observers.indexOf(observer);
    if (unregisteredObserverIndex < 0) {
      return;
    }
    this.observers.splice(unregisteredObserverIndex, 1);
  }

  set state(newState) {
    this._state = newState;
    this.notifyObservers();
  }
  get state() {
    return this._state;
  }
}

export default ObservableStore;

let storeInstance;

export const initialSizeState = {
  carouselItemWidth: 115,
  carouselMediumItemWidth: 150,
  carouselFocusedItemWidth: 200,
  carouselItemGap: 30,
  carouselItemFontSize: 18,
  carouselMediumItemFontSize: 24,
  carouselFocusedItemFontSize: 26,
  slideButtonSize: 15,
  slideButtonDistance: -50,
};

export const mediumSizeState = {
  carouselMediumItemWidth: 90,
  carouselFocusedItemWidth: 120,
  carouselItemWidth: 60,
  carouselItemGap: 20,
  carouselItemFontSize: 13,
  carouselMediumItemFontSize: 16,
  carouselFocusedItemFontSize: 20,
  slideButtonSize: 15,
  slideButtonDistance: -50,
};

export const smallSizeState = {
  carouselMediumItemWidth: 60,
  carouselFocusedItemWidth: 90,
  carouselItemWidth: 40,
  carouselItemGap: 15,
  carouselItemFontSize: 9,
  carouselMediumItemFontSize: 12,
  carouselFocusedItemFontSize: 15,
  slideButtonSize: 12,
  slideButtonDistance: -40,
};

class ObservableStore {
  constructor() {
    this._sizeState = initialSizeState;
    this.observers = [];
  }

  static getInstance() {
    if (!storeInstance) {
      storeInstance = new ObservableStore();
    }
    return storeInstance;
  }

  notifyObserversOnSizeChange() {
    this.observers.forEach((observer) => {
      observer.nextSizeState(this._sizeState);
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

  set sizeState(newState) {
    this._sizeState = newState;
    this.notifyObserversOnSizeChange();
  }
  get sizeState() {
    return this._sizeState;
  }
}

export default ObservableStore;

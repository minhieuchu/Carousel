import store, {
  initialSizeState,
  mediumSizeState,
  smallSizeState,
} from "./store.js";

const containerStyle = `
  <style>
    #carousel-container {
        position: relative;
        margin: 0 auto;
    }

    #carousel {
        display: flex;
        align-items: center;
        overflow-x: hidden;
        width: 100%;
        margin: 0 auto;
        padding-top: 50px;
        padding-bottom: 50px;
        scroll-behavior: smooth;
        scrollbar-width: none;
        cursor: pointer;
    }

    #carousel::-webkit-scrollbar {
        height: 0;
    }

    .arrow {
        border-top: 5px solid;
        border-right: 5px solid;
        border-color: cadetblue;
        border-top-right-radius: 5px;
    }

    .left-arrow {
        transform: translateY(-50%) rotate(-135deg);
    }

    .right-arrow {
        transform: translateY(-50%) rotate(45deg);
    }

    #prev-button,
    #next-button {
        position: absolute;
        top: 50%;
        cursor: pointer;
    }

    #prev-button {
        display: none;
    }
  </style>
`;

const containerTemplate = document.createElement("template");
containerTemplate.innerHTML =
  containerStyle +
  `
  <div id="carousel-container">
    <div id="prev-button" class="arrow left-arrow"></div>
    <div id="next-button" class="arrow right-arrow"></div>
    <div id="carousel">
      <slot></slot>
    </div>
  </div>`;
const slideTime = 100; // ms

class CarouselContainer extends HTMLElement {
  constructor() {
    super();
    const _self = this;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));
    this.prevClickTime = Date.now();
    this.prevButton = this.shadowRoot.getElementById("prev-button");
    this.nextButton = this.shadowRoot.getElementById("next-button");
    this.carousel = this.shadowRoot.getElementById("carousel");
    this.initialFocusedItemIndex = 2;
    this.numDisplayCarouselItems = 3;
    this.focusedItemIndexProxy = new Proxy(
      { value: this.initialFocusedItemIndex },
      {
        set(target, prop, newValue, _receiver) {
          if (prop != "value") {
            return false;
          }
          let transitionStep = 0;
          if (target.value < newValue) {
            transitionStep = 1;
          } else if (target.value > newValue) {
            transitionStep = -1;
          }
          let currentItemIdex = target.value;
          const transitionIntervalId = setInterval(() => {
            _self.updateFocusedItem(currentItemIdex, false);
            currentItemIdex += transitionStep;
            _self.updateFocusedItem(currentItemIdex);
            if (currentItemIdex == newValue) {
              clearInterval(transitionIntervalId);
            }
          }, 80);
          target.value = newValue;

          return true;
        },
      }
    );
    this.isDragging = false;
  }
  calculateCarouselSizeParameters() {
    const globalState = store.getInstance().sizeState;
    if (this.childElementCount > 5) {
      this.carouselWidth =
        4 * globalState.carouselItemGap +
        2 * globalState.carouselItemWidth +
        2 * globalState.carouselMediumItemWidth +
        globalState.carouselFocusedItemWidth;
    } else if (this.childElementCount > 2) {
      this.carouselWidth =
        2 * globalState.carouselItemGap +
        2 * globalState.carouselMediumItemWidth +
        globalState.carouselFocusedItemWidth;
    } else {
      this.carouselWidth =
        this.childElementCount *
        (globalState.carouselFocusedItemWidth + globalState.carouselItemGap);
    }
    this.slideDistance =
      globalState.carouselItemWidth + globalState.carouselItemGap;
  }
  connectedCallback() {
    window.onresize = () => {
      this.updateCarouselSize();
    };
    this.updateCarouselSize();

    if (this.childElementCount < 3) {
      this.nextButton.style.display = "none";
      // Use setTimeOut with timer value is 0 to execute the callback
      // after the code on main thread has finished.
      // Here, CSS for carousel items is only updated after the items have been mounted
      setTimeout(() => {
        for (let carouselItem of this.children) {
          carouselItem.shadowRoot
            .querySelector(".carousel-item")
            .classList.add("focused-item");
        }
      }, 0);
      return;
    }
    this.prevButton.onclick = () => {
      if (Date.now() - this.prevClickTime < 200) {
        return;
      }
      this.prevClickTime = Date.now();
      this.nextButton.style.display = "block";
      this.carousel.scrollBy(-this.slideDistance, 0);
      const timerId = setTimeout(() => {
        this.focusedItemIndexProxy.value -= 1;
        if (this.getScrollLeftValue() == 0) {
          this.prevButton.style.display = "none";
        }
        clearTimeout(timerId);
      }, slideTime);
    };
    this.nextButton.onclick = () => {
      if (Date.now() - this.prevClickTime < 200) {
        return;
      }
      this.prevClickTime = Date.now();
      this.prevButton.style.display = "block";
      this.carousel.scrollBy(this.slideDistance, 0);
      const timerId = setTimeout(() => {
        this.focusedItemIndexProxy.value += 1;
        if (
          this.getScrollLeftValue() + this.carouselWidth >=
          this.carousel.scrollWidth
        ) {
          this.nextButton.style.display = "none";
        }
        clearTimeout(timerId);
      }, slideTime);
    };

    if (this.childElementCount <= 5) {
      this.initialFocusedItemIndex = 2;
      this.numDisplayCarouselItems = 3;
      if (this.childElementCount == 3) {
        this.nextButton.style.display = "none";
      }
    }

    this.childListObserver = new MutationObserver(
      this.initFocusedCarouselItem.bind(this)
    );
    this.childListObserver.observe(this, { childList: true });

    setTimeout(() => {
      this.focusedItemIndexProxy.value = this.initialFocusedItemIndex;
    }, 0);

    // Scroll carousel by dragging
    this.carousel.onmousedown = (event) => {
      this.isDragging = true;
      this.cursorStartPositionX = event.clientX;
      this.carousel.style.scrollBehavior = "auto";
      store.getInstance().eventState = {
        onMouseDown: true,
      };
    };
    this.carousel.onmousemove = (event) => {
      if (!this.isDragging) {
        return;
      }
      const draggedDistance = -(event.clientX - this.cursorStartPositionX);
      this.carousel.scrollLeft += draggedDistance;
      this.cursorStartPositionX = event.clientX;
    };
    this.carousel.onmouseup = (event) => {
      this.isDragging = false;
      store.getInstance().eventState = {
        onMouseDown: false,
      };
      const draggedDistance = -(event.clientX - this.cursorStartPositionX);
      let numScrollableCarouselItemsLeft = Math.round(
        (this.carousel.scrollLeft + draggedDistance) / this.slideDistance
      );
      if (
        numScrollableCarouselItemsLeft >
        this.childElementCount - this.numDisplayCarouselItems
      ) {
        numScrollableCarouselItemsLeft =
          this.childElementCount - this.numDisplayCarouselItems;
      }
      if (numScrollableCarouselItemsLeft < 0) {
        numScrollableCarouselItemsLeft = 0;
      }

      const scrollableLeftDistance =
        numScrollableCarouselItemsLeft * this.slideDistance -
        this.carousel.scrollLeft;
      this.carousel.style.scrollBehavior = "smooth";
      this.carousel.scrollBy(scrollableLeftDistance, 0);
      setTimeout(() => {
        this.focusedItemIndexProxy.value =
          numScrollableCarouselItemsLeft + this.initialFocusedItemIndex;
        // Show / Hide slide buttons
        if (this.focusedItemIndexProxy.value <= this.initialFocusedItemIndex) {
          this.prevButton.style.display = "none";
        } else {
          this.prevButton.style.display = "block";
        }

        if (
          this.focusedItemIndexProxy.value +
            Math.floor(this.numDisplayCarouselItems / 2) >=
          this.childElementCount
        ) {
          this.nextButton.style.display = "none";
        } else {
          this.nextButton.style.display = "block";
        }
      }, slideTime);
    };
  }
  initFocusedCarouselItem() {
    if (this.childElementCount < this.numDisplayCarouselItems) {
      return;
    }
    this.focusedItemIndexProxy.value = this.initialFocusedItemIndex;
  }
  updateFocusedItem(itemIndex, makeFocused = true) {
    const focusedCarouselItemHtml = this.children
      .item(itemIndex - 1)
      .shadowRoot.querySelector(".carousel-item");
    const mediumCarouselItemLeftHtml = this.children
      .item(itemIndex - 2)
      .shadowRoot.querySelector(".carousel-item");
    const mediumCarouselItemRightHtml = this.children
      .item(itemIndex)
      .shadowRoot.querySelector(".carousel-item");

    if (makeFocused) {
      focusedCarouselItemHtml.classList.add("focused-item");
      mediumCarouselItemLeftHtml.classList.add("medium-item");
      mediumCarouselItemRightHtml.classList.add("medium-item");
    } else {
      focusedCarouselItemHtml.classList.remove("focused-item");
      mediumCarouselItemLeftHtml.classList.remove("medium-item");
      mediumCarouselItemRightHtml.classList.remove("medium-item");
    }
  }
  // Use this function instead of carousel.scrollLeft
  // because the scrollLeft value is not completely updated until the scroll action has finished.
  // At the moment, there is not a standard method to determine if the scroll has finished.
  // A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
  getScrollLeftValue() {
    return (
      (this.focusedItemIndexProxy.value - this.initialFocusedItemIndex) *
      this.slideDistance
    );
  }
  updateCssPropertyValues() {
    const constructedStyleSheet = new CSSStyleSheet();
    let styleSheetContent;
    if (this.childElementCount >= 3) {
      const globalState = store.getInstance().sizeState;
      styleSheetContent = `
      #carousel-container { width: ${this.carouselWidth}px }
      #carousel { gap: ${globalState.carouselItemGap}px }
      .arrow {
        width: ${globalState.slideButtonSize}px;
        height: ${globalState.slideButtonSize}px;
      }
      #prev-button {
        left: ${globalState.slideButtonDistance}px;
      }
      #next-button {
        right: ${globalState.slideButtonDistance}px;
      }
    `;
    } else {
      styleSheetContent = `
        #carousel-container { width: ${this.carouselWidth}px }
        #carousel { justify-content: space-around; }
      `;
    }
    constructedStyleSheet.replaceSync(styleSheetContent);
    this.shadowRoot.adoptedStyleSheets = [constructedStyleSheet];
  }
  scrollAfterResize() {
    const scrollDistance = this.getScrollLeftValue() - this.carousel.scrollLeft;
    this.carousel.scrollBy(scrollDistance, 0);
  }
  updateCarouselSize() {
    const containerWidth = this.parentElement.offsetWidth;
    const updateStateAndCss = (newState) => {
      store.getInstance().sizeState = newState;
      this.calculateCarouselSizeParameters();
      this.updateCssPropertyValues();
      this.scrollAfterResize();
    };
    if (containerWidth >= 960) {
      updateStateAndCss(initialSizeState);
    } else if (containerWidth >= 600) {
      updateStateAndCss(mediumSizeState);
    } else {
      updateStateAndCss(smallSizeState);
    }
  }
}

export default CarouselContainer;

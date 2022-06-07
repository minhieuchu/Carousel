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
    this.focusedItemIndexProxy = new Proxy(
      { value: 3 },
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
          }, slideTime);
          target.value = newValue;

          return true;
        },
      }
    );
    this.isDragging = false;
  }
  calculateCarouselSizeParameters() {
    const globalState = store.getInstance().sizeState;
    this.carouselWidth =
      4 * globalState.carouselItemGap +
      2 * globalState.carouselItemWidth +
      2 * globalState.carouselMediumItemWidth +
      globalState.carouselFocusedItemWidth;
    this.slideDistance =
      globalState.carouselItemWidth + globalState.carouselItemGap;
  }
  connectedCallback() {
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

    this.childListObserver = new MutationObserver(
      this.initFocusedCarouselItem.bind(this)
    );
    this.childListObserver.observe(this, { childList: true });
    setTimeout(() => {
      this.focusedItemIndexProxy.value = 3;
    }, 100);
    window.onresize = () => {
      this.updateCarouselSize();
    };
    this.updateCarouselSize();

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
      if (numScrollableCarouselItemsLeft > this.childElementCount - 5) {
        numScrollableCarouselItemsLeft = this.childElementCount - 5;
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
        this.focusedItemIndexProxy.value = numScrollableCarouselItemsLeft + 3;
        // Show / Hide slide buttons
        if (this.focusedItemIndexProxy.value <= 3) {
          this.prevButton.style.display = "none";
        } else {
          this.prevButton.style.display = "block";
        }

        if (this.focusedItemIndexProxy.value + 2 >= this.childElementCount) {
          this.nextButton.style.display = "none";
        } else {
          this.nextButton.style.display = "block";
        }
      }, slideTime);
    };
  }
  initFocusedCarouselItem() {
    if (this.childElementCount < this.focusedItemIndexProxy.value + 2) {
      return;
    }
    this.focusedItemIndexProxy.value = 3;
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
    const globalState = store.getInstance().sizeState;
    return (
      (this.focusedItemIndexProxy.value - 3) *
      (globalState.carouselItemWidth + globalState.carouselItemGap)
    );
  }
  updateCssPropertyValues() {
    const constructedStyleSheet = new CSSStyleSheet();
    const globalState = store.getInstance().sizeState;
    const styleSheetContent = `
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

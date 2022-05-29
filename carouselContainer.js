const carouselItemWidth = 150;
const carouselFocusedItemWidth = 200;
const carouselSmallItemWidth = 115;
const carouselItemGap = 30;
const carouselWidth =
  4 * carouselItemGap +
  2 * carouselItemWidth +
  2 * carouselSmallItemWidth +
  carouselFocusedItemWidth;
const slideDistance = carouselItemWidth + carouselItemGap;
const slideTime = 100; // ms

const containerStyle = `
  <style>
    #carousel-container {
        position: relative;
        width: 80%;
        margin: 0 auto;
    }

    #carousel {
        display: flex;
        align-items: center;
        gap: 30px;
        overflow-x: hidden;
        width: 850px;
        margin: 0 auto;
        padding-top: 50px;
        padding-bottom: 50px;
        scroll-behavior: smooth;
        scrollbar-width: none;
    }

    #carousel::-webkit-scrollbar {
        height: 0;
    }

    .hide {
        visibility: hidden;
    }

    .arrow {
        width: 15px;
        height: 15px;
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
        left: -30px;
        display: none;
    }

    #next-button {
        right: -30px;
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

class CarouselContainer extends HTMLElement {
  constructor() {
    super();
    const _self = this;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));
    this.prevClickTime = Date.now();
    this.prevButton = this.shadowRoot.getElementById("prev-button");
    this.nextButton = this.shadowRoot.getElementById("next-button");
    this.isSlideRight = true;
    this.carousel = this.shadowRoot.getElementById("carousel");
    this.focusedItemIndexProxy = new Proxy(
      { value: 3 },
      {
        set(target, prop, newValue, _receiver) {
          if (prop != "value") {
            return false;
          }
          _self.updateFocusedItem(target.value, false);
          target.value = newValue;
          _self.updateFocusedItem(newValue);
          return true;
        },
      }
    );
  }
  connectedCallback() {
    this.prevButton.onclick = () => {
      if (Date.now() - this.prevClickTime < 200) {
        return;
      }
      this.prevClickTime = Date.now();
      this.isSlideRight = false;
      this.nextButton.style.display = "block";
      this.carousel.scrollBy(-slideDistance, 0);
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
      this.isSlideRight = true;
      this.prevButton.style.display = "block";
      this.carousel.scrollBy(slideDistance, 0);
      const timerId = setTimeout(() => {
        this.focusedItemIndexProxy.value += 1;
        if (
          this.getScrollLeftValue() + carouselWidth >=
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
    const smallCarouselItemLeftHtml = this.children
      .item(itemIndex - 3)
      .shadowRoot.querySelector(".carousel-item");
    const smallCarouselItemRightHtml = this.children
      .item(itemIndex + 1)
      .shadowRoot.querySelector(".carousel-item");

    if (makeFocused) {
      focusedCarouselItemHtml.classList.add("focused-item");
      if (this.isSlideRight) {
        smallCarouselItemRightHtml.classList.remove("hide");
      } else {
        smallCarouselItemLeftHtml.classList.remove("hide");
      }
      smallCarouselItemLeftHtml.classList.add("small-item");
      smallCarouselItemRightHtml.classList.add("small-item");
    } else {
      focusedCarouselItemHtml.classList.remove("focused-item");
      if (this.isSlideRight) {
        smallCarouselItemLeftHtml.classList.add("hide");
      } else {
        smallCarouselItemRightHtml.classList.add("hide");
      }
      smallCarouselItemLeftHtml.classList.remove("small-item");
      smallCarouselItemRightHtml.classList.remove("small-item");
    }
  }
  // Use this function instead of carousel.scrollLeft
  // because the scrollLeft value is not completely updated until the scroll action has finished.
  // At the moment, there is not a standard method to determine if the scroll has finished.
  // A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
  getScrollLeftValue() {
    return (
      (this.focusedItemIndexProxy.value - 3) *
      (carouselItemWidth + carouselItemGap)
    );
  }
}

window.customElements.define("carousel-container", CarouselContainer);

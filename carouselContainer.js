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
let isSlideRight = true;
let prevClickTime = Date.now();

const carousel = document.getElementById("carousel");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

const focusedItemIndexProxy = new Proxy(
  { value: 3 },
  {
    set(target, prop, newValue, _receiver) {
      if (prop != "value") {
        return false;
      }
      updateFocusedItem(target.value, false);
      target.value = newValue;
      updateFocusedItem(newValue);
      return true;
    },
  }
);

// const updateFocusedItem = (itemIndex, makeFocused = true) => {
//   const getSelectorString = (index) =>
//     "#carousel > .carousel-item:nth-child(" + index + ")";
//   const focusedCarouselItem = document.querySelector(
//     getSelectorString(itemIndex)
//   );
//   const smallCarouselItemLeft = document.querySelector(
//     getSelectorString(itemIndex - 2)
//   );
//   const smallCarouselItemRight = document.querySelector(
//     getSelectorString(itemIndex + 2)
//   );
//   if (makeFocused) {
//     focusedCarouselItem.classList.add("focused-item");
//     if (isSlideRight) {
//       smallCarouselItemRight.classList.remove("hide");
//     } else {
//       smallCarouselItemLeft.classList.remove("hide");
//     }
//     smallCarouselItemLeft.classList.add("small-item");
//     smallCarouselItemRight.classList.add("small-item");
//   } else {
//     focusedCarouselItem.classList.remove("focused-item");
//     if (isSlideRight) {
//       smallCarouselItemLeft.classList.add("hide");
//     } else {
//       smallCarouselItemRight.classList.add("hide");
//     }
//     smallCarouselItemLeft.classList.remove("small-item");
//     smallCarouselItemRight.classList.remove("small-item");
//   }
// };
// updateFocusedItem(3);

// Use this function instead of carousel.scrollLeft
// because the scrollLeft value is not completely updated until the scroll action has finished.
// At the moment, there is not a standard method to determine if the scroll has finished.
// A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
// const getScrollLeftValue = () => {
//   return (
//     (focusedItemIndexProxy.value - 3) * (carouselItemWidth + carouselItemGap)
//   );
// };

const containerStyle = `
  <style>
    #carousel-container {
        position: relative;
    }

    #carousel {
        display: flex;
        align-items: center;
        gap: 30px;
        overflow-x: hidden;
        width: 870px;
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
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(containerTemplate.content.cloneNode(true));
    this.prevClickTime = Date.now();
    this.prevButton = this.shadowRoot.getElementById("prev-button");
    this.nextButton = this.shadowRoot.getElementById("next-button");
    this.isSlideRight = true;
    this.carousel = this.shadowRoot.getElementById("carousel");
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
      //   const timerId = setTimeout(() => {
      //     focusedItemIndexProxy.value -= 1;
      //     if (getScrollLeftValue() == 0) {
      //       prevButton.style.display = "none";
      //     }
      //     clearTimeout(timerId);
      //   }, slideTime);
    };

    this.nextButton.onclick = () => {
      if (Date.now() - this.prevClickTime < 200) {
        return;
      }
      this.prevClickTime = Date.now();
      this.isSlideRight = true;
      this.prevButton.style.display = "block";
      this.carousel.scrollBy(slideDistance, 0);
      // const timerId = setTimeout(() => {
      //   focusedItemIndexProxy.value += 1;
      //   if (getScrollLeftValue() + carouselWidth >= carousel.scrollWidth) {
      //     nextButton.style.display = "none";
      //   }
      //   clearTimeout(timerId);
      // }, slideTime);
    };
  }
}

window.customElements.define("carousel-container", CarouselContainer);

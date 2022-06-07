import store from "./store.js";

const itemStyle = `
<style>
    .carousel-item {
        perspective: 1000px;
        opacity: 0.6;
    }

    .focused-item {
        opacity: 1;
    }

    .medium-item {
        opacity: 0.85;
    }

    .carousel-item>.cards-container {
        width: 100%;
        height: 100%;
        position: relative;
        transition: transform 1s;
        transform-style: preserve-3d;
    }

    .carousel-item>.cards-container:hover {
        transform: translateY(-20px) rotateY(180deg);
    }

    .carousel-item>.cards-container>.front-card,
    .carousel-item>.cards-container>.back-card {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        backface-visibility: hidden;
    }

    .carousel-item>.cards-container>.front-card {
        background-color: cadetblue;
        color: whitesmoke;
    }

    .carousel-item>.cards-container>.back-card {
        transform: rotateY(180deg);
        background-color: #ffc107;
        color: whitesmoke;
    }
</style>
`;
const itemTemplate = document.createElement("template");
itemTemplate.innerHTML =
  itemStyle +
  `
  <div class="carousel-item">
    <div class="cards-container">
      <div class="front-card"></div>
      <div class="back-card"></div>
    </div>
  </div>`;

class CarouselItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(itemTemplate.content.cloneNode(true));
    store.getInstance().registerObserver(this);
  }
  connectedCallback() {
    const frontCardContent = this.attributes.front.value;
    const backCardContent = this.attributes.back.value;
    this.shadowRoot.querySelector(".front-card").innerHTML = frontCardContent;
    this.shadowRoot.querySelector(".back-card").innerHTML = backCardContent;
    this.nextSizeState(store.getInstance().state);
  }
  nextSizeState(storeState) {
    const constructedStyleSheet = new CSSStyleSheet();
    const carouselItemWidth = storeState.carouselItemWidth;
    const carouselFocusedItemWidth = storeState.carouselFocusedItemWidth;
    const carouselMediumItemWidth = storeState.carouselMediumItemWidth;
    const carouselItemFontSize = storeState.carouselItemFontSize;
    const carouselMediumItemFontSize = storeState.carouselMediumItemFontSize;
    const carouselFocusedItemFontSize = storeState.carouselFocusedItemFontSize;

    const styleSheetContent = `
      .carousel-item {
        width: ${carouselItemWidth}px;
        height: ${carouselItemWidth}px;
        min-width: ${carouselItemWidth}px;
      }
      .focused-item {
        width: ${carouselFocusedItemWidth}px;
        height: ${carouselFocusedItemWidth}px;
        min-width: ${carouselFocusedItemWidth}px;
      }
      .medium-item {
        width: ${carouselMediumItemWidth}px;
        height: ${carouselMediumItemWidth}px;
        min-width: ${carouselMediumItemWidth}px;
      }
      .carousel-item>.cards-container>.front-card,
      .carousel-item>.cards-container>.back-card {
        font-size: ${carouselItemFontSize}px;
      }
      .focused-item>.cards-container>div.front-card,
      .focused-item>.cards-container>div.back-card {
        font-size: ${carouselFocusedItemFontSize}px;
      }
      .medium-item>.cards-container>div.front-card,
      .medium-item>.cards-container>div.back-card {
        font-size: ${carouselMediumItemFontSize}px;
      }
    `;
    constructedStyleSheet.replaceSync(styleSheetContent);
    this.shadowRoot.adoptedStyleSheets = [constructedStyleSheet];
  }
}

export default CarouselItem;

const itemStyle = `
<style>
     .carousel-item {
        width: 150px;
        height: 150px;
        min-width: 150px;
        perspective: 1000px;
        opacity: 0.85;
    }

    .focused-item {
        height: 200px;
        min-width: 200px;
        opacity: 1;
    }

    .small-item {
        width: 115px;
        height: 115px;
        min-width: 115px;
        opacity: 0.6;
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
        font-size: 32px;
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

    .small-item>.cards-container>div.back-card {
        font-size: 24px;
    }

    .hide {
        visibility: hidden;
    }
</style>
`;
const itemTemplate = document.createElement("template");
itemTemplate.innerHTML =
  itemStyle +
  `
  <div class="carousel-item">
    <div class="cards-container">
      <div class="front-card">1</div>
      <div class="back-card">Back card</div>
    </div>
  </div>`;

class CarouselItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(itemTemplate.content.cloneNode(true));
  }
  connectedCallback() {
    const frontCardContent = this.attributes.front.value;
    const backCardContent = this.attributes.back.value;
    this.shadowRoot.querySelector(".front-card").innerHTML = frontCardContent;
    this.shadowRoot.querySelector(".back-card").innerHTML = backCardContent;
  }
}

export default CarouselItem;

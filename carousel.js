const carouselItemWidth = 150;
const carouselFocusedItemWidth = 200;
const carouselItemGap = 30;
const carouselWidth =
  4 * (carouselItemWidth + carouselItemGap) + carouselFocusedItemWidth;
const slideDistance = 5 * (carouselItemWidth + carouselItemGap);

const carousel = document.getElementById("carousel");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

let startItemIndex = 1,
  endItemIndex = 5;

const appendCarouselItemsHTML = (numOfItems) => {
  for (let i = 2; i <= numOfItems; i++) {
    carousel.innerHTML += '<div class="carousel-item">' + i + "</div>";
  }
};
appendCarouselItemsHTML(15);

const updateFocusedItem = (makeFocused = true) => {
  const selectorString =
    "#carousel > .carousel-item:nth-child(" + (startItemIndex + 2) + ")";
  const currentFocusedItem = document.querySelector(selectorString);
  if (makeFocused) {
    currentFocusedItem.classList.add("focused-item");
  } else {
    currentFocusedItem.classList.remove("focused-item");
  }
};

// Use this function instead of carousel.scrollLeft
// because the scrollLeft value is not completely updated until the scroll action has finished.
// At the moment, there is not a standard method to determine if the scroll has finished.
// A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
const getScrollLeftValue = () => {
  return (startItemIndex - 1) * (carouselItemWidth + carouselItemGap);
};

updateFocusedItem();

nextButton.onclick = () => {
  const availableSpaceRight =
    carousel.scrollWidth - carousel.scrollLeft - carouselWidth;
  const numOfScrollableItemsRight =
    availableSpaceRight / (carouselItemWidth + carouselItemGap);
  const numOfScrollItems =
    numOfScrollableItemsRight > 5 ? 5 : numOfScrollableItemsRight;
  updateFocusedItem(false);
  startItemIndex += numOfScrollItems;
  endItemIndex += numOfScrollItems;
  updateFocusedItem();

  carousel.scrollBy(slideDistance, 0);
  prevButton.style.display = "block";

  if (getScrollLeftValue() + carouselWidth >= carousel.scrollWidth) {
    nextButton.style.display = "none";
  }
};

prevButton.onclick = () => {
  const numOfScrollableItemsLeft =
    carousel.scrollLeft / (carouselItemWidth + carouselItemGap);
  const numOfScrollItems =
    numOfScrollableItemsLeft > 5 ? 5 : numOfScrollableItemsLeft;
  updateFocusedItem(false);
  startItemIndex -= numOfScrollItems;
  endItemIndex -= numOfScrollItems;
  updateFocusedItem();

  carousel.scrollBy(-slideDistance, 0);
  nextButton.style.display = "block";
  if (getScrollLeftValue() == 0) {
    prevButton.style.display = "none";
  }
};

const carouselItemWidth = 150;
const carouselFocusedItemWidth = 200;
const carouselItemGap = 30;
const carouselWidth =
  4 * (carouselItemWidth + carouselItemGap) + carouselFocusedItemWidth;
const slideDistance = 5 * (carouselItemWidth + carouselItemGap);

const carousel = document.getElementById("carousel");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

let startItemIndex = 1;

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

const appendCarouselItemsHTML = (numOfItems) => {
  for (let i = 2; i <= numOfItems; i++) {
    carousel.innerHTML += '<div class="carousel-item">' + i + "</div>";
  }
};
appendCarouselItemsHTML(15);

const updateFocusedItem = (itemIndex, makeFocused = true) => {
  const selectorString =
    "#carousel > .carousel-item:nth-child(" + itemIndex + ")";
  const currentFocusedItem = document.querySelector(selectorString);
  if (makeFocused) {
    currentFocusedItem.classList.add("focused-item");
  } else {
    currentFocusedItem.classList.remove("focused-item");
  }
};
updateFocusedItem(3);

// Use this function instead of carousel.scrollLeft
// because the scrollLeft value is not completely updated until the scroll action has finished.
// At the moment, there is not a standard method to determine if the scroll has finished.
// A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
const getScrollLeftValue = () => {
  return (startItemIndex - 1) * (carouselItemWidth + carouselItemGap);
};

nextButton.onclick = () => {
  const availableSpaceRight =
    carousel.scrollWidth - carousel.scrollLeft - carouselWidth;
  const numOfScrollableItemsRight =
    availableSpaceRight / (carouselItemWidth + carouselItemGap);
  const numOfScrollItems =
    numOfScrollableItemsRight > 5 ? 5 : numOfScrollableItemsRight;
  startItemIndex += numOfScrollItems;
  focusedItemIndexProxy.value = startItemIndex + 2;

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
  startItemIndex -= numOfScrollItems;
  focusedItemIndexProxy.value = startItemIndex + 2;

  carousel.scrollBy(-slideDistance, 0);
  nextButton.style.display = "block";
  if (getScrollLeftValue() == 0) {
    prevButton.style.display = "none";
  }
};

document.querySelectorAll(".carousel-item").forEach((carouselItem) => {
  carouselItem.addEventListener("mouseover", () => {
    const carouselItemIndex = Array.prototype.indexOf.call(
      carousel.children,
      carouselItem
    );
    focusedItemIndexProxy.value = carouselItemIndex + 1;
  });
});

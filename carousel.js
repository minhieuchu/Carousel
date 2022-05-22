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

const appendCarouselItemsHTML = (numOfItems) => {
  for (let i = 2; i <= numOfItems; i++) {
    carousel.innerHTML += '<div class="carousel-item">' + i + "</div>";
  }
};
appendCarouselItemsHTML(9);

const updateFocusedItem = (itemIndex, makeFocused = true) => {
  const getSelectorString = (index) =>
    "#carousel > .carousel-item:nth-child(" + index + ")";
  const focusedCarouselItem = document.querySelector(
    getSelectorString(itemIndex)
  );
  const smallCarouselItemLeft = document.querySelector(
    getSelectorString(itemIndex - 2)
  );
  const smallCarouselItemRight = document.querySelector(
    getSelectorString(itemIndex + 2)
  );
  if (makeFocused) {
    focusedCarouselItem.classList.add("focused-item");
    smallCarouselItemLeft.classList.add("small-item");
    smallCarouselItemRight.classList.add("small-item");
  } else {
    focusedCarouselItem.classList.remove("focused-item");
    smallCarouselItemLeft.classList.remove("small-item");
    smallCarouselItemRight.classList.remove("small-item");
  }
};
updateFocusedItem(3);

// Use this function instead of carousel.scrollLeft
// because the scrollLeft value is not completely updated until the scroll action has finished.
// At the moment, there is not a standard method to determine if the scroll has finished.
// A common workaround is to use a timer (~500ms) to wait for the completion of the scroll action.
const getScrollLeftValue = () => {
  return (
    (focusedItemIndexProxy.value - 3) * (carouselItemWidth + carouselItemGap)
  );
};

nextButton.onclick = () => {
  focusedItemIndexProxy.value += 1;
  carousel.scrollBy(slideDistance, 0);

  prevButton.style.display = "block";
  if (getScrollLeftValue() + carouselWidth >= carousel.scrollWidth) {
    nextButton.style.display = "none";
  }
};

prevButton.onclick = () => {
  focusedItemIndexProxy.value -= 1;
  carousel.scrollBy(-slideDistance, 0);

  nextButton.style.display = "block";
  if (getScrollLeftValue() == 0) {
    prevButton.style.display = "none";
  }
};

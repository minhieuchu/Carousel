# M-Carousel

A simple carousel created with custom HTML elements.

## Features

- 3D flip-card animation
- Scroll by dragging
- Auto-focus on center item


## Getting Started

Import the Javascript classes for carousel elements in the head tag of your HTML file as follows. The names of the custom elements are of your choice.

```html
<script type="module">
      import { CarouselContainer, CarouselItem } from "./index.js";
      window.customElements.define("carousel-container", CarouselContainer);
      window.customElements.define("carousel-item", CarouselItem);
</script>
```

In the body, use the above defined custom elements like below. The output looks best if there are more than 5 carousel items.

```html
<carousel-container>
      <carousel-item front="1" back="Back card"></carousel-item>
      <carousel-item front="2" back="Back card"></carousel-item>
      <carousel-item front="3" back="Back card"></carousel-item>
</carousel-container>
```

## Example Result


https://user-images.githubusercontent.com/25933120/173212344-24db82f1-4fd0-4dcc-895b-74bcb6a239ed.mov


## Browser Support

This package has been tested on Google Chrome and some other Chromium-based browsers (Brave, Microsoft Edge).

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.


## License

This project is licensed under the MIT License.

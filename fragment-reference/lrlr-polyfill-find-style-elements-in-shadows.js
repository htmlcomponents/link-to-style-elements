(function () {
  // Recursive function to find style tag with matching id and process link fragments
  function findStyleAndProcessLinkFragments(
    root,
    fragment,
    originalRoot = null
  ) {
    // If no originalRoot was provided (first call), use current root as original
    if (originalRoot === null) {
      originalRoot = root;
    }

    // First, try to find the style tag in the current root
    let style_tag = null;

    // If we're in the document, search using getElementById
    if (root === document) {
      style_tag = document.getElementById(fragment);
    } else {
      // Otherwise search using querySelector in the current shadow DOM
      style_tag = root.querySelector(`#${fragment}`);
    }

    // If we found a style tag with matching id, use it
    if (style_tag && style_tag.sheet) {
      return style_tag;
    }

    // If not found, recursively look through all shadow roots in the current root
    let found_style_tag = null;

    // Query for all elements in the current root
    const elements = root.querySelectorAll("*");
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      // Check if the element has a shadow root
      if (elem.shadowRoot) {
        // Look for the style tag in this shadow root
        found_style_tag = findStyleAndProcessLinkFragments(
          elem.shadowRoot,
          fragment,
          originalRoot
        );
        if (found_style_tag) {
          return found_style_tag;
        }
      }
    }

    // If we didn't find it anywhere, return null
    return null;
  } // Process a single link element
  function processLinkElement(link_tag) {
    if (
      link_tag.rel == "stylesheet" &&
      (!link_tag.sheet || link_tag.sheet.cssRules.length == 0)
    ) {
      // Extract the fragment from the link tag's href attribute.
      const url = new URL(link_tag.href);
      const fragment = url.hash.substring(1);

      if (fragment.length > 0) {
        // First try to find the style in the light DOM
        let style_tag = findStyleAndProcessLinkFragments(document, fragment);

        // If style tag was found, process it
        if (style_tag && style_tag.sheet) {
          let css_rule_string = "";
          for (let i = 0; i < style_tag.sheet.rules.length; ++i) {
            css_rule_string += style_tag.sheet.rules[i].cssText + "\n";
          }
          // Update the link tag with a dataURI with the style rules.
          link_tag.setAttribute(
            "href",
            "data:text/css;base64," + btoa(css_rule_string)
          );
        }
      }
    }
  }

  // Recursive function to process shadow DOM and all nested shadow DOMs
  function processLinkFragmentsInShadowDOM(root) {
    // Process links in current shadow
    root.querySelectorAll("link").forEach(processLinkElement);

    // Process all elements with shadow roots within this shadow
    root.querySelectorAll("*").forEach((elem) => {
      if (elem.shadowRoot) {
        processLinkFragmentsInShadowDOM(elem.shadowRoot);
      }
    });
  }

  // Process all link elements in the light DOM
  document.querySelectorAll("link").forEach(processLinkElement);

  // Process all top-level shadow roots
  document.querySelectorAll("*").forEach((elem) => {
    if (elem.shadowRoot) {
      processLinkFragmentsInShadowDOM(elem.shadowRoot);
    }
  });
})();

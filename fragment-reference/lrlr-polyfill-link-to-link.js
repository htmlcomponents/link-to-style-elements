(function () {
  // Recursive function to process shadow DOM and all nested shadow DOMs
  function processLinkFragmentsInShadowDOM(root) {
    // Process links in current shadow
    root.querySelectorAll("link").forEach((link_tag) => {
      if (
        link_tag.rel == "stylesheet" &&
        (!link_tag.sheet || link_tag.sheet.cssRules.length == 0)
      ) {
        // Extract the fragment from the link tag's href attribute.
        const url = new URL(link_tag.href);
        const fragment = url.hash.substring(1);
        if (fragment.length > 0) {
          // First check if it's a style tag
          let style_tag = document.getElementById(fragment);

          if (style_tag && style_tag.tagName === "STYLE" && style_tag.sheet) {
            // Handle style tag reference (original functionality)
            let css_rule_string = "";
            for (let i = 0; i < style_tag.sheet.rules.length; ++i) {
              css_rule_string += style_tag.sheet.rules[i].cssText + "\n";
            }
            // Update the link tag with a dataURI with the style rules.
            link_tag.setAttribute(
              "href",
              "data:text/css;base64," + btoa(css_rule_string)
            );
          } else {
            // Check if it's a link tag - this is the new functionality
            let source_link_tag = document.getElementById(fragment);
            if (
              source_link_tag &&
              source_link_tag.tagName === "LINK" &&
              source_link_tag.rel === "stylesheet"
            ) {
              // If the source link tag has a stylesheet, use it directly
              if (source_link_tag.sheet) {
                let css_rule_string = "";
                try {
                  for (
                    let i = 0;
                    i < source_link_tag.sheet.cssRules.length;
                    ++i
                  ) {
                    css_rule_string +=
                      source_link_tag.sheet.cssRules[i].cssText + "\n";
                  }
                  // Update the link tag with a dataURI with the style rules.
                  link_tag.setAttribute(
                    "href",
                    "data:text/css;base64," + btoa(css_rule_string)
                  );
                } catch (e) {
                  console.warn(
                    "CORS issues when trying to access rules from link element:",
                    e
                  );
                  // If we can't access rules due to CORS, just copy the original href
                  // (minus the fragment) as a fallback
                  const sourceUrl = new URL(source_link_tag.href);
                  sourceUrl.hash = ""; // Remove fragment
                  link_tag.setAttribute("href", sourceUrl.toString());
                }
              } else {
                // If the source link doesn't have a stylesheet yet, copy its href (minus the fragment)
                const sourceUrl = new URL(source_link_tag.href);
                sourceUrl.hash = ""; // Remove fragment
                link_tag.setAttribute("href", sourceUrl.toString());
              }
            }
          }
        }
      }
    });

    // Process all elements with shadow roots within this shadow
    root.querySelectorAll("*").forEach((elem) => {
      if (elem.shadowRoot) {
        processLinkFragmentsInShadowDOM(elem.shadowRoot);
      }
    });
  }

  // Process all top-level shadow roots
  document.querySelectorAll("*").forEach((elem) => {
    if (elem.shadowRoot) {
      processLinkFragmentsInShadowDOM(elem.shadowRoot);
    }
  });
})();
